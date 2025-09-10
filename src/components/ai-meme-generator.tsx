
'use client';

import { useState, useRef, useEffect } from 'react';
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

const styles = ['Photorealistic', 'Cartoon', 'Watercolor', 'Pixel Art', 'Anime'];
const subjects = ['Person', 'Man', 'Woman', 'Animal', 'Thing'];

// Set default fabric object properties for controls
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.cornerColor = 'white';
fabric.Object.prototype.cornerStrokeColor = 'black';
fabric.Object.prototype.borderColor = 'black';
fabric.Object.prototype.cornerSize = 12;

const createMemeText = (text: string, top: number, canvasWidth: number) => {
  return new fabric.Textbox(text, {
    fontFamily: 'Impact',
    fontSize: 30,
    fill: '#fff',
    stroke: '#000',
    strokeWidth: 2,
    textAlign: 'center',
    width: canvasWidth * 0.9,
    left: canvasWidth / 2,
    top: top,
    originX: 'center',
    lineHeight: 1.1,
  });
};

export function AiMemeGenerator({ onBack }: AiMemeGeneratorProps) {
  const [style, setStyle] = useState('Photorealistic');
  const [subject, setSubject] = useState('Person');
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (!generatedImageUrl || !canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      preserveObjectStacking: true,
    });
    fabricCanvasRef.current = canvas;

    fabric.Image.fromURL(generatedImageUrl, (img) => {
      const currentCanvas = fabricCanvasRef.current;
      if (!currentCanvas || !canvasRef.current?.parentElement) return;

      const parentEl = canvasRef.current.parentElement;
      const availableWidth = parentEl.clientWidth;
      
      const scale = availableWidth / (img.width || 1);
      const canvasHeight = (img.height || 1) * scale;
      const canvasWidth = availableWidth;
      
      currentCanvas.setDimensions({ width: canvasWidth, height: canvasHeight });
      img.set({
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });

      currentCanvas.setBackgroundImage(img, currentCanvas.renderAll.bind(currentCanvas));
      
      const topTextBox = createMemeText(topText, 10, canvasWidth);

      // Create a temp textbox to calculate the height for the bottom one
      const tempText = new fabric.Textbox(bottomText, {
        ...createMemeText(bottomText, 0, canvasWidth),
        visible: false
      });
      const bottomPosition = canvasHeight - (tempText.height || 0) - 10;
      const bottomTextBox = createMemeText(bottomText, bottomPosition, canvasWidth);


      currentCanvas.add(topTextBox, bottomTextBox);

    }, { crossOrigin: 'anonymous' });

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [generatedImageUrl]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const objects = canvas.getObjects('textbox') as fabric.Textbox[];
    if (objects.length < 2) return;
    const [top, bottom] = objects;
    if (top) top.set('text', topText);
    if (bottom) {
        bottom.set('text', bottomText);
        const canvasHeight = canvas.getHeight();
         // Recalculate position
        const tempText = new fabric.Textbox(bottomText, {
            ...bottom,
            visible: false
        });
        const bottomPosition = canvasHeight - (tempText.height || 0) - 10;
        bottom.set('top', bottomPosition);
    }
    canvas.renderAll();
  }, [topText, bottomText]);


  const handleGenerate = async () => {
    setIsGenerating(true);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }
    setGeneratedImageUrl(null);

    try {
      const result = await generateMemeImageAction(topText, bottomText, style, subject);
      if (!result.imageUrl) {
        throw new Error('AI did not return an image.');
      }
      setGeneratedImageUrl(result.imageUrl);
      toast({
          title: 'Image generated!',
          description: 'Your AI-powered meme background is ready. Add your text!',
      });
    } catch (error: any) {
      console.error(error);
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
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1.0 });
    const link = document.createElement('a');
    link.download = `ai-meme-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setGeneratedImageUrl(null);
    setIsGenerating(false);
    setTopText('');
    setBottomText('');
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-primary">
          AI Meme Generator
        </h1>
        <p className="max-w-2xl mx-auto mt-4 text-md sm:text-lg text-muted-foreground">
          Describe your meme, and our AI will generate a unique image for you. Then, add your own text.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot /> 1. Generate Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow flex flex-col">
            <div className="space-y-2">
              <Label htmlFor="top-text-context">Top Text (for AI context)</Label>
              <Input id="top-text-context" value={topText} onChange={(e) => setTopText(e.target.value)} placeholder="e.g., When you deploy on Friday" disabled={isGenerating} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bottom-text-context">Bottom Text (for AI context)</Label>
              <Input id="bottom-text-context" value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder="e.g., And everything works" disabled={isGenerating}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="style">Style</Label>
                 <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                   <SelectTrigger id="style"><SelectValue /></SelectTrigger>
                   <SelectContent>{styles.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label htmlFor="subject">Subject</Label>
                 <Select value={subject} onValueChange={setSubject} disabled={isGenerating}>
                   <SelectTrigger id="subject"><SelectValue/></SelectTrigger>
                   <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                 </Select>
               </div>
            </div>

            <div className="flex-grow" />

            <Button onClick={handleGenerate} disabled={isGenerating || (!topText && !bottomText)} size="lg" className="w-full">
              {isGenerating ? <LoaderCircle className="mr-2 animate-spin" /> : <WandSparkles className="mr-2" />}
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
             <CardTitle>2. View & Download</CardTitle>
           </CardHeader>
           <CardContent>
            {isGenerating ? (
                <div className="flex flex-col items-center justify-center gap-4 text-center h-64">
                    <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-lg font-semibold">Generating your image...</p>
                    <p className="text-sm text-muted-foreground">This can take up to 30 seconds.</p>
                </div>
            ) : generatedImageUrl ? (
                <div className="flex flex-col gap-6">
                    <div className="p-0 bg-black rounded-md">
                        <canvas ref={canvasRef} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Button onClick={handleReset} variant="secondary">
                        <RefreshCw className="mr-2" />
                        Start Over
                        </Button>
                        <Button onClick={handleDownload}>
                        <Download className="mr-2" />
                        Download
                        </Button>
                    </div>
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground bg-accent/30 rounded-md">
                    <p>Your generated meme will appear here.</p>
                </div>
            )}
           </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2" />
          Back to Gallery
        </Button>
      </div>
    </div>
  );
}
