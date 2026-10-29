interface Buttons {
  play: HTMLButtonElement;
  step: HTMLButtonElement;
  back: HTMLButtonElement;
  reset: HTMLButtonElement;
}

export function bindShortcuts(b: Buttons) {
  window.addEventListener("keydown", (e) => {
    const t = e.target;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) return;
    if (e.key === " " && t instanceof HTMLButtonElement) return; // the button handles Space itself

    if (e.key === " ") { e.preventDefault(); b.play.click(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); b.step.click(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); b.back.click(); }
    else if (e.key.toLowerCase() === "r") b.reset.click();
  });
}