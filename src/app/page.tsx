"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Compass,
  Wand2,
  Check,
  Plus,
  Brain,
  Loader2,
  Share2,
  RefreshCw,
  Target,
} from "lucide-react";
import { traits, maxTraits, minTraits } from "@/data/traits";
import { mentors } from "@/data/mentors";
import { analyzeGap } from "@/utils/gapAnalyzer";
import { attributeLabel, buildUserVector, findBestMentor } from "@/utils/matcher";
import { ATTRIBUTE_KEYS, GapSummary, MatchResult, Trait } from "@/types";

const sectionMotion = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: "easeOut" },
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
  const initials = trait.label
    .split(" ")
    .map((word) => word[0])
    .join("");

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onToggle(trait.id)}
      className={`group relative flex flex-col gap-2 rounded-2xl border p-4 text-left shadow-lg transition-all ${
        selected
          ? "border-cyan-400/60 bg-cyan-400/5 shadow-cyan-500/20"
          : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
        <span>{trait.category}</span>
        <span
          className={`rounded-full px-2 py-1 text-[11px] font-medium ${
            selected ? "bg-cyan-500/20 text-cyan-100" : "bg-slate-800 text-slate-300"
          }`}
        >
          {selected ? "Selected" : "Tap to add"}
        </span>
      </div>
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-semibold ${
            selected ? "bg-cyan-500/20 text-cyan-100" : "bg-slate-800 text-slate-200"
          }`}
        >
          {initials}
        </div>
        <div className="space-y-1">
          <div className="text-lg font-semibold text-slate-100">{trait.label}</div>
          <p className="text-sm text-slate-400">{trait.note}</p>
        </div>
      </div>
      <div className="absolute right-3 top-3 rounded-full border border-white/10 p-2 text-slate-200">
        {selected ? <Check size={16} /> : <Plus size={16} />}
      </div>
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
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
        <span>{attributeLabel[attribute]}</span>
        <span className="text-slate-300">
          You {userScore}/10 · Mentor {mentorScore}/10
        </span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-slate-900/60">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-fuchsia-500/70 to-purple-500/70"
          style={{ width: `${mentorPercent}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-sky-400"
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

  const categorizedTraits = useMemo(() => {
    const map = new Map<string, Trait[]>();
    traits.forEach((trait) => {
      map.set(trait.category, [...(map.get(trait.category) || []), trait]);
    });
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  }, []);

  const toggleTrait = (id: string) => {
    setError(null);
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= maxTraits) {
        setError(`Pick up to ${maxTraits} traits to keep it focused.`);
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
      setAdvice(data.advice || "We will craft your bridge once the AI is ready.");
    } catch (err) {
      console.error(err);
      setAdvice(
        `Your biggest stretch is ${nextGap.attribute}. Steal ${nextMatch.mentor.name}'s habit: ship one small proof a week, ask two new people for help, and show receipts so your network compounds.`,
      );
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleMatch = async () => {
    if (selectedTraits.length < minTraits) {
      setError(`Select at least ${minTraits} traits so the match means something.`);
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
    const summary = `The Mirror matched me with ${match.mentor.name} (${match.mentor.title}). My bridge: focus on ${gap.attribute} to close the gap. Want to try it?`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "The Mirror Match", text: summary });
        setShareMessage("Shared! Ping your circle.");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
        setShareMessage("Copied. Drop it in WhatsApp/LinkedIn.");
      }
    } catch (err) {
      console.error(err);
      setShareMessage("Could not share, but you can screenshot this card.");
    } finally {
      setTimeout(() => setShareMessage(null), 2200);
    }
  };

  const gapLabel = gap ? `${attributeLabel[gap.attribute]} Gap` : "Bridge Card";

  return (
    <div className="min-h-screen bg-slate-950 pb-16 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-10 sm:px-6 lg:px-10">
        <motion.header
          {...sectionMotion}
          className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-cyan-500/10 sm:p-8 lg:p-10"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-cyan-200">
            <span className="flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1">
              <Sparkles size={14} />
              The Mirror 1.0
            </span>
            <span className="text-slate-400">Tinder for Success</span>
            <span className="text-slate-400">Indian Origin Stories → Mentors</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                Match your struggles to a global great.
              </h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                Pick 3-5 traits, get a mentor whose DNA mirrors your journey, and an AI-crafted bridge to close your biggest gap.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
                  <Compass size={15} /> 5D Vector Matching
                </span>
                <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
                  <Brain size={15} /> GPT-4o-mini Advice
                </span>
                <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
                  <Target size={15} /> Share-ready card
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <div className="flex items-center gap-2 text-cyan-200">
                <Wand2 size={18} /> 10,000 user launch goal
              </div>
              <p className="text-slate-400">Built for Indian middle-class ambition.</p>
            </div>
          </div>
        </motion.header>

        <motion.section {...sectionMotion} className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Module A</p>
              <h2 className="text-2xl font-semibold">Your Origin Story</h2>
              <p className="text-slate-400">Select 3-5 cards that scream who you are right now.</p>
            </div>
            <div className="flex gap-2 text-sm text-slate-300">
              <span className="rounded-full bg-white/5 px-3 py-1">Min {minTraits}</span>
              <span className="rounded-full bg-white/5 px-3 py-1">Max {maxTraits}</span>
            </div>
          </div>

          <div className="grid gap-4">
            {categorizedTraits.map(({ category, items }) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="h-px w-6 bg-gradient-to-r from-cyan-400 to-fuchsia-500" />
                  <span className="uppercase tracking-[0.2em] text-slate-400">{category}</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((trait) => (
                    <TraitTile
                      key={trait.id}
                      trait={trait}
                      selected={selectedIds.includes(trait.id)}
                      onToggle={toggleTrait}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              <Target size={16} /> {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleMatch}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:-translate-y-[1px] hover:shadow-xl hover:shadow-fuchsia-500/20"
            >
              <Sparkles size={18} /> Find my mentor
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 hover:border-white/30"
            >
              <RefreshCw size={16} /> Reset
            </button>
            {selectedTraits.length > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs text-slate-300">
                {selectedTraits.length} selected
              </div>
            )}
          </div>
        </motion.section>

        {match && gap && (
          <motion.section {...sectionMotion} className="space-y-4" id="result">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Modules B, C & D</p>
                <h2 className="text-2xl font-semibold">Your Match & Bridge</h2>
                <p className="text-slate-400">Vector math + AI strategy. Save this card for WhatsApp/LinkedIn.</p>
              </div>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-100 hover:border-cyan-400/50"
              >
                <Share2 size={16} /> Share / Copy
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.7fr_1.2fr]">
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-cyan-500/10 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Your Mentor</p>
                    <h3 className="text-3xl font-semibold text-white">{match.mentor.name}</h3>
                    <p className="text-lg text-cyan-200">{match.mentor.title}</p>
                    <p className="max-w-xl text-slate-300">{match.mentor.bio}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                      {match.mentor.traits.map((trait) => (
                        <span key={trait} className="rounded-full bg-white/5 px-3 py-1">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <span className="text-sm uppercase tracking-[0.2em] text-slate-400">Compatibility</span>
                    <div className="text-5xl font-bold text-cyan-300">{match.compatibility}%</div>
                    <span className="text-slate-400">Lower distance = tighter fit</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
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

              <div className="flex h-full flex-col gap-4">
                <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-fuchsia-500/20 p-6 shadow-xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#22d3ee22,transparent_30%),radial-gradient(circle_at_80%_0%,#a855f722,transparent_32%)]" />
                  <div className="relative flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.25em] text-cyan-100">The Bridge</p>
                        <h3 className="text-2xl font-semibold text-white">{gapLabel}</h3>
                        <p className="text-slate-200">
                          {gap.delta > 0
                            ? `${match.mentor.name} scores ${gap.delta.toFixed(1)} points higher here.`
                            : `You are neck and neck here—keep pushing to stay ahead.`}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-200">Delta</p>
                        <p className="text-3xl font-bold text-white">{Math.max(gap.delta, 0).toFixed(1)}</p>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm text-cyan-100">
                        <Brain size={16} /> AI Strategy
                      </div>
                      <p className="text-sm leading-relaxed text-slate-100">
                        {loadingAdvice ? (
                          <span className="flex items-center gap-2 text-cyan-200">
                            <Loader2 className="animate-spin" size={16} /> Thinking like a blunt desi mentor...
                          </span>
                        ) : (
                          advice
                        )}
                      </p>
                    </div>

                    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                        <Wand2 size={14} /> Screenshot ready
                      </div>
                      <p className="text-slate-200">
                        Save and share this card on WhatsApp or LinkedIn to unlock the hidden mentor drop. No fluff—just the bridge.
                      </p>
                      <button
                        onClick={handleShare}
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-white text-slate-900 px-4 py-2 text-sm font-semibold shadow-md hover:-translate-y-[1px] hover:shadow-lg"
                      >
                        <Share2 size={16} /> Share / Copy
                      </button>
                      {shareMessage && <span className="text-xs text-cyan-100">{shareMessage}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
