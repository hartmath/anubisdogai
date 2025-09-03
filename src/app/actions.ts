'use server';

import { generateAvatar } from "@/ai/flows/generate-avatar-flow";

export async function generateAvatarAction(photoDataUri: string) {
    try {
        const result = await generateAvatar({ photoDataUri });
        return result;
    } catch (error) {
        console.error("Avatar generation failed:", error);
        throw new Error("Avatar generation failed. Please try again.");
    }
}
