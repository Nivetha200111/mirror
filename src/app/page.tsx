"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Activity,
  Share2,
  RefreshCw,
  ShieldCheck,
  Triangle,
  Gauge,
  BadgePercent,
} from "lucide-react";
import { traits, maxTraits, minTraits } from "@/data/traits";
import { mentors } from "@/data/mentors";
import { analyzeGap } from "@/utils/gapAnalyzer";
import { attributeLabel, buildUserVector, findBestMentor } from "@/utils/matcher";
import { ATTRIBUTE_KEYS, GapSummary, MatchResult, Trait } from "@/types";

const sectionMotion = {
  initial: { opacity: 0, y: 24, skewY: 2 },
  whileInView: { opacity: 1, y: 0, skewY: 0 },
  viewport: { once: true },
  transition: { type: "spring", stiffness: 260, damping: 24 },
};

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
      whileHover={{ x: [0, -3, 3, 0], skewX: [0, -2, 2, 0] }}
      transition={{ duration: 0.24, repeat: 0, ease: [0.45, 0, 0.55, 1] }}
      onClick={() => onToggle(trait.id)}
      className={`group flex flex-col gap-2 border-2 p-4 text-left font-mono uppercase tracking-tight transition-all duration-150 sm:p-5 ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent)] text-black shadow-[8px_8px_0_#ffffff40]"
          : "border-white/70 bg-black text-white hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }`}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold">{trait.category}</span>
        <span className="text-[10px] font-semibold opacity-70">
          {selected ? "LOCKED" : "TAP"}
        </span>
      </div>
      <div className="text-lg font-bold leading-tight sm:text-xl">{trait.label}</div>
      <p className={`text-[12px] leading-snug ${selected ? "text-black/70" : "text-white/70"}`}>
        {trait.note}
      </p>
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
      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.16em] text-white/70">
        <span>{attributeLabel[attribute]}</span>
        <span>
          you {userScore}/10 · mentor {mentorScore}/10
        </span>
      </div>
      <div className="relative h-3 w-full border-2 border-white bg-black">
        <div
          className="absolute inset-y-0 left-0 bg-[var(--hot)]"
          style={{ width: `${mentorPercent}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-[var(--accent)]"
          style={{ width: `${userPercent}%` }}
        />
      </div>
    </div>
  );
};

export default function Home() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [gap, setGap] = useState<GapSummary | null>(null);
  const [advice, setAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const selectedTraits = useMemo(
    () => traits.filter((trait) => selectedIds.includes(trait.id)),
    [selectedIds],
  );

  const toggleTrait = (id: string) => {
    setError(null);
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= maxTraits) {
        setError(`Pick ${maxTraits} max. Mirrors crack if you overload them.`);
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
      setAdvice(data.advice || "Short. Blunt. Move now.");
    } catch (err) {
      console.error(err);
      setAdvice(
        `${nextGap.attribute.toUpperCase()} fissure. Borrow ${nextMatch.mentor.name}'s habit: do one scary outreach daily, document proof, repeat until numb.`,
      );
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleMatch = async () => {
    if (selectedTraits.length < minTraits) {
      setError(`Pick at least ${minTraits}. Too little signal.`);
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
    const summary = `The Mirror says I'm ${match.compatibility}% sync with ${match.mentor.name}. Fissure: ${gap.attribute}. What about you?`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "The Mirror", text: summary });
        setShareMessage("Shared. Let them look.");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
        setShareMessage("Copied. Drop it.");
      }
    } catch (err) {
      console.error(err);
      setShareMessage("Could not share. Screenshot this screen instead.");
    } finally {
      setTimeout(() => setShareMessage(null), 2400);
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
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-white/80">
            <span className="flex items-center gap-2 bg-white px-3 py-1 font-bold text-black">
              <Zap size={14} /> The Mirror
            </span>
            <span className="px-2 py-1">Brutalist Digital Mirror</span>
            <span className="px-2 py-1 text-[var(--accent)]">Zero corporate vibes</span>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--accent)]">The Inventory</p>
              <h1 className="text-4xl font-extrabold leading-none sm:text-5xl md:text-6xl">WHO ARE YOU?</h1>
              <p className="max-w-2xl text-base leading-relaxed text-white/80">
                Tap 3-5 vibes. No polite corporate forms. This mirror wants the raw feed.
              </p>
              <div className="flex flex-wrap gap-3 text-sm font-mono uppercase">
                <span className="border-2 border-white px-3 py-2">Acid Green + Hot Pink</span>
                <span className="border-2 border-white px-3 py-2">Sharp edges only</span>
                <span className="border-2 border-white px-3 py-2">No fluff</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-2 border-white bg-white/5 p-4 font-mono uppercase tracking-[0.2em] text-sm text-white">
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <ShieldCheck size={16} /> Real recognizes raw
              </div>
              <p className="leading-snug text-white/80">
                The Mirror maps your chaos to a mentor. Then exposes the fissure you need to weld.
              </p>
            </div>
          </div>
        </motion.header>

        <motion.section {...sectionMotion} className="space-y-5" id="inventory">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/70">Page 1</p>
              <h2 className="text-2xl font-bold">The Inventory</h2>
              <p className="text-sm text-white/70">Pick the vibes that actually match you.</p>
            </div>
            <div className="flex gap-2 font-mono text-xs uppercase">
              <span className="border-2 border-white px-3 py-2">Min {minTraits}</span>
              <span className="border-2 border-white px-3 py-2">Max {maxTraits}</span>
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

          {error && (
            <div className="flex items-center gap-2 border-2 border-[var(--hot)] bg-[var(--hot)]/10 px-4 py-3 text-sm font-mono uppercase text-[var(--hot)]">
              <Triangle size={16} /> {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleMatch}
              className="inline-flex items-center gap-2 border-2 border-white bg-white px-5 py-3 font-bold uppercase tracking-[0.2em] text-black shadow-[6px_6px_0_#ccff00] transition hover:-translate-y-[1px]"
            >
              <Activity size={16} /> Check Mirror
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 border-2 border-white px-5 py-3 font-bold uppercase tracking-[0.2em] text-white transition hover:text-[var(--accent)]"
            >
              <RefreshCw size={16} /> Clear
            </button>
            {selectedTraits.length > 0 && (
              <div className="flex items-center gap-2 border-2 border-white px-4 py-2 font-mono text-xs uppercase text-white/80">
                {selectedTraits.length} locked in
              </div>
            )}
          </div>
        </motion.section>

        {match && gap && (
          <motion.section {...sectionMotion} className="space-y-4" id="reflection">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/70">Page 2</p>
                <h2 className="text-2xl font-bold">The Reflection</h2>
                <p className="text-sm text-white/70">No congratulations. Just the readout.</p>
              </div>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 border-2 border-white px-4 py-2 font-bold uppercase tracking-[0.2em] text-white hover:text-[var(--accent)]"
              >
                <Share2 size={16} /> Broadcast
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.6fr_1.2fr]">
              <div className="space-y-5 border-2 border-white bg-black p-6 shadow-[10px_10px_0_#ff1f8f] md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--accent)]">Your mirror match</p>
                    <h3 className="text-3xl font-extrabold">{match.mentor.name}</h3>
                    <p className="text-lg text-white/80">{match.mentor.title}</p>
                    <p className="max-w-xl text-sm text-white/70">{match.mentor.bio}</p>
                    <div className="flex flex-wrap gap-2 text-[11px] font-mono uppercase text-white/70">
                      {match.mentor.traits.map((trait) => (
                        <span key={trait} className="border border-white px-2 py-1">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/60">Sync</span>
                    <div className="flex items-center gap-2 text-5xl font-extrabold text-[var(--accent)]">
                      {match.compatibility}%
                      <BadgePercent size={28} />
                    </div>
                    <span className="text-xs font-mono uppercase text-white/60">Lower distance = tighter sync</span>
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
                    <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--accent)]">The Reflection</p>
                    <h3 className="text-xl font-extrabold text-white">{gapLabel}</h3>
                    <p className="text-sm text-white/70">
                      {gap.delta > 0
                        ? `${match.mentor.name} sits ${gap.delta.toFixed(1)} points higher here.`
                        : "Neck and neck. Don't relax."}
                    </p>
                  </div>
                  <div className="border-2 border-white px-4 py-3 text-right">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">Delta</p>
                    <p className="text-3xl font-extrabold text-[var(--hot)]">{Math.max(gap.delta, 0).toFixed(1)}</p>
                  </div>
                </div>

                <div className="space-y-3 border-2 border-white bg-white/5 p-4">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
                    <Gauge size={14} /> The fissure note
                  </div>
                  <p className="text-sm leading-relaxed text-white">
                    {loadingAdvice ? "Calibrating..." : advice}
                  </p>
                </div>

                <div className="space-y-2 border-2 border-white bg-white/5 p-4 font-mono text-xs uppercase tracking-[0.2em] text-white">
                  <div className="flex items-center gap-2 text-[var(--hot)]">
                    <Triangle size={14} /> Screenshot this. Blast it.
                  </div>
                  <p className="text-white/80">
                    The Mirror is a brag and a dare. Post the sync score and fissure on your story.
                  </p>
                  <button
                    onClick={handleShare}
                    className="inline-flex w-fit items-center gap-2 border-2 border-white bg-white px-3 py-2 font-bold tracking-[0.2em] text-black shadow-[5px_5px_0_#ff1f8f] transition hover:-translate-y-[1px]"
                  >
                    <Share2 size={16} /> Broadcast
                  </button>
                  {shareMessage && <span className="text-[11px] text-[var(--accent)]">{shareMessage}</span>}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
