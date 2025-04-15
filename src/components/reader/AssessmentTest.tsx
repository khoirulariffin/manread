
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
      // Generate Indonesian questions based on the text
      const generatedQuestions = generateIndonesianQuestions(text);
      setQuestions(generatedQuestions);
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Gagal membuat pertanyaan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const generateIndonesianQuestions = (text: string): Question[] => {
    // Simplified question generation in Indonesian
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10).slice(0, 15);
    
    if (sentences.length < 3) {
      return [
        {
          id: 1,
          text: "Apakah teks ini bermanfaat untuk dibaca?",
          options: ["Ya, sangat bermanfaat", "Cukup bermanfaat", "Tidak terlalu bermanfaat", "Sama sekali tidak bermanfaat"],
          correctAnswer: 0
        },
        {
          id: 2,
          text: "Apakah Anda akan merekomendasikan teks ini kepada orang lain?",
          options: ["Pasti", "Mungkin", "Mungkin tidak", "Pasti tidak"],
          correctAnswer: 0
        },
        {
          id: 3,
          text: "Seberapa baik Anda memahami teks ini?",
          options: ["Sepenuhnya", "Sebagian besar", "Sebagian", "Tidak sama sekali"],
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
          
          // Create a clearer Indonesian question
          let questionText = `Apa yang disebutkan dalam teks terkait dengan "${keyWord}"?`;
          
          // Alternative question formats for variety
          const questionFormats = [
            `Apa yang disebutkan dalam teks terkait dengan "${keyWord}"?`,
            `Berdasarkan teks, informasi apa yang benar tentang "${keyWord}"?`,
            `Menurut bacaan, apa yang dijelaskan tentang "${keyWord}"?`,
            `Dalam teks tersebut, bagaimana "${keyWord}" dijelaskan?`,
            `Pernyataan mana yang sesuai dengan informasi tentang "${keyWord}" dalam teks?`
          ];
          
          questionText = questionFormats[Math.floor(Math.random() * questionFormats.length)];
          
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
            const genericOptions = [
              `Opsi yang tidak berkaitan dengan ${keyWord}`,
              `${keyWord} tidak disebutkan dalam teks`,
              `Informasi tentang ${keyWord} tidak ada dalam bacaan`,
              `${keyWord} memiliki arti yang berbeda dalam konteks lain`
            ];
            incorrectOptions.push(genericOptions[Math.floor(Math.random() * genericOptions.length)]);
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
    
    // If we couldn't generate enough questions, add some generic ones in Indonesian
    while (randomQuestions.length < 5) {
      const genericQuestions = [
        {
          text: `Apa tema utama dari teks ini?`,
          options: ["Tema A", "Tema B", "Tema C", "Tema D"],
          correctAnswer: 0
        },
        {
          text: `Berdasarkan teks, kesimpulan apa yang dapat diambil?`,
          options: ["Kesimpulan A", "Kesimpulan B", "Kesimpulan C", "Kesimpulan D"],
          correctAnswer: 0
        },
        {
          text: `Apa tujuan penulis dalam menyusun teks ini?`,
          options: ["Tujuan A", "Tujuan B", "Tujuan C", "Tujuan D"],
          correctAnswer: 0
        },
        {
          text: `Bagaimana pemahaman Anda tentang teks ini?`,
          options: ["Sangat baik", "Cukup baik", "Kurang baik", "Tidak paham"],
          correctAnswer: 0
        }
      ];
      
      const genericQuestion = genericQuestions[randomQuestions.length % genericQuestions.length];
      randomQuestions.push({
        id: randomQuestions.length + 1,
        ...genericQuestion
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
    
    toast.success(`Tes selesai! Skor Anda: ${finalScore}%`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-lg">Sedang membuat pertanyaan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tes Pemahaman Bacaan</h2>
        {submitted && (
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Award className="text-yellow-500 h-6 w-6" />
            Skor: {score}%
          </div>
        )}
      </div>
      
      <div className="space-y-8">
        {questions.map((question) => (
          <div key={question.id} className="border rounded-lg p-4 bg-background">
            <div className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-lg font-medium">Pertanyaan {question.id}:</h3>
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
            Kirim Jawaban
          </Button>
        ) : (
          <div className="space-x-4">
            <Button onClick={onRestart}>Mulai Bacaan Baru</Button>
            <Button onClick={onComplete} variant="outline">Kembali ke Pembaca</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentTest;
