import { NextResponse } from "next/server";
import { processarConversaNutriPet } from "@/lib/chatEngine";

const EVOLUTION_API_URL = "https://evolution-api-production-54d0a.up.railway.app";
const EVOLUTION_API_KEY = "F7B68737-43D7-460F-BCEA-733A774A9AB0";

async function enviarMensagemWhatsApp(instancia: string, numero: string, texto: string) {
  const numeroLimpo = numero.replace("@s.whatsapp.net", "");
  const endpoint = `${EVOLUTION_API_URL}/message/sendText/${instancia}`;
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY },
      body: JSON.stringify({ number: numeroLimpo, text: texto })
    });
  } catch (err) {
    console.error("Erro WhatsApp:", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.event !== "messages.upsert") return NextResponse.json({ status: "Ignorado" });

    const mensagemData = body.data;
    const instancia = body.instance; 
    const remoteJid = mensagemData.key.remoteJid; 
    const isGroup = remoteJid.includes("@g.us");
    const isFromMe = mensagemData.key.fromMe;

    const messageContent = mensagemData.message;
    const text = messageContent?.conversation || messageContent?.extendedTextMessage?.text;

    if (isGroup) return NextResponse.json({ status: "Ignorado (Grupo)" });
    if (isFromMe && !text?.toUpperCase().startsWith("TESTE")) return NextResponse.json({ status: "Ignorado" });
    if (!text) return NextResponse.json({ status: "Sem texto" });
    
    const mensagemParaIA = text.toUpperCase().replace("TESTE", "").trim() || "Olá";
    const clienteNum = remoteJid.split('@')[0];

    // CHAMA O MOTOR COMPARTILHADO
    const resultado = await processarConversaNutriPet(mensagemParaIA, clienteNum);

    // DEVOLVE VIA WHATSAPP
    await enviarMensagemWhatsApp(instancia, remoteJid, resultado.respostaTexto);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro Webhook WhatsApp:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}