import React from "react";
import ReactDOM from "react-dom/client";
import UploadPDF from "./Upload.tsx";
import Home from "./Home.tsx"
import "./index.css";
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';


const App: React.FC = () => {
  return (
    <Router>
        {/* ルーティングの定義 */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/importpdf" element={<UploadPDF />} />
        </Routes>
    </Router>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
