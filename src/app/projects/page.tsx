"use client";

import { useState, useEffect, useMemo } from "react";
import ExcelReader from "@/components/ExcelReader";
import { useExcelStore } from "@/store/useExcelStore";
import { ExcelData } from "@/utils/interfaces";

const ITEMS_PER_PAGE = 10;

export default function ProjectsPage() {
  const { excelData, headers, setExcelData, clearExcelData } = useExcelStore();
  const [localHeaders, setLocalHeaders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLocalHeaders(headers);
  }, [headers]);

  useEffect(() => {
    // Reset về trang 1 khi dữ liệu thay đổi
    setCurrentPage(1);
  }, [excelData.length]);

  // Tính toán phân trang
  const totalPages = useMemo(() => {
    return Math.ceil(excelData.length / ITEMS_PER_PAGE);
  }, [excelData.length]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return excelData.slice(startIndex, endIndex);
  }, [excelData, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Tính toán các số trang cần hiển thị
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Nếu tổng số trang <= 7, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu
      pages.push(1);

      if (currentPage <= 3) {
        // Gần đầu: 1, 2, 3, 4, ..., last
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Gần cuối: 1, ..., n-3, n-2, n-1, n
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Ở giữa: 1, ..., current-1, current, current+1, ..., last
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleDataLoad = (data: ExcelData[], newHeaders: string[]) => {
    setExcelData(data, newHeaders);
    setLocalHeaders(newHeaders);
  };

  const handleReset = () => {
    clearExcelData();
    setLocalHeaders([]);
  };

  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";

    if (typeof value === "number") {
      if (value > 25569 && value < 73415) {
        // Excel epoch: 30/12/1899, nhưng Excel có bug với năm 1900
        // Nên dùng 31/12/1899 và trừ 1 cho ngày >= 60
        const utcDays = value - 25569; // 25569 = số ngày từ 30/12/1899 đến 1/1/1970
        const date = new Date(utcDays * 86400 * 1000);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
      }
      return value.toLocaleString("vi-VN");
    }
    return String(value);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="shrink-0 p-4 pb-0">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Quản lý Dự án</h1>
          <p className="text-gray-600 mb-6">
            Import dữ liệu từ file Excel để quản lý các dự án
          </p>
        </div>

        {excelData.length === 0 && (
          <div className="mb-4">
            <ExcelReader onDataLoad={handleDataLoad} initialHeaders={headers} />
          </div>
        )}
      </div>

      {excelData.length > 0 && (
        <div className="flex-1 flex flex-col overflow-hidden p-4 pt-0">
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full">
            {/* Header với thông tin phân trang */}
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-xl font-bold text-gray-800">
                Dữ liệu đã import ({excelData.length} dòng)
              </h2>
              <div className="text-sm text-gray-600">
                Trang {currentPage} / {totalPages} ({paginatedData.length} dòng)
              </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-auto w-full max-w-full flex-1 min-h-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {localHeaders.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b bg-gray-50"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((row, rowIndex) => {
                    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + rowIndex;
                    return (
                      <tr
                        key={globalIndex}
                        className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        {localHeaders.map((header, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b"
                          >
                            {formatCellValue(row[header])}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 shrink-0">
              <div className="text-sm text-gray-600">
                Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, excelData.length)} trong tổng số {excelData.length} dòng
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  Trước
                </button>

                {/* Số trang */}
                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
