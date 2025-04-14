
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { Play, Pause, RotateCcw, Upload, FileText, Book, Image } from "lucide-react";
import * as PDFJS from 'pdfjs-dist';
import * as Tesseract from 'tesseract.js';
import { Book as EPub } from 'epubjs';

// Set PDF.js worker path (required for PDF processing)
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const SpeedReader = () => {
  const [text, setText] = useState<string>("");
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(300);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [fileType, setFileType] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Process text into words
  const processText = (inputText: string) => {
    // Remove extra whitespace and split by spaces
    const processedWords = inputText
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .filter(word => word.length > 0);
    
    setWords(processedWords);
    setCurrentWordIndex(0);
    setProgress(0);
  };

  // Extract text from PDF file
  const extractPdfText = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFJS.getDocument({data: arrayBuffer}).promise;
      let extractedText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        extractedText += pageText + ' ';
      }
      
      return extractedText;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      toast({
        title: "Error processing PDF",
        description: "Could not extract text from the PDF file.",
        variant: "destructive"
      });
      return '';
    }
  };

  // Extract text from EPUB file
  const extractEpubText = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const book = new EPub();
      await book.open(arrayBuffer);
      
      let extractedText = '';
      
      // Process each chapter/section
      if (book.spine) {
        const items = book.spine.items as any[]; // Cast to any[] to access items
        for (let i = 0; i < items.length; i++) {
          const section = items[i];
          if (section && section.href) {
            const content = await book.load(section.href);
            // Check if content exists and has text
            if (content && typeof content === 'string') {
              extractedText += content + ' ';
            } else if (content && typeof content === 'object') {
              // Try to extract text from content object
              const text = typeof content.textContent === 'string' 
                ? content.textContent 
                : '';
              extractedText += text + ' ';
            }
          }
        }
      }
      
      return extractedText;
    } catch (error) {
      console.error('Error extracting EPUB text:', error);
      toast({
        title: "Error processing EPUB",
        description: "Could not extract text from the EPUB file.",
        variant: "destructive"
      });
      return '';
    }
  };

  // Extract text from image using OCR
  const extractImageText = async (file: File): Promise<string> => {
    try {
      const { data } = await Tesseract.recognize(
        file,
        'eng',
        { 
          logger: (info: any) => {
            if (info.status === 'recognizing text') {
              // Optional: Update progress if needed
            }
          }
        }
      );
      
      return data.text || '';
    } catch (error) {
      console.error('Error extracting image text:', error);
      toast({
        title: "Error processing image",
        description: "Could not extract text from the image file.",
        variant: "destructive"
      });
      return '';
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    let extractedText = '';
    
    try {
      // Determine file type and extract text accordingly
      if (file.type === "application/pdf") {
        setFileType("pdf");
        toast({
          title: "Processing PDF",
          description: "Extracting text from PDF..."
        });
        extractedText = await extractPdfText(file);
      } else if (file.type === "application/epub+zip" || file.name.endsWith('.epub')) {
        setFileType("epub");
        toast({
          title: "Processing EPUB",
          description: "Extracting text from EPUB..."
        });
        extractedText = await extractEpubText(file);
      } else if (file.type.startsWith("image/")) {
        setFileType("image");
        toast({
          title: "Processing Image",
          description: "Performing OCR on image..."
        });
        extractedText = await extractImageText(file);
      } else if (file.type === "text/plain") {
        setFileType("text");
        const reader = new FileReader();
        extractedText = await new Promise((resolve) => {
          reader.onload = (event) => {
            resolve(event.target?.result as string || '');
          };
          reader.readAsText(file);
        });
      } else {
        toast({
          title: "Unsupported file format",
          description: "Please upload a PDF, EPUB, image, or text file.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      if (extractedText) {
        setText(extractedText);
        processText(extractedText);
        toast({
          title: "File processed successfully",
          description: `${file.name} has been loaded.`
        });
      } else {
        toast({
          title: "Empty content",
          description: "No text could be extracted from the file.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error processing file",
        description: "An error occurred while processing the file.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle text change in textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    processText(newText);
  };

  // Handle WPM change
  const handleWpmChange = (values: number[]) => {
    setWpm(values[0]);
  };

  // Handle Play/Pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle Reset
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentWordIndex(0);
    setProgress(0);
  };

  // Update speed reading based on WPM
  useEffect(() => {
    if (isPlaying && words.length > 0) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Calculate delay in milliseconds based on WPM
      const delay = Math.floor(60000 / wpm);

      // Set new interval
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);

      // Cleanup function
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isPlaying, wpm, words.length]);

  // Update progress
  useEffect(() => {
    if (words.length > 0) {
      setProgress((currentWordIndex / (words.length - 1)) * 100);
    }
  }, [currentWordIndex, words.length]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Speed Reader</h1>

      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* File Upload */}
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-4">1. Upload or Enter Text</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file" className="mb-2 block">Upload File (PDF, EPUB, Image, or Text)</Label>
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.epub,.txt,image/*"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                  disabled={isProcessing}
                />
                {isProcessing && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Processing...</span>
                  </div>
                )}
              </div>
              <div className="mt-2 flex gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <FileText size={14} /> PDF
                </div>
                <div className="flex items-center gap-1">
                  <Book size={14} /> EPUB
                </div>
                <div className="flex items-center gap-1">
                  <Image size={14} /> Image
                </div>
                <div className="flex items-center gap-1">
                  <FileText size={14} /> Text
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="text" className="mb-2 block">Or Enter/Edit Text</Label>
              <textarea
                id="text"
                value={text}
                onChange={handleTextChange}
                className="w-full min-h-[150px] p-3 border rounded-md"
                placeholder="Paste or type your text here..."
              />
            </div>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-4">2. Set Reading Speed</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <Label htmlFor="wpm">Reading Speed (WPM)</Label>
                <span className="font-medium">{wpm} WPM</span>
              </div>
              <Slider 
                id="wpm"
                value={[wpm]} 
                min={100} 
                max={1000} 
                step={10} 
                onValueChange={handleWpmChange}
              />
            </div>
          </div>
        </div>

        {/* Reader Display */}
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-4">3. Speed Read</h2>
          
          {/* Word Display */}
          <div className="h-32 flex items-center justify-center mb-4 text-5xl font-bold">
            {words.length > 0 ? words[currentWordIndex] : "Ready"}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={togglePlayPause}
              variant={isPlaying ? "outline" : "default"}
              size="lg"
              disabled={words.length === 0}
            >
              {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isPlaying ? "Pause" : "Start"}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              disabled={words.length === 0 || currentWordIndex === 0}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-lg border p-4 mb-8">
        <h2 className="text-xl font-semibold mb-2">Reading Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-2 rounded-md bg-gray-100">
            <p className="text-sm text-gray-500">Words</p>
            <p className="text-xl font-medium">{words.length}</p>
          </div>
          <div className="text-center p-2 rounded-md bg-gray-100">
            <p className="text-sm text-gray-500">Current Position</p>
            <p className="text-xl font-medium">
              {words.length > 0 ? currentWordIndex + 1 : 0}/{words.length}
            </p>
          </div>
          <div className="text-center p-2 rounded-md bg-gray-100">
            <p className="text-sm text-gray-500">Time Remaining</p>
            <p className="text-xl font-medium">
              {words.length > 0 
                ? Math.ceil((words.length - currentWordIndex - 1) / wpm) 
                : 0} min
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedReader;
