import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface LokumPreviewProps {
  content: string;
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
}

export function LokumPreview({ content }: LokumPreviewProps) {
  const body = stripFrontmatter(content);

  return (
    <div className="lokum-prose rounded-2xl border border-border bg-bg-surface p-6 sm:p-8">
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {body}
      </Markdown>
    </div>
  );
}
