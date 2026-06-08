import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Plus, Trash2, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface WordList {
  id: number;
  name: string;
  description: string;
  category: string;
  gradeLevel: number;
  wordCount: number;
  isSaved: boolean;
}

// Mock data for word lists
const FEATURED_WORD_LISTS: WordList[] = [
  {
    id: 1,
    name: "Common Misspellings",
    description: "Master the most commonly misspelled words in English",
    category: "General",
    gradeLevel: 5,
    wordCount: 50,
    isSaved: false,
  },
  {
    id: 2,
    name: "SAT Vocabulary",
    description: "Prepare for the SAT with advanced vocabulary and spelling",
    category: "Test Prep",
    gradeLevel: 11,
    wordCount: 200,
    isSaved: false,
  },
  {
    id: 3,
    name: "Medical Terminology",
    description: "Learn medical and scientific terms for healthcare professionals",
    category: "Professional",
    gradeLevel: 12,
    wordCount: 150,
    isSaved: false,
  },
  {
    id: 4,
    name: "Business English",
    description: "Essential business and professional vocabulary",
    category: "Professional",
    gradeLevel: 10,
    wordCount: 100,
    isSaved: false,
  },
  {
    id: 5,
    name: "Grade 3 Spelling",
    description: "Core spelling words for elementary students",
    category: "Elementary",
    gradeLevel: 3,
    wordCount: 75,
    isSaved: false,
  },
  {
    id: 6,
    name: "Grade 6 Spelling",
    description: "Intermediate spelling words for middle school",
    category: "Middle School",
    gradeLevel: 6,
    wordCount: 100,
    isSaved: false,
  },
];

export default function Settings() {
  const { user } = useAuth();
  const [savedLists, setSavedLists] = useState<WordList[]>([]);
  const [activeTab, setActiveTab] = useState<"featured" | "saved">("featured");

  if (!user) {
    return <div>Redirecting...</div>;
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  const handleSaveList = (list: WordList) => {
    if (!savedLists.find(l => l.id === list.id)) {
      setSavedLists([...savedLists, { ...list, isSaved: true }]);
    }
  };

  const handleRemoveList = (listId: number) => {
    setSavedLists(savedLists.filter(l => l.id !== listId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      {/* Header */}
      <div className="bg-card border-b border-muted sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Word Lists</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-muted">
          <button
            onClick={() => setActiveTab("featured")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "featured"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Featured Lists
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "saved"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            My Lists ({savedLists.length})
          </button>
        </div>

        {/* Featured Lists Tab */}
        {activeTab === "featured" && (
          <motion.div {...fadeInUp}>
            <div className="mb-8">
              <p className="text-muted-foreground mb-6">
                Explore curated word lists designed for different levels and purposes
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FEATURED_WORD_LISTS.map((list, idx) => (
                  <motion.div
                    key={list.id}
                    {...fadeInUp}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <BookOpen className="w-6 h-6 text-primary" />
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Grade {list.gradeLevel}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{list.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-1">
                        {list.description}
                      </p>
                      <div className="flex items-center justify-between mb-4 text-sm">
                        <span className="text-muted-foreground">{list.wordCount} words</span>
                        <span className="px-2 py-1 bg-background rounded text-xs">
                          {list.category}
                        </span>
                      </div>
                      <Button
                        className="w-full btn-primary gap-2"
                        onClick={() => handleSaveList(list)}
                      >
                        <Plus className="w-4 h-4" />
                        Add to My Lists
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Saved Lists Tab */}
        {activeTab === "saved" && (
          <motion.div {...fadeInUp}>
            {savedLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedLists.map((list, idx) => (
                  <motion.div
                    key={list.id}
                    {...fadeInUp}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow border-primary/30">
                      <div className="flex items-start justify-between mb-3">
                        <BookOpen className="w-6 h-6 text-primary" />
                        <Star className="w-5 h-5 fill-accent text-accent" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{list.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-1">
                        {list.description}
                      </p>
                      <div className="flex items-center justify-between mb-4 text-sm">
                        <span className="text-muted-foreground">{list.wordCount} words</span>
                        <span className="px-2 py-1 bg-background rounded text-xs">
                          {list.category}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link href="/practice" className="flex-1">
                          <Button className="w-full btn-primary" size="sm">
                            Practice
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveList(list.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No word lists saved yet</p>
                <Button
                  className="btn-primary"
                  onClick={() => setActiveTab("featured")}
                >
                  Explore Featured Lists
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
