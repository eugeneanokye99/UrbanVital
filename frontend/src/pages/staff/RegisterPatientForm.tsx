import { useState } from "react";
import { toast } from "react-hot-toast";
import API from "../../services/api";
import ghFlag from "../../assets/ghana-flag.png";
import StaffNavbar from "../../components/StaffNavbar";
import StaffSidebar from "../../components/StaffSidebar";

import "./RegisterPatientForm.css";

export default function RegisterPatient() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    gender: "",
    contactperson: "",
    flags: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/auth/register/", form);
      toast.success(`${form.name} registered successfully`);
      setForm({
        name: "",
        phone: "",
        address: "",
        gender: "",
        contactperson: "",
        flags: "",
      });
    } catch {
      toast.error("Failed to register user");
    }
  };

  return (
    <div className="dashboard-container">
      <StaffSidebar />
      <div className="dashboard-main">
        <StaffNavbar />

        <div className="register-content">
          <h2 className="page-title">Patient Details</h2>

          <div className="patient-details-card">
            <form onSubmit={handleSubmit} className="patient-form">
              {/* MRN - Auto-generated */}
              <div className="form-field">
                <label className="field-label">MRN:</label>
                <div className="field-value">
                  UV-2025-
                  {Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(4, "0")}
                </div>
              </div>

              {/* Patient Name */}
              <div className="form-field icon-field">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className="field-input"
                  required
                />
              </div>

              {/* Phone */}
              <div className="form-field icon-field">
                <div className="phone-input-wrapper">
                  <img src={ghFlag} alt="Ghana" className="flag-icon" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="0546732719"
                    value={form.phone}
                    onChange={handleChange}
                    className="field-input phone-input"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="form-field icon-field">
                <input
                  type="text"
                  name="address"
                  placeholder="Adenta, Accra"
                  value={form.address}
                  onChange={handleChange}
                  className="field-input"
                  required
                />
              </div>



              {/* Contact Person */}
              <div className="form-field icon-field">
                <input
                  type="text"
                  name="contactperson"
                  placeholder="Contact Person"
                  value={form.contactperson}
                  onChange={handleChange}
                  className="field-input"
                  required
                />
              </div>

              {/* Flags */}
              <div className="form-field icon-field">
                <input
                  type="text"
                  name="flags"
                  placeholder="E.g. Malaria, Allergy"
                  value={form.flags}
                  onChange={handleChange}
                  className="field-input"
                />
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button type="submit" className="start-visit-btn">
                  Start New Visit
                </button>
              </div>
            </form>
          </div>

          {/* Back to List */}
          <button className="back-link" onClick={() => window.history.back()}>
            &lt; Back to list
          </button>
        </div>
      </div>
    </div>
  );
}
