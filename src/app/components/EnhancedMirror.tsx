"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  RefreshCw,
  Triangle,
  BadgePercent,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  BookOpen,
  Target,
  Zap,
} from "lucide-react";
import { mentors as fallbackMentors } from "@/data/mentors";
import { analyzeGapEnhanced } from "@/utils/enhancedGapAnalyzer";
import { attributeLabel, buildUserVector, findMultipleMentors } from "@/utils/matcher";
import { ProgressTracker } from "./ProgressTracker";
import {
  ATTRIBUTE_KEYS,
  EnhancedGapAnalysis,
  MultiMatchResult,
  Trait,
  UserTraitSelection,
  Vector,
  Challenge,
  Benchmark,
} from "@/types";
import { fallbackSeeds, maxTraits, minTraits, traitContextQuestions } from "@/data/traits";

type Stage = "selection" | "context" | "analysis" | "action";

const clampScore = (value: number) => Math.min(10, Math.max(0, value));

const deriveImpact = (label: string): Vector => {
  const seed = label
    .toUpperCase()
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const n = (shift: number) => ((seed >> shift) % 5) - 2;

  return {
    risk: clampScore(5 + n(1)),
    network: clampScore(5 + n(3)),
    grind: clampScore(5 + n(5)),
    education: clampScore(5 + n(7)),
    resilience: clampScore(5 + n(9)),
  };
};

const inflateTrait = (raw: { id: string | number; label: string; votes?: number }): Trait => {
  const label = raw.label.toUpperCase();
  const contextData = traitContextQuestions[label];

  return {
    id: String(raw.id ?? raw.label),
    label,
    category: "Vibe",
    note: raw.votes ? `VOTES_${raw.votes}` : undefined,
    impact: deriveImpact(label),
    contextQuestion: contextData?.question,
    verificationPrompts: contextData?.verifications,
  };
};

type LiveMentor = { id: string; name: string; bio: string; image?: string };

const deriveMentorVector = (seed: string): Vector => {
  return deriveImpact(seed);
};

