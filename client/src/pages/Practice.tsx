import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  ArrowLeft, Volume2, CheckCircle, XCircle, Lightbulb, MessageCircle,
  Zap, Clock, Target, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type ExerciseType = "type_the_word" | "fill_in_blank" | "audio_to_text" | "multiple_choice";

interface Word {
  id: number;
  word: string;
  definition: string | null;
  exampleSentence: string | null;
  pronunciation: string | null;
  category: string | null;
  gradeLevel: number | null;
  difficulty: number | null;
  commonMistakes?: any;
  createdAt?: Date;
}

export default function Practice() {
  const { user } = useAuth();
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [exerciseType, setExerciseType] = useState<ExerciseType>("type_the_word");
  const [userAnswer, setUserAnswer] = useState("");
  const [confidence, setConfidence] = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

  const { data: nextWords, isLoading: loadingWords } = trpc.practice.getNextWords.useQuery({ limit: 10 });
  const recordAttemptMutation = trpc.practice.recordAttempt.useMutation();
  const generateHintMutation = trpc.practice.generateHint.useMutation();
  const generateExplanationMutation = trpc.practice.generateExplanation.useMutation();

  // Load first word
  useEffect(() => {
    if (nextWords && nextWords.length > 0 && !currentWord) {
      setCurrentWord(nextWords[0]);
      setStartTime(Date.now());
    }
  }, [nextWords, currentWord]);

  const handleGetHint = async () => {
    if (!currentWord) return;
    try {
      const result = await generateHintMutation.mutateAsync({ word: currentWord.word });
      const hintText = typeof result.hint === 'string' ? result.hint : 'Try breaking the word into smaller parts!';
      setHint(hintText);
      toast.info("Hint revealed!");
    } catch (error) {
      toast.error("Failed to generate hint");
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentWord || !userAnswer.trim()) {
      toast.error("Please enter an answer");
      return;
    }

    const correct = userAnswer.toLowerCase().trim() === currentWord.word.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);

    const responseTime = Date.now() - startTime;

    // Generate explanation
    if (!correct) {
      try {
        const result = await generateExplanationMutation.mutateAsync({
          word: currentWord.word,
          userAnswer,
        });
        const explanationText = typeof result.explanation === 'string' ? result.explanation : "Keep practicing! You're doing great.";
        setExplanation(explanationText);
      } catch (error) {
        setExplanation("Keep practicing! You're doing great.");
      }
    }

    // Record attempt
    try {
      await recordAttemptMutation.mutateAsync({
        exerciseId: currentWord.id,
        wordId: currentWord.id,
        userAnswer,
        isCorrect: correct,
        responseTime,
        confidence,
      });

      setSessionStats({
        correct: sessionStats.correct + (correct ? 1 : 0),
        total: sessionStats.total + 1,
      });

      toast.success(correct ? "Correct! 🎉" : "Incorrect, but you'll get it next time!");
    } catch (error) {
      toast.error("Failed to record attempt");
    }
  };

  const handleNextWord = () => {
    if (!nextWords) return;

    const currentIndex = nextWords.findIndex(w => w.id === currentWord?.id);
    const nextIndex = (currentIndex + 1) % nextWords.length;

    setCurrentWord(nextWords[nextIndex]);
    setUserAnswer("");
    setShowFeedback(false);
    setHint(null);
    setExplanation(null);
    setStartTime(Date.now());
  };

  if (!user) {
    return <div>Redirecting...</div>;
  }

  if (loadingWords || !currentWord) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-12" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const exerciseTypes: { type: ExerciseType; label: string; description: string }[] = [
    { type: "type_the_word", label: "Type the Word", description: "Spell the word from the definition" },
    { type: "fill_in_blank", label: "Fill in the Blank", description: "Complete the sentence" },
    { type: "audio_to_text", label: "Audio to Text", description: "Listen and spell" },
    { type: "multiple_choice", label: "Multiple Choice", description: "Select the correct spelling" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      {/* Header */}
      <div className="bg-card border-b border-muted sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span>{sessionStats.correct}/{sessionStats.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-xp-color" />
              <span>+{sessionStats.correct * 20} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Exercise Type Selector */}
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground mb-3">Exercise Type</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {exerciseTypes.map((et) => (
              <button
                key={et.type}
                onClick={() => setExerciseType(et.type)}
                className={`p-3 rounded-lg border transition-all text-sm font-medium ${
                  exerciseType === et.type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                {et.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Card */}
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8 mb-6">
            {/* Word Display */}
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground mb-2">Word #{sessionStats.total + 1}</p>
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="text-5xl font-bold text-gradient">?</span>
              </div>
              <p className="text-lg text-muted-foreground mb-4">{currentWord.definition}</p>
              {currentWord.exampleSentence && (
                <p className="text-sm italic text-muted-foreground bg-background p-4 rounded-lg">
                  "{currentWord.exampleSentence}"
                </p>
              )}
            </div>

            {/* Difficulty and Category */}
            <div className="flex items-center justify-center gap-4 mb-8 text-sm">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                {currentWord.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary">
                Grade {currentWord.gradeLevel}
              </span>
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent">
                Difficulty: {currentWord.difficulty}/10
              </span>
            </div>

            {/* Audio Button */}
            <div className="flex justify-center mb-8">
              <Button variant="outline" size="lg" className="gap-2">
                <Volume2 className="w-5 h-5" />
                Hear Pronunciation
              </Button>
            </div>

            {/* Answer Input */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Your Answer</label>
              <Input
                type="text"
                placeholder="Type the correct spelling..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmitAnswer()}
                disabled={showFeedback}
                className="text-lg p-4"
              />
            </div>

            {/* Confidence Slider */}
            {!showFeedback && (
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">How confident are you?</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-muted-foreground w-12 text-right">
                    {confidence}/5
                  </span>
                </div>
              </div>
            )}

            {/* Feedback Section */}
            <AnimatePresence>
              {showFeedback && (
            <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-6 p-4 rounded-lg border-2 ${
                      isCorrect
                        ? "border-success bg-success/10"
                        : "border-destructive bg-destructive/10"
                    }`}
                  >
                  <div className="flex items-center gap-3 mb-3">
                    {isCorrect ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-success" />
                        <span className="font-bold text-success">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-destructive" />
                        <span className="font-bold text-destructive">Incorrect</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm mb-3">
                    <strong>Correct spelling:</strong> {currentWord.word}
                  </p>
                  {explanation && (
                    <div className="bg-background/50 p-3 rounded text-sm">
                      <p className="font-medium mb-1 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Explanation
                      </p>
                      <p>{explanation}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!showFeedback ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleGetHint}
                    disabled={generateHintMutation.isPending}
                  >
                    {generateHintMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Lightbulb className="w-4 h-4" />
                    )}
                    Get Hint
                  </Button>
                  <Button
                    className="flex-1 btn-primary gap-2"
                    onClick={handleSubmitAnswer}
                    disabled={recordAttemptMutation.isPending}
                  >
                    {recordAttemptMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Submit Answer
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full btn-primary gap-2"
                  onClick={handleNextWord}
                >
                  Next Word
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Stats Summary */}
        <Card className="p-6 bg-card/50">
          <h3 className="font-semibold mb-4">Session Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{sessionStats.correct}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">
                {sessionStats.total > 0
                  ? ((sessionStats.correct / sessionStats.total) * 100).toFixed(0)
                  : 0}
                %
              </p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-xp-color">
                {sessionStats.correct * 20}
              </p>
              <p className="text-xs text-muted-foreground">XP Earned</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
