import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function InfoTip({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const show = () => {
    clearTimeout(closeTimer.current);
    const bounds = trigger.current?.getBoundingClientRect();
    if (bounds) setPosition({ left: Math.max(12, Math.min(bounds.left, window.innerWidth - 332)), top: Math.min(bounds.bottom + 8, window.innerHeight - 220) });
    setOpen(true);
  };
  const hideSoon = () => { closeTimer.current = setTimeout(() => setOpen(false), 150); };
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node) && !panel.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    const close = () => setOpen(false);
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  return <>
    <button ref={trigger} type="button" className="info-tip-trigger" aria-describedby={open ? id : undefined} onMouseEnter={show} onMouseLeave={hideSoon} onFocus={show} onBlur={() => setOpen(false)} onClick={show}>{label} <span aria-hidden="true">ⓘ</span></button>
    {open && createPortal(<div ref={panel} id={id} role="tooltip" className="info-tip-panel" style={position} onMouseEnter={() => clearTimeout(closeTimer.current)} onMouseLeave={hideSoon}>{children}</div>, document.body)}
  </>;
}
