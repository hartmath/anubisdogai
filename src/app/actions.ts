'use server';

import {
  generateAvatar,
  type GenerateAvatarInput,
} from '@/ai/flows/generate-avatar-flow';
import {
  generateMemeImage,
  type GenerateMemeImageInput,
} from '@/ai/flows/generate-meme-image-flow';
import {
  generateMemeText,
  type GenerateMemeTextInput,
} from '@/ai/flows/generate-meme-text-flow';
import type { MemeTemplate } from '@/lib/types';

export async function generateAvatarAction(
  photoDataUri: string,
  style: string
) {
  try {
    const input: GenerateAvatarInput = { photoDataUri, style };
    const result = await generateAvatar(input);
    return result;
  } catch (error: any) {
    console.error('Avatar generation failed:', error);
    // Re-throw the original error message to show the real problem on the client.
    throw new Error(
      error.message || 'An unknown error occurred during avatar generation.'
    );
  }
}

export async function getMemesAction(): Promise<MemeTemplate[]> {
  try {
    const response = await fetch('https://api.imgflip.com/get_memes');
    if (!response.ok) {
      throw new Error('Failed to fetch memes from Imgflip API');
    }
    const json = await response.json();
    if (!json.success) {
      throw new Error(json.error_message || 'Imgflip API returned an error');
    }
    // The API returns the top 100 memes, which is perfect.
    return json.data.memes;
  } catch (error: any) {
    console.error('getMemesAction failed:', error);
    // In case of an error, we return an empty array to prevent the page from crashing.
    return [];
  }
}

export async function generateMemeTextAction(memeName: string, topic: string) {
  try {
    const input: GenerateMemeTextInput = { memeName, topic };
    const result = await generateMemeText(input);
    return result;
  } catch (error: any) {
    console.error('Meme text generation failed:', error);
    throw new Error(
      error.message || 'An unknown error occurred during meme text generation.'
    );
  }
}

export async function generateMemeImageAction(
  topText: string,
  bottomText: string,
  style: string,
  subject: string
) {
  try {
    const input: GenerateMemeImageInput = {
      topText,
      bottomText,
      style,
      subject,
    };
    const result = await generateMemeImage(input);
    return result;
  } catch (error: any) {
    console.error('Meme image generation failed:', error);
    throw new Error(
      error.message ||
        'An unknown error occurred during meme image generation.'
    );
  }
}
