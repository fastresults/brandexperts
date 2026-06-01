import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Variant = "chat" | "document";

/**
 * Strip stray markdown the strategist sometimes emits in chat replies
 * (the system prompt forbids bullets/headings/inline emphasis in chat,
 * but Gemini occasionally slips them in). Final-brief markdown is never
 * sanitized — it's expected to be rich.
 */
function sanitizeChatMarkdown(text: string): string {
  let out = text;
  // Demote ATX headings to plain prose.
  out = out.replace(/^#{1,6}\s+/gm, "");
  // Strip leading list markers ("- ", "* ", "• ", "1. ").
  out = out.replace(/^[\t ]*(?:[-*•]|\d+\.)\s+/gm, "");
  // Collapse bold/italic wrappers but keep the inner words.
  out = out.replace(/\*\*([^*\n]+)\*\*/g, "$1");
  out = out.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "$1");
  out = out.replace(/(?<![\w_])_([^_\n]+)_(?![\w_])/g, "$1");
  // Drop blockquote markers in chat.
  out = out.replace(/^>\s?/gm, "");
  return out;
}

const CHAT_CLASSES =
  "prose prose-invert prose-sm max-w-none " +
  "prose-p:my-2 prose-p:leading-relaxed " +
  "prose-strong:text-foreground prose-strong:font-semibold " +
  "prose-em:text-foreground/80 " +
  "prose-a:text-primary hover:prose-a:underline";

const DOCUMENT_CLASSES =
  "prose prose-invert max-w-none " +
  // Body
  "prose-p:my-4 prose-p:leading-[1.75] prose-p:text-foreground/90 " +
  // Headings
  "prose-headings:tracking-tight prose-headings:font-semibold " +
  "prose-h1:text-3xl md:prose-h1:text-4xl prose-h1:mt-0 prose-h1:mb-6 " +
  "prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-white/10 prose-h2:uppercase prose-h2:tracking-wider prose-h2:text-xs prose-h2:font-semibold prose-h2:text-muted-foreground " +
  "prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-foreground " +
  // Blockquote — used for the "lean-in" positioning line
  "prose-blockquote:border-l-2 prose-blockquote:border-l-primary " +
  "prose-blockquote:not-italic prose-blockquote:font-medium " +
  "prose-blockquote:text-lg md:prose-blockquote:text-xl " +
  "prose-blockquote:text-foreground prose-blockquote:leading-snug " +
  "prose-blockquote:pl-5 prose-blockquote:my-6 " +
  // Inline labels like **Tone** —
  "prose-strong:text-primary prose-strong:font-semibold " +
  "prose-em:text-foreground/70 " +
  // Lists
  "prose-ul:my-4 prose-ul:space-y-1.5 prose-ol:my-4 prose-ol:space-y-1.5 " +
  "prose-li:my-0 prose-li:leading-relaxed prose-li:text-foreground/90 " +
  "prose-li:marker:text-primary/60 " +
  // Code & rules
  "prose-code:rounded prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:before:content-none prose-code:after:content-none " +
  "prose-hr:my-10 prose-hr:border-white/10 " +
  "prose-a:text-primary hover:prose-a:underline";

export function Markdown({
  children,
  className,
  variant = "chat",
}: {
  children: string;
  className?: string;
  variant?: Variant;
}) {
  const text = variant === "chat" ? sanitizeChatMarkdown(children) : children;
  const base = variant === "document" ? DOCUMENT_CLASSES : CHAT_CLASSES;
  return (
    <div className={`${base} ${className ?? ""}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
