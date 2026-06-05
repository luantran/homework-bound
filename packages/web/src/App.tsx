import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Questions from "./pages/Questions";
import Exercises from "./pages/Exercises";
import Worksheets from "./pages/Worksheets";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/worksheets" element={<Worksheets />} />
      </Route>
    </Routes>
  );
}

export default App;
