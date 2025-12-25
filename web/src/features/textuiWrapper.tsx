import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

export default function TextUIWrapper() {
    const [visible, setVisible] = useState(false);
    const [outro, setOutro] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState<string | null>(null);
    const [iconColor, setIconColor] = useState<string | null>(null);
    const [iconAnimation, setIconAnimation] = useState<string | null>(null);
    const [position, setPosition] = useState("left-center");
    const [customStyle, setCustomStyle] = useState<CSSProperties>({});

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            const data = event.data;

            if (data.action === "textui") {
                if (data.visible) {
                    setOutro(false);
                    setTitle(data.title || "");
                    setDescription(data.description || "");
                    setIcon(data.icon || null);
                    setIconColor(data.iconColor || null);
                    setIconAnimation(data.iconAnimation || null);
                    setPosition(data.position || "left-center");
                    setCustomStyle(data.style || {});
                    setVisible(true);
                } else {
                    setOutro(true);
                    setTimeout(() => setVisible(false), 200);
                }
            }
        };

        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);

    // const testUI = () => {
    //     setOutro(false);
    //     setTitle("Shop");
    //     setDescription("E - Open");
    //     setIcon("fa-shopping-basket");
    //     setIconColor("#cccccc");
    //     setIconAnimation("");
    //     setPosition("left-center");
    //     setCustomStyle({});
    //     setVisible(true);

    //     setTimeout(() => {
    //         setOutro(true);
    //         setTimeout(() => setVisible(false), 200);
    //     }, 2000);
    // };

    return (
        <>
            <style>{styles}</style>

            {/* <button className="textui-test-btn" onClick={testUI}>Test TextUI</button> */}

            {!visible ? null : (
                <div
                    className={`textui-wrapper ${position} ${outro ? "outro" : ""}`}
                    style={customStyle}
                >
                    {icon && (
                        <i
                            className={`textui-icon fas ${icon} ${iconAnimation || ""}`}
                            style={{ color: iconColor || "#ffffff" }}
                        ></i>
                    )}
                    <div className="textui-content">
                        <div className="textui-title">{title}</div>
                        <div className="textui-description">{description}</div>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = `
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

    .textui-wrapper {
        position: fixed;
        display: flex;
        align-items: center;
        gap: 12px;
        background: #141416ff;
        padding: 14px 16px;
        border-radius: 4px;
        color: white;
        font-family: 'Poppins', sans-serif;
        animation: fadeIn 0.2s ease-out;
    }

    .textui-wrapper.outro {
        animation: fadeOut 0.2s ease-out forwards;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to   { opacity: 0; }
    }

    .left-center {
        top: 50%;
        left: 1%;
        transform: translateY(-50%);
    }

    .right-center {
        top: 50%;
        right: 1%;
        transform: translateY(-50%);
    }

    .top-center {
        top: 2%;
        left: 50%;
        transform: translateX(-50%);
    }

    .bottom-center {
        bottom: 2%;
        left: 50%;
        transform: translateX(-50%);
    }

    .textui-icon {
        font-size: 18px;
        opacity: 0.45;
    }

    .textui-content {
        display: flex;
        flex-direction: column;
        line-height: 1.25;
    }

    .textui-title {
        font-size: 14px;
        font-weight: 400;
        opacity: 0.9;
    }

    .textui-description {
        font-size: 14px;
        font-weight: 300;
        margin-top: 2px;
        opacity: 0.8;
    }
`;