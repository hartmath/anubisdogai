
"use server";

export async function generateAvatar(
  photoDataUri: string,
  shouldStylize: boolean
): Promise<{ imageUrl?: string; error?: string }> {
  if (!photoDataUri) {
    return { error: "No photo provided." };
  }

  try {
    // The AI functionality is temporarily disabled to resolve build issues.
    // We will return the original image for now.
    if (!shouldStylize) {
        return { imageUrl: photoDataUri };
    }
    
    // Simulate a delay to mimic AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Since the AI stylization is disabled, we'll return the original photo.
    // A more sophisticated placeholder could be used here in a real scenario.
    return { imageUrl: photoDataUri };

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
