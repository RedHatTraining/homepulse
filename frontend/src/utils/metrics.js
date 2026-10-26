export function percentOf(value, max) {
  return Math.min(100, Math.round((value / max) * 100));
}

export function loadColor(pct) {
  return pct > 80 ? "#c9190b" : pct > 50 ? "#f0ab00" : "#3e8635";
}
