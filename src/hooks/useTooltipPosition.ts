import { useEffect, useState } from "react";

export function useTooltipPosition(
  open: boolean,
  anchorRef: React.RefObject<HTMLElement | null>,
  tooltipRef: React.RefObject<HTMLElement | null>,
) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!open) {
      setStyle({});
      return;
    }

    let rafId = 0;

    const compute = () => {
      const anchor = anchorRef.current;
      const tip = tooltipRef.current;

      if (!anchor || !tip) {
        rafId = requestAnimationFrame(compute);
        return;
      }

      const tipH = tip.offsetHeight;
      const tipW = tip.offsetWidth;

      if (tipH === 0 || tipW === 0) {
        rafId = requestAnimationFrame(compute);
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const spaceBelow = vh - rect.bottom;
      const top =
        spaceBelow < tipH + 12 ? rect.top - tipH - 6 : rect.bottom + 6;

      let left = rect.left;
      if (left + tipW > vw - 12) left = vw - tipW - 12;
      if (left < 8) left = 8;

      setStyle({
        position: "fixed",
        top,
        left,
        zIndex: 9999,
      });
    };

    // Initial compute (after mount)
    rafId = requestAnimationFrame(compute);

    // 🔁 Recompute on window resize
    const handleResize = () => compute();

    // 🔁 Recompute on scroll (capture = true catches nested scroll containers)
    const handleScroll = () => compute();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    // 🔁 Observe tooltip size/content changes
    const resizeObserver =
      tooltipRef.current && "ResizeObserver" in window
        ? new ResizeObserver(() => compute())
        : null;

    if (resizeObserver && tooltipRef.current) {
      resizeObserver.observe(tooltipRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
      resizeObserver?.disconnect();
    };
  }, [open, anchorRef, tooltipRef]);

  return style;
}
