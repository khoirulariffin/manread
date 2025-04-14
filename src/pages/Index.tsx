
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
        Speed Reading App
      </h1>
      <p className="text-lg text-center text-gray-600 max-w-2xl mb-8">
        Improve your reading speed and comprehension with our simple and effective speed reading tool.
        Upload text or paste your content and begin training your reading skills today.
      </p>
      <Button asChild size="lg" className="gap-2">
        <Link to="/speed-reader">
          <BookOpen className="w-5 h-5" />
          Start Speed Reading
        </Link>
      </Button>
    </div>
  );
};

export default Index;
