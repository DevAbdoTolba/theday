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
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const radius = Math.hypot(
    Math.max(centerX, window.innerWidth - centerX),
    Math.max(centerY, window.innerHeight - centerY),
  ) + 4;
  const diameter = radius * 2;
  const initialScale = Math.max(rect.width, rect.height) / diameter;
  Object.assign(cover.style, {
    position: "fixed", zIndex: "2147483646",
    left: `${centerX - radius}px`, top: `${centerY - radius}px`,
    width: `${diameter}px`, height: `${diameter}px`,
    background: "#000", borderRadius: "50%", transformOrigin: "center",
    pointerEvents: "auto", willChange: "transform, opacity",
    border: "1px solid rgba(255,255,255,.82)", boxSizing: "border-box",
  });
  cover.style.transform = reduced ? "none" : `scale(${initialScale})`;
  document.body.append(cover, foregroundButton);
  try {
    const buttonFade = foregroundButton.animate([{ opacity: 1 }, { opacity: 0 }], {
      delay: reduced ? 0 : 160, duration: reduced ? 100 : 220,
      easing: "ease-out", fill: "forwards",
    });
    await cover.animate(
      reduced ? [{ opacity: 0 }, { opacity: 1 }] : [
        { transform: `scale(${initialScale})` },
        { offset: 0.62, transform: "scale(0.88)" },
        { transform: "scale(1)" },
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
