import { useEffect, useState } from "react";
import { useAppContext } from "../Appcontext";
import { RiLoader4Line } from "react-icons/ri";

const BiltyForm = () => {
  const [noOfPackages, setNoOfPackages] = useState(5);
  const [isOpen, setIsOpen] = useState(false);
  const [includeDigitalStamp, setIncludeDigitalStamp] = useState(false);
  const { biltyData, setBiltyData } = useAppContext();
  const [loading, setLoading] = useState(false);

  const rows = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  const handleSelect = (row) => {
    setNoOfPackages(row);
    setIsOpen(false);
  };

  const handleNestedChange = (path, value) => {
    setBiltyData((prev) => {
      const updated = { ...prev };
      let ref = updated;
      path.forEach((key, idx) => {
        if (idx === path.length - 1) {
          ref[key] = value;
        } else {
          ref[key] = { ...ref[key] };
          ref = ref[key];
        }
      });
      return updated;
    });
  };

  const handlePackageChange = (index, field, value) => {
    setBiltyData((prev) => {
      const updatedPackages = [...prev.packages];
      updatedPackages[index] = { ...updatedPackages[index], [field]: value };
      return { ...prev, packages: updatedPackages };
    });
  };

  const generatePdf = async () => {
    setLoading(true);
    const response = await fetch("https://bhandal-roadways-doc-maker.onrender.com/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ biltyData }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bilty.pdf";
      link.click();
      setLoading(false);
    } else {
      alert("PDF generation failed");
    }
  };

  useEffect(() => {
    setBiltyData((prev) => ({
      ...prev,
      packages: Array.from({ length: noOfPackages }, () => ({
        description: "",
        weight: "",
        freight: "To Pay",
        rate: "FIX",
      })),
    }));
  }, [noOfPackages]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        generatePdf();
      }}
      className="flex flex-col items-center text-sm text-slate-800"
    >
      <h1 className="text-4xl font-bold py-4 text-center">Bilty Maker</h1>
      <div className="max-w-96 w-full px-4">
        {[
          { label: "Lr No", name: "lrNo", type: "number" },
          { label: "Invoice No.", name: "invoiceNo", type: "text" },
          { label: "E way bill No", name: "eWayBillNo", type: "number" },
          { label: "Truck No", name: "truckNo", type: "text" },
          { label: "From", name: "from", type: "text" },
          { label: "To", name: "to", type: "text" },
        ].map((item) => (
          <div key={item.name} className="mb-4">
            <label className="font-medium">{item.label}</label>
            <div className="flex items-center mt-2 h-10 pl-3 border border-slate-300 rounded-full focus-within:ring-2 focus-within:ring-indigo-400 transition-all overflow-hidden">
              <input
                name={item.name}
                value={biltyData[item.name]}
                onChange={(e) =>
                  setBiltyData({ ...biltyData, [item.name]: e.target.value })
                }
                type={item.type}
                className="h-full px-2 w-full outline-none bg-transparent"
                placeholder={`Enter ${item.label}`}
              />
            </div>
          </div>
        ))}

        <label className="flex items-center space-x-2 cursor-pointer mb-4">
          <input
            type="checkbox"
            className="h-4 w-4 accent-blue-600"
            checked={includeDigitalStamp}
            onChange={(e) => {
              setIncludeDigitalStamp(e.target.checked);
              handleNestedChange(["includeDigitalStamp"], e.target.checked);
            }}
          />
          <span className="text-sm text-gray-900 font-bold">
            Digital Stamp?
          </span>
        </label>
      </div>

      {/* Consignor and Consignee Sections */}
      {["consignor", "consignee"].map((type) => (
        <div key={type} className="max-w-96 w-full px-4">
          <div className="relative mb-2">
            <h1 className="relative z-10 text-center font-bold text-lg py-3 bg-white w-fit mx-auto">
              {type.charAt(0).toUpperCase() + type.slice(1)} Details
            </h1>
            <div className="absolute top-1/2 left-0 w-full border-b border-black z-0"></div>
          </div>
          {["name", "address", "gstNumber"].map((field) => (
            <div key={field} className="mb-4">
              <label className="font-medium">
                {(type === "consignor" || type === "consignee") &&
                field === "gstNumber"
                  ? `${
                      type.charAt(0).toUpperCase() + type.slice(1)
                    }'s GST Number`
                  : `${type.charAt(0).toUpperCase() + type.slice(1)} ${
                      field.charAt(0).toUpperCase() + field.slice(1)
                    }`}
              </label>
              {field === "address" ? (
                <textarea
                  name={`${type}.${field}`}
                  value={biltyData[type][field]}
                  onChange={(e) =>
                    handleNestedChange([type, field], e.target.value)
                  }
                  rows="4"
                  className="w-full mt-2 p-2 bg-transparent border border-slate-300 rounded-lg resize-none outline-none focus:ring-2 focus-within:ring-indigo-400 transition-all"
                  placeholder={`Enter ${type} ${field}`}
                ></textarea>
              ) : (
                <div className="flex items-center mt-2 h-10 pl-3 border border-slate-300 rounded-full focus-within:ring-2 focus-within:ring-indigo-400 transition-all overflow-hidden">
                  <input
                    type="text"
                    name={`${type}.${field}`}
                    value={biltyData[type][field]}
                    onChange={(e) =>
                      handleNestedChange([type, field], e.target.value)
                    }
                    className="h-full px-2 w-full outline-none bg-transparent"
                    placeholder={`Enter ${type} ${field}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Packages Section */}
      <div className="max-w-96 w-full px-4">
        <div className="relative mb-2">
          <h1 className="relative z-10 text-center font-bold text-lg py-3 bg-white w-fit mx-auto">
            Packages Details
          </h1>
          <div className="absolute top-1/2 left-0 w-full border-b border-black z-0"></div>
        </div>
        <p className="text-sm font-bold mb-2">Select No of packages</p>
        <div className="flex flex-col w-44 text-sm relative mb-4">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left px-4 pr-2 py-2 border rounded bg-white text-gray-800 border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none"
          >
            <span>{noOfPackages}</span>
            <svg
              className={`w-5 h-5 inline float-right transition-transform duration-200 ${
                isOpen ? "rotate-0" : "-rotate-90"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#6B7280"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isOpen && (
            <ul className="w-full bg-white border border-gray-300 rounded shadow-md mt-1 py-2">
              {rows.map((row) => (
                <li
                  key={row}
                  className="px-4 py-2 hover:bg-indigo-500 hover:text-white cursor-pointer"
                  onClick={() => handleSelect(row)}
                >
                  {row}
                </li>
              ))}
            </ul>
          )}
        </div>

        {biltyData.packages.map((pkg, index) => (
          <div
            key={index}
            className={`${
              index + 1 < noOfPackages ? "mb-4 border-b border-gray-400" : ""
            } pb-4`}
          >
            <h1 className="relative z-10 font-bold text-lg py-3 bg-white w-fit">{`Package No ${
              index + 1
            }`}</h1>
            {["description", "weight", "rate", "freight"].map((field) => (
              <div key={field} className="mb-4">
                <label className="font-medium">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <div className="flex items-center mt-2 h-10 pl-3 border border-slate-300 rounded-full">
                  <input
                    type="text"
                    value={pkg[field]}
                    onChange={(e) =>
                      handlePackageChange(index, field, e.target.value)
                    }
                    className="h-full px-2 w-full outline-none bg-transparent"
                    placeholder={`Enter ${
                      field.charAt(0).toUpperCase() + field.slice(1)
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="mb-4 font-bold text-lg text-gray-700">Recheck the details again before generating</p>
      <button
        type="submit"
        disabled={loading}
        className={`flex items-center w-80 mb-6 justify-center gap-1 ${
          loading ? "bg-gray-500" : "bg-indigo-500 hover:bg-indigo-600"
        } text-white py-2.5  rounded-full transition`}
      >
        {loading ? "Loading" : "Generate"}
        {loading ? (
          <RiLoader4Line className="animate-spin size-4 mt-1" />
        ) : (
          <svg
            className="mt-0.5"
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m18.038 10.663-5.625 5.625a.94.94 0 0 1-1.328-1.328l4.024-4.023H3.625a.938.938 0 0 1 0-1.875h11.484l-4.022-4.025a.94.94 0 0 1 1.328-1.328l5.625 5.625a.935.935 0 0 1-.002 1.33"
              fill="#fff"
            />
          </svg>
        )}
      </button>
    </form>
  );
};

export default BiltyForm;
