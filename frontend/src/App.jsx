import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import TransportingBillForm from "./components/TransportingBillForm";
import BiltyForm from "./components/BiltyForm";
import { useEffect, useState } from "react";
import { RiLoader2Fill } from "react-icons/ri";

function App() {
  const [isBackendAwake, setIsBackendAwake] = useState(false);

  const awakeBackend = async () => {
    try {
      const res = await fetch("https://bhandal-roadways-doc-maker.onrender.com/status");
      const data = await res.json();
      data.success ? setIsBackendAwake(true) : null;
    } catch (error) {
      console.error("Error waking up backend:", error);
    }
  };

  useEffect(() => {
    awakeBackend();
  }, []);

  if (!isBackendAwake) {
    return (
      <div className="h-screen flex-col flex justify-center items-center text-lg font-bold gap-3">
        <RiLoader2Fill className="text-3xl animate-spin" />
        <div>Please wait we are setting things up for you...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <Routes>
        <Route path="/bilty-form" element={<BiltyForm />} />
        <Route path="/transporting-bill" element={<TransportingBillForm />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
