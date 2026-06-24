/**
 * Extract the YouTube video id from the common URL shapes
 * (watch?v=, youtu.be/, /embed/, /shorts/), or null if it doesn't look like one.
 */
export function youtubeId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  // Bare 11-char id.
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host.endsWith("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = u.pathname.match(/\/(embed|shorts|v)\/([\w-]{11})/);
      if (m) return m[2];
    }
  } catch {
    return null;
  }
  return null;
}

/** The privacy-friendly embed URL for a YouTube id. */
export function youtubeEmbed(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
