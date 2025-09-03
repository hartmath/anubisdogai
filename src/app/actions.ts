
"use server";

import { aiStylizeAvatar } from "@/ai/flows/ai-stylize-avatar";
import type { AIStylizeAvatarInput } from "@/ai/flows/ai-stylize-avatar";

export async function generateAvatar(
  photoDataUri: string,
  shouldStylize: boolean
): Promise<{ imageUrl?: string; error?: string }> {
  if (!photoDataUri) {
    return { error: "No photo provided." };
  }

  try {
    const input: AIStylizeAvatarInput = {
      photoDataUri,
      shouldStylize,
    };

    const result = await aiStylizeAvatar(input);

    if (!result.stylizedAvatarDataUri) {
      throw new Error("The AI model did not return an image.");
    }

    return { imageUrl: result.stylizedAvatarDataUri };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error
        ? e.message
        : "An unknown error occurred during avatar generation.";
    return {
      error: `Avatar generation failed. ${errorMessage}`,
    };
  }
}
