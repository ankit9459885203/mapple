import axios from "axios"; // instead of fetch we are using axios

// to autoattach  the  token to api

export const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
});

// attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");  // token was stored in local storage  , see login.jsx file.

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});



/*
What this file is doing (big picture)

You are creating a custom axios instance that:
Always calls your backend base URL ,Automatically attaches JWT token  ,Saves you from writing headers again and again

So instead of doing this below code everywhere:

axios.get("http://localhost:3000/api/v1/products", {
  headers: { Authorization: "Bearer token" }
});


You just do:

api.get("/products");
*/