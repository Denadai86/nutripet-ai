import { NextResponse } from "next/server";
import { processarConversaNutriPet } from "@/lib/chatEngine";

export async function POST(req: Request) {
  try {
    const { message, phone } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    // Identificador do cliente na web. Se não passar um telefone no chat, 
    // usamos um número fixo de "Cliente Web" para fins de simulação e portfólio.
    const clienteNum = phone ? phone.replace(/\D/g, "") : "5514999999999";

    // CHAMA O MESMO MOTOR COMPARTILHADO!
    const resultado = await processarConversaNutriPet(message, clienteNum);

    // Retorna para o componente de chat da página web renderizar no ecrã
    return NextResponse.json({ 
      text: resultado.respostaTexto,
      tema: resultado.tema,
      status: resultado.status
    });

  } catch (error) {
    console.error("Erro na API de Chat Web:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}