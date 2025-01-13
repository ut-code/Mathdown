import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";

export async function MDToHTML(md: string): Promise<string> {
  return String(
    await unified()
      .use(remarkParse)
      .use(remarkMath)
      .use(remarkRehype)
      .use(remarkGfm)
      .use(rehypeKatex)
      .use(rehypeStringify)
      .process(md),
  );
}
