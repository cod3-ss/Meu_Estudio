import { Student, StudioSettings, AgendaItem } from './types';

// Função para substituir variáveis no template
export const replaceVariablesInTemplate = (
  template: string,
  student: Student,
  studioSettings: StudioSettings,
  additionalVars?: Record<string, string>
): string => {
  let message = template;

  message = message.replace(/{aluno}/g, student.name);
  message = message.replace(/{estudio}/g, studioSettings.appName);

  if (additionalVars) {
    for (const key in additionalVars) {
      message = message.replace(new RegExp(`{${key}}`, 'g'), additionalVars[key]);
    }
  }
  return message;
};

// Função para gerar uma mensagem amigável (Simulação)
export const generateChatbotMessage = async (promptText: string): Promise<string> => {
  // Retornando a mensagem original com um emoji para manter o tom amigável
  return `${promptText} 😊`;
};

interface ChatbotMessagePayload {
  student: Student;
  templateKey: 'classReminder' | 'expiryWarning' | 'birthdayMessage' | 'paymentConfirmation' | 'welcomeMessage' | 'rescheduleNotification';
  studioSettings: StudioSettings;
  agendaItems: AgendaItem[];
  allStudents: Student[];
  additionalVars?: Record<string, string>;
}

// Função principal para enviar (simular) mensagem WhatsApp
export const sendWhatsAppMessage = async ({
  student,
  templateKey,
  studioSettings,
  additionalVars,
}: ChatbotMessagePayload): Promise<void> => {
  const chatbotSettings = studioSettings.chatbotSettings;

  if (!chatbotSettings?.isEnabled) {
    return;
  }

  const featureSettings = chatbotSettings[templateKey];

  if (!featureSettings?.isEnabled) {
    return;
  }

  const template = featureSettings.template;
  if (!template) {
    return;
  }

  let finalAdditionalVars = { ...additionalVars };

  // Lógica específica para variáveis de templates
  if (templateKey === 'welcomeMessage') {
    const studentNextClass = student.schedule?.[0] || "em breve (entraremos em contato para agendar)";
    finalAdditionalVars.proxima_aula = studentNextClass;
  }

  const rawMessage = replaceVariablesInTemplate(template, student, studioSettings, finalAdditionalVars);
  const aiGeneratedMessage = await generateChatbotMessage(rawMessage);

  console.log(`--- Chatbot Meu Estúdio (Simulação WhatsApp) ---`);
  console.log(`Para: ${student.name} (${student.phone})`);
  console.log(`Mensagem (${templateKey}):`);
  console.log(aiGeneratedMessage);
  console.log(`--------------------------------------------------`);
};