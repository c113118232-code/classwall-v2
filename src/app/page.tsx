"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";

import { QuestionCard } from "@/components/question-card";
import { QuestionForm } from "@/components/question-form";
import { StatsPill } from "@/components/stats-pill";
import { ThemeToggle } from "@/components/theme-toggle";
import { useQuestions } from "@/lib/use-questions";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export default function Home() {
  const { questions, loading, loadingMore, hasMore, error, loadMore } =
    useQuestions(PAGE_SIZE);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // 滑鼠跟隨光暈：直接寫 CSS var，零 React 介入
  useEffect(() => {
    function onMove(e: MouseEvent) {
      const el = spotlightRef.current;
      if (!el) return;
      el.style.setProperty("--mouse-x", `${e.clientX}px`);
      el.style.setProperty("--mouse-y", `${e.clientY}px`);
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // 排序由 DB + useQuestions hook 統一負責，這裡直接渲染
  const totalLikes = useMemo(
    () => questions.reduce((sum, q) => sum + q.likes, 0),
    [questions]
  );

  return (
    <>
      <div ref={spotlightRef} className="mouse-spotlight" aria-hidden />

      <main className="relative mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        {/* ============ Header ============ */}
        <motion.header
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.09, delayChildren: 0.05 },
            },
          }}
          className="flex flex-col gap-4"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: -6 },
              show: { opacity: 1, y: 0 },
            }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="inline-block h-px w-6 bg-foreground/30" />
              <span>AI × 教學 · 2026</span>
            </div>
            <ThemeToggle />
          </motion.div>

          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0 },
            }}
            className="font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="italic">Class</span>
            <span>Wall</span>
            <span className="text-primary">.</span>
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
            className="max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base"
          >
            一道屬於這間教室的匿名問答牆——
            <span className="font-display italic text-foreground">
              想問什麼，就大方問
            </span>
            。 即時同步、按讚衝榜、誰都看得到。
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0 },
            }}
            className="flex flex-wrap items-center gap-2 pt-1"
          >
            <StatsPill label="問題" value={questions.length} />
            <StatsPill label="總 +1" value={totalLikes} accent />
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 backdrop-blur-md px-3 py-1.5 text-[12px]">
              <span className="live-dot" aria-hidden />
              <span className="text-muted-foreground">即時連線中</span>
            </span>
          </motion.div>
        </motion.header>

        {/* ============ 發問區 ============ */}
        <section aria-label="發問區">
          <QuestionForm />
        </section>

        {/* ============ 問題列表 ============ */}
        <section aria-label="問題列表" className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-baseline justify-between gap-3"
          >
            <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
              牆上的問題
            </h2>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              依讚數排序 · 每頁 {PAGE_SIZE} 題
            </span>
          </motion.div>

          {loading ? (
            <SkeletonList />
          ) : error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
              讀取失敗：{error}
            </div>
          ) : questions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-dashed border-border/70 bg-card/40 py-16 text-center"
            >
              <p className="font-display text-2xl italic text-muted-foreground">
                還沒有人發問
              </p>
              <p className="mt-2 text-sm text-muted-foreground/80">
                你來當第一個 ✨
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {questions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </AnimatePresence>

              {/* 載入更多 / 已到底 */}
              <div className="pt-2 flex justify-center">
                {hasMore ? (
                  <motion.button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    whileTap={{ scale: 0.96 }}
                    whileHover={loadingMore ? undefined : { y: -1 }}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-2.5",
                      "border border-border bg-card/70 backdrop-blur-md",
                      "text-sm font-medium transition-colors duration-200",
                      "hover:border-primary/60 hover:bg-primary/10 hover:text-primary",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
                      "disabled:cursor-not-allowed disabled:opacity-60"
                    )}
                  >
                    {loadingMore ? (
                      <>
                        <motion.span
                          aria-hidden
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="h-3.5 w-3.5 rounded-full border-2 border-foreground/40 border-t-primary"
                        />
                        <span>載入中…</span>
                      </>
                    ) : (
                      <>
                        <span>載入更多</span>
                        <span aria-hidden>↓</span>
                      </>
                    )}
                  </motion.button>
                ) : (
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                    — 沒有更多了 —
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-8 pb-4 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70"
        >
          built with Next.js · Supabase · Motion
        </motion.footer>
      </main>
    </>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
          className="h-24 rounded-2xl border border-border/60 bg-card/40"
        />
      ))}
    </div>
  );
}
