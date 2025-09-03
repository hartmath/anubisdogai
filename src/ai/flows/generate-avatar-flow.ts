/**
 * @fileOverview A flow for generating an Anubis-themed avatar from a user's photo.
 *
 * - generateAvatar - A function that takes a user's photo and returns a new photo with an Anubis headdress.
 * - GenerateAvatarInput - The input type for the generateAvatar function.
 * - GenerateAvatarOutput - The return type for the generateAvatar function.
 */
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateAvatarInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  style: z
    .string()
    .describe('The visual style for the headdress.')
    .default('Cosmic Purple'),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'The generated avatar image, as a data URI with a MIME type and Base64 encoding.'
    ),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

const stylePrompts = {
  'Neon Glow':
    'The headdress should be made of sleek, black material with glowing neon blue and pink trim. The entire image should have a dark, moody atmosphere with vibrant neon highlights, casting a glow on the person and the background.',
  'Dark Gold':
    'The headdress should be made of ancient, dark gold with intricate carvings. The overall image should have a regal and ancient feel, with warm, dramatic lighting, deep shadows, and a subtle golden sheen over everything.',
  'Cyberpunk Blue':
    'The headdress should look futuristic and cyberpunk, with glowing blue circuits and holographic elements. The entire scene should be transformed into a rainy, neon-lit cyberpunk city at night, with the blue light from the headdress reflecting on wet surfaces.',
  'Cosmic Purple':
    'The headdress and the person should look like they are forged from a swirling purple galaxy with tiny, glittering stars. The background should be a cosmic nebula, and the person should have a soft, ethereal purple glow.',
  'Classic Anubis': `Generate a classic Egyptian pharaoh's headdress (a Nemes crown). The headdress MUST have alternating blue and gold horizontal stripes and a cobra emblem (uraeus). The background should be transformed into an ancient Egyptian tomb wall with hieroglyphics. The overall lighting should be torch-lit and dramatic. Do not change the person's face.`,
};

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async (input) => {
    const stylePrompt =
      stylePrompts[input.style as keyof typeof stylePrompts] ||
      stylePrompts['Classic Anubis'];

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {
          media: { url: input.photoDataUri },
        },
        {
          text: `You are an expert digital artist. Your task is to transform a user's photo by adding a photorealistic Egyptian headdress and reimagining the entire image in a specific style.

              Instructions:
              1. Analyze the input photo to identify the person, their face, and their pose.
              2. Keep the person's face and basic pose recognizable.
              3. If the input image is a 2D illustration or cartoon, the output should match that 2D style. If the input is a photograph, the output should be photorealistic.
              4. Generate a headdress that perfectly fits the person's head.
              5. Apply the following style to the headdress AND the entire image (background, lighting, and mood): ${stylePrompt}
              6. The final image should be a seamless, artistic composition.
              7. Output only the final, modified image. Do not output text or any other content.`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error(
        'Image generation failed: no media was returned from the AI model.'
      );
    }

    return { photoDataUri: media.url };
  }
);

export async function generateAvatar(
  input: GenerateAvatarInput
): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input);
}
