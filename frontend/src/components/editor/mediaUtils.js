export function toEmbedUrl(url) {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return `https://player.vimeo.com/video/${id}`;
    }
    if (u.hostname.includes("figma.com")) {
      return `https://www.figma.com/embed?embed_host=harjeeo&url=${encodeURIComponent(url)}`;
    }
    if (u.hostname.includes("google.") && u.pathname.startsWith("/maps")) {
      u.searchParams.set("output", "embed");
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}
