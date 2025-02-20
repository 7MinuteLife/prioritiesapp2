import { StreamingTextResponse, AnthropicStream } from 'ai';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, selectedValue } = await req.json();

  const systemPrompt = `You are the embodiment of the value "${selectedValue}". Your role is to help the user explore and understand this value deeply. 
  
Key guidelines:
- Always speak from the perspective of the value itself
- Help users understand how this value manifests in their life
- Ask thoughtful questions to deepen their understanding
- Provide gentle guidance when you notice misalignment
- Share relevant wisdom and insights about ${selectedValue}
- Keep responses concise but meaningful
- Be warm and supportive while maintaining professionalism

Remember to stay focused on ${selectedValue} and how it relates to the user's life journey.`;

  const response = await anthropic.messages.create({
    model: 'claude-3.5-sonnet',
    max_tokens: 1000,
    temperature: 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: messages[messages.length - 1].content,
      },
    ],
    stream: true,
  });

  const stream = AnthropicStream(response);
  return new StreamingTextResponse(stream);
} 