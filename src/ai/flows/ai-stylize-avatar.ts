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
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: 'Place an ancient Egyptian pharaoh\'s crown on the person\'s head. The crown should be the iconic Nemes headdress, with alternating blue and gold stripes, like the one seen on Tutankhamun. The style should be a modern, digital art masterpiece, blending ancient aesthetics with a futuristic feel. Ensure the original facial features are clearly visible and recognizable under the headdress.'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    if (!media) {
      throw new Error('no media returned');
    }

    return {stylizedAvatarDataUri: media.url};
  }
);
