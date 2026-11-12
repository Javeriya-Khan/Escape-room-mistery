# Fixes

1. Door: `doorOpen` state, correct code par door khulta hai (asli door image hi swing hoti hai, peeche roshni), level reset/next/menu par band.
2. Doll: background image se baked bachcha hata diya (double doll ki wajah). Ab sirf ek doll (`public/doll.png`) hai jo clues tak chalti hai.
3. Level jeetne par doll door tak chal kar andar jaati hai, phir "Level Cleared" aata hai.
4. Timer door khulte hi ruk jaata hai; keypad/clues door khulne ke baad lock.
5. Saare setTimeout track hote hain, reset par cancel (purane timers se galat win/clue nahi).
6. Reset code ek `resetRoom()` mein, ARIA chat har level par reset (`key={level}`).
7. TypeScript strict errors fix (`tsc --noEmit` clean).

`public/room-background-original.png` = purani image (backup), delete kar sakte ho.

# Round 2
8. Har level ka alag room look: `public/rooms/level1-4.jpg` (Study, Lab, Haunted Library, Final Vault). `background` field `roomData.ts` mein; door bhi usi level ki image use karta hai.
9. Background image se baked AI HINT / RESTART / MENU buttons hata diye (duplicate the).
10. Sounds: door creak + thud, footsteps, whoosh (doll door mein jaate waqt), win fanfare (final level par lambi).
11. Win animation: confetti, pop-in modal, pulsing orb.

# Round 3 (tumhari 4 AI images)
12. `public/rooms/level1-4.jpg` ab tumhari generate ki hui images hain (1672x941). Room stage ab 16:9.
13. Har level ke liye alag hotspot positions, door overlay aur doll ke chalne ki jagah (`LAYOUTS` in `src/lib/roomData.ts`). Image badalni ho to sirf wahan numbers badlo.
14. Door ab right hinge par khulta hai (handle left par hai) aur roshni ka rang level ke hisaab se (warm / cyan / purple / red).
15. Texts image se match kiye: L1 poster -> Mountain Painting, L1 clock -> brass plate 3, L3 clock -> rim par 2, L4 blueprint par 7 dikhta hai isliye L4 code ab 7247.
