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
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "The generated avatar image, as a data URI with a MIME type and Base64 encoding."
    ),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        {
          text: `You are an expert ancient Egyptian artist. Your task is to transform a user's photo by adding a photorealistic Anubis headdress.
              
              Instructions:
              1. Analyze the input photo to identify the person's head, including its position, angle, and lighting.
              2. Generate an ornate, black and gold Anubis-style headdress that perfectly fits the person's head.
              3. The headdress should look realistic and seamlessly integrate with the photo's lighting and shadows.
              4. Do NOT modify the person's face or the background. Only add the headdress.
              5. Output only the final, modified image. Do not output text or any other content.`,
        },
        { media: { url: input.photoDataUri } },
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed: no media was returned from the AI model.');
    }

    return { photoDataUri: media.url };
  }
);

export async function generateAvatar(input: GenerateAvatarInput): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input);
}
