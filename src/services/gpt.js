import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

class gpt {
  async llama4Groq(prompt) {
    try {
      const response = await axios({
        method: 'POST',
        url: `https://api.groq.com/openai/v1/chat/completions`,
        headers: {
          Authorization: `Bearer ${process.env.API_KEY_LLAMA}`,
          'Content-Type': 'application/json'
        },
        data: {
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            { 
              role: "system", 
              content: "'Comportarte como asistente de ventas profesional de la clínica Depilzone, resuelve las preguntas lo más simple posible. Responde en texto simple como si fuera un mensaje de un bot conversacional, no saludes, no generas conversación, solo respondes con la pregunta del usuario.'"
          },
            { 
              role: "user",
              content: prompt
            }
          ],  
          temperature: 0.7
        }
      });  

      return response.data.choices[0].message.content;

    } catch (error) {
      console.error("Error en Groq API:", error.response?.data || error.message);
      return "Disculpa, estoy teniendo dificultades técnicas. Por favor intenta nuevamente más tarde.";
    }
  }
}

export default new gpt(); // ✅ instanciación correcta


 /*
const llama4Groq = async (prompt, context = "") => {
    try {
       const palabrasClave = ['promociones', 'tratamientos', 'zonas corporales'];
        const promptLower = prompt.toLowerCase();
        
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
                role: "system", 
                content: "'Comportarte como asistente de ventas profesional de la clínica Depilzone, resuelve las preguntas lo más simple posible. Responde en texto simple como si fuera un mensaje de un bot conversacional, no saludes, no generas conversación, solo respondes con la pregunta del usuario.'"
            },{ 
                role: "user", 
                content: prompt
            }],
            temperature: 0.7
        }, {
            headers: {
                "Authorization": `Bearer ${config.API_KEY_LLAMA}`,
                "Content-Type": "application/json"
            }
        });

        return res.data.choices[0].message.content;

    } catch (error) {
        console.error("Error en Groq API:", error.response?.data || error.message);
        return "Disculpa, estoy teniendo dificultades técnicas. Por favor intenta nuevamente más tarde.";
    }
}; 
*/

