import { useEffect, useRef, useState, SetStateAction } from "react";
import parse, { Element, HTMLReactParserOptions } from "html-react-parser";
import Tippy from "@tippyjs/react";
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
import UploadImage from "./uploadImage";

type positionInfo = null | { top: number; left: number };

export default function App() {
  const [markdown, setMarkdown] = useState("");
  const [html, setHTML] = useState("");
  const [dict, setDict] = useState(new Map());
  const opts = { prefix: "!define", suffix: "!enddef" };
  const [inputPosition, setInputPosition] = useState<positionInfo>(null);
  const [inputValue, setInputValue] = useState("");
  const [isTextAreaFocused, setIsTextAreaFocused] = useState(false);
  const [visualize, setVisualize] = useState(true);
  const [fileContent, setFileContent] = useState<string>("");
  const [imageData, setImageData] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  // 2/3追加・テンプレート部分

  const [buttonName, setButtonName] = useState<string[]>([
    "積分記号",
    "偏微分",
  ]);
  const [buttonContent, setButtonContent] = useState<string[]>([
    "\\int_a^b dx",
    "\\frac{\\partial}{\\partial x}",
  ]);
  const [nameText, setNameText] = useState<string>("");
  const [contentText, setContentText] = useState<string>("");

  useEffect(() => {
    setMarkdown(fileContent);
  }, [fileContent]);

  useEffect(() => {
    localStorage.setItem("item", markdown);
  }, [markdown]);

  useEffect(() => {
    async function processMarkdown() {
      const d = ExtractDefinitions(markdown, opts.prefix, opts.suffix);
      const newd = new Map<string, string>();
      const promises = Array.from(d.entries()).map(([k, v]) => {
        const md = replaceExternalSyntax(v)
          .replaceAll(opts.prefix, "##")
          .replaceAll(opts.suffix, "");
        return MDToHTML(md).then((newv) => newd.set(k, newv));
      });
      await Promise.all(promises);
      setDict(newd);

      let md = replaceExternalSyntax(markdown.replace(/!define[\s\S]*$/m, ""));
      try {
        md = replaceExternalSyntax(md);
      } catch (e: any) {
        md = e.toString();
      }
      MDToHTML(md.replaceAll(opts.prefix, "##").replaceAll(opts.suffix, ""))
        .then(setHTML)
        .catch(() => console.log("MDToHTML failed"));
    }
    processMarkdown();
  }, [markdown]);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (!isTextAreaFocused) {
        const selection = document.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (selection.toString()) {
            setInputPosition({
              top: rect.bottom + window.scrollY,
              left: rect.left + window.scrollX,
            });
            setInputValue("!define " + selection.toString());
          } else {
            setInputPosition(null);
          }
        }
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [isTextAreaFocused]);

  const handleInputChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setInputValue(event.target.value);
  };

  const handleScrollSync = (
    sourceRef: React.RefObject<HTMLElement>,
    targetRef: React.RefObject<HTMLElement>,
  ) => {
    if (sourceRef.current && targetRef.current) {
      targetRef.current.scrollTop = sourceRef.current.scrollTop;
    }
  };

  const insertDollarSignsAtCursor = (command: string) => {
    if (textAreaRef.current) {
      const textarea = textAreaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = `${markdown.slice(0, start)}$$ \n ${command} \n $$${markdown.slice(end)}`;
      setMarkdown(newText);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 3;
        textarea.focus();
      }, 0);
    }
  };

  const saveFile = () => {
    const blob = new Blob([markdown], { type: ".md, text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = localStorage.getItem("filename") ?? "hoge.md";
    link.click();
  };

  return (
    <>
      <div className="save_container">
        <div className="upload_save">
          <UploadMarkdown onFileContentChange={setFileContent} />
          <Button variant="text" onClick={saveFile}>
            保存
          </Button>
        </div>
        <div className="upload_save">
          <UploadImage onImageChange={setImageData} />
        </div>
      </div>
      {!visualize && (
        <>
          <div className="upload_save">
            <Button variant="text" onClick={() => setVisualize(true)}>
              編集画面の表示
            </Button>
          </div>
          <div className="wrapper_false">
            <ConvertMarkdown dictionary={dict} html={html} opts={opts} />
          </div>
        </>
      )}
      <div>{imageData}</div>
      {visualize && (
        <>
          <div className="upload_save">
            <Button variant="text" onClick={() => setVisualize(false)}>
              編集画面の非表示
            </Button>
          </div>

          {/* 2/3追加 テンプレート部 */}
          {buttonName.map((name, index) => (
            <>
              <button
                onClick={() => insertDollarSignsAtCursor(buttonContent[index])}
              >
                {name}
              </button>
              <button
                onClick={() => {
                  setButtonName(buttonName.filter((_, i) => i !== index));
                  setButtonContent(buttonContent.filter((_, i) => i !== index));
                }}
              >
                削除
              </button>
            </>
          ))}
          <button
            onClick={() => {
              setButtonName([...buttonName, nameText]);
              setButtonContent([...buttonContent, contentText]);
            }}
          >
            + 追加
          </button>
          <input
            onChange={(event) => {
              setNameText(event.target.value);
            }}
          ></input>
          <input
            onChange={(event) => {
              setContentText(event.target.value);
            }}
          ></input>
          <WordDictionary dictionary={dict} html={html} opts={opts} />
          {/* ここまで */}
          <div className="wrapper_true">
            <div
              className="convert_markdown"
              ref={previewRef}
              onScroll={() => handleScrollSync(previewRef, textAreaRef)}
            >
              <ConvertMarkdown dictionary={dict} html={html} opts={opts} />
            </div>
            <textarea
              value={markdown}
              ref={textAreaRef}
              onScroll={() => handleScrollSync(textAreaRef, previewRef)}
              onChange={(event) => setMarkdown(event.target.value)}
              placeholder="編集画面"
              onFocus={() => setIsTextAreaFocused(true)}
              onBlur={() => setIsTextAreaFocused(false)}
            />
          </div>
          <br />
        </>
      )}
      <ExtractPDF pdfName={pdfFile} opts={opts} />
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
            onFocus={() => setIsTextAreaFocused(true)}
            onBlur={() => setIsTextAreaFocused(false)}
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
  );

  dictionary.forEach((_, word) => {
    parsing = parsing.map((line) =>
      !line.includes(`<h2>${word}</h2>`)
        ? line.replaceAll(
            word,
            `<span class="${word} underline">${word}</span>`,
          )
        : line,
    );
  });

  console.log(dictionary);

  const parsedHtml = parsing.join("\n");

  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (domNode instanceof Element) {
        const tagName = domNode.tagName;
        if (tagName === "img") {
          return (
            <img
              src={domNode.attribs?.src}
              alt={domNode.attribs?.alt || "image"}
              style={{ maxWidth: "100%" }}
            />
          );
        }
        const word = domNode.attribs?.class?.split(" ")[0];
        if (dictionary.has(word)) {
          return (
            <Tippy
              content={parse(dictionary.get(word) || "")}
              className="markdown_tippy"
            >
              <span className={domNode.attribs?.class}>{word}</span>
            </Tippy>
          );
        }
      }
      return domNode;
    },
  };

  return <>{parse(parsedHtml, options)}</>;
}

function WordDictionary({
  dictionary,
}: {
  dictionary: Map<string, string>;
  html: string;
  opts: { prefix: string; suffix: string };
}) {
  // キーの長さ順にソートした Map を配列として取得
  const sortedEntries = [...dictionary.entries()].sort(
    (a, b) => a[0].length - b[0].length,
  );

  return (
    <ul>
      {sortedEntries.map(([key, value], index) => (
        <li key={index}>
          <Tippy content={parse(value)} className="markdown_tippy">
            <span>{key}</span>
          </Tippy>
        </li>
      ))}
    </ul>
  );
}
