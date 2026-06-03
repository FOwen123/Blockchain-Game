"use client";

import { AnimatePresence, motion } from "motion/react";
import { Zap } from "lucide-react";
import { getWeek } from "@/lib/game/weeks";
import type { Player } from "@/lib/game/types";

type Props = {
  player: Player;
  disabled?: boolean;
  selectedAnswer?: string;
  onAnswer: (answerId: string) => void;
};

export function QuestionPanel({ player, disabled, selectedAnswer, onAnswer }: Props) {
  const week = getWeek(player.currentWeek);
  const lastCorrect = player.lastAnswer?.correct;

  return (
    <section className="panel stack" aria-label={`Week ${week.id} question`}>
      <div className="cluster" style={{ justifyContent: "space-between" }}>
        <span className="chip chip--amber">Week {week.id}</span>
        <span className="chip">
          <Zap size={14} aria-hidden />
          {week.shortTitle}
        </span>
      </div>
      <div className="stack" style={{ gap: 10 }}>
        <h1 className="title">{week.question}</h1>
        <p className="muted">{week.highlight}</p>
      </div>
      <div className="answer-grid">
        {week.options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const stateClass =
            isSelected && option.id === week.correctAnswerId
              ? "answer-button--correct"
              : isSelected
                ? "answer-button--wrong"
                : "";
          return (
            <button
              className={`answer-button ${stateClass}`}
              disabled={disabled}
              key={option.id}
              onClick={() => onAnswer(option.id)}
              type="button"
            >
              <strong>{option.label}</strong>
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {player.lastAnswer && (
          <motion.div
            className={`panel ${lastCorrect ? "panel--raised" : ""}`}
            initial={{ opacity: 0, transform: "translateY(8px)" }}
            animate={{ opacity: 1, transform: "translateY(0)" }}
            exit={{ opacity: 0 }}
          >
            <strong>{lastCorrect ? "Boost earned" : "Slowdown taken"}</strong>
            <p className="muted" style={{ margin: "6px 0 0" }}>
              {getWeek(player.lastAnswer.weekId).highlight}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
