const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config();

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function testBedrock() {
  console.log('🧪 Probando AWS Bedrock Llama 3 70B...\n');
  console.log(`📍 Region: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`🔑 Access Key: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 10)}...`);
  console.log(`🤖 Model: ${process.env.AWS_BEDROCK_MODEL || 'meta.llama3-70b-instruct-v1:0'}\n`);

  const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

Eres un asesor financiero experto en Colombia.<|eot_id|><|start_header_id|>user<|end_header_id|>

¿Qué es una inversión? Responde en máximo 2 líneas.<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

  try {
    const input = {
      modelId: process.env.AWS_BEDROCK_MODEL || 'meta.llama3-70b-instruct-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        prompt: prompt,
        max_gen_len: 512,
        temperature: 0.7,
        top_p: 0.9
      })
    };

    console.log('📤 Enviando petición a AWS Bedrock...');
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const text = responseBody.generation || responseBody.results?.[0]?.outputText || 'No response';

    console.log('\n✅ Respuesta recibida:');
    console.log('─'.repeat(60));
    console.log(text.trim());
    console.log('─'.repeat(60));
    console.log('\n🎉 AWS Bedrock está funcionando correctamente!');

  } catch (error) {
    console.error('\n❌ Error al conectar con AWS Bedrock:');
    console.error(`Tipo: ${error.name}`);
    console.error(`Mensaje: ${error.message}`);
    
    if (error.message.includes('not authorized')) {
      console.error('\n💡 Posibles soluciones:');
      console.error('   1. Verifica que las credenciales AWS sean correctas');
      console.error('   2. Asegúrate de tener permisos para invocar modelos Bedrock');
      console.error('   3. Verifica que el modelo esté habilitado en tu cuenta');
    } else if (error.message.includes('ResourceNotFoundException')) {
      console.error('\n💡 El modelo no está disponible en esta región');
      console.error('   Prueba con otra región o habilita el modelo en AWS Console');
    }
  }
}

testBedrock();
