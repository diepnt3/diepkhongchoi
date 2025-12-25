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
import { getAllProjectCompletionRate } from '@/utils/helpers';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

export default function ProjectCompletionDetailPage() {
  const { excelData } = useExcelStore();
  const router = useRouter();

  useEffect(() => {
    if (excelData.length === 0) {
      router.push('/projects');
    }
  }, [excelData.length, router]);

  const chartData = useMemo(() => {
    if (excelData.length === 0) return null;
    return getAllProjectCompletionRate(excelData);
  }, [excelData]);

  const { ganttData, minDate, maxDate, barColors, borderColors, currentDatePosition } = useMemo(() => {
    if (!chartData || chartData.startDates.length === 0) {
      return { ganttData: [], minDate: Date.now(), maxDate: Date.now(), barColors: [], borderColors: [], currentDatePosition: 0 };
    }
    
    const allDates = [...chartData.startDates, ...chartData.endDates];
    const min = Math.min(...allDates);
    const max = Math.max(...allDates);
    const padding = (max - min) * 0.1;
    const minDate = min - padding;
    const maxDate = max + padding;
    const currentDate = Date.now();
    
    const ganttData = chartData.startDates.map((start, index) => {
      const end = chartData.endDates[index];
      const duration = end - start;
      const offset = start - minDate;
      return {
        duration,
        offset,
        start,
        end,
      };
    });
    
    // Calculate colors based on whether project is overdue
    const barColors = ganttData.map(d => {
      return d.end < currentDate ? "#ef4444" : "#3B82F6"; // Orange if overdue, blue otherwise
    });
    
    const borderColors = ganttData.map(d => {
      return d.end < currentDate ? "#ef4444" : "#2563EB"; // Darker orange if overdue, darker blue otherwise
    });
    
    // Calculate position of current date line
    const currentDatePosition = currentDate - minDate;
    
    return { ganttData, minDate, maxDate, barColors, borderColors, currentDatePosition };
  }, [chartData]);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    return `${month}/${year}`;
  };

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
                  Tỉ lệ hoàn thành dự án chi tiết
                </h1>
                <p className="text-gray-600">
                  Tổng số dự án: {chartData?.labels.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="relative w-full" style={{ minHeight: `${Math.max(600, (chartData?.labels.length || 0) * 30)}px` }}>
            <Bar
              data={{
                labels: chartData?.labels || [],
                datasets: [
                  {
                    label: "Offset",
                    data: ganttData.map(d => d.offset),
                    backgroundColor: "transparent",
                    borderWidth: 0,
                    barThickness: 18,
                  },
                  {
                    label: "Thời gian dự án",
                    data: ganttData.map(d => d.duration),
                    backgroundColor: barColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    barThickness: 18,
                  },
                ],
              }}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    filter: function (tooltipItem) {
                      return tooltipItem.datasetIndex === 1;
                    },
                    callbacks: {
                      label: function (context) {
                        const index = context.dataIndex;
                        const data = ganttData[index];
                        if (data) {
                          const start = formatDate(data.start);
                          const end = formatDate(data.end);
                          return `Từ ${start} đến ${end}`;
                        }
                        return '';
                      },
                    },
                  },
                  annotation: {
                    annotations: {
                      currentDateLine: {
                        type: 'line',
                        xMin: currentDatePosition,
                        xMax: currentDatePosition,
                        borderColor: '#EF4444',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        label: {
                          display: true,
                          content: '',
                          position: 'end',
                          backgroundColor: '#EF4444',
                          color: '#FFFFFF',
                          font: {
                            size: 11,
                            weight: 'bold',
                          },
                          padding: {
                            x: 6,
                            y: 4,
                          },
                        },
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    stacked: true,
                    min: 0,
                    max: maxDate - minDate,
                    ticks: {
                      stepSize: (maxDate - minDate) / 6,
                      callback: function (value) {
                        const dateValue = minDate + Number(value);
                        return formatDate(dateValue);
                      },
                    },
                  },
                  y: {
                    stacked: true,
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