export default function EnhancedMirror() {
  const [stage, setStage] = useState<Stage>("selection");
  const [traits, setTraits] = useState<Trait[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [userSelections, setUserSelections] = useState<UserTraitSelection[]>([]);
  const [mentorPool, setMentorPool] = useState(fallbackMentors);
  const [multiMatch, setMultiMatch] = useState<MultiMatchResult | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<EnhancedGapAnalysis | null>(null);
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
        const data = (await res.json()) as { id: string | number; label: string; votes?: number }[];
        if (!Array.isArray(data)) throw new Error("Bad payload");
        const hydrated = data.map(inflateTrait);
        setTraits(hydrated.length ? hydrated : fallbackSeeds.map((label, idx) => inflateTrait({ id: idx, label })));
      } catch (err) {
        console.error(err);
        setError("CONFIG OFFLINE. USING FALLBACK DATA.");
        setTraits(fallbackSeeds.map((label, idx) => inflateTrait({ id: idx, label })));
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadMentors = async () => {
      try {
        const res = await fetch("/api/mentors");
        if (!res.ok) return;
        const data = (await res.json()) as LiveMentor[] | { error?: string };
        if (!Array.isArray(data)) return;
        const live = data.map((m) => ({
          id: m.id,
          name: m.name,
          title: "LIVE_NODE",
          image: m.image || "",
          bio: m.bio || "",
          traits: ["LIVE_FEED", "WIKIDATA"],
          dna: deriveMentorVector(m.name),
        }));
        if (live.length) setMentorPool(live);
      } catch (error) {
        console.error("mentor load fail", error);
      }
    };
    loadMentors();
  }, []);

  const selectedTraits = useMemo(
    () => traits.filter((trait) => selectedIds.includes(trait.id)),
    [traits, selectedIds]
  );

  const toggleTrait = (id: string) => {
    setError(null);
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        setUserSelections((sels) => sels.filter((s) => s.traitId !== id));
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= maxTraits) {
        setError(`CAP AT ${maxTraits}. TOO MUCH NOISE.`);
        return prev;
      }
      setUserSelections((sels) => [
        ...sels,
        { traitId: id, intensity: 70, timestamp: Date.now(), verifications: [] },
      ]);
      return [...prev, id];
    });
  };

  const updateIntensity = (traitId: string, intensity: number) => {
    setUserSelections((sels) =>
      sels.map((s) => (s.traitId === traitId ? { ...s, intensity } : s))
    );
  };

  // Removed updateContext - not used in current implementation
  // Can be added back if needed for future features

  const toggleVerification = (traitId: string, index: number) => {
    setUserSelections((sels) =>
      sels.map((s) => {
        if (s.traitId !== traitId) return s;
        const newVerifications = [...(s.verifications || [])];
        newVerifications[index] = !newVerifications[index];
        return { ...s, verifications: newVerifications };
      })
    );
  };

  const reset = () => {
    setSelectedIds([]);
    setUserSelections([]);
    setMultiMatch(null);
    setGapAnalysis(null);
    setError(null);
    setStage("selection");
  };

  const handleNextStage = () => {
    if (stage === "selection") {
      if (selectedTraits.length < minTraits) {
        setError(`NEED ${minTraits}+ NODES FOR SIGNAL.`);
        return;
      }
      setStage("context");
    } else if (stage === "context") {
      setStage("analysis");
      runAnalysis();
    } else if (stage === "analysis") {
      setStage("action");
    }
  };

  const handlePrevStage = () => {
    if (stage === "context") setStage("selection");
    else if (stage === "analysis") setStage("context");
    else if (stage === "action") setStage("analysis");
  };

  const runAnalysis = () => {
    const userVector = buildUserVector(selectedTraits, userSelections);
    const matches = findMultipleMentors(userVector, mentorPool, 3);
    setMultiMatch(matches);

    if (matches.topMatches[0]) {
      const analysis = analyzeGapEnhanced(userVector, matches.topMatches[0].mentor);
      setGapAnalysis(analysis);
    }
  };

  const handleShare = async () => {
    if (!multiMatch || !gapAnalysis) return;
    const summary = `THE_MIRROR: ${multiMatch.topMatches[0].compatibility}% SYNC WITH ${multiMatch.topMatches[0].mentor.name}. PRIMARY FISSURE: ${gapAnalysis.primaryGap.attribute.toUpperCase()}.`;

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
        const saved = (await res.json()) as { id: string | number; label: string; votes?: number };
        setTraits((prev) => [inflateTrait(saved), ...prev.filter((t) => t.id !== optimistic.id)]);
      } else {
        throw new Error("Insert failed");
      }
    } catch (err) {
      console.error(err);
      setError("DB WRITE FAILED. RETRY.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:px-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-white bg-black p-6 shadow-[10px_10px_0_#ccff00] sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono tracking-[0.3em] text-white">
            <span className="flex items-center gap-2 bg-white px-3 py-1 font-bold text-black">
              &gt; THE_MIRROR_V2
            </span>
            <span className="px-2 py-1 text-[#ccff00]">ENHANCED_PROTOCOL</span>
            <span className="px-2 py-1 text-[#ff00ff]">DEEP_ANALYSIS</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 flex items-center gap-2">
            {(["selection", "context", "analysis", "action"] as Stage[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center border-2 text-xs font-bold ${
                    stage === s
                      ? "border-[#ccff00] bg-[#ccff00] text-black"
                      : selectedIds.length > 0 && (s === "selection" || (s === "context" && stage !== "selection") || (s === "analysis" && (stage === "analysis" || stage === "action")) || (s === "action" && stage === "action"))
                      ? "border-white bg-white text-black"
                      : "border-white/30 text-white/30"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 3 && <div className="h-[2px] w-8 bg-white/30" />}
              </div>
            ))}
          </div>
        </motion.header>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 border-2 border-[#ff00ff] bg-[#ff00ff]/10 px-4 py-3 text-sm text-[#ff00ff]"
          >
            <Triangle size={16} /> {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {stage === "selection" && (
            <SelectionStage
              key="selection"
              traits={traits}
              selectedIds={selectedIds}
              toggleTrait={toggleTrait}
              input={input}
              setInput={setInput}
              handleAdd={handleAdd}
              handleNext={handleNextStage}
              selectedCount={selectedIds.length}
            />
          )}

          {stage === "context" && (
            <ContextStage
              key="context"
              selectedTraits={selectedTraits}
              userSelections={userSelections}
              updateIntensity={updateIntensity}
              toggleVerification={toggleVerification}
              handleNext={handleNextStage}
              handlePrev={handlePrevStage}
            />
          )}

          {stage === "analysis" && multiMatch && gapAnalysis && (
            <AnalysisStage
              key="analysis"
              multiMatch={multiMatch}
              gapAnalysis={gapAnalysis}
              handleShare={handleShare}
              shareMessage={shareMessage}
              handleNext={handleNextStage}
              handlePrev={handlePrevStage}
            />
          )}

          {stage === "action" && gapAnalysis && multiMatch && (
            <ActionStage
              key="action"
              gapAnalysis={gapAnalysis}
              handlePrev={handlePrevStage}
              reset={reset}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Stage Components
function SelectionStage({
  traits,
  selectedIds,
  toggleTrait,
  input,
  setInput,
  handleAdd,
  handleNext,
  selectedCount,
}: {
  traits: Trait[];
  selectedIds: string[];
  toggleTrait: (id: string) => void;
  input: string;
  setInput: (v: string) => void;
  handleAdd: () => void;
  handleNext: () => void;
  selectedCount: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">SELECT YOUR TRAITS</h2>
        <p className="text-white/70">
          Pick {minTraits}-{maxTraits} traits that define you right now. Be honest.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {traits.map((trait) => (
          <motion.button
            key={trait.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleTrait(trait.id)}
            className={`flex flex-col gap-2 border-2 p-4 text-left transition-all ${
              selectedIds.includes(trait.id)
                ? "border-[#ccff00] bg-[#ccff00] text-black shadow-[6px_6px_0_#ff00ff]"
                : "border-[#ccff00] bg-black text-[#ccff00] hover:border-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span>NODE</span>
              {selectedIds.includes(trait.id) && <CheckCircle2 size={16} />}
            </div>
            <div className="text-lg font-bold">{trait.label}</div>
          </motion.button>
        ))}
      </div>

      <div className="border-2 border-[#ff00ff] bg-black p-4">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="ADD_CUSTOM_TRAIT"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
          />
          <button
            onClick={handleAdd}
            className="border-2 border-[#ff00ff] bg-[#ff00ff] px-4 py-2 text-xs font-bold text-black"
          >
            ADD
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-white/60">
          {selectedCount}/{maxTraits} traits selected
        </div>
        <button
          onClick={handleNext}
          disabled={selectedCount < minTraits}
          className="flex items-center gap-2 border-2 border-white bg-white px-6 py-3 font-bold text-black shadow-[5px_5px_0_#ccff00] transition hover:-translate-y-[2px] disabled:opacity-30"
        >
          NEXT: ADD CONTEXT <ChevronRight size={16} />
        </button>
      </div>
    </motion.section>
  );
}

function ContextStage({
  selectedTraits,
  userSelections,
  updateIntensity,
  toggleVerification,
  handleNext,
  handlePrev,
}: {
  selectedTraits: Trait[];
  userSelections: UserTraitSelection[];
  updateIntensity: (id: string, intensity: number) => void;
  toggleVerification: (id: string, index: number) => void;
  handleNext: () => void;
  handlePrev: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">ADD DEPTH TO YOUR TRAITS</h2>
        <p className="text-white/70">Adjust intensity and verify with concrete proof points.</p>
      </div>

      <div className="space-y-6">
        {selectedTraits.map((trait) => {
          const selection = userSelections.find((s) => s.traitId === trait.id);
          if (!selection) return null;

          return (
            <motion.div
              key={trait.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 border-2 border-white bg-black p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#ccff00]">{trait.label}</h3>
                  {trait.contextQuestion && (
                    <p className="mt-1 text-sm text-white/70">{trait.contextQuestion}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{selection.intensity}%</div>
                  <div className="text-xs text-white/50">INTENSITY</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/60">INTENSITY LEVEL</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selection.intensity}
                  onChange={(e) => updateIntensity(trait.id, parseInt(e.target.value))}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, #ccff00 0%, #ccff00 ${selection.intensity}%, #333 ${selection.intensity}%, #333 100%)`,
                  }}
                />
              </div>

              {trait.verificationPrompts && trait.verificationPrompts.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs text-white/60">VERIFY WITH PROOF</label>
                  {trait.verificationPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => toggleVerification(trait.id, i)}
                      className="flex w-full items-start gap-3 border border-white/20 p-3 text-left text-sm transition hover:border-[#ccff00]"
                    >
                      {selection.verifications?.[i] ? (
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#ccff00]" />
                      ) : (
                        <Circle size={18} className="mt-0.5 shrink-0 text-white/30" />
                      )}
                      <span className={selection.verifications?.[i] ? "text-white" : "text-white/60"}>
                        {prompt}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 border-2 border-white px-6 py-3 font-bold text-white transition hover:bg-white hover:text-black"
        >
          <ChevronLeft size={16} /> BACK
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 border-2 border-white bg-white px-6 py-3 font-bold text-black shadow-[5px_5px_0_#ccff00] transition hover:-translate-y-[2px]"
        >
          RUN ANALYSIS <Zap size={16} />
        </button>
      </div>
    </motion.section>
  );
}

function AnalysisStage({
  multiMatch,
  gapAnalysis,
  handleShare,
  shareMessage,
  handleNext,
  handlePrev,
}: {
  multiMatch: MultiMatchResult;
  gapAnalysis: EnhancedGapAnalysis;
  handleShare: () => void;
  shareMessage: string | null;
  handleNext: () => void;
  handlePrev: () => void;
}) {
  const [selectedMentorIndex, setSelectedMentorIndex] = useState(0);
  const currentMatch = multiMatch.topMatches[selectedMentorIndex];

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">YOUR MENTOR MATCHES</h2>
        <p className="text-white/70">Top 3 mentors ranked by compatibility + your anti-mentor</p>
      </div>

      {/* Mentor Selector */}
      <div className="grid gap-3 md:grid-cols-4">
        {multiMatch.topMatches.map((match, i) => (
          <button
            key={match.mentor.id}
            onClick={() => setSelectedMentorIndex(i)}
            className={`border-2 p-4 text-left transition ${
              selectedMentorIndex === i
                ? "border-[#ccff00] bg-[#ccff00] text-black"
                : "border-white bg-black text-white hover:border-[#ccff00]"
            }`}
          >
            <div className="text-xs font-mono">RANK #{i + 1}</div>
            <div className="mt-1 text-lg font-bold">{match.mentor.name}</div>
            <div className="mt-1 flex items-center gap-1 text-xl font-bold">
              {match.compatibility}%
              <BadgePercent size={16} />
            </div>
          </button>
        ))}
        <div className="border-2 border-[#ff00ff] bg-black p-4 text-left">
          <div className="text-xs font-mono text-[#ff00ff]">ANTI-MENTOR</div>
          <div className="mt-1 text-lg font-bold text-white">{multiMatch.antiMentor.mentor.name}</div>
          <div className="mt-1 text-xl font-bold text-[#ff00ff]">
            {multiMatch.antiMentor.compatibility}%
          </div>
        </div>
      </div>

      {/* Selected Mentor Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 border-2 border-white bg-black p-6">
          <div>
            <div className="text-xs text-[#ccff00]">PRIMARY MATCH</div>
            <h3 className="mt-1 text-2xl font-bold">{currentMatch.mentor.name}</h3>
            <p className="text-lg text-white/80">{currentMatch.mentor.title}</p>
            <p className="mt-2 text-sm text-white/60">{currentMatch.mentor.bio}</p>
          </div>

          <div className="space-y-2">
            {ATTRIBUTE_KEYS.map((attr) => (
              <div key={attr} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span>{attributeLabel[attr].toUpperCase()}</span>
                  <span>
                    YOU {currentMatch.userVector[attr]} · MENTOR {currentMatch.mentor.dna[attr]}
                  </span>
                </div>
                <div className="relative h-2 border border-white bg-black">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#ff00ff]"
                    style={{ width: `${(currentMatch.mentor.dna[attr] / 10) * 100}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 bg-[#ccff00]"
                    style={{ width: `${(currentMatch.userVector[attr] / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {currentMatch.mentor.keyQuotes && currentMatch.mentor.keyQuotes.length > 0 && (
            <div className="border-t-2 border-white/20 pt-4">
              <div className="text-xs text-white/60">KEY QUOTE</div>
              <p className="mt-2 italic text-white/90">&ldquo;{currentMatch.mentor.keyQuotes[0]}&rdquo;</p>
            </div>
          )}
        </div>

        <div className="space-y-4 border-2 border-[#ff00ff] bg-black p-6">
          <div>
            <div className="text-xs text-[#ff00ff]">PRIMARY FISSURE</div>
            <h3 className="mt-1 text-2xl font-bold text-white">
              {attributeLabel[gapAnalysis.primaryGap.attribute].toUpperCase()}
            </h3>
            <p className="text-sm text-white/70">
              {gapAnalysis.primaryGap.delta > 0
                ? `${currentMatch.mentor.name} is ${gapAnalysis.primaryGap.delta.toFixed(1)} points ahead here.`
                : "You're synced on this dimension."}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-white/60">ALL GAPS (RANKED)</div>
            {gapAnalysis.allGaps.slice(0, 5).map((gap) => (
              <div
                key={gap.attribute}
                className="flex items-center justify-between border border-white/20 p-2 text-sm"
              >
                <span>{attributeLabel[gap.attribute]}</span>
                <span className={gap.delta > 0 ? "text-[#ff00ff]" : "text-[#ccff00]"}>
                  {gap.delta > 0 ? "+" : ""}
                  {gap.delta.toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-white/20 pt-4">
            <button
              onClick={handleShare}
              className="flex w-full items-center justify-center gap-2 border-2 border-white bg-white px-4 py-3 font-bold text-black transition hover:bg-[#ccff00]"
            >
              <Share2 size={16} /> BROADCAST RESULTS
            </button>
            {shareMessage && <div className="mt-2 text-center text-xs text-[#ccff00]">{shareMessage}</div>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 border-2 border-white px-6 py-3 font-bold text-white transition hover:bg-white hover:text-black"
        >
          <ChevronLeft size={16} /> BACK
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 border-2 border-white bg-white px-6 py-3 font-bold text-black shadow-[5px_5px_0_#ccff00] transition hover:-translate-y-[2px]"
        >
          VIEW ACTION PLAN <Target size={16} />
        </button>
      </div>
    </motion.section>
  );
}

function ActionStage({
  gapAnalysis,
  handlePrev,
  reset,
}: {
  gapAnalysis: EnhancedGapAnalysis;
  handlePrev: () => void;
  reset: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">CLOSE THE GAP</h2>
        <p className="text-white/70">
          Concrete challenges to improve your {attributeLabel[gapAnalysis.primaryGap.attribute]}
        </p>
      </div>

      {/* Challenges */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#ccff00]">WEEKLY CHALLENGES</h3>
        {gapAnalysis.weeklyChallenges.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>

      {/* Benchmarks */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#ccff00]">BENCHMARKS</h3>
        <div className="space-y-2">
          {gapAnalysis.benchmarks.map((benchmark) => (
            <BenchmarkCard
              key={benchmark.level}
              benchmark={benchmark}
              currentScore={gapAnalysis.primaryGap.userScore}
              targetScore={gapAnalysis.primaryGap.mentorScore}
            />
          ))}
        </div>
      </div>

      {/* Resources */}
      {gapAnalysis.resources.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#ccff00]">RECOMMENDED RESOURCES</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {gapAnalysis.resources.map((resource, i) => (
              <a
                key={i}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 border-2 border-white bg-black p-4 transition hover:border-[#ccff00] hover:shadow-[4px_4px_0_#ccff00]"
              >
                <BookOpen size={20} className="mt-1 shrink-0 text-[#ccff00]" />
                <div>
                  <div className="text-xs text-white/60">{resource.type.toUpperCase()}</div>
                  <div className="font-bold text-white">{resource.title}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t-2 border-white/20 pt-6">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 border-2 border-white px-6 py-3 font-bold text-white transition hover:bg-white hover:text-black"
        >
          <ChevronLeft size={16} /> BACK
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 border-2 border-white bg-white px-6 py-3 font-bold text-black transition hover:bg-[#ff00ff] hover:text-white"
        >
          <RefreshCw size={16} /> START OVER
        </button>
      </div>
    </motion.section>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-2 border-white bg-black">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between p-4 text-left transition hover:bg-white/5"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-[#ccff00]" />
            <span className="font-bold text-white">{challenge.title}</span>
          </div>
          <div className="mt-1 flex gap-2 text-xs">
            <span className="border border-white/30 px-2 py-0.5">{challenge.difficulty}</span>
            <span className="border border-white/30 px-2 py-0.5">{challenge.estimatedTime}</span>
          </div>
        </div>
        <ChevronRight
          size={20}
          className={`shrink-0 transition ${expanded ? "rotate-90" : ""}`}
        />
      </button>
      {expanded && (
        <div className="space-y-3 border-t-2 border-white/20 p-4">
          <p className="text-sm text-white/80">{challenge.description}</p>
          <div>
            <div className="text-xs font-bold text-white/60">SUCCESS CRITERIA:</div>
            <ul className="mt-2 space-y-1">
              {challenge.successCriteria.map((criteria, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 size={14} className="mt-1 shrink-0 text-[#ccff00]" />
                  <span>{criteria}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Progress Tracker Integration */}
          <div className="border-t-2 border-white/20 pt-3">
            <ProgressTracker challenge={challenge} />
          </div>
        </div>
      )}
    </div>
  );
}

function BenchmarkCard({
  benchmark,
  currentScore,
  targetScore,
}: {
  benchmark: Benchmark;
  currentScore: number;
  targetScore: number;
}) {
  const isCurrent = currentScore >= benchmark.score - 1 && currentScore <= benchmark.score + 1;
  const isTarget = targetScore >= benchmark.score - 1 && targetScore <= benchmark.score + 1;

  return (
    <div
      className={`border-2 p-4 ${
        isCurrent
          ? "border-[#ccff00] bg-[#ccff00]/10"
          : isTarget
          ? "border-[#ff00ff] bg-[#ff00ff]/10"
          : "border-white/20 bg-black"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">
              LVL {benchmark.level}: {benchmark.description}
            </span>
            {isCurrent && <span className="text-xs text-[#ccff00]">(YOU)</span>}
            {isTarget && <span className="text-xs text-[#ff00ff]">(TARGET)</span>}
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {benchmark.examples.map((ex, i) => (
              <span key={i} className="border border-white/30 px-2 py-1">
                {ex}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{benchmark.score}/10</div>
        </div>
      </div>
    </div>
  );
}
