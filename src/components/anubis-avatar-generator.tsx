"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Upload, WandSparkles, Download, Loader2, AlertTriangle, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateAvatar } from "@/app/actions";
import { Progress } from "@/components/ui/progress";

const BRAND_WATERMARK = "Anubis Dog AI";

export function AnubisAvatarGenerator() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadstart = () => {
        setIsLoading(true);
        setProgress(0);
      };
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 50);
          setProgress(percent);
        }
      };
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setGeneratedImage(null);
        setFinalImage(null);
        setError(null);
        setProgress(50);
        handleGenerate(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxSize: 4 * 1024 * 1024, // 4MB
  });

  const handleGenerate = async (imageData: string) => {
    if (!imageData) return;
    setIsLoading(true);
    setError(null);
    setProgress(50);

    const generationInterval = setInterval(() => {
        setProgress((prev) => {
            if (prev >= 95) {
                clearInterval(generationInterval);
                return prev;
            }
            return prev + 1;
        });
    }, 200);


    const result = await generateAvatar(imageData, true);
    clearInterval(generationInterval);
    setProgress(100);


    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result.imageUrl) {
      setGeneratedImage(result.imageUrl);
    }
  };

  useEffect(() => {
    if (!generatedImage || !canvasRef.current) {
        if (generatedImage === null && !isLoading) {
            setProgress(0);
        }
        return;
    };

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = generatedImage;

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      // Add watermark
      const fontSize = Math.max(16, canvas.width / 35);
      ctx.font = `bold ${fontSize}px "Space Grotesk", sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 5;
      ctx.fillText(BRAND_WATERMARK, canvas.width / 2, canvas.height - fontSize * 1.2);

      setFinalImage(canvas.toDataURL("image/png"));
      setIsLoading(false);
    };

    img.onerror = () => {
      setError(
        "Failed to load generated image for watermarking. You can still download the image."
      );
      setFinalImage(generatedImage);
      setIsLoading(false);
    };
  }, [generatedImage, isLoading]);

  const handleDownload = () => {
    if (!finalImage) return;
    const link = document.createElement("a");
    link.href = finalImage;
    const randomNumber = Math.floor(Math.random() * 10000);
    link.download = `$ANOS_${randomNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleReset = () => {
      setOriginalImage(null);
      setGeneratedImage(null);
      setFinalImage(null);
      setIsLoading(false);
      setError(null);
      setProgress(0);
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Generation Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!finalImage && !isLoading && (
        <div
          {...getRootProps()}
          className={`w-full aspect-video rounded-lg border-2 border-dashed border-primary/50 flex flex-col items-center justify-center text-center p-8 cursor-pointer transition-colors ${
            isDragActive ? "bg-primary/10" : "hover:bg-primary/5"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-primary mb-4" />
          <p className="font-bold text-lg text-primary-foreground">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-muted-foreground">PNG, JPG, WEBP (Max. 4MB)</p>
        </div>
      )}
      
      {(isLoading || finalImage) && (
          <Card className="w-full aspect-video relative overflow-hidden bg-card/50">
              {finalImage && <Image src={finalImage} alt="Generated Anubis Avatar" fill className="object-cover"/>}
              {isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4 text-white">
                      <Loader2 className="w-12 h-12 animate-spin text-primary"/>
                      <p className="font-bold text-lg">Generating your avatar...</p>
                      <Progress value={progress} className="w-3/4"/>
                  </div>
              )}
          </Card>
      )}

      {finalImage && !isLoading && (
        <div className="flex gap-4 justify-center">
          <Button onClick={handleReset} variant="outline" size="lg">
            <X className="mr-2 h-5 w-5" />
            Create New
          </Button>
          <Button onClick={handleDownload} size="lg">
            <Download className="mr-2 h-5 w-5" />
            Download
          </Button>
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
