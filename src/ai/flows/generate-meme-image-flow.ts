/**
 * @fileOverview A flow for generating a meme image from text.
 *
 * - generateMemeImage - A function that takes top and bottom text and returns a generated image.
 * - GenerateMemeImageInput - The input type for the generateMemeImage function.
 * - GenerateMemeImageOutput - The return type for the generateMemeImage function.
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateMemeImageInputSchema = z.object({
  topText: z.string().describe('The text for the top of the meme.'),
  bottomText: z.string().describe('The text for the bottom of the meme.'),
  style: z.string().describe('The artistic style of the image.'),
  subject: z.string().describe('The main subject of the image.'),
});
export type GenerateMemeImageInput = z.infer<
  typeof GenerateMemeImageInputSchema
>;

const GenerateMemeImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      'The URL of the generated image, as a data URI with a MIME type and Base64 encoding.'
    ),
});
export type GenerateMemeImageOutput = z.infer<
  typeof GenerateMemeImageOutputSchema
>;

const generateMemeImageFlow = ai.defineFlow(
  {
    name: 'generateMemeImageFlow',
    inputSchema: GenerateMemeImageInputSchema,
    outputSchema: GenerateMemeImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a funny, high-quality, ${input.style} image that would work well for a meme featuring a ${input.subject}. Do not include any text in the image itself.

Meme context:
- Top Text: "${input.topText}"
- Bottom Text: "${input.bottomText}"

Generate an image that visually represents the humor or situation described by the text. The image should be suitable to have white text with a black border overlaid on it.`,
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed: No media was returned.');
    }

    return { imageUrl: media.url };
  }
);

export async function generateMemeImage(
  input: GenerateMemeImageInput
): Promise<GenerateMemeImageOutput> {
  return generateMemeImageFlow(input);
}
