
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
      prompt: `Task: Generate ONLY an image of an ancient Egyptian pharaoh's crown (a Nemes headdress).
      
      Instructions:
      - The output MUST be an image, not text.
      - The crown should have alternating blue and gold stripes, similar to Tutankhamun's.
      - The image must contain ONLY the crown.
      - The background of the image MUST be transparent.
      - The crown must be facing forward.
      - The artistic style should be: ${input.style}, digital art.
      `,
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media) {
      throw new Error('no media returned from crown generation');
    }

    return {crownDataUri: media.url};
  }
);
