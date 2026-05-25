import { NextResponse } from "next/server";
import { processarConversaNutriPet } from "@/lib/chatEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, phone, history } = body;

    // 1. Validação de entrada
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensagem inválida ou vazia" }, { status: 400 });
    }

    // 2. Limpeza do telefone (Fallback para o número de testes)
    const clienteNum = phone ? phone.replace(/\D/g, "") : "5514999999999";

    // 3. Formatação inteligente do histórico (Pega apenas as últimas 5 interações)
    let historicoFormatado = "";
    if (Array.isArray(history) && history.length > 0) {
      historicoFormatado = history
        .slice(-5) 
        .map((h) => `${h.role === 'user' ? 'Cliente' : 'IA'}: ${h.content}`)
        .join("\n");
    }

    // 4. Chamada ao Motor Enterprise (Agora usando Admin SDK por baixo dos panos)
    console.log(`🌐 [WEB CHAT] Processando mensagem de: +${clienteNum}`);
    const resultado = await processarConversaNutriPet(message, clienteNum, "WEB", historicoFormatado);

    // 5. Retorno limpo para o Frontend
    return NextResponse.json({ 
      text: resultado.respostaTexto,
      tema: resultado.tema,
      status: resultado.status
    });

  } catch (error: any) {
    console.error("❌ [WEB CHAT ERROR]:", error.message || error);
    return NextResponse.json(
      { error: "Estou a processar muitos pedidos! Tente novamente em 5 segundos." }, 
      { status: 500 }
    );
  }
}