import { useState, useEffect } from "react";
import { Search, User, ChevronDown, Menu } from "lucide-react";
import { fetchUserProfile } from "../services/api";
import "./AdminNavbar.css";

interface AdminNavbarProps {
  onMenuClick?: () => void;
}

export default function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUserProfile()
      .then((data) => setUser(data))
      .catch(() => console.error("Failed to fetch user"));
  }, []);

  return (
    <nav className="admin-navbar">
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={onMenuClick}>
        <Menu size={24} />
      </button>

      {/* Search Bar */}
      <div className="navbar-search">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search here..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* User Profile */}
      <div className="navbar-user">
        <div className="user-avatar">
          <User size={20} />
        </div>
        <div className="user-info">
          <span className="user-name">
            {user ? user.username : "Dr. Kofi Asante"}
          </span>
          <span className="user-role">Admin</span>
        </div>
        <ChevronDown size={18} className="user-dropdown-icon" />
      </div>
    </nav>
  );
}