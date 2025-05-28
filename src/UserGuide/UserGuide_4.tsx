function UserGuide_4() {
  return (
    <>
      <div
        className="App">
        <a href="/home">
          <img src="../docs/logo.png" width="12.5%" height="12.5%" />
        </a>
      </div>
      <div>
        <h1>使い方</h1>
        <p>
          <a href="/UserGuide/1">{"<"}</a>4/4<a href="/UserGuide/1">{">"}</a>
        </p>
        Mathdownは基本的に板書支援ツールですが、ChatGPTを使えば、PDF形式で配布されることの多い講義資料のメモツールとしても使えます。
        ChatGPTにPDFの講義資料をアップロードし、以下の適切なコマンドを入力すると、人工知能が資料の内容をMarkdownに変換してくれます（ただ画像が多いといろいろ厳しいかも...）
      </div>
    </>
  );
}

export default UserGuide_4;
