"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, type MotionProps } from "framer-motion";
import {
  Activity,
  Share2,
  RefreshCw,
  Triangle,
  Gauge,
  BadgePercent,
  Cpu,
} from "lucide-react";
import { mentors } from "@/data/mentors";
import { analyzeGap } from "@/utils/gapAnalyzer";
import { attributeLabel, buildUserVector, findBestMentor } from "@/utils/matcher";
import { ATTRIBUTE_KEYS, GapSummary, MatchResult, Trait, Vector } from "@/types";
import { maxTraits, minTraits } from "@/data/traits";

const sectionMotion: MotionProps = {
  initial: { opacity: 0, y: 24, skewY: 2 },
  whileInView: { opacity: 1, y: 0, skewY: 0 },
  viewport: { once: true },
  transition: { type: "spring", stiffness: 260, damping: 24 },
};

const clampScore = (value: number) => Math.min(10, Math.max(0, value));

const deriveImpact = (label: string): Vector => {
  const seed = label
    .toUpperCase()
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const n = (shift: number) => ((seed >> shift) % 5) - 2; // -2..2

  return {
    risk: clampScore(5 + n(1)),
    network: clampScore(5 + n(3)),
    grind: clampScore(5 + n(5)),
    education: clampScore(5 + n(7)),
    resilience: clampScore(5 + n(9)),
  };
};

const inflateTrait = (raw: { id: string | number; label: string; votes?: number }): Trait => ({
  id: String(raw.id ?? raw.label),
  label: raw.label.toUpperCase(),
  category: "Vibe",
  note: raw.votes ? `VOTES_${raw.votes}` : undefined,
  impact: deriveImpact(raw.label),
});

const TraitTile = ({
  trait,
  selected,
  onToggle,
}: {
  trait: Trait;
  selected: boolean;
  onToggle: (id: string) => void;
}) => {
  return (
    <motion.button
      whileHover={{ x: [0, -2, 2, 0], skewX: [0, -3, 3, 0] }}
      transition={{ duration: 0.2, ease: [0.45, 0, 0.55, 1] }}
      onClick={() => onToggle(trait.id)}
      className={`group flex flex-col gap-2 border-2 p-4 text-left font-mono tracking-tight transition-all duration-150 sm:p-5 ${
        selected
          ? "border-[#ccff00] bg-[#ccff00] text-black shadow-[8px_8px_0_#ff00ff]"
          : "border-[#ccff00] bg-black text-[#ccff00] hover:border-white hover:text-white"
      }`}
    >
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-bold">NODE</span>
        <span className="font-semibold opacity-80">{selected ? "LOCK" : "ARM"}</span>
      </div>
      <div className="text-lg font-extrabold leading-tight sm:text-xl">[ {trait.label} ]</div>
      {trait.note && (
        <p className={`text-[11px] leading-snug ${selected ? "text-black/80" : "text-[#ccff00]"}`}>
          {trait.note}
        </p>
      )}
    </motion.button>
  );
};

