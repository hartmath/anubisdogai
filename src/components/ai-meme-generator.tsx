
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
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

export function AiMemeGenerator({ onBack }: AiMemeGeneratorProps) {
  const [style, setStyle] = useState('Photorealistic');
  const [subject, setSubject] = useState('Person');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      // The AI still uses the text for context, so we pass empty strings.
      const result = await generateMemeImageAction('', '', style, subject);
      
      if (!result.imageUrl) {
        throw new Error('AI did not return an image.');
      }
      
      setGeneratedImageUrl(result.imageUrl);
        
      toast({
          title: 'Image generated!',
          description: 'Your AI-powered meme background is ready.',
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
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.download = `ai-meme-image-${Date.now()}.png`;
    link.href = generatedImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setGeneratedImageUrl(null);
    setIsGenerating(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-primary font-headline">
          AI Image Generator
        </h1>
        <p className="max-w-2xl mx-auto mt-4 text-md sm:text-lg text-muted-foreground">
          Our AI will generate a unique image for you.
        </p>
      </div>

      {!generatedImageUrl && !isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot /> AI Image Generation
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

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
              className="w-full"
            >
              <WandSparkles className="mr-2" />
              Generate Image
            </Button>
          </CardContent>
        </Card>
      )}

      {isGenerating && (
         <div className="flex flex-col items-center gap-4 text-center">
            <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg font-semibold">Generating your image...</p>
            <p className="text-sm text-muted-foreground">This can take up to 30 seconds.</p>
        </div>
      )}

      {generatedImageUrl && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="p-4 bg-black">
              <Image
                src={generatedImageUrl}
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
              Download Image
            </Button>
          </div>
        </div>
      )}

      <div className="text-center">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2" />
          Back to Gallery
        </Button>
      </div>
    </div>
  );
}
