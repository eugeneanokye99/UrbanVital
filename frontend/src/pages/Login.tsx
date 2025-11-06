import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import toast from "react-hot-toast";
import { FiMail, FiLock } from "react-icons/fi";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(form);
      navigate("/admin");
    } catch (error) {
      toast.error("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left section - Doctor image inside circular ECG background */}
      <div className="login-left">
        <div className="circle-wrapper">
          <div className="circle-bg">
            <img src="/images/ecg-line.png" alt="ECG Line" className="ecg-line" />
          </div>
          <img src="/images/doctor.png" alt="Doctor" className="doctor-img" />
        </div>
      </div>

      {/* Right section - Login form */}
      <div className="login-right">
        <div className="login-box">
          <img src="/images/urbanvital-logo.png" alt="UrbanVital Logo" className="logo" />
          <h3 className="welcome-text">
            Welcome back to <strong>UrbanVital Health Consult</strong>,
            <p>Manage patients, labs, and pharmacy fast.</p>
          </h3>
       

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                type="text"
                name="username"
                placeholder="Enter your email"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span
                className="toggle-pass"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="login-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-link">Forgotten password?</a>
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="help-text">
            Need help? Contact IT via email at: <strong>urbanvitalsupport@gmail.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
}