import { getDb } from "./db";
import { words } from "../drizzle/schema";

const initialWords = [
  {
    word: "accommodation",
    definition: "A convenient arrangement or a room, group of rooms, or building in which someone may live or stay.",
    exampleSentence: "The hotel offers comfortable accommodation for up to four people.",
    pronunciation: "/əˌkɒməˈdeɪʃ(ə)n/",
    category: "General",
    gradeLevel: 8,
    difficulty: 6,
    commonMistakes: JSON.stringify(["acommodation", "accomodation", "acomodation"]),
  },
  {
    word: "conscientious",
    definition: "Wishing to do what is right, especially to do one's work or duty well and thoroughly.",
    exampleSentence: "She is a conscientious worker who always completes her tasks on time.",
    pronunciation: "/ˌkɒnʃɪˈɛnʃəs/",
    category: "Vocabulary",
    gradeLevel: 10,
    difficulty: 8,
    commonMistakes: JSON.stringify(["conscientous", "consciencious", "consientious"]),
  },
  {
    word: "rhythm",
    definition: "A strong, regular, repeated pattern of movement or sound.",
    exampleSentence: "The music had a fast, upbeat rhythm.",
    pronunciation: "/ˈrɪð(ə)m/",
    category: "Music",
    gradeLevel: 6,
    difficulty: 5,
    commonMistakes: JSON.stringify(["rythm", "rhythum", "rythum"]),
  },
  {
    word: "occurrence",
    definition: "An incident or event.",
    exampleSentence: "Power outages were an everyday occurrence during the storm.",
    pronunciation: "/əˈkʌr(ə)ns/",
    category: "General",
    gradeLevel: 9,
    difficulty: 7,
    commonMistakes: JSON.stringify(["occurence", "ocurrence", "ocurance"]),
  },
  {
    word: "embarrass",
    definition: "Cause to feel self-conscious, confused, or awkward.",
    exampleSentence: "I didn't want to embarrass him in front of his friends.",
    pronunciation: "/ɪmˈbarəs/",
    category: "Emotion",
    gradeLevel: 7,
    difficulty: 6,
    commonMistakes: JSON.stringify(["embaras", "embarraß", "embarass"]),
  },
  {
    word: "bizarre",
    definition: "Very strange or unusual, especially so as to cause interest or amusement.",
    exampleSentence: "She wore a bizarre outfit to the party.",
    pronunciation: "/bɪˈzɑː/",
    category: "General",
    gradeLevel: 7,
    difficulty: 5,
    commonMistakes: JSON.stringify(["bizar", "bizare", "bizarre"]),
  },
  {
    word: "necessary",
    definition: "Required to be done, achieved, or present; needed; essential.",
    exampleSentence: "It is necessary to wear a helmet while riding a bicycle.",
    pronunciation: "/ˈnɛsəs(ə)ri/",
    category: "General",
    gradeLevel: 5,
    difficulty: 4,
    commonMistakes: JSON.stringify(["neccessary", "necesary", "neccesary"]),
  },
  {
    word: "maintenance",
    definition: "The process of maintaining or preserving someone or something.",
    exampleSentence: "Regular car maintenance can prevent costly repairs.",
    pronunciation: "/ˈmeɪnt(ə)nəns/",
    category: "General",
    gradeLevel: 8,
    difficulty: 6,
    commonMistakes: JSON.stringify(["maintainance", "maintenence", "maintainence"]),
  }
];

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection failed");
    return;
  }
  
  console.log("Seeding initial spelling words...");
  
  for (const w of initialWords) {
    try {
      await db.insert(words).values(w).onConflictDoNothing();
      console.log(`Seeded: ${w.word}`);
    } catch (err) {
      console.error(`Failed to seed ${w.word}:`, err);
    }
  }
  
  console.log("Seeding completed successfully!");
}

seed().catch(console.error);
