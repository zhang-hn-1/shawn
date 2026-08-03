import type { RefObject } from "react";
import { memories } from "../../data/memories";
import type { StoryScene } from "../../data/scenes";

type SceneRendererProps = {
  scene: StoryScene;
  headingRef: RefObject<HTMLHeadingElement>;
  onPhotoOpen: (src: string) => void;
  onVideoStateChange: (playing: boolean) => void;
};

function memoryFor(src?: string) {
  return memories.find((memory) => memory.src === src);
}

function PhotoFrame({ src, scene, paired = false, onPhotoOpen }: { src: string; scene: StoryScene; paired?: boolean; onPhotoOpen: (src: string) => void }) {
  const memory = memoryFor(src);
  return (
    <figure className={`story-photo ${paired ? "story-photo--paired" : ""} ${memory?.orientation === "portrait" ? "story-photo--portrait" : ""}`}>
      <button className="story-photo__button" type="button" data-scene-interactive onClick={(event) => { event.stopPropagation(); onPhotoOpen(src); }} aria-label={`查看照片：${memory?.alt ?? scene.title ?? "回忆照片"}`}>
        <img src={src} alt={memory?.alt ?? scene.title ?? "回忆照片"} loading="eager" decoding="async" />
        <span>VIEW</span>
      </button>
      {memory && (memory.location || scene.caption || memory.caption) ? <figcaption>{memory.location ? <span>{memory.location}</span> : null}<strong>{scene.caption ?? memory.caption}</strong></figcaption> : null}
    </figure>
  );
}

export function SceneRenderer({ scene, headingRef, onPhotoOpen, onVideoStateChange }: SceneRendererProps) {
  const heading = (content: string, level: "h1" | "h2" = "h2") => level === "h1" ? <h1 ref={headingRef} tabIndex={-1}>{content}</h1> : <h2 ref={headingRef} tabIndex={-1}>{content}</h2>;

  if (scene.type === "opening") {
    return <div className="story-scene story-scene--opening"><div className="story-opening__copy"><p>{scene.text}</p><h1 ref={headingRef} tabIndex={-1}><span>{scene.title ?? "我们共同拍摄的"}</span><span>{scene.subtitle}</span></h1><small>点击右侧进入故事</small></div></div>;
  }

  if (scene.type === "photo" && scene.image) {
    return <div className="story-scene story-scene--photo"><div className="story-scene__eyebrow">{scene.title}</div><h2 className="story-photo-title" ref={headingRef} tabIndex={-1}>{scene.title}</h2><PhotoFrame src={scene.image} scene={scene} onPhotoOpen={onPhotoOpen} /></div>;
  }

  if (scene.type === "photo-pair" && scene.images) {
    return <div className="story-scene story-scene--photo-pair"><div className="story-scene__copy"><div className="story-scene__eyebrow">{scene.title}</div>{heading(scene.text ?? "一起走过的路")}<p>{scene.date} · {scene.location}</p></div><div className="story-photo-pair">{scene.images.slice(0, 2).map((src) => <PhotoFrame key={src} src={src} scene={scene} paired onPhotoOpen={onPhotoOpen} />)}</div></div>;
  }

  if (scene.type === "chat") {
    return <div className={`story-scene story-scene--chat story-scene--${scene.alignment ?? "left"}`}><div className="story-scene__eyebrow">{scene.title} · {scene.date}</div><div className="story-chat"><span className="story-chat__time">{scene.time}</span><span className={`story-chat__speaker ${scene.speaker === "她" ? "is-her" : "is-me"}`}>{scene.speaker}</span>{heading(scene.text ?? "")}</div></div>;
  }

  if (scene.type === "video") {
    return <div className="story-scene story-scene--video"><div className="story-scene__copy"><div className="story-scene__eyebrow">{scene.subtitle}</div>{heading(scene.title ?? "视频片段")}</div><div className="story-video-frame" data-scene-interactive onClick={(event) => event.stopPropagation()}>{scene.video ? <video src={scene.video} poster={scene.poster} controls muted preload="metadata" onPlay={() => onVideoStateChange(true)} onPause={() => onVideoStateChange(false)} onEnded={() => onVideoStateChange(false)} /> : <><img src={scene.poster} alt="视频片段封面" /><span className="story-video-frame__placeholder">VIDEO · 待放映</span></>}</div><p className="story-scene__note">{scene.text}</p></div>;
  }

  if (scene.type === "ending") {
    return <div className="story-scene story-scene--ending"><div className="story-ending__copy"><div className="story-scene__eyebrow">{scene.text}</div><span className="story-ending__english">{scene.title ?? "TO BE CONTINUED"}</span><h2 ref={headingRef} tabIndex={-1}>{scene.subtitle ?? "下一幕仍在拍摄中"}</h2><small>点击左侧返回，或使用右下角重新播放</small></div></div>;
  }

  if (scene.type === "location") {
    return <div className="story-scene story-scene--location"><div className="story-location__copy"><div className="story-scene__eyebrow">{scene.title}</div>{heading(scene.location ?? "SOMEWHERE") }<strong>{scene.date}</strong><p>{scene.text}</p></div></div>;
  }

  return <div className={`story-scene story-scene--${scene.type} story-scene--${scene.alignment ?? "left"}`}><div className="story-scene__copy"><div className="story-scene__eyebrow">{scene.subtitle}</div>{heading(scene.title ?? "")}<p>{scene.text}</p></div></div>;
}
