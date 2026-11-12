import type { CSSProperties } from "react";

export type RoomObject = {
  id: string;
  name: string;
  emoji: string;
  digit?: string;
  title: string;
  body: string;
  style: CSSProperties;
  characterStyle: CSSProperties;
};

export type EscapeLevel = {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  code: string;
  background: string;
  objects: RoomObject[];
  hints: string[];
};

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
  /* jahan doll ke pair (feet) rukte hain */
  floorX: number;
  floorY: number;
};

/* Har level ki image ke hisaab se alag positions (% of image) */
const LAYOUTS: Record<number, Record<string, Rect>> = {
  1: {
    clock: { left: 45.45, top: 7.23, width: 10.89, height: 19.34, floorX: 50.9, floorY: 88 },
    poster: { left: 34.51, top: 10.95, width: 9.27, height: 19.87, floorX: 39.1, floorY: 88 },
    computer: { left: 45.28, top: 36.13, width: 9.63, height: 12.96, floorX: 50.1, floorY: 86 },
    bookshelf: { left: 0.0, top: 0.0, width: 14.65, height: 87.14, floorX: 7.3, floorY: 88 },
    note: { left: 62.38, top: 31.46, width: 4.43, height: 9.78, floorX: 64.6, floorY: 90 },
    extra: { left: 84.93, top: 30.82, width: 12.56, height: 43.04, floorX: 91.2, floorY: 88 },
    door: { left: 74.34, top: 21.25, width: 12.86, height: 48.88, floorX: 80.8, floorY: 80 },
  },
  2: {
    clock: { left: 42.28, top: 5.84, width: 12.02, height: 21.79, floorX: 48.3, floorY: 88 },
    poster: { left: 58.13, top: 29.76, width: 7.89, height: 15.73, floorX: 62.1, floorY: 88 },
    computer: { left: 38.1, top: 34.01, width: 17.05, height: 15.41, floorX: 46.6, floorY: 86 },
    bookshelf: { left: 0.0, top: 0.0, width: 17.94, height: 89.27, floorX: 9.0, floorY: 88 },
    note: { left: 20.63, top: 60.57, width: 4.19, height: 11.69, floorX: 22.7, floorY: 90 },
    extra: { left: 88.52, top: 24.44, width: 11.48, height: 49.95, floorX: 94.3, floorY: 88 },
    door: { left: 73.27, top: 23.91, width: 11.54, height: 45.7, floorX: 79.0, floorY: 80 },
  },
  3: {
    clock: { left: 44.26, top: 5.31, width: 11.96, height: 21.25, floorX: 50.2, floorY: 88 },
    poster: { left: 30.02, top: 6.59, width: 11.24, height: 26.35, floorX: 35.6, floorY: 88 },
    computer: { left: 40.49, top: 32.94, width: 15.13, height: 15.41, floorX: 48.1, floorY: 86 },
    bookshelf: { left: 0.0, top: 0.0, width: 16.45, height: 87.14, floorX: 8.2, floorY: 88 },
    note: { left: 30.2, top: 48.35, width: 10.47, height: 6.91, floorX: 35.4, floorY: 90 },
    extra: { left: 92.11, top: 20.19, width: 7.89, height: 36.13, floorX: 96.1, floorY: 88 },
    door: { left: 74.04, top: 21.25, width: 11.6, height: 48.88, floorX: 79.8, floorY: 80 },
  },
  4: {
    clock: { left: 43.3, top: 7.97, width: 11.84, height: 20.94, floorX: 49.2, floorY: 88 },
    poster: { left: 24.52, top: 12.96, width: 14.17, height: 22.64, floorX: 31.6, floorY: 88 },
    computer: { left: 40.31, top: 34.54, width: 15.61, height: 15.41, floorX: 48.1, floorY: 86 },
    bookshelf: { left: 0.0, top: 0.0, width: 16.03, height: 83.95, floorX: 8.0, floorY: 88 },
    note: { left: 26.91, top: 43.04, width: 5.68, height: 12.22, floorX: 29.8, floorY: 90 },
    extra: { left: 89.11, top: 42.51, width: 6.28, height: 30.82, floorX: 92.3, floorY: 88 },
    door: { left: 73.09, top: 24.97, width: 13.04, height: 44.1, floorX: 79.6, floorY: 80 },
  },
};

