import { BrowserRouter, Routes, Route } from "react-router-dom";
import Test from "./pages/Test";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter basename="/prepintai">
      <Routes>
        <Route path="/test" element={<Test />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;