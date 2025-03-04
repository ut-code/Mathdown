import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App.tsx";

import App1 from "./App1.tsx";
import App2 from "./App2.tsx";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<App1 />} />
        <Route path="/ExtractPDF" element={<App2 />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
