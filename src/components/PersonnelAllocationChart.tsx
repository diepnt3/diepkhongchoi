import { ExcelData } from "@/utils/interfaces";
import { useMemo } from "react";
import { getPersonnelAllocation } from "@/utils/helpers";
import { Bar } from "react-chartjs-2";

export default function PersonnelAllocationChart({
  data,
}: {
  data: ExcelData[];
}) {
  const chartData = useMemo(() => {
    if (data.length === 0) return null;
    return getPersonnelAllocation(data);
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-5">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Phân bổ nhân sự
      </h3>
      <div className="relative w-full" style={{ height: '360px' }}>
        <Bar
          data={{
            labels: chartData?.labels || [],
            datasets: [
              {
                label: "Số dự án",
                data: chartData?.values || [],
                backgroundColor: "#3B82F6", // blue
                borderColor: "#2563EB",
                borderWidth: 1,
                barThickness: 18,
              },
            ],
          }}
          options={{
            indexAxis: 'y', // Horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const value = context.parsed.x || 0;
                    return `${value} dự án`;
                  },
                },
              },
            },
            scales: {
              x: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

