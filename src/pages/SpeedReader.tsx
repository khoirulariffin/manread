
import React, { useState, useRef, useEffect } from "react";
import FileUploader from "@/components/reader/FileUploader";
import TextProcessor from "@/components/reader/TextProcessor";
import SpeedControls from "@/components/reader/SpeedControls";
import ReaderDisplay from "@/components/reader/ReaderDisplay";
import ReadingStats from "@/components/reader/ReadingStats";

const SpeedReader = () => {
  const [text, setText] = useState<string>("");
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [wpm, setWpm] = useState<number>(300);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [fileType, setFileType] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Process extracted text from file upload
  const handleTextExtracted = (extractedText: string, type: string) => {
    setText(extractedText);
    setFileType(type);
    
    // Process the text into words
    const processedWords = extractedText
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .filter(word => word.length > 0);
    
    setWords(processedWords);
    setCurrentWordIndex(0);
    setProgress(0);
  };

  // Handle text processed from TextProcessor
  const handleTextProcessed = (processedWords: string[]) => {
    setWords(processedWords);
    setCurrentWordIndex(0);
    setProgress(0);
  };

  // Handle WPM change
  const handleWpmChange = (newWpm: number) => {
    setWpm(newWpm);
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
        {/* File Upload and Text Input */}
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-4">1. Upload or Enter Text</h2>
          <div className="space-y-4">
            <FileUploader onTextExtracted={handleTextExtracted} />
            <TextProcessor 
              text={text} 
              setText={setText}
              onTextProcessed={handleTextProcessed} 
            />
          </div>
        </div>

        {/* Speed Controls */}
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-4">2. Set Reading Speed</h2>
          <SpeedControls wpm={wpm} onWpmChange={handleWpmChange} />
        </div>

        {/* Reader Display */}
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-4">3. Speed Read</h2>
          <ReaderDisplay 
            words={words}
            currentWordIndex={currentWordIndex}
            progress={progress}
            isPlaying={isPlaying}
            onTogglePlayPause={togglePlayPause}
            onReset={handleReset}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-lg border p-4 mb-8">
        <ReadingStats 
          words={words}
          currentWordIndex={currentWordIndex}
          wpm={wpm}
        />
      </div>
    </div>
  );
};

export default SpeedReader;
