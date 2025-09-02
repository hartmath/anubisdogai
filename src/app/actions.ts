
"use server";

import { aiStylizeAvatar } from "@/ai/flows/ai-stylize-avatar";
import type { AIStylizeAvatarInput } from "@/ai/flows/ai-stylize-avatar";

// A placeholder for the headdress data URI, as it's required by the flow's type signature.
// This is a 1x1 transparent PNG.
const HEADDRESS_PLACEHOLDER_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

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
      headdressDataUri: HEADDRESS_PLACEHOLDER_DATA_URI,
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
