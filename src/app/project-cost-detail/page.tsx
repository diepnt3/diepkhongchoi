'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useExcelStore } from '@/store/useExcelStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useMemo } from 'react';
import { getAllProjectCosts } from '@/utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ProjectCostDetailPage() {
  const { excelData } = useExcelStore();
  const router = useRouter();

  useEffect(() => {
    if (excelData.length === 0) {
      router.push('/projects');
    }
  }, [excelData.length, router]);

  const chartData = useMemo(() => {
    if (excelData.length === 0) return null;
    return getAllProjectCosts(excelData);
  }, [excelData]);

  if (excelData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            Chưa có dữ liệu để hiển thị
          </p>
          <p className="text-sm text-gray-500">
            Đang chuyển hướng đến trang Quản lý dự án...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-gray-50">
      <div className="w-full max-w-[1800px] mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Chi phí dự án chi tiết
                </h1>
                <p className="text-gray-600">
                  Tổng số dự án: {chartData?.labels.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="relative w-full" style={{ minHeight: '600px' }}>
            <Bar
              data={{
                labels: chartData?.labels || [],
                datasets: [
                  {
                    label: "Dự kiến",
                    data: chartData?.budget || [],
                    backgroundColor: "#1E40AF",
                    borderColor: "#1E3A8A",
                    borderWidth: 1,
                    barThickness: 12,
                  },
                  {
                    label: "TT/TƯ",
                    data: chartData?.actual || [],
                    backgroundColor: "#10B981",
                    borderColor: "#059669",
                    borderWidth: 1,
                    barThickness: 12,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
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
      </div>
    </div>
  );
}

