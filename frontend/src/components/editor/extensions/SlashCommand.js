import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import SlashMenu from "../SlashMenu";
import { getSlashItems } from "../slashItems";

const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }) => getSlashItems({ query }),
        render: () => {
          let component;
          let popup;

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashMenu, {
                props: {
                  items: props.items,
                  command: (item) => item.command({ editor: props.editor, range: props.range }),
                },
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
              component.updateProps({
                items: props.items,
                command: (item) => item.command({ editor: props.editor, range: props.range }),
              });
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
      }),
    ];
  },
});

export default SlashCommand;
