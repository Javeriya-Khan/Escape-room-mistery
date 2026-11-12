import { useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sound";
import { Bot, Send, Sparkles } from "lucide-react";

type Msg = {
  from: "aria" | "me";
  text: string;
};

type AssistantProps = {
  levelId: number;
  levelName: string;
  hints: string[];
  hintIndex: number;
  undiscoveredClues: { id: string; name: string }[];
  foundClueIds: string[];
  onHintUsed: () => void;
};

export function Assistant({
  levelId,
  levelName,
  hints,
  hintIndex,
  undiscoveredClues,
  foundClueIds,
  onHintUsed,
}: AssistantProps) {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "aria",
      text: `Welcome to ${levelName}. I am ARIA. I know the clues for this level. Inspect the room and ask me if you get stuck.`,
    },
  ]);

  const [input, setInput] = useState("");
  const [hintedClueIds, setHintedClueIds] = useState<string[]>([]);
  const HINT_LIMIT = 3;

  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs]);

  function push(message: Msg) {
    setMsgs((prev) => [...prev, message]);
  }

  function clueHint(id: string, name: string) {
    const lowerName = name.toLowerCase();
    if (/clock/.test(lowerName)) return `Inspect the ${name} closely. Look for a number or unusual detail rather than guessing.`;
    if (/terminal|computer/.test(lowerName)) return `Read the display on the ${name} carefully. A short message contains a useful digit.`;
    if (/file|book|shelf/.test(lowerName)) return `Search the ${name} for one item or marking that stands out from the rest.`;
    if (/chart|painting|poster/.test(lowerName)) return `Look closely at the ${name}. A marked or engraved detail may contain the digit.`;
    return `Take a closer look at the ${name}. Search for a number or detail that stands out.`;
  }

  function askHint() {
    if (hintIndex >= HINT_LIMIT) return;
    sfx.hint();
    const nextClue = undiscoveredClues.find((clue) => !hintedClueIds.includes(clue.id));
    const text = nextClue
      ? clueHint(nextClue.id, nextClue.name)
      : "You have explored every numbered clue, so check the order note and use the sequence it gives on the keypad beside the door.";

    if (nextClue) setHintedClueIds((current) => [...current, nextClue.id]);
    push({ from: "me", text: `Give me a hint (${hintIndex + 1}/${HINT_LIMIT}).` });
    window.setTimeout(() => push({ from: "aria", text }), 300);
    onHintUsed();
  }

  function send(e: React.FormEvent) {
    e.preventDefault();

    const q = input.trim();

    if (!q) return;

    sfx.click();

    push({
      from: "me",
      text: q,
    });

    setInput("");

    window.setTimeout(() => {
      const lower = q.toLowerCase();
      const mentionedFoundClue = foundClueIds.find((id) => lower.includes(id));
      const nextClue = undiscoveredClues[0];
      let reply: string;
      if (hintIndex >= HINT_LIMIT && /hint|help|nudge|clue/.test(lower)) {
        reply = "You've used all three hints for this level. Explore the clues you've found and use the order note to work out the next step.";
      } else if (/code|password|answer|solution/.test(lower)) {
        reply = "I won't reveal the final code directly. Inspect the numbered clues and use the Order Note to put them in the correct sequence. If you need help, press Reveal a hint and I'll guide you to the next clue you haven't found.";
      } else if (mentionedFoundClue) {
        reply = `You have already discovered the ${mentionedFoundClue} clue. Let's avoid repeating it—${nextClue ? `your next lead is the ${nextClue.name}. Press Reveal a hint for a gentle nudge.` : "you have all four numbered clues, so check the Order Note for their sequence."}`;
      } else if (nextClue) {
        reply = `I'll guide you rather than give the solution away. Your next undiscovered clue is the ${nextClue.name}. ${clueHint(nextClue.id, nextClue.name)}`;
      } else {
        reply = "All four numbered clues are discovered. Check the Order Note to learn the sequence, then use the keypad beside the exit door.";
      }
      push({ from: "aria", text: reply });
    }, 350);
  }

  return (
    <aside className="assistant-panel">
      <div className="assistant-head">
        <div className="assistant-avatar">
          <Bot className="size-5" />
        </div>

        <div>
          <div className="font-display text-sm font-black text-white">
            ARIA
          </div>

          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Clue-aware guidance
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-300">
          <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
          Online
        </div>
      </div>

      <div ref={scroller} className="assistant-messages">
        {msgs.map((message, index) => (
          <div
            key={index}
            className={
              message.from === "aria"
                ? "message message-aria"
                : "message message-user"
            }
          >
            {message.text}
          </div>
        ))}
      </div>

      <button
        onClick={askHint}
        className="hint-button"
        disabled={hintIndex >= HINT_LIMIT}
        title={hintIndex >= HINT_LIMIT ? "Hint limit reached" : "Reveal a hint"}
      >
        <Sparkles className="size-4" />

        {hintIndex >= HINT_LIMIT ? "No hints left" : "Reveal a hint"}

        <span>
          {Math.min(hintIndex, HINT_LIMIT)}/{HINT_LIMIT}
        </span>
      </button>

      <form
        onSubmit={send}
        className="assistant-form"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask ARIA for a nudge…"
        />

        <button
          type="submit"
          aria-label="Send"
        >
          <Send className="size-4" />
        </button>
      </form>
    </aside>
  );
}