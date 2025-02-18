import {
    BrowserRouter,
    Route,
    Routes
  } from "react-router-dom";
  
  import App1 from './App1.tsx';
  import App2 from './App2.tsx';
  import App_1 from "./App_1.tsx";
  
  const AppRouters = () => {
    return (
      <BrowserRouter>
        <Routes>
          <Route path='/home' element={<App_1 />} />
          <Route path='/ExtractPDF' element={<App2 />} />
        </Routes>
      </BrowserRouter>
    )
  }
  
  export default AppRouters;