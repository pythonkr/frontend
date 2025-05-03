import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout";
import Test from "./components/Test";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Test />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
