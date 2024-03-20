import "tippy.js/dist/tippy.css";
import { useEffect, useState } from "react";
import "katex/dist/katex.min.css";
import { ConvertHtml } from "./utils/convertHtml";
import Hoge from "/hoge.html?url";
import TestMd from "/test.md?url";
import { SectionList } from "./utils/mdModify";;

export default function App() {
  const [html, setHtml] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(TestMd)
      .then((response) => response.text())
      .then((data) => setText(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    fetch(Hoge) // htmlのデータを取得
      .then((response) => response.text()) // Extract text from response
      .then((data) => setHtml(data)) // Set text state
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const list = SectionList(text);

  return <ConvertHtml html={html} words={list}/>;;
}
