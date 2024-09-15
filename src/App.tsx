import { useEffect, useState, SetStateAction } from "react";
import parse, { Element, HTMLReactParserOptions } from "html-react-parser";
// import Markdown from "react-markdown";
// import rehypeKatex from "rehype-katex";
// import remarkMath from "remark-math";
import Tippy from "@tippyjs/react";
import markdownLink from "/hoge.md?url";
import { ExtractDefinitions } from "./MDToDefinitions";
import { MDToHTML } from "./MDToHTML";
import { replaceExternalSyntax } from "./external-syntax";
import { ExtractPDF } from "./extractPDF";
import pdfFile from "/chibutsu_nyumon.pdf";
import Textarea from "@mui/joy/Textarea";

import "katex/dist/katex.min.css";
import "tippy.js/dist/tippy.css";

type positionInfo = null | { top: number; left: number };

export default function App() {
  const [markdown, setMarkdown] = useState("");
  const [html, setHTML] = useState("");
  const [dict, setDict] = useState(new Map());
  const opts = {
    prefix: "!define",
    suffix: "!enddef",
  };

  // ドラッグして直接参照できる機能の部分
  const [inputPosition, setInputPosition] = useState<positionInfo>(null); // ドラッグされた位置
  // const [selectedText, setSelectedText] = useState(""); // ドラッグされた文章 // ...unused
  const [inputValue, setInputValue] = useState("");
  const [textAreaValue, setTextAreaValue] = useState("");
  const [isTextAreaFocused, setIsTextAreaFocused] = useState(false);

  // get markdown
  useEffect(() => {
    fetch(markdownLink)
      .then((res) => res.text())
      .then((t) => setMarkdown(t))
      .catch((err) => console.error("Error fetching Hoge.md:", err));
  }, []);

  // use markdown (separation is necessary because it's async)
  useEffect(() => void insideUseEffect(), [markdown + textAreaValue]);
  async function insideUseEffect() {
    // prepare dictionary
    let d = ExtractDefinitions(
      markdown + textAreaValue,
      opts.prefix,
      opts.suffix,
    );
    console.log(markdown + textAreaValue);
    const newd = new Map<string, string>();
    const promises: Promise<Map<string, string>>[] = [];
    d.forEach((v, k) => {
      let md = replaceExternalSyntax(v);
      md = md.replaceAll(opts.prefix, "##").replaceAll(opts.suffix, "");
      const p = MDToHTML(md).then((newv) => newd.set(k, newv));
      promises.push(p);
    });
    Promise.all(promises).then(() => setDict(newd));

    // prepare HTML
    var md;
    try {
      md = replaceExternalSyntax(markdown);
    } catch (e: any) {
      md = e.toString();
    }
    MDToHTML(md.replaceAll(opts.prefix, "##").replaceAll(opts.suffix, ""))
      .then((h) => setHTML(h))
      .catch(() => console.log("MDToHTML failed"));
  }

  // ドラッグして直接参照できる機能の部分
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = document.getSelection();
      if (selection && selection.rangeCount > 0 && !isTextAreaFocused) {
        // textareaがFocusされていないときのみ、selectionを発令する。
        const range = selection.getRangeAt(0); // Range { commonAncestorContainer: #text, startContainer: #text, startOffset: 8, endContainer: #text, endOffset: 23, collapsed: true }
        // 左から8文字目から23文字目であることを指している。
        const rect = range.getBoundingClientRect(); // DOMRect { x: 209.56666564941406, y: 167.25, width: 130.38333129882812, height: 29, top: 167.25, right: 339.9499969482422, bottom: 196.25, left: 209.56666564941406 }
        // 位置情報の取得

        // setSelectedText(selection.toString()); // ...unused

        if (selection.toString()) {
          // console.log(selection.toString()) 選択した範囲の文字列。
          setInputPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
          });
          setInputValue("!define " + selection.toString());
        } else {
          setInputPosition(null);
        }
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [isTextAreaFocused]);

  const handleInputChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setInputValue(event.target.value);
    // console.log(inputValue) 入力された内容がここに入る。
  };

  const handleTextAreaFocus = () => {
    setIsTextAreaFocused(true);
  };

  const handleTextAreaBlur = () => {
    setIsTextAreaFocused(false);
  };

  return (
    <>
      <ConvertMarkdown dictionary={dict} html={html} opts={opts} />
      <ExtractPDF pdfName={pdfFile} opts={opts} />
      {/* ドラッグして参照する部分 */}
      <Textarea value={textAreaValue} placeholder="結果" minRows={10} />
      {inputPosition && (
        <>
          <Textarea
            value={inputValue}
            onChange={handleInputChange}
            style={{
              position: "absolute",
              top: `${inputPosition.top}px`,
              left: `${inputPosition.left}px`,
            }}
            onFocus={handleTextAreaFocus}
            onBlur={handleTextAreaBlur}
          />
          <button
            onClick={() =>
              setTextAreaValue(
                (textAreaValue) => textAreaValue + "\n" + inputValue,
              )
            }
            style={{
              position: "absolute",
              top: `${inputPosition.top - 1}px`,
              left: `${inputPosition.left + 250}px`,
            }}
          >
            送信
          </button>
        </>
      )}
    </>
  );
}

// this uses given dictionary as the source to extract definition from,
// and given html to render the main note.
function ConvertMarkdown({
  dictionary,
  html,
}: {
  dictionary: Map<string, string>;
  html: string;
  opts: { prefix: string; suffix: string };
}) {
  let parsing = html.split("\n");

  // this is O(n**2). reduce the order if you can.
  dictionary.forEach((_def: string, word: string) => {
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
      if (!(domNode instanceof Element)) {
        return domNode;
      }
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
          // dictionary.get(word) is an html and therefore must not be used directly
          <Tippy content={parse(dictionary.get(word) || "")}>
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
