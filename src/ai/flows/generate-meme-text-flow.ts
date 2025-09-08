/**
 * @fileOverview A flow for generating meme text.
 *
 * - generateMemeText - A function that takes a meme name and a topic, and returns text for the meme.
 * - GenerateMemeTextInput - The input type for the generateMemeText function.
 * - GenerateMemeTextOutput - The return type for the generateMemeText function.
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateMemeTextInputSchema = z.object({
  memeName: z.string().describe('The name of the meme template (e.g., "Drake Hotline Bling").'),
  topic: z.string().describe('The topic or situation for the meme.'),
});
export type GenerateMemeTextInput = z.infer<typeof GenerateMemeTextInputSchema>;

const GenerateMemeTextOutputSchema = z.object({
  texts: z.array(z.string()).describe('An array of strings for the meme text boxes.'),
});
export type GenerateMemeTextOutput = z.infer<
  typeof GenerateMemeTextOutputSchema
>;

const prompt = ai.definePrompt({
  name: 'generateMemeTextPrompt',
  input: { schema: GenerateMemeTextInputSchema },
  output: { schema: GenerateMemeTextOutputSchema },
  prompt: `You are a viral meme creator. Your task is to generate funny and relevant text for a given meme template based on a topic.

Meme Template: {{{memeName}}}
Topic: {{{topic}}}

Based on the meme format and the topic, generate the appropriate text for the meme's text boxes. The number of text strings in the output array should match the typical number of text boxes for the specified meme. For most memes, this is two (top text, bottom text). For the "Anubis Dog AI Logo" meme, provide two short, funny lines that relate to crypto, AI, or dogs.

Make the text concise, witty, and shareable.
`,
});

const generateMemeTextFlow = ai.defineFlow(
  {
    name: 'generateMemeTextFlow',
    inputSchema: GenerateMemeTextInputSchema,
    outputSchema: GenerateMemeTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI did not return any text.');
    }
    return output;
  }
);


export async function generateMemeText(
  input: GenerateMemeTextInput
): Promise<GenerateMemeTextOutput> {
  return generateMemeTextFlow(input);
}
