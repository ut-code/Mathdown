// 叩き台でつくったものをそのまま持ってきているが、最終的には(App.tsxと重複部分も多いので)統合させたい。

import { useState, useMemo, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf"; // Make sure to import pdfjs
import secondPDF from "/chibutsu_nyumon.pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import hogeLink from "/hoge.md?url";
import { ExtractDefinitions } from "./MDToDefinitions";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import Tippy from "@tippyjs/react";

// Set the worker source path for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export function ExtractPDF() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [result, setResult] = useState<string[]>([]); // 新しいStateを定義
  const resultList: string[] = []; // pdfから抜き取った情報を、ここから抜いていく。
  const [hogeMd, setHogeMd] = useState("");
  const [newResult, setNewResult] = useState<string[]>([""]); // resultとnewResultに関して、何か無駄な部分がありそう。
  const opts = {
    prefix: "!define",
    suffix: "!enddef",
  };

  const options = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
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
    getPage: (arg0: any) => any;
    numPages: any;
  }) {
    const getPageText = async (pageNum: number) => {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const renderedTextContent = textContent.items
        .map((item: { str: any }) => item.str)
        .join("");
      resultList.push(renderedTextContent);
      setResult(resultList);
      // console.log(result);
    };

    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      await getPageText(i);
    }
  }

  // pdfが読み込み成功した際に実行される非同期関数。
  async function onDocumentLoadSuccess(pdf: { numPages: any; getPage: any }) {
    const numPages = pdf.numPages;
    setNumPages(numPages); // Extract text from PDF
    await extractTextFromPDF(pdf);
  }

  useEffect(() => {
    fetch(hogeLink)
      .then((res) => res.text())
      .then((t) => setHogeMd(t))
      .catch((err) => console.error("Error fetching Hoge.md:", err));
  }, []);

  // pdfの文字情報が読み取られ、result変数に反映されるのに時間がかかるため、
  // 初期条件として空の文字列を入れて、変更が起こった時にresultをnewResultに代入し、ReferMapに反映されるようにしている。
  useEffect(() => {
    setNewResult(result); 
  });

  const dict = ExtractDefinitions(hogeMd, opts.prefix, opts.suffix);

  return (
    <div>
      <div className="blocka">
        <h3>React-pdfを用いてPDFファイルを表示する。</h3>

        <Document
          file={secondPDF}
          options={options}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page pageNumber={pageNumber} />
        </Document>

        <p>
          Page {pageNumber} of {numPages}
        </p>
        <button disabled={pageNumber <= 1} onClick={goToPrevPage}>
          Prev
        </button>
        <button disabled={pageNumber >= numPages} onClick={goToNextPage}>
          Next
        </button>

        <h3>こんな解説の加え方もあり。（PDFファイルの表示されているページから、ノートに載っている用語を抜き出し、ポップアップする。</h3>
        <ul>
          <ReferMap
            dictionary={dict}
            searchString={newResult[pageNumber - 1] || ""}
          />
        </ul>
      </div>
      <div className="blockb">
        <h3>react-pdfを用いて抜き出した文字情報</h3>
        <hr />
        <p>{result[pageNumber - 1]}</p>
        <hr />
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
