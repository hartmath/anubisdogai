
'use server';

import { aiGenerateCrown } from "@/ai/flows/ai-generate-crown";

export async function generateCrown(
  style: string,
): Promise<{ imageUrl?: string; error?: string }> {

  try {
    const result = await aiGenerateCrown({ style });

    return { imageUrl: result.crownDataUri };

  } catch (e) {
    console.error(e);
    let errorMessage = "An unknown error occurred during crown generation.";
    if (e instanceof Error) {
        if (e.message.includes('503') && e.message.includes('overloaded')) {
            errorMessage = "The AI is currently experiencing high demand. Please wait a moment and try again.";
        } else {
            errorMessage = e.message;
        }
    }
    
    return {
      error: `Crown generation failed. ${errorMessage}`,
    };
  }
}
