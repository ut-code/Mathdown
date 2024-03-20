import { useEffect, useState } from "react";
import parse, { Element, HTMLReactParserOptions } from "html-react-parser";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import Tippy from "@tippyjs/react";

import HogeLink from "/hoge.md?url";
import { ExtractDefinitions } from "./MDToDefinitions";
import { MDToHTML } from "./MDToHTML";

import "katex/dist/katex.min.css";
import "tippy.js/dist/tippy.css";

export default function App() {
  const [Hoge, setHogeMd] = useState("");

  useEffect(() => {
    fetch(HogeLink)
      .then((res) => res.text())
      .then((t) => setHogeMd(t))
      .catch((err) => console.error("Error fetching Hoge.md:", err));
  }, []);
  if (Hoge === "") {
    return <></> // avoid unnecessary calculation
  }
  return <ConvertMarkdown markdown={Hoge} />;
}

export function ConvertMarkdown({ markdown }: { markdown: string }) {
  const html = MDToHTML(markdown);
  const words = ExtractDefinitions(markdown, "!define ", "!enddef");

  let parsedHtml = html; // 初期化されたパースされた HTML 文字列を保持する変数

  words.forEach((_, word: string) => {
    const primer = parsedHtml.split(`${word}`);
    parsedHtml = primer.join(`<span class="${word}">${word}</span>`); // 置換結果を保持する
  });

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
