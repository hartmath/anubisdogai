'use server';

/**
 * @fileOverview A flow that optionally applies AI stylization to an avatar using image-to-image diffusion.
 *
 * - aiStylizeAvatar - A function that handles the avatar stylization process.
 * - AIStylizeAvatarInput - The input type for the aiStylizeAvatar function.
 * - AIStylizeAvatarOutput - The return type for the aiStylizeAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AIStylizeAvatarInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  shouldStylize: z.boolean().describe('Whether or not to apply AI stylization.'),
});
export type AIStylizeAvatarInput = z.infer<typeof AIStylizeAvatarInputSchema>;

const AIStylizeAvatarOutputSchema = z.object({
  stylizedAvatarDataUri: z
    .string()
    .describe("The stylized avatar, as a data URI."),
});
export type AIStylizeAvatarOutput = z.infer<typeof AIStylizeAvatarOutputSchema>;

export async function aiStylizeAvatar(input: AIStylizeAvatarInput): Promise<AIStylizeAvatarOutput> {
  return aiStylizeAvatarFlow(input);
}

const aiStylizeAvatarFlow = ai.defineFlow(
  {
    name: 'aiStylizeAvatarFlow',
    inputSchema: AIStylizeAvatarInputSchema,
    outputSchema: AIStylizeAvatarOutputSchema,
  },
  async input => {
    if (!input.shouldStylize) {
      return {stylizedAvatarDataUri: input.photoDataUri};
    }

    const {media} = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: 'Based on the provided image, add an ancient Egyptian pharaoh\'s crown (Nemes headdress) to the person\'s head. The crown should have alternating blue and gold stripes, similar to Tutankhamun\'s. Render the final image in a modern, digital art style, ensuring the original facial features are preserved and clearly visible. Output ONLY the newly generated image.'},
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media) {
      throw new Error('no media returned');
    }

    return {stylizedAvatarDataUri: media.url};
  }
);
