import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  CornerDownLeft,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo,
  Strikethrough,
  Undo,
  Unlink
} from 'lucide-react'
import { useState } from 'react'
import ButtonLink from './ButtonLink'
import { menuBarStateSelector } from './MenubarState'

type Props = {
  editor: Editor | null
}

export const MenuBar = ({ editor }: Props) => {
  if (!editor) return null

  const [isLinkOpen, setIsLinkOpen] = useState(false)
  const [linkValue, setLinkValue] = useState('')

  const editorState = useEditorState({
    editor: editor ?? undefined,
    selector: menuBarStateSelector,
  })

  const btn = 'p-2 rounded hover:bg-gray-400'
  const active = 'bg-gray-900 text-white hover:bg-gray-800'

  const handleAction = (
    e: React.MouseEvent<HTMLButtonElement>,
    action: () => void
  ) => {
    e.preventDefault()
    e.stopPropagation()
    action()
  }

  const preventMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const openLinkPopover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!editor) return

    const previousUrl = editor.getAttributes('link').href || ''
    setLinkValue(previousUrl)
    setIsLinkOpen(true)
  }

  const submitLink = () => {
    if (!editor) return

    const value = linkValue.trim()

    if (!value) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      setIsLinkOpen(false)
      setLinkValue('')
      return
    }

    const href = /^https?:\/\//i.test(value) ? value : `https://${value}`

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href })
      .run()

    setIsLinkOpen(false)
    setLinkValue('')
  }

  return (
    <div className="flex gap-1 flex-wrap border p-2 rounded">
      <button
        type="button"
        className={`${btn} ${editorState.isBold ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () => editor.chain().focus().toggleBold().run())
        }
        title="Bold"
      >
        <Bold size={16} />
      </button>

      <button
        type="button"
        className={`${btn} ${editorState.isItalic ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () => editor.chain().focus().toggleItalic().run())
        }
        title="Italic"
      >
        <Italic size={16} />
      </button>

      <button
        type="button"
        className={`${btn} ${editorState.isStrike ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () => editor.chain().focus().toggleStrike().run())
        }
        title="Strike"
      >
        <Strikethrough size={16} />
      </button>

      <button
        type="button"
        className={`${btn} ${editorState.isCode ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () => editor.chain().focus().toggleCode().run())
        }
        title="Inline code"
      >
        <Code size={16} />
      </button>

      <button
        type="button"
        className={`${btn} ${editorState.isHighlight ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () => editor.chain().focus().toggleHighlight().run())
        }
        title="Highlight"
      >
        <Highlighter size={16} />
      </button>

      <button
        type="button"
        className={`${btn} ${editorState.isHeading1 ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          )
        }
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>

      <button
        type="button"
        className={`${btn} ${editorState.isHeading2 ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          )
        }
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>

      <button
        type="button"
        className={`${btn} ${editorState.isHeading3 ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          )
        }
        title="Heading 3"
      >
        <Heading3 size={16} />
      </button>

      <button
        type="button"
        className={`${btn} ${editorState.isParagraph ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () => editor.chain().focus().setParagraph().run())
        }
        title="Paragraph"
      >
        <Pilcrow size={16} />
      </button>

      <button
        type="button"
        className={`${btn} ${editorState.isBulletList ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () => editor.chain().focus().toggleBulletList().run())
        }
        title="Bullet list"
      >
        <List size={16} />
      </button>

      <button
        type="button"
        className={`${btn} ${editorState.isOrderedList ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () =>
            editor.chain().focus().toggleOrderedList().run()
          )
        }
        title="Ordered list"
      >
        <ListOrdered size={16} />
      </button>

      <button
        type="button"
        className={`${btn} ${editorState.isBlockquote ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () => editor.chain().focus().toggleBlockquote().run())
        }
        title="Blockquote"
      >
        <Quote size={16} />
      </button>

      <button
        type="button"
        className={`${btn} ${editorState.isAlignLeft ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () => editor.chain().focus().setTextAlign('left').run())
        }
        title="Align left"
      >
        <AlignLeft size={16} />
      </button>

      <button
        type="button"
        className={`${btn} ${editorState.isAlignCenter ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () =>
            editor.chain().focus().setTextAlign('center').run()
          )
        }
        title="Align center"
      >
        <AlignCenter size={16} />
      </button>

      <button
        type="button"
        className={`${btn} ${editorState.isAlignRight ? active : ''}`}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () =>
            editor.chain().focus().setTextAlign('right').run()
          )
        }
        title="Align right"
      >
        <AlignRight size={16} />
      </button>

      <ButtonLink
        isLinkOpen={isLinkOpen}
        setIsLinkOpen={setIsLinkOpen}
        openLinkPopover={openLinkPopover}
        btn={btn}
        active={active}
        preventMouseDown={preventMouseDown}
        linkValue={linkValue}
        setLinkValue={setLinkValue}
        submitLink={submitLink}
        editorState={editorState} />

      <button
        type="button"
        className={btn}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () =>
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
          )
        }
        title="Unset link"
      >
        <Unlink size={16} />
      </button>

      <button
        type="button"
        className={btn}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () =>
            editor.chain().focus().setHorizontalRule().run()
          )
        }
        title="Horizontal rule"
      >
        <Minus size={16} />
      </button>

      <button
        type="button"
        className={btn}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () => editor.chain().focus().setHardBreak().run())
        }
        title="Hard break"
      >
        <CornerDownLeft size={16} />
      </button>

      <button
        type="button"
        className={btn}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          )
        }
        title="Clear formatting"
      >
        <Eraser size={16} />
      </button>

      <button
        type="button"
        className={btn}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () => editor.chain().focus().undo().run())
        }
        disabled={!editorState.canUndo}
        title="Undo"
      >
        <Undo size={16} />
      </button>

      <button
        type="button"
        className={btn}
        onMouseDown={preventMouseDown}
        onClick={(e) =>
          handleAction(e, () => editor.chain().focus().redo().run())
        }
        disabled={!editorState.canRedo}
        title="Redo"
      >
        <Redo size={16} />
      </button>
    </div>
  )
}