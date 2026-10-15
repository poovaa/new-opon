import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StockMaster from "./pages/StockMaster";

import LCC from "./pages/LCC";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/stockmaster" element={<StockMaster />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/lcc" element={<LCC />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;