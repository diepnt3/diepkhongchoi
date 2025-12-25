import { ExcelData } from "@/utils/interfaces";
import { useMemo } from "react";
import { getProjectsByInvestor } from "@/utils/helpers";
import { Doughnut } from "react-chartjs-2";

export default function ProjectsByInvestorChart({
  data,
}: {
  data: ExcelData[];
}) {
  const chart1Data = useMemo(() => {
    if (data.length === 0) return null;
    return getProjectsByInvestor(data);
  }, [data]);

  const colors = [
    "#3B82F6", // blue
    "#10B981", // light green
    "#8B5CF6", // purple
    "#1E40AF", // dark blue
    "#F59E0B", // orange
    "#EF4444", // red
    "#FBBF24", // yellow
    "#06B6D4", // cyan
    "#EC4899", // pink
    "#6366F1", // indigo
    "#14B8A6", // teal
    "#84CC16", // lime
    "#F97316", // orange-red
    "#A855F7", // violet
    "#22C55E", // emerald
    "#EAB308", // amber
    "#0EA5E9", // sky blue
    "#F43F5E", // rose
    "#9333EA", // purple-600
    "#16A34A", // green-600
  ];

  const total = chart1Data?.values.reduce((a, b) => a + b, 0) || 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-5">
      <h3 className="text-xl font-bold mb-4 text-gray-800 ">
        Dự án theo chủ đầu tư
      </h3>
      <div className="flex flex-row gap-2" style={{ height: '280px' }}>
        {/* Chart - 60% */}
        <div className="relative w-[60%]">
          <Doughnut
            data={{
              labels: chart1Data?.labels || [],
              datasets: [
                {
                  label: "Số lượng dự án",
                  data: chart1Data?.values || [],
                  backgroundColor: colors,
                  borderWidth: 1,
                  borderColor: "#fff",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '75%',
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const label = context.label || "";
                      const value = context.parsed || 0;
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ${value} (${percentage}%)`;
                    },
                  },
                },
              },
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-base font-bold text-gray-700 whitespace-nowrap">
              Số lượng dự án
            </p>
            <p className="text-2xl font-bold text-black">
              {total}
            </p>
          </div>
        </div>

        {/* Legend - 40% */}
        <div className="w-[40%] overflow-y-auto">
          <div className="flex flex-col justify-center gap-1 h-full">
            {chart1Data?.labels.map((label, index) => {
              return (
                <div key={index} className="flex items-center gap-2 bg-gray-100 p-1 rounded-md w-fit">
                  <div
                    className="w-4 h-4 rounded shrink-0"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-[16px] font-medium text-gray-800 truncate">
                      {label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
