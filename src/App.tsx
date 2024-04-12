import { useEffect, useState } from "react";
import parse, { Element, HTMLReactParserOptions } from "html-react-parser";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import Tippy from "@tippyjs/react";

import markdownLink from "/hoge.md?url";
import { ExtractDefinitions } from "./MDToDefinitions";
import { MDToHTML } from "./MDToHTML";
import { replaceExternalSyntax } from "./external-syntax";

import "katex/dist/katex.min.css";
import "tippy.js/dist/tippy.css";

export default function App() {
  const [markdown, setMarkdown] = useState("");
  const [html, setHTML] = useState("");
  const [dict, setDict] = useState(new Map());
  const opts = {
    prefix: "!define",
    suffix: "!enddef",
  };

  // get markdown
  useEffect(() => {
    fetch(markdownLink)
      .then((res) => res.text())
      .then((t) => setMarkdown(t))
      .catch((err) => console.error("Error fetching Hoge.md:", err));
  }, []);

  // use markdown (separation is necessary because it's async)
  useEffect(() => void insideUseEffect(), [markdown]);
  async function insideUseEffect() {
    // prepare dictionary
    let d = ExtractDefinitions(markdown, opts.prefix, opts.suffix);
    const newd = new Map<string, string>();
    const promises = [];
    d.forEach((v, k) => {
      let md = replaceExternalSyntax(v);
      md = md.replaceAll(opts.prefix, "##").replaceAll(opts.suffix, "");
      const p = MDToHTML(md).then((newv) => newd.set(k, newv));
      promises.push(p);
    });
    Promise.all(promises).then(console.log("new dict: ", newd)).then(() => setDict(newd));

    // prepare HTML
    var md;
    try {
      md = replaceExternalSyntax(markdown);
    } catch (e) {
      md = e.toString();
    }
    MDToHTML(md.replaceAll(opts.prefix, "##").replaceAll(opts.suffix, ""))
      .then((h) => setHTML(h))
      .catch(() => console.log("MDToHTML failed"));
  }

  return <ConvertMarkdown dictionary={dict} html={html} opts={opts} />;
}

// this uses given dictionary as the source to extract definition from,
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
  dictionary.forEach((_def: string, word: string) => {
    console.log(`word: ${word}, definition: ${_def}`);
    let idx = 0;
    for (const line of parsing) {
      // remove popup of the definition itself, because it looks ugly
      // I hard-coded the assumption that a definition will turn into h2. if you got any better way to do this, do that.
      if (!line.includes(`<h2>${word}</h2>`)) {
        // make sure ${word} is the first attribute of class; otherwise the word replacement below will fail.
        parsing[idx] = line.replaceAll(
          word,
          `<span class="${word} underline">${word}</span>`,
        );
      }
      idx++;
    }
  });
  let parsedHtml = parsing.join("\n");

  const options: HTMLReactParserOptions = {
    replace(domNode) {
      // domNode の最初の class 属性を取り出す。 (indexError でなく undefined になるため、[0] は安全)
      const word: string | undefined = domNode.attribs?.class?.split(" ")[0];
      // HTML 的には多分動くが、気持ち悪いので最初の class 属性 = word を排除
      const newClass: string = domNode.attribs?.class
        ?.split(" ")
        .slice(0)
        .join(" ");
      // 与えられたノードが Element であり、その class 属性が undefined または空文字列でなく、 dictionary 内のいずれかの単語と一致するかどうかを確認
      if (
        domNode instanceof Element &&
        domNode.attribs?.class &&
        dictionary.has(word)
      ) {
        return (
          <Tippy content={dictionary.get(word)}>
            <span className={newClass}>{word}</span>
          </Tippy>
        );
      }
      // 条件を満たさない場合は、元のノードをそのまま返す
      return domNode;
    },
  };

  return <>{parse(parsedHtml, options)}</>; // パースされた HTML を返す
}
function inspect<T>(target: T): T {
  console.log(target);
  return target;
}
