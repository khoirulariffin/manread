
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { Play, Pause, RotateCcw, Upload } from "lucide-react";

const SpeedReader = () => {
  const [text, setText] = useState<string>("");
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(300);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  
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

  // Handle text file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only accept text files for now
    if (file.type !== "text/plain") {
      toast({
        title: "Unsupported file format",
        description: "Currently only supporting .txt files",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
      processText(content);
      toast({
        title: "File loaded successfully",
        description: `${file.name} has been processed.`,
      });
    };
    reader.readAsText(file);
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
              <Label htmlFor="file" className="mb-2 block">Upload Text File (.txt)</Label>
              <Input
                id="file"
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
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
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={togglePlayPause}
              variant={isPlaying ? "outline" : "default"}
              size="lg"
            >
              {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isPlaying ? "Pause" : "Start"}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
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
            <p className="text-xl font-medium">{words.length > 0 ? currentWordIndex + 1 : 0}/{words.length}</p>
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
