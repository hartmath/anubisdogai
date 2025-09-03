
"use server";

import { aiStylizeAvatar } from "@/ai/flows/ai-stylize-avatar";

export async function generateAvatar(
  photoDataUri: string,
  shouldStylize: boolean
): Promise<{ imageUrl?: string; error?: string }> {
  if (!photoDataUri) {
    return { error: "No photo provided." };
  }

  try {
    const result = await aiStylizeAvatar({ photoDataUri, shouldStylize });

    return { imageUrl: result.stylizedAvatarDataUri };

  } catch (e) {
    console.error(e);
    let errorMessage = "An unknown error occurred during avatar generation.";
    if (e instanceof Error) {
        if (e.message.includes('503') && e.message.includes('overloaded')) {
            errorMessage = "The AI is currently experiencing high demand. Please wait a moment and try again.";
        } else {
            errorMessage = e.message;
        }
    }
    
    return {
      error: `Avatar generation failed. ${errorMessage}`,
    };
  }
}
