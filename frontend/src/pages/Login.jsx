import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { USER_ROLES } from "../components/config/constant";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const initialLogin = { email: "", password: "" };
const initialRegister = { username: "", fullName: "", email: "", password: "", role: USER_ROLES.USER };

const Login = () => {
  const [mode, setMode] = useState("login");
  const [loginData, setLoginData] = useState(initialLogin);
  const [registerData, setRegisterData] = useState(initialRegister);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (mode === "login") {
      setLoginData((prev) => ({ ...prev, [name]: value }));
    } else {
      setRegisterData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        // Use the login function from AuthContext
        const user = await login(loginData.email, loginData.password);
        
        // Show success message
        toast.success(`Welcome back, ${user.username || 'User'}!`);
        
        // Redirect based on role
        if (user.role === USER_ROLES.ADMIN) {
          navigate("/dashboard/admin");
        } else if (user.role === USER_ROLES.OWNER) {
          navigate("/dashboard/owner");
        } else {
          navigate("/");
        }
      } else {
        // Use the register function from AuthContext
        const isOwner = registerData.role === USER_ROLES.OWNER;
        await register(registerData, isOwner);
        
        setSuccess("Registration successful! You can now log in.");
        toast.success("Account created successfully! Please log in.");
        setMode("login");
        setRegisterData(initialRegister);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
      toast.error(err.message || "Authentication failed");
    }
    setLoading(false);
  };

  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-red-900">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          {mode === "login" ? "Login to Your Account" : "Create an Account"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={registerData.username}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={registerData.fullName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={registerData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value={USER_ROLES.USER}>User</option>
                  <option value={USER_ROLES.OWNER}>Owner</option>
                  <option value={USER_ROLES.ADMIN}>Admin</option>
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={mode === "login" ? loginData.email : registerData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={mode === "login" ? loginData.password : registerData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className={`w-full py-2 rounded font-semibold transition ${
              loading
                ? "bg-gray-400 text-white"
                : "bg-black text-white hover:bg-red-600"
            }`}
            disabled={loading}
          >
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Registering..."
              : mode === "login"
              ? "Login"
              : "Register"}
          </button>
        </form>
        <div className="mt-6 text-center">
          {mode === "login" ? (
            <>
              <span className="text-gray-600">Don't have an account? </span>
              <button
                className="text-red-600 hover:underline font-semibold"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccess("");
                }}
              >
                Register
              </button>
            </>
          ) : (
            <>
              <span className="text-gray-600">Already have an account? </span>
              <button
                className="text-black hover:underline font-semibold"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
    <Footer />
  </>
  );
};

export default Login;