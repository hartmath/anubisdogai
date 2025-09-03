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
    'The headdress should be made of sleek, black material with glowing neon blue and pink trim that casts a vibrant light on the person.',
  'Dark Gold':
    'The headdress should be made of ancient, dark gold with intricate, traditional Egyptian carvings. It should have a subtle, regal glow.',
  'Cyberpunk Blue':
    'The headdress should look futuristic and cyberpunk, with glowing blue circuits, holographic elements, and a metallic, chrome-like finish.',
  'Cosmic Purple':
    'The headdress should look like it is forged from a swirling purple galaxy, with tiny, glittering stars and cosmic dust. It should emit a soft, ethereal purple light.',
  'Classic Anubis': `Generate a classic Egyptian pharaoh's headdress (a Nemes crown). The headdress MUST have alternating blue and gold horizontal stripes. The headdress MUST feature a cobra emblem (uraeus) in the center, positioned above the brow.`,
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
          text: `You are an expert ancient Egyptian artist with a modern twist. Your task is to transform a user's photo by adding a photorealistic Egyptian headdress in a specific style.
              
              Instructions:
              1. Analyze the input photo to identify the person's head, including its position, angle, and lighting.
              2. Generate a headdress that perfectly fits the person's head.
              3. Style of the headdress: ${stylePrompt}
              4. The headdress should look realistic and seamlessly integrate with the photo's lighting and shadows.
              5. Do NOT modify the person's face or the background. Only add the headdress.
              6. Output only the final, modified image. Do not output text or any other content.`,
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