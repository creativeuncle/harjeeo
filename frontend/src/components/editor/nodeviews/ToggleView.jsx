import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { ArrowRight01Icon } from "hugeicons-react";

export default function ToggleView({ node, updateAttributes }) {
  const open = node.attrs.open;

  return (
    <NodeViewWrapper className="harjeeo-toggle" data-open={open}>
      <div className="harjeeo-toggle-row">
        <button
          type="button"
          contentEditable={false}
          onClick={() => updateAttributes({ open: !open })}
          className="harjeeo-toggle-arrow"
        >
          <ArrowRight01Icon size={16} strokeWidth={2} />
        </button>
        <NodeViewContent className="harjeeo-toggle-content" />
      </div>
    </NodeViewWrapper>
  );
}
