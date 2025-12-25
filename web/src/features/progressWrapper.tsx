import { useEffect, useRef, useState } from "react";

type ProgressStartMsg = {
  action: "progress";
  duration?: number;
  title?: string;
  subtitle?: string;
  percent?: number;
  icon?: string;
  iconColor?: string;
  canCancel?: boolean;
};

type ProgressSetMsg = {
  action: "progress:set";
  active?: boolean;
  title?: string;
  subtitle?: string;
  percent?: number;
  icon?: string;
  iconColor?: string;
  canCancel?: boolean;
};

type ProgressStopMsg = { action: "progress:stop" };

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

async function nuiPost<T = any>(eventName: string, data?: any): Promise<T> {
  const res = await fetch(`https://txz-bridge/${eventName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data ?? {}),
  });
  try {
    return (await res.json()) as T;
  } catch {
    return {} as T;
  }
}

export default function ProgressWrapper() {
  const [active, setActive] = useState(false);
  const [outro, setOutro] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [percent, setPercent] = useState(0);

  const [icon, setIcon] = useState<string>("");
  const [iconColor, setIconColor] = useState<string>("#ff3b3b");
  const [canCancel, setCanCancel] = useState(true);

  const activeRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const outroRef = useRef<number | null>(null);
  const cancelSentRef = useRef(false);
  const animIdRef = useRef(0);

  useEffect(() => {
    if (!document.getElementById("fa-loader")) {
      const link = document.createElement("link");
      link.id = "fa-loader";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const cleanup = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    if (outroRef.current != null) window.clearTimeout(outroRef.current);
    rafRef.current = null;
    outroRef.current = null;
  };

  const resolvedIconClass = (() => {
    const resolved = icon?.trim() || "crosshairs";
    if (resolved.includes("fa-")) return resolved;
    return `fas fa-${resolved}`;
  })();

  const endProgress = async (reason: "done" | "cancel") => {
    cleanup();
    animIdRef.current += 1;
    activeRef.current = false;
    setOutro(true);

    if (reason === "cancel" && !cancelSentRef.current) {
      cancelSentRef.current = true;
      try {
        await nuiPost("progress:cancel", {});
      } catch {}
    }

    outroRef.current = window.setTimeout(() => {
      setActive(false);
      setOutro(false);
      setPercent(0);
      cancelSentRef.current = false;
    }, 220);
  };

  const animateTo = (fromPercent: number, toPercent: number, durationMs: number) => {
    cleanup();

    const from = clamp(Math.round(fromPercent), 0, 100);
    const to = clamp(Math.round(toPercent), 0, 100);
    const dur = Math.max(120, Math.round(durationMs));

    const myAnimId = (animIdRef.current += 1);
    const t0 = performance.now();
    const range = to - from;

    setPercent(from);

    const tick = (now: number) => {
      if (!activeRef.current) return;
      if (animIdRef.current !== myAnimId) return;

      const t = clamp((now - t0) / dur, 0, 1);
      const p = Math.round(from + range * t);
      setPercent(p);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPercent(to);
        if (to >= 100 && activeRef.current && animIdRef.current === myAnimId) {
          window.setTimeout(() => endProgress("done"), 220);
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const triggerProgress = (t: string, st: string, startPercent: number, durationMs: number) => {
    cancelSentRef.current = false;

    const start = clamp(Math.round(startPercent), 0, 100);
    const dur = Math.max(200, Math.round(durationMs));

    cleanup();
    animIdRef.current += 1;

    setTitle(t);
    setSubtitle(st);
    setOutro(false);

    setPercent(start);
    activeRef.current = true;
    setActive(true);

    animateTo(start, 100, dur);
  };

  const dotOn = (idx: number) => {
    const thresholds = [25, 50, 75, 100];
    return percent >= thresholds[idx];
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as ProgressStartMsg | ProgressSetMsg | ProgressStopMsg;
      if (!data?.action) return;

      if (data.action === "progress") {
        const t = typeof (data as ProgressStartMsg).title === "string" ? (data as ProgressStartMsg).title! : "Initializing Hack";
        const st =
          typeof (data as ProgressStartMsg).subtitle === "string"
            ? (data as ProgressStartMsg).subtitle!
            : "Bypassing security protocols...";

        const start =
          typeof (data as ProgressStartMsg).percent === "number"
            ? clamp(Math.round((data as ProgressStartMsg).percent!), 0, 100)
            : 0;

        const dur =
          typeof (data as ProgressStartMsg).duration === "number"
            ? Math.max(200, Math.round((data as ProgressStartMsg).duration!))
            : 4000;

        if (typeof (data as ProgressStartMsg).icon === "string") setIcon((data as ProgressStartMsg).icon!);
        if (typeof (data as ProgressStartMsg).iconColor === "string") setIconColor((data as ProgressStartMsg).iconColor!);
        if (typeof (data as ProgressStartMsg).canCancel === "boolean") setCanCancel((data as ProgressStartMsg).canCancel!);
        else setCanCancel(true);

        triggerProgress(t, st, start, dur);
        return;
      }

      if (data.action === "progress:set") {
        const d = data as ProgressSetMsg;

        if (typeof d.title === "string") setTitle(d.title);
        if (typeof d.subtitle === "string") setSubtitle(d.subtitle);
        if (typeof d.icon === "string") setIcon(d.icon);
        if (typeof d.iconColor === "string") setIconColor(d.iconColor);
        if (typeof d.canCancel === "boolean") setCanCancel(d.canCancel);

        if (typeof d.percent === "number") setPercent(clamp(Math.round(d.percent), 0, 100));

        if (d.active === true) {
          cancelSentRef.current = false;
          activeRef.current = true;
          setActive(true);
          setOutro(false);
        }

        if (d.active === false) endProgress("done");
        return;
      }

      if (data.action === "progress:stop") {
        endProgress("done");
        return;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeRef.current) return;
      if (!canCancel) return;

      if (e.code === "KeyX") {
        endProgress("cancel");
      }
    };

    window.addEventListener("message", onMessage);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("keydown", onKeyDown);
      cleanup();
    };
  }, [canCancel]);

  return (
    <>
      <style>{styles}</style>

      {active && (
        <div className={`hp ${outro ? "outro" : ""}`} style={{ ["--accent" as any]: iconColor }}>
          <div className="hp-top">
            <div className="hp-left">
              <div className="hp-icon" aria-hidden="true" style={{ color: iconColor }}>
                <i className={resolvedIconClass} />
              </div>

              <div className="hp-title">{title}</div>
            </div>

            <div className="hp-right">
              <div className="hp-dots" aria-hidden="true">
                <span className={`dot ${dotOn(0) ? "on" : "off"}`} />
                <span className={`dot ${dotOn(1) ? "on" : "off"}`} />
                <span className={`dot ${dotOn(2) ? "on" : "off"}`} />
                <span className={`dot ${dotOn(3) ? "on" : "off"}`} />
              </div>
              <div className="hp-percent">{percent}%</div>
            </div>
          </div>

          <div className="hp-sub">{subtitle}</div>

          <div className="hp-bar">
            <div className="hp-fill" style={{ width: `${percent}%`, background: iconColor }} />
          </div>

          <div className="hp-divider" />

          <div className="hp-cancel" style={{ opacity: canCancel ? 1 : 0.35 }}>
            <span>Press</span>
            <span className="hp-key">X</span>
            <span>to cancel</span>
          </div>
        </div>
      )}
    </>
  );
}

const styles = `
    .hp {
        position: fixed;
        left: 50%;
        bottom: 6%;
        transform: translateX(-50%);
        width: 420px;
        border-radius: 10px;
        background: #141416ff;
        border: 1px solid rgba(255,255,255,0.06);
        padding: 14px 16px 12px 16px;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        color: rgba(255,255,255,0.92);
        animation: hpIn 160ms ease-out both;
    }

    .hp.outro {
        animation: hpOut 220ms ease-in both;
    }

    @keyframes hpIn {
        from { opacity: 0; transform: translateX(-50%) translateY(10px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0px); }
    }

    @keyframes hpOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0px); }
        to { opacity: 0; transform: translateX(-50%) translateY(10px); }
    }

    .hp-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }

    .hp-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
    }

    .hp-icon {
        width: 15px;
        height: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .hp-title {
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 0.2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .hp-right {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
    }

    .hp-dots {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-right: 2px;
    }

    .dot {
        width: 7px;
        height: 7px;
        border-radius: 999px;
    }

    .dot.on {
        background: var(--accent, #ff3b3b);
        box-shadow: 0 0 10px rgba(255,255,255,0.06);
        filter: drop-shadow(0 0 10px rgba(0,0,0,0.25));
        opacity: 1;
    }

    .dot.off {
        background: rgba(255,255,255,0.22);
        transform: translateY(0px);
        opacity: 0.8;
    }

    .hp-percent {
        font-size: 14px;
        font-weight: 500;
        color: rgba(255,255,255,0.55);
    }

    .hp-sub {
        margin-top: 8px;
        font-size: 13px;
        font-weight: 400;
        color: rgba(255,255,255,0.45);
    }

    .hp-bar {
        margin-top: 10px;
        height: 7px;
        border-radius: 999px;
        background: rgba(255,255,255,0.10);
        overflow: hidden;
    }

    .hp-fill {
        height: 100%;
        border-radius: 999px;
        box-shadow: 0 0 14px rgba(255,59,59,0.22);
        transition: width 90ms linear;
    }

    .hp-divider {
        margin-top: 12px;
        height: 1px;
        background: rgba(255,255,255,0.06);
    }

    .hp-cancel {
        margin-top: 10px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        font-weight: 400;
        color: rgba(255,255,255,0.25);
    }

    .hp-key {
        color: rgba(255,255,255,0.55);
        font-weight: 500;
        letter-spacing: 0.2px;
    }
`;