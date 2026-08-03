export const siteConfig = {
  title: "Our Story",
  subtitle: "A Private Film",
  coupleName: "小张 & 小王",
  startDate: "2025-05-20",
  startLabel: "2025.05.20",
  currentYear: "2026",
  openingQuote: "故事开始时，我们都不知道它会持续这么久。",
  endingQuote: "下一幕仍在拍摄中",
  enableMusic: true,
  enableFilmGrain: true,
  // Replace these with VITE_MEMORY_PASSWORD_ONE / TWO in .env.local when deploying.
  passwords: {
    first: import.meta.env.VITE_MEMORY_PASSWORD_ONE || "0722",
    second: import.meta.env.VITE_MEMORY_PASSWORD_TWO || "0627",
  },
  musicSrc: "/audio/our-story.aac",
} as const;

export function daysTogether() {
  const start = new Date(`${siteConfig.startDate}T00:00:00`).getTime();
  return Math.max(0, Math.floor((Date.now() - start) / 86400000));
}
