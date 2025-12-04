import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex items-center p-6 bg-white border-b border-gray-400 relative transition-all">
      <Link to="/">
        <img src="logo.png" alt="logo" className="size-20" />
      </Link>
      <h1 className="text-lg font-bold uppercase">
        Bhandal Roadways Doc Maker
      </h1>
    </nav>
  );
};

export default Navbar;
