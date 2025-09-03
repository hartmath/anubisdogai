"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
    Upload,
    Download,
    AlertTriangle,
    WandSparkles,
    LoaderCircle
} from "lucide-react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { generateAvatarAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB
const MAX_IMAGE_DIMENSION = 1024; // 1024px

const styles = [
    { name: "Neon Glow" },
    { name: "Dark Gold" },
    { name: "Cyberpunk Blue" },
    { name: "Cosmic Purple" },
];

// Helper function to resize images
const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.createElement("img");
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let { width, height } = img;

                if (width > height) {
                    if (width > MAX_IMAGE_DIMENSION) {
                        height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
                        width = MAX_IMAGE_DIMENSION;
                    }
                } else {
                    if (height > MAX_IMAGE_DIMENSION) {
                        width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
                        height = MAX_IMAGE_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    return reject(new Error("Could not get canvas context"));
                }
                ctx.drawImage(img, 0, 0, width, height);
                
                let dataUrl = canvas.toDataURL("image/jpeg", 0.9);

                // Reduce quality if size is still too large
                if (dataUrl.length > MAX_IMAGE_SIZE_BYTES) {
                     dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                }
                
                resolve(dataUrl);
            };
            img.onerror = reject;
            img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


export function AnubisAvatarGenerator() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState("Cosmic Purple");
    
    const { toast } = useToast();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            handleReset();
            try {
                 if (file.size > MAX_IMAGE_SIZE_BYTES / 2 || file.type !== 'image/jpeg') {
                    const resizedDataUrl = await resizeImage(file);
                    setOriginalImage(resizedDataUrl);
                } else {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setOriginalImage(e.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                }
            } catch (err) {
                console.error("Image processing error:", err);
                setError("There was a problem processing your image. Please try another one.");
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
        maxSize: 10 * 1024 * 1024, // 10MB limit on the dropzone itself
    });

    const handleGeneration = async () => {
        if (!originalImage) return;

        setIsGenerating(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const result = await generateAvatarAction(originalImage, selectedStyle);
            if (result.photoDataUri) {
                setGeneratedImage(result.photoDataUri);
                 toast({
                    title: "Avatar Generated!",
                    description: "Your Anubis avatar is ready.",
                });
            } else {
                throw new Error("AI did not return an image.");
            }
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message || "An unknown error occurred.";
            setError(`Generation Failed: ${errorMessage}`);
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: errorMessage,
            });
        } finally {
            setIsGenerating(false);
        }
    };


    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement("a");
        link.href = generatedImage;
        const randomNumber = Math.floor(Math.random() * 10000);
        link.download = `$ANOS_AVATAR_${randomNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReset = () => {
        setOriginalImage(null);
        setGeneratedImage(null);
        setError(null);
        setIsGenerating(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-12">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-primary font-headline">
                    Anubis Avatar Alchemist
                </h1>
                <p className="max-w-2xl mx-auto mt-4 text-md sm:text-lg text-muted-foreground">
                   Upload your photo and our AI will bestow upon you the headdress of Anubis.
                </p>
            </div>

            {!originalImage && (
                <div
                    {...getRootProps()}
                    className={cn(
                        "w-full max-w-md h-48 rounded-lg border-2 border-dashed border-primary/50 flex flex-col items-center justify-center text-center p-8 cursor-pointer transition-colors",
                        isDragActive ? "bg-primary/10" : "hover:bg-primary/5"
                    )}
                >
                    <input {...getInputProps()} />
                    <Upload className="w-10 h-10 text-primary mb-4" />
                    <p className="font-bold text-lg text-primary-foreground">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                        PNG, JPG, WEBP (Max. 10MB)
                    </p>
                </div>
            )}
            
            {originalImage && (
                 <div className="w-full max-w-xl text-center">
                    <h2 className="text-2xl font-bold font-headline mb-4">Select a Style</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {styles.map((style) => (
                            <button
                                key={style.name}
                                onClick={() => setSelectedStyle(style.name)}
                                className={cn(
                                    "p-4 rounded-lg text-center font-semibold transition-all duration-200 aspect-square flex items-center justify-center",
                                    "border-2",
                                    selectedStyle === style.name
                                        ? "bg-primary/20 border-primary text-primary-foreground"
                                        : "bg-card hover:bg-accent border-border"
                                )}
                            >
                                {style.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {error && (
                <Alert variant="destructive" className="w-full max-w-2xl">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {originalImage && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <div className="flex flex-col items-center gap-2">
                        <h2 className="text-2xl font-bold text-center font-headline">Original</h2>
                        <Card className="w-full aspect-square relative overflow-hidden bg-card/50">
                            <Image
                                src={originalImage}
                                alt="Original user photo"
                                fill
                                className="object-cover"
                            />
                        </Card>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                         <h2 className="text-2xl font-bold text-center font-headline">Avatar</h2>
                         <Card className="w-full aspect-square relative overflow-hidden bg-card/50 flex items-center justify-center">
                             {generatedImage ? (
                                <Image src={generatedImage} alt="Final generated image" fill className="object-cover z-10"/>
                             ): (
                                <div className="text-center text-muted-foreground">
                                    {isGenerating ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
                                            <p>Generating your avatar...</p>
                                            <Progress value={50} className="w-3/4 animate-pulse" />
                                        </div>
                                    ) : (
                                       <div className="flex flex-col items-center gap-2">
                                            <WandSparkles className="w-12 h-12" />
                                            <p>Your avatar will appear here.</p>
                                        </div>
                                    )}
                                </div>
                             )}
                         </Card>
                     </div>
                </div>
            )}

            {originalImage && (
                 <Card className="w-full max-w-xl">
                 <CardContent className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-6">
                    {!generatedImage ? (
                        <Button
                            onClick={handleGeneration}
                            disabled={isGenerating}
                            size="lg"
                            className="w-full sm:w-auto px-10 py-6 text-lg"
                        >
                            {isGenerating ? (
                                <>
                                    <LoaderCircle className="mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <WandSparkles className="mr-2" />
                                    Generate Avatar
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleDownload}
                            size="lg"
                            className="w-full sm:w-auto px-10 py-6 text-lg"
                        >
                            <Download className="mr-2 h-5 w-5" />
                            Download Avatar
                        </Button>
                    )}
                     <Button onClick={handleReset} variant="outline" size="lg" className="w-full sm:w-auto px-10 py-6 text-lg">
                         Start Over
                     </Button>
                 </CardContent>
             </Card>
            )}
        </div>
    );
}
