import { NextResponse } from "next/server";
import { collection, doc, setDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    // ------------------------------------------------------------------
    // 1. POPULANDO PRODUTOS (Com cenários complexos de restrição)
    // ------------------------------------------------------------------
    const produtos = [
      { 
        id: "PROD_GOLDEN", nome: "Ração Golden Cães Adultos 15kg", preco: 149.90, quantidade: 10, tipo: "Ração", marca: "Golden", 
        restricoes: "", observacoes: "Ração premium" 
      },
      { 
        id: "PROD_RENAL", nome: "Ração Renal Gatos 2kg", preco: 119.90, quantidade: 5, tipo: "Ração", marca: "Royal Canin", 
        restricoes: "Apenas para gatos renais. Proibido para cães ou gatos saudáveis.", observacoes: "Venda estritamente clínica." 
      },
      { 
        id: "PROD_BRAVECTO", nome: "Antipulgas Bravecto Cães 10-20kg", preco: 250.00, quantidade: 8, tipo: "Medicamento", marca: "Bravecto", 
        restricoes: "Proibido para gatos. Apenas para cães que pesam entre 10kg e 20kg.", observacoes: "Dura 12 semanas" 
      },
      { 
        id: "PROD_PETISCO", nome: "Petisco Sabor Peixe e Salmão", preco: 15.00, quantidade: 20, tipo: "Petisco", marca: "Whiskas", 
        restricoes: "Contém peixe e frango. Não dar para pets com alergia a peixe ou frango.", observacoes: "Muito crocante." 
      },
      { 
        id: "PROD_SHAMPOO", nome: "Shampoo Hipoalergênico", preco: 45.00, quantidade: 12, tipo: "Higiene", marca: "Sanol", 
        restricoes: "", observacoes: "Serve para cães e gatos de qualquer idade." 
      },
    ];

    // Usamos setDoc para forçar o ID exato no Firebase e não duplicar se rodar 2 vezes
    for (const p of produtos) {
      await setDoc(doc(db, "produtos", p.id), p);
    }


    // ------------------------------------------------------------------
    // 2. POPULANDO CLIENTES (TUTORES)
    // ------------------------------------------------------------------
    const clientes = [
      { 
        id: "5514999999999", // <-- Este é o número que usamos no Chat Web!
        nome: "CLIENTE DEMO WEB", telefoneLimpo: "5514999999999", idade: "30", endereco: "Avenida Web, 100", 
        observacoes: "Usa muito o chat do site. Paga sempre no PIX.", updatedAt: new Date()
      },
      { 
        id: "5514988888888", // Cliente Fictício de WhatsApp
        nome: "DONA MARIA SILVA", telefoneLimpo: "5514988888888", idade: "55", endereco: "Rua das Rosas, 45", 
        observacoes: "Exigente, gosta de marcas premium e mimar o gato.", updatedAt: new Date()
      },
    ];

    for (const c of clientes) {
      await setDoc(doc(db, "clientes", c.id), c);
    }


    // ------------------------------------------------------------------
    // 3. POPULANDO PETS (Com os gatilhos clínicos)
    // ------------------------------------------------------------------
    const pets = [
      // Da Silva (Cliente Web)
      { 
        telefonesDonos: ["5514999999999"], nome: "LUNA", especie: "Gato", raca: "Persa", idade: "2 anos", peso: "4kg", cor: "Branca",
        observacoes: "MUITO IMPORTANTE: É severamente alérgica a peixe e frango.", createdAt: new Date() 
      },
      { 
        telefonesDonos: ["5514999999999"], nome: "THOR", especie: "Cachorro", raca: "Golden Retriever", idade: "3 anos", peso: "15kg", cor: "Caramelo",
        observacoes: "Cão super saudável, dentro do peso ideal (15kg). Sem restrições.", createdAt: new Date() 
      },
      // Da Dona Maria
      { 
        telefonesDonos: ["5514988888888"], nome: "GARFIELD", especie: "Gato", raca: "SRD", idade: "12 anos", peso: "6kg", cor: "Laranja",
        observacoes: "Gato idoso. Possui graves problemas renais, só pode comer ração renal.", createdAt: new Date() 
      },
    ];

    for (const pt of pets) {
      await addDoc(collection(db, "pets"), pt);
    }

    return NextResponse.json({ 
      success: true, 
      message: "🌱 Semente plantada! Produtos, Clientes e Pets foram injetados com sucesso!" 
    });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}