
'use server';

/**
 * @fileOverview A flow that generates an image of a pharaoh's crown.
 *
 * - aiGenerateCrown - A function that handles the crown generation process.
 * - AIGenerateCrownInput - The input type for the aiGenerateCrown function.
 * - AIGenerateCrownOutput - The return type for the aiGenerateCrown function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AIGenerateCrownInputSchema = z.object({
  style: z
    .string()
    .describe(
      "The artistic style for the crown, e.g., 'Neon Glow', 'Dark Gold'."
    ),
});
export type AIGenerateCrownInput = z.infer<typeof AIGenerateCrownInputSchema>;

const AIGenerateCrownOutputSchema = z.object({
  crownDataUri: z
    .string()
    .describe("The generated crown, as a data URI."),
});
export type AIGenerateCrownOutput = z.infer<typeof AIGenerateCrownOutputSchema>;

export async function aiGenerateCrown(input: AIGenerateCrownInput): Promise<AIGenerateCrownOutput> {
  return aiGenerateCrownFlow(input);
}

const crownPrompt = ai.definePrompt(
  {
    name: 'crownPrompt',
    model: 'googleai/gemini-1.5-flash-preview',
    input: { schema: AIGenerateCrownInputSchema },
    prompt: `Generate ONLY an image of an ancient Egyptian pharaoh's crown (a Nemes headdress), with alternating blue and gold stripes. The image MUST have a transparent background. The crown MUST be facing forward. The image should be in a {{{style}}}, digital art style. Do not output any text, only the image.`,
  }
);


const aiGenerateCrownFlow = ai.defineFlow(
  {
    name: 'aiGenerateCrownFlow',
    inputSchema: AIGenerateCrownInputSchema,
    outputSchema: AIGenerateCrownOutputSchema,
  },
  async (input) => {
    
    const {output} = await crownPrompt(input);
    const media = output!.media;

    if (!media) {
      throw new Error('no media returned from crown generation');
    }

    return {crownDataUri: media.url};
  }
);

