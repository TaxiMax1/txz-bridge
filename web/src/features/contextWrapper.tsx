import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    GetParentResourceName?: () => string;
  }
}

type MetaRow =
  | { label: string; value?: unknown; progress?: number; colorScheme?: string }
  | [string, unknown]
  | string;

interface MenuOption {
  _key?: string;
  key?: string;
  title?: string;
  description?: string;
  icon?: string | null;
  iconColor?: string | null;
  iconAnimation?: string | null;
  disabled?: boolean;
  readOnly?: boolean;
  menu?: Menu | null;
  arrow?: boolean;
  progress?: number;
  colorScheme?: string | null;
  image?: string | null;
  metadata?: unknown;
  label?: string | null;
  _index?: number;
}

interface Menu {
  title?: string;
  subtitle?: string;
  canClose?: boolean;
  menu?: Menu | null;
  options?: MenuOption[];
}

interface MessageData {
  action: string;
  menu?: Menu;
  [key: string]: unknown;
}

const getResourceName = (): string => {
  if (window.GetParentResourceName) return window.GetParentResourceName();
  return "nui-resource";
};

const fetchNui = async (eventName: string, data: Record<string, unknown> = {}): Promise<unknown> => {
  const res = await fetch(`https://${getResourceName()}/${eventName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data),
  });
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const clampPct = (n: number) => Math.max(0, Math.min(100, n));

const isHex = (v?: string | null) => typeof v === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v);

const normalizeIcon = (icon?: string | null) => {
  if (!icon) return null;
  const s = String(icon).trim();
  if (!s) return null;
  if (s.includes("fa-")) return s;
  return `fa-${s}`;
};

const normalizeHex = (v?: string | null) => (isHex(v) ? v! : null);

export default function ContextUIWrapper() {
  const [visible, setVisible] = useState(false);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [selected, setSelected] = useState(0);

  const options = useMemo(() => {
    if (!menu || !menu.options) return [];
    return menu.options.map((o: MenuOption, idx: number) => ({
      key: o._key ?? o.key ?? String(idx + 1),
      title: o.title ?? "",
      description: o.description ?? "",
      icon: o.icon ?? null,
      iconColor: o.iconColor ?? null,
      iconAnimation: o.iconAnimation ?? null,
      disabled: !!o.disabled,
      readOnly: !!o.readOnly,
      menu: o.menu ?? null,
      arrow: o.arrow,
      progress: o.progress,
      colorScheme: o.colorScheme ?? null,
      image: o.image ?? null,
      metadata: o.metadata ?? null,
      label: o.label ?? null,
      _index: o._index ?? idx + 1,
    }));
  }, [menu]);

  const selectedOption = options[selected];

  const metaRows = useMemo(() => {
    const md = selectedOption?.metadata;
    if (!md) return [] as Array<{ label: string; value: unknown; progress?: number; colorScheme?: string }>;

    const push = (label: string, value: unknown, progress?: number, colorScheme?: string) => {
      rows.push({
        label,
        value,
        progress: typeof progress === "number" ? clampPct(progress) : undefined,
        colorScheme: normalizeHex(colorScheme) ?? undefined,
      });
    };

    const rows: Array<{ label: string; value: unknown; progress?: number; colorScheme?: string }> = [];

    if (Array.isArray(md)) {
      (md as MetaRow[]).forEach((x, i) => {
        if (x && typeof x === "object" && !Array.isArray(x) && "label" in x) {
          const obj = x as { label: unknown; value?: unknown; progress?: number; colorScheme?: string };
          push(String(obj.label ?? `Info ${i + 1}`), obj.value ?? "", obj.progress, obj.colorScheme);
          return;
        }
        if (Array.isArray(x) && x.length >= 2) {
          push(String(x[0]), x[1]);
          return;
        }
        if (typeof x === "string") {
          push(`Info ${i + 1}`, x);
          return;
        }
      });
      return rows;
    }

    if (typeof md === "object") {
      Object.entries(md as Record<string, unknown>).forEach(([k, v]) => push(String(k), v));
      return rows;
    }

    return rows;
  }, [selectedOption]);

  useEffect(() => {
    fetchNui("context:ready", {});
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent<unknown>): void => {
      const d = e.data as MessageData | null;
      if (!d || typeof d !== "object") return;

      if (d.action === "context:open") {
        setMenu((d.menu as Menu) || null);
        setSelected(0);
        setVisible(true);
        return;
      }

      if (d.action === "context:close") {
        setVisible(false);
        setMenu(null);
        setSelected(0);
        return;
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (!visible) return;

      if (e.key === "Escape") {
        if (menu && menu.canClose === false) return;
        fetchNui("context:close", { runExit: true });
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((v) => Math.max(0, v - 1));
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((v) => Math.min(options.length - 1, v + 1));
        return;
      }

      if (e.key === "Enter") {
        const it = options[selected];
        if (!it) return;
        if (it.disabled || it.readOnly) return;

        fetchNui("context:select", {
          key: it.key,
          index: it._index,
        });
        return;
      }

      if (e.key === "Backspace" || e.key === "ArrowLeft") {
        if (menu && menu.menu) fetchNui("context:back", {});
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, menu, options, selected]);

  if (!visible) return null;

  return (
    <>
      <style>{styles}</style>

      <div className="cm-screen">
        <div className="cm-layout">
          <div className={metaRows.length ? "cm-metapanel is-visible" : "cm-metapanel"}>
            <div className="cm-metapanel-inner">
              {metaRows.length ? (
                metaRows.map((row, i) => (
                  <div className="cm-metarow" key={`${row.label}-${i}`}>
                    <span className="cm-metalabel">{row.label}:</span>
                    <span className="cm-metavalue">{String(row.value ?? "")}</span>
                    {typeof row.progress === "number" ? (
                      <div className="cm-metaprogress">
                        <div className="cm-metaprogress-track">
                          <div
                            className="cm-metaprogress-fill"
                            style={{
                              width: `${clampPct(row.progress)}%`,
                              backgroundColor: row.colorScheme ?? undefined,
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="cm-metaempty">No metadata</div>
              )}
            </div>
          </div>

          <div className="cm-wrapper">
            <div className="cm-header">
              {menu && menu.menu ? (
                <button className="cm-back" onClick={() => fetchNui("context:back", {})} aria-label="Back">
                  <i className="fa-solid fa-chevron-left" />
                </button>
              ) : null}

              <div className="cm-titlewrap">
                <div className="cm-title">{menu?.title || ""}</div>
                <div className="cm-subtitle">{menu?.subtitle || ""}</div>
              </div>
            </div>

            <div className="cm-list">
              {options.map((it, idx) => (
                <div
                  key={it.key}
                  className={[
                    "cm-item",
                    idx === selected ? "is-selected" : "",
                    it.disabled ? "is-disabled" : "",
                    it.readOnly ? "is-readonly" : "",
                  ].join(" ")}
                  onMouseEnter={() => setSelected(idx)}
                  onClick={() => {
                    setSelected(idx);
                    if (it.disabled || it.readOnly) return;
                    fetchNui("context:select", { key: it.key, index: it._index });
                  }}
                >
                  <div
                    className={it.disabled ? "cm-ico cm-ico-danger" : it.readOnly ? "cm-ico cm-ico-info" : "cm-ico"}
                    style={{ color: normalizeHex(it.iconColor) ?? undefined }}
                  >
                    <i
                      className={[
                        "fa-solid",
                        normalizeIcon(it.icon),
                        it.iconAnimation ? `fa-${it.iconAnimation}` : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                  </div>

                  <div className="cm-text">
                    <div className="cm-label">{it.title}</div>
                    <div className="cm-desc">{it.description}</div>

                    {typeof it.progress === "number" ? (
                      <div className="cm-progress">
                        <div className="cm-progress-track">
                          <div
                            className="cm-progress-fill"
                            style={{
                              width: `${clampPct(it.progress)}%`,
                              backgroundColor: normalizeHex(it.colorScheme) ?? undefined,
                              opacity: clamp01((normalizeHex(it.colorScheme) ? 1 : 0.35) as number),
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {it.image ? <div className="cm-thumb" style={{ backgroundImage: `url(${it.image})` }} /> : null}

                  {it.label ? <div className="cm-badge">{it.label}</div> : null}

                  {!!it.menu || it.arrow === true ? (
                    <div className="cm-chevron">
                      <i className="fa-solid fa-chevron-right" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="cm-footer">
              Press <span>ESC</span> to close
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = `
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');

.cm-screen{
  position: fixed;
  inset: 0;
  pointer-events: none;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
}

.cm-layout{
  position: absolute;
  right: 3%;
  top: 6%;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  pointer-events: none;
  animation: cm-fadein 180ms ease-in-out;
}

@keyframes cm-fadein {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}

.cm-wrapper{
  width: 360px;
  border-radius: 4px;
  background: #141416ff;
  border: 1px solid #ffffff0f;
  overflow: hidden;
  pointer-events: auto;
}

.cm-header{
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 0 14px 14px;
  border-bottom: 1px solid #ffffff0f;
}

.cm-back{
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255,255,255,0.7);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.cm-titlewrap{ display: flex; flex-direction: column; gap: 2px; }

.cm-title{
  color: rgba(255,255,255,0.92);
  font-weight: 500;
  font-size: 15px;
}

.cm-subtitle{
  color: rgba(255,255,255,0.55);
  font-size: 13px;
  line-height: 1.1;
}

.cm-item{
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  cursor: pointer;
}

.cm-item:last-child{ border-bottom: none; }

.cm-item.is-selected{
  background: rgba(255,255,255,0.06);
}

.cm-ico{
  display: grid;
  place-items: center;
  color: rgba(255,255,255,0.55);
  flex: 0 0 20px;
}
.cm-ico i{ font-size: 17px; }

.cm-text{
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1 1 auto;
}

.cm-label{
  color: rgba(255,255,255,0.92);
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cm-desc{
  color: rgba(255,255,255,0.55);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cm-item.is-disabled{ background: rgba(255,255,255,0.06); cursor: default; }
.cm-item.is-disabled .cm-label{ color: rgba(255,255,255,0.28); font-weight: 500; }
.cm-item.is-disabled .cm-desc{ color: rgba(255,255,255,0.18); }
.cm-item.is-disabled .cm-ico{ color: rgba(255, 80, 80, 0.65); }

.cm-item.is-readonly{ background: #141416ff; cursor: default; }
.cm-item.is-readonly .cm-label{ color: rgba(255,255,255,0.78); }
.cm-item.is-readonly .cm-desc{ color: rgba(255,255,255,0.42); }

.cm-progress{ margin-top: 8px; }
.cm-progress-track{
  height: 6px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  overflow: hidden;
}
.cm-progress-fill{
  height: 100%;
  border-radius: 999px;
  background: rgba(255,255,255,0.35);
}

.cm-thumb{
  width: 70px;
  height: 46px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow: 0 8px 20px rgba(0,0,0,0.35) inset;
  flex: 0 0 auto;
}

.cm-chevron{
  color: rgba(255,255,255,0.35);
  margin-left: 6px;
  flex: 0 0 auto;
}
.cm-chevron i{ font-size: 12px; }

.cm-badge{
  margin-left: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.6);
  font-weight: 400;
  font-size: 12px;
  line-height: 1.2;
  flex: 0 0 auto;
}

.cm-footer{
  padding: 10px 16px 12px 16px;
  border-top: 1px solid #ffffff0f;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.cm-footer span {
  color: rgba(255, 255, 255, 0.8);
}

.cm-metapanel{
  width: 220px;
  pointer-events: none;
  opacity: 0;
  transform: translateX(6px);
  transition: opacity 120ms ease, transform 120ms ease;
}

.cm-metapanel.is-visible{
  opacity: 1;
  transform: translateX(0);
}

.cm-metapanel-inner{
  background: rgba(20, 22, 28, 0.92);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  padding: 10px 12px;
  max-width: 195px;
  pointer-events: none;
}

.cm-metarow{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 10px;
  font-size: 13px;
  line-height: 1.3;
  align-items: center;
  margin-bottom: 6px;
}

.cm-metarow:last-child{ margin-bottom: 0; }

.cm-metalabel{ color: rgba(255,255,255,0.7); }
.cm-metavalue{ color: rgba(255,255,255,0.7); text-align: right; }

.cm-metaprogress{
  grid-column: 1 / -1;
  margin-top: 4px;
}

.cm-metaprogress-track{
  height: 6px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  overflow: hidden;
}

.cm-metaprogress-fill{
  height: 100%;
  border-radius: 999px;
  background: rgba(255,255,255,0.35);
}

.cm-metaempty{ color: rgba(255,255,255,0.45); font-size: 13px; }
`;