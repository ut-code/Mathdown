import React, { useRef, useState } from "react";

const TextEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<string>("");

  const handleInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const clearEditor = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      setContent("");
    }
  };

  // ファイルを読み込んでエディタに表示する
  const openFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (editorRef.current) {
          editorRef.current.innerHTML = e.target?.result as string;
          setContent(e.target?.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  // ファイルを保存する
  const saveFile = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "text-editor-content.md";
    link.click();
  };

  return (
    <div>
      <h2>Simple Text Editor</h2>
      
      <input 
        type="file" 
        accept=".md"
        onChange={openFile}
        style={{ marginBottom: "10px" }}
      />
      
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          minWidth:"1200px",
          minHeight: "200px",
          borderRadius: "4px",
        }}
      ></div>
      
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

export default TextEditor;
