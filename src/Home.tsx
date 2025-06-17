function Home() {
  return (
    <>
      <div className="App">
        <a href="/home">
          <img src="../docs/logo.png" width="12.5%" height="12.5%" />
        </a>
      </div>
      <div>
        <h1>Mathdownへようこそ</h1>
        <ul>
          <li>
            <a href="/App">アプリを開く</a>
          </li>
          <li>
            <a href="/UserGuide/1">使い方</a>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Home;
