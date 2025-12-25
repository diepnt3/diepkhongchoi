import { ExcelData } from "@/utils/interfaces";
import { useMemo } from "react";
import { getKPIStats, formatBillions } from "@/utils/helpers";

export default function KPICards({ data }: { data: ExcelData[] }) {
  const stats = useMemo(() => {
    if (data.length === 0) return null;
    return getKPIStats(data);
  }, [data]);

  if (!stats) return null;

  const cards = [
    {
      label: "Tổng dự án",
      value: stats.totalProjects,
      bgColor: "bg-blue-500",
      iconBg: "bg-blue-100",
    },
    {
      label: "Dự toán",
      value: formatBillions(stats.totalBudget * 1000000000) + "B",
      bgColor: "bg-blue-400",
      iconBg: "bg-blue-100",
    },
    {
      label: "Tổng số nhân sự",
      value: stats.totalPersonnel,
      bgColor: "bg-indigo-600",
      iconBg: "bg-blue-100",
    },
    {
      label: "Tỉ lệ đúng tiến độ",
      value: stats.onScheduleRate.toFixed(1) + "%",
      bgColor: "bg-blue-900",
      iconBg: "bg-blue-100",
    },
    {
      label: "Chi phí dự kiến",
      value: formatBillions(stats.estimatedCost * 1000000000) + "B",
      bgColor: "bg-indigo-400",
      iconBg: "bg-blue-100",
    },
  ];

  return (
    <div className="w-full flex flex-row gap-x-3">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`flex-1 ${card.bgColor} rounded-lg shadow-lg p-4 flex flex-row gap-x-2 items-center`}
        >
          {/* Icon */}
          <div className={`${card.iconBg} rounded-full p-3`}>
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <div className="flex flex-col items-start justify-center">
            {/* Label */}
            <p className="text-white text-sm font-medium text-center">
              {card.label}
            </p>

            {/* Value */}
            <p className="text-white text-3xl font-bold">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
