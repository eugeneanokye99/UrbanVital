import React from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { HugeiconsIcon } from "@hugeicons/react";
import { TouchInteraction01FreeIcons } from "@hugeicons/core-free-icons";
import "./PatientsList.css";

export default function PatientsList() {
  const patients = Array.from({ length: 16 }, (_, i) => ({
    no: i + 1,
    mrn: `UV-2025-04${20 + i}`,
    name: "Williams Boampong",
    phone: "0546732719",
    flag: "Allergy",
  }));

  return (
    <div className="dashboard-container">
      <AdminSidebar />

      <div className="dashboard-main">
        <AdminNavbar />

        <div className="patients-container">
          <h2 className="patients-title">Patients List</h2>

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
                {patients.map((patient) => (
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
