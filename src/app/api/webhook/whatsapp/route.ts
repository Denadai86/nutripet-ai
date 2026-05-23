import { NextResponse } from "next/server";
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

// Credenciais de Produção da tua Evolution API
const EVOLUTION_API_URL = "https://evolution-api-production-54d0a.up.railway.app";
const EVOLUTION_API_KEY = "F7B68737-43D7-460F-BCEA-733A774A9AB0";

// Função para enviar mensagem de volta ao cliente via WhatsApp
async function enviarMensagemWhatsApp(instancia: string, numero: string, texto: string) {
  const numeroLimpo = numero.replace("@s.whatsapp.net", "");
  const endpoint = `${EVOLUTION_API_URL}/message/sendText/${instancia}`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify({ number: numeroLimpo, text: texto })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro no envio HTTP para WhatsApp (${response.status}):`, errorText);
    }
  } catch (err) {
    console.error("❌ Falha de rede ao comunicar com a Evolution API:", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Filtro: Apenas queremos mensagens recebidas
    if (body.event !== "messages.upsert") {
      return NextResponse.json({ status: "Ignorado - Evento não suportado" });
    }

    const mensagemData = body.data;
    const instancia = body.instance; 
    const remoteJid = mensagemData.key.remoteJid; 
    const isGroup = remoteJid.includes("@g.us");
    const isFromMe = mensagemData.key.fromMe;

    // Extrair o conteúdo de texto da mensagem
    const messageContent = mensagemData.message;
    const text = messageContent?.conversation || messageContent?.extendedTextMessage?.text;

    // Ignorar interações de grupos
    if (isGroup) {
      return NextResponse.json({ status: "Ignorado (Grupo)" });
    }

    // TRAVA DE SEGURANÇA PARA TESTE: Se for mensagem enviada por ti, só processa se começar por "TESTE"
    if (isFromMe && !text?.toUpperCase().startsWith("TESTE")) {
      return NextResponse.json({ status: "Ignorado (Minha própria mensagem)" });
    }

    if (!text) {
      return NextResponse.json({ status: "Sem texto para processar" });
    }
    
    // Limpar o prefixo de teste para a IA responder com naturalidade
    const mensagemParaIA = text.toUpperCase().replace("TESTE", "").trim() || "Olá";
    const clienteNum = remoteJid.split('@')[0];

    // --- 1. BUSCAR ESTOQUE ATUALIZADO NO FIREBASE ---
    const produtosRef = collection(db, "produtos");
    const produtosSnapshot = await getDocs(produtosRef);
    let catalogo = "";
    produtosSnapshot.forEach((docSnap) => {
      const p = docSnap.data();
      if (p.quantidade && p.quantidade > 0) {
        catalogo += `- ID: ${docSnap.id} | ${p.nome}: R$ ${p.preco}\n`;
      }
    });

    // --- 2. BUSCAR PETS DO CLIENTE NO FIREBASE ---
    const petsRef = collection(db, "pets");
    const qPets = query(petsRef, where("telefoneDono", "==", clienteNum));
    const petsSnapshot = await getDocs(qPets);
    let contextoPets = "";
    
    if (!petsSnapshot.empty) {
      contextoPets = "O cliente possui os seguintes pets registados no prontuário da nossa loja:\n";
      petsSnapshot.forEach((docSnap) => {
        const pet = docSnap.data();
        contextoPets += `- Nome: ${pet.nome} (${pet.especie}). Histórico clínico/Dieta: ${pet.observacoes}\n`;
      });
    } else {
      contextoPets = "O cliente ainda não tem nenhum pet registado no nosso prontuário de atendimento.";
    }

    // --- 3. CONSTRUÇÃO DO PROMPT DA IA (BLINDADO) ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Você é o assistente virtual carinhoso e especialista em atendimento da agropecuária NutriPet.
    
    ESTOQUE ATUAL DE PRODUTOS:
    ${catalogo || "Nenhum produto em estoque no momento."}
    
    DADOS DO CLIENTE E SEUS PETS:
    ${contextoPets}
    
    REGRAS DE COMUNICAÇÃO:
    1. Responda de forma curta, muito simpática, humanizada e natural (estilo WhatsApp).
    2. Se o cliente tiver pets cadastrados, cite o nome do pet dele de forma carinhosa (Ex: "A ração é para o [Nome do Pet]? Como está o nosso amiguinho?").
    3. Se houver restrições de saúde ou observações clínicas nas notas do pet, use essa informação para aconselhar o cliente de forma inteligente.
    4. Se o cliente fechar a compra de um produto do estoque, use a tag: [PEDIDO_FECHADO|NomeCliente|ID_Produto|Quantidade|Total]
    
    REGRA OBRIGATÓRIA DE BUSINESS INTELLIGENCE (ANALYTICS):
    Na última linha absoluta da sua resposta, inclua sempre uma etiqueta curta categorizando o assunto principal abordado (Ex: Ração, Vacinas, Banho, Consulta, Dúvida Geral).
    Formato exato: [TEMA|NomeDoTema]
    ATENÇÃO: Nunca use negrito (**) na palavra TEMA ou nos colchetes. Retorne texto limpo.
    
    Mensagem do cliente: "${mensagemParaIA}"`;

    const result = await model.generateContent(prompt);
    let respostaIA = result.response.text();

    // Sanatizar a resposta caso o Gemini insira negritos acidentais nas tags
    respostaIA = respostaIA.replace(/\*\*\[/g, "[").replace(/\]\*\*/g, "]");

    // --- 4. PARSE E EXTRAÇÃO DO TEMA ANALYTICS ---
    const regexTema = /\[TEMA\|([^\]]+)\]/i;
    const matchTema = respostaIA.match(regexTema);
    let temaIdentificado = "Atendimento Geral";
    
    if (matchTema) {
      temaIdentificado = matchTema[1].trim();
      respostaIA = respostaIA.replace(regexTema, "").trim(); // Remove a tag da mensagem final
    }

    let statusConversa = "Interagindo";

    // --- 5. DETECÇÃO E PROCESSAMENTO DE PEDIDO FECHADO ---
    const regexPedido = /\[PEDIDO_FECHADO\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/i;
    const matchPedido = respostaIA.match(regexPedido);

    if (matchPedido) {
      statusConversa = "Pedido Fechado";
      const idProduto = matchPedido[2].trim();
      const qtdComprada = parseInt(matchPedido[3].trim(), 10) || 1;
      const valorTotal = parseFloat(matchPedido[4].trim().replace(',', '.')) || 0;

      // Gravar o pedido na coleção
      await addDoc(collection(db, "pedidos"), {
        cliente: clienteNum,
        itens: `${qtdComprada}x (${idProduto})`,
        total: valorTotal,
        status: "Pendente (WhatsApp)",
        data: new Date()
      });

      // Atualização atómica de stock
      const produtoRef = doc(db, "produtos", idProduto);
      await updateDoc(produtoRef, {
        quantidade: increment(-qtdComprada)
      });

      respostaIA = respostaIA.replace(regexPedido, "").trim();
      respostaIA += "\n\n✅ *Pedido registado e enviado para separação!*";
    }

    // --- 6. ATUALIZAR A LINHA DO TEMPO NO PAINEL DE BI ---
    const conversaRef = doc(db, "conversas", clienteNum);
    await setDoc(conversaRef, {
      cliente: clienteNum,
      ultimaMensagem: mensagemParaIA,
      respostaBot: respostaIA,
      tema: temaIdentificado,
      status: statusConversa,
      updatedAt: new Date()
    }, { merge: true });

    // --- 7. ENVIAR VIA WHATSAPP ---
    await enviarMensagemWhatsApp(instancia, remoteJid, respostaIA);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erro fatal no processamento do Webhook:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}