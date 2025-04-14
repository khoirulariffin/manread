
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface SpeedControlsProps {
  wpm: number;
  onWpmChange: (wpm: number) => void;
}

const SpeedControls: React.FC<SpeedControlsProps> = ({ wpm, onWpmChange }) => {
  // Handle WPM change
  const handleWpmChange = (values: number[]) => {
    onWpmChange(values[0]);
  };

  return (
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
  );
};

export default SpeedControls;
