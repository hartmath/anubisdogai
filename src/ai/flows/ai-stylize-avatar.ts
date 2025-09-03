'use server';

/**
 * @fileOverview A flow that optionally applies AI stylization to an avatar using image-to-image diffusion.
 *
 * - aiStylizeAvatar - A function that handles the avatar stylization process.
 * - AIStylizeAvatarInput - The input type for the aiStylizeAvatar function.
 * - AIStylizeAvatarOutput - The return type for the aiStylizeAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
        {text: 'Upon this face, a helmet you shall place; a crown of digital art, with gold and teal embraced. Let the original features brightly shine, a modern pharaoh, a portrait so divine.'},
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
