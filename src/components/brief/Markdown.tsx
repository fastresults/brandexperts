import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={
        "prose prose-invert prose-sm max-w-none " +
        "prose-p:my-2 prose-p:leading-relaxed " +
        "prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold " +
        "prose-strong:text-foreground prose-strong:font-semibold " +
        "prose-em:text-foreground/80 " +
        "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 " +
        "prose-code:rounded prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:before:content-none prose-code:after:content-none " +
        "prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 " +
        "prose-blockquote:border-l-primary prose-blockquote:text-foreground/80 " +
        "prose-a:text-primary hover:prose-a:underline " +
        "prose-hr:border-white/10 " +
        (className ?? "")
      }
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
