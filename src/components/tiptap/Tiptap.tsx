import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { MenuBar } from './MenuBar.jsx'

const CustomLink = Link.extend({
  inclusive() {
    return false
  },
})

export function TiptapEditor({
  value,
  onChange,
  error,
  placeholder = 'Write a detailed analysis or market update related to this news...',
}: any) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextStyleKit,
      Highlight,
      CustomLink.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
        defaultProtocol: 'https',
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none min-h-[300px] focus:outline-none tiptap-editor',
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return

    const currentHtml = editor.getHTML()
    const nextValue = value || '<p></p>'

    if (currentHtml !== nextValue) {
      editor.commands.setContent(nextValue, {
        emitUpdate: false,
      })
    }
  }, [editor, value])

  return (
    <div
      className={`max-w-[900px] rounded-2xl border shadow-sm overflow-hidden bg-background dark:border-input  ${error ? 'border-red-500' : 'border-gray-200'
        }`}
    >
      <div className="flex flex-wrap gap-2 border-b dark:border-input  bg-background p-3">
        <MenuBar editor={editor} />
      </div>

      <div className="p-3">
        {!editor?.getText()?.length && (
          <div className="pointer-events-none opacity-60 pl-1">
            {placeholder}
          </div>
        )}

        <EditorContent editor={editor} />
      </div>
    </div>
  )
}