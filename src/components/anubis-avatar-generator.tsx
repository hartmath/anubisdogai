"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
    Upload,
    Download,
    Loader2,
    AlertTriangle,
    WandSparkles,
} from "lucide-react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateAvatar } from "@/app/actions";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STYLES = [
    "Neon Glow",
    "Dark Gold",
    "Cyberpunk Blue",
    "Cosmic Purple",
];

export function AnubisAvatarGenerator() {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [selectedStyle, setSelectedStyle] = useState("Dark Gold");

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setOriginalImage(e.target?.result as string);
                setGeneratedImage(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
        maxSize: 10 * 1024 * 1024, // 10MB
    });

    const handleGenerate = async () => {
        if (!originalImage) return;
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setProgress(0);

        const generationInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) {
                    clearInterval(generationInterval);
                    return prev;
                }
                return prev + 1;
            });
        }, 200);

        const result = await generateAvatar(originalImage, true);
        clearInterval(generationInterval);
        setProgress(100);

        if (result.error) {
            setError(result.error);
        } else if (result.imageUrl) {
            setGeneratedImage(result.imageUrl);
        }
        setIsLoading(false);
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement("a");
        link.href = generatedImage;
        const randomNumber = Math.floor(Math.random() * 10000);
        link.download = `$ANOS_${randomNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReset = () => {
        setOriginalImage(null);
        setGeneratedImage(null);
        setIsLoading(false);
        setError(null);
        setProgress(0);
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-12">
            {/* Header section */}
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-primary font-headline">
                    Transform Your Profile Picture
                </h1>
                <p className="max-w-2xl mt-4 text-md sm:text-lg text-muted-foreground">
                    Upload your photo, choose a style, and let our AI create a stunning
                    new avatar for you, inspired by ancient Egypt.
                </p>
            </div>

            {/* Upload Dropzone */}
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

            {error && (
                <Alert variant="destructive" className="w-full max-w-2xl">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Generation Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Image Display */}
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
                        <h2 className="text-2xl font-bold text-center font-headline">Generated</h2>
                        <Card className="w-full aspect-square relative overflow-hidden bg-card/50">
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 text-white z-10">
                                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                    <p className="font-bold text-lg">Generating...</p>
                                    <Progress value={progress} className="w-3/4" />
                                </div>
                            )}
                            {generatedImage ? (
                                <>
                                    <Image
                                        src={generatedImage}
                                        alt="Generated Anubis Avatar"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4/5">
                                        <Button onClick={handleDownload} size="lg" className="w-full">
                                            <Download className="mr-2 h-5 w-5" />
                                            Download (PNG)
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                !isLoading && (
                                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                                        <Image src="/headdress.png" alt="Headdress placeholder" width={256} height={256} className="opacity-10"/>
                                    </div>
                                )
                            )}
                        </Card>
                    </div>
                </div>
            )}

            {/* Generation Controls */}
            {originalImage && (
                <div className="flex flex-col items-center gap-8 w-full max-w-xl">
                    <div className="text-center">
                        <h3 className="text-3xl font-bold font-headline">Generate Your Avatar</h3>
                        <p className="text-muted-foreground mt-2">
                            Select a preset, then click generate to create your masterpiece.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                        {STYLES.map((style) => (
                            <Button
                                key={style}
                                variant={selectedStyle === style ? "default" : "secondary"}
                                onClick={() => setSelectedStyle(style)}
                                className={cn(
                                    "h-20 text-lg font-bold transition-all duration-300",
                                    selectedStyle === style
                                        ? "border-2 border-primary-foreground"
                                        : "border-2 border-transparent"
                                )}
                            >
                                {style}
                            </Button>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <Button
                            onClick={handleGenerate}
                            size="lg"
                            className="px-10 py-6 text-lg"
                            disabled={isLoading}
                        >
                            <WandSparkles className="mr-2 h-5 w-5" />
                            Generate
                        </Button>
                        <Button onClick={handleReset} variant="outline" size="lg" className="px-10 py-6 text-lg">
                            Start Over
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
