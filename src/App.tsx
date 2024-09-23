import { useEffect, useState, SetStateAction } from "react";
import parse, { Element, HTMLReactParserOptions } from "html-react-parser";
// import Markdown from "react-markdown";
// import rehypeKatex from "rehype-katex";
// import remarkMath from "remark-math";
import Tippy from "@tippyjs/react";
// import markdownLink from "/hoge.md?url";
import { ExtractDefinitions } from "./MDToDefinitions";
import { MDToHTML } from "./MDToHTML";
import { replaceExternalSyntax } from "./external-syntax";
import { ExtractPDF } from "./extractPDF";
import pdfFile from "/chibutsu_nyumon.pdf";
import Textarea from "@mui/joy/Textarea";
import { Button } from "@mui/material";

import "katex/dist/katex.min.css";
import "tippy.js/dist/tippy.css";
import UploadMarkdown from "./uploadMarkdown";

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
  const [selectedText, setSelectedText] = useState(""); // ドラッグされた文章に関する変数
  const [inputValue, setInputValue] = useState("");
  const [isTextAreaFocused, setIsTextAreaFocused] = useState(false);
  const [visualize, setVisualize] = useState(true); // テキストエリアを表示にするか非表示にするか
  const [fileContent, setFileContent] = useState<string>("");

  // get markdown
  // useEffect(() => {
  // fetch(markdownLink)
  // .then((res) => res.text())
  // .then((t) => setMarkdown(t))
  // .catch((err) => console.error("Error fetching Hoge.md:", err));
  // }, []);

  useEffect(() => {
    setMarkdown(fileContent);
  }, [fileContent]);

  useEffect(() => {
    localStorage.setItem("item", markdown);
  }, [markdown]); // markdownの内容が変わるたびにlocalStorageに保存。

  // use markdown (separation is necessary because it's async)
  useEffect(() => void insideUseEffect(), [markdown]);
  async function insideUseEffect() {
    // prepare dictionary
    let d = ExtractDefinitions(markdown, opts.prefix, opts.suffix);
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
      md = replaceExternalSyntax(markdown.replace(/!define[\s\S]*$/m, "")); // !define以下をすべて取り去る。
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

        setSelectedText(selection.toString());

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

  // ファイルを保存する
  const saveFile = () => {
    const blob = new Blob([markdown], {
      type: ".md, text/markdown",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = localStorage.getItem("filename") ?? "hoge.md"; // localStorage上に保存したファイル名を使う。
    link.click();
  };

  return (
    <>
      <div className="upload_save">
        <UploadMarkdown onFileContentChange={setFileContent} />
        <Button variant="text" onClick={saveFile}>
          保存
        </Button>
      </div>
      {visualize == false && (
        <>
          <div className="upload_save"><Button
            variant="text"
            onClick={() => {
              setVisualize(true);
            }}
          >
            編集画面の表示
          </Button></div>
          <div className="wrapper_false"><ConvertMarkdown dictionary={dict} html={html} opts={opts} /></div>
        </>
      )}
      {visualize == true && (
        <>
          <div className="upload_save">
            <Button
              variant="text"
              onClick={() => {
                setVisualize(false);
              }}
            >
              編集画面の非表示
            </Button>
          </div>
          <div className="wrapper_true">
            <div className="convert_markdown">
              <ConvertMarkdown dictionary={dict} html={html} opts={opts} />
            </div>
            <textarea
              value={markdown}
              onChange={(event) => {
                setMarkdown(event.target.value);
              }}
              placeholder="編集画面"
            />
          </div>
        </>
      )}
      <ExtractPDF pdfName={pdfFile} opts={opts} />
      {/* ドラッグして参照する部分 */}
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
              setMarkdown((markdown) => markdown + "\n" + inputValue + "\n")
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

  dictionary = new Map(
    [...dictionary.entries()].sort((a, b) => a[0].length - b[0].length),
  ); // 短い単語を先に置き換える: 辞書内の単語を長さ順にソートしてから置き換えることで、重複のリスクを減らします。

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
function inspect<T>(target: T): T {
  console.log(target);
  return target;
}
