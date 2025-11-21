import { useEffect, useState } from "react";

export default function ProgressWrapper() {
    const [active, setActive] = useState(false);
    const [label, setLabel] = useState("");
    const [percent, setPercent] = useState(0);

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            const data = event.data;
            if (data?.action === "progress") triggerProgress(data.label);
        };

        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);

    const triggerProgress = (lbl: string) => {
        setLabel(lbl);
        setPercent(0);
        setActive(true);

        let p = 0;
        const interval = setInterval(() => {
            p += 1;
            setPercent(p);
            if (p >= 100) {
                clearInterval(interval);
                setTimeout(() => setActive(false), 500);
            }
        }, 40);
    };

    const fakeButtonTrigger = () => {
        window.postMessage({
            action: "progress",
            label: "Eating..."
        });
    };

    return (
        <>
            <style>{styles}</style>

            <button className="fakeBtn" onClick={fakeButtonTrigger}>
                Start Progressbar
            </button>

            {active && (
                <div className="progress-wrapper">
                    <div className="title">
                        <p className="titleLabel">{label}</p>
                        <p className="progressLabel">{percent}%</p>
                    </div>

                    <div className="progress-box">
                        <div className="segments">
                            {Array.from({ length: 28 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`segment ${
                                        i < Math.round((percent / 100) * 28)
                                            ? "filled"
                                            : "empty"
                                    }`}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = `
    .fakeBtn {
        position: fixed;
        top: 20px;
        left: 20px;
        background: #4caf50;
        color: white;
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        z-index: 9999;
    }

    .progress-wrapper {
        position: fixed;
        bottom: 3%;
        left: 50%;
        transform: translateX(-50%);
        width: 420px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-family: sans-serif;
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(-50%) translateY(10px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    .title {
        display: flex;
        justify-content: space-between;
        color: white;
        width: 100%;
        font-size: 16px;
        font-weight: 600;
        text-shadow: 0 0 4px black;
    }

    .progressLabel {
        font-weight: 400;
        color: rgba(255,255,255,0.9);
    }

    .progress-box {
        width: 100%;
        height: 24px;
        border: 2px solid rgba(255,255,255,0.35);
        background: rgba(0,0,0,0.25);
        border-radius: 4px;
        backdrop-filter: blur(2px);
        overflow: hidden;
        display: flex;
        align-items: center;
        padding-left: 6px;
        padding-right: 6px;
    }

    .segments {
        display: flex;
        gap: 3px;
        width: 100%;
    }

    .segment {
        width: 12px;
        height: 12px;
        clip-path: polygon(
            0% 0%,
            65% 0%,
            100% 50%,
            65% 100%,
            0% 100%,
            35% 50%
        );
    }

    .filled { background-color: #5ef7c8; box-shadow: 0 0 6px #5ef7c8; }
    .empty { background-color: rgba(40,40,40,0.85); }
`;