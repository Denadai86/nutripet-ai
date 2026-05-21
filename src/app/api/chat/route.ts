import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
// IMPORTAMOS O doc, updateDoc E O increment PARA DAR BAIXA NO ESTOQUE
import { collection, getDocs, addDoc, doc, updateDoc, increment } from "firebase/firestore"; 
import { db } from "@/lib/firebase"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    // --- 1. BUSCAR PRODUTOS E QUANTIDADES NO FIREBASE ---
    const produtosRef = collection(db, "produtos");
    const produtosSnapshot = await getDocs(produtosRef);
    
    let catalogo = "Catálogo de Produtos em Estoque:\n";
    produtosSnapshot.forEach((doc) => {
      const p = doc.data();
      // Só mostra no catálogo se a quantidade for maior que zero
      if (p.quantidade && p.quantidade > 0) {
        // Passamos o ID do documento para a IA saber quem é quem
        catalogo += `- ID: ${doc.id} | ${p.nome}: R$ ${p.preco} (${p.quantidade} unidades disponíveis)\n`;
      }
    });

    // --- 2. CONFIGURAR A INTELIGÊNCIA DO GEMINI ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Você é o assistente virtual de vendas da agropecuária NutriPet.
    
    ESTE É O SEU ESTOQUE ATUAL (Com quantidades reais):
    ${catalogo}
    
    REGRAS OBRIGATÓRIAS DE COMPORTAMENTO:
    0. O INICIO DO ATENDIMENTO JÁ TEM A SAUDAÇÃO PRONTA. NUNCA inicie com saudações. Vá direto ao ponto.
    1. Fale como um atendente de balcão. Seja direto, amigável e sem formatação de lista com asteriscos.
    2. Nunca venda uma quantidade MAIOR do que a disponível no estoque. Se o cliente pedir 3 e só tiver 2, avise-o.
    3. NUNCA ofereça descontos ou promoções.
    4. FECHAMENTO DE VENDA COM BAIXA DE ESTOQUE (MUITO IMPORTANTE):
       Se o cliente confirmar a compra, adicione a tag secreta no FINAL da resposta exatamente neste formato, capturando o ID do produto e a quantidade que ele escolheu:
       [PEDIDO_FECHADO|Nome do Cliente|ID_Do_Produto|Quantidade_Comprada|Valor_Total]
       
       Exemplo se comprarem 2 rações: [PEDIDO_FECHADO|Cliente WhatsApp|id_da_racao_aqui|2|299.80]
    
    Mensagem do cliente: "${message}"`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // --- 3. INTERCEPTAR A NOVA TAG, SALVAR PEDIDO E DAR BAIXA NO ESTOQUE ---
    const regexPedido = /\[PEDIDO_FECHADO\|(.*?)\|(.*?)\|(.*?)\|(.*?)\]/;
    const match = text.match(regexPedido);

    if (match) {
      const clienteNome = match[1].trim();
      const idProduto = match[2].trim();
      const qtdComprada = parseInt(match[3].trim()) || 1;
      const valorTotal = parseFloat(match[4].trim().replace(',', '.')) || 0;

      // Ação A: Cria o registro do pedido no painel do dono
      await addDoc(collection(db, "pedidos"), {
        cliente: clienteNome,
        itens: `${qtdComprada}x Produto (${idProduto})`,
        total: valorTotal,
        status: "Pendente (Pix)",
        data: new Date()
      });

      // Ação B: A MAGIA DA BAIXA AUTOMÁTICA
      // Usamos o increment(-qtdComprada) para subtrair a quantidade exata do banco do Google
      const produtoRef = doc(db, "produtos", idProduto);
      await updateDoc(produtoRef, {
        quantidade: increment(-qtdComprada)
      });

      // Limpa a tag do chat para o cliente não ver código
      text = text.replace(regexPedido, "").trim();
      text += "\n\nPedido anotado e enviado pro balcão! Chave Pix: (14) 99999-9999.";
    }

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Erro na API do Gemini/Firebase:", error);
    return NextResponse.json({ error: "Falha ao processar a mensagem." }, { status: 500 });
  }
}