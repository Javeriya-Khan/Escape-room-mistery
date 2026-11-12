import { createFileRoute } from "@tanstack/react-router";
import { EscapeRoom } from "@/components/EscapeRoom";

const title = "Escape Room — AI Mystery Game";
const description =
  "Explore the room, discover four hidden digits, follow the clue order, and unlock the exit with help from ARIA, your AI assistant.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EscapeRoom,
});
