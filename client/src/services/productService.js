import { api } from "./api";

// get all products
export const fetchProducts = async () => {
  const res = await api.get("/product/getAllProducts");
  return res.data.products;
};

// soft delete
export const deleteProduct = async (id) => {
  const res = await api.delete(`/product/softDelete/${id}`);
  return res.data;
};

// create product
export const createProduct = async (data) => {
  const res = await api.post("/product/createProducts", data);
  return res.data;
};




