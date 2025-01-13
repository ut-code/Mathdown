import { useState, useRef, useEffect } from "react";
import { Button } from "@mui/material";
import React, { InputHTMLAttributes, forwardRef } from "react";

const TEXT_FILE_ID = "textFileId";
type Props = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  id: InputHTMLAttributes<HTMLInputElement>["id"];
};

type MarkdownProps = {
  onFileContentChange: (content: string) => void; // 親にデータを渡すためのProps
};

export default function UploadMarkdown({ onFileContentChange }: MarkdownProps) {
  const [, setTextFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初回ロード時に localStorage からデータを読み込む
  useEffect(() => {
    const storedText = localStorage.getItem("item");
    if (storedText) {
      onFileContentChange(storedText); // 親コンポーネントにデータを渡す
    }
  }, []);

  // ファイルが選択されたときの処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget?.files && e.currentTarget.files[0]) {
      const targetFile = e.currentTarget.files[0];
      setTextFile(targetFile);
      localStorage.setItem("filename", targetFile.name); // ファイル名を保存 -> ファイルを新規保存する際に使う。

      // FileReaderを使ってファイルの内容を読み込む
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string; // ファイル内容を状態に保存
        localStorage.setItem("item", text);
        const storedText = localStorage.getItem("item") ?? "";
        onFileContentChange(storedText);
        console.log("Text saved:", storedText);
      };
      reader.readAsText(targetFile); // ファイルをテキストとして読み込む
    }
  };

  const deleteStoredText = () => {
    localStorage.removeItem("item");
    onFileContentChange(""); // 削除後、親コンポーネントに空データを渡す
    console.log("Stored text deleted");
  };

  return (
    <>
      <label>
        テキストファイルをアップロード
        {/* 見えないinput要素 */}
        <InputMarkdown
          ref={fileInputRef}
          id={TEXT_FILE_ID}
          onChange={handleFileChange}
        />
      </label>

      <Button onClick={() => fileInputRef.current?.click()}>
        ファイルを選択
      </Button>
      <Button onClick={deleteStoredText}>消去する</Button>
    </>
  );
}

// テキストファイル用の Input コンポーネント
const InputMarkdown = forwardRef<HTMLInputElement, Props>(
  ({ onChange, id }, ref) => {
    return (
      <input
        ref={ref}
        id={id}
        type="file"
        accept=".md, text/markdown" // Markdownファイルを選択可能に
        onChange={onChange}
        hidden
      />
    );
  },
);

// displayNameを追加
InputMarkdown.displayName = "InputMarkdown";