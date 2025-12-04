import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-10">
      <h1 className="text-3xl uppercase font-bold mt-6">
        Choose What To Make?
      </h1>
      <Link
        to={"/bilty-form"}
        type="button"
        className="w-40 py-4 text-center active:scale-95 transition text-sm text-white rounded-full bg-indigo-500"
      >
        <p className="mb-0.5">BILTY</p>
      </Link>
      <Link
        to={"/transporting-bill"}
        type="button"
        className="w-48 py-4 px-5 text-center active:scale-95 transition text-sm text-white rounded-full bg-indigo-500"
      >
        <p className="mb-0.5">TRANSPORTING BILL</p>
      </Link>
    </div>
  );
};

export default Home;
