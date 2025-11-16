import { useEffect, useState } from "react";
import Notify from "./features/notify";

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

function App() {
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

  // const triggerTestNotification = () => {
  //   const id = Date.now() + Math.random();
  //   const n: NotifyState = {
  //     id,
  //     title: "Test Notification",
  //     description: "This pops up for 10 seconds.",
  //     type: "inform",
  //     duration: 10000,
  //     position: "top",
  //     style: {
  //       // backgroundColor: "#d90b0bff",
  //     },
  //   };

  //   setNotifications((prev) => [...prev, n]);

  //   setTimeout(() => {
  //     setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  //   }, n.duration ?? 4000);
  // };

  return (
    <div style={{ padding: "20px" }}>
      {/* <button onClick={triggerTestNotification}>
        Test Notification
      </button> */}

      {notifications.map((n, index) => (
        <Notify key={n.id} notify={n} index={index} />
      ))}
    </div>
  );
}

export default App;