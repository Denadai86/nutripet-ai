import { GoogleGenerativeAI } from "@google/generative-ai";
import { collection, getDocs, addDoc, doc, updateDoc, increment, setDoc, query, where, getDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase"; 
// IMPORTAÇÃO DAS FUNÇÕES DO CALENDÁRIO
import { verificarDisponibilidade, criarAgendamento } from "./googleCalendar";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface EngineResponse {
  respostaTexto: string;
  tema: string;
  status: string;
}

export async function processarConversaNutriPet(text: string, clienteNum: string, canal: "WHATSAPP" | "WEB", historicoTexto: string = ""): Promise<EngineResponse> {
  
  // --- 1. ESTOQUE ---
  const produtosRef = collection(db, "produtos");
  const produtosSnapshot = await getDocs(produtosRef);
  let catalogo = "";
  produtosSnapshot.forEach((docSnap) => {
    const p = docSnap.data();
    if (p.quantidade && p.quantidade > 0) {
      catalogo += `- ID: ${docSnap.id} | ${p.nome} - R$ ${p.preco}\n`;
      if (p.restricoes) catalogo += `   ⚠️ RESTRIÇÕES: ${p.restricoes}\n`;
    }
  });

  // --- 2. DADOS DO CLIENTE (Tutor) ---
  const clienteSnap = await getDoc(doc(db, "clientes", clienteNum));
  let contextoCliente = "Cliente novo (sem dados no perfil).";
  if (clienteSnap.exists()) {
    const c = clienteSnap.data();
    contextoCliente = `Nome: ${c.nome || "Não informado"} | Idade: ${c.idade || ""} | Endereço: ${c.endereco || ""} \n🧠 INTELIGÊNCIA: ${c.observacoes || "Nenhuma"}`;
  }

  // --- 3. PETS DO CLIENTE ---
  const petsRef = collection(db, "pets");
  const qPets = query(petsRef, where("telefonesDonos", "array-contains", clienteNum));
  const petsSnapshot = await getDocs(qPets);
  let contextoPets = "";
  if (!petsSnapshot.empty) {
    contextoPets = "Pets cadastrados:\n";
    petsSnapshot.forEach((docSnap) => {
      const pet = docSnap.data();
      contextoPets += `- Nome: ${pet.nome} (${pet.especie}). 🧠 SAÚDE: ${pet.observacoes || "Nenhuma"}\n`;
    });
  } else {
    contextoPets = "O cliente ainda não tem pets cadastrados.";
  }

  const regrasDeCanal = canal === "WHATSAPP" 
    ? "Canal: WhatsApp. O telefone já é validado."
    : "Canal: Chat do Site. Exija o DDD e WhatsApp antes de cadastrar pet, agendar ou vender.";

  // A DATA DE HOJE É CRUCIAL PARA A IA ENTENDER "AMANHÃ" OU "PRÓXIMA TERÇA"
  const dataHoje = new Date().toISOString().split('T')[0];

  // --- 4. O SUPER PROMPT DA IA ---
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `Você é o assistente virtual da NutriPet.
  
  DATA DE HOJE (SISTEMA): ${dataHoje}
  MEMÓRIA RECENTE:
  ${historicoTexto || "Esta é a primeira mensagem."}
  
  ${regrasDeCanal}
  CATÁLOGO: \n${catalogo || "Vazio"}
  
  PERFIL DO TUTOR: \n${contextoCliente}
  PETS DO TUTOR: \n${contextoPets}
  
  REGRAS DE INTELIGÊNCIA E CRM:
  - ATUALIZAR TUTOR: [ATUALIZAR_TUTOR|Nome|Telefone|Idade|Endereco|ObservacoesAcumuladas]
  - ATUALIZAR PET: [ATUALIZAR_PET|NomeDoPet|NovasObservacoes]
  - CADASTRAR PET: [CADASTRAR_PET|Nome|Especie|Raca|Idade|Obs]
  - VENDAS: [PEDIDO_FECHADO|ID_Produto|Quantidade|Total]
  
  REGRAS DE AGENDAMENTO DE SERVIÇOS (BANHO, TOSA, CONSULTA):
  1. Se o cliente pedir para marcar um serviço, SEMPRE pergunte qual dia ele prefere.
  2. Quando o cliente disser o dia, use a tag: [VERIFICAR_AGENDA|YYYY-MM-DD] para consultar o calendário.
  3. Quando o cliente escolher um horário livre sugerido, MARQUE usando a tag: [MARCAR_AGENDA|NomeDoPet|Serviço|YYYY-MM-DDTHH:mm:00-03:00] (Ex: [MARCAR_AGENDA|Luna|Banho|2026-05-25T14:00:00-03:00]).
  
  TEMA OBRIGATÓRIO NA ÚLTIMA LINHA: [TEMA|NomeDoTema]
  
  Mensagem atual do cliente: "${text}"`;

  let respostaIA = "";
  try {
    const result = await model.generateContent(prompt);
    respostaIA = result.response.text();
  } catch (error: any) {
    return { respostaTexto: "Estou a processar muitos pedidos! 🐶 Aguarde uns segundos.", tema: "Erro", status: "Falha" };
  }

  respostaIA = respostaIA.replace(/\*\*\[/g, "[").replace(/\]\*\*/g, "]");

  const matchTema = respostaIA.match(/\[TEMA\|([^\]]+)\]/i);
  let temaIdentificado = "Atendimento Geral";
  if (matchTema) {
    temaIdentificado = matchTema[1].trim();
    respostaIA = respostaIA.replace(matchTema[0], "").trim();
  }

  let statusConversa = "Interagindo";

  // --- PARSE DA AGENDA: VERIFICAR HORÁRIOS ---
  const matchVerificar = respostaIA.match(/\[VERIFICAR_AGENDA\|([^\]]+)\]/i);
  if (matchVerificar) {
    statusConversa = "Consultando Agenda";
    const dataAlvo = matchVerificar[1].trim(); // Ex: 2026-05-25
    const disponibilidade = await verificarDisponibilidade(dataAlvo);
    
    respostaIA = respostaIA.replace(matchVerificar[0], "").trim();
    respostaIA += `\n\n🗓️ *Sistema da Agenda:* ${disponibilidade}\n*(Por favor, responda-me com o horário que prefere reservar!)*`;
  }

  // --- PARSE DA AGENDA: MARCAR EVENTO REAL ---
  const matchMarcar = respostaIA.match(/\[MARCAR_AGENDA\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/i);
  if (matchMarcar) {
    statusConversa = "Agendamento Confirmado";
    const pNome = matchMarcar[1].trim();
    const pServico = matchMarcar[2].trim();
    const pDataISO = matchMarcar[3].trim(); // Ex: 2026-05-25T14:00:00-03:00

    // Chama o Google Calendar real!
    const resultadoCalendario = await criarAgendamento(pNome, pServico, pDataISO);

    // Grava no nosso Firebase para o Dashboard ficar bonito
    await addDoc(collection(db, "agendamentos"), {
      cliente: clienteNum,
      pet: pNome,
      servico: pServico,
      dataAgendada: pDataISO,
      status: "Confirmado",
      createdAt: new Date()
    });

    respostaIA = respostaIA.replace(matchMarcar[0], "").trim();
    respostaIA += `\n\n${resultadoCalendario}`;
  }

  // Parses antigos (Tutor, Pet, Venda)...
  const matchTutor = respostaIA.match(/\[ATUALIZAR_TUTOR\|([^\|]*)\|([^\|]*)\|([^\|]*)\|([^\|]*)\|([^\]]*)\]/i);
  if (matchTutor) {
    let telTutor = matchTutor[2].trim().replace(/\D/g, "");
    if (!telTutor || telTutor.length < 10) telTutor = clienteNum;
    await setDoc(doc(db, "clientes", telTutor), { nome: matchTutor[1].trim().toUpperCase(), telefoneLimpo: telTutor, idade: matchTutor[3].trim(), endereco: matchTutor[4].trim(), observacoes: matchTutor[5].trim(), updatedAt: new Date() }, { merge: true });
    respostaIA = respostaIA.replace(matchTutor[0], "").trim();
  }

  const matchUpdatePet = respostaIA.match(/\[ATUALIZAR_PET\|([^\|]+)\|([^\]]+)\]/i);
  if (matchUpdatePet) {
    const qBuscaPet = query(collection(db, "pets"), where("telefonesDonos", "array-contains", clienteNum), where("nome", "==", matchUpdatePet[1].trim().toUpperCase()));
    const snapBuscaPet = await getDocs(qBuscaPet);
    if (!snapBuscaPet.empty) await updateDoc(doc(db, "pets", snapBuscaPet.docs[0].id), { observacoes: matchUpdatePet[2].trim() });
    respostaIA = respostaIA.replace(matchUpdatePet[0], "").trim();
  }

  const matchNovoPet = respostaIA.match(/\[CADASTRAR_PET\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/i);
  if (matchNovoPet) {
    await addDoc(collection(db, "pets"), { telefonesDonos: [clienteNum], nome: matchNovoPet[1].trim().toUpperCase(), especie: matchNovoPet[2].trim(), raca: matchNovoPet[3].trim(), idade: matchNovoPet[4].trim(), observacoes: matchNovoPet[5].trim(), createdAt: new Date() });
    respostaIA = respostaIA.replace(matchNovoPet[0], "").trim() + "\n\n✅ *Ficha clínica do pet criada!*";
  }

  const matchPedido = respostaIA.match(/\[PEDIDO_FECHADO\|([^\|]+)\|([^\|]+)\|([^\]]+)\]/i);
  if (matchPedido) {
    statusConversa = "Pedido Fechado";
    const qtdComprada = parseInt(matchPedido[2].trim(), 10) || 1;
    await addDoc(collection(db, "pedidos"), { cliente: clienteNum, itens: `${qtdComprada}x (${matchPedido[1].trim()})`, total: parseFloat(matchPedido[3].trim().replace(',', '.')), status: "Pendente", data: new Date() });
    await updateDoc(doc(db, "produtos", matchPedido[1].trim()), { quantidade: increment(-qtdComprada) }).catch(()=>console.log("Erro ao baixar estoque"));
    respostaIA = respostaIA.replace(matchPedido[0], "").trim() + "\n\n✅ *Pedido confirmado e enviado para o balcão!*";
  }

  await setDoc(doc(db, "conversas", clienteNum), { cliente: clienteNum, ultimaMensagem: text, respostaBot: respostaIA, tema: temaIdentificado, status: statusConversa, canal: canal, updatedAt: new Date() }, { merge: true });

  return { respostaTexto: respostaIA, tema: temaIdentificado, status: statusConversa };
}