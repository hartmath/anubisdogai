
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { fabric } from 'fabric';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  LoaderCircle,
  WandSparkles,
  ArrowLeft,
  Bot,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateMemeImageAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';

interface AiMemeGeneratorProps {
  onBack: () => void;
}

const createMemeText = (
  text: string,
  top: number,
  canvasWidth: number
) => {
  return new fabric.Textbox(text, {
    fontFamily: 'Impact',
    fontSize: 40,
    fill: '#fff',
    stroke: '#000',
    strokeWidth: 2,
    textAlign: 'center',
    width: canvasWidth * 0.9,
    left: canvasWidth / 2,
    top: top,
    originX: 'center',
    lineHeight: 1.1,
    backgroundColor: 'transparent',
    selectable: false,
    evented: false,
  });
};


const styles = ['Photorealistic', 'Cartoon', 'Watercolor', 'Pixel Art', 'Anime'];
const subjects = ['Person', 'Man', 'Woman', 'Animal', 'Thing'];

export function AiMemeGenerator({ onBack }: AiMemeGeneratorProps) {
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [style, setStyle] = useState('Photorealistic');
  const [subject, setSubject] = useState('Person');
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalMemeUrl, setFinalMemeUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.StaticCanvas | null>(null);


  const handleGenerate = async () => {
    if (!topText && !bottomText) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter top or bottom text for the meme.',
      });
      return;
    }

    setIsGenerating(true);
    setFinalMemeUrl(null);
    
    // Dispose of the old canvas if it exists
    if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
    }

    try {
      const result = await generateMemeImageAction(topText, bottomText, style, subject);

      if (!canvasRef.current) {
          throw new Error('Canvas element not found.');
      }
      // Initialize a new canvas for each generation
      const canvas = new fabric.StaticCanvas(canvasRef.current);
      fabricCanvasRef.current = canvas;


      fabric.Image.fromURL(
        result.imageUrl,
        (img) => {
          if (!img.width || !img.height) return;
          
          canvas.setDimensions({ width: img.width, height: img.height });
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));

          if (topText) {
            const topTextBox = createMemeText(topText, 10, img.width);
            canvas.add(topTextBox);
          }

          if (bottomText) {
            const tempBox = new fabric.Textbox(bottomText, { fontSize: 40, width: img.width * 0.9, fontFamily: 'Impact', lineHeight: 1.1 });
            const boxHeight = tempBox.height || 60;
            const bottomPosition = img.height - boxHeight - 10;
            const bottomTextBox = createMemeText(bottomText, bottomPosition, img.width);
            canvas.add(bottomTextBox);
          }

          canvas.renderAll();

          const dataURL = canvas.toDataURL({ format: 'png', quality: 1.0 });
          setFinalMemeUrl(dataURL);

          toast({
            title: 'Meme generated!',
            description: 'Your AI-powered meme is ready to be shared.',
          });
        },
        { crossOrigin: 'anonymous' }
      );
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!finalMemeUrl) return;
    const link = document.createElement('a');
    link.download = `ai-meme-${Date.now()}.png`;
    link.href = finalMemeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setTopText('');
    setBottomText('');
    setFinalMemeUrl(null);
    setIsGenerating(false);
    if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-primary font-headline">
          AI Meme Generator
        </h1>
        <p className="max-w-2xl mx-auto mt-4 text-md sm:text-lg text-muted-foreground">
          Enter your meme text, and our AI will generate a fitting image for it.
        </p>
      </div>

      {!finalMemeUrl && !isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot /> AI Meme Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="style">Style</Label>
                 <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                   <SelectTrigger id="style">
                     <SelectValue placeholder="Select a style" />
                   </SelectTrigger>
                   <SelectContent>
                     {styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label htmlFor="subject">Subject</Label>
                 <Select value={subject} onValueChange={setSubject} disabled={isGenerating}>
                   <SelectTrigger id="subject">
                     <SelectValue placeholder="Select a subject" />
                   </SelectTrigger>
                   <SelectContent>
                     {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                   </SelectContent>
                 </Select>
               </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="top-text" className="text-lg">
                Top Text
              </Label>
              <Input
                id="top-text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder="e.g., Me thinking I know the code"
                className="text-base"
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bottom-text" className="text-lg">
                Bottom Text
              </Label>
              <Input
                id="bottom-text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                placeholder="e.g., The code knowing I don't"
                className="text-base"
                disabled={isGenerating}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
              className="w-full"
            >
              <WandSparkles className="mr-2" />
              Generate Meme
            </Button>
          </CardContent>
        </Card>
      )}

      {isGenerating && (
         <div className="flex flex-col items-center gap-4 text-center">
            <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg font-semibold">Generating your meme...</p>
            <p className="text-sm text-muted-foreground">This can take up to 30 seconds.</p>
        </div>
      )}

      {finalMemeUrl && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="p-4 bg-black">
              <Image
                src={finalMemeUrl}
                alt="Generated AI Meme"
                width={1024}
                height={1024}
                className="rounded-md w-full h-auto"
              />
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleReset} variant="secondary">
              <RefreshCw className="mr-2" />
              Create Another
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2" />
              Download Meme
            </Button>
          </div>
        </div>
      )}

      <div className="text-center">
        <canvas ref={canvasRef} className="hidden"></canvas>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2" />
          Back to Gallery
        </Button>
      </div>
    </div>
  );
}
