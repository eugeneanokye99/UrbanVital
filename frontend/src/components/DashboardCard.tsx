import React from "react";
import "./DashboardCard.css";

interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  subtitleColor?: string;
  icon: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  subtitleColor = "text-gray-500",
  icon,
  color = "bg-gray-100",
  onClick,
}) => {
  return (
    <div
      className={`dashboard-card ${onClick ? "dashboard-card-clickable" : ""}`}
      onClick={onClick}
    >
      <div className="dashboard-card-icon">
        {icon}
      </div>
      
      <div className="dashboard-card-content">
        <h3 className="dashboard-card-title">{title}</h3>
        <div className="dashboard-card-value">{value}</div>
        {subtitle && (
          <span className={`dashboard-card-subtitle ${subtitleColor}`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;