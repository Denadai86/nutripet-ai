import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { collection, getDocs, addDoc, doc, updateDoc, increment, setDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const EVOLUTION_API_URL = "https://evolution-api-production-54d0a.up.railway.app";
const EVOLUTION_API_KEY = "F7B68737-43D7-460F-BCEA-733A774A9AB0";

async function enviarMensagemWhatsApp(instancia: string, numero: string, texto: string) {
  const numeroLimpo = numero.replace("@s.whatsapp.net", "");
  const endpoint = `${EVOLUTION_API_URL}/message/sendText/${instancia}`;
  
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify({ number: numeroLimpo, text: texto })
    });
  } catch (err) {
    console.error("Erro envio WhatsApp:", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.event !== "messages.upsert") {
      return NextResponse.json({ status: "Ignorado" });
    }

    const mensagemData = body.data;
    const instancia = body.instance; 
    const remoteJid = mensagemData.key.remoteJid; 
    const isGroup = remoteJid.includes("@g.us");
    const isFromMe = mensagemData.key.fromMe;

    const messageContent = mensagemData.message;
    const text = messageContent?.conversation || messageContent?.extendedTextMessage?.text;

    if (isGroup) return NextResponse.json({ status: "Ignorado (Grupo)" });
    if (isFromMe && !text?.toUpperCase().startsWith("TESTE")) {
      return NextResponse.json({ status: "Ignorado" });
    }

    if (!text) return NextResponse.json({ status: "Sem texto" });
    
    const mensagemParaIA = text.toUpperCase().replace("TESTE", "").trim() || "Olá";
    const clienteNum = remoteJid.split('@')[0];

    // --- 1. BUSCAR ESTOQUE ---
    const produtosRef = collection(db, "produtos");
    const produtosSnapshot = await getDocs(produtosRef);
    let catalogo = "";
    produtosSnapshot.forEach((doc) => {
      const p = doc.data();
      if (p.quantidade > 0) catalogo += `- ID: ${doc.id} | ${p.nome}: R$ ${p.preco}\n`;
    });

    // --- 2. PROMPT DA IA COM ANALYTICS MIGRADO ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Você é o atendente da NutriPet.
    Estoque:\n${catalogo}
    
    REGRAS DE RESPOSTA:
    - Seja natural e curto.
    - Se fechar venda, use a tag: [PEDIDO_FECHADO|Nome|ID_Produto|Qtd|Total]
    
    REGRA OBRIGATÓRIA DE BI/ANALYTICS:
    No final da resposta, adicione SEMPRE uma segunda tag escondida classificando o tema atual da conversa em uma única palavra ou expressão curta (Ex: Ração, Vacinas, Banho, Reclamação, Dúvida Geral).
    Formato: [TEMA|NomeDoTema]
    
    Mensagem do cliente: "${mensagemParaIA}"`;

    const result = await model.generateContent(prompt);
    let respostaIA = result.response.text();

    // --- 3. PARSE DA CLASSIFICAÇÃO DE TEMA ---
    const regexTema = /\[TEMA\|(.*?)\]/;
    const matchTema = respostaIA.match(regexTema);
    let temaIdentificado = "Atendimento Geral";
    if (matchTema) {
      temaIdentificado = matchTema[1].trim();
      respostaIA = respostaIA.replace(regexTema, "").trim(); // Remove da mensagem final
    }

    let statusConversa = "Interagindo";

    // --- 4. DETECÇÃO DE PEDIDO FECHADO ---
    const regexPedido = /\[PEDIDO_FECHADO\|(.*?)\|(.*?)\|(.*?)\|(.*?)\]/;
    const matchPedido = respostaIA.match(regexPedido);

    if (matchPedido) {
      statusConversa = "Pedido Fechado";
      const idProduto = matchPedido[2].trim();
      const qtdComprada = parseInt(matchPedido[3].trim()) || 1;
      const valorTotal = parseFloat(matchPedido[4].trim().replace(',', '.')) || 0;

      await addDoc(collection(db, "pedidos"), {
        cliente: clienteNum,
        itens: `${qtdComprada}x (${idProduto})`,
        total: valorTotal,
        status: "Pendente (WhatsApp)",
        data: new Date()
      });

      await updateDoc(doc(db, "produtos", idProduto), {
        quantidade: increment(-qtdComprada)
      });

      respostaIA = respostaIA.replace(regexPedido, "").trim();
      respostaIA += "\n\n✅ *Pedido registado!*";
    }

    // --- 5. SALVAR HISTÓRICO DA CONVERSA PARA O PAINEL ---
    const conversaRef = doc(db, "conversas", clienteNum);
    await setDoc(conversaRef, {
      cliente: clienteNum,
      ultimaMensagem: mensagemParaIA,
      respostaBot: respostaIA,
      tema: temaIdentificado,
      status: statusConversa,
      updatedAt: new Date()
    }, { merge: true });

    // --- 6. ENVIAR WHATSAPP ---
    await enviarMensagemWhatsApp(instancia, remoteJid, respostaIA);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro fatal Webhook:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}