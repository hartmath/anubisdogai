'use client';

import { useState } from 'react';
import { MemeEditor } from '@/components/meme-editor';
import { MemeTemplate } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LoaderCircle, WandSparkles, ArrowLeft, Bot } from 'lucide-react';
import { generateMemeImageAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';

interface AiMemeGeneratorProps {
  onBack: () => void;
}

export function AiMemeGenerator({ onBack }: AiMemeGeneratorProps) {
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState<MemeTemplate | null>(null);
  const { toast } = useToast();

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
    setGeneratedTemplate(null);

    try {
      const result = await generateMemeImageAction(topText, bottomText);
      const newTemplate: MemeTemplate = {
        id: `ai-meme-${Date.now()}`,
        name: 'AI Generated Meme',
        url: result.imageUrl,
        width: 1024,
        height: 1024,
        box_count: 2,
        initialTexts: [topText, bottomText],
      };
      setGeneratedTemplate(newTemplate);
      toast({
        title: 'Meme image generated!',
        description: 'You can now edit the text or download your meme.',
      });
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

  if (generatedTemplate) {
    return <MemeEditor template={generatedTemplate} onBack={onBack} />;
  }

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot /> AI Meme Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <LoaderCircle className="mr-2 animate-spin" />
                Generating Image...
              </>
            ) : (
              <>
                <WandSparkles className="mr-2" />
                Generate Meme Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      <div className="text-center">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2" />
          Back to Gallery
        </Button>
      </div>
    </div>
  );
}
