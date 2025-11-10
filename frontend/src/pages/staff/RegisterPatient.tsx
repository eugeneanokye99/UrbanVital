import { useState } from "react";
import { toast } from "react-hot-toast";
import API from "../../services/api";
import ghFlag from "../../assets/ghana-flag.png";
import StaffNavbar from "../../components/StaffNavbar";
import StaffSidebar from "../../components/StaffSidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {AccountSetting01Icon, AccountSetting02FreeIcons, AccountSetting03Icon, AccountSettingIcon, Doctor01Icon, LockPasswordIcon, Mail01FreeIcons, MailAccount02Icon, UserCircle02FreeIcons, ViewOffFreeIcons, ViewOffIcon, ViewOffSlashIcon, } from "@hugeicons/core-free-icons";
import "./RegisterPatient.css";
import { EyeClosedIcon } from "lucide-react";

export default function RegisterUser() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  {/* Handle form submission
    This is a mock up and should be replaced with actual API call --- For Eugene....*/}
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/auth/register/", form);
      toast.success(`${form.role} registered successfully`);
      setForm({ username: "", email: "", phone: "", password: "", role: "" });
    } catch {
      toast.error("Failed to register user");
    }
  };

  return (
    <div className="dashboard-container">
      <StaffSidebar />
      <div className="dashboard-main">
        <StaffNavbar />

        <div className="register-container">
          <h2 className="register-title">
            Register New Patient
          </h2>

          <form className="register-card" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="input-group">
              <HugeiconsIcon icon={UserCircle02FreeIcons} className="input-icon" size={25} />
              <input
                type="text"
                name="username"
                placeholder="Patient Name"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

              {/* Phone */}
            <div className="input-group phone-group">
              <img src={ghFlag} alt="Ghana Flag" className="flag-icon" />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="input-group">
              <HugeiconsIcon icon={MailAccount02Icon} className="input-icon" size={25} />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>



            {/* Role */}
            <div className="input-group select-group">
              <HugeiconsIcon icon={Doctor01Icon} className="input-icon absolute-icon" size={25} />
              <select name="role" value={form.role} onChange={handleChange} required>
                <option value="">Select your role</option>
                <option value="Clinician">Clinician</option>
                <option value="Lab">Lab</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Cashier">Cashier</option>
                <option value="Ultrasound">Ultrasound</option>
              </select>
            </div>


            {/* Password */}
            <div className="input-group">
              <HugeiconsIcon icon={LockPasswordIcon} className="input-icon" size={25} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Temporary Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              {showPassword ? (
                <HugeiconsIcon
                  icon={ViewOffSlashIcon}
                  className="toggle-password"
                  size={25}
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <HugeiconsIcon
                  icon={ViewOffIcon}
                  className="toggle-password"
                  size={25}
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            <button type="submit" className="submit-btn">
              SUBMIT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
