import { useEffect, useState } from "react";
import parse, { Element, HTMLReactParserOptions } from "html-react-parser";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import Tippy from "@tippyjs/react";

import hogeLink from "/hoge.md?url";
import { ExtractDefinitions } from "./MDToDefinitions";
import { MDToHTML } from "./MDToHTML";

import "katex/dist/katex.min.css";
import "tippy.js/dist/tippy.css";

export default function App() {
  const [hogeMd, setHogeMd] = useState("");
  const [html, setHTML] = useState("");
  const opts = {
    prefix: "!define",
    suffix: "!enddef",
  };

  useEffect(() => {
    fetch(hogeLink)
      .then((res) => res.text())
      .then((t) => setHogeMd(t))
      .catch((err) => console.error("Error fetching Hoge.md:", err));
  }, []);
  useEffect(() => {
    // MDtoHTML is async for some reason.
    MDToHTML(hogeMd.replaceAll(opts.prefix, "##").replaceAll(opts.suffix, ""))
      .then((h) => setHTML(h))
      .catch(console.error);
  });

  return <ConvertMarkdown markdown={hogeMd} html={html} opts={opts} />;
}

// this uses given markdown as the source to extract definition from,
// and given html to render the main note.
function ConvertMarkdown({
  markdown,
  html,
  opts,
}: {
  markdown: string;
  html: string;
  opts: { prefix: string; suffix: string };
}) {
  const words = ExtractDefinitions(markdown, opts.prefix, opts.suffix);
  let parsing = html.split("\n");

  // this is O(n**2). reduce the order if you can.
  words.forEach((_, word: string) => {
    let idx = 0;
    for (const line of parsing) {
      // remove popup of the definition itself, because it looks ugly
      // I hard-coded the assumption that a definition will turn into h2. if you got any better way to do this, do that.
      if (!line.includes(`<h2>${word}</h2>`)) {
        parsing[idx] = line.replaceAll(word, `<span class="underline"><span class="${word}">${word}</span></span>`);
        // nested span tag to underline targeted words. it doesn't work well with <span class="${word}, underline">. If there are better way, fix it.
      }
      idx++;
    }
  });
  let parsedHtml = parsing.join("\n");
  console.log(parsedHtml);

  const options: HTMLReactParserOptions = {
    replace(domNode) {
      // 与えられたノードが Element であり、その class 属性が words 配列内のいずれかの単語と一致するかどうかを確認
      if (domNode instanceof Element && words.has(domNode.attribs.class)) {
        return (
          <Tippy
            content={
              <Markdown
                rehypePlugins={[rehypeKatex]}
                remarkPlugins={[remarkMath]}
              >
                {words.get(domNode.attribs.class)}
              </Markdown>
            }
          >
            <span>{domNode.attribs.class}</span>
          </Tippy>
        );
      }
      // 条件を満たさない場合は、元のノードをそのまま返す
      return domNode;
    },
  };

  return <>{parse(parsedHtml, options)}</>; // パースされた HTML を返す
}
