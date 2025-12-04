import { FaLocationDot } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";
import { MdPhone } from "react-icons/md";
import { useAppContext } from "../Appcontext";

const Bilty = () => {
  const generatePdf = async () => {
    const element = document.getElementById("bilty-container");
    const htmlContent = element.outerHTML;

    const response = await fetch("https://bhandal-roadways-doc-maker.onrender.com/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: htmlContent }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bilty.pdf";
      link.click();
    } else {
      alert("PDF generation failed");
    }
  };

  const { biltyData } = useAppContext();
  return (
    <>
      <div
        id="bilty-container"
        className="max-w-4xl mx-auto p-4 bg-transparent font-sans text-sm"
      >
        {/* Header Section */}
        <header>
          <p className="text-center font-bold text-sm mb-1">
            Subject to Raipur Jurisdiction
          </p>
          <div className="flex justify-between items-center">
            {/* Logo and Company Info Left */}
            <img
              src="https://bhandal-roadways-doc-maker.onrender.com/static/logo.png"
              alt="Bhandal Roadways Logo"
              className="size-30 ml-4 -mt-16"
            />{" "}
            {/* Placeholder for logo */}
            <div className="flex flex-col items-center">
              <h1
                style={{ fontFamily: "Impact, sans-serif" }}
                className="text-5xl font-extrabold text-center tracking-wider"
              >
                BHANDAL ROADWAYS
              </h1>
              <p className="text-sm font-semibold bg-black text-white px-16 mt-1">
                TRANSPORT CONTRACTOR & COMMISSION AGENT
              </p>
              <div className="flex gap-1 justify-center items-center  mt-2">
                <FaLocationDot className="size-4" />
                <p className="text-sm font-bold">
                  House No: 21, Harshit Vihar, Phase 05, Tatibandh, RAIPUR:
                  492099 (C.G)
                </p>
              </div>
              <div className="text-lg font-bold flex justify-center items-center mt-1 gap-1">
                <IoMdMail className="size-4" />
                <p>bhandalroadways@gmail.com</p>
              </div>
              <div className="text-lg font-bold flex justify-center items-center mb-2 gap-1">
                Transporter ID: 22AHSPB6197L1ZV
              </div>
            </div>
            {/* Contact Info Right */}
            <div className="text-right text-xs -mt-20">
              <div className="flex gap-1 justify-center items-center  mt-2">
                <MdPhone className="size-4" />
                <p className="font-bold text-[14px]">+91 93016 76383</p>
              </div>
              <p className="font-bold text-[14px]">+91 94060 21740</p>
              <p className="font-bold text-[14px]">+91 79744 79917</p>
            </div>
          </div>
        </header>

        {/* Transporter and Consignee Header */}
        <div className="mb-4 w-full">
          <div className="text-center">
            <p
              style={{ fontFamily: "Calibri, sans-serif" }}
              className="text-[20px] font-extrabold text-red-600 inline-block px-2"
            >
              Consignee Copy
            </p>
          </div>
        </div>

        {/* Basic LR Details */}
        <div className="grid grid-cols-4 gap-x-2 text-sm font-bold mb-4">
          <div className="col-span-2 ml-2 mb-2">
            <p>
              L.R No:{" "}
              <span className="text-xl font-bold text-red-500">
                {biltyData.lrNo}
              </span>
            </p>
          </div>
          <div className="col-span-2 flex justify-end items-center mr-2">
            <p>
              Date:{" "}
              <span className="font-bold">
                {new Date().toLocaleDateString("en-GB")}
              </span>
            </p>
          </div>

          <div className="col-span-4 border border-black flex">
            <p className="w-1/2 border-r ml-2 py-1">
              Truck No:{" "}
              <span className="font-bold uppercase">{biltyData.truckNo}</span>
            </p>
            <p className="w-1/2 border-r ml-2 py-1">
              From: <span className="font-bold">{biltyData.from}</span>
            </p>
            <p className="w-1/2 ml-2 py-1">
              To: <span className="font-bold">{biltyData.to}</span>
            </p>
          </div>
        </div>

        {/* Consignor/Consignee Block */}
        <div className="grid grid-cols-2 mb-4 text-sm">
          {/* Consignor */}
          <div className="p-2">
            <p>
              Consignor:{" "}
              <span className="font-bold">{biltyData.consignor.name}</span>
            </p>
            <p className="mt-1 leading-5">
              Address:{" "}
              <span className="font-bold">{biltyData.consignor.address}</span>
            </p>
            <p className="mt-2">
              <span>GST No:</span>{" "}
              <span className="font-bold">{biltyData.consignor.gstNumber}</span>
            </p>
          </div>
          {/* Consignee */}
          <div className="p-2">
            <p>
              Consignee:
              <span className="font-bold"> {biltyData.consignee.name}</span>
            </p>
            <p className="mt-1">
              Address:{" "}
              <span className="font-bold wrap-break-word">
                {biltyData.consignee.address}
              </span>
            </p>
            <p></p>
            <p className="mt-2">
              GST No:
              <span className="font-bold">
                {" "}
                {biltyData.consignee.gstNumber}
              </span>
            </p>
          </div>
        </div>

        {/* Load Description Table */}
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-100 font-bold text-center">
              <th className="border border-black p-1 w-1/12">S. No.</th>
              <th className="border border-black p-1 w-5/12">
                Description of Load
              </th>
              <th className="border border-black p-1 w-2/12">Quantity</th>
              <th className="border border-black p-1 w-2/12">Rate</th>
              <th className="border border-black p-1 w-2/12">FREIGHT</th>
            </tr>
          </thead>
          <tbody className="text-center font-bold">
            {/* Data Rows */}
            {biltyData.packages.map((item, index) => (
              <tr key={index}>
                <td className="border border-black p-1 text-center">
                  {index + 1}.
                </td>
                <td className="border border-black p-1">{item.description}</td>
                <td className="border border-black p-1">{item.weight} MT</td>
                <td className="border border-black p-1 text-center">
                  {item.rate}
                </td>
                <td className="border border-black p-1 text-center">
                  {item.freight}
                </td>
              </tr>
            ))}
            {biltyData.packages.length <= 3 &&
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="h-7">
                  <td className="border border-black p-1 text-center"> </td>
                  <td className="border border-black p-1"> </td>
                  <td className="border border-black p-1"> </td>
                  <td className="border border-black p-1 text-center"></td>
                  <td className="border border-black p-1 text-center"></td>
                </tr>
              ))}
            {/* Total Row */}
            <tr>
              <td
                colSpan="1"
                className="border border-black p-1 font-bold"
              ></td>
              <td
                colSpan="1"
                className="border border-black p-1 font-bold"
              ></td>
              <td className="border border-black p-1 font-bold text-sm">
                Total:{" "}
                {biltyData.packages
                  .reduce((acc, item) => acc + Number(item.weight), 0)
                  .toFixed(3)}{" "}
                MT
              </td>
              <td colSpan="1" className="border border-black p-1"></td>
            </tr>
          </tbody>
        </table>
        <table className="w-full border-r border-l border-b border-black text-sm mb-4">
          <tbody className="font-bold">
            {/* Row 1 */}
            <tr>
              <td className="border-r border-b text-left border-black px-1 font-bold w-[25%]">
                e-Way Bill: {biltyData.eWayBillNo}
              </td>

              <td className="border-r text-left text-xs border-black p-1 font-bold w-[25%]">
                • The Goods are accepted for carrier subject to terms and
                condition overleaf.
              </td>

              {/* Empty middle cell */}
              <td className="border-r border-b border-black p-1 w-[10%]"></td>

              <td className="border-r border-b text-center text-lg border-black p-1 font-bold w-[15%]">
                Balance
              </td>

              <td className="border-r border-b text-center font-bold border-black p-1 w-[15%]">
                As per decided rate
              </td>
            </tr>

            {/* Row 2 */}
            <tr className="border-b">
              <td className="border-r text-left border-black p-1 font-bold w-[25%]">
                <div>
                  <p>Invoice No.: {biltyData.invoiceNo}</p>
                  <p className="uppercase">Value: As per invoice</p>
                </div>
              </td>

              <td className="border-r text-left text-xs border-black p-1 font-bold w-[25%]">
                • We are only broker not responsible for any type of claim (i.e.
                theft, damage, shortage, leakage, brokerage etc).
              </td>

              <td
                className="border-r text-center text-2xl border-black p-1 font-bold w-[10%]"
                colSpan={2}
              >
                To Pay Total
              </td>

              <td className="border-r text-center border-black p-1 font-bold w-[15%]"></td>
            </tr>

            {/* Row 3 */}
            <tr>
              <td className="border-r text-left border-black p-1 font-bold w-[22%]">
                <div>
                  <p className="mb-2">HDFC A/C: 50200098240792</p>
                  <p className="uppercase">IFSC CODE: HDFC0003692</p>
                </div>
              </td>

              <td
                colSpan={2}
                className="border-r text-md text-center border-black p-1 font-bold w-[48%]"
              >
                <div className="my-3">
                  <p>GST Tax Will Be Paid By</p>
                  <div className="flex gap-4 justify-center mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-blue-600"
                      />
                      <span className="text-sm text-gray-900 font-bold">
                        Consignor
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-blue-600"
                      />
                      <span className="text-sm text-gray-900 font-bold">
                        Consignee
                      </span>
                    </label>
                  </div>
                </div>
              </td>

              <td
                colSpan={2}
                className="border-r text-2xl border-black p-1 font-bold w-[30%]"
              >
                <div className="text-sm text-right mt-1">
                  {biltyData.includeDigitalStamp && (
                    <img
                      src="https://bhandal-roadways-doc-maker.onrender.com/static/stamp.jpg"
                      alt="stamp"
                      className="size-20 mx-auto"
                    />
                  )}

                  <p
                    className={`font-normal mr-2 ${
                      !biltyData.includeDigitalStamp ? "mt-20" : "mt-1"
                    }`}
                  >
                    For, <span className="font-bold">Bhandal Roadways</span>
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="w-full flex justify-center mb-10">
        <button
          type="button"
          onClick={generatePdf}
          className="w-1/2 py-4 text-center active:scale-95 transition text-sm text-white rounded-full cursor-pointer bg-green-500"
        >
          <p className="mb-0.5">Generate PDF</p>
        </button>
      </div>
    </>
  );
};

export default Bilty;
