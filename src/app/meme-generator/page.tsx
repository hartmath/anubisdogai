'use client';

import { useState } from 'react';
import { MemeGallery } from '@/components/meme-gallery';
import { MemeEditor } from '@/components/meme-editor';
import { Header } from '@/components/header';
import templates from '@/lib/meme-templates.json';
import { MemeTemplate } from '@/lib/types';

export default function MemeGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);

  const handleSelectTemplate = (template: MemeTemplate) => {
    setSelectedTemplate(template);
  };

  const handleBackToGallery = () => {
    setSelectedTemplate(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-7xl mx-auto">
          {!selectedTemplate ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-primary font-headline">
                  Meme Generator
                </h1>
                <p className="max-w-2xl mx-auto mt-4 text-md sm:text-lg text-muted-foreground">
                  Select a template to get started.
                </p>
              </div>
              <MemeGallery templates={templates} onSelectTemplate={handleSelectTemplate} />
            </>
          ) : (
            <MemeEditor template={selectedTemplate} onBack={handleBackToGallery} />
          )}
        </div>
      </main>
    </div>
  );
}
