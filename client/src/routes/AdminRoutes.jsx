import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Users from "../pages/Users";
import AdminRoute from "./AdminRoute";
import ChatPage from "../pages/AdminChatPage";
import UserChat from "../pages/UserChat";







// route is in side routes,  every route is a diffrnt page
const AdminRoutes = () => {
 const { token, loading } = useAuth();
if (loading) return <div>Loading...</div>;


  return (
    <Routes>
      {/* No layout */}
      <Route path="/login" element={<Login />} />

      {/* With layout */}
     <Route
    
        path="/"
        element={
          token ? (
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

  <Route
        path="/products"
        element={
          token ? (
            <AdminLayout>
              <Products />
            </AdminLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />



   <Route
        path="/orders"
        element={
            
          <AdminLayout>
            <h1>Orders page</h1>
          </AdminLayout>
            
        }
      />


{/* <AdminRoute> is the protection layer for <AdminRoutes>, only admin can see the users */}
 <Route
  path="/users"
  element={
    <AdminRoute>  
      <AdminLayout>
        <Users />
      </AdminLayout>
    </AdminRoute>
  }
/>

<Route
  path="/chat"
  element={
    token ? (
      <AdminLayout>
        <ChatPage />
      </AdminLayout>
    ) : (
      <Navigate to="/login" />
    )
  }
/>

<Route
  path="/support"
  element={
    token ? (
      <AdminLayout>
        <UserChat />
      </AdminLayout>
    ) : (
      <Navigate to="/login" />
    )
  }
/>






    </Routes>
  );
};

export default AdminRoutes;