const AttributeMeter = ({
  attribute,
  userScore,
  mentorScore,
}: {
  attribute: keyof typeof attributeLabel;
  userScore: number;
  mentorScore: number;
}) => {
  const userPercent = Math.min(100, (userScore / 10) * 100);
  const mentorPercent = Math.min(100, (mentorScore / 10) * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] font-mono tracking-[0.2em] text-white/80">
        <span>{attributeLabel[attribute]}</span>
        <span>
          YOU {userScore}/10 · NODE {mentorScore}/10
        </span>
      </div>
      <div className="relative h-3 w-full border-2 border-white bg-black">
        <div
          className="absolute inset-y-0 left-0 bg-[#ff00ff]"
          style={{ width: `${mentorPercent}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-[#ccff00]"
          style={{ width: `${userPercent}%` }}
        />
      </div>
    </div>
  );
};

const OrgMap = ({ gap }: { gap: GapSummary | null }) => {
  const good = gap ? gap.delta <= 0 : false;
  const fissureColor = good ? "#ccff00" : "#ff00ff";

  return (
    <svg viewBox="0 0 320 180" className="h-40 w-full border-2 border-white bg-black">
      <rect x="20" y="20" width="90" height="40" fill="none" stroke="#ccff00" strokeWidth="2" />
      <text x="25" y="45" fill="#ccff00" fontSize="12" fontFamily="monospace">
        USER
      </text>

      <rect x="210" y="20" width="90" height="40" fill="none" stroke="#ff00ff" strokeWidth="2" />
      <text x="215" y="45" fill="#ff00ff" fontSize="12" fontFamily="monospace">
        MENTOR
      </text>

      <line x1="110" y1="40" x2="210" y2="40" stroke={fissureColor} strokeWidth="3" />

      <rect x="115" y="110" width="90" height="40" fill="none" stroke={fissureColor} strokeWidth="2" />
      <text x="120" y="135" fill={fissureColor} fontSize="12" fontFamily="monospace">
        {gap ? `FISSURE_${attributeLabel[gap.attribute].toUpperCase()}` : "SYNC_LINE"}
      </text>

      <line x1="65" y1="60" x2="160" y2="110" stroke={fissureColor} strokeWidth="3" />
      <line x1="255" y1="60" x2="160" y2="110" stroke={fissureColor} strokeWidth="3" />
    </svg>
  );
};

type DbTrait = { id: string | number; label: string; votes?: number };

export default function Home() {
  const [traits, setTraits] = useState<Trait[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [gap, setGap] = useState<GapSummary | null>(null);
  const [advice, setAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/traits");
        if (!res.ok) {
          const info = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(info.error || `HTTP_${res.status}`);
        }
        const data = (await res.json()) as DbTrait[];
        if (!Array.isArray(data)) throw new Error("Bad payload");
        setTraits(data.map(inflateTrait));
      } catch (err) {
        console.error(err);
        setError("CONFIG OFFLINE. CHECK SUPABASE URL/KEY & TABLE.");
      }
    };
    load();
  }, []);

  const selectedTraits = useMemo(
    () => traits.filter((trait) => selectedIds.includes(trait.id)),
    [traits, selectedIds],
  );

  const toggleTrait = (id: string) => {
    setError(null);
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= maxTraits) {
        setError(`CAP AT ${maxTraits}. TOO MUCH NOISE.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const reset = () => {
    setSelectedIds([]);
    setMatch(null);
    setGap(null);
    setAdvice("");
    setError(null);
  };

  const requestAdvice = async (nextGap: GapSummary, nextMatch: MatchResult) => {
    setLoadingAdvice(true);
    try {
      const res = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userTraits: selectedTraits.map((trait) => trait.label),
          mentor: nextMatch.mentor,
          gap: nextGap,
        }),
      });

      if (!res.ok) {
        throw new Error("Advice fetch failed");
      }

      const data = (await res.json()) as { advice?: string };
      setAdvice(data.advice || "> EXECUTE: PATCH DAILY."
      );
    } catch (err) {
      console.error(err);
      setAdvice(
        `> EXECUTE: ${nextGap.attribute.toUpperCase()} PATCH. ONE OUTREACH PER DAY UNTIL LOG IS CLEAN.`,
      );
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleMatch = async () => {
    if (selectedTraits.length < minTraits) {
      setError(`NEED ${minTraits}+ NODES FOR SIGNAL.`);
      return;
    }

    const userVector = buildUserVector(selectedTraits);
    const nextMatch = findBestMentor(userVector, mentors);
    const nextGap = analyzeGap(userVector, nextMatch.mentor.dna);

    setMatch(nextMatch);
    setGap(nextGap);
    await requestAdvice(nextGap, nextMatch);
  };

  const handleShare = async () => {
    if (!match || !gap) return;
    const summary = `THE_MIRROR SYNC ${match.compatibility}% WITH ${match.mentor.name}. FISSURE ${gap.attribute}.`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "THE_MIRROR", text: summary });
        setShareMessage("BROADCASTED.");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
        setShareMessage("COPIED.");
      }
    } catch (err) {
      console.error(err);
      setShareMessage("SCREENSHOT IT.");
    } finally {
      setTimeout(() => setShareMessage(null), 2400);
    }
  };

  const handleAdd = async () => {
    const label = input.trim();
    if (!label) return;

    const optimistic = inflateTrait({ id: `tmp-${Date.now()}`, label });
    setTraits((prev) => [optimistic, ...prev]);
    setInput("");

    try {
      const res = await fetch("/api/traits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (res.ok) {
        const saved = (await res.json()) as DbTrait;
        setTraits((prev) => [inflateTrait(saved), ...prev.filter((t) => t.id !== optimistic.id)]);
      } else {
        throw new Error("Insert failed");
      }
    } catch (err) {
      console.error(err);
      setError("DB WRITE FAILED. RETRY.");
    }
  };

  const gapLabel = gap ? `THE FISSURE: ${attributeLabel[gap.attribute].toUpperCase()}` : "THE FISSURE";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:px-10">
        <motion.header
          {...sectionMotion}
          className="border-2 border-white bg-black p-6 shadow-[10px_10px_0_#ccff00] sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono tracking-[0.3em] text-white">
            <span className="flex items-center gap-2 bg-white px-3 py-1 font-bold text-black">&gt; THE_MIRROR</span>
            <span className="px-2 py-1 text-[#ccff00]">CONFIG_SELECT</span>
            <span className="px-2 py-1 text-[#ff00ff]">RAW PROTOCOL</span>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold leading-none sm:text-5xl md:text-6xl">WHO ARE YOU?</h1>
              <p className="max-w-2xl text-base leading-relaxed text-white/80">
                TAP 3-5 NODES. THIS IS NOT HR. THIS IS CONFIG.
              </p>
            </div>
            <div className="flex flex-col gap-3 border-2 border-white bg-black p-4 text-sm text-white">
              <div className="flex items-center gap-2 text-[#ccff00]">
                <Cpu size={16} /> SYSTEM ONLINE
              </div>
              <p className="leading-snug text-white/80">
                SELECT YOUR SIGNAL. PATCH NEW TAGS IF OUR DB MISSES YOUR VIBE.
              </p>
            </div>
          </div>
        </motion.header>

        <motion.section {...sectionMotion} className="space-y-5" id="inventory">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] tracking-[0.3em] text-white/70">PAGE_1 // CONFIG_SELECT</p>
              <h2 className="text-2xl font-bold">NODE GRID</h2>
              <p className="text-sm text-white/70">ARM NODES THAT MATCH YOUR CURRENT CONFIG.</p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="border-2 border-white px-3 py-2">MIN {minTraits}</span>
              <span className="border-2 border-white px-3 py-2">MAX {maxTraits}</span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {traits.map((trait) => (
              <TraitTile
                key={trait.id}
                trait={trait}
                selected={selectedIds.includes(trait.id)}
                onToggle={toggleTrait}
              />
            ))}
          </div>

          <div className="border-2 border-[#ff00ff] bg-black p-4 text-sm text-white">
            <div className="flex items-center gap-3">
              <span className="text-[#ccff00]">&gt;</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                placeholder="INPUT_PROTOCOL"
                className="w-full bg-transparent outline-none"
              />
              <button
                onClick={handleAdd}
                className="border-2 border-[#ff00ff] bg-[#ff00ff] px-4 py-2 font-bold text-black"
              >
                [ADD_TO_DB]
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 border-2 border-[#ff00ff] bg-[#ff00ff]/10 px-4 py-3 text-sm text-[#ff00ff]">
              <Triangle size={16} /> {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleMatch}
              className="inline-flex items-center gap-2 border-2 border-white bg-white px-5 py-3 font-bold tracking-[0.2em] text-black shadow-[6px_6px_0_#ccff00] transition hover:-translate-y-[1px]"
            >
              <Activity size={16} /> CHECK MIRROR
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 border-2 border-white px-5 py-3 font-bold tracking-[0.2em] text-white transition hover:text-[#ccff00]"
            >
              <RefreshCw size={16} /> RESET
            </button>
            {selectedTraits.length > 0 && (
              <div className="flex items-center gap-2 border-2 border-white px-4 py-2 text-xs text-white/80">
                {selectedTraits.length} NODES ARMED
              </div>
            )}
          </div>
        </motion.section>

        {match && gap && (
          <motion.section {...sectionMotion} className="space-y-4" id="reflection">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] tracking-[0.3em] text-white/70">PAGE_2 // OUTPUT</p>
                <h2 className="text-2xl font-bold">SYSTEM SYNC</h2>
                <p className="text-sm text-white/70">DATA ONLY. NO FLUFF.</p>
              </div>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 border-2 border-white px-4 py-2 font-bold tracking-[0.2em] text-white hover:text-[#ccff00]"
              >
                <Share2 size={16} /> BROADCAST
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.6fr_1.2fr]">
              <div className="space-y-5 border-2 border-white bg-black p-6 shadow-[10px_10px_0_#ff00ff] md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-[11px] tracking-[0.3em] text-[#ccff00]">MATCH NODE</p>
                    <h3 className="text-3xl font-extrabold">{match.mentor.name}</h3>
                    <p className="text-lg text-white/80">{match.mentor.title}</p>
                    <p className="max-w-xl text-sm text-white/70">{match.mentor.bio}</p>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {match.mentor.traits.map((trait) => (
                        <span key={trait} className="border-2 border-white px-2 py-1">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <span className="text-[11px] tracking-[0.3em] text-white/60">SYNC</span>
                    <div className="flex items-center gap-2 text-5xl font-extrabold text-[#ccff00]">
                      {match.compatibility}%
                      <BadgePercent size={28} />
                    </div>
                    <span className="text-xs text-white/60">LOWER DIFF = TIGHTER SYNC</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  {ATTRIBUTE_KEYS.map((attribute) => (
                    <AttributeMeter
                      key={attribute}
                      attribute={attribute}
                      userScore={match.userVector[attribute]}
                      mentorScore={match.mentor.dna[attribute]}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-2 border-white bg-black p-6 shadow-[10px_10px_0_#ccff00]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] tracking-[0.3em] text-[#ccff00]">THE REFLECTION</p>
                    <h3 className="text-xl font-extrabold text-white">{gapLabel}</h3>
                    <p className="text-sm text-white/70">
                      {gap.delta > 0
                        ? `${match.mentor.name} SITS ${gap.delta.toFixed(1)} UNITS AHEAD HERE.`
                        : "SYNCED ON THIS LINE."}
                    </p>
                  </div>
                  <div className="border-2 border-white px-4 py-3 text-right">
                    <p className="text-[10px] tracking-[0.3em] text-white/60">DIFF</p>
                    <p className="text-3xl font-extrabold text-[#ff00ff]">{Math.max(gap.delta, 0).toFixed(1)}</p>
                  </div>
                </div>

                <OrgMap gap={gap} />

                <div className="space-y-3 border-2 border-white bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-xs tracking-[0.25em] text-[#ccff00]">
                    <Gauge size={14} /> COMPILING_PATCH...
                  </div>
                  <p className="text-sm leading-relaxed text-white">
                    {loadingAdvice ? "> EXECUTE: HOLD." : advice || "> EXECUTE: PATCH NOW."}
                  </p>
                </div>

                <div className="space-y-2 border-2 border-white bg-white/5 p-4 text-xs">
                  <p className="text-[#ff00ff]">SCREENSHOT + POST THE SYNC AND FISSURE. LET CREW VERIFY.</p>
                  <button
                    onClick={handleShare}
                    className="inline-flex w-fit items-center gap-2 border-2 border-white bg-white px-3 py-2 font-bold tracking-[0.2em] text-black shadow-[5px_5px_0_#ff00ff] transition hover:-translate-y-[1px]"
                  >
                    <Share2 size={16} /> BROADCAST
                  </button>
                  {shareMessage && <span className="text-[11px] text-[#ccff00]">{shareMessage}</span>}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
