import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App.tsx";

import Home from "./Home.tsx";
import UserGuide from "./UserGuide/UserGuide.tsx";
import UserGuide_2 from "./UserGuide/UserGuide_2.tsx";
import UserGuide_3 from "./UserGuide/UserGuide_3.tsx";
import UserGuide_4 from "./UserGuide/UserGuide_4.tsx";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/App" element={<App />} />
        <Route path="/UserGuide/1" element={<UserGuide />} />
        <Route path="/UserGuide/2" element={<UserGuide_2 />} />
        <Route path="/UserGuide/3" element={<UserGuide_3 />} />
        <Route path="/UserGuide/4" element={<UserGuide_4 />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
