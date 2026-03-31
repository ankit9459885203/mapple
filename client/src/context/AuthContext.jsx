import { createContext } from "react";

export const AuthContext = createContext(null);
// creating a global container , right now it is empty.
// but we also need container manager which will manage all the stored data(user, token , login updates )
// hence we are creating  authProvider for that.