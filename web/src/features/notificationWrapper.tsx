import { useEffect, useState } from "react";

type NotifyType = "success" | "error" | "inform";
type NotifyPosition =
  | "top-right"
  | "top-left"
  | "top"
  | "center-left"
  | "center-right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

type NotifyAnimation = "none" | "spin" | "pulse" | "bounce";

interface NotifyState {
  id: number;
  title: string;
  description: string;
  icon?: string;
  type?: NotifyType;
  duration?: number;
  position?: NotifyPosition;
  animation?: NotifyAnimation;
  showDuration?: boolean;
  iconColor?: string;
  style?: React.CSSProperties;
}

export default function NotificationWrapper() {
  const [notifications, setNotifications] = useState<NotifyState[]>([]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data;

      if (data?.action === "notify" && data.notify) {
        const n = data.notify as Omit<NotifyState, "id">;
        const id = Date.now() + Math.random();
        const duration = n.duration ?? 3000;

        const full: NotifyState = { id, ...n };

        setNotifications((prev) => [...prev, full]);

        setTimeout(() => {
          setNotifications((prev) => prev.filter((notif) => notif.id !== id));
        }, duration);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <>
      {notifications.map((n, index) => (
        <Notify key={n.id} notify={n} index={index} />
      ))}
    </>
  );
}

interface NotifyProps {
  notify: {
    title: string;
    description: string;
    icon?: string;
    type?: NotifyType;
    duration?: number;
    position?: NotifyPosition;
    animation?: NotifyAnimation;
    showDuration?: boolean;
    iconColor?: string;
    style?: React.CSSProperties;
  };
  index?: number;
}

export function Notify({ notify, index = 0 }: NotifyProps) {
  const {
    title,
    description,
    icon,
    type = "inform",
    duration = 3000,
    position = "top-right",
    animation = "none",
    showDuration = true,
    iconColor,
    style,
  } = notify;

  useEffect(() => {
    if (!document.getElementById("fa-loader")) {
      const link = document.createElement("link");
      link.id = "fa-loader";
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }
  }, []);

  const defaultIcon =
    type === "success"
      ? "check-circle"
      : type === "error"
      ? "times-circle"
      : "info-circle";

  const resolvedIcon = icon || defaultIcon;

  const iconClassBase = resolvedIcon.includes("fa-")
    ? resolvedIcon
    : `fas fa-${resolvedIcon}`;

  const variantClass =
    type === "success"
      ? "notify-success"
      : type === "error"
      ? "notify-error"
      : "notify-inform";

  const directionClass =
    position === "top"
      ? "notify-slide-top"
      : position === "bottom"
      ? "notify-slide-bottom"
      : position.endsWith("left")
      ? "notify-slide-left"
      : "notify-slide-right";

  const iconAnimationClass =
    animation === "spin"
      ? "icon-spin"
      : animation === "pulse"
      ? "icon-pulse"
      : animation === "bounce"
      ? "icon-bounce"
      : "";

  const iconClass = `${iconClassBase} ${iconAnimationClass}`;

  const baseStyle: React.CSSProperties = {
    animationDuration: `${duration}ms`,
    ["--notify-duration" as any]: `${duration}ms`,
  };

  const offset = index * 80;
  if (position.startsWith("top")) {
    baseStyle.marginTop = `${offset}px`;
  } else if (position.startsWith("bottom")) {
    baseStyle.marginBottom = `${offset}px`;
  }

  const wrapperStyle: React.CSSProperties = {
    ...baseStyle,
    ...(style || {}),
  };

  const iconStyle: React.CSSProperties = {};
  if (iconColor) iconStyle.color = iconColor;

  return (
    <>
      <style>{styles}</style>

      <div
        className={`notify-wrapper ${variantClass} ${position} ${directionClass}`}
        style={wrapperStyle}
      >
        <div className="icon-wrapper">
          <div className="icon-ring">
            {showDuration && (
              <svg className="ring-svg" viewBox="0 0 28 28">
                <circle className="ring-bg" cx="14" cy="14" r="12" />
                <circle className="ring-progress" cx="14" cy="14" r="12" />
              </svg>
            )}
            <i className={iconClass} style={iconStyle}></i>
          </div>
        </div>

        <div className="title-description-wrap">
          <div className="title">{title}</div>
          <div className="description">{description}</div>
        </div>
      </div>
    </>
  );
}

const styles = `
    .notify-wrapper {
        position: fixed;
        display: flex;
        align-items: center;
        gap: 15px;
        border-radius: 6px;
        min-width: 300px;
        max-width: 300px;
        min-height: 60px;
        padding: 10px 15px;
        background: #141416ff;
        color: white;
        animation-timing-function: ease-in-out;
        animation-fill-mode: forwards;
        animation-duration: var(--notify-duration, 3000ms);
    }

    // .notify-success {
    //     background: radial-gradient(
    //         circle,
    //         rgba(5, 20, 13, 1) 0%,
    //         rgba(10, 36, 23, 1) 60%,
    //         rgba(18, 50, 33, 1) 100%
    //     );
    // }

    // .notify-error {
    //     background: radial-gradient(
    //         circle,
    //         rgba(30, 0, 5, 1) 0%,
    //         rgba(51, 12, 16, 1) 60%,
    //         rgba(70, 20, 25, 1) 100%
    //     );
    // }

    // .notify-inform {
    //     background: radial-gradient(
    //         circle,
    //         rgba(5, 12, 26, 1) 0%,
    //         rgba(10, 24, 46, 1) 60%,
    //         rgba(18, 36, 65, 1) 100%
    //     );
    // }

    .top-right { top: 2%; right: 1%; }
    .top-left { top: 2%; left: 1%; }
    .top { top: 2%; left: 50%; }
    .center-right { top: 50%; right: 1%; transform: translateY(-50%); }
    .center-left { top: 50%; left: 1%; transform: translateY(-50%); }
    .bottom-right { bottom: 2%; right: 1%; }
    .bottom-left { bottom: 2%; left: 1%; }
    .bottom { bottom: 2%; left: 50%; }

    .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon-ring {
        position: relative;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon-ring i {
        position: relative;
        z-index: 2;
        font-size: 16px;
        border-radius: 50%;
        padding: 7px;
        background-color: rgba(0,0,0,0.35);
    }

    .notify-success .icon-ring i {
        color: rgba(69, 198, 127, 1);
    }
    .notify-error .icon-ring i {
        color: rgba(255, 99, 132, 1);
    }
    .notify-inform .icon-ring i {
        color: rgba(80, 150, 255, 1);
    }

    .ring-svg {
        position: absolute;
        inset: 0;
        transform: rotate(-90deg);
        z-index: 1;
    }

    .ring-bg {
        fill: none;
        stroke: rgba(255,255,255,0.08);
        stroke-width: 2;
    }

    .ring-progress {
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-dasharray: 75.4;
        stroke-dashoffset: 0;
        animation: ringDrain var(--notify-duration, 3000ms) linear forwards;
    }

    .notify-success .ring-progress {
        stroke: rgba(69, 198, 127, 1);
    }
    .notify-error .ring-progress {
        stroke: rgba(255, 99, 132, 1);
    }
    .notify-inform .ring-progress {
        stroke: rgba(80, 150, 255, 1);
    }

    .title-description-wrap {
        display: flex;
        flex-direction: column;
        color: white;
    }

    .title {
        font-size: 1rem;
        font-weight: 500;
    }

    .description {
        font-size: .8rem;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.7);
    }

    .notify-slide-right { animation-name: notifySlideRight; }
    .notify-slide-left { animation-name: notifySlideLeft; }
    .notify-slide-top { animation-name: notifySlideTop; }
    .notify-slide-bottom { animation-name: notifySlideBottom; }

    .icon-spin {
        animation: iconSpin 1s linear infinite;
    }

    .icon-pulse {
        animation: iconPulse 1.2s ease-in-out infinite;
    }

    .icon-bounce {
        animation: iconBounce 0.8s ease-in-out infinite;
    }

    @keyframes notifySlideRight {
        0% { transform: translateX(40%); opacity: 0; }
        10% { transform: translateX(0); opacity: 1; }
        90% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(40%); opacity: 0; }
    }

    @keyframes notifySlideLeft {
        0% { transform: translateX(-40%); opacity: 0; }
        10% { transform: translateX(0); opacity: 1; }
        90% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(-40%); opacity: 0; }
    }

    @keyframes notifySlideTop {
        0% { transform: translate(-50%, -40%); opacity: 0; }
        10% { transform: translate(-50%, 0); opacity: 1; }
        90% { transform: translate(-50%, 0); opacity: 1; }
        100% { transform: translate(-50%, -40%); opacity: 0; }
    }

    @keyframes notifySlideBottom {
        0% { transform: translate(-50%, 40%); opacity: 0; }
        10% { transform: translate(-50%, 0); opacity: 1; }
        90% { transform: translate(-50%, 0); opacity: 1; }
        100% { transform: translate(-50%, 40%); opacity: 0; }
    }

    @keyframes ringDrain {
        0%   { stroke-dashoffset: 0; }
        100% { stroke-dashoffset: 75.4; }
    }

    @keyframes iconSpin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @keyframes iconPulse {
        0%   { transform: scale(1); }
        50%  { transform: scale(1.15); }
        100% { transform: scale(1); }
    }

    @keyframes iconBounce {
        0%   { transform: translateY(0); }
        30%  { transform: translateY(-4px); }
        60%  { transform: translateY(0); }
        100% { transform: translateY(-2px); }
    }
`;