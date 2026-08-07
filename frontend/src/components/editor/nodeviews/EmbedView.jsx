import { NodeViewWrapper } from "@tiptap/react";
import { Link03Icon } from "hugeicons-react";
import { toEmbedUrl } from "../mediaUtils";

export default function EmbedView({ node }) {
  const { src } = node.attrs;
  let hostname = src;
  try {
    hostname = new URL(src).hostname;
  } catch {
    // keep raw src
  }

  return (
    <NodeViewWrapper className="harjeeo-media harjeeo-media-embed">
      <iframe src={toEmbedUrl(src)} title={hostname} allowFullScreen />
      <a href={src} target="_blank" rel="noreferrer" className="harjeeo-embed-bar">
        <Link03Icon size={14} strokeWidth={1.8} />
        <span>{hostname}</span>
      </a>
    </NodeViewWrapper>
  );
}
