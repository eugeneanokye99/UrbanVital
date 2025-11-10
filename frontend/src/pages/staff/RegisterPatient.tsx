import { useState } from "react";
import { toast } from "react-hot-toast";
import API from "../../services/api";
import ghFlag from "../../assets/ghana-flag.png";
import StaffNavbar from "../../components/StaffNavbar";
import StaffSidebar from "../../components/StaffSidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {AccountSetting01Icon, AccountSetting02FreeIcons, AccountSetting03Icon, AccountSettingIcon, Contact01FreeIcons, Doctor01Icon, Flag01FreeIcons, LockPasswordIcon, Mail01FreeIcons, MailAccount02Icon, MapPinFreeIcons, MapsCircle01FreeIcons, MapsLocation01FreeIcons, ThreeDMoveFreeIcons, UserCircle02FreeIcons, ViewOffFreeIcons, ViewOffIcon, ViewOffSlashIcon, } from "@hugeicons/core-free-icons";
import "./RegisterPatient.css";
import { EyeClosedIcon } from "lucide-react";

export default function RegisterUser() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    gender: "",
    contactperson: "",
    flags: "",
  });

 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  {/* Handle form submission
    This is a mock up and should be replaced with actual API call --- For Eugene....*/}
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/auth/register/", form);
      toast.success(`${form.name} registered successfully`);
      setForm({ name: "", phone: "", address: "", gender: "", contactperson: "", flags: "" });
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
                value={form.name}
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

            {/* Address */}
            <div className="input-group">
              <HugeiconsIcon icon={MapsLocation01FreeIcons} className="input-icon" size={25} />
              <input
                type="address"
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

             {/*Gender*/}
            <div className="input-group select-group">
              <HugeiconsIcon icon={ThreeDMoveFreeIcons} className="input-icon absolute-icon" size={25} />
              <select name="role" value={form.gender} onChange={handleChange} required>
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>


            {/* Contact Person */}
            <div className="input-group">
              <HugeiconsIcon icon={Contact01FreeIcons} className="input-icon" size={25} />
              <input
                type="text"
                name="contact_person"
                placeholder="Contact Person"
                value={form.contactperson}
                onChange={handleChange}
                required
              />
            </div>

            {/* Flags */}
            <div className="input-group">
              <HugeiconsIcon icon={Flag01FreeIcons} className="input-icon" size={25} />
              <input
                type="text"
                name="flags"
                placeholder="Flags (e.g., Allergies, Chronic Conditions)"
                value={form.flags}
                onChange={handleChange}
              />
            </div> 




            <button type="submit" className="submit-btn">
              SAVE & CONTINUE
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
