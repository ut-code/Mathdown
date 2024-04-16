// 叩き台でつくったものをそのまま持ってきているが、最終的には(App.tsxと重複部分も多いので)統合させたい。

import { useState, useMemo, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf"; // Make sure to import pdfjs
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import hogeLink from "/hoge.md?url";
import { ExtractDefinitions } from "./MDToDefinitions";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import Tippy from "@tippyjs/react";
// import { text } from "stream/consumers";
// Set the worker source path for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
import Textarea from "@mui/joy/Textarea";

export function ExtractPDF({ PDF }: { PDF: string }) {
  const [numPages, setNumPages] = useState<number>(-1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hogeMd, setHogeMd] = useState("");
  const [result, setResult] = useState<string[]>([]);
  const [explanation, setExplanation] = useState<string>(""); // ユーザー入力の部分。今は暫定的にテキストエリアを置いている。
  const opts = {
    prefix: "!define",
    suffix: "!enddef",
  };

  const options = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`, // 文字のエンコーディングに関する設定
      cMapPacked: true,
    }),
    []
  );

  // ページ移動
  const goToPrevPage = (): void => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = (): void => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  // pdfから文字を抜き出す非同期関数
  async function extractTextFromPDF(pdf: {
    getPage: (arg0: number) => any;
    numPages: number;
  }) {
    const getPageText = async (pageNum: number) => {
      const page = await pdf.getPage(pageNum); // pdfは引数
      const textContent = await page.getTextContent(); // console.log(textContent.items); をしてみると良い。
      const renderedTextContent = textContent.items
        .map((item: { str: string }) => item.str)
        .join("");
      result.push(renderedTextContent);
    };

    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      await getPageText(i);
    }
  }

  // pdfが読み込み成功した際に実行される非同期関数。
  async function onDocumentLoadSuccess(pdf: { numPages: any; getPage: any }) {
    await extractTextFromPDF(pdf);
    const numPages = pdf.numPages;
    setNumPages(numPages); // Extract text from PDF
  }
  useEffect(() => {
    fetch(hogeLink)
      .then((res) => res.text())
      .then((t) => setHogeMd(t))
      .catch((err) => console.error("Error fetching Hoge.md:", err));
  }, []);

  // const dict = ExtractDefinitions(hogeMd, opts.prefix, opts.suffix);

  return (
    <div className="flex">
        <div className="account">
        <h2>PDFの解説表示</h2>
        <ul>
          <ReferMap
            dictionary={ExtractDefinitions(explanation, opts.prefix, opts.suffix)} // ユーザー入力（暫定）から定義を抜き出している。
            searchString={result[pageNumber - 1] || ""}
          />
        </ul>
        </div>
        <div className="pdf">
          <p>
            Page {pageNumber} of {numPages}
          </p>
          <button disabled={pageNumber <= 1} onClick={goToPrevPage}>
            Prev
          </button>
          <button disabled={pageNumber >= numPages} onClick={goToNextPage}>
            Next
          </button>

            <Document
              file={PDF}
              options={options}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              <Page pageNumber={pageNumber} height={1200} />
            </Document>
        </div>

      <div className="textarea">
        <h4>解説書き込み欄</h4>
        <p>
          <Textarea
            placeholder="解説をコピー"
            minRows={14}
            onChange={(e) => {
              setExplanation(e.target.value);
            }}
          />
        </p>
      </div>
    </div>
  );
}

// MapオブジェクトとPDFから抜き取られた文字列を照合し、条件を満たす定義のみ抜き出す関数。よりよい関数名求む。
function ReferMap({
  dictionary,
  searchString,
}: {
  dictionary: Map<string, string>;
  searchString: string;
}) {
  // Filter dictionary keys based on whether they are included in the search string
  const filteredKeys = Array.from(dictionary.keys()).filter((key) =>
    searchString.includes(key)
  );

  // Map filtered keys to JSX elements
  const li = filteredKeys.map((key) => (
    <li key={key}>
      <Tippy
        content={
          <Markdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
            {dictionary.get(key)}
          </Markdown>
        }
      >
        <span>{key}</span>
      </Tippy>
    </li>
  ));

  return li;
}
