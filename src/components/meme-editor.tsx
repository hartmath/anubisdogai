
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

// Set default fabric object properties for controls
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.cornerColor = 'white';
fabric.Object.prototype.cornerStrokeColor = 'black';
fabric.Object.prototype.borderColor = 'black';
fabric.Object.prototype.cornerSize = 12;

const createMemeText = (text: string, top: number, canvasWidth: number, customOptions = {}) => {
  const isFourPanel = customOptions.isFourPanel;
  return new fabric.Textbox(text, {
    fontFamily: 'Impact',
    fontSize: 40,
    fill: '#fff',
    stroke: '#000',
    strokeWidth: 2,
    textAlign: 'center',
    width: isFourPanel ? canvasWidth * 0.45 : canvasWidth * 0.9,
    left: isFourPanel ? canvasWidth * 0.25 : canvasWidth / 2,
    top: top,
    originX: 'center',
    lineHeight: 1.1,
    ...customOptions
  });
};

export function MemeEditor({ template, onBack }: MemeEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  const isFourPanelMeme = template.id === 'expanding-brain';

  const [textInputs, setTextInputs] = useState<string[]>(Array(isFourPanelMeme ? 4 : 2).fill(''));
  const [fontSize, setFontSize] = useState(40);
  const [activeInput, setActiveInput] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      preserveObjectStacking: true,
    });
    fabricCanvasRef.current = canvas;

    fabric.Image.fromURL(template.url, (img) => {
      const currentCanvas = fabricCanvasRef.current;
      if (!currentCanvas || !canvasRef.current?.parentElement) return;

      const canvasWidth = canvasRef.current.parentElement.clientWidth;
      const scale = canvasWidth / img.width!;
      const canvasHeight = img.height! * scale;

      currentCanvas.setDimensions({ width: canvasWidth, height: canvasHeight });
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });

      currentCanvas.setBackgroundImage(img, currentCanvas.renderAll.bind(currentCanvas));
      
      if (isFourPanelMeme) {
          const panelHeight = canvasHeight / 4;
          for (let i = 0; i < 4; i++) {
              const textBox = createMemeText('', panelHeight * i + (panelHeight/2) - 20, canvasWidth, { isFourPanel: true });
              currentCanvas.add(textBox);
          }
      } else {
          const topTextBox = createMemeText('', 10, canvasWidth);
          const bottomTextBox = createMemeText('', canvasHeight - 60, canvasWidth);
          currentCanvas.add(topTextBox);
          currentCanvas.add(bottomTextBox);
      }
      
      if (currentCanvas.getObjects().length > 0) {
        currentCanvas.setActiveObject(currentCanvas.getObjects()[0]);
      }


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
                    const widthMultiplier = isFourPanelMeme ? 0.45 : 0.9;
                    const leftPosition = isFourPanelMeme ? parentWidth * 0.25 : parentWidth / 2;
                    obj.set({ width: parentWidth * widthMultiplier, left: leftPosition });
                    obj.setCoords();
                  }
                });
                fabricCanvasRef.current.renderAll();
            }
        }
    };

    const handleObjectSelected = (e: fabric.IEvent) => {
        if (!e.target) return;
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const objects = canvas.getObjects('textbox');
        const selectedIndex = objects.indexOf(e.target as fabric.Textbox);
        if (selectedIndex !== -1) {
            setActiveInput(selectedIndex);
        }

        canvas.bringToFront(e.target);
        if (e.target instanceof fabric.Textbox) {
            setFontSize(e.target.fontSize || 40);
        }
    };

    canvas.on('selection:created', handleObjectSelected);
    canvas.on('selection:updated', handleObjectSelected);
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.off('selection:created', handleObjectSelected);
        fabricCanvasRef.current.off('selection:updated', handleObjectSelected);
        fabricCanvasRef.current.dispose();
      }
    };
  }, [template.url, isFourPanelMeme]);


  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const objects = canvas.getObjects('textbox');
    textInputs.forEach((text, index) => {
        if(objects[index]) {
            const textbox = objects[index] as fabric.Textbox;
            if (textbox.text !== text) {
                textbox.set('text', text);
            }
        }
    });
    canvas.renderAll();
  }, [textInputs]);


  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (activeObject instanceof fabric.Textbox) {
        activeObject.set('fontSize', fontSize);
        canvas?.renderAll();
    }
  }, [fontSize]);

  const handleTextChange = (index: number, value: string) => {
    const newTextInputs = [...textInputs];
    newTextInputs[index] = value;
    setTextInputs(newTextInputs);
  };

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
    setTextInputs(Array(isFourPanelMeme ? 4 : 2).fill(''));
    setFontSize(40);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects('textbox');
    objects.forEach(obj => {
        (obj as fabric.Textbox).set({ text: '', fontSize: 40 });
    });

    if (isFourPanelMeme) {
        const canvasHeight = canvas.getHeight();
        const panelHeight = canvasHeight / 4;
        objects.forEach((obj, i) => {
            (obj as fabric.Textbox).set({ top: panelHeight * i + (panelHeight/2) - 20 });
        });
    } else if (objects.length > 1) {
        const canvasHeight = canvas.getHeight();
        (objects[0] as fabric.Textbox).set({ top: 10 });
        (objects[1] as fabric.Textbox).set({ top: canvasHeight - 60 });
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
                {textInputs.map((text, index) => (
                    <div className="space-y-2" key={index}>
                        <Label htmlFor={`text-input-${index}`}>
                            {isFourPanelMeme ? `Panel ${index + 1} Text` : (index === 0 ? 'Top Text' : 'Bottom Text')}
                        </Label>
                        <Input 
                            id={`text-input-${index}`} 
                            value={text} 
                            onChange={(e) => handleTextChange(index, e.target.value)} 
                            onFocus={() => {
                                const canvas = fabricCanvasRef.current;
                                if(canvas) {
                                    const objects = canvas.getObjects('textbox');
                                    if(objects[index]) {
                                        canvas.setActiveObject(objects[index]);
                                        canvas.renderAll();
                                    }
                                }
                            }}
                            placeholder={`Add text for ${isFourPanelMeme ? `panel ${index + 1}` : (index === 0 ? 'top' : 'bottom')}...`}
                        />
                    </div>
                ))}

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
