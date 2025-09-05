'use client';

import { useState, useEffect } from 'react';
import { MemeGallery } from '@/components/meme-gallery';
import { MemeEditor } from '@/components/meme-editor';
import { Header } from '@/components/header';
import { getMemesAction } from '@/app/actions';
import type { MemeTemplate } from '@/lib/types';
import { LoaderCircle } from 'lucide-react';

export default function MemeGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemes() {
      try {
        const memes = await getMemesAction();
        setTemplates(memes);
      } catch (error) {
        console.error("Failed to load memes:", error);
        // Handle error, maybe show a toast
      } finally {
        setLoading(false);
      }
    }
    fetchMemes();
  }, []);

  const handleSelectTemplate = (template: MemeTemplate) => {
    setSelectedTemplate(template);
  };

  const handleBackToGallery = () => {
    setSelectedTemplate(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow flex flex-col items-center p-4 sm:p-8">
        <div className="w-full max-w-7xl mx-auto">
          {!selectedTemplate ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-primary font-headline">
                  Meme Generator
                </h1>
                <p className="max-w-2xl mx-auto mt-4 text-md sm:text-lg text-muted-foreground">
                  Choose your favourite meme
                </p>
              </div>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
                </div>
              ) : (
                <MemeGallery templates={templates} onSelectTemplate={handleSelectTemplate} />
              )}
            </>
          ) : (
            <MemeEditor template={selectedTemplate} onBack={handleBackToGallery} />
          )}
        </div>
      </main>
    </div>
  );
}
