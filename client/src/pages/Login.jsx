import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5001/api/auth/login", {
        email,
        password,
      });
      // Save user info to local storage (Simple Auth)
      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("token", res.data.token);
      
      // Force reload to update Navbar and Redirect
      window.location.href = "/";
    } catch (err) {
      setError(true);
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-lg w-96 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-400"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-400"
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition"
        >
          Sign In
        </button>

        {error && <span className="text-red-500 text-sm mt-3 block text-center">Wrong credentials!</span>}
      </form>
    </div>
  );
};

export default Login;