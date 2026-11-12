import { useEffect, useMemo, useRef, useState } from "react";
import { Assistant } from "@/components/Assistant";
import { DOORS, LEVELS, type EscapeLevel, type RoomObject } from "@/lib/roomData";
import {
  initAudio,
  isMuted,
  setMuted,
  sfx,
} from "@/lib/sound";
import {
  Bell,
  DoorOpen,
  Lock,
  RotateCcw,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

// Level jeetne par doll yahan (door ke saamne) chal kar jaati hai
const DOOR_EXIT_POSITION = { left: "82%", top: "83%" };

// Win screen ke confetti (deterministic, taaki server/browser mein same ho)
const CONFETTI = Array.from({ length: 36 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 53) % 100) / 100,
  dur: 2.2 + ((i * 29) % 15) / 10,
  size: 6 + ((i * 13) % 7),
  color: ["#7be8ff", "#79e7a9", "#ffd166", "#ff8fab", "#b8a1ff"][i % 5],
}));

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");

  const s = (sec % 60)
    .toString()
    .padStart(2, "0");

  return `${m}:${s}`;
}

export function EscapeRoom() {
  const [started, setStarted] = useState(false);

  const [level, setLevel] = useState(1);

  const [completedLevels, setCompletedLevels] =
    useState<number[]>([]);

  const [escaped, setEscaped] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);

  const [seconds, setSeconds] = useState(0);

  const [open, setOpen] =
    useState<RoomObject | null>(null);

  const [found, setFound] = useState<string[]>([]);

  const [code, setCode] = useState("");

  const [shake, setShake] = useState(false);

  const [attempts, setAttempts] = useState(0);

  const [hintIndex, setHintIndex] = useState(0);

  const [muted, setMutedState] = useState(false);

  const [walkingTo, setWalkingTo] =
  useState<RoomObject | null>(null);

