import whatsappService from './whatsappService.js';
import WhatsAppService from './whatsappService.js';
import axios from 'axios';
import gpt from './gpt.js';

class MessageHandler {
  // creando el cosntructor 
   constructor(){
    this.AppoinmentState ={};
    this.AssistantState ={};
   }


  async handleIncomingMessage(message,senderInfo) {
    if (message?.type === 'text') {
     
      const incomingMessage = message.text.body.toLowerCase().trim();
      const palabrasClave = ['promociones', 'tratamientos', 'zonas corporales','depilacion','depil'];
      const contienePalabraClave = palabrasClave.some(palabra => 
            incomingMessage.includes(palabra.toLowerCase()));


      if(incomingMessage === 'imagen' ){
        await this.SendMedia(message.from); 
         }

      else if (this.AppoinmentState[message.from]) {
          await this.HandleAppoimentFlow(message.from, incomingMessage);}

      else if(this.isGreeting(incomingMessage)){await this.sendWelcomeMessage(message.from, message.id,senderInfo);
                                               await this.sendMenuOption(message.from);} 

      else if(this.AssistantState[message.from]){
         await  this.handleAssitantFlow(message.from,incomingMessage);

      }

      else if(contienePalabraClave){
        const aiResponse = await this.asistenteVentas(incomingMessage);
        await WhatsAppService.sendMessage(message.from,aiResponse);

      }

    



      else {return ''}   
      await WhatsAppService.markAsRead(message.id);
    }

    else if(message?.type  === 'interactive'){
           const opcion = message?.interactive?.button_reply?.id;
           await this.handleMenuOption(message.from,opcion);
           await WhatsAppService.markAsRead(message.id);
    }
  }

  isGreeting(message) {
    const greetings = ["hola", "hello", "hi", "buenas tardes","buenas","buen","buen dia","buenos dias","buenos noches"];
    return greetings.some(saludo => message.toLowerCase().includes(saludo));
  }
  
  getsenderInfo(senderInfo){
    const regex = /^[^\s]+/; // busca cualquier cosa hasta el primer espacio
    const texto = senderInfo.profile?.name;
    const resultado = regex.exec(texto);
       return resultado[0] || senderInfo.wa_id || "Estimado(a)"

  }
  async sendWelcomeMessage(to, messageId,senderInfo) {
    const name = this.getsenderInfo(senderInfo);
    const welcomeMessage = `Hola ${name} soy tu asistente virtual, de Depilzone `;
    await WhatsAppService.sendMessage(to, welcomeMessage, messageId);
  }


  async sendMenuOption(to){

    const messageOptions = "¿Te gustaría conocer nuestras promociones en tratamientos estéticos? ";
    const buttons = [
      {
          type: "reply",
          reply: {
              id: "buton_1",
              title: "ver los tratamientos"
          }
      },
      {
          type: "reply",
          reply: {
              id: "buton_2",
              title: "Tengo una duda"
          }
      },
      {
        type: "reply",
        reply: {
            id: "buton_3",
            title: "Reservar una cita"
        }
    }
  ];
  await WhatsAppService.sendInteractiveButton(to,messageOptions,buttons);
  }


  waiting = (delay,callback)=>{setTimeout(callback,delay);};

