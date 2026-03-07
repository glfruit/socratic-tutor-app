import type { HTMLAttributes, ReactNode } from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownMessageProps {
  content: string;
  variant?: "assistant" | "user";
}

type MarkdownElementProps = HTMLAttributes<HTMLElement> & {
  node?: unknown;
  children?: ReactNode;
};

type MarkdownCodeProps = HTMLAttributes<HTMLElement> & {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
};

function flattenText(children: ReactNode): string {
  return Array.isArray(children) ? children.map(flattenText).join("") : typeof children === "string" ? children : "";
}

function renderInlineMath(children: ReactNode) {
  const segments = flattenText(children).split(/(\$[^$\n]+\$)/g);

  return segments.map((segment, index) => {
    if (segment.startsWith("$") && segment.endsWith("$") && segment.length > 2) {
      return (
        <code key={`math-${index}`} className="katex-inline rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.95em] dark:bg-slate-800">
          {segment.slice(1, -1)}
        </code>
      );
    }

    return segment ? <span key={`text-${index}`}>{segment}</span> : null;
  });
}

export function MarkdownMessage({ content, variant = "assistant" }: MarkdownMessageProps) {
  const isUser = variant === "user";
  const proseText = isUser ? "text-white" : "text-slate-800 dark:text-slate-100";
  const mutedText = isUser ? "text-blue-100/85" : "text-slate-500 dark:text-slate-400";
  const codeInline = isUser
    ? "bg-white/15 text-white ring-1 ring-white/10"
    : "bg-slate-100 text-slate-800 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700";
  const codeBlock = isUser
    ? "bg-slate-950/40 text-slate-50"
    : "bg-slate-950 text-slate-50";

  return (
    <div className={`markdown-message min-w-0 leading-6 ${proseText}`}>
      <ReactMarkdown
        components={{
          h1: ({ node: _node, ...props }: MarkdownElementProps) => <h1 className="mb-3 text-xl font-semibold leading-7" {...props} />,
          h2: ({ node: _node, ...props }: MarkdownElementProps) => <h2 className="mb-3 text-lg font-semibold leading-7" {...props} />,
          h3: ({ node: _node, ...props }: MarkdownElementProps) => <h3 className="mb-2 text-base font-semibold leading-6" {...props} />,
          p: ({ node: _node, children, ...props }: MarkdownElementProps) => {
            const text = flattenText(children);
            const blockMathMatch = text.match(/^\$\$\s*([\s\S]+?)\s*\$\$$/);

            if (blockMathMatch) {
              return (
                <pre className="katex-block my-3 overflow-x-auto rounded-2xl bg-slate-50 px-4 py-3 font-mono text-sm dark:bg-slate-950/60">
                  {blockMathMatch[1]}
                </pre>
              );
            }

            return (
              <p className="my-2 whitespace-pre-wrap break-words" {...props}>
                {renderInlineMath(children)}
              </p>
            );
          },
          ul: ({ node: _node, ...props }: MarkdownElementProps) => <ul className="my-2 list-disc space-y-1 pl-5" {...props} />,
          ol: ({ node: _node, ...props }: MarkdownElementProps) => <ol className="my-2 list-decimal space-y-1 pl-5" {...props} />,
          li: ({ node: _node, children, ...props }: MarkdownElementProps) => <li className="break-words" {...props}>{renderInlineMath(children)}</li>,
          blockquote: ({ node: _node, ...props }: MarkdownElementProps) => (
            <blockquote className={`my-3 border-l-4 pl-4 italic ${isUser ? "border-white/30" : "border-primary/40"}`} {...props} />
          ),
          a: ({ node: _node, ...props }: MarkdownElementProps) => (
            <a
              className={`underline decoration-1 underline-offset-2 ${isUser ? "text-white" : "text-primary"}`}
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          hr: ({ node: _node, ...props }: MarkdownElementProps) => <hr className={`my-4 border-0 border-t ${isUser ? "border-white/20" : "border-slate-200 dark:border-slate-700"}`} {...props} />,
          code: ({ node: _node, inline, className, children, ...props }: MarkdownCodeProps) =>
            inline ? (
              <code className={`rounded px-1.5 py-0.5 text-[0.9em] ${codeInline}`} {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            ),
          pre: ({ node: _node, ...props }: MarkdownElementProps) => (
            <pre className={`my-3 overflow-x-auto rounded-2xl px-4 py-3 text-xs leading-6 ${codeBlock}`} {...props} />
          ),
          strong: ({ node: _node, ...props }: MarkdownElementProps) => <strong className="font-semibold" {...props} />,
          em: ({ node: _node, ...props }: MarkdownElementProps) => <em className="italic" {...props} />,
          table: ({ node: _node, ...props }: MarkdownElementProps) => (
            <div className="my-3 overflow-x-auto">
              <table className={`min-w-full border-collapse text-left text-sm ${mutedText}`} {...props} />
            </div>
          ),
          th: ({ node: _node, ...props }: MarkdownElementProps) => (
            <th className={`border-b px-2 py-2 font-medium ${isUser ? "border-white/20" : "border-slate-200 dark:border-slate-700"}`} {...props} />
          ),
          td: ({ node: _node, ...props }: MarkdownElementProps) => (
            <td className={`border-b px-2 py-2 ${isUser ? "border-white/10" : "border-slate-200 dark:border-slate-800"}`} {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
