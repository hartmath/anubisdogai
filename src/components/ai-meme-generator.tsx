'use client';

import { useState } from 'react';
import { MemeEditor } from '@/components/meme-editor';
import { MemeTemplate } from '@/lib/types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LoaderCircle, WandSparkles, ArrowLeft, Bot } from 'lucide-react';
import { generateMemeTextAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Label } from './ui/label';

interface AiMemeGeneratorProps {
  template: MemeTemplate;
  onEditManually: (template: MemeTemplate) => void;
  onBack: () => void;
}

export function AiMemeGenerator({ template, onEditManually, onBack }: AiMemeGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTexts, setGeneratedTexts] = useState<string[] | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a topic for the meme.',
      });
      return;
    }
    
    setIsGenerating(true);
    setGeneratedTexts(null);

    try {
      const result = await generateMemeTextAction(template.name, topic);
      setGeneratedTexts(result.texts);
      toast({
        title: 'Meme text generated!',
        description: 'You can now edit the text manually.',
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

  if (generatedTexts) {
    const templateWithAiText = {
        ...template,
        initialTexts: generatedTexts
    }
    return <MemeEditor template={templateWithAiText} onBack={onBack} />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
        <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-primary font-headline">AI Meme Generator</h1>
            <p className="max-w-2xl mx-auto mt-4 text-md sm:text-lg text-muted-foreground">
                Describe a situation or topic, and our AI will generate the text for the Anubis meme.
            </p>
        </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot /> AI Meme Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic" className="text-lg">What's the meme about?</Label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., When you buy the crypto dip, but it keeps dipping..."
              className="mt-2 min-h-[100px] text-base"
            />
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="w-full">
            {isGenerating ? (
              <>
                <LoaderCircle className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <WandSparkles className="mr-2" />
                Generate Meme Text
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
