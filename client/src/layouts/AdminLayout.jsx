import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";


{/* this concept is known as passing children ,  not passing props , here adminLayout is child component and AdminRoutes is the parent. from there we are passing the data
  making props  perameter and receiving argument from  admin routes, then reciving that as prop.children */}
const AdminLayout = ( props ) => {    
   return (
    <div className="flex h-screen bg-gray-100">
   
      <Sidebar />

      <div className="flex flex-col flex-1">  {/* flex make flex property and by defualt left to right, then doing column vise , then fitting the content of this div from left to right in full area.  */}
        <Navbar />

        <main className="flex-1 p-6 overflow-y-auto">   {/* first flex is  filling the rest area undr the parent, next is padding , auto adding the verticle scrollbar only when i am adding  more content .  */}
      
          {props.children}  {/* user , order , product etc.  */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
