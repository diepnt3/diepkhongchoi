import { ExcelData } from "@/utils/interfaces";
import { useMemo } from "react";
import { formatBillions, getTotalValueByInvestor } from "@/utils/helpers";
import { Doughnut } from "react-chartjs-2";

export default function TotalValueByInvestorChart({
  data,
}: {
  data: ExcelData[];
}) {
  const chart2Data = useMemo(() => {
    if (data.length === 0) return null;
    return getTotalValueByInvestor(data);
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

  const total = chart2Data?.values.reduce((a, b) => a + b, 0) || 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-5">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Tổng giá trị dự án
      </h3>
      <div className="flex flex-row gap-2" style={{ height: '280px' }}>
        {/* Chart - 60% */}
        <div className="relative w-[60%]">
          <Doughnut
            data={{
              labels: chart2Data?.labels || [],
              datasets: [
                {
                  label: "Tổng giá trị",
                  data: chart2Data?.values || [],
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
                      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                      // Format value in billions
                      const valueInBillions = formatBillions(value);
                      return `${label}: ${valueInBillions}B (${percentage}%)`;
                    },
                  },
                },
              },
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-base font-bold text-gray-700">
              Tổng giá trị
            </p>
            <p className="text-2xl font-bold text-black">
              {total > 0 ? formatBillions(total) + "B" : "0"}
            </p>
          </div>
        </div>

        {/* Legend - 40% */}
        <div className="w-[40%] overflow-y-auto">
          <div className="flex flex-col justify-center gap-1 h-full">
            {chart2Data?.labels.map((label, index) => {
              const value = chart2Data.values[index];
              const valueInBillions = formatBillions(value);
              return (
                <div key={index} className="flex items-center gap-2 bg-gray-100 p-1 rounded-md w-fit">
                  <div
                    className="w-4 h-4 rounded shrink-0"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-[16px] font-medium text-gray-800 truncate">
                      {label}: {valueInBillions}B
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

