import { Link, useNavigate } from "react-router-dom";

const TransportingBillForm = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center items-center flex-col gap-4 flex-1">
      <p className="text-xl">
        Coming Soon...
        </p> 
      <button
        onClick={() => navigate("/")}
        type="button"
        className="w-40 py-4  text-center active:scale-95 transition text-md text-white rounded-full 
         bg-blue-500"
      >
        <p className="mb-0.5">Go Back</p>
      </button>
    </div>
  );
};

export default TransportingBillForm;
