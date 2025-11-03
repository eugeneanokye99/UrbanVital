import { useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../../services/api";

export default function RegisterUser() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "Clinician",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/auth/register/", form);
      toast.success(`${form.role} registered successfully`);
      setForm({ username: "", email: "", password: "", role: "Clinician" });
    } catch {
      toast.error("Failed to register user");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm max-w-lg mx-auto mt-10">
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
        <UserPlus size={20} /> Register New Staff
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          className="w-full p-2 border rounded-md"
          required
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border rounded-md"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full p-2 border rounded-md"
          required
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
        >
          <option>Clinician</option>
          <option>Lab</option>
          <option>Pharmacy</option>
          <option>Cashier</option>
          <option>Ultrasound</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}
