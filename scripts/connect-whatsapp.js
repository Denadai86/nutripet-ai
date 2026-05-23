// scripts/connect-whatsapp.js
const qrcode = require('qrcode-terminal');
const axios = require('axios');


// ⚠️ SUBSTITUA PELAS SUAS CREDENCIAIS DO RAILWAY
const API_URL = "https://evolution-api-production-54d0a.up.railway.app" //|| "evolution-api-production-54d0a.up.railway.app"; 
const API_KEY = "144443d3b1f161b9a6a8e9f035ef4bdd657494f91290b45219f7f383fac425a1";
const INSTANCE_NAME = "NutriPetBot";
async function iniciarConexao() {
  console.log("🚀 A iniciar a criação da instância na Evolution API...");

  try {
    // 1. Criar a instância usando Axios POST
    const createRes = await axios.post(`${API_URL}/instance/create`, {
      instanceName: INSTANCE_NAME,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS"
    }, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
      },
      // Impede que o Axios gere um erro fatal se a instância já existir (status 400+)
      validateStatus: () => true 
    });

    const createData = createRes.data;

    if (createRes.status === 200 || createRes.status === 201) {
      console.log("✅ Instância criada com sucesso!");
    } else if (createData.response && JSON.stringify(createData.response).includes("already exists")) {
      console.log("⚠️ A instância já existe. A tentar conectar...");
    } else {
      console.error("❌ Erro ao criar instância:", createData);
      return;
    }

    // 2. Obter o QR Code de Conexão usando Axios GET
    console.log("⏳ A solicitar o QR Code...");
    const connectRes = await axios.get(`${API_URL}/instance/connect/${INSTANCE_NAME}`, {
      headers: {
        'apikey': API_KEY
      },
      validateStatus: () => true
    });

    const connectData = connectRes.data;

    // A API pode retornar a string em 'code' ou 'base64' dependendo da subversão
    const qrCodeString = connectData.code || connectData.base64;

    if (qrCodeString) {
      console.log("\n📱 Por favor, leia o QR Code abaixo com o WhatsApp da Loja:\n");
      qrcode.generate(qrCodeString, { small: true });
      console.log("\n⏳ A aguardar a leitura pelo celular...");
    } else if (connectData.instance?.state === "open") {
      console.log("✅ O WhatsApp já está conectado a esta instância!");
    } else {
      console.error("❌ Não foi possível obter o QR Code:", connectData);
    }

  } catch (error) {
    console.error("❌ Falha crítica de rede (verifique se a URL do Railway está certa):", error.message);
  }
}

iniciarConexao();