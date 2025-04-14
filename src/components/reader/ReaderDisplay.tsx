
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface ReaderDisplayProps {
  words: string[];
  currentWordIndex: number;
  progress: number;
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  onReset: () => void;
}

const ReaderDisplay: React.FC<ReaderDisplayProps> = ({
  words,
  currentWordIndex,
  progress,
  isPlaying,
  onTogglePlayPause,
  onReset
}) => {
  return (
    <div>
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
          onClick={onTogglePlayPause}
          variant={isPlaying ? "outline" : "default"}
          size="lg"
          disabled={words.length === 0}
        >
          {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
          {isPlaying ? "Pause" : "Start"}
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          size="lg"
          disabled={words.length === 0 || currentWordIndex === 0}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default ReaderDisplay;
