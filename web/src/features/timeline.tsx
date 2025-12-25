import { useEffect, useMemo, useState } from "react"

export default function TimeLine() {
  const [visible, setVisible] = useState(false)
  const [timeline, setTimeline] = useState({
    id: null,
    title: "Bank Heist",
    description: "Complete all objectives to finish the heist",
    icon: "fa-brands fa-discord",
    tasks: [
      { id: "acquire", title: "Acquire equipment", description: "Get supplies from the warehouse", status: "complete" },
      { id: "hack", title: "Hack security system", description: "Disable cameras and alarms", status: "active" },
      { id: "vault", title: "Access the vault", description: "", status: "pending" },
      { id: "escape", title: "Escape the area", description: "", status: "pending" },
    ],
  })

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const d = e?.data
      if (!d || typeof d !== "object") return

      if (d.action === "timeline:show") {
        const tl = d.timeline || {}
        setTimeline((prev) => ({
          id: tl.id ?? prev.id ?? "timeline",
          title: tl.title ?? prev.title,
          description: tl.description ?? prev.description,
          icon: tl.icon ?? prev.icon,
          tasks: Array.isArray(tl.tasks) ? tl.tasks : prev.tasks,
        }))
        setVisible(true)
        return
      }

      if (d.action === "timeline:hide") {
        if (!d.id || d.id === timeline.id) setVisible(false)
        return
      }

      if (d.action === "timeline:update") {
        const updates = d.updates || {}
        setTimeline((prev) => ({
          ...prev,
          ...updates,
          tasks: Array.isArray(updates.tasks) ? updates.tasks : prev.tasks,
        }))
        return
      }

      if (d.action === "timeline:tasks:update") {
        const timelineId = d.timelineId
        if (timelineId && timelineId !== timeline.id) return
        const updates = d.tasks
        if (!updates) return

        setTimeline((prev) => {
          const map = new Map((prev.tasks || []).map((t) => [t.id, t]))
          if (Array.isArray(updates)) {
            for (const u of updates) {
              if (!u) continue
              const id = u.id
              if (!id) continue
              map.set(id, { ...map.get(id), ...u })
            }
          } else {
            const id = updates.id
            if (id) map.set(id, { ...map.get(id), ...updates })
          }
          return { ...prev, tasks: Array.from(map.values()) }
        })
        return
      }

      if (d.action === "timeline:tasks:add") {
        const timelineId = d.timelineId
        if (timelineId && timelineId !== timeline.id) return
        const task = d.task
        if (!task || !task.id) return
        setTimeline((prev) => {
          const exists = (prev.tasks || []).some((t) => t.id === task.id)
          const tasks = exists
            ? (prev.tasks || []).map((t) => (t.id === task.id ? { ...t, ...task } : t))
            : [...(prev.tasks || []), task]
          return { ...prev, tasks }
        })
        return
      }
    }

    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [timeline.id])

  const tasks = timeline.tasks || []

  const rows = useMemo(() => {
    return tasks.map((t, idx) => {
      const next = tasks[idx + 1]
      const isLast = idx === tasks.length - 1

      const status = t.status || "pending"
      const nextStatus = next?.status || "pending"

      const itemClass =
        status === "complete"
          ? "tl-item tl-complete tl-teal"
          : status === "active"
          ? "tl-item tl-active tl-blue"
          : "tl-item tl-pending"

      const linkClass = (() => {
        if (isLast) return "tl-item-last"
        if (status === "complete" && (nextStatus === "complete" || nextStatus === "active")) return "tl-link-teal"
        if (status === "active") return "tl-link-blue"
        return "tl-link-grey"
      })()

      const icon = (() => {
        if (status === "complete") return <i className="fa-solid fa-check"></i>
        if (status === "active") return <i className="fa-solid fa-spinner tl-spin"></i>
        return <span className="tl-dot"></span>
      })()

      const iconWrapClass = status === "pending" ? "tl-item-icon tl-icon-dot" : "tl-item-icon tl-icon-fill"

      return {
        key: t.id ?? `task-${idx}`,
        className: `${itemClass} ${linkClass} ${isLast ? "tl-item-last" : ""}`,
        iconWrapClass,
        icon,
        title: t.title || "",
        desc: t.description || "",
      }
    })
  }, [tasks])

  if (!visible) return null

  return (
    <>
      <style>{styles}</style>

      <div className="tl-wrapper">
        <div className="tl-container">
          <header className="tl-header">
            <i className={`${timeline.icon || "fa-brands fa-discord"} tl-hd-icon`}></i>
            <div className="tl-hd-title">
              <p className="tl-hd-main">{timeline.title}</p>
              <p className="tl-hd-desc">{timeline.description}</p>
            </div>
          </header>

          <div className="tl-items">
            {rows.map((r) => (
              <div key={r.key} className={r.className}>
                <div className={r.iconWrapClass}>{r.icon}</div>
                <div className="tl-item-content">
                  <p className="tl-item-title">{r.title}</p>
                  {r.desc ? <p className="tl-item-desc">{r.desc}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

const styles = `
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.tl-wrapper{
  position:fixed;
  top:0;
  right:0;
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:flex-end;
  padding:18px;
  pointer-events:none;
}

.tl-container{
  width:300px;
  border-radius:4px;
  background: rgba(20, 20, 22, 0.92);
  overflow:hidden;
  font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  animation: tlfadein 0.3s ease-in-out;
}

.tl-header{
  display:flex;
  align-items:center;
  gap:10px;
  padding:12px 16px;
  background: rgba(20, 20, 22, 1);
}

.tl-hd-icon{
  font-size:18px;
  color:#8e949c;
  opacity:.8;
}

.tl-hd-title{
  display:flex;
  flex-direction:column;
}

.tl-hd-main{
  margin:0;
  font-size:14px;
  font-weight:600;
  color:#f3f4f6;
  line-height:1.15;
}

.tl-hd-desc{
  margin:2px 0 0 0;
  font-size:12.5px;
  color:#9aa1aa;
  line-height:1.35;
}

.tl-items{
  padding:12px 16px 16px 16px;
  display:flex;
  flex-direction:column;
  gap:14px;
}

.tl-item{
  position:relative;
  display:flex;
  gap:12px;
  align-items:flex-start;
}

.tl-item:not(.tl-item-last)::after{
  content:"";
  position:absolute;
  left:9px;
  top:22px;
  bottom:-14px;
  width:2px;
  border-radius:2px;
  background:rgba(150,156,166,.22);
}

.tl-item-icon{
  width:18px;
  height:18px;
  flex:0 0 18px;
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  z-index:1;
}

.tl-icon-fill{
  border-radius:999px;
  color:#ffffff;
  font-size:10px;
  box-shadow:0 0 0 3px rgba(0,0,0,.14);
}

.tl-icon-dot{
  border-radius:999px;
}

.tl-dot{
  width:12px;
  height:12px;
  border-radius:999px;
  background:rgba(190,196,206,.40);
}

.tl-item-content{
  padding-top:1px;
  flex:1;
}

.tl-item-title{
  margin:0;
  font-size:14px;
  font-weight:500;
  color:#f0f2f5;
  line-height:1.2;
}

.tl-item-desc{
  margin:4px 0 0 0;
  font-size:12.5px;
  color:#9aa1aa;
  line-height:1.35;
}

.tl-teal .tl-icon-fill{ background:#c11717; }
.tl-blue .tl-icon-fill{ background:#e52525; }

.tl-complete .tl-item-title{ color:#c11717; }
.tl-active .tl-item-title{ color:#e52525; }

.tl-link-teal:not(.tl-item-last)::after{ background:#c11717; }
.tl-link-blue:not(.tl-item-last)::after{ background:#e52525; }
.tl-link-grey:not(.tl-item-last)::after{ background:rgba(150,156,166,.22); }

.tl-spin{
  animation: tlspin 1s linear infinite;
}

@keyframes tlspin{
  from{ transform:rotate(0deg); }
  to{ transform:rotate(360deg); }
}

@keyframes tlfadein{
  from{ opacity:0; transform:translateX(10px); }
  to{ opacity:1; transform:translateX(0); }
}
`