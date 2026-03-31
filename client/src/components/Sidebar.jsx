import { NavLink } from "react-router-dom"; {/*navlink  is similar to   <a href=" link" > </a>. but it provides 3 fetures additional-
  1- isActive function  ,  2- do not refresh the whole page it reloads the specific component where changes are made  3- work with react-router.
     isActive function -   jis tab pr enter honge vo highlight ho jayega ki yes we are on this tab and it is active  */}

  import { useAuth } from "../context/useAuth";

const Sidebar = () => {
  const base = "block px-4 py-2 rounded text-sm hover:bg-gray-700";  {/*base is just a variable , holding a property that we are using in below navlink conditon  */}
const { user } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        Mapple Admin
      </div>
   
    {/*look NavLink its closing arrow is not attached to it in starting ,    in Navlink class allow us to write a function {inside it} 
     we are calling isActive function  and it returns true or false. it comes with NavLink by default   
    base is  always applied , no matter true or false.
    then we are giving condition , if is active true  make  background gray else  base + "kuch nhi" */}
      <nav className="p-4 space-y-2">   {/* p is padding ,space-y-2 is margin excluding the last link botoom , hence only verticle inbetween spaces   */}
        <NavLink
          to="/"     
          className={({ isActive }) =>  
            `${base} ${isActive ? "bg-gray-700" : ""}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `${base} ${isActive ? "bg-gray-700" : ""}`
          }
        >
          Products
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `${base} ${isActive ? "bg-gray-700" : ""}`
          }
        >
          Orders
        </NavLink>

    
  {/* USERS page → ADMIN only */}
  {user?.role === "ADMIN" && (
    <NavLink
      to="/users"
      className={({ isActive }) =>
        `${base} ${isActive ? "bg-gray-700" : ""}`
      }
    >
      Users
    </NavLink>
  )}



  {/* SUPPORT CHAT → USER only */}
  {user?.role === "USER" && (
    <NavLink
      to="/support"
      className={({ isActive }) =>
        `${base} ${isActive ? "bg-gray-700" : ""}`
      }
    >
      Support Chat
    </NavLink>
  )}







</nav>
    </aside>
  );
};

export default Sidebar;
