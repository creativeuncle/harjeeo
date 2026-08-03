import { NodeViewWrapper } from "@tiptap/react";

export default function AudioView({ node }) {
  return (
    <NodeViewWrapper className="harjeeo-media harjeeo-media-audio">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio src={node.attrs.src} controls />
    </NodeViewWrapper>
  );
}
