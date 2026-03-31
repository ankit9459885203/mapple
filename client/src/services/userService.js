import { api } from "./api";

// get all users
export const fetchUsers = async () => {
  const res = await api.get("/users/getAllUsers");
  return res.data.users;
};

// delete user (soft delete)
export const deleteUser = async (id) => {
  const res = await api.delete(`/users/softDeleteUser/${id}`);
  return res.data;
};

// create user
export const createUser = async (userData) => {
  const res = await api.post("/auth/signup", userData);
  return res.data;
};


// update user
export const updateUser = async (id, data) => {
  const res = await api.put(`/users/updateUser/${id}`, data);
  return res.data;
};
