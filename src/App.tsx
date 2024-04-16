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

import { ExtractPDF } from "./extractPDF";
import  pdfFile  from "/chibutsu_nyumon.pdf";

export default function App() {
  const [hogeMd, setHogeMd] = useState("");
  const [html, setHTML] = useState(""); // 残しておくように。
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

  const dict = ExtractDefinitions(hogeMd, opts.prefix, opts.suffix);

  //  return <><ConvertMarkdown dictionary={dict} html={html} opts={opts} /> // 残しておくように。
  return <>
      <ExtractPDF PDF={pdfFile} />
  </>;
}

// this uses given markdown as the source to extract definition from,
// and given html to render the main note.
function ConvertMarkdown({
  dictionary,
  html,
  opts,
}: {
  dictionary: Map<string, string>;
  html: string;
  opts: { prefix: string; suffix: string };
}) {

  let parsing = html.split("\n");

  // this is O(n**2). reduce the order if you can.
  dictionary.forEach((_, word: string) => {
    let idx = 0;
    for (const line of parsing) {
      // remove popup of the definition itself, because it looks ugly
      // I hard-coded the assumption that a definition will turn into h2. if you got any better way to do this, do that.
      if (!line.includes(`<h2>${word}</h2>`)) {
        // make sure ${word} is the first attribute of class; otherwise the word replacement below will fail.
        parsing[idx] = line.replaceAll(word, `<span class="${word} underline">${word}</span>`);
        // nested span tag to underline targeted dictionary. it doesn't work well with <span class="${word}, underline">. If there are better way, fix it.
	//   there are two reasons it didn't work:
	//   - class divider is " ", not ", "
	//   - domNode.attribs.class will be `${word} underline` so it doesn't match word
      }
      idx++;
    }
  });
  let parsedHtml = parsing.join("\n");
  console.log(parsedHtml);

  const options: HTMLReactParserOptions = {
    replace(domNode) {
      // domNode の最初の class 属性を取り出す。 (indexError でなく undefined になるため、[0] は安全)
      const word: string | undefined = domNode.attribs?.class?.split(" ")[0];
      // HTML 的には多分動くが、気持ち悪いので最初の class 属性 = word を排除
      const newClass: string = domNode.attribs?.class?.split(" ").slice(0).join(" ");
      // 与えられたノードが Element であり、その class 属性が undefined または空文字列でなく、 dictionary 内のいずれかの単語と一致するかどうかを確認
      if (domNode instanceof Element && domNode.attribs?.class && dictionary.has(word)) {
        return (
          <Tippy
            content={
              <Markdown
                rehypePlugins={[rehypeKatex]}
                remarkPlugins={[remarkMath]}
              >
                {dictionary.get(word)}
              </Markdown>
            }
          >
            <span className={newClass}>{word}</span>
          </Tippy>
        );
      }
      // 条件を満たさない場合は、元のノードをそのまま返す
      return domNode;
    },
  };

  return <><div>{parse(parsedHtml, options)}</div></>; // パースされた HTML を返す
}