import { useState, useRef, useEffect } from "react";
import { Button } from "@mui/material";
import React, { InputHTMLAttributes, forwardRef } from "react";

const IMAGE_FILE_ID = "imageFileId";
type Props = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  id: InputHTMLAttributes<HTMLInputElement>["id"];
};

type ImageUploadProps = {
  onImageChange: (content: string) => void; // 親にデータを渡すためのProps
};

export default function UploadImage({ onImageChange }: ImageUploadProps) {
  const [, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初回ロード時に localStorage から画像データを読み込む
  useEffect(() => {
    const storedImage = localStorage.getItem('image');
    if (storedImage) {
      onImageChange(storedImage); // 親コンポーネントに画像データを渡す
    }
  }, []);

  // 画像ファイルが選択されたときの処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget?.files && e.currentTarget.files[0]) {
      const targetFile = e.currentTarget.files[0];
      setImageFile(targetFile);

      // FileReaderを使って画像の内容を読み込む
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string; // Base64エンコードされた画像データを取得
        localStorage.setItem('image', imageData); // localStorageに画像データを保存
        onImageChange(imageData); // 親コンポーネントに画像データを渡す
        console.log("Image saved:", imageData);
      };
      reader.readAsDataURL(targetFile); // 画像をBase64形式で読み込む
    }
  };

  const deleteStoredImage = () => {
    localStorage.removeItem('image');
    onImageChange(""); // 削除後、親コンポーネントに空データを渡す
    console.log("Stored image deleted");
  };

  return (
    <>
      <label>
        画像ファイルをアップロード
        {/* 見えないinput要素 */}
        <InputImage
          ref={fileInputRef}
          id={IMAGE_FILE_ID}
          onChange={handleFileChange}
        />
      </label>

      <Button onClick={() => fileInputRef.current?.click()}>
        ファイルを選択
      </Button>
      <Button onClick={deleteStoredImage}>
        消去する
      </Button>
    </>
  );
}

// 画像ファイル用の Input コンポーネント
const InputImage = forwardRef<HTMLInputElement, Props>(
  ({ onChange, id }, ref) => {
    return (
      <input
        ref={ref}
        id={id}
        type="file"
        accept="image/*" // 画像ファイルを選択可能に
        onChange={onChange}
        hidden
      />
    );
  },
);
