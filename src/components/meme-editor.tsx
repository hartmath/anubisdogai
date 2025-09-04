'use client';

import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { MemeTemplate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { Slider } from './ui/slider';

interface MemeEditorProps {
  template: MemeTemplate;
  onBack: () => void;
}

const createMemeText = (text: string, top: number, canvasWidth: number) => {
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
    // Custom properties
    cornerColor: 'white',
    cornerStrokeColor: 'black',
    transparentCorners: false,
    cornerSize: 12,
  });
};

export function MemeEditor({ template, onBack }: MemeEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [topText, setTopText] = useState('Top Text');
  const [bottomText, setBottomText] = useState('Bottom Text');
  const [fontSize, setFontSize] = useState(40);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      preserveObjectStacking: true,
    });
    fabricCanvasRef.current = canvas;

    fabric.Image.fromURL(template.url, (img) => {
      const canvasWidth = canvasRef.current?.parentElement?.clientWidth || 600;
      const scale = canvasWidth / img.width!;
      const canvasHeight = img.height! * scale;

      canvas.setDimensions({ width: canvasWidth, height: canvasHeight });
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });

      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      
      const topTextBox = createMemeText(topText, 10, canvasWidth);
      const bottomTextBox = createMemeText(bottomText, canvasHeight - 60, canvasWidth);
      
      canvas.add(topTextBox);
      canvas.add(bottomTextBox);
      canvas.setActiveObject(topTextBox);

    }, { crossOrigin: 'anonymous' });

    const handleResize = () => {
        const parentWidth = canvasRef.current?.parentElement?.clientWidth;
        if(fabricCanvasRef.current && parentWidth) {
            const currentBg = fabricCanvasRef.current.getBackgroundImage() as fabric.Image;
            if(currentBg) {
                const scale = parentWidth / (currentBg.width || 1);
                const newHeight = (currentBg.height || 1) * scale;
                fabricCanvasRef.current.setDimensions({ width: parentWidth, height: newHeight });
                currentBg.set({ scaleX: scale, scaleY: scale });
                fabricCanvasRef.current.forEachObject(obj => {
                  if (obj instanceof fabric.Textbox) {
                    obj.set({ width: parentWidth * 0.9, left: parentWidth / 2 });
                    obj.setCoords();
                  }
                });
                fabricCanvasRef.current.renderAll();
            }
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvasRef.current?.dispose();
    };
  }, [template.url]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const top = canvas.getObjects('textbox')[0] as fabric.Textbox;
    if (top) {
      top.set('text', topText);
      canvas.renderAll();
    }
  }, [topText]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const bottom = canvas.getObjects('textbox')[1] as fabric.Textbox;
    if (bottom) {
      bottom.set('text', bottomText);
      canvas.renderAll();
    }
  }, [bottomText]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (activeObject instanceof fabric.Textbox) {
        activeObject.set('fontSize', fontSize);
        canvas?.renderAll();
    }
  }, [fontSize]);

  const handleDownload = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    // Deselect any active object to hide controls
    canvas.discardActiveObject();
    canvas.renderAll();

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
    });
    const link = document.createElement('a');
    link.download = `${template.name.replace(/ /g, '_')}-meme.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setTopText('Top Text');
    setBottomText('Bottom Text');
    setFontSize(40);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const top = canvas.getObjects('textbox')[0] as fabric.Textbox;
    const bottom = canvas.getObjects('textbox')[1] as fabric.Textbox;

    const canvasHeight = canvas.getHeight();

    if(top) {
        top.set({ text: 'Top Text', top: 10, fontSize: 40 });
    }
    if(bottom) {
        bottom.set({ text: 'Bottom Text', top: canvasHeight - 60, fontSize: 40 });
    }
    canvas.renderAll();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex justify-center items-start">
        <canvas ref={canvasRef} className="rounded-lg shadow-lg border border-border" />
      </div>

      <div className="flex flex-col gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Meme Editor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="top-text">Top Text</Label>
                    <Input id="top-text" value={topText} onChange={(e) => setTopText(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bottom-text">Bottom Text</Label>
                    <Input id="bottom-text" value={bottomText} onChange={(e) => setBottomText(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
                    <Slider
                        id="font-size"
                        min={10}
                        max={100}
                        step={1}
                        value={[fontSize]}
                        onValueChange={(value) => setFontSize(value[0])}
                    />
                </div>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 gap-4">
             <Button onClick={onBack} variant="outline">
                <ArrowLeft className="mr-2" />
                Back to Gallery
            </Button>
             <Button onClick={handleReset} variant="secondary">
                <RefreshCw className="mr-2" />
                Reset
            </Button>
            <Button onClick={handleDownload} className="col-span-2 text-lg py-6">
                <Download className="mr-2" />
                Download Meme
            </Button>
        </div>
      </div>
    </div>
  );
}
