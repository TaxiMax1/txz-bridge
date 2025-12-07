import { useEffect, useState } from "react";

export default function ProgressWrapper() {
    const [active, setActive] = useState(false);
    const [outro, setOutro] = useState(false);
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
        setOutro(false);

        let p = 0;
        const interval = setInterval(() => {
            p += 1;
            setPercent(p);
            if (p >= 100) {
                clearInterval(interval);

                // OUTRO animation
                setTimeout(() => {
                    setOutro(true);
                    setTimeout(() => setActive(false), 350);
                }, 200);
            }
        }, 40);
    };

    return (
        <>
            <style>{styles}</style>

            {/* <button className="fakeBtn" onClick={() => triggerProgress("Testing progress...")}>
                Test Progress
            </button> */}

            {active && (
                <div className={`progress-wrapper ${outro ? "outro" : ""}`}>
                    <div className="title">
                        <p className="titleLabel">{label}</p>
                        <p className="progressLabel">{percent}%</p>
                    </div>

                    <div style={{ padding: "5px", border: "1px solid rgba(255, 255, 255, 0.2" }}>
                        <div className="progress-box">
                            <div className="segments">
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`segment ${
                                            i < Math.round((percent / 100) * 24)
                                                ? "filled"
                                                : "empty"
                                        }`}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = `
    .progress-wrapper {
        position: fixed;
        bottom: 10%;
        left: 50%;
        transform: translate(-50%, 0);
        width: 330px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-family: 'Poppins', sans-serif;
        animation: fadeIn 0.2s ease-out forwards;
        opacity: 1;
    }

    .progress-wrapper.outro {
        animation: fadeOut 0.35s ease-out forwards;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(-50%) translateY(10px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(10px); }
    }

    .title {
        display: flex;
        justify-content: space-between;
        color: white;
        width: 100%;
        font-size: 14px;
        font-weight: 400;
        text-shadow: 0 0 4px rgba(0,0,0,0.6);
    }

    .progressLabel {
        font-weight: 400;
        color: rgba(255,255,255,0.9);
    }

    .progress-box {
        width: 100%;
        height: 18px;
        background: radial-gradient(circle,rgba(255, 255, 255, 0.1) 40%, rgba(148, 188, 233, 0) 100%);
        border-radius: 4px;
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

    .filled { 
        background: linear-gradient(90deg,rgba(69, 141, 224, 1) 0%, rgba(100, 139, 176, 1) 100%);
        box-shadow: 0 0 6px #5eabf7ff;
    }

    .empty { 
        background-color: rgba(40,40,40,0.85);
    }
`;