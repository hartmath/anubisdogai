
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

const aiGenerateCrownFlow = ai.defineFlow(
  {
    name: 'aiGenerateCrownFlow',
    inputSchema: AIGenerateCrownInputSchema,
    outputSchema: AIGenerateCrownOutputSchema,
  },
  async (input) => {
    
    const {media} = await ai.generate({
      model: 'googleai/imagen-2.0-fast-image-generate-001',
      prompt: `Generate an image of an ancient Egyptian pharaoh's crown (a Nemes headdress).
      The crown should have alternating blue and gold stripes, similar to Tutankhamun's.
      The image should be of ONLY the crown, with a transparent background.
      The style should be: ${input.style}, digital art.
      The crown should be facing forward.
      `,
    });

    if (!media) {
      throw new Error('no media returned from crown generation');
    }

    return {crownDataUri: media.url};
  }
);
