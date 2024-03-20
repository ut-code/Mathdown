import Tippy from "@tippyjs/react";
import parse, { Element, HTMLReactParserOptions } from "html-react-parser";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { MdModify } from "./mdModify";
import { useEffect, useState } from "react";
import TestMd from "/test.md?url";

export function ConvertHtml({
  html,
  words,
}: {
  html: string;
  words: string[];
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(TestMd)
      .then((response) => response.text())
      .then((data) => setText(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  let parsedHtml = html; // 初期化されたパースされた HTML 文字列を保持する変数

  words.forEach((word: string) => {
    const primer = parsedHtml.split(`${word}`);
    parsedHtml = primer.join(`<span class="${word}">${word}</span>`); // 置換結果を保持する
  });

  const options: HTMLReactParserOptions = {
    replace(domNode) {
      // 与えられたノードが Element であり、その class 属性が words 配列内のいずれかの単語と一致するかどうかを確認
      if (domNode instanceof Element && words.includes(domNode.attribs.class)) {
        return (
          <Tippy
            content={
              <Markdown
                rehypePlugins={[rehypeKatex]}
                remarkPlugins={[remarkMath]}
              >
                {MdModify(text, domNode.attribs.class)}
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