  async handleMenuOption(to,option){
       let response ;
       switch (option){
          case "buton_1":
            
            response = "por favor podrias indicarnos que tipo de tratamientos deseas conocer?"; 
            this.AssistantState[to] = { step: 'question' };
            break;
          case "buton_2":
              this.AppoinmentState[to]={step:'name'};
              response = "Hola nuevamente ¿podrias proporcionarnos tus nombres.por favor?";

              break;
          case "buton_3":
                response = "hacer una cita";
                break;
          case "buton_5":
                  response = "¿podrias indicarnos tus dudas, por favor?";
                  break;
          case "buton_6":
                    response = "Lo siento, ¿podrías indicarnos qué información necesitas?";
                    break;

          default :
           response ="";
           break;

       };

       await WhatsAppService.sendMessage(to,response);


  }



 
async SendMedia(to){
     
      //if (texto.toLowerCase().trim().includes("imagen") || opcions === 'buton_1'){
          const mediaurl='https://i.ibb.co/4ggKLtKQ/DALL-E-2025-05-02-10-13-44-Promotional-image-for-a-beauty-clinic-named-Depilzone.png';
          const caption='tenemos los siguientes tratamientos , podrias decirnos ';
          const type='image';
          await WhatsAppService.sendMedia(to,mediaurl,caption,type);
      }
      
      
  completeAppoimentTo(to){
          const appoiment = this.AppoinmentState[to];
          delete this.AppoinmentState[to];
          const userData=[
               to,
               appoiment.name,
               appoiment.edad,
               appoiment.reason,
               new Date().toISOString()
             
          ]
      
          return `gracias , se ha recopilado los siguientes datos :
                  tu nombre : ${appoiment.name}
                  edad : ${appoiment.edad}
                  razon de consulta :${appoiment.reason}
                  ,en breve te enviare la informacion que solicitaste
                  `
                  
        }


  async HandleAppoimentFlow(to,message){
        const state = this.AppoinmentState[to];
        let response;
        switch (state.step){
          case 'name':
              state.name=message;
              state.step='edad';
              response ="gracias . ¿podrias comentarnos, sobre tu edad ¿cuantos años tienes ?. "
             break;
          case 'edad':
            state.edad=message;
            state.step='reason';
            response ="de acuerdo ello lo mantendremos en discrecion ,¿cual es la razon de tu consulta ?"
            break;
          case 'reason':
              state.reason=message;
              response = this.completeAppoimentTo(to);
              break;
              
          

          

        }

        await whatsappService.sendMessage(to,response);

  }

  async handleAssitantFlow(to,message){
    const state = this.AssistantState[to];
    let response;
    const menuMessage='¿la repsuesta fue de tu ayuda?';
    const buttons = [
      {
          type: "reply",
          reply: {
              id: "buton_4",
              title: "si, gracias"
          }
      },
      {
          type: "reply",
          reply: {
              id: "buton_5",
              title: "Hacer otra pregunta"
          }
      },
      {
        type: "reply",
        reply: {
            id: "buton_6",
            title: "No, no me ayudo"
        }
    }
  ];
     
    if (state.step === 'question') {
        
        response = await gpt.llama4Groq(message);
    }

    delete this.AssistantState[to];
    await whatsappService.sendMessage(to,response);
    await WhatsAppService.sendInteractiveButton(to,menuMessage,buttons);
    


  }










































  
/////////////////////////////////////////////////////////////////////////


        
      async fetchSheetData() {
          try {
          const scriptUrl = "https://script.google.com/macros/s/AKfycbyUfCCoJWUAlQRuSE93r031i11UnzftTjwKVFJMrSYWLlZoENS2uobkA01BXGy-0wwC/exec"; // Ej: https://script.google.com/macros/s/.../exec
          const response = await axios.get(scriptUrl);
         // console.log(response.data); // Datos en JSON
          return response.data;
      } catch (error) {
          console.error("Error al obtener datos:", error);
          throw error;
        }
        }


        ///////////////////////


      buscarEnSheet(datos, subcadena, columnasExtraer = 3) {

        if (!Array.isArray(datos)) {
          console.error("❌ Error en buscarEnSheet: 'datos' no es un array:", datos);
          return [];
      }
          const [headers, ...filas] = datos;
          const subcadenaNormalizada = subcadena
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase();
      
          return filas.map(fila => {
              // Encontrar el índice de la columna con coincidencia
              const columnaMatch = fila.findIndex(valor => {
                  const valorNormalizado = valor?.toString()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .toLowerCase();
                  return valorNormalizado.includes(subcadenaNormalizada);
              });
      
              if (columnaMatch === -1) return null;
      
              // Extraer datos siguientes y aplanar la estructura
              const resultado = {
                  filaOriginal: fila.join(" | "), // Opcional: fila como string
                  columnaMatch: columnaMatch,
                  valorMatch: fila[columnaMatch],
              };
      
              // Añadir cada columna siguiente como propiedad separada
              for (let i = 1; i <= columnasExtraer; i++) {
                  const colIndex = columnaMatch + i;
                  const header = headers[colIndex] || `Col${colIndex + 1}`;
                  resultado[`siguiente_${header}`] = fila[colIndex]; // Ej: "siguiente_País": "España"
              }
      
              return {
                  tratamiento: fila[columnaMatch],       // Ej: "Botox"
                  zona: fila[columnaMatch + 1],         // Ej: "Facial"
                  precio: fila[columnaMatch + 2],       // Ej: 200
                  detalles: fila[columnaMatch + 3] || "" // Ej: "Aplicación..."
                };
             
          }).filter(Boolean);
        
         
        }


