'use server';

import { generateAvatar } from "@/ai/flows/generate-avatar-flow";

export async function generateAvatarAction(photoDataUri: string) {
    try {
        const result = await generateAvatar({ photoDataUri });
        return result;
    } catch (error: any) {
        console.error("Avatar generation failed:", error);
        // Re-throw the original error message to show the real problem on the client.
        throw new Error(error.message || "An unknown error occurred during avatar generation.");
    }
}
