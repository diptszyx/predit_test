import type { Editor } from "@tiptap/core";

export const menuBarStateSelector = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return {
      isBold: false,
      isItalic: false,
      isStrike: false,
      isCode: false,
      isHighlight: false,
      isHeading1: false,
      isHeading2: false,
      isHeading3: false,
      isParagraph: false,
      isBulletList: false,
      isOrderedList: false,
      isBlockquote: false,
      isLink: false,
      isAlignLeft: false,
      isAlignCenter: false,
      isAlignRight: false,
      canUndo: false,
      canRedo: false,
    };
  }

  return {
    isBold: editor.isActive("bold"),
    isItalic: editor.isActive("italic"),
    isStrike: editor.isActive("strike"),
    isCode: editor.isActive("code"),
    isHighlight: editor.isActive("highlight"),
    isHeading1: editor.isActive("heading", { level: 1 }),
    isHeading2: editor.isActive("heading", { level: 2 }),
    isHeading3: editor.isActive("heading", { level: 3 }),
    isParagraph: editor.isActive("paragraph"),
    isBulletList: editor.isActive("bulletList"),
    isOrderedList: editor.isActive("orderedList"),
    isBlockquote: editor.isActive("blockquote"),
    isLink: editor.isActive("link"),
    isAlignLeft: editor.isActive({ textAlign: "left" }),
    isAlignCenter: editor.isActive({ textAlign: "center" }),
    isAlignRight: editor.isActive({ textAlign: "right" }),
    canUndo: editor.can().chain().focus().undo().run(),
    canRedo: editor.can().chain().focus().redo().run(),
  };
};
