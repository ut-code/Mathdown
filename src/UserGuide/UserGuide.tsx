function UserGuide() {
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
          <a href="/UserGuide/1">{"<"}</a>1/2<a href="/UserGuide/2">{">"}</a>
        </p>
        ここでは、Mathdownの大まかな機能を説明します。
        通常のMarkdownエディター（Markdownをよく知らない方はこちら）と同様に、編集画面と閲覧画面とがあります。それに加え、Mathdownでは、用語を追加する辞書機能と、編集したものをローカル保存する保存機能とがあります。

      </div>
    </>
  );
}

export default UserGuide;
