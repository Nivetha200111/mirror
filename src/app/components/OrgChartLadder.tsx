"use client";

import { motion } from "framer-motion";
import { ChevronUp, User, Crown, Zap, Target } from "lucide-react";
import { techCareerLadder, findUserLevel, findBestTrack, type LadderLevel } from "@/data/careerLadder";
import { Vector, Mentor } from "@/types";

export function OrgChartLadder({
  userVector,
  mentor,
}: {
  userVector: Vector;
  mentor: Mentor;
}) {
  const track = findBestTrack(userVector);
  const userLevel = findUserLevel(userVector, track);
  const path = techCareerLadder[track];

  // Mentor is always at the top
  const mentorLevel = 5;

  // Calculate the gap in levels
  const levelsToClimb = mentorLevel - userLevel;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-2 border-white bg-black p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[#ccff00]">YOUR CAREER TRACK</div>
            <div className="text-2xl font-bold">{track} PATH</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/60">LEVELS TO CLIMB</div>
            <div className="text-4xl font-bold text-[#ff00ff]">{levelsToClimb}</div>
          </div>
        </div>
      </div>

      {/* The Ladder */}
      <div className="relative space-y-1">
        {/* Connection Line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[#ff00ff] via-[#ccff00] to-[#ff00ff]" />

        {/* Levels from top (mentor) to bottom (you) */}
        {path.levels
          .slice()
          .reverse()
          .map((level) => {
            const isYou = level.level === userLevel;
            const isMentor = level.level === mentorLevel;
            const isInBetween = level.level > userLevel && level.level < mentorLevel;

            return (
              <LevelCard
                key={level.level}
                level={level}
                isYou={isYou}
                isMentor={isMentor}
                isInBetween={isInBetween}
                mentor={isMentor ? mentor : undefined}
              />
            );
          })}
      </div>

      {/* Insight Box */}
      <div className="border-2 border-[#ccff00] bg-[#ccff00]/10 p-4">
        <div className="flex items-start gap-3">
          <Target size={20} className="mt-1 shrink-0 text-[#ccff00]" />
          <div className="space-y-2 text-sm">
            <p className="font-bold text-white">THE GAP IS REAL:</p>
            <p className="text-white/80">
              You&apos;re at <span className="text-[#ccff00]">{path.levels[userLevel - 1].title}</span>.
              {" "}{mentor.name} is at <span className="text-[#ff00ff]">{path.levels[mentorLevel - 1].title}</span>.
            </p>
            <p className="text-white/80">
              That&apos;s <span className="text-[#ff00ff] font-bold">{levelsToClimb} levels</span> of experience,
              skills, and network you need to build. Each level typically takes{" "}
              <span className="text-[#ccff00]">2-5 years</span> of focused work.
            </p>
            {levelsToClimb > 0 && (
              <p className="text-white font-bold">
                Start by focusing on the next level up: {path.levels[userLevel]?.title || "Next Step"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LevelCard({
  level,
  isYou,
  isMentor,
  isInBetween,
  mentor,
}: {
  level: LadderLevel;
  isYou: boolean;
  isMentor: boolean;
  isInBetween: boolean;
  mentor?: Mentor;
}) {
  const [expanded, setExpanded] = React.useState(isYou || isMentor);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: level.level * 0.1 }}
      className={`relative ml-16 ${expanded ? "" : "mb-2"}`}
    >
      {/* Node Circle */}
      <div
        className={`absolute -left-[4.5rem] top-4 flex h-16 w-16 items-center justify-center border-4 ${
          isYou
            ? "border-[#ccff00] bg-[#ccff00] text-black"
            : isMentor
            ? "border-[#ff00ff] bg-[#ff00ff] text-white"
            : "border-white bg-black text-white"
        }`}
      >
        {isMentor ? <Crown size={24} /> : isYou ? <User size={24} /> : <ChevronUp size={24} />}
      </div>

      {/* Card */}
      <div
        className={`border-2 transition-all ${
          isYou
            ? "border-[#ccff00] bg-[#ccff00]/10 shadow-[4px_4px_0_#ccff00]"
            : isMentor
            ? "border-[#ff00ff] bg-[#ff00ff]/10 shadow-[4px_4px_0_#ff00ff]"
            : isInBetween
            ? "border-white/50 bg-white/5"
            : "border-white/20 bg-black opacity-40"
        }`}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-start justify-between p-4 text-left transition hover:bg-white/5"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isYou && <span className="text-xs font-bold text-[#ccff00]">[YOU ARE HERE]</span>}
              {isMentor && <span className="text-xs font-bold text-[#ff00ff]">[{mentor?.name.toUpperCase()}]</span>}
            </div>
            <div className="mt-1 text-xl font-bold text-white">
              Level {level.level}: {level.title}
            </div>
            <div className="mt-1 flex gap-3 text-xs text-white/70">
              <span>{level.yearsExperience}</span>
              <span>·</span>
              <span>{level.salary}</span>
            </div>
          </div>
          <ChevronUp
            size={20}
            className={`shrink-0 transition ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {expanded && (
          <div className="space-y-3 border-t-2 border-white/20 p-4">
            {/* Real Examples */}
            <div>
              <div className="text-xs font-bold text-white/60">WHO&apos;S HERE:</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {isMentor && mentor ? (
                  <div className="border-2 border-[#ff00ff] bg-[#ff00ff] px-3 py-1 text-sm font-bold text-white">
                    {mentor.name}
                  </div>
                ) : (
                  level.realExamples.map((example, i) => (
                    <div
                      key={i}
                      className="border border-white/30 bg-white/5 px-2 py-1 text-xs text-white/80"
                    >
                      {example}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Day to Day */}
            <div>
              <div className="text-xs font-bold text-white/60">DAY-TO-DAY:</div>
              <p className="mt-1 text-sm text-white/80">{level.dayToDay}</p>
            </div>

            {/* Key Milestones */}
            <div>
              <div className="text-xs font-bold text-white/60">KEY MILESTONES:</div>
              <ul className="mt-1 space-y-1">
                {level.keyMilestones.map((milestone, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <Zap size={14} className="mt-1 shrink-0 text-[#ccff00]" />
                    {milestone}
                  </li>
                ))}
              </ul>
            </div>

            {/* Attribute Requirements */}
            <div>
              <div className="text-xs font-bold text-white/60">REQUIRED LEVELS:</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                {Object.entries(level.attributeRequirements).map(([attr, value]) => (
                  <div key={attr} className="flex items-center justify-between border border-white/20 px-2 py-1">
                    <span className="capitalize text-white/70">{attr}</span>
                    <span className="font-bold text-white">{value}/10</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Add React import
import React from "react";
