import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  increment, 
  setDoc, 
  query, 
  where 
} from "firebase/firestore"; 
import { db } from "@/lib/firebase"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface EngineResponse {
  respostaTexto: string;
  tema: string;
  status: string;
}

export async function processarConversaNutriPet(text: string, clienteNum: string): Promise<EngineResponse> {
  // --- 1. BUSCAR ESTOQUE ENRIQUECIDO ---
  const produtosRef = collection(db, "produtos");
  const produtosSnapshot = await getDocs(produtosRef);
  let catalogo = "";
  
  produtosSnapshot.forEach((docSnap) => {
    const p = docSnap.data();
    if (p.quantidade && p.quantidade > 0) {
      catalogo += `- ID: ${docSnap.id} | ${p.nome} `;
      if (p.marca) catalogo += `(Marca: ${p.marca}) `;
      if (p.pesoVolume) catalogo += `[${p.pesoVolume}] `;
      catalogo += `- R$ ${p.preco}\n`;
      if (p.restricoes) catalogo += `   ⚠️ RESTRIÇÕES: ${p.restricoes}\n`;
      if (p.observacoes) catalogo += `   📝 Detalhes: ${p.observacoes}\n`;
    }
  });

  // --- 2. BUSCAR PETS ENRIQUECIDOS DO CLIENTE ---
  const petsRef = collection(db, "pets");
  const qPets = query(petsRef, where("telefoneDono", "==", clienteNum));
  const petsSnapshot = await getDocs(qPets);
  let contextoPets = "";
  
  if (!petsSnapshot.empty) {
    contextoPets = "O cliente possui os seguintes pets no prontuário:\n";
    petsSnapshot.forEach((docSnap) => {
      const pet = docSnap.data();
      contextoPets += `- Nome: ${pet.nome} (${pet.especie} | Raça: ${pet.raca || "N/A"})\n`;
      contextoPets += `  Idade: ${pet.idade || "N/A"} | Peso: ${pet.peso || "N/A"}\n`;
      contextoPets += `  ⚠️ HISTÓRICO/SAÚDE: ${pet.observacoes || "Sem observações"}\n`;
    });
  } else {
    contextoPets = "O cliente ainda não tem pets cadastrados no prontuário.";
  }

  // --- 3. CONSTRUÇÃO DO PROMPT DO GEMINI ---
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `Você é o assistente virtual e consultor especialista da agropecuária NutriPet.
  
  CATÁLOGO DE PRODUTOS:
  ${catalogo || "Nenhum produto em estoque no momento."}
  
  DADOS DO CLIENTE E PACIENTES (PETS):
  ${contextoPets}
  
  REGRAS DE OURO (MÉDICAS E VENDAS):
  1. Responda de forma curta, natural e muito simpática.
  2. CRUZE OS DADOS: Compare RIGOROSAMENTE as RESTRIÇÕES dos produtos com o HISTÓRICO DE SAÚDE do pet. 
  3. NUNCA venda um produto se ele for proibido ou fizer mal para a restrição ou espécie do pet do cliente. Avise o cliente sobre o risco de forma clara e sugira alternativas seguras se houver.
  4. Se o cliente fechar a compra de um produto liberado, use a tag: [PEDIDO_FECHADO|NomeCliente|ID_Produto|Quantidade|Total]
  
  REGRA OBRIGATÓRIA DE BUSINESS INTELLIGENCE (ANALYTICS):
  Na última linha absoluta da sua resposta, inclua sempre uma tag categorizando o assunto principal abordado (Ex: Ração, Vacinas, Banho, Consulta, Dúvida Geral).
  Formato exato: [TEMA|NomeDoTema]
  ATENÇÃO: Nunca use negrito (**) na palavra TEMA ou nos colchetes. Retorne texto puro.
  
  Mensagem do cliente: "${text}"`;

  let respostaIA = "";
  
  // --- 4. CHAMADA PROTEGIDA (O Escudo Anti-Crash) ---
  try {
    const result = await model.generateContent(prompt);
    respostaIA = result.response.text();
  } catch (error: any) {
    console.error("❌ Erro na API do Gemini:", error);
    
    // Se o erro for de Quota/Limite de Requisições
    if (error?.status === 429 || error?.message?.includes("429")) {
      return {
        respostaTexto: "Estou atendendo muitos aumigos ao mesmo tempo agora! 🐶 Por favor, aguarde uns minutinhos e mande a mensagem novamente.",
        tema: "Atendimento Geral",
        status: "Aguardando IA"
      };
    }
    
    // Se for outro erro genérico
    return {
      respostaTexto: "Ops, tive um pequeno soluço no meu sistema de IA. Pode repetir a pergunta?",
      tema: "Erro",
      status: "Falha"
    };
  }

  // Se passou sem erro, continua o processamento normal...
  respostaIA = respostaIA.replace(/\*\*\[/g, "[").replace(/\]\*\*/g, "]");

  // --- 5. PARSE DA CLASSIFICAÇÃO DE TEMA ---
  const regexTema = /\[TEMA\|([^\]]+)\]/i;
  const matchTema = respostaIA.match(regexTema);
  let temaIdentificado = "Atendimento Geral";
  
  if (matchTema) {
    temaIdentificado = matchTema[1].trim();
    respostaIA = respostaIA.replace(regexTema, "").trim(); 
  }

  let statusConversa = "Interagindo";

  // --- 6. DETECÇÃO DE PEDIDO FECHADO ---
  const regexPedido = /\[PEDIDO_FECHADO\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/i;
  const matchPedido = respostaIA.match(regexPedido);

  if (matchPedido) {
    statusConversa = "Pedido Fechado";
    const idProduto = matchPedido[2].trim();
    const qtdComprada = parseInt(matchPedido[3].trim(), 10) || 1;
    const valorTotal = parseFloat(matchPedido[4].trim().replace(',', '.')) || 0;

    await addDoc(collection(db, "pedidos"), {
      cliente: clienteNum,
      itens: `${qtdComprada}x (${idProduto})`,
      total: valorTotal,
      status: "Pendente",
      data: new Date()
    });

    const produtoRef = doc(db, "produtos", idProduto);
    await updateDoc(produtoRef, {
      quantidade: increment(-qtdComprada)
    });

    respostaIA = respostaIA.replace(regexPedido, "").trim();
    respostaIA += "\n\n✅ *Pedido registrado e enviado para separação!*";
  }

  // --- 7. ATUALIZAR LINHA DO TEMPO DO BI ---
  const conversaRef = doc(db, "conversas", clienteNum);
  await setDoc(conversaRef, {
    cliente: clienteNum,
    ultimaMensagem: text,
    respostaBot: respostaIA,
    tema: temaIdentificado,
    status: statusConversa,
    updatedAt: new Date()
  }, { merge: true });

  return {
    respostaTexto: respostaIA,
    tema: temaIdentificado,
    status: statusConversa
  };
}