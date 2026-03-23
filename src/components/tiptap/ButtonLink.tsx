import { LinkIcon } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type ButtonLinkProps = {
  isLinkOpen: boolean;
  setIsLinkOpen: Dispatch<SetStateAction<boolean>>;
  btn: string;
  active: string
  preventMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => void
  linkValue: string
  setLinkValue: (value: string) => void
  submitLink: () => void
  openLinkPopover: (e: React.MouseEvent<HTMLButtonElement>) => void
  editorState: any
}

const ButtonLink = ({
  isLinkOpen,
  setIsLinkOpen,
  openLinkPopover,
  btn,
  active,
  preventMouseDown,
  linkValue,
  setLinkValue,
  submitLink,
  editorState
}: ButtonLinkProps
) => {
  return (
    <Popover open={isLinkOpen} onOpenChange={setIsLinkOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`${btn} ${editorState.isLink ? active : ''}`}
          onMouseDown={preventMouseDown}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            openLinkPopover(e)
          }}
          title="Set link"
        >
          <LinkIcon size={16} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="center"
        side="bottom"
        className="w-80 rounded-xl border border-gray-200 bg-background p-3 shadow-xl"
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
        onCloseAutoFocus={(e: Event) => e.preventDefault()}
        onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Add link</p>
            <p className="text-xs ">
              Paste URL or domain name
            </p>
          </div>

          <div className="relative">
            <LinkIcon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              autoFocus
              type="text"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submitLink()
                }

                if (e.key === 'Escape') {
                  e.preventDefault()
                  setIsLinkOpen(false)
                }
              }}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-gray-900"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant='outline'
                onMouseDown={preventMouseDown}
                onClick={(e: Event) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsLinkOpen(false)
                }}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onMouseDown={preventMouseDown}
                onClick={(e: Event) => {
                  e.preventDefault()
                  e.stopPropagation()
                  submitLink()
                }}
                className="bg-gray-900 text-sm font-medium transition hover:bg-gray-800"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default ButtonLink
