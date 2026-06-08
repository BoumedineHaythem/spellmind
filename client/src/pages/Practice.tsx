import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  ArrowLeft, Volume2, CheckCircle, XCircle, Lightbulb, MessageCircle,
  Zap, Target, Loader2, Eye, EyeOff
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
  const [choices, setChoices] = useState<string[]>([]);
  const [revealDefinition, setRevealDefinition] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Speech helper
  const playPronunciation = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Slightly slower for crisp spellings
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Audio engine not supported on this browser.");
    }
  };

  // Trigger audio on load for audio-to-text mode
  useEffect(() => {
    if (currentWord && exerciseType === "audio_to_text" && !showFeedback) {
      playPronunciation(currentWord.word);
    }
  }, [currentWord, exerciseType, showFeedback]);

  // Generate dynamic spelling distractors for Multiple Choice
  useEffect(() => {
    if (!currentWord) return;

    const generateDistractors = (word: string): string[] => {
      const distractors = new Set<string>();

      // 1. Swap adjacent characters
      if (word.length > 3) {
        for (let i = 1; i < word.length - 1; i++) {
          const chars = word.split("");
          const temp = chars[i];
          chars[i] = chars[i + 1];
          chars[i + 1] = temp;
          distractors.add(chars.join(""));
        }
      }

      // 2. Common linguistic swaps
      if (word.includes("ie")) distractors.add(word.replace("ie", "ei"));
      if (word.includes("ei")) distractors.add(word.replace("ei", "ie"));
      if (word.includes("y")) distractors.add(word.replace("y", "i"));
      if (word.includes("tion")) distractors.add(word.replace("tion", "sion"));
      if (word.includes("sion")) distractors.add(word.replace("sion", "tion"));

      // 3. Double letters or drop them
      const doubleLetterRegex = /(.)\1/;
      if (doubleLetterRegex.test(word)) {
        distractors.add(word.replace(doubleLetterRegex, "$1"));
      } else {
        const vowels = ["a", "e", "i", "o", "u"];
        for (let i = 0; i < word.length; i++) {
          if (!vowels.includes(word[i].toLowerCase())) {
            distractors.add(word.slice(0, i) + word[i] + word[i] + word.slice(i + 1));
            break;
          }
        }
      }

      // Filter and finalize distractors
      const list = Array.from(distractors).filter((w) => w.toLowerCase() !== word.toLowerCase());
      while (list.length < 3) {
        const mutations = [
          word + "e",
          word.slice(0, -1),
          word.replace(/[aeiou]/i, "a"),
          word.replace(/[aeiou]/i, "e"),
        ];
        for (const mut of mutations) {
          if (mut !== word && !list.includes(mut)) list.push(mut);
          if (list.length >= 3) break;
        }
      }
      return list.slice(0, 3);
    };

    const choicesArray = [currentWord.word, ...generateDistractors(currentWord.word)];
    // Shuffle arrays safely
    setChoices(choicesArray.sort(() => Math.random() - 0.5));
  }, [currentWord, exerciseType]);

  const handleGetHint = async () => {
    if (!currentWord) return;
    try {
      const result = await generateHintMutation.mutateAsync({ word: currentWord.word });
      const hintText = typeof result.hint === "string" ? result.hint : "Try checking the root origins of the word!";
      setHint(hintText);
      toast.info("Hint revealed!");
    } catch (error) {
      toast.error("Failed to generate hint");
    }
  };

  const handleSubmitAnswer = async (forcedAnswer?: string) => {
    const finalAnswer = (forcedAnswer ?? userAnswer).trim();
    if (!currentWord || !finalAnswer) {
      toast.error("Please provide an answer");
      return;
    }

    const correct = finalAnswer.toLowerCase() === currentWord.word.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);

    const responseTime = Date.now() - startTime;

    if (!correct) {
      try {
        const result = await generateExplanationMutation.mutateAsync({
          word: currentWord.word,
          userAnswer: finalAnswer,
        });
        const explanationText = typeof result.explanation === "string" ? result.explanation : "Keep practicing! Focus on pronunciation and standard phonetic patterns.";
        setExplanation(explanationText);
      } catch (error) {
        setExplanation("Keep practicing! Focus on pronunciation and standard phonetic patterns.");
      }
    }

    try {
      await recordAttemptMutation.mutateAsync({
        exerciseId: currentWord.id,
        wordId: currentWord.id,
        userAnswer: finalAnswer,
        isCorrect: correct,
        responseTime,
        confidence,
      });

      setSessionStats((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1,
      }));

      if (correct) {
        toast.success("Correct! 🎉");
      } else {
        toast.error("Not quite! Let's learn from it.");
      }
    } catch (error) {
      toast.error("Failed to record attempt");
    }
  };

  const handleNextWord = () => {
    if (!nextWords) return;

    const currentIndex = nextWords.findIndex((w) => w.id === currentWord?.id);
    const nextIndex = (currentIndex + 1) % nextWords.length;

    setCurrentWord(nextWords[nextIndex]);
    setUserAnswer("");
    setShowFeedback(false);
    setHint(null);
    setExplanation(null);
    setRevealDefinition(false);
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Helper parser for visual Fill-in-the-Blank styling
  const getSentenceParts = () => {
    if (!currentWord || !currentWord.exampleSentence) return null;
    const sentence = currentWord.exampleSentence;
    const targetWord = currentWord.word;
    const regex = new RegExp(`\\b(${targetWord})\\b`, "gi");
    const parts = sentence.split(regex);
    return { parts, targetWord };
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
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

  const exerciseTypes: { type: ExerciseType; label: string }[] = [
    { type: "type_the_word", label: "Classic Type" },
    { type: "fill_in_blank", label: "Fill in Blank" },
    { type: "audio_to_text", label: "Audio Mode" },
    { type: "multiple_choice", label: "Multichoice" },
  ];

  const sentenceData = getSentenceParts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-12">
      {/* Header & Sticky Progress */}
      <div className="bg-card/90 backdrop-blur-md border-b sticky top-0 z-40 transition-shadow duration-300">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-muted/80 gap-1">
              <ArrowLeft className="w-4 h-4" />
              Exit
            </Button>
          </Link>
          <div className="flex items-center gap-6 text-sm font-semibold text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full">
              <Target className="w-4 h-4" />
              <span>{sessionStats.correct} / {sessionStats.total}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full">
              <Zap className="w-4 h-4" />
              <span>+{sessionStats.correct * 20} XP</span>
            </div>
          </div>
        </div>
        {/* Top Queue Progress Bar */}
        <div className="w-full bg-muted h-1">
          <div 
            className="bg-primary h-1 transition-all duration-300 ease-out"
            style={{ width: `${nextWords ? ((sessionStats.total % nextWords.length) / nextWords.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Exercise Switcher tabs */}
        <div className="mb-8">
          <div className="bg-muted/50 p-1.5 rounded-xl grid grid-cols-4 gap-1">
            {exerciseTypes.map((et) => (
              <button
                key={et.type}
                onClick={() => {
                  setExerciseType(et.type);
                  setUserAnswer("");
                  setShowFeedback(false);
                }}
                className={`py-2 px-1 rounded-lg transition-all text-xs font-semibold ${
                  exerciseType === et.type
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {et.label}
              </button>
            ))}
          </div>
        </div>

        {/* Core Card Context */}
        <motion.div
          key={`${currentWord.id}-${exerciseType}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="p-8 border-muted-foreground/10 shadow-lg relative overflow-hidden bg-card">
            {/* Context Header */}
            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 bg-muted/60 px-3 py-1 rounded-full">
                {exerciseType === "audio_to_text" ? "Phonetic Listening" : "Active Vocabulary"}
              </span>
            </div>

            {/* Layout Customizer based on Exercise Type */}
            <div className="min-h-[160px] flex flex-col items-center justify-center text-center mb-6">
              {/* Audio Mode Screen */}
              {exerciseType === "audio_to_text" ? (
                <div className="space-y-4 w-full">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => playPronunciation(currentWord.word)}
                    className="mx-auto w-20 h-20 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center shadow-inner transition-colors"
                  >
                    <Volume2 className="w-10 h-10 animate-pulse" />
                  </motion.button>
                  <p className="text-xs text-muted-foreground">Click the pulse button to play speech audio</p>

                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRevealDefinition(!revealDefinition)}
                      className="text-xs text-muted-foreground/80 hover:text-foreground"
                    >
                      {revealDefinition ? <EyeOff className="w-3.5 h-3.5 mr-1" /> : <Eye className="w-3.5 h-3.5 mr-1" />}
                      {revealDefinition ? "Hide Definition Helper" : "Show Definition Helper"}
                    </Button>
                    <AnimatePresence>
                      {revealDefinition && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 text-sm text-muted-foreground max-w-md mx-auto"
                        >
                          {currentWord.definition}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : exerciseType === "fill_in_blank" && sentenceData ? (
                /* Fill in the Blank Screen */
                <div className="text-center max-w-xl">
                  <p className="text-lg leading-relaxed text-foreground tracking-wide bg-muted/20 p-5 rounded-2xl border border-dashed border-muted">
                    "
                    {sentenceData.parts.map((part, i) => {
                      if (part.toLowerCase() === sentenceData.targetWord.toLowerCase()) {
                        return (
                          <span
                            key={i}
                            className={`inline-block mx-1.5 px-3 min-w-[100px] border-b-2 font-bold text-center transition-colors ${
                              showFeedback
                                ? isCorrect
                                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                  : "border-red-500 text-red-600 dark:text-red-400"
                                : "border-primary text-primary"
                            }`}
                          >
                            {showFeedback ? part : userAnswer || "_______"}
                          </span>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                    "
                  </p>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    Hint definition: {currentWord.definition}
                  </p>
                </div>
              ) : (
                /* Standard Text spelling UI / Default Fallback */
                <div className="space-y-4 max-w-lg">
                  <span className="text-5xl font-black text-primary/30 tracking-widest block">?</span>
                  <p className="text-lg font-medium text-foreground">{currentWord.definition}</p>
                  {currentWord.exampleSentence && (
                    <p className="text-sm italic text-muted-foreground/80 bg-muted/20 px-4 py-3 rounded-xl border">
                      "{currentWord.exampleSentence}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Shared Vocabulary Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {currentWord.category && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/5 text-primary border border-primary/10">
                  {currentWord.category}
                </span>
              )}
              {currentWord.gradeLevel && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/5 text-blue-500 border border-blue-500/10">
                  Grade {currentWord.gradeLevel}
                </span>
              )}
              {currentWord.difficulty && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/5 text-orange-500 border border-orange-500/10">
                  Diff: {currentWord.difficulty}/10
                </span>
              )}
            </div>

            {/* Text Pronunciation Button helper for other exercises */}
            {exerciseType !== "audio_to_text" && (
              <div className="flex justify-center mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 hover:bg-muted"
                  onClick={() => playPronunciation(currentWord.word)}
                >
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  Pronounce Word
                </Button>
              </div>
            )}

            {/* Answer Input Control Logic */}
            <div className="mb-6">
              {exerciseType === "multiple_choice" ? (
                /* Multiple Choice Grid UI */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {choices.map((choice, index) => {
                    const isSelected = userAnswer === choice;
                    let buttonStyle = "border-muted hover:border-primary/50 hover:bg-muted/30";

                    if (showFeedback) {
                      if (choice.toLowerCase() === currentWord.word.toLowerCase()) {
                        buttonStyle = "border-emerald-500/70 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold";
                      } else if (isSelected) {
                        buttonStyle = "border-red-500/70 bg-red-500/10 text-red-600 dark:text-red-400 line-through";
                      } else {
                        buttonStyle = "opacity-50 border-muted";
                      }
                    } else if (isSelected) {
                      buttonStyle = "border-primary bg-primary/5 text-primary ring-1 ring-primary";
                    }

                    return (
                      <button
                        key={index}
                        disabled={showFeedback}
                        onClick={() => {
                          setUserAnswer(choice);
                          handleSubmitAnswer(choice);
                        }}
                        className={`p-4 rounded-xl border text-sm font-medium transition-all duration-200 text-left flex items-center justify-between ${buttonStyle}`}
                      >
                        <span>{choice}</span>
                        {showFeedback && choice.toLowerCase() === currentWord.word.toLowerCase() && (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                        {showFeedback && isSelected && choice.toLowerCase() !== currentWord.word.toLowerCase() && (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Standard Keyboard Inputs */
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground/80 block uppercase tracking-wider">
                    Spell carefully
                  </label>
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Type spelling here..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                    disabled={showFeedback}
                    className="text-lg py-6 px-4 bg-muted/10 border-muted-foreground/20 focus-visible:ring-primary shadow-inner"
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </div>
              )}
            </div>

            {/* Self-Rating Confidence Level Slider */}
            {!showFeedback && exerciseType !== "multiple_choice" && (
              <div className="mb-6 bg-muted/30 p-4 rounded-xl border border-muted/50">
                <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                  Spelling Confidence Level
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                    className="flex-1 accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded">
                    {confidence}/5
                  </span>
                </div>
              </div>
            )}

            {/* Results Feedback Block */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-6 p-5 rounded-xl border-2 overflow-hidden ${
                    isCorrect
                      ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10"
                      : "border-red-500/20 bg-red-500/5 dark:bg-red-500/10"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {isCorrect ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">Perfect spelling!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="font-bold text-red-600 dark:text-red-400 text-base">Incorrect</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-foreground mb-4">
                    The correct spelling is: <strong className="text-base text-primary font-mono select-all underline decoration-dotted">{currentWord.word}</strong>
                  </p>
                  
                  {explanation && (
                    <div className="bg-card/70 border border-muted p-4 rounded-lg text-sm text-muted-foreground">
                      <p className="font-bold text-foreground mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        Learning Insight
                      </p>
                      <p className="leading-relaxed">{explanation}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Actions Layout */}
            <div className="flex gap-3">
              {!showFeedback ? (
                <>
                  {exerciseType !== "multiple_choice" && (
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 py-5"
                      onClick={handleGetHint}
                      disabled={generateHintMutation.isPending}
                    >
                      {generateHintMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Lightbulb className="w-4 h-4" />
                      )}
                      Ask for Hint
                    </Button>
                  )}
                  {exerciseType !== "multiple_choice" && (
                    <Button
                      className="flex-1 gap-2 py-5 bg-primary hover:bg-primary/90"
                      onClick={() => handleSubmitAnswer()}
                      disabled={recordAttemptMutation.isPending}
                    >
                      {recordAttemptMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Verify Answer
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  className="w-full gap-2 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
                  onClick={handleNextWord}
                >
                  Next Word
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              )}
            </div>

            {/* Interactive hint display block */}
            {hint && !showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-yellow-800 dark:text-yellow-200 text-sm flex items-start gap-2"
              >
                <Lightbulb className="w-5 h-5 flex-shrink-0 text-yellow-500 mt-0.5" />
                <span>{hint}</span>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Dynamic Performance Summary Card */}
        <Card className="p-6 border border-muted/50 bg-muted/20 backdrop-blur-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 mb-4">Session Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-card p-3 rounded-xl border border-muted">
              <p className="text-2xl font-black text-emerald-500">{sessionStats.correct}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Correct</p>
            </div>
            <div className="bg-card p-3 rounded-xl border border-muted">
              <p className="text-2xl font-black text-primary">
                {sessionStats.total > 0
                  ? ((sessionStats.correct / sessionStats.total) * 100).toFixed(0)
                  : 0}
                %
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Accuracy</p>
            </div>
            <div className="bg-card p-3 rounded-xl border border-muted">
              <p className="text-2xl font-black text-amber-500">
                {sessionStats.correct * 20}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">XP Earned</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}