/** Keep the cover alive across the route unmount, then reveal the painted page. */
export async function transitionToMeet(
  button: HTMLElement,
  navigate: () => Promise<boolean>,
): Promise<void> {
  const rect = button.getBoundingClientRect();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cover = document.createElement("div");
  const foregroundButton = document.createElement("div");
  const buttonStyle = window.getComputedStyle(button);
  // A presentation-only copy escapes the dialog's stacking context. The
  // expanding surface stays behind Meet until the label gently fades away.
  for (const property of Array.from(buttonStyle)) {
    foregroundButton.style.setProperty(property, buttonStyle.getPropertyValue(property));
  }
  foregroundButton.textContent = button.textContent;
  foregroundButton.setAttribute("aria-hidden", "true");
  Object.assign(foregroundButton.style, {
    position: "fixed", inset: "auto", left: `${rect.left}px`, top: `${rect.top}px`,
    width: `${rect.width}px`, height: `${rect.height}px`, minWidth: "0", minHeight: "0",
    margin: "0", transform: "none", animation: "none", transition: "none",
    zIndex: "2147483647", pointerEvents: "none", boxSizing: "border-box",
  });
  cover.setAttribute("aria-hidden", "true");
  Object.assign(cover.style, {
    position: "fixed", inset: "0", zIndex: "2147483646",
    background: "#000", transformOrigin: "0 0", pointerEvents: "auto",
    willChange: "transform, opacity", border: "1px solid rgba(255,255,255,.8)",
    boxSizing: "border-box",
  });
  const scaleX = rect.width / window.innerWidth;
  const scaleY = rect.height / window.innerHeight;
  const start = `translate3d(${rect.left}px, ${rect.top}px, 0) scale(${scaleX}, ${scaleY})`;
  // Compensate for the unequal X/Y scaling so the initial corners are round
  // on screen, rather than being flattened into sharp-looking edges.
  const initialRadius = `${18 / scaleX}px / ${18 / scaleY}px`;
  cover.style.transform = reduced ? "none" : start;
  cover.style.borderRadius = reduced ? "0" : initialRadius;
  document.body.append(cover, foregroundButton);
  try {
    const buttonFade = foregroundButton.animate([{ opacity: 1 }, { opacity: 0 }], {
      delay: reduced ? 0 : 160, duration: reduced ? 100 : 220,
      easing: "ease-out", fill: "forwards",
    });
    await cover.animate(
      reduced ? [{ opacity: 0 }, { opacity: 1 }] : [
        { transform: start, borderRadius: initialRadius },
        {
          offset: 0.5,
          transform: `translate3d(${rect.left / 2}px, ${rect.top / 2}px, 0) scale(${(scaleX + 1) / 2}, ${(scaleY + 1) / 2})`,
          borderRadius: `${32 / ((scaleX + 1) / 2)}px / ${32 / ((scaleY + 1) / 2)}px`,
        },
        { transform: "translate3d(0, 0, 0) scale(1, 1)", borderRadius: "0px" },
      ],
      { duration: reduced ? 100 : 620, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" },
    ).finished;
    await buttonFade.finished;
    foregroundButton.remove();
    await navigate();
    // The old dialog is gone; keep covering the viewport until the new page paints.
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    await cover.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: reduced ? 100 : 320, easing: "ease-out", fill: "forwards",
    }).finished;
  } finally {
    foregroundButton.remove();
    cover.remove();
  }
}
