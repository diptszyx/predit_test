import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Topic } from "../../services/topic-admin.service";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../ui/utils";

type CustomTopicSelectProps = {
  value?: string;
  onChange: (value: string) => void;
  topics: Topic[];
}

export function CustomTopicSelect({ value, onChange, topics }: CustomTopicSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedTopic = topics.find((t) => t.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-md border border-input bg-input-background px-3 py-2 text-sm h-9',
          'hover:bg-input/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !selectedTopic && 'text-muted-foreground'
        )}
      >
        <span>{selectedTopic ? selectedTopic.name : 'Select an topic'}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-md animate-in fade-in-0 zoom-in-95">
          <ScrollArea className="max-h-60 bg-background">
            <div className="p-1 bg-background">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    onChange(topic.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'relative flex w-full cursor-default items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground',
                    topic.id === value && 'bg-accent'
                  )}
                >
                  {topic.id === value && (
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  {topic.name}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}