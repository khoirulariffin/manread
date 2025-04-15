
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, X, Award } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface AssessmentTestProps {
  text: string;
  onComplete: () => void;
  onRestart: () => void;
}

const AssessmentTest: React.FC<AssessmentTestProps> = ({ text, onComplete, onRestart }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  React.useEffect(() => {
    generateQuestions();
  }, [text]);

  const generateQuestions = async () => {
    setLoading(true);
    try {
      // For demo purposes, generate simple questions based on the text
      // In a real application, this would be replaced with an API call to an AI service
      const sampleQuestions = generateSampleQuestions(text);
      setQuestions(sampleQuestions);
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateSampleQuestions = (text: string): Question[] => {
    // Simplified question generation for demonstration
    // Extract some sentences from the text
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10).slice(0, 15);
    
    if (sentences.length < 3) {
      return [
        {
          id: 1,
          text: "Was this text useful to read?",
          options: ["Yes, very useful", "Somewhat useful", "Not very useful", "Not at all useful"],
          correctAnswer: 0
        },
        {
          id: 2,
          text: "Would you recommend this text to others?",
          options: ["Definitely", "Probably", "Probably not", "Definitely not"],
          correctAnswer: 0
        },
        {
          id: 3,
          text: "How well did you understand the text?",
          options: ["Completely", "Mostly", "Somewhat", "Not at all"],
          correctAnswer: 0
        }
      ];
    }
    
    // Create 5 questions based on random sentences
    const randomQuestions: Question[] = [];
    
    for (let i = 0; i < Math.min(5, sentences.length); i++) {
      const sentenceIndex = Math.floor(Math.random() * sentences.length);
      const sentence = sentences[sentenceIndex];
      sentences.splice(sentenceIndex, 1); // Remove used sentence
      
      if (sentence && sentence.trim().length > 15) {
        // Create a question by finding a key word and asking about it
        const words = sentence.trim().split(' ').filter(w => w.length > 4);
        
        if (words.length > 0) {
          const keyWord = words[Math.floor(Math.random() * words.length)];
          const questionText = `Which of the following is mentioned in relation to "${keyWord}"?`;
          
          // Create options (1 correct, 3 incorrect)
          const correctOption = sentence.trim();
          const otherSentences = text.split(/[.!?]/).filter(s => 
            s.trim().length > 10 && 
            !s.includes(keyWord) && 
            s !== sentence
          );
          
          const incorrectOptions = [];
          for (let j = 0; j < Math.min(3, otherSentences.length); j++) {
            const randomIndex = Math.floor(Math.random() * otherSentences.length);
            incorrectOptions.push(otherSentences[randomIndex].trim());
            otherSentences.splice(randomIndex, 1);
          }
          
          // If we don't have enough incorrect options, add some generic ones
          while (incorrectOptions.length < 3) {
            incorrectOptions.push(`Option not related to ${keyWord}`);
          }
          
          // Shuffle options
          const allOptions = [correctOption, ...incorrectOptions];
          const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
          const correctAnswerIndex = shuffledOptions.indexOf(correctOption);
          
          randomQuestions.push({
            id: i + 1,
            text: questionText,
            options: shuffledOptions,
            correctAnswer: correctAnswerIndex
          });
        }
      }
    }
    
    // If we couldn't generate enough questions, add some generic ones
    while (randomQuestions.length < 5) {
      randomQuestions.push({
        id: randomQuestions.length + 1,
        text: `What is your understanding of the text? (Question ${randomQuestions.length + 1})`,
        options: ["Complete understanding", "Partial understanding", "Limited understanding", "No understanding"],
        correctAnswer: 0
      });
    }
    
    return randomQuestions;
  };

  const handleAnswerChange = (questionId: number, optionIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleSubmit = () => {
    // Calculate score
    let correctCount = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);
    
    toast.success(`Assessment completed! Your score: ${finalScore}%`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-lg">Generating questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reading Comprehension Assessment</h2>
        {submitted && (
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Award className="text-yellow-500 h-6 w-6" />
            Score: {score}%
          </div>
        )}
      </div>
      
      <div className="space-y-8">
        {questions.map((question) => (
          <div key={question.id} className="border rounded-lg p-4 bg-background">
            <div className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-lg font-medium">Question {question.id}:</h3>
                {submitted && (
                  <div>
                    {answers[question.id] === question.correctAnswer ? (
                      <Check className="text-green-500 h-5 w-5" />
                    ) : (
                      <X className="text-red-500 h-5 w-5" />
                    )}
                  </div>
                )}
              </div>
              <p>{question.text}</p>
              <RadioGroup 
                value={answers[question.id]?.toString()} 
                onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                disabled={submitted}
              >
                {question.options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start space-x-2 p-2 rounded ${
                      submitted && index === question.correctAnswer 
                        ? 'bg-green-100 dark:bg-green-900/20' 
                        : submitted && answers[question.id] === index && index !== question.correctAnswer 
                          ? 'bg-red-100 dark:bg-red-900/20' 
                          : ''
                    }`}
                  >
                    <RadioGroupItem value={index.toString()} id={`q${question.id}-option${index}`} />
                    <Label 
                      htmlFor={`q${question.id}-option${index}`}
                      className={`font-normal ${
                        submitted && index === question.correctAnswer 
                          ? 'text-green-700 dark:text-green-300' 
                          : submitted && answers[question.id] === index && index !== question.correctAnswer 
                            ? 'text-red-700 dark:text-red-300' 
                            : ''
                      }`}
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        {!submitted ? (
          <Button 
            onClick={handleSubmit} 
            disabled={Object.keys(answers).length < questions.length}
          >
            Submit Answers
          </Button>
        ) : (
          <div className="space-x-4">
            <Button onClick={onRestart}>Start New Reading</Button>
            <Button onClick={onComplete} variant="outline">Return to Reader</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentTest;
