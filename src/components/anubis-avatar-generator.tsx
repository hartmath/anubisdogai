"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, WandSparkles, Download, Loader2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateAvatar } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const BRAND_WATERMARK = "Anubis Avatar Alchemist";

export function AnubisAvatarGenerator() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldStylize, setShouldStylize] = useState(true);
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setGeneratedImage(null);
        setFinalImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = async () => {
    if (!originalImage) return;
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setFinalImage(null);

    const result = await generateAvatar(originalImage, shouldStylize);

    if (result.error) {
      setError(result.error);
    } else if (result.imageUrl) {
      setGeneratedImage(result.imageUrl);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (!generatedImage || !canvasRef.current) return;

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
      ctx.fillStyle = "rgba(212, 175, 55, 0.7)";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 5;
      ctx.fillText(BRAND_WATERMARK, canvas.width / 2, canvas.height - (fontSize * 1.2));
      
      setFinalImage(canvas.toDataURL("image/png"));
    };
    
    img.onerror = () => {
        setError("Failed to load generated image for watermarking. It might be a cross-origin issue. You can still download the unwatermarked image.");
        setFinalImage(generatedImage); 
    }

  }, [generatedImage]);

  const handleDownload = () => {
    if (!finalImage) {
        toast({
            title: "No Image to Download",
            description: "Please generate an avatar first.",
            variant: "destructive",
        });
        return;
    };
    const link = document.createElement("a");
    link.href = finalImage;
    link.download = "anubis-avatar.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <ImageDisplayCard
          title="Your Photo"
          imageSrc={originalImage}
          onUploadClick={triggerFileUpload}
          isLoading={false}
          isUpload
        />
        <ImageDisplayCard
          title="Anubis Avatar"
          imageSrc={finalImage || generatedImage}
          isLoading={isLoading}
        />
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
        <CardContent className="p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setShouldStylize(!shouldStylize)}>
            <Switch
              id="stylize-switch"
              checked={shouldStylize}
              onCheckedChange={setShouldStylize}
              aria-label="Toggle AI Stylization"
            />
            <Label htmlFor="stylize-switch" className="flex flex-col cursor-pointer">
              <span className="font-bold text-base text-primary-foreground">AI Style Transfer</span>
              <span className="text-sm text-muted-foreground">Enhance the avatar with a futuristic Anubis aesthetic</span>
            </Label>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Button onClick={handleGenerate} disabled={!originalImage || isLoading} size="lg" className="w-full sm:w-auto font-bold text-base shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow">
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <WandSparkles className="mr-2 h-5 w-5" />}
              Generate
            </Button>
            <Button onClick={handleDownload} disabled={!finalImage || isLoading} size="lg" variant="outline" className="w-full sm:w-auto text-base">
              <Download className="mr-2 h-5 w-5" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Generation Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function ImageDisplayCard({ title, imageSrc, onUploadClick, isLoading, isUpload = false }: {
  title: string;
  imageSrc: string | null;
  onUploadClick?: () => void;
  isLoading: boolean;
  isUpload?: boolean;
}) {
  return (
    <Card className="aspect-square w-full flex flex-col items-center justify-center relative overflow-hidden bg-transparent border-2 border-dashed border-muted-foreground/30 transition-all duration-300 hover:border-primary/50 group">
        <div className="w-full h-full flex flex-col items-center justify-center">
            {isLoading ? (
                <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <p className="font-headline text-lg">Conjuring your avatar...</p>
                </div>
            ) : imageSrc ? (
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    className="object-cover"
                />
            ) : isUpload ? (
                <button
                    onClick={onUploadClick}
                    className="flex flex-col items-center gap-4 text-muted-foreground hover:text-primary transition-colors duration-300 w-full h-full justify-center"
                    aria-label="Upload a photo"
                >
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-muted-foreground/10 group-hover:bg-primary/10 border-2 border-dashed border-muted-foreground/50 group-hover:border-primary transition-all">
                        <Upload className="h-10 w-10" />
                    </div>
                    <span className="font-bold text-lg">Upload Photo</span>
                    <span className="text-sm max-w-xs text-center">Click to select a profile picture to transform</span>
                </button>
            ) : (
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-muted-foreground/10 border-2 border-dashed border-muted-foreground/50">
                        <WandSparkles className="h-10 w-10" />
                    </div>
                    <p className="font-headline text-lg">Your divine avatar will appear here</p>
                </div>
            )}
        </div>
    </Card>
  )
}
