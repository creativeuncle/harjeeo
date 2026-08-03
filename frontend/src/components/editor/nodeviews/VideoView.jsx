import { NodeViewWrapper } from "@tiptap/react";
import { toEmbedUrl } from "../mediaUtils";

function isDirectVideoFile(url) {
  return /\.(mp4|webm|ogg|mov)$/i.test(new URL(url).pathname);
}

export default function VideoView({ node }) {
  const { src } = node.attrs;
  let direct = false;
  try {
    direct = isDirectVideoFile(src);
  } catch {
    direct = false;
  }

  return (
    <NodeViewWrapper className="harjeeo-media harjeeo-media-video">
      {direct ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={src} controls />
      ) : (
        <iframe
          src={toEmbedUrl(src)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video"
        />
      )}
    </NodeViewWrapper>
  );
}
