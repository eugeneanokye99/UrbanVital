interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }
  
  export default function DashboardCard({
    title,
    value,
    icon,
    color,
  }: DashboardCardProps) {
    return (
      <div className={`p-5 bg-white rounded-xl shadow-sm border-l-4 ${color}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-semibold">{value}</h3>
          </div>
          <div className="text-gray-400">{icon}</div>
        </div>
      </div>
    );
  }
  