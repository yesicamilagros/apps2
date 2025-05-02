import axios from 'axios';
import config from '../config/env.js';

class WhatsAppService {
  async sendMessage(to, body, messageId) {
    try {
      await axios({

        method: 'POST',
        url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
        headers: {
        Authorization: `Bearer ${config.API_TOKEN}`,

        },
        data: {
          messaging_product: 'whatsapp',
          to,
          text: { body } // ,
           //context: {
            // message_id: messageId,
          //},
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async markAsRead(messageId) {
    try {
      await axios({

        method: 'POST',
        url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
        headers: {
          Authorization: `Bearer ${config.API_TOKEN}`,

        },
        data: {
          messaging_product: "whatsapp",
          status: "read",
          message_id: messageId
        },
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

 async sendInteractiveButton(to,textbuton,buttons){
     try{
      await axios({

        method: 'POST',
        url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
        headers: {
        Authorization: `Bearer ${config.API_TOKEN}`,

        },
        data: {
          messaging_product: 'whatsapp',
          to,
          type: "interactive",
          interactive: {
              type: "button",
              body: {
                  text: textbuton
              },
              action: {
                  buttons: buttons
              }
          }
        },
      });


     }
     catch(error){
      console.error(error);
     }



 }


 async sendMedia(to,MediaUrl,caption,type){

   

  try { 

   const MediaObject={};

    switch(type){
     case 'image':
      MediaObject.image={link:MediaUrl,caption:caption};
       break;
     case 'video':
      MediaObject.video= {link:MediaUrl,caption:caption};
       break;
     case 'audio':
      MediaObject.audio= {link:MediaUrl};
         break; 
     case 'document':
      MediaObject.document= {link:MediaUrl,caption:caption};
           break; 
   
     default:
             throw new Error('Not Soported Media Type');

    }
    await axios({

      method: 'POST',
      url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
      headers: {
      Authorization: `Bearer ${config.API_TOKEN}`,

      },
      data: {
        messaging_product: 'whatsapp',
        to,
        type: type,
        ...MediaObject
      },
    });
  } catch (error) {
    console.error('Error sending Media:', error);
  }





       



 }

 
}

export default new WhatsAppService();