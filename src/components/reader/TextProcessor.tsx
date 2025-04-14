
import React from "react";
import { Label } from "@/components/ui/label";

interface TextProcessorProps {
  text: string;
  setText: (text: string) => void;
  onTextProcessed: (words: string[]) => void;
}

const TextProcessor: React.FC<TextProcessorProps> = ({ 
  text, 
  setText, 
  onTextProcessed 
}) => {
  // Process text into words
  const processText = (inputText: string) => {
    // Remove extra whitespace and split by spaces
    const processedWords = inputText
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .filter(word => word.length > 0);
    
    onTextProcessed(processedWords);
  };

  // Handle text change in textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    processText(newText);
  };

  return (
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
  );
};

export default TextProcessor;
