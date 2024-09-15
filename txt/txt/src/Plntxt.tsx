import React, { useState } from "react";

const Plntxt: React.FC = () => {
  const [content, setContent] = useState<string>("");

  // テキストエリアでの入力を処理
  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  // ファイルを読み込んでエディタに表示する
  const openFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setContent(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  // ファイルを保存する
  const saveFile = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text-editor-content.csv";
    link.click();
  };

  const clearEditor = () => {
    setContent("");
  };

  return (
    <div>
      <h2>Simple Text Editor</h2>

      <input 
        type="file" 
        accept=".csv"
        onChange={openFile}
        style={{ marginBottom: "10px" }}
      />

      <textarea
        value={content}
        onChange={handleInput}
        style={{
          width: "100%",
          height: "200px",
          padding: "10px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          fontSize: "16px",
          fontFamily: "monospace",
        }}
      ></textarea>

      <div style={{ marginTop: "10px" }}>
        <button onClick={clearEditor} style={{ marginRight: "10px" }}>
          Clear
        </button>
        <button onClick={saveFile}>
          Save
        </button>
      </div>
    </div>
  );
};

export default Plntxt;
