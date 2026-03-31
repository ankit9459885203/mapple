import { useEffect, useState } from "react"; // importing hooks
import { fetchUsers, deleteUser, createUser, updateUser } from "../services/userService";

const Users = () => {

  // states
  const [users, setUsers] = useState([]); // using state coz in UI user list can change when(added , deleted)
const [loading, setLoading] = useState(true); // show loader , if got data then show table , hence chnage happening in ui
  const [search, setSearch] = useState(""); // jo keyword likhna start kiya  , ui pr usi keyword se start hone vale names show ho jaayenge. hence ui is changing 
  // instead of  using normal form which refresh whole page on clicking submit, i am using react which provides useState and preventDefault
  // also we write name in this fields to create a user , so react need to store that in state otherwise it will forget what has typed, so using state.
  // check below down we are creating handle create function for react form handling
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone_number: ""
  });

  const [editingId, setEditingId] = useState(null); // changes done in user

  const [editData, setEditData] = useState({
    full_name: "",
    phone_number: ""
  });

  const [image, setImage] = useState(null);

  /* 
     🔹 API CALL: fetch all users from backend
     */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  // run once when page loads
  useEffect(() => {
    loadUsers();
  }, []);


  /* 
      go down the input section , we are using this function there to fill the fields in form
  */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  /* 
      form handling in react to prevent auto refresh when clicked on submit button.
  create new user , prevent page refresh. 

 */
 const handleCreate = async (e) => {
  e.preventDefault();

  // FRONTEND VALIDATION
  if (!form.full_name || !form.email || !form.password || !form.phone_number) {
    alert("All fields are required");
    return;
  }

  try {


    const formData = new FormData();

    formData.append("full_name", form.full_name);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("phone_number", form.phone_number);

    if (image) {
      formData.append("image", image);
    }


    await createUser(formData);

    // reset form after success
    setForm({
      full_name: "",
      email: "",
      password: "",
      phone_number: ""
    });

    setImage(null);
    loadUsers();

  } catch (err) {

    // duplicate email
    if (err.response?.status === 409) {
      alert("User already exists with this email");
    }

    // backend validation error
    else if (err.response?.status === 400) {
      alert(err.response.data.message || "Invalid data");
    }

    else {
      alert("Something went wrong");
      console.error(err);
    }
  }
};



  /* 
      delete user (soft delete) , show confirm popup , reload users
     */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete user?")) return;
    await deleteUser(id);
    loadUsers();
  };


  /* 
     start editing user
     */
  const startEdit = (u) => {
    setEditingId(u.id);

    setEditData({
      full_name: u.full_name,
      phone_number: u.phone_number || ""
    });
  };


  /* 
      save edited user
    */
  const handleSave = async (id) => {
    await updateUser(id, editData);
    setEditingId(null);
    loadUsers();
  };


  /* 
      loading screen
     */
  if (loading) return <p>Loading users...</p>;


  /* =========================================================
      MAIN UI
     ========================================================= */
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Users</h2>

      {/* 
           CREATE USER SECTION
         */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h3>Create User</h3>

        <form onSubmit={handleCreate} className="flex gap-2 flex-wrap">
          <input name="full_name" placeholder="Name" value={form.full_name} onChange={handleChange} className="border p-2"/>
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2"/>
          <input name="password" placeholder="Password" value={form.password} onChange={handleChange} className="border p-2"/>
          <input name="phone_number" placeholder="Phone" value={form.phone_number} onChange={handleChange} className="border p-2"/>

  {/* ✅ PROFILE IMAGE INPUT */}
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setImage(e.target.files[0])}
    className="border p-2"
  />

                
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Create
          </button>
        </form>
      </div>


      {/* 
           SEARCH SECTION
       */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>


      {/* 
          USERS TABLE
          */}
      <div className="bg-white shadow rounded p-4">
        <table className="w-full">

          {/* TABLE HEADER */}
          <thead>
            <tr className="border-b text-left">
              <th>Image</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody>
            {users
              //  search filter logic , .filter or .map  k piche users lgaa hia in this syntax
              .filter((u) =>
                (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
                (u.email || "").toLowerCase().includes(search.toLowerCase())
              )
              .map((u) => (
                <tr key={u.id} className="border-b">


 <td>
  {u.profile_image_url && (
    <img
      src={`http://localhost:3000${u.profile_image_url}`}
      className="w-10 h-10 rounded-full object-cover"
      alt="profile"
    />
  )}
</td>

                  {/* edit mode ui , NAME COLUMN */}
                  <td>
                    {editingId === u.id ? (
                      <input
                        value={editData.full_name}
                        onChange={(e) =>
                          setEditData({ ...editData, full_name: e.target.value })
                        }
                        className="border p-1"
                      />
                    ) : (
                      u.full_name
                    )}
                  </td>

                  {/* EMAIL COLUMN */}
                  <td>{u.email}</td>

                  {/* PHONE COLUMN */}
                  <td>
                    {editingId === u.id ? (
                      <input
                        value={editData.phone_number}
                        onChange={(e) =>
                          setEditData({ ...editData, phone_number: e.target.value })
                        }
                        className="border p-1"
                      />
                    ) : (
                      u.phone_number
                    )}
                  </td>

                  {/* ROLE COLUMN */}
                  <td>{u.role}</td>

                  {/* ACTION BUTTONS */}
                  <td className="flex gap-2">
                    {u.role !== "ADMIN" && (
                      <>
                        {editingId === u.id ? (
                          <button
                            onClick={() => handleSave(u.id)}
                            className="bg-green-600 text-white px-2 py-1 rounded"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(u)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                          >
                            Edit
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(u.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
