"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Calendar, TrendingUp } from "lucide-react";
import { ProgressEntry, Challenge } from "@/types";

export function ProgressTracker({
  challenge,
  userId,
}: {
  challenge: Challenge;
  userId?: string;
}) {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [evidence, setEvidence] = useState("");
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.id, userId]);

  const loadProgress = async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);

      const res = await fetch(`/api/progress?${params}`);
      if (res.ok) {
        const data = (await res.json()) as ProgressEntry[];
        const challengeEntries = data.filter((e) => e.challengeId === challenge.id);
        setEntries(challengeEntries);
      }
    } catch (error) {
      console.error("Failed to load progress", error);
    }
  };

  const logProgress = async (completed: boolean) => {
    setLoading(true);
    try {
      const entry: Omit<ProgressEntry, "id" | "timestamp"> = {
        userId,
        challengeId: challenge.id,
        completed,
        evidence: evidence.trim() || undefined,
        reflection: reflection.trim() || undefined,
      };

      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      if (res.ok) {
        await loadProgress();
        setEvidence("");
        setReflection("");
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to log progress", error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = entries.filter((e) => e.completed).length;
  const totalLogs = entries.length;

  return (
    <div className="space-y-4 border-2 border-white/20 bg-black p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-white/60">CHALLENGE PROGRESS</div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#ccff00]" />
            <span className="font-bold">
              {completedCount} completed · {totalLogs} total logs
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="border-2 border-[#ccff00] bg-[#ccff00] px-4 py-2 text-xs font-bold text-black transition hover:bg-black hover:text-[#ccff00]"
        >
          {showForm ? "CANCEL" : "LOG PROGRESS"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden border-t-2 border-white/20 pt-4"
          >
            <div className="space-y-2">
              <label className="text-xs text-white/60">EVIDENCE (LINK/PROOF)</label>
              <input
                type="text"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="https://twitter.com/yourpost or describe proof..."
                className="w-full border-2 border-white/30 bg-black p-2 text-sm outline-none focus:border-[#ccff00]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/60">REFLECTION (OPTIONAL)</label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What did you learn? What was hard? What's next?"
                rows={3}
                className="w-full border-2 border-white/30 bg-black p-2 text-sm outline-none focus:border-[#ccff00]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => logProgress(true)}
                disabled={loading || !evidence.trim()}
                className="flex items-center gap-2 border-2 border-[#ccff00] bg-[#ccff00] px-4 py-2 text-sm font-bold text-black transition hover:shadow-[4px_4px_0_#ff00ff] disabled:opacity-30"
              >
                <CheckCircle2 size={16} /> MARK COMPLETED
              </button>
              <button
                onClick={() => logProgress(false)}
                disabled={loading}
                className="border-2 border-white px-4 py-2 text-sm font-bold text-white transition hover:bg-white hover:text-black disabled:opacity-30"
              >
                LOG IN PROGRESS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {entries.length > 0 && (
        <div className="space-y-2 border-t-2 border-white/20 pt-4">
          <div className="text-xs font-bold text-white/60">HISTORY</div>
          {entries
            .slice()
            .reverse()
            .slice(0, 5)
            .map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 border border-white/20 p-3 text-sm"
              >
                {entry.completed ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#ccff00]" />
                ) : (
                  <TrendingUp size={18} className="mt-0.5 shrink-0 text-white/50" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Calendar size={12} />
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                  {entry.evidence && (
                    <div className="text-white/80">
                      {entry.evidence.startsWith("http") ? (
                        <a
                          href={entry.evidence}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-[#ccff00]"
                        >
                          View evidence →
                        </a>
                      ) : (
                        entry.evidence
                      )}
                    </div>
                  )}
                  {entry.reflection && (
                    <div className="text-xs italic text-white/60">&ldquo;{entry.reflection}&rdquo;</div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
