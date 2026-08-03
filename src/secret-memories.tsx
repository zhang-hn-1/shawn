import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { StoryPlayer } from "./components/story/StoryPlayer";
import { siteConfig } from "./data/site-config";

function PasswordGate({ stage, value, error, onChange, onSubmit }: { stage: 0 | 1; value: string; error: string; onChange: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const first = stage === 0;
  return (
    <main className="memory-page memory-page--gate">
      <div className="story-letterbox story-letterbox--top" />
      <div className="memory-gate" role="dialog" aria-labelledby="memory-gate-title">
        <span className="memory-gate__mark" aria-hidden="true">✦</span>
        <p className="film-kicker">A PRIVATE FILM · {first ? "01 / 02" : "02 / 02"}</p>
        <h1 id="memory-gate-title">{first ? "先说出小张的生日" : "再说出小王的生日"}</h1>
        <p>{first ? "第一重门，只为确认这是你们的故事。" : "第二重门，里面是只属于你们的片段。"}</p>
        <form className={`memory-code-form ${error ? "has-error" : ""}`} onSubmit={onSubmit}>
          <label htmlFor="memory-code">输入四位数字</label>
          <div><input id="memory-code" type="password" inputMode="numeric" pattern="[0-9]*" maxLength={4} autoComplete="off" autoFocus value={value} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 4))} aria-describedby={error ? "memory-code-error" : undefined} /><button type="submit">进入 <span aria-hidden="true">→</span></button></div>
          <small id="memory-code-error" aria-live="polite">{error}</small>
        </form>
        <div className="memory-gate__dots" aria-label={`第 ${stage + 1} 重密码`}><i className={first ? "is-active" : "is-done"} /><i className={!first ? "is-active" : ""} /></div>
        <small className="memory-gate__note">仅供两位主人进入 · 请把地址留在心里</small>
      </div>
      <div className="story-letterbox story-letterbox--bottom" />
    </main>
  );
}

export function MemoryPage() {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const passwords = [siteConfig.passwords.first, siteConfig.passwords.second];

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code !== passwords[stage]) { setError("这组数字还不对，再想想我们的生日。"); return; }
    setError("");
    setCode("");
    if (stage === 1 && siteConfig.enableMusic) {
      audioRef.current?.play().catch(() => undefined);
    }
    setStage((current) => (current + 1) as 1 | 2);
  }

  return <>
    <audio ref={audioRef} src={siteConfig.musicSrc} loop preload="auto" aria-hidden="true" />
    {stage !== 2 ? <PasswordGate stage={stage} value={code} error={error} onChange={setCode} onSubmit={submitCode} /> : <StoryPlayer audioRef={audioRef} />}
  </>;
}