function positionsFor(levelId: number) {
  const rects = LAYOUTS[levelId] as Record<string, Rect>;
  const make = (key: string) => {
    const r = rects[key] as Rect;
    return {
      style: {
        left: `${r.left}%`,
        top: `${r.top}%`,
        width: `${r.width}%`,
        height: `${r.height}%`,
      } as CSSProperties,
      characterStyle: {
        left: `${r.floorX}%`,
        top: `${r.floorY}%`,
      } as CSSProperties,
    };
  };

  return {
    computer: make("computer"),
    clock: make("clock"),
    bookshelf: make("bookshelf"),
    poster: make("poster"),
    note: make("note"),
    extra: make("extra"),
    door: make("door"),
  };
}

const P1 = positionsFor(1);
const P2 = positionsFor(2);
const P3 = positionsFor(3);
const P4 = positionsFor(4);

/* Door overlay (khulne wala door) ki jagah, roshni aur hinge */
export const DOORS: Record<
  number,
  { left: number; top: number; width: number; height: number; light: string }
> = {
  1: { ...LAYOUTS[1]!['door']!, light: "#fff2c9, #ffc873 55%, #f08a2b" },
  2: { ...LAYOUTS[2]!['door']!, light: "#ffffff, #bff6ff 50%, #4fd8ff" },
  3: { ...LAYOUTS[3]!['door']!, light: "#fff0ff, #d6b5ff 50%, #8b4dff" },
  4: { ...LAYOUTS[4]!['door']!, light: "#fff1d6, #ff9a6b 50%, #e02424" },
};

/* =====================================================
   LEVEL 1 — THE FORGOTTEN STUDY
===================================================== */

const level1: EscapeLevel = {
  id: 1,
  background: "/rooms/level1.jpg",
  name: "The Forgotten Study",
  subtitle: "The First Escape",
  description:
    "A mysterious study hides four digits. Inspect the room, find the order note, and unlock the door.",

  code: "3974",

  objects: [
    {
      id: "computer",
      name: "Computer",
      emoji: "🖥️",
      digit: "7",
      title: "The Old Computer",
      body:
        "The monitor suddenly turns on. A message appears: SYSTEM DIGIT :: 7. This number is part of the exit code.",
      ...P1.computer,
    },
    {
      id: "clock",
      name: "Wall Clock",
      emoji: "🕒",
      digit: "3",
      title: "The Stopped Clock",
      body:
        "The clock hands look stuck, but a small brass plate under the clock is engraved with a single number: 3.",
      ...P1.clock,
    },
    {
      id: "bookshelf",
      name: "Bookshelf",
      emoji: "📚",
      digit: "9",
      title: "The Bookshelf",
      body:
        "There are nine books on the shelf. One book has been turned around and its spine says NINE.",
      ...P1.bookshelf,
    },
    {
      id: "poster",
      name: "Mountain Painting",
      emoji: "🖼️",
      digit: "4",
      title: "The Mountain Painting",
      body:
        "A tiny number is carved into the corner of the gold frame: 4. It shines brighter than the rest of the engraving.",
      ...P1.poster,
    },
    {
      id: "note",
      name: "Order Note",
      emoji: "📝",
      title: "The Order Note",
      body:
        "The pinned paper says: CLOCK → BOOKSHELF → COMPUTER → PAINTING. This tells you the correct order.",
      ...P1.note,
    },
    {
      id: "plant",
      name: "Plant",
      emoji: "🪴",
      title: "The Floor Plant",
      body: "Just a decorative plant. Nothing useful is hidden here.",
      ...P1.extra,
    },
    {
      id: "door",
      name: "Exit Door",
      emoji: "🚪",
      title: "The Locked Exit",
      body:
        "The door requires a four-digit code. Find the four numbered clues and follow the order note.",
      ...P1.door,
    },
  ],

  hints: [
    "There are four numbered clues hidden around this study.",
    "Find the Order Note first. It tells you the sequence.",
    "Start with the Wall Clock. It shows 3.",
    "The Bookshelf gives you 9.",
    "The Computer gives you 7.",
    "The Mountain Painting gives you 4. The complete code is 3974.",
  ],
};

