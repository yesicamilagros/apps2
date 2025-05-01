import WhatsAppService from './whatsappService.js';

class MessageHandler {
  async handleIncomingMessage(message) {
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim();

      if(this.isGreeting(incomingMessage)){
        await this.sendWelcomeMessage(message.from, message.id)
      } else {
        const response = `Echo: ${message.text.body}`;
        await WhatsAppService.sendMessage(message.from, response, message.id);
      }
      await WhatsAppService.markAsRead(message.id);
    }
  }

  isGreeting(message) {
    const greetings = ["hola", "hello", "hi", "buenas tardes"];
    return greetings.includes(message);
  }

  async sendWelcomeMessage(to, messageId) {
    const welcomeMessage = "Hola, Bienvenido a nuestro servicio de Veteria online." + 
    "¿En Qué puedo ayudarte Hoy?";
    await WhatsAppService.sendMessage(to, welcomeMessage, messageId);
  }

}

export default new MessageHandler();