        ////////////////////////////////
 


        async  llama4Groq(prompt, context = "") {
          try {
              // Palabras clave requeridas
              const palabrasClave = ['promociones', 'tratamientos', 'zonas corporales'];
              const promptLower = prompt.toLowerCase();
              
              // Verificar si el prompt contiene al menos una palabra clave
              const contienePalabraClave = palabrasClave.some(palabra => 
                  promptLower.includes(palabra.toLowerCase())
              );
      
              if (!contienePalabraClave && !context) {
                  return "¿Podrías replantear tu pregunta? Estoy especializado en información sobre: " + 
                         palabrasClave.join(', ') ;
              }
      
              const fullPrompt = context 
                  ? `${context}\n\nPor favor responde como asistente de ventas profesional de la clínica Depilzone:\n${prompt}`
                  : `Como asistente de Depilzone, ${prompt}`;
      
              const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                  model: "meta-llama/llama-4-scout-17b-16e-instruct",
                  messages: [{ 
                      role: "user", 
                      content: fullPrompt 
                  }],
                  temperature: 0.7
              }, {
                  headers: {
                      "Authorization": `Bearer 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`,
                      "Content-Type": "application/json"
                  }
              });
      
              return res.data.choices[0].message.content;
      
          } catch (error) {
              console.error("Error en Groq API:", error.response?.data || error.message);
              return "Disculpa, estoy teniendo dificultades técnicas. Por favor intenta nuevamente más tarde.";
          }
      }


      //////////////////////////////////////////////////////////////



      async  asistenteVentas(consultaUsuario) {
        try {
            // Paso 1: Buscar en Google Sheets
            const datos = await this.fetchSheetData();
            const resultados = this.buscarEnSheet(datos, consultaUsuario);
            
            if (resultados.length === 0) {
                return await this.llama4Groq(
                    "El cliente buscó '" + consultaUsuario + "' pero no encontré resultados. " +
                    "Responde amablemente que no tenemos ese tratamiento disponible " 
                );
          
            }

            else if (resultados.length !== 0) { // Paso 2: Crear contexto para la IA
    
    
              const context = `Información de tratamientos disponibles: ${resultados.map(r => 
               `- ${r.tratamiento} (${r.zona}): ${r.precio ? '$'+r.precio : 'precio bajo consulta'}${r.detalles ? '. Detalles: ' + r.detalles : ''}`
               ).join('\n')}`;
      
              // Paso 3: Generar respuesta inteligente
              return await this.llama4Groq(
                  `El cliente preguntó por: "${consultaUsuario}".\n` +
                  `Genera una respuesta CALUROSA Y PROFESIONAL que:\n` +
                  `1. Mencione los tratamientos encontrados\n` +
                  `2. Pregunte por la zona de interés\n` +
                  `3. Ofrezca ayuda adicional\n` +
                  `4. Use emojis apropiados (máximo 3)`,
                  context
              );}


              else { return await this.llama4Groq(consultaUsuario ,context
            )}
    
           
    
        } catch (error) {
            console.error("Error en asistenteVentas:", error);
            return "¡Ups! Algo salió mal. Por favor intenta nuevamente.";
        }
    }
    








}

export default new MessageHandler();



 


 


  







// 4. Función principal integrada








