/* =====================================================
   LEVEL 2 — SECRET LABORATORY
===================================================== */

const level2: EscapeLevel = {
  id: 2,
  background: "/rooms/level2.jpg",
  name: "The Secret Laboratory",
  subtitle: "Experiment 08",
  description:
    "You entered a hidden laboratory. Find the experiment sequence before the security system locks you in.",

  code: "5816",

  objects: [
    {
      id: "computer",
      name: "Research Terminal",
      emoji: "💻",
      digit: "8",
      title: "Research Terminal",
      body:
        "The terminal displays: EXPERIMENT NUMBER 08. The important digit here is 8.",
      ...P2.computer,
    },
    {
      id: "clock",
      name: "Lab Clock",
      emoji: "⏰",
      digit: "5",
      title: "Laboratory Clock",
      body:
        "The digital clock is frozen at 05:00. This gives you the first digit: 5.",
      ...P2.clock,
    },
    {
      id: "bookshelf",
      name: "Research Files",
      emoji: "🧪",
      digit: "1",
      title: "Research Files",
      body:
        "A research file contains one large handwritten number: ONE. Your third digit is 1.",
      ...P2.bookshelf,
    },
    {
      id: "poster",
      name: "Experiment Chart",
      emoji: "📊",
      digit: "6",
      title: "Experiment Chart",
      body: "One value has been circled repeatedly on the chart: 6.",
      ...P2.poster,
    },
    {
      id: "note",
      name: "Research Note",
      emoji: "📄",
      title: "Research Order",
      body: "A note stuck on the bin says: CLOCK → TERMINAL → RESEARCH FILES → CHART.",
      ...P2.note,
    },
    {
      id: "plant",
      name: "Chemical Flask",
      emoji: "⚗️",
      title: "Unknown Sample",
      body: "A strange chemical sample. It does not contain a useful digit.",
      ...P2.extra,
    },
    {
      id: "door",
      name: "Lab Security Door",
      emoji: "🚪",
      title: "Laboratory Exit",
      body: "The security door requires a four-digit laboratory code.",
      ...P2.door,
    },
  ],

  hints: [
    "The laboratory contains four numbered clues.",
    "The Research Order note tells you where to begin.",
    "The Lab Clock gives the first digit: 5.",
    "The Research Terminal gives the second digit: 8.",
    "The Research Files give the third digit: 1.",
    "The Experiment Chart gives the final digit: 6. The code is 5816.",
  ],
};

/* =====================================================
   LEVEL 3 — HAUNTED LIBRARY
===================================================== */

const level3: EscapeLevel = {
  id: 3,
  background: "/rooms/level3.jpg",
  name: "The Haunted Library",
  subtitle: "The Silent Archive",
  description:
    "An abandoned library hides an ancient combination. Follow the archive scroll and solve the sequence.",

  code: "2649",

  objects: [
    {
      id: "computer",
      name: "Archive Terminal",
      emoji: "🖥️",
      digit: "6",
      title: "Archive Terminal",
      body: "The terminal shows FILE 06. The highlighted archive number is 6.",
      ...P3.computer,
    },
    {
      id: "clock",
      name: "Ancient Clock",
      emoji: "🕰️",
      digit: "2",
      title: "The Ancient Clock",
      body: "The hands point to 3:00, but a small silver numeral is engraved on the brass rim: 2. This is your first digit.",
      ...P3.clock,
    },
    {
      id: "bookshelf",
      name: "Ancient Books",
      emoji: "📚",
      digit: "4",
      title: "The Ancient Books",
      body:
        "Four ancient books have silver marks on their spines. The number is 4.",
      ...P3.bookshelf,
    },
    {
      id: "poster",
      name: "Mysterious Portrait",
      emoji: "🖼️",
      digit: "9",
      title: "The Mysterious Portrait",
      body: "A small golden 9 is hidden inside the portrait frame.",
      ...P3.poster,
    },
    {
      id: "note",
      name: "Ancient Scroll",
      emoji: "📜",
      title: "The Ancient Scroll",
      body: "The scroll says: CLOCK → TERMINAL → BOOKS → PORTRAIT.",
      ...P3.note,
    },
    {
      id: "plant",
      name: "Old Candle",
      emoji: "🕯️",
      title: "The Old Candle",
      body:
        "The candle flickers strangely, but it does not contain a useful number.",
      ...P3.extra,
    },
    {
      id: "door",
      name: "Archive Door",
      emoji: "🚪",
      title: "The Archive Exit",
      body: "The ancient archive door requires four digits.",
      ...P3.door,
    },
  ],

  hints: [
    "The library contains four numbered clues.",
    "Look for the Ancient Scroll. It reveals the order.",
    "The Ancient Clock gives 2.",
    "The Archive Terminal gives 6.",
    "The Ancient Books give 4.",
    "The Portrait gives 9. The code is 2649.",
  ],
};

