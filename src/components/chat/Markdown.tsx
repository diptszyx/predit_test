import copy from 'copy-to-clipboard';
import { Clipboard } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import remarkGfm from 'remark-gfm';
import { twMerge } from 'tailwind-merge';

import { toast } from 'sonner';

const SAMPLE_MARKDOWN = `This is a fake response generated without calling OpenAI API.
This is a fake response generated without calling OpenAI API.


This is a fake response generated without calling OpenAI API.

### Table

| Column 1 | Column 2 |
|----------|----------|
|   Row 1  |   Data 1 |
|   Row 2  |   Data 2 |

#### Code
\`\`\`javascript
console.log('Hello, World!');
var a = 1;
var a = 1;
var a = 1;
var a = 1;
var a = 1;
var a = 1;
var a = 1;
var a = 1;
var a = 1;
\`\`\`

Sure! Here are 5 interesting facts about JavaScript:

1. **JavaScript is Not Java**:
   - Despite its name, \`JavaScript\` is not related to Java. JavaScript was originally called Mocha, then renamed to LiveScript, and finally to JavaScript. The name JavaScript was chosen for marketing reasons as Java was very popular at the time.

   - Despite its name, JavaScript is not related to Java. JavaScript was originally called Mocha, then renamed to LiveScript, and finally to JavaScript. The name JavaScript was chosen for marketing reasons as Java was very popular at the time.

2. **Invented in 10 Days**:
   - JavaScript was developed by Brendan Eich in just 10 days in May 1995 while he was working at Netscape Communications Corporation. The rapid development was part of Netscape's efforts to add interactive elements to web pages.

3. **Interpreted Language**:
   - JavaScript is an interpreted language, not a compiled one. This means that code is executed line by line, and you don't need to compile your code before running it. Instead, browsers interpret JavaScript code directly.

4. **Single-Threaded but Asynchronous**:
   - JavaScript is single-threaded, meaning it executes one operation at a time. However, it can handle asynchronous operations using mechanisms like callbacks, promises, and async/await keywords, which allow for tasks like network requests to run without blocking the main thread.

5. **Versatile and Ubiquitous**:
   - JavaScript is one of the most versatile programming languages. Initially intended for client-side web development, it has expanded to server-side development with Node.js, mobile app development using frameworks like React Native, and even desktop application development with Electron. It has become a fundamental technology of the World Wide Web, used by 98% of websites for client-side scripting.

### Bonus Fact:

- **ECMAScript Standard**:
  - JavaScript is standardized under the ECMAScript specification. This means that what developers commonly refer to as JavaScript is technically an implementation of the ECMAScript standard. The latest versions of ECMAScript are adding many new features to keep JavaScript up-to-date with modern programming practices.

*Feel free to ask if you'd like more details on any of these facts!*

> Dorothy followed her through many of the beautiful rooms in her castle.
>
> The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.

My favorite search engine is [Duck Duck Go](https://duckduckgo.com).

![An old rock in the desert](https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D)

Bottom line: This is a fake response.`;

interface MarkdownProps {
  text: string;
}

const Markdown = ({ text }: MarkdownProps) => {
  const handleCopy = (textCode: string) => {
    copy(textCode);
    toast.success('Copied to clipboard!');
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');

          return match ? (
            <div>
              <div className="flex w-full justify-end bg-white/5 p-2 rounded-t-md">
                <button
                  onClick={() =>
                    handleCopy(String(children).replace(/\n$/, ''))
                  }
                >
                  <Clipboard className="text-white/20 w-4 h-4" />
                </button>
              </div>
              <SyntaxHighlighter language={match[1]} style={atomOneDark}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code
              {...props}
              className={twMerge(
                className,
                `bg-neutral-700 px-1 rounded font-semibold`
              )}
            >
              {children}
            </code>
          );
        },
        h3: ({ node, ...props }) => (
          <h3 className="text-xl">{props.children}</h3>
        ),
        a: ({ node, ...props }) => (
          <a href={props.href} target="_blank" className="text-blue-400">
            {props.children}
          </a>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-background" {...props} />
        ), // Render thead
        tbody: ({ node, ...props }) => <tbody {...props} />, // Render tbody
        tr: ({ node, ...props }) => <tr className="bg-background" {...props} />, // Render table row
        th: ({ node, ...props }) => (
          <th
            className="text-sm font-medium px-6 py-4 text-left border"
            {...props}
          />
        ), // Render table header
        td: ({ node, ...props }) => (
          <td
            className="text-sm font-light px-6 py-4 whitespace-nowrap border"
            {...props}
          />
        ), // Render table data
        ol: ({ node, ...props }) => (
          <ol className="list-decimal ml-4">{props.children}</ol>
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc ml-4">{props.children}</ul>
        ),
        li: ({ node, ...props }) => <li className="mb-2">{props.children}</li>,
        blockquote: ({ node, ...props }) => (
          <blockquote className="pl-3 border-l-4 border-neutral-500">
            {props.children}
          </blockquote>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export default Markdown;
