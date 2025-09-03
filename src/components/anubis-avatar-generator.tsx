
"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
    Upload,
    Download,
    AlertTriangle,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import Draggable from 'react-draggable';


import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB
const MAX_IMAGE_DIMENSION = 1024; // 1024px


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

                // Start with high quality, and reduce if the size is still too large
                let quality = 0.9;
                let dataUrl = canvas.toDataURL("image/jpeg", quality);

                while (dataUrl.length > MAX_IMAGE_SIZE_BYTES && quality > 0.3) {
                    quality -= 0.1;
                    dataUrl = canvas.toDataURL("image/jpeg", quality);
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
    const [crownImage, setCrownImage] = useState<string | null>('/helmet.png');
    const [error, setError] = useState<string | null>(null);
    const [crownPosition, setCrownPosition] = useState({ x: 0, y: 0 });
    
    const originalImageRef = useRef<HTMLImageElement>(null);
    const finalImageContainerRef = useRef<HTMLDivElement>(null);


    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setError(null);
            setGeneratedImage(null);
            try {
                // Resize if the file is larger than our max dimension or a rough byte estimate
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

    const handleDownload = async () => {
        if (!originalImage || !crownImage || !finalImageContainerRef.current) return;
    
        const canvas = document.createElement('canvas');
        const originalImg = new window.Image();
        originalImg.src = originalImage;
    
        originalImg.onload = () => {
            const crownImg = new window.Image();
            crownImg.src = crownImage;
    
            crownImg.onload = () => {
                const container = finalImageContainerRef.current!;
                const containerRect = container.getBoundingClientRect();

                // Set canvas to the size of the original image
                canvas.width = originalImg.naturalWidth;
                canvas.height = originalImg.naturalHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                // Draw the original image
                ctx.drawImage(originalImg, 0, 0);

                // Calculate scale factors
                const scaleX = originalImg.naturalWidth / containerRect.width;
                const scaleY = originalImg.naturalHeight / containerRect.height;
                
                // Calculate crown dimensions and position on the canvas
                const crownWidthOnCanvas = (containerRect.width / 2) * scaleX;
                const crownHeightOnCanvas = crownWidthOnCanvas; // Maintain aspect ratio
                const crownXOnCanvas = (containerRect.width / 4 + crownPosition.x) * scaleX;
                const crownYOnCanvas = (containerRect.height / 4 + crownPosition.y) * scaleY;
                
                // Draw the crown image
                ctx.drawImage(crownImg, crownXOnCanvas, crownYOnCanvas, crownWidthOnCanvas, crownHeightOnCanvas);

                // Draw watermark
                const watermark = new window.Image();
                watermark.src = '/logo.png';
                watermark.onload = () => {
                  const watermarkSize = canvas.width * 0.15;
                  const margin = canvas.width * 0.04;
                  ctx.globalAlpha = 0.5;
                  ctx.drawImage(watermark, canvas.width - watermarkSize - margin, canvas.height - watermarkSize - margin, watermarkSize, watermarkSize);
                  ctx.globalAlpha = 1.0;

                  // Trigger download
                  const finalImage = canvas.toDataURL('image/png');
                  setGeneratedImage(finalImage); // So user sees the final merged image
                  const link = document.createElement("a");
                  link.href = finalImage;
                  const randomNumber = Math.floor(Math.random() * 10000);
                  link.download = `$ANOS_${randomNumber}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
            };
        };
    };

    const handleReset = () => {
        setOriginalImage(null);
        setGeneratedImage(null);
        setError(null);
        setCrownPosition({ x: 0, y: 0 });
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-12">
            {/* Header section */}
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-primary font-headline">
                    Transform Your Profile Picture
                </h1>
                <p className="max-w-2xl mx-auto mt-4 text-md sm:text-lg text-muted-foreground">
                    Upload your photo, position the headdress, and download your new avatar.
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
                    <AlertTitle>Error</AlertTitle>
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
                                ref={originalImageRef}
                                src={originalImage}
                                alt="Original user photo"
                                fill
                                className="object-cover"
                            />
                        </Card>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                         <h2 className="text-2xl font-bold text-center font-headline">Avatar</h2>
                         <Card ref={finalImageContainerRef} className="w-full aspect-square relative overflow-hidden bg-card/50">
                             {originalImage && crownImage && (
                                <>
                                    <Image src={originalImage} alt="User photo background" fill className="object-cover"/>
                                    <Draggable
                                      bounds="parent"
                                      position={crownPosition}
                                      onStop={(e, data) => setCrownPosition({ x: data.x, y: data.y })}
                                    >
                                        <div className="w-1/2 h-1/2 absolute top-1/4 left-1/4 cursor-move z-10">
                                            <Image
                                                src={crownImage}
                                                alt="Pharaoh Headdress"
                                                fill
                                                className="object-contain pointer-events-none"
                                            />
                                        </div>
                                    </Draggable>
                                 </>
                             )}
                            {generatedImage &&  <Image src={generatedImage} alt="Final generated image" fill className="object-cover z-30"/>}

                         </Card>
                     </div>
                </div>
            )}

            {/* Controls */}
            {originalImage && (
                 <Card className="w-full max-w-xl">
                 <CardContent className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-6">
                     <Button
                         onClick={handleDownload}
                         size="lg"
                         className="w-full sm:w-auto px-10 py-6 text-lg"
                     >
                         <Download className="mr-2 h-5 w-5" />
                         Download Avatar
                     </Button>
                     <Button onClick={handleReset} variant="outline" size="lg" className="w-full sm:w-auto px-10 py-6 text-lg">
                         Start Over
                     </Button>
                 </CardContent>
             </Card>
            )}
        </div>
    );
}
