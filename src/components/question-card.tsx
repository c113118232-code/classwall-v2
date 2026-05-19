"use client";

import { AnimatePresence, motion } from "motion/react";
import { memo, useEffect, useRef, useState } from "react";

import { AnswerSection } from "@/components/answer-section";
import { getAnonId } from "@/lib/anon-id";
import { addLiked, hasLiked } from "@/lib/liked-store";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/database";

type Props = {
  question: Question;
};

// 按讚瞬間的粒子噴發角度
const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
  const distance = 28 + Math.random() * 18;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    delay: Math.random() * 0.05,
  };
});

function QuestionCardImpl({ question }: Props) {
  const [pending, setPending] = useState(false);
  const [alreadyLiked, setAlreadyLiked] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const isHot = question.likes >= 5;

  // 3D tilt：用 ref 直接寫 DOM，完全不經過 React render
  // 內層 wrapper 專門承載 tilt transform；外層 motion.article 負責 layout 動畫
  const tiltRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | undefined>(undefined);

  // hydration 後才讀 sessionStorage，避免 SSR mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAlreadyLiked(hasLiked(question.id));
  }, [question.id]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  function handleMouseMove(event: React.MouseEvent<HTMLElement>) {
    const el = tiltRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      const rotateX = (-y * 6).toFixed(2);
      const rotateY = (x * 6).toFixed(2);
      el.style.transform = `perspective(1000px) translateY(-3px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  }

  function handleMouseLeave() {
    const el = tiltRef.current;
    if (!el) return;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    el.style.transform = "";
  }

  async function handleLike() {
    if (pending || alreadyLiked) return;
    setPending(true);
    // 走 RPC：DB 端 SECURITY DEFINER 函式內原子地寫 question_likes 去重 + bump likes
    // 不在這裡 +1 — 交給 Realtime UPDATE 廣播統一刷新，避免雙重 +1
    const { error } = await supabase.rpc("increment_question_like", {
      qid: question.id,
      anon: getAnonId(),
    });
    setPending(false);
    if (error) {
      console.error("按讚失敗", error);
      return;
    }
    addLiked(question.id);
    setAlreadyLiked(true);
    setBurstKey((k) => k + 1);
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
    >
      {/* 內層 wrapper 承載 ref-based 3D tilt
          外層 motion.article 不放 mouse 監聽，避免 layout 動畫被 transform 覆寫 */}
      <div
        ref={tiltRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group relative overflow-hidden rounded-2xl bg-card text-card-foreground",
          "border border-border/70 p-5 sm:p-6",
          "shadow-[0_1px_0_oklch(0.92_0.02_70_/_0.4),0_8px_24px_-12px_oklch(0.5_0.05_45_/_0.18)]",
          "transition-[transform,border-color,box-shadow] duration-300 ease-out",
          "hover:border-primary/40 hover:shadow-[0_4px_0_oklch(0.92_0.02_70_/_0.3),0_18px_40px_-16px_oklch(0.62_0.18_38_/_0.35)]",
          "will-change-transform",
          isHot && "border-primary/30"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {isHot ? (
          <span
            aria-hidden
            className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full bg-linear-to-b from-orange-400 via-rose-400 to-amber-300"
          />
        ) : null}

        <p
          className={cn(
            "whitespace-pre-wrap text-[15px] leading-[1.75] sm:text-base",
            isHot && "hot-shimmer font-medium"
          )}
        >
          {isHot ? (
            <motion.span
              aria-hidden
              className="mr-1.5 inline-block origin-center"
              animate={{ rotate: [-6, 8, -6] }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              🔥
            </motion.span>
          ) : null}
          {question.content}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground/80">
              {new Date(question.created_at).toLocaleString("zh-TW", {
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <motion.button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2",
                "text-sm font-medium transition-colors duration-200",
                "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                expanded
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border bg-card hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
              )}
            >
              <span aria-hidden>💬</span>
              <span>{expanded ? "收起" : "回答"}</span>
              <motion.span
                aria-hidden
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="inline-block text-xs leading-none"
              >
                ▾
              </motion.span>
            </motion.button>
          </div>

          <div className="relative">
            {/* 粒子噴發層（按讚瞬間） */}
            {burstKey > 0 ? (
              <span
                key={burstKey}
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                {PARTICLES.map((p, i) => (
                  <motion.span
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: p.x,
                      y: p.y,
                      opacity: 0,
                      scale: 0.4,
                    }}
                    transition={{
                      duration: 0.7,
                      delay: p.delay,
                      ease: [0.25, 0.6, 0.3, 1],
                    }}
                    className="absolute h-1.5 w-1.5 rounded-full bg-linear-to-br from-orange-400 to-rose-400"
                  />
                ))}
                <motion.span
                  initial={{ y: 0, opacity: 0, scale: 0.8 }}
                  animate={{ y: -28, opacity: [0, 1, 0], scale: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute text-sm font-semibold text-primary"
                >
                  +1
                </motion.span>
              </span>
            ) : null}

            <motion.button
              type="button"
              onClick={handleLike}
              disabled={pending || alreadyLiked}
              whileTap={alreadyLiked ? undefined : { scale: 0.92 }}
              className={cn(
                "relative inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2",
                "text-sm font-medium transition-colors duration-200",
                "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                alreadyLiked
                  ? "border-border/60 bg-muted/60 text-muted-foreground cursor-not-allowed"
                  : "border-border bg-card hover:border-primary/60 hover:bg-primary/10 hover:text-primary",
                pending && "opacity-60"
              )}
            >
              <span aria-hidden>{alreadyLiked ? "✓" : "👍"}</span>
              <span>
                {alreadyLiked ? "已 +1" : "我也想問"} ·{" "}
                <motion.span
                  key={question.likes}
                  initial={{ y: -6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="inline-block tabular-nums"
                >
                  {question.likes}
                </motion.span>
              </span>
            </motion.button>
          </div>
        </div>

        {/* 回答區塊：展開時才 mount（同時觸發 lazy load + realtime 訂閱） */}
        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              key="answers"
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <AnswerSection questionId={question.id} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

// React.memo：只比對 id / likes / content，
// 父層 state 變動（mouse spotlight、count-up tick）不會引發 re-render
export const QuestionCard = memo(QuestionCardImpl, (prev, next) => {
  return (
    prev.question.id === next.question.id &&
    prev.question.likes === next.question.likes &&
    prev.question.content === next.question.content &&
    prev.question.created_at === next.question.created_at
  );
});
