import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Pre-clean content: ensure standard line endings and spacing
  const cleanedContent = content || '';

  return (
    <div className={`markdown-body space-y-2.5 text-xs sm:text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white mt-3 mb-1.5 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-aiBlue-500 to-purple-600 inline-block" />
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white mt-2.5 mb-1 flex items-center gap-1.5">
              <span className="w-1 h-3 rounded-full bg-emerald-500 inline-block" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mt-2 mb-0.5">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed text-slate-800 dark:text-slate-100 my-1">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-extrabold text-emerald-950 dark:text-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/40 px-1 py-0.5 rounded-sm">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-700 dark:text-slate-300">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-2 pl-5 list-disc marker:text-emerald-500 dark:marker:text-emerald-400 text-slate-800 dark:text-slate-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 my-2 pl-5 list-decimal marker:text-emerald-600 dark:marker:text-emerald-400 marker:font-bold text-slate-800 dark:text-slate-200">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5 text-slate-800 dark:text-slate-200">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-emerald-500 pl-3 py-1 my-2 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-700 dark:text-slate-300 italic rounded-r-xl">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-slate-700">
              {children}
            </code>
          ),
          hr: () => (
            <hr className="border-0 border-t border-slate-200/80 dark:border-slate-700/80 my-3" />
          )
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
};
