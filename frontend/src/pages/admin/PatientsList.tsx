import React, { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterAddFreeIcons, Search01FreeIcons, TouchInteraction01FreeIcons } from "@hugeicons/core-free-icons";
import "./PatientsList.css";

export default function PatientsList() {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  
  const patients = Array.from({ length: 16 }, (_, i) => ({
    no: i + 1,
    mrn: `UV-2025-04${20 + i}`,
    name: "Williams Boampong",
    phone: "0546732719",
    flag: "Allergy",
  }));


    const filteredPatients = patients.filter(
    (p) =>
      (filter === "All" || p.flag === filter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.mrn.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="dashboard-container">
      <AdminSidebar />

      <div className="dashboard-main">
        <AdminNavbar />

        <div className="patients-container">
          <h2 className="patients-title">Patients List</h2>


                    {/* Search and Filter */}
          <div className="patients-controls">
            <div className="search-bar">
              <HugeiconsIcon icon={Search01FreeIcons} size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search patient by name or MRN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-dropdown">
              <HugeiconsIcon
                icon={FilterAddFreeIcons}
                size={18}
                className="filter-icon"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Allergy">Allergy</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Hypertension">Hypertension</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>MRN</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Flags</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>

                {filteredPatients.map((patient) => (
                  <tr key={patient.no}>
                    <td>{patient.no}</td>
                    <td>{patient.mrn}</td>
                    <td>{patient.name}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.flag}</td>
                    <td className="action-btn">
                      <HugeiconsIcon icon={TouchInteraction01FreeIcons} size={18} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
