import { StreamingTextResponse, AnthropicStream } from 'ai';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = typeof body === 'string' ? JSON.parse(body) : body;
    const { values = [], question = '' } = data;

    if (!Array.isArray(values)) {
      throw new Error('Values must be an array');
    }

    const prompt = question 
      ? `You are a helpful AI assistant specializing in personal values and priorities. 
         The user has selected these values: ${values.join(', ')}.
         
         The user asks: "${question}"
         
         Provide a thoughtful but concise response that helps them understand their values better.`
      : `You are a helpful AI assistant specializing in personal values and priorities. 
         ${values.length > 0 
           ? `The user has selected these values: ${values.join(', ')}. Provide a brief (2-3 sentences) insight about these values and how they might complement each other.` 
           : `Please select some values to get insights about how they complement each other.`}
         
         Focus on being encouraging and insightful. Keep your response concise and friendly.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    const stream = AnthropicStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error in Claude API route:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 