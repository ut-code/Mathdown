function UserGuide_3() {
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
          <a href="/UserGuide/1">{"<"}</a>3/4<a href="/UserGuide/1">{">"}</a>
        </p>
        Mathdownは用語確認や用語追跡に特化したツールです。
        「!define」の後ろに追加したい用語とその用語の定義・説明を入力し、「追加」ボタンを押すことで、用語を追加できます。追加した用語は、閲覧画面や「用語リスト」内で確認でき、用語をホバーすることで定義や説明も参照できます。

      </div>
    </>
  );
}

export default UserGuide_3;
