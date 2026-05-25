// src/lib/googleCalendar.ts
import { google } from "googleapis";
import { addMinutes, parseISO, format, isBefore, isAfter, setHours, setMinutes } from "date-fns";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

// Cria o cliente de autenticação do robô usando a sintaxe de objeto (Deixa o TypeScript feliz)
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL as string,
  key: (process.env.GOOGLE_PRIVATE_KEY as string || "").replace(/\\n/g, "\n"),
  scopes: SCOPES,
});

const calendar = google.calendar({ version: "v3", auth });
const calendarId = process.env.GOOGLE_CALENDAR_ID as string;


/**
 * Função para a IA perguntar: "Quais os horários livres para o dia X?"
 */
export async function verificarDisponibilidade(dataString: string) {
  try {
    // Define o horário comercial do Pet Shop (ex: 09:00 às 18:00)
    const dataAlvo = new Date(dataString); // formato esperado: YYYY-MM-DD
    const inicioDia = setMinutes(setHours(dataAlvo, 9), 0);
    const fimDia = setMinutes(setHours(dataAlvo, 18), 0);

    // Pega todos os eventos já marcados nesse dia
    const res = await calendar.events.list({
      calendarId,
      timeMin: inicioDia.toISOString(),
      timeMax: fimDia.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const eventos = res.data.items || [];
    
    // Simplificando para a IA: Devolve os horários que já estão ocupados
    const ocupados = eventos.map(e => ({
      inicio: e.start?.dateTime ? format(parseISO(e.start.dateTime), "HH:mm") : "O dia todo",
      fim: e.end?.dateTime ? format(parseISO(e.end.dateTime), "HH:mm") : "",
    }));

    if (ocupados.length === 0) return "O dia está totalmente livre das 09:00 às 18:00.";

    return `Horários JÁ OCUPADOS neste dia: ${ocupados.map(o => `${o.inicio} às ${o.fim}`).join(" | ")}. A IA deve sugerir horários fora destas janelas.`;
    
  } catch (error) {
    console.error("Erro ao verificar calendário:", error);
    return "Não foi possível aceder à agenda neste momento.";
  }
}

/**
 * Função para a IA executar: "Marcar banho para o Thor às 14:00"
 */
export async function criarAgendamento(nomePet: string, servico: string, dataISO: string) {
  try {
    const dataInicio = parseISO(dataISO);
    const dataFim = addMinutes(dataInicio, 60); // Assumimos 1 hora por padrão para banho/tosa

    const evento = {
      summary: `🐾 ${servico} - ${nomePet}`,
      description: "Agendado automaticamente pela IA NutriPet.",
      start: { dateTime: dataInicio.toISOString(), timeZone: "America/Sao_Paulo" },
      end: { dateTime: dataFim.toISOString(), timeZone: "America/Sao_Paulo" },
      colorId: "2", // Cor verde no Google Calendar
    };

    const res = await calendar.events.insert({
      calendarId,
      requestBody: evento,
    });

    return `✅ Agendamento confirmado com sucesso! Link: ${res.data.htmlLink}`;
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    return "Erro ao agendar no calendário.";
  }
}