import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";

const EMOJIS = ["💡", "📌", "⚠️", "✅", "❤️", "🔥", "📝"];

export default function CalloutView({ node, updateAttributes }) {
  function cycleEmoji() {
    const current = EMOJIS.indexOf(node.attrs.emoji);
    const next = EMOJIS[(current + 1) % EMOJIS.length];
    updateAttributes({ emoji: next });
  }

  return (
    <NodeViewWrapper
      className="harjeeo-callout"
      data-color={node.attrs.color}
    >
      <button
        type="button"
        contentEditable={false}
        onClick={cycleEmoji}
        className="harjeeo-callout-emoji"
        title="Change icon"
      >
        {node.attrs.emoji}
      </button>
      <NodeViewContent className="harjeeo-callout-content" />
    </NodeViewWrapper>
  );
}
