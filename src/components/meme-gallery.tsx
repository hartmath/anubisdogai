'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { MemeTemplate } from '@/lib/types';

interface MemeGalleryProps {
  templates: MemeTemplate[];
  onSelectTemplate: (template: MemeTemplate) => void;
}

export function MemeGallery({ templates, onSelectTemplate }: MemeGalleryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          className="cursor-pointer hover:border-primary transition-colors group"
          onClick={() => onSelectTemplate(template)}
        >
          <CardContent className="p-0 relative" style={{ paddingTop: '100%' }}>
            <Image
              src={template.url}
              alt={template.name}
              fill
              className="object-contain rounded-lg"
              data-ai-hint={template.name.toLowerCase().split(' ').slice(0, 2).join(' ')}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <p className="text-white text-center font-bold p-2">{template.name}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
