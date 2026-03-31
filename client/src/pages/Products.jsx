import { useState, useEffect , useRef } from "react";
import {
  fetchProducts,
  deleteProduct,
  createProduct,
} from "../services/productService";



const Products = () => {
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  

  const [form, setForm] = useState({
    name: "",
    price: "",
    categoryId: "",
  });
  const [image, setImage] = useState(null);

  const loadProducts = async () => {
    const data = await fetchProducts();  // backend api call
    setProducts(data);
  };

 // eslint-disable-next-line react-hooks/exhaustive-deps 
useEffect(() => {
  loadProducts();
}, []); // use effect is saying to run once

  const handleDelete = async (id) => {
    await deleteProduct(id);
    await loadProducts();
  };


  // writing "NUMBER" keyword because input values are strings , copying the existing form coz it is possible that i  am changing only one field
  const handleAdd = async () => {
   try {

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("price", Number(form.price));
    formData.append("categoryId", Number(form.categoryId));

    if (image) {
      formData.append("image", image);
    }

    await createProduct(formData);

    setForm({
      name: "",
      price: "",
      categoryId: "",
    });

    setImage(null);
    if (fileInputRef.current) {
  fileInputRef.current.value = "";
}

      await loadProducts();  // so new products appears in screen easily.
    } catch (err) {
      console.log("Create error", err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Products</h2>

      {/*  ADD  product FORM */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">Add Product</h3>

 {/*   input container , form is a  useState on the top 
 below down it is saying take form , copy everything , update only name
 value is built in html attribute  used with <input>    - <input value="Hello" /
 placeholder is temp hint text that appears when the box is empty , value is the real data that went to that palceholder box>
 */}
        <div className="flex gap-2"> 
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="border p-2"
          />

          <input
            placeholder="Price"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
            className="border p-2"
          />

        <input
  type="file"
  accept="image/*"
  ref={fileInputRef}
  onChange={(e) => setImage(e.target.files[0])}
  className="border p-2"
/>

          <input
            placeholder="Category ID"
            value={form.categoryId}
            onChange={(e) =>
              setForm({ ...form, categoryId: e.target.value })
            }
            className="border p-2"
          />

          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4"
          >
            Add
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded p-4">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
               <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                
                <td>
  {p.image && (
    <img
      src={`http://localhost:3000${p.image}`}
      className="w-12 h-12 object-cover rounded"
    />
  )}
</td>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.stock}</td>
                <td>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-600 text-white px-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
