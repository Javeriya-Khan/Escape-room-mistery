# Escape Room — AI Mystery Game

Neon / gen-z style escape room game. Room ki cheezon se 4 digits milte hain,
sahi order mein keypad par daalo aur darwaza khul jayega. ARIA (AI assistant)
hints deti hai aur sawalon ke jawab bhi.

## Laptop par kaise chalayein

1. Node.js install karein (version 20 ya us se upar) — https://nodejs.org
2. Terminal / Command Prompt kholein aur is folder mein jayein:
   ```
   cd escape-room-ai-mystery
   ```
3. Packages install karein:
   ```
   npm install
   ```
4. Game chalayein:
   ```
   npm run dev
   ```
5. Browser mein kholein: http://localhost:8080

## Game ka solution (sirf aap ke liye 🤫)

- Wall Clock → 3
- Bookshelf → 9
- Computer → 7
- Poster → 4
- Sticky note order batata hai: Clock → Bookshelf → Computer → Poster
- **Code = 3974**

## Files

- `src/routes/index.tsx` — home page
- `src/components/EscapeRoom.tsx` — room, keypad, timer, win screen
- `src/components/Assistant.tsx` — ARIA (AI hint assistant)
- `src/lib/roomData.ts` — objects, clues, hints, assistant answers
- `src/lib/sound.ts` — sound effects (Web Audio, koi file download nahi)
- `src/styles.css` — neon design system (colors, gradients)
