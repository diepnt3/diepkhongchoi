'use client';

import { ExcelData } from "@/utils/interfaces";
import { useMemo } from "react";
import { getProjectCompletionRate } from "@/utils/helpers";
import { Bar } from "react-chartjs-2";
import { useRouter } from "next/navigation";
import { Chart as ChartJS } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register the annotation plugin
ChartJS.register(annotationPlugin);

export default function ProjectCompletionChart({
  data,
}: {
  data: ExcelData[];
}) {
  const router = useRouter();
  const chartData = useMemo(() => {
    if (data.length === 0) return null;
    return getProjectCompletionRate(data);
  }, [data]);

  // Calculate data for Gantt chart: duration and offset from min date
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
      const duration = end - start; // Duration in milliseconds
      const offset = start - minDate; // Offset from min date
      return {
        duration,
        offset,
        start,
        end,
      };
    });
    
    // Calculate colors based on whether project is overdue
    const barColors = ganttData.map(d => {
      return d.end < currentDate ? "#ef4444" : "#1e40af"; // Orange if overdue, blue otherwise
    });
    
    const borderColors = ganttData.map(d => {
      return d.end < currentDate ? "#ef4444" : "#1e40af"; // Darker orange if overdue, darker blue otherwise
    });
    
    // Calculate position of current date line
    const currentDatePosition = currentDate - minDate;
    
    return { ganttData, minDate, maxDate, barColors, borderColors, currentDatePosition };
  }, [chartData]);

  // Format date for display
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    // Use UTC methods since dates are stored as UTC
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    return `${month}/${year}`;
  };

  const handleChartClick = () => {
    router.push('/project-completion-detail');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-5 cursor-pointer hover:shadow-xl transition-shadow duration-200" onClick={handleChartClick}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          Tỉ lệ hoàn thành dự án
        </h3>
        <span className="text-sm font-semibold text-blue-600 hover:text-blue-800">Xem chi tiết →</span>
      </div>
      <div className="relative w-full" style={{ height: '360px' }}>
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
            indexAxis: 'y', // Horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            onClick: handleChartClick,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                filter: function (tooltipItem) {
                  return tooltipItem.datasetIndex === 1; // Only show tooltip for the second dataset
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
  );
}