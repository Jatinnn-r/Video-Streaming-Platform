import { Link } from "react-router-dom";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
      <Link to="/" className="text-2xl font-bold text-red-500">
        StreamSafe
      </Link>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Hi, {user.username}</span>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-bold"
            >
              Logout
            </button>
          </div>
        ) : (
          <span className="text-gray-400">Login to watch</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;