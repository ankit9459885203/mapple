import { useAuth } from "../context/useAuth"; // importing my custom hook
import { NavLink } from "react-router-dom";
import { MdMessage } from "react-icons/md"; // 👈 message icon

const Navbar = () => { // react component starts from here
  const { user, logout } = useAuth();   // get both here from context

  return (
    <header className="h-15 bg-red-50 border-b flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Admin Panel</h1>

      <div className="flex items-center gap-4">



          {/* ADMIN CHAT → ADMIN only */}
 {user?.role === "ADMIN" && (
  <NavLink
    to="/chat"
    className={({ isActive }) =>
      `p-2 rounded-full transition ${
        isActive
          ? "bg-blue-500 text-white"
          : "text-gray-700 hover:bg-gray-200"
      }`
    }
  >
     <MdMessage  size={22} />
  </NavLink>
)}



        {/*  show logged-in admin email , condition is saying that if user exists then show user.email , if user trying to load but not loaded yet then print loading..   */}
        <span className="text-sm text-gray-700 font-medium">
          {user ? user.email : "Loading..."}
</span>



{/* the logout function is comin from AuthProvider*/}
        <button
          onClick={logout}   
          className="px-3 py-1 text-sm bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