const [characterPosition, setCharacterPosition] =
  useState<RoomObject["characterStyle"] | null>(null);

  const [dollWalking, setDollWalking] = useState(false);
  const [dollExit, setDollExit] = useState(false);

  // Saare pending setTimeout yahan track hote hain, taaki reset ke baad purane timers kuch na badlein
  const timers = useRef<number[]>([]);

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  useEffect(() => clearTimers, []);

  // Doll ke chalte waqt kadam ki awaaz
  function footsteps(count: number, gap: number, from = 0) {
    for (let i = 0; i < count; i++) later(() => sfx.step(), from + i * gap);
  }

  const [menuOpen, setMenuOpen] = useState(false);

  const [levelSelectOpen, setLevelSelectOpen] =
    useState(false);
  const [keypadOpen, setKeypadOpen] = useState(false);

  const currentLevel = (LEVELS[level - 1] ?? LEVELS[0]) as EscapeLevel;

  const roomObjects = currentLevel.objects;

  const door = (DOORS[level] ?? DOORS[1]) as NonNullable<(typeof DOORS)[number]>;

  // Door overlay ki jagah/size/roshni, har level ki image ke hisaab se
  const doorStyle = {
    left: `${door.left}%`,
    top: `${door.top}%`,
    width: `${door.width}%`,
    height: `${door.height}%`,
    "--door-light": `radial-gradient(ellipse at 70% 50%, ${door.light})`,
    "--door-size": `${(100 / door.width) * 100}% ${(100 / door.height) * 100}%`,
    "--door-pos": `${(door.left / (100 - door.width)) * 100}% ${(door.top / (100 - door.height)) * 100}%`,
  } as React.CSSProperties;

  const digitsTotal = useMemo(
    () =>
      roomObjects.filter(
        (object) => object.digit,
      ).length,
    [roomObjects],
  );

  useEffect(() => {
    if (!started || escaped || doorOpen) return;

    const timer = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, escaped, doorOpen]);

  // Ek hi jagah se poora room reset hota hai (door bhi band, doll bhi wapas)
  function resetRoom() {
    clearTimers();

    setEscaped(false);
    setDoorOpen(false);
    setDollWalking(false);
    setDollExit(false);
    setSeconds(0);
    setFound([]);
    setCode("");
    setAttempts(0);
    setHintIndex(0);
    setOpen(null);
    setWalkingTo(null);
    setCharacterPosition(null);
    setMenuOpen(false);
    setLevelSelectOpen(false);
    setKeypadOpen(false);
    setShake(false);
  }

  function resetLevel() {
    resetRoom();
    sfx.open();
  }

  function startGame() {
    initAudio();

    resetRoom();
    setLevel(1);
    setCompletedLevels([]);
    setStarted(true);

    sfx.open();
  }

  function selectLevel(selectedLevel: number) {
    const unlocked =
      selectedLevel === 1 ||
      completedLevels.includes(selectedLevel - 1);

    if (!unlocked) return;

    initAudio();

    resetRoom();
    setLevel(selectedLevel);
    setStarted(true);

    sfx.open();
  }

  function inspect(object: RoomObject) {
    if (walkingTo || doorOpen) return;

    sfx.click();

    const isNewClue = !!object.digit && !found.includes(object.id);

    setCharacterPosition(object.characterStyle);
    setWalkingTo(object);
    footsteps(3, 200);

    later(() => {
      setWalkingTo(null);

      sfx.open();
      setOpen(object);

      if (isNewClue) {
        setFound((current) =>
          current.includes(object.id) ? current : [...current, object.id],
        );

        later(() => sfx.found(), 250);
      }
    }, 650);
  }

  function press(digit: string) {
    if (doorOpen || code.length >= 4) return;

    sfx.key();

    setCode((current) => current + digit);
  }

  function submit() {
    if (doorOpen) return;

    if (code.length < 4) {
      sfx.wrong();

      setShake(true);

      later(() => setShake(false), 400);

      return;
    }

    if (code === currentLevel.code) {
      sfx.unlock();

      // 1) door khulta hai (creak ke saath)
      setDoorOpen(true);
      setKeypadOpen(false);
      later(() => sfx.doorCreak(), 200);
      setOpen(null);

      if (!completedLevels.includes(level)) {
        setCompletedLevels((current) => [...current, level]);
      }

      // 2) doll door ki taraf chalti hai
      later(() => {
        setCharacterPosition(DOOR_EXIT_POSITION);
        setDollWalking(true);
        footsteps(6, 190);
      }, 500);

      // 3) doll door ke andar chali jaati hai
      later(() => {
        setDollWalking(false);
        setDollExit(true);
        sfx.whoosh();
      }, 1800);

      // 4) phir win screen
      later(() => {
        setEscaped(true);
        sfx.win(level === LEVELS.length);
      }, 2600);

      return;
    }

    sfx.wrong();

    setAttempts((current) => current + 1);

    setShake(true);

    later(() => {
      setShake(false);
      setCode("");
    }, 500);
  }

  function toggleMute() {
    const next = !isMuted();

    setMuted(next);
    setMutedState(next);

    if (!next) {
      sfx.click();
    }
  }

  function restart() {
    resetLevel();
  }

  function mainMenu() {
    resetRoom();
    setStarted(false);
    setLevel(1);
  }

  function nextLevel() {
    if (level >= LEVELS.length) return;

    resetRoom();
    setLevel(level + 1);

    sfx.open();
  }

  if (!started) {
    return (
      <main className="start-screen min-h-screen overflow-hidden px-5 py-6 text-slate-100">
        <div className="start-backdrop" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center">
          <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <section className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200 backdrop-blur-xl">
                <Sparkles className="size-4" />
                AI Mystery Adventure
              </div>

              <h1 className="font-display text-6xl font-black leading-[0.92] tracking-tight sm:text-7xl">
                ESCAPE
                <span className="block text-cyan-300">
                  THE ROOM.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                Explore two unique rooms, discover different hidden clues in each level, solve the mysteries, and unlock your way out.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={startGame}
                  className="primary-game-button"
                >
                  <DoorOpen className="size-5" />
                  Begin Investigation
                </button>
                <button
                  type="button"
                  onClick={() => setLevelSelectOpen(true)}
                  className="dashboard-secondary-button"
                >
                  <Sparkles className="size-5" />
                  Choose Level
                </button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                {[
                  ["02", "Unique Levels"],
                  ["04", "Clues Per Level"],
                  ["AI", "Smart Hints"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur-xl"
                  >
                    <div className="font-display text-xl font-black text-white">
                      {value}
                    </div>

                    <div className="mt-1 text-[11px] uppercase tracking-wider text-slate-400">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="relative mx-auto w-full max-w-2xl">
              <div className="start-art overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl shadow-cyan-950/40">
                <img
                  src="/room-scene.png"
                  alt="Escape room preview"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
              </div>

              <div className="absolute -bottom-4 left-6 rounded-2xl border border-white/15 bg-slate-950/85 px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur-xl">
                <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-emerald-400" />

                Two unique rooms · Two mysteries
              </div>
            </section>
          </div>
        </div>

        {levelSelectOpen && (
          <div
            className="modal-backdrop"
            onClick={() =>
              setLevelSelectOpen(false)
            }
          >
            <div
              className="object-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                className="absolute right-4 top-4"
                onClick={() =>
                  setLevelSelectOpen(false)
                }
              >
                <X className="size-5" />
              </button>

              <div className="modal-icon">
                🎮
              </div>

              <div className="eyebrow">
                LEVEL SELECT
              </div>

              <h2>Choose Your Level</h2>

              <p>
                Complete each level to unlock
                the next mystery.
              </p>

              <div className="mt-5 grid gap-3">
                {LEVELS.map(
                  (gameLevel) => {
                    const unlocked =
                      gameLevel.id === 1 ||
                      completedLevels.includes(
                        gameLevel.id - 1,
                      );

                    const completed =
                      completedLevels.includes(
                        gameLevel.id,
                      );

                    return (
                      <button
                        key={gameLevel.id}
                        disabled={!unlocked}
                        onClick={() =>
                          selectLevel(
                            gameLevel.id,
                          )
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          unlocked
                            ? "border-cyan-300/30 bg-white/10 hover:bg-white/15"
                            : "cursor-not-allowed border-white/5 bg-black/20 opacity-40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">
                            Level{" "}
                            {gameLevel.id} —{" "}
                            {gameLevel.name}
                          </span>

                          {completed ? (
                            <span className="text-emerald-400">
                              ✓
                            </span>
                          ) : unlocked ? (
                            <span className="text-cyan-300">
                              OPEN
                            </span>
                          ) : (
                            <Lock className="size-4" />
                          )}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {
                            gameLevel.subtitle
                          }
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="game-shell min-h-screen px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-[1500px]">
        <header className="game-header mb-3">
          <div className="brand-lockup">
            <div className="brand-mark">
              <Sparkles className="size-5" />
            </div>

            <div>
              <div className="font-display text-sm font-black tracking-wide text-white">
                ESCAPE ROOM
              </div>

              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                AI Mystery
              </div>
            </div>
          </div>

          <div className="hud-stat">
            <span>ROOM</span>
            <strong className="text-cyan-300">{String(level).padStart(2, "0")} / {String(LEVELS.length).padStart(2, "0")}</strong>
          </div>

          <div className="hud-stat">
            <span>TIME</span>
            <strong>{fmt(seconds)}</strong>
          </div>

          <div className="hud-stat">
            <span>CLUES</span>

            <strong className="text-cyan-300">
              {found.length}/{digitsTotal}
            </strong>
          </div>

          <div className="hud-stat">
            <span>HINTS</span>
            <strong>{hintIndex}</strong>
          </div>

          <div className="hud-stat">
            <span>WRONG</span>
            <strong>{attempts}</strong>
          </div>

          <div className="hud-spacer" />

          <button
            className="icon-button"
            onClick={toggleMute}
            title="Toggle sound"
          >
            {muted ? (
              <VolumeX className="size-5" />
            ) : (
              <Volume2 className="size-5" />
            )}
          </button>

          <button
            className="icon-button"
            onClick={() =>
              setMenuOpen(
                (current) => !current,
              )
            }
            title="Game menu"
          >
            <Settings className="size-5" />
          </button>
        </header>

        {menuOpen && (
          <div className="menu-popover">
            <button onClick={restart}>
              <RotateCcw className="size-4" />
              Restart Level
            </button>

            <button onClick={mainMenu}>
              <DoorOpen className="size-4" />
              Main Menu
            </button>

            <button
              onClick={() => setMenuOpen(false)}
            >
              <X className="size-4" />
              Close Menu
            </button>
          </div>
        )}

        <div className="mb-3 flex flex-wrap gap-2">
          <button
            className="action-button action-button-primary"
            onClick={() => {
              const firstMissing =
                roomObjects.find(
                  (object) =>
                    object.digit &&
                    !found.includes(
                      object.id,
                    ),
                );

              if (firstMissing) {
                inspect(firstMissing);
              }
            }}
          >
            <Bell className="size-4" />
            AI HINT
          </button>

          <button
            className="action-button"
            onClick={restart}
          >
            <RotateCcw className="size-4" />
            RESTART
          </button>

          <div className="room-tip">
            <span className="size-2 animate-pulse rounded-full bg-emerald-400" />

            Level {level}:{" "}
            {currentLevel.name}
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            LEVEL {level} ·{" "}
            {currentLevel.subtitle}
          </div>

          <div className="mt-1 text-sm text-slate-300">
            {currentLevel.description}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0 relative">
            <div
              className="room-stage"
              style={
                {
                  "--room-bg": `url(${currentLevel.background})`,
                } as React.CSSProperties
              }
            >
              <img
                src={currentLevel.background}
                alt={currentLevel.name}
                className="room-art"
              />

              <div className="room-vignette" />
              <div
                className={`exit-door-overlay ${doorOpen ? "exit-door-open" : ""}`}
                style={doorStyle}
                aria-hidden="true"
              >
                <div className="exit-door-light" />
                <div className="exit-door-panel" />
              </div>
              {!doorOpen && (
                <button
                  type="button"
                  className="door-keypad-trigger"
                  style={{ left: `${Math.min(door.left + door.width + 1, 94)}%`, top: `${door.top + door.height * 0.58}%` }}
                  onClick={(event) => { event.stopPropagation(); setKeypadOpen(true); sfx.click(); }}
                  aria-label="Open door keypad"
                  title="Inspect door keypad"
                >
                  <Lock className="size-4" />
                </button>
              )}

              {roomObjects.map(
                (object) => (
                  <button
                    key={object.id}
                    style={object.style}
                    onClick={() =>
                      inspect(object)
                    }
                    onMouseEnter={() =>
                      sfx.hover()
                    }
                    className={`hotspot ${
                      found.includes(
                        object.id,
                      )
                        ? "hotspot-found"
                        : ""
                    }`}
                    aria-label={`Inspect ${object.name}`}
                  >
                    <span className="hotspot-label">
                      {object.name}
                    </span>

                    {object.digit &&
                      found.includes(
                        object.id,
                      ) && (
                        <span className="found-chip">
                          {object.digit}
                        </span>
                      )}
                  </button>
                ),
              )}

              <div
                className={`investigator ${
                  walkingTo || dollWalking ? "walking" : ""
                } ${dollWalking ? "investigator-door" : ""} ${
                  dollExit ? "investigator-exit" : ""
                }`}
                style={characterPosition ?? undefined}
              >
                <img
                  src="/doll.png"
                  alt=""
                  className="doll-img"
                  draggable={false}
                />
                <div className="character-shadow" />
              </div>

              {walkingTo && (
                <div className="inspection-bubble">
                  Investigating{" "}
                  {walkingTo.name}…
                </div>
              )}

              <div className="room-status">
                <span className="status-dot" />

                Level {level} ·{" "}
                {currentLevel.name}
              </div>
            </div>

            {keypadOpen && !doorOpen && (
            <div
              className="keypad-modal-backdrop keypad-inline-backdrop"
              style={{ left: `${Math.min(Math.max(door.left + door.width - 8, 42), 58)}%`, top: `${Math.max(door.top + 8, 20)}%` }}
              onClick={() => setKeypadOpen(false)}
            >
            <div className="keypad-card keypad-inline-card" role="dialog" aria-modal="true" aria-label="Exit keypad" onClick={(event) => event.stopPropagation()}>
              <button className="keypad-close" onClick={() => setKeypadOpen(false)} aria-label="Close keypad"><X className="size-5" /></button>
              <div className="keypad-display-wrap">
                <div className="eyebrow">
                  EXIT LOCK
                </div>

                <div
                  className={`keypad-display ${
                    shake ? "shake" : ""
                  }`}
                >
                  {code.padEnd(
                    4,
                    "•",
                  )}
                </div>

                <p>
                  {attempts === 0
                    ? "Enter the four-digit code found in this level."
                    : `${attempts} incorrect attempt${
                        attempts > 1
                          ? "s"
                          : ""
                      }. Try again.`}
                </p>
              </div>

              <div className="keypad-grid">
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "0",
                ].map((digit) => (
                  <button
                    key={digit}
                    onClick={() =>
                      press(digit)
                    }
                  >
                    {digit}
                  </button>
                ))}

                <button
                  className="key-clear"
                  onClick={() =>
                    setCode("")
                  }
                >
                  CLEAR
                </button>

                <button
                  className="key-unlock"
                  onClick={submit}
                >
                  <DoorOpen className="size-4" />
                  UNLOCK
                </button>
              </div>
            </div>
            </div>
            )}
          </section>

          <div className="assistant-wrap">
            <Assistant
              key={level}
              levelId={level}
              levelName={
                currentLevel.name
              }
              hints={currentLevel.hints}
              hintIndex={hintIndex}
              undiscoveredClues={(["clock", "bookshelf", "computer", "poster"] as const).flatMap((id) => { const object = roomObjects.find((item) => item.id === id); return object && object.digit && !found.includes(object.id) ? [{ id: object.id, name: object.name }] : []; })}
              foundClueIds={found}
              onHintUsed={() =>
                setHintIndex(
                  (current) =>
                    current + 1,
                )
              }
            />
          </div>
        </div>
      </div>

      {open && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setOpen(null)
          }
        >
          <div
            className="object-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-icon">
              {open.emoji}
            </div>

            <div className="eyebrow">
              LEVEL {level} · OBJECT INSPECTION
            </div>

            <h2>{open.title}</h2>

            <p>{open.body}</p>

            {open.digit && (
              <div className="digit-reveal">
                CLUE FOUND{" "}
                <strong>
                  {open.digit}
                </strong>
              </div>
            )}

            <button
              className="modal-close"
              onClick={() =>
                setOpen(null)
              }
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}

      {levelSelectOpen && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setLevelSelectOpen(false)
          }
        >
          <div
            className="object-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="absolute right-4 top-4"
              onClick={() =>
                setLevelSelectOpen(false)
              }
            >
              <X className="size-5" />
            </button>

            <div className="modal-icon">
              🎮
            </div>

            <div className="eyebrow">
              LEVEL SELECT
            </div>

            <h2>Choose Level</h2>

            <p>
              Complete a level to unlock the
              next one.
            </p>

            <div className="mt-5 grid gap-3">
              {LEVELS.map(
                (gameLevel) => {
                  const unlocked =
                    gameLevel.id === 1 ||
                    completedLevels.includes(
                      gameLevel.id - 1,
                    );

                  const completed =
                    completedLevels.includes(
                      gameLevel.id,
                    );

                  return (
                    <button
                      key={gameLevel.id}
                      disabled={!unlocked}
                      onClick={() =>
                        selectLevel(
                          gameLevel.id,
                        )
                      }
                      className={`rounded-2xl border p-4 text-left transition ${
                        unlocked
                          ? "border-cyan-300/30 bg-white/10 hover:bg-white/15"
                          : "cursor-not-allowed border-white/5 bg-black/20 opacity-40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          Level{" "}
                          {gameLevel.id} —{" "}
                          {gameLevel.name}
                        </span>

                        {completed ? (
                          <span className="text-emerald-400">
                            ✓
                          </span>
                        ) : unlocked ? (
                          <span className="text-cyan-300">
                            OPEN
                          </span>
                        ) : (
                          <Lock className="size-4" />
                        )}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        {
                          gameLevel.subtitle
                        }
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>
      )}

      {escaped && (
        <div className="modal-backdrop win-backdrop">
          <div className="confetti" aria-hidden="true">
            {CONFETTI.map((c, i) => (
              <span
                key={i}
                style={{
                  left: `${c.left}%`,
                  width: c.size,
                  height: c.size * 1.6,
                  background: c.color,
                  animationDelay: `${c.delay}s`,
                  animationDuration: `${c.dur}s`,
                }}
              />
            ))}
          </div>
          <div className="win-modal">
            <div className="win-orb">
              ✓
            </div>

            <div className="eyebrow">
              ROOM COMPLETE
            </div>

            <h2>
              {level ===
              LEVELS.length
                ? "YOU ESCAPED"
                : "ROOM CLEARED"}
            </h2>

            <p>
              You solved the mystery and escaped the room. Great work, investigator!
            </p>

            <div className="win-stats">
              <span>
                Time{" "}
                <b>
                  {fmt(seconds)}
                </b>
              </span>

              <span>
                Hints{" "}
                <b>
                  {hintIndex}
                </b>
              </span>

              <span>
                Wrong{" "}
                <b>
                  {attempts}
                </b>
              </span>
            </div>

            <button className="primary-game-button" onClick={mainMenu}>
              <RotateCcw className="size-5" />
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </main>
  );
}