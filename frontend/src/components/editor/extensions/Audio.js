import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import AudioView from "../nodeviews/AudioView";

const Audio = Node.create({
  name: "audio",
  group: "block",
  atom: true,

  addAttributes() {
    return { src: { default: null } };
  },

  parseHTML() {
    return [{ tag: "div[data-type='audio']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "audio" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioView);
  },
});

export default Audio;
