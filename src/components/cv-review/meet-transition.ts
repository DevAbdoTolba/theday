/** Keep the cover alive across the route unmount, then reveal the painted page. */
export async function transitionToMeet(
  button: HTMLElement,
  navigate: () => Promise<boolean>,
): Promise<void> {
  const rect = button.getBoundingClientRect();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cover = document.createElement("div");
  cover.setAttribute("aria-hidden", "true");
  Object.assign(cover.style, {
    position: "fixed", inset: "0", zIndex: "2147483647",
    background: "#000", transformOrigin: "0 0", pointerEvents: "auto",
    willChange: "transform, opacity", border: "1px solid rgba(255,255,255,.8)",
    boxSizing: "border-box",
  });
  const start = `translate3d(${rect.left}px, ${rect.top}px, 0) scale(${rect.width / window.innerWidth}, ${rect.height / window.innerHeight})`;
  cover.style.transform = reduced ? "none" : start;
  document.body.appendChild(cover);
  try {
    await cover.animate(
      reduced ? [{ opacity: 0 }, { opacity: 1 }] : [
        { transform: start, borderRadius: "64px" },
        { transform: "translate3d(0, 0, 0) scale(1, 1)", borderRadius: "0px" },
      ],
      { duration: reduced ? 100 : 620, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" },
    ).finished;
    await navigate();
    // The old dialog is gone; keep covering the viewport until the new page paints.
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    await cover.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: reduced ? 100 : 320, easing: "ease-out", fill: "forwards",
    }).finished;
  } finally {
    cover.remove();
  }
}
