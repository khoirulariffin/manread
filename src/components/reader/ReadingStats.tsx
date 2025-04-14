
import React from "react";

interface ReadingStatsProps {
  words: string[];
  currentWordIndex: number;
  wpm: number;
}

const ReadingStats: React.FC<ReadingStatsProps> = ({
  words,
  currentWordIndex,
  wpm
}) => {
  return (
    <div>
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
  );
};

export default ReadingStats;
