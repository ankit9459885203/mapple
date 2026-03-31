import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext"; // our container


export const AuthProvider = ({ children }) => { // this is a warapper component , it wraps the whole app , you can see app.jsx , children is whatever inside  <authprovider>  <children>  <authprovider>
  
  // we are storing token , user , and next one is loading where app is still checking local storage.
  const [token, setToken] = useState(null); // use state hook  stores data in memory (RAM) inside the browser only. never in local storage
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // due to this ([]) use effect is runing once when app start
  useEffect(() => {
    const savedToken = localStorage.getItem("token"); // loacal storage means browser not database. jese chrome ki apni cookies and history saved localy.  hann but unlike ram it dont vanish when refresh , only end when
    const savedUser = localStorage.getItem("user");

    if (savedToken) setToken(savedToken);  // if token exist in local storage then copy it in react state. ( react state- we have two memory , database vaali and second one is ram vaali,  this ram vaali memory  is react state, it stays when we are runing the live app and when we refresh it vanishes instantly), when we use useState it stores variable in RAM memory , hence use state hook stores variable temprorily in ram memory
    if (savedUser) setUser(JSON.parse(savedUser));// local storage had a string , we need to convert it in to object.

    setLoading(false); // if user is loged in
  }, []);

  // when login api succeed , it saves token in local storage , save user, update react state,
  const login = (token, user) => {
    localStorage.setItem("token", token); // local storage saves things in key- value pair
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };
// when logout api succeed it removes everything (token, user)
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };



  // this  line tells that everthing inside  authprovider can access (token , user, login , logout)
  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


/* this is my  main.jsx where the app is inside <AuthProvider>

<AuthProvider>
   <App />
</AuthProvider>
 

hence, now entire app can access {token ,user, login ,logout,loading}.

*/