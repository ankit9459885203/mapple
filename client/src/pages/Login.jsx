import { useState } from "react";
import { useNavigate } from "react-router-dom"; // navigation hook, used to redirect after  login
import { api } from "../services/api";
import { useAuth } from "../context/useAuth"; 


const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // here initial value is object which holds both email and password , here form is object which have email and password , in chatpage this area was array.
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // triggers when user clicks on login button
  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", form); // using axios api directly here coz  auth vali api single thi,  agr 2-4 hoti toh mtlv hota seprate service bnane kaa

      // giving these details to context , so react store it globally 
      login(res.data.token, res.data.user);

      // navifate is used for smooth redirect - after login go to the dashbord
      navigate("/");
    } catch (err) {
      alert("Login failed");
      console.log(err);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>

        <input
          placeholder="Email"
          className="border p-2 w-full mb-3"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}  // copy old form and update email only , hence password will stay as it is. 
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white w-full py-2"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
