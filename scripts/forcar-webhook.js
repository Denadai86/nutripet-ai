const axios = require('axios');

const API_URL = "https://evolution-api-production-54d0a.up.railway.app"; 
const API_KEY ="144443d3b1f161b9a6a8e9f035ef4bdd657494f91290b45219f7f383fac425a1";
const INSTANCE_NAME = "NutriPetBot";

async function setWebhook() {
  try {
    const res = await axios.post(`${API_URL}/webhook/set/${INSTANCE_NAME}`, {
      webhook: {
        enabled: true,
        url: "https://nutripet-ai.acaoleve.com/api/webhook/whatsapp",
        events: ["MESSAGES_UPSERT"]
      }
    }, { headers: { 'apikey': API_KEY } });
    
    console.log("✅ Webhook forçado com sucesso!", res.data);
  } catch (err) {
    console.error("❌ Erro:", err.response ? err.response.data : err.message);
  }
}
setWebhook();