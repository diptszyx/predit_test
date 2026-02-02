import copy from 'copy-to-clipboard';
import { Clipboard } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkGfm from 'remark-gfm';
import { twMerge } from 'tailwind-merge';

import { toast } from 'sonner';
import {
  extractChartSymbols,
  mapToTradingViewSymbol,
} from '../../utils/chartUtils';
import { TradingViewChart } from './TradingViewChart';

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
  showCharts?: boolean;
}

const Markdown = ({ text, showCharts = true }: MarkdownProps) => {
  const handleCopy = (textCode: string) => {
    copy(textCode);
    toast.success('Code copied to clipboard!');
  };

  // Extract chart symbols and split content
  const chartSymbols = showCharts ? extractChartSymbols(text) : [];

  // Process text to split charts from content
  const renderContent = () => {
    if (!showCharts || chartSymbols.length === 0) {
      return (
        <ReactMarkdown
          remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
          components={markdownComponents}
        >
          {text}
        </ReactMarkdown>
      );
    }

    // Split text by chart placeholders
    const parts = text.split(/\[insert_chart_(\w+)\]/g);
    const elements: JSX.Element[] = [];

    for (let i = 0; i < parts.length; i++) {
      // Add text content
      if (parts[i] && i % 2 === 0) {
        elements.push(
          <ReactMarkdown
            key={`text-${i}`}
            remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
            components={markdownComponents}
          >
            {parts[i]}
          </ReactMarkdown>
        );
      }
      // Add chart for captured symbol
      else if (parts[i] && i % 2 === 1) {
        const symbol = parts[i];
        const tradingViewSymbol = mapToTradingViewSymbol(symbol);
        elements.push(
          <TradingViewChart
            key={`chart-${i}-${symbol}`}
            symbol={tradingViewSymbol}
            height={350}
          />
        );
      }
    }

    return <>{elements}</>;
  };

  const markdownComponents = {
    // Code
    code({ node, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');

      return match ? (
        <div className="w-72 md:w-custom-128 overflow-x-auto my-3 mx-auto">
          <div className="flex w-full justify-end bg-white/5 p-2 rounded-t-md">
            <button
              className='cursor-pointer'
              onClick={() => handleCopy(String(children).replace(/\n$/, ''))}
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
    pre: ({ node, ...props }: any) => (
      <pre className="my-3 p-3 rounded overflow-x-auto bg-neutral-900" {...props} />
    ),

    // Headings
    h1: ({ node, ...props }: any) => (
      <h1 className="text-2xl font-semibold mt-4 mb-2" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-xl font-semibold mt-4 mb-2" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-semibold mt-3 mb-2" {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 className="text-base font-semibold mt-3 mb-1" {...props} />
    ),
    h5: ({ node, ...props }: any) => (
      <h5 className="text-sm font-semibold mt-2 mb-1" {...props} />
    ),
    h6: ({ node, ...props }: any) => (
      <h6 className="text-sm font-medium mt-2 mb-1" {...props} />
    ),

    // Text
    p: ({ node, ...props }: any) => (
      <p className="leading-7 my-2" {...props} />
    ),
    strong: ({ node, ...props }: any) => (
      <strong className="font-semibold" {...props} />
    ),
    em: ({ node, ...props }: any) => <em className="italic" {...props} />,
    del: ({ node, ...props }: any) => (
      <del className="line-through opacity-80" {...props} />
    ),
    br: ({ node, ...props }: any) => <br {...props} />,

    // Links
    a: ({ node, ...props }: any) => (
      <a
        href={props.href}
        target="_blank"
        rel="noreferrer"
        className="text-blue-400 hover:underline underline-offset-2"
      >
        {props.children}
      </a>
    ),

    // Table
    table: ({ node, ...props }: any) => (
      <div className="w-72 md:w-custom-128 overflow-x-auto my-3 mx-auto">
        <table
          className="w-full border-collapse"
          {...props}
        />
      </div>
    ),
    thead: ({ node, ...props }: any) => (
      <thead className="bg-background" {...props} />
    ),
    tbody: ({ node, ...props }: any) => <tbody {...props} />,
    tr: ({ node, ...props }: any) => (
      <tr className="bg-background" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th
        className="text-sm font-medium px-4 py-3 text-left border"
        {...props}
      />
    ),
    td: ({ node, ...props }: any) => (
      <td
        className="text-sm font-light px-4 py-3 whitespace-nowrap border"
        {...props}
      />
    ),

    // Lists
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal ml-5 my-2" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc ml-5 my-2" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="my-1" {...props} />
    ),

    // Blockquote
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className="pl-3 border-l-4 border-neutral-500 my-2 opacity-90"
        {...props}
      />
    ),

    // Horizontal rule
    hr: ({ node, ...props }: any) => (
      <hr className="my-4 border-neutral-700" {...props} />
    ),
  };

  return <div>{renderContent()}</div>;
};

export default Markdown;
