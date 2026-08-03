import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import type { MemoryChat } from "../data/chats";
import type { MemoryImage } from "../data/memories";

export function ChapterHeader({ number, label, title, description, date, location }: {
  number: string;
  label: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
}) {
  return (
    <header className="film-chapter-header">
      <div className="film-chapter-header__top"><span>{number}</span><span>{label}</span></div>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {date || location ? <div className="film-chapter-header__meta"><span>{date}</span><span>{location}</span></div> : null}
    </header>
  );
}

export function MemoryPhoto({ memory, eager = false, className = "", onOpen }: { memory: MemoryImage; eager?: boolean; className?: string; onOpen?: (memory: MemoryImage) => void }) {
  return (
    <figure className={`film-photo film-photo--${memory.orientation} ${className}`.trim()}>
      <button type="button" className="film-photo__button" onClick={() => onOpen?.(memory)} aria-label={`查看照片：${memory.alt}`}>
        <img src={memory.src} alt={memory.alt} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" />
        <span className="film-photo__view">VIEW</span>
      </button>
      <figcaption><span>{memory.location}</span><strong>{memory.caption}</strong></figcaption>
    </figure>
  );
}

export function ChatSequence({ chats }: { chats: MemoryChat[] }) {
  return (
    <div className="film-chat-sequence">
      {chats.map((chat, index) => (
        <article className={`film-chat-line film-chat-line--${chat.speaker === "你" ? "her" : "me"} film-reveal`} style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties} key={chat.id}>
          <div className="film-chat-line__meta"><span>{chat.speaker}</span><span>{chat.date}{chat.time ? ` · ${chat.time}` : ""}</span></div>
          <p>{chat.content}</p>
        </article>
      ))}
    </div>
  );
}

export function PhotoLightbox({ images, activeIndex, onClose, onChange }: { images: MemoryImage[]; activeIndex: number; onClose: () => void; onChange: (index: number) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const active = images[activeIndex];
  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onChange((activeIndex + 1) % images.length);
      if (event.key === "ArrowLeft") onChange((activeIndex - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, images.length, onChange, onClose]);
  if (!active) return null;
  return (
    <div className="film-lightbox" role="dialog" aria-modal="true" aria-label="照片查看器" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <button className="film-lightbox__close" type="button" onClick={onClose} ref={closeRef} aria-label="关闭照片查看器">×</button>
      <button className="film-lightbox__prev" type="button" onClick={() => onChange((activeIndex - 1 + images.length) % images.length)} aria-label="上一张照片">←</button>
      <img src={active.src} alt={active.alt} />
      <button className="film-lightbox__next" type="button" onClick={() => onChange((activeIndex + 1) % images.length)} aria-label="下一张照片">→</button>
      <div className="film-lightbox__caption"><span>{active.location}</span><p>{active.caption}</p></div>
    </div>
  );
}
