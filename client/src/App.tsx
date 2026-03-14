import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Prompts from "./pages/Prompts";
import { UserProvider } from "./context/UserContext";

export default function App() {
  return (
    <UserProvider>
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <NavBar />
        <main className="pt-14">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/prompts" element={<Prompts />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
    </UserProvider>
  );
}
