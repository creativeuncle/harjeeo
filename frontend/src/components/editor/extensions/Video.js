import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import VideoView from "../nodeviews/VideoView";

const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return { src: { default: null } };
  },

  parseHTML() {
    return [{ tag: "div[data-type='video']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "video" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoView);
  },
});

export default Video;
