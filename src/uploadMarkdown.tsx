import { useState, useRef } from "react";
import { Button, Typography } from "@mui/material";
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
  const [textFile, setTextFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイルが選択されたときの処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget?.files && e.currentTarget.files[0]) {
      const targetFile = e.currentTarget.files[0];
      setTextFile(targetFile);

      // FileReaderを使ってファイルの内容を読み込む
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string; // ファイル内容を状態に保存
        onFileContentChange(text);
      };
      reader.readAsText(targetFile); // ファイルをテキストとして読み込む
    }
  };

  return (
    <>
      <label>
        + テキストファイルをアップロード
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
