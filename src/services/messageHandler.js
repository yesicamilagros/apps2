import whatsappService from './whatsappService.js';

class MessageHandler {

  constructor() {
    this.appointmentState = {};
  }



  async handleIncomingMessage(message,senderInfo) {
    if (message?.type === 'text') {
      const incomigMessage=message.text.body.toLowerCase().trim();
  
      if(this.isGreeting(incomigMessage)){
        await this.sendWelcomeMessage(message.from,message.id,senderInfo);
        await this.sendWelcomeMenu(message.from);
      }
      else if(this.appointmentState[message.from]){

        await this.handleAppointmentFlow(message.from,incomigMessage);
      }
      else if(incomigMessage==='video'){
          await this.sendMedia(message.from,incomigMessage);
      }
      else if(incomigMessage==='imagen'){
        await this.sendMedia(message.from,incomigMessage);
    }
    
   
      else{
        //const response = `Echo: ${message.text.body}`;
      await this.handleIncomingMessage(message.from,incomigMessage);

      

      }
      
      await whatsappService.markAsRead(message.id);
    }
   
    else if(message?.type === 'interactive'){

      const option =message?.interactive?.button_reply?.title.toLowerCase().trim();
      await this.handleMenuOption(message.from,option);
      await whatsappService.markAsRead(message.id);
    
    }
   
  }


  isGreeting(message){
    const greetings=["hola","hello","hi","buenas","buen","buen dia","buenos dias","buenas tardes"];
    return greetings.includes(message);
  }

  getSenderInfo(senderInfo){
    return senderInfo.profile?.name || senderInfo.wa_id || "Estimado(a)"
  }

  async sendWelcomeMessage(to,messageId,senderInfo){
    const name=this.getSenderInfo(senderInfo);
    const welcomeMessage = `Hola ${name} ,Soy Milagros asistente virtual de Depilzone. ¿ En Que Puedo Ayudarte hoy ? `
      ;
    await whatsappService.sendMessage(to,welcomeMessage,messageId) 

  }

  async sendWelcomeMenu(to){
       const menuMessage = "elige una opcion :"
       const buttons =[
          
        {
          type: "reply",
          reply: {
              id: "opcion_1",
              title: "hablar con asesor"
          }
      },
      {
          type: "reply",
          reply: {
              id: "opcion_2",
              title: "visitar website"
          }
      },
      {
        type: "reply",
        reply: {
            id: "opcion_3",
            title: "salir"
        }
    }
          


       ];


       await whatsappService.sendInteractiveButtons(to,menuMessage,buttons);
  }


  async handleMenuOption(to,option){
       let response;
       switch (option){
          case "hablar con asesor":
              this.appointmentState[to] = { step: 'name' };
               response = "Hola , como estas . cual es tu Nombre ?";
               
               break;
          case "visitar website":
              response = 'nuestro sitio web es depilzone.com';
              break;  
          case "salir":
              response = 'exit';
              break; 
          default :
          response= 'los siento no entendi tu seleccion.por favor elige una de las opciones ' 


       }

       await whatsappService.sendMessage(to,response);

  }


  async sendMedia(to,incom){
       
    
 
    const mediaOptions = {
    video: {
         mediaUrl :'https://media-hosting.imagekit.io/91a6457f63f0474e/video.mp4?Expires=1840577472&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=rxNA2gTNDgOVdwQ77Zi5TrXoZgJYCkKwROg9w4~P3gE7B0e7JjZmyUQiMyhVpCK907RzAofeijy0pjGk8shcktkf4ahWNj7mGUkIHdvfQXloZs30hlgoDHPHbogw8ntbx~zaZNEHEVEyKap6vI4E8oBzM5yerWNgBi1ozWu0lvCFGrKp65UWb40gtIv6GGaQiKpk3dZIKzXYmiVDI0r~eg-7yrg6~FIjr5kzDPMAd54DtkrrFMqMbXXKTtXXNjdLnQJ0PgXUw9~TK116BRF8gixkU-xSazQojWsY148eINvevj2KD6X5Sg85Gl3TBcIs~YPEbs6a7suSTOG1HQuPdw__',
        caption : 'recomedaciones pretratamiento',
        type : 'video'
      },
       
        image: {
         mediaUrl :'https://i.ibb.co/G4ZZ6xtC/sedes-1.png',
        caption :'Depilzone Sedes',
         type : 'image'
      }
    };
       

       const mediaType = mediaOptions[incom] ? incom : 'image'; // fallback a 'image' si no es 'video'
       const { mediaUrl, caption, type } = mediaOptions[mediaType];

       await whatsappService.senMediaMessage(to, type,mediaUrl, caption);
   


  }


 completeApproiment(to){
     const appoinment=this.appointmentState[to];
     delete this.appointmentState[to];

     const userData =[
        to,
        appoinment.name,
        appoinment.petName,
        /*
        appoinment.petType, */
        appoinment.reason,
        new Date().toISOString()

     ]
     console.log(userData);

     return `Gracias por elegirnos .`

}


  async handleAppointmentFlow(to, message) {
    const state = this.appointmentState[to];
    let response;

    switch (state.step) {
     case 'name':
        state.name = message;
        state.step = 'petName';
       // response = "Gracias, Ahora, ¿Cuál es el nombre de tu Mascota?"
        break;
     /*  case 'petName':
        state.petName = message;
        state.step = 'petType';
        response = '¿en que puedo ayudarte? (por ejemplo: perro, gato, huron, etc.)'
        break;*/
      case 'petName':
        state.petName = message;
        state.step = 'reason';
        response = '¿Cuál es el motivo de la Consulta?';
        break;
      case 'reason':
        state.reason = message;
        response = this.completeApproiment(to);
        break;
    }
    await whatsappService.sendMessage(to, response);
  }

}

export default new MessageHandler();