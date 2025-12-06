import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import TransportingBillForm from "./components/TransportingBillForm";
import BiltyForm from "./components/BiltyForm";

function App() {
  return (
    <div>
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