/* =====================================================
   LEVEL 4 — THE FINAL VAULT
===================================================== */

const level4: EscapeLevel = {
  id: 4,
  background: "/rooms/level4.jpg",
  name: "The Final Vault",
  subtitle: "The Last Door",
  description:
    "This is the final room. Solve the vault sequence and complete the mystery.",

  // CLOCK(7) → RECORDS(2) → CONSOLE(4) → BLUEPRINT(7)
  code: "7247",

  objects: [
    {
      id: "computer",
      name: "Vault Console",
      emoji: "🖥️",
      digit: "4",
      title: "Vault Console",
      body: "The console displays VAULT SECTOR 04. Your third digit is 4.",
      ...P4.computer,
    },
    {
      id: "clock",
      name: "Security Clock",
      emoji: "⏱️",
      digit: "7",
      title: "Security Clock",
      body: "The security clock stopped at 07:00. Your first digit is 7.",
      ...P4.clock,
    },
    {
      id: "bookshelf",
      name: "Vault Records",
      emoji: "📚",
      digit: "2",
      title: "Vault Records",
      body:
        "Two red records are marked with a glowing symbol. The number is 2.",
      ...P4.bookshelf,
    },
    {
      id: "poster",
      name: "Final Blueprint",
      emoji: "🗺️",
      digit: "1",
      title: "Final Blueprint",
      body: "The blueprint has one number circled in gold: 7.",
      ...P4.poster,
    },
    {
      id: "note",
      name: "Final Instruction",
      emoji: "📝",
      title: "Final Instruction",
      body: "The instruction says: CLOCK → RECORDS → CONSOLE → BLUEPRINT.",
      ...P4.note,
    },
    {
      id: "plant",
      name: "Power Device",
      emoji: "🔋",
      title: "Vault Power Device",
      body: "The device powers the vault systems. It does not contain a digit.",
      ...P4.extra,
    },
    {
      id: "door",
      name: "Final Vault Door",
      emoji: "🚪",
      title: "The Final Door",
      body: "This is the final exit. Enter the correct four-digit vault code.",
      ...P4.door,
    },
  ],

  hints: [
    "You have reached the final room. Inspect every important clue.",
    "Find the Final Instruction. It gives you the exact order.",
    "The Security Clock gives 7.",
    "The Vault Records give 2.",
    "The Vault Console gives 4.",
    "The Final Blueprint gives 7. The final code is 7247.",
  ],
};

export const LEVELS: EscapeLevel[] = [level1, level2];

/* Backward-compatible exports */
export const ROOM_OBJECTS = level1.objects;
export const SECRET_CODE = level1.code;
export const HINTS = level1.hints;

export const CODE_ORDER = [
  "clock",
  "bookshelf",
  "computer",
  "poster",
] as const;

/* =====================================================
   ARIA — LEVEL SPECIFIC RESPONSES
===================================================== */

