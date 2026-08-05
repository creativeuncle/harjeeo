import Mention from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import MentionList from "../MentionList";

export function createMentionExtension(getItems) {
  return Mention.configure({
    HTMLAttributes: { class: "harjeeo-mention" },
    suggestion: {
      char: "@",
      items: ({ query }) => getItems(query),
      render: () => {
        let component;
        let popup;

        return {
          onStart: (props) => {
            component = new ReactRenderer(MentionList, {
              props: { items: props.items, command: props.command },
              editor: props.editor,
            });

            popup = tippy("body", {
              getReferenceClientRect: props.clientRect,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: "manual",
              placement: "bottom-start",
            });
          },
          onUpdate: (props) => {
            component.updateProps({ items: props.items, command: props.command });
            popup[0].setProps({ getReferenceClientRect: props.clientRect });
          },
          onKeyDown: (props) => {
            if (props.event.key === "Escape") {
              popup[0].hide();
              return true;
            }
            return component.ref?.onKeyDown(props) ?? false;
          },
          onExit: () => {
            popup[0].destroy();
            component.destroy();
          },
        };
      },
    },
  });
}
