import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { PhotoLightbox } from "../MemoryPrimitives";
import { memories } from "../../data/memories";
import { chapterLabels, chapterOrder, scenes } from "../../data/scenes";
import { siteConfig, daysTogether } from "../../data/site-config";
import { SceneRenderer } from "./SceneRenderer";

const STORY_POSITION_KEY = "our-film-scene-v2";
type TransitionPhase = "idle" | "leaving" | "entering";

function readInitialScene() {
  if (typeof window === "undefined") return 0;
  const query = window.location.hash.split("?")[1] ?? "";
  const id = new URLSearchParams(query).get("scene");
  const fromUrl = scenes.findIndex((scene) => scene.id === id);
  if (fromUrl >= 0) return fromUrl;
  const stored = Number(window.sessionStorage.getItem(STORY_POSITION_KEY));
  return Number.isInteger(stored) && stored >= 0 && stored < scenes.length ? stored : 0;
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("button, a, input, textarea, select, video, [data-scene-interactive]"));
}

export function StoryPlayer({ audioRef }: { audioRef: RefObject<HTMLAudioElement> }) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(readInitialScene);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>("idle");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [musicOn, setMusicOn] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [dayTick, setDayTick] = useState(() => Date.now());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const touchStart = useRef<{ x: number; y: number; target: EventTarget | null } | null>(null);
  const timers = useRef<number[]>([]);
  const scene = scenes[currentSceneIndex];
  const chapterStarts = useMemo(() => new Map(chapterOrder.map((id) => [id, scenes.findIndex((item) => item.chapterId === id)])), []);
  const activePhotoIndex = activePhoto ? memories.findIndex((memory) => memory.src === activePhoto) : -1;
  const isLastScene = currentSceneIndex === scenes.length - 1;
  const togetherDays = useMemo(() => {
    void dayTick;
    return daysTogether();
  }, [dayTick]);

  useEffect(() => {
    if (!siteConfig.enableMusic || !audioRef.current) return;
    audioRef.current.play().then(() => setMusicOn(true)).catch(() => setMusicOn(false));
  }, [audioRef]);

  useEffect(() => {
    const timer = window.setInterval(() => setDayTick(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const updatePosition = useCallback((index: number) => {
    const next = scenes[index];
    window.sessionStorage.setItem(STORY_POSITION_KEY, String(index));
    const route = window.location.hash.split("?")[0] || "#/our-film";
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${route}?scene=${encodeURIComponent(next.id)}`);
  }, []);

  const playMusicFromGesture = useCallback(async () => {
    if (!siteConfig.enableMusic || !audioRef.current || musicOn) return;
    try {
      await audioRef.current.play();
      setMusicOn(true);
    } catch {
      setMusicOn(false);
    }
  }, [musicOn]);

  const goTo = useCallback((nextIndex: number, force = false) => {
    if (isTransitioning || (!force && videoPlaying)) return;
    if (nextIndex < 0 || nextIndex >= scenes.length || nextIndex === currentSceneIndex) return;
    playMusicFromGesture();
    setIsTransitioning(true);
    setTransitionPhase("leaving");
    timers.current.push(window.setTimeout(() => {
      setCurrentSceneIndex(nextIndex);
      updatePosition(nextIndex);
      setTransitionPhase("entering");
      timers.current.push(window.setTimeout(() => {
        setTransitionPhase("idle");
        setIsTransitioning(false);
      }, 560));
    }, 360));
  }, [currentSceneIndex, isTransitioning, playMusicFromGesture, updatePosition, videoPlaying]);

  useEffect(() => {
    document.documentElement.classList.add("story-mode");
    document.body.classList.add("story-mode");
    return () => {
      document.documentElement.classList.remove("story-mode");
      document.body.classList.remove("story-mode");
      timers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    updatePosition(currentSceneIndex);
  }, [currentSceneIndex, updatePosition]);

  useEffect(() => {
    const focusTimer = window.requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(focusTimer);
  }, [currentSceneIndex]);

  useEffect(() => {
    const candidates = [scenes[currentSceneIndex - 1], scenes[currentSceneIndex + 1], scenes[currentSceneIndex + 2]];
    candidates.forEach((candidate) => {
      if (!candidate) return;
      const sources = [candidate.image, ...(candidate.images ?? []), candidate.poster].filter(Boolean) as string[];
      sources.forEach((src) => { const image = new Image(); image.src = src; });
    });
  }, [currentSceneIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (activePhoto) return;
      if (event.key === "Escape") { setMenuOpen(false); return; }
      if (menuOpen || isInteractiveTarget(event.target)) return;
      if (event.key === "ArrowRight" || event.key === " ") { event.preventDefault(); if (!isLastScene) goTo(currentSceneIndex + 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); goTo(currentSceneIndex - 1); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activePhoto, currentSceneIndex, goTo, isLastScene, menuOpen]);

  function toggleMusic() {
    if (!audioRef.current) return;
    if (musicOn) { audioRef.current.pause(); setMusicOn(false); return; }
    audioRef.current.play().then(() => setMusicOn(true)).catch(() => setMusicOn(false));
  }

  function onTouchStart(event: React.TouchEvent<HTMLElement>) {
    if (isInteractiveTarget(event.target)) return;
    const touch = event.changedTouches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, target: event.target };
  }

  function onTouchEnd(event: React.TouchEvent<HTMLElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || videoPlaying || isInteractiveTarget(start.target) || isInteractiveTarget(event.target)) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goTo(currentSceneIndex + 1);
    else goTo(currentSceneIndex - 1);
  }

  function restart() {
    setMenuOpen(false);
    setActivePhoto(null);
    if (currentSceneIndex === 0) return;
    goTo(0, true);
  }

  return (
    <main className={`story-player story-player--${scene.theme ?? "dark"} story-player--transition-${transitionPhase}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} aria-label="我们的私人电影">
      <div className="story-letterbox story-letterbox--top" />
      <div className="story-grain" aria-hidden="true" />
      <div className="story-progress" aria-hidden="true"><span style={{ width: `${(currentSceneIndex / Math.max(1, scenes.length - 1)) * 100}%` }} /></div>
      <header className="story-topbar">
        <button className="story-wordmark" type="button" onClick={restart} data-scene-interactive aria-label="重新播放电影"><strong>OUR STORY</strong><small>A PRIVATE FILM</small></button>
        <div className="story-topbar__status"><span>{String(currentSceneIndex + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")}</span><em>{chapterLabels[scene.chapterId]}</em></div>
        <div className="story-topbar__actions">
          {siteConfig.enableMusic ? <button className={`story-music ${musicOn ? "is-on" : ""}`} type="button" data-scene-interactive onClick={(event) => { event.stopPropagation(); toggleMusic(); }} aria-pressed={musicOn} aria-label={musicOn ? "暂停背景音乐" : "播放背景音乐"}><i /> <span>{musicOn ? "SOUND ON" : "SOUND OFF"}</span></button> : null}
          <button className="story-menu-button" type="button" data-scene-interactive onClick={(event) => { event.stopPropagation(); setMenuOpen(true); }} aria-label="打开章节目录"><i /><i /><span>MENU</span></button>
        </div>
      </header>

      <div className={`story-stage story-stage--${transitionPhase}`} key={scene.id} aria-live="polite">
        <SceneRenderer scene={scene} headingRef={headingRef} onPhotoOpen={setActivePhoto} onVideoStateChange={setVideoPlaying} />
      </div>
      <div className="story-transition-curtain" aria-hidden="true" />
      <button className="story-hit-zone story-hit-zone--prev" type="button" data-scene-interactive onClick={() => goTo(currentSceneIndex - 1)} aria-label="上一幕"><span>PREV</span></button>
      <button className="story-hit-zone story-hit-zone--next" type="button" data-scene-interactive onClick={() => goTo(currentSceneIndex + 1)} aria-label={isLastScene ? "已经是片尾" : "下一幕"}><span>{isLastScene ? "END" : "NEXT"}</span></button>
      <div className="story-bottom-controls">
        {currentSceneIndex > 0 ? <button type="button" data-scene-interactive onClick={() => goTo(currentSceneIndex - 1)} aria-label="返回上一幕">←</button> : <span />}
        <small>{isLastScene ? `${togetherDays} DAYS TOGETHER` : "点击右侧继续"}</small>
        {isLastScene ? <button type="button" data-scene-interactive onClick={restart} aria-label="重新播放">REPLAY</button> : <button type="button" data-scene-interactive onClick={() => goTo(currentSceneIndex + 1, true)} aria-label="进入下一幕">NEXT <span aria-hidden="true">→</span></button>}
      </div>

      {menuOpen ? <div className="story-chapter-menu" role="dialog" aria-modal="true" aria-label="章节目录" data-scene-interactive onClick={(event) => event.stopPropagation()}><button className="story-chapter-menu__close" type="button" data-scene-interactive onClick={() => setMenuOpen(false)} aria-label="关闭章节目录">×</button><p className="story-scene__eyebrow">THE TWO OF US · CHAPTERS</p><nav>{chapterOrder.map((chapterId) => { const index = chapterStarts.get(chapterId) ?? 0; return <button type="button" key={chapterId} data-scene-interactive onClick={() => { setMenuOpen(false); goTo(index, true); }}><span>{String(index + 1).padStart(2, "0")}</span><strong>{chapterLabels[chapterId]}</strong><em>{chapterId.replaceAll("-", " ")}</em></button>; })}</nav></div> : null}
      <div className="story-letterbox story-letterbox--bottom" />
      {activePhotoIndex >= 0 ? <PhotoLightbox images={memories} activeIndex={activePhotoIndex} onClose={() => setActivePhoto(null)} onChange={(index) => setActivePhoto(memories[index]?.src ?? null)} /> : null}
    </main>
  );
}
