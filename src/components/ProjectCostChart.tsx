'use client';

import { ExcelData } from "@/utils/interfaces";
import { useMemo } from "react";
import { getProjectCosts } from "@/utils/helpers";
import { Bar } from "react-chartjs-2";
import { useRouter } from "next/navigation";

export default function ProjectCostChart({
  data,
}: {
  data: ExcelData[];
}) {
  const router = useRouter();
  const chart3Data = useMemo(() => {
    if (data.length === 0) return null;
    return getProjectCosts(data);
  }, [data]);

  const handleChartClick = () => {
    router.push('/project-cost-detail');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-5 cursor-pointer hover:shadow-xl transition-shadow duration-200" onClick={handleChartClick}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          Tỷ lệ thanh toán
        </h3>
        <span className="text-sm font-semibold text-blue-600 hover:text-blue-800">Xem chi tiết →</span>
      </div>
      <div className="relative w-full" style={{ height: '280px' }}>
        <Bar
          data={{
            labels: chart3Data?.labels || [],
            datasets: [
              {
                label: "Dự kiến",
                data: chart3Data?.budget || [],
                backgroundColor: "#1E40AF", // dark blue
                borderColor: "#1E3A8A",
                borderWidth: 1,
                barThickness: 12,
              },
              {
                label: "TT/TƯ",
                data: chart3Data?.actual || [],
                backgroundColor: "#10B981", // light green
                borderColor: "#059669",
                borderWidth: 1,
                barThickness: 12,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            onClick: handleChartClick,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 15,
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const value = context.parsed.y || 0;
                    // Value is already in billions
                    const formatted = parseFloat(value.toFixed(2)).toString();
                    return `${context.dataset.label}: ${formatted}B VND`;
                  },
                },
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function (value) {
                    // Value is already in billions, format it
                    const numValue = Number(value);
                    const formatted = parseFloat(numValue.toFixed(2)).toString();
                    return formatted + "B";
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

