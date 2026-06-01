import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Welcome from "./components/Welcome";
import Form from "./components/Form";
import ProductManagement from "./components/ProductManagement";

// Home Component containing the original App logic
function Home() {
  const [hideWelcome, setHideWelcome] = useState(() => {
    // Check localStorage on first render
    return localStorage.getItem("hideWelcome") === "true";
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setHideWelcome(true);
        localStorage.setItem("hideWelcome", "true");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* <div className={`welcome-transition${hideWelcome ? ' hide' : ''}`}>
        <Welcome />
      </div> */}
      <Form />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* <nav className="bg-white shadow-sm p-4 mb-4">
          <div className="container mx-auto flex gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Form
            </Link>
            <Link
              to="/products"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Product Management
            </Link>
          </div>
        </nav> */}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/form" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