const levelRules: Record<number, { keys: string[]; reply: string }[]> = {
  1: [
    {
      keys: ["clock", "time"],
      reply:
        "A brass plate under the Wall Clock is engraved with 3. That is one of the important digits.",
    },
    {
      keys: ["book", "bookshelf", "shelf"],
      reply: "The Bookshelf contains nine books. Look closely at the turned book.",
    },
    {
      keys: ["computer", "pc", "screen", "monitor"],
      reply: "The old computer reveals SYSTEM DIGIT :: 7.",
    },
    {
      keys: ["poster", "picture", "art", "painting", "mountain"],
      reply: "The Mountain Painting has the number 4 carved into its frame.",
    },
    {
      keys: ["note", "order", "sequence"],
      reply: "The Order Note says CLOCK → BOOKSHELF → COMPUTER → PAINTING.",
    },
    {
      keys: ["door", "keypad", "exit"],
      reply:
        "The exit requires four digits. Find the clues and follow the order note.",
    },
  ],

  2: [
    {
      keys: ["clock", "time"],
      reply: "The Laboratory Clock is frozen at 05:00. Start with 5.",
    },
    {
      keys: ["computer", "terminal", "screen"],
      reply: "The Research Terminal shows EXPERIMENT NUMBER 08.",
    },
    {
      keys: ["book", "bookshelf", "file", "research"],
      reply: "The Research Files contain the handwritten number ONE.",
    },
    {
      keys: ["poster", "chart", "experiment"],
      reply: "The Experiment Chart has the number 6 circled repeatedly.",
    },
    {
      keys: ["note", "order", "sequence"],
      reply: "The Research Order is CLOCK → TERMINAL → RESEARCH FILES → CHART.",
    },
    {
      keys: ["door", "keypad", "exit"],
      reply:
        "The laboratory security door needs four digits in the research order.",
    },
  ],

  3: [
    {
      keys: ["clock", "time"],
      reply: "A silver 2 is engraved on the Ancient Clock's rim. That is where the sequence begins.",
    },
    {
      keys: ["book", "bookshelf"],
      reply: "Four ancient books have silver marks. Remember the number 4.",
    },
    {
      keys: ["computer", "terminal", "archive"],
      reply: "The Archive Terminal displays FILE 06.",
    },
    {
      keys: ["poster", "portrait", "picture"],
      reply: "There is a golden 9 hidden inside the mysterious portrait frame.",
    },
    {
      keys: ["note", "scroll", "order", "sequence"],
      reply: "The Ancient Scroll says CLOCK → TERMINAL → BOOKS → PORTRAIT.",
    },
    {
      keys: ["door", "keypad", "exit"],
      reply: "The archive door needs four digits. Follow the Ancient Scroll.",
    },
  ],

  4: [
    {
      keys: ["clock", "time"],
      reply: "The Security Clock stopped at 07:00. That gives you 7.",
    },
    {
      keys: ["book", "bookshelf", "record"],
      reply: "Two vault records have the glowing symbol. The number is 2.",
    },
    {
      keys: ["computer", "console", "screen"],
      reply: "The Vault Console displays VAULT SECTOR 04.",
    },
    {
      keys: ["poster", "blueprint", "map"],
      reply: "The Final Blueprint has one number circled in gold: 7.",
    },
    {
      keys: ["note", "instruction", "order", "sequence"],
      reply: "The Final Instruction says CLOCK → RECORDS → CONSOLE → BLUEPRINT.",
    },
    {
      keys: ["door", "keypad", "exit", "vault"],
      reply: "This is the final vault. Four digits are needed to escape.",
    },
  ],
};

/* Match whole words (or word prefixes like "book" -> "books") */
function hasWord(words: string[], keys: string[]): boolean {
  return words.some((w) => keys.some((k) => w.startsWith(k)));
}

export function assistantReply(question: string, levelId: number = 1): string {
  const words = question.toLowerCase().match(/[a-z0-9]+/g) ?? [];

  if (words.some((w) => ["hello", "hi", "hey", "salam"].includes(w))) {
    return `Hello, investigator. You are currently in Level ${levelId}. Ask me about any clue in this room.`;
  }

  if (hasWord(words, ["code", "password", "answer"])) {
    return "I won't give away the final code immediately. Ask me about a specific clue or use the Hint button.";
  }

  const rules = levelRules[levelId] ?? levelRules[1] ?? [];

  for (const rule of rules) {
    if (hasWord(words, rule.keys)) {
      return rule.reply;
    }
  }

  return "Ask me about one of the objects in this level. I can help with the clock, books, computer, note, artwork, or exit.";
}