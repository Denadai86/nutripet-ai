import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { collection, getDocs, addDoc, doc, updateDoc, increment } from "firebase/firestore"; 
import { db } from "@/lib/firebase"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Credenciais da tua Evolution API (Coloca no .env da Vercel)
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "https://teu-app.railway.app";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "joao-nutripet-senha-super-segura-123";

// Função utilitária para enviar mensagem de volta via Evolution API
async function enviarMensagemWhatsApp(instancia: string, numero: string, texto: string) {
  const endpoint = `${EVOLUTION_API_URL}/message/sendText/${instancia}`;
  
  await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': EVOLUTION_API_KEY
    },
    body: JSON.stringify({
      number: numero,
      text: texto
    })
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // A Evolution API envia eventos de vários tipos. Queremos apenas novas mensagens.
    if (body.event !== "messages.upsert") {
      return NextResponse.json({ status: "Ignorado - Evento não suportado" });
    }

    const mensagemData = body.data;
    const instancia = body.instance; // Nome da instância conectada (ex: "NutriPetBot")
    const remoteJid = mensagemData.key.remoteJid; // Número do cliente (ex: 5511999999999@s.whatsapp.net)
    const isGroup = remoteJid.includes("@g.us");
    const isFromMe = mensagemData.key.fromMe;

    // Ignora mensagens de grupos ou mensagens enviadas pelo próprio bot/loja
    if (isGroup || isFromMe) {
      return NextResponse.json({ status: "Ignorado" });
    }

    // Extrair o texto (o formato varia ligeiramente dependendo se é texto puro ou resposta a algo)
    const messageContent = mensagemData.message;
    const text = messageContent?.conversation || messageContent?.extendedTextMessage?.text;

    if (!text) {
      return NextResponse.json({ status: "Sem texto para processar" });
    }

    // --- 1. BUSCAR ESTOQUE NO FIREBASE (Reaproveitado da tua lógica) ---
    const produtosRef = collection(db, "produtos");
    const produtosSnapshot = await getDocs(produtosRef);
    let catalogo = "Catálogo de Produtos em Estoque:\n";
    
    produtosSnapshot.forEach((doc) => {
      const p = doc.data();
      if (p.quantidade && p.quantidade > 0) {
        catalogo += `- ID: ${doc.id} | ${p.nome}: R$ ${p.preco} (${p.quantidade} unid.)\n`;
      }
    });

    // --- 2. CHAMAR O GEMINI ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Você é o assistente virtual de vendas pelo WhatsApp da agropecuária NutriPet.
    
    ESTOQUE ATUAL:
    ${catalogo}
    
    REGRAS:
    1. Responda de forma curta, natural, como se estivesse no WhatsApp. Use emojis com moderação.
    2. Nunca venda mais do que o estoque disponível.
    3. Para fechar venda, use a tag secreta no final: [PEDIDO_FECHADO|NomeOuNumero|ID_Produto|Quantidade|ValorTotal]
    
    Mensagem do cliente: "${text}"`;

    const result = await model.generateContent(prompt);
    let respostaIA = result.response.text();

    // --- 3. PROCESSAR PEDIDO E BAIXA DE ESTOQUE ---
    const regexPedido = /\[PEDIDO_FECHADO\|(.*?)\|(.*?)\|(.*?)\|(.*?)\]/;
    const match = respostaIA.match(regexPedido);

    if (match) {
      const clienteNum = remoteJid.split('@')[0]; // Extrai só os números
      const idProduto = match[2].trim();
      const qtdComprada = parseInt(match[3].trim()) || 1;
      const valorTotal = parseFloat(match[4].trim().replace(',', '.')) || 0;

      // Grava Pedido
      await addDoc(collection(db, "pedidos"), {
        cliente: clienteNum,
        itens: `${qtdComprada}x (${idProduto})`,
        total: valorTotal,
        status: "Pendente (WhatsApp)",
        data: new Date()
      });

      // Baixa no Estoque
      const produtoRef = doc(db, "produtos", idProduto);
      await updateDoc(produtoRef, {
        quantidade: increment(-qtdComprada)
      });

      // Limpa a tag da mensagem
      respostaIA = respostaIA.replace(regexPedido, "").trim();
      respostaIA += "\n\n✅ *Pedido registado!* Pode fazer a recolha na loja ou combinar a entrega.";
    }

    // --- 4. ENVIAR RESPOSTA PARA O CLIENTE VIA WHATSAPP ---
    await enviarMensagemWhatsApp(instancia, remoteJid, respostaIA);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no Webhook:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}