function UserGuide_2() {
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
          <a href="/UserGuide/1">{"<"}</a>2/2<a href="/UserGuide/3">{">"}</a>
        </p>
        編集画面に入力すると、閲覧画面にMarkdown書式で即時反映されます。「編集画面の非表示」ボタンをクリックすると、閲覧画面のみ表示できます。編集したものを保存したいときは「保存」を押します。過去に保存したファイルを再度編集する場合は「ファイルを選択」を押します。
      </div>
    </>
  );
}

export default UserGuide_2;
