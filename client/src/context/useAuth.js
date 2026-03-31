import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export const useAuth = () => {
  return useContext(AuthContext);
};



/* this above is a custom hook , so in componet instead of writing

useContext(AuthContext)
 we  just write - useAuth()

 look example inside component - const { user, logout } = useAuth();
  // here we directly writing the keyword useAuth()



*/