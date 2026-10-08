const ID_VIDEO = /^[A-Za-z0-9_-]{11}$/;

export function idVideoYouTube(endereco: string): string | null {
  let url: URL;
  try {
    url = new URL(endereco.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return ID_VIDEO.test(id) ? id : null;
  }
  if (host === "youtube.com" || host.endsWith(".youtube.com")) {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v") ?? "";
      return ID_VIDEO.test(id) ? id : null;
    }
    const partes = url.pathname.split("/").filter(Boolean);
    if ((partes[0] === "embed" || partes[0] === "shorts" || partes[0] === "live") && ID_VIDEO.test(partes[1] ?? "")) {
      return partes[1];
    }
  }
  return null;
}
