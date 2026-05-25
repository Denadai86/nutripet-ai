import { NextResponse } from "next/server";
import { processarConversaNutriPet } from "@/lib/chatEngine";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL as string;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY as string;

// Função isolada e assíncrona para não prender o Webhook
async function enviarMensagemWhatsApp(instancia: string, numero: string, texto: string) {
  const numeroLimpo = numero.replace("@s.whatsapp.net", "");
  const endpoint = `${EVOLUTION_API_URL}/message/sendText/${instancia}`;
  
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'apikey': EVOLUTION_API_KEY 
      },
      body: JSON.stringify({ number: numeroLimpo, text: texto })
    });
    
    if (!res.ok) throw new Error(`Falha na Evolution API: ${res.statusText}`);
  } catch (err) {
    console.error("❌ [WHATSAPP SEND ERROR]:", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Filtro de Ouro: Só processa mensagens recebidas reais
    if (body.event !== "messages.upsert") {
      return NextResponse.json({ status: "Ignorado - Não é upsert" }, { status: 200 });
    }

    const mensagemData = body.data;
    const instancia = body.instance; 
    const remoteJid = mensagemData.key?.remoteJid; 
    
    // Prevenção de quebra se o payload vier malformado
    if (!remoteJid) return NextResponse.json({ status: "JID Ausente" }, { status: 200 });

    const isGroup = remoteJid.includes("@g.us");
    const isFromMe = mensagemData.key?.fromMe;

    const messageContent = mensagemData.message;
    const text = messageContent?.conversation || messageContent?.extendedTextMessage?.text;

    // Filtros de Ignorar (Grupos, mensagens próprias sem a palavra TESTE, sem texto)
    if (isGroup) return NextResponse.json({ status: "Ignorado (Grupo)" }, { status: 200 });
    if (isFromMe && !text?.toUpperCase().startsWith("TESTE")) return NextResponse.json({ status: "Ignorado (FromMe)" }, { status: 200 });
    if (!text) return NextResponse.json({ status: "Sem texto / Mídia ignorada" }, { status: 200 });
    
    const mensagemParaIA = text.toUpperCase().replace("TESTE", "").trim() || "Olá";
    const clienteNum = remoteJid.split('@')[0];

    console.log(`📱 [WHATSAPP] Nova mensagem de: +${clienteNum}`);

    // CHAMA O MOTOR VIP
    const resultado = await processarConversaNutriPet(mensagemParaIA, clienteNum, "WHATSAPP");

    // DEVOLVE A RESPOSTA (Não usamos await aqui para liberar o Webhook do WhatsApp rápido!)
    enviarMensagemWhatsApp(instancia, remoteJid, resultado.respostaTexto);

    return NextResponse.json({ success: true, message: "Processado com sucesso" });
    
  } catch (error: any) {
    console.error("❌ [WEBHOOK FATAL ERROR]:", error.message || error);
    return NextResponse.json({ error: "Erro interno no processamento" }, { status: 500 });
  }
}