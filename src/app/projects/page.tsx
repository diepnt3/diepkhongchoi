"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import ExcelReader from "@/components/ExcelReader";
import { ExcelData, IProject } from "@/utils/interfaces";
import { deleteAllProjects, createProjects } from "@/utils/projectsApi";
import { mapExcelDataToProjects } from "@/utils/projectMapper";
import { useProjectStore } from "@/store/useProjectStore";
import { useShallow } from "zustand/react/shallow";
import { DEFAULT_LIMIT, DEFAULT_PAGE, Headers } from "@/utils/constants";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });
  const { projects, isLoading, total, totalPages, query, getProjects, reset } =
    useProjectStore(
      useShallow((state) => {
        return {
          projects: state.projects,
          isLoading: state.isLoading,
          total: state.total,
          totalPages: state.totalPages,
          query: state.query,
          getProjects: state.getProjects,
          reset: state.reset,
        };
      })
    );
  const [error, setError] = useState<string>("");

  const accessToken = session?.accessToken as string | undefined;

  useEffect(() => {
    if (accessToken) {
      getProjects();
    }
    return () => {
      reset();
    };
  }, [accessToken]);

  // Paginated data - đã được API xử lý
  const paginatedData = useMemo(() => {
    return projects;
  }, [projects]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      getProjects({ page });
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

      if (query?.page && query.page <= 3) {
        // Gần đầu: 1, 2, 3, 4, ..., last
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (query?.page && query.page >= totalPages - 2) {
        // Gần cuối: 1, ..., n-3, n-2, n-1, n
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Ở giữa: 1, ..., current-1, current, current+1, ..., last
        pages.push("...");
        for (let i = (query?.page ?? 1) - 1; i <= (query?.page ?? 1) + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Xử lý khi upload Excel xong
  const handleDataLoad = async (data: ExcelData[], newHeaders: string[]) => {
    console.log("data", data);
    console.log("newHeaders", newHeaders);
    if (!accessToken) {
      setError("Vui lòng đăng nhập để tiếp tục");
      return;
    }

    if (data.length === 0) {
      setError("File Excel không có dữ liệu");
      return;
    }

    setUploading(true);
    setError("");
    setUploadProgress({ current: 0, total: data.length });

    try {
      // 1. Map Excel data sang Project format
      const projectsToUpload = mapExcelDataToProjects(data);

      if (projectsToUpload.length === 0) {
        setError("Không thể map dữ liệu. Vui lòng kiểm tra định dạng file.");
        setUploading(false);
        return;
      }

      // 2. Xóa tất cả projects cũ
      await deleteAllProjects(accessToken);

      // 3. Upload từng project
      await createProjects(projectsToUpload, accessToken, (current, total) => {
        setUploadProgress({ current, total });
      });

      // 4. Refresh lại danh sách
      getProjects({ page: DEFAULT_PAGE });
    } catch (err: unknown) {
      console.error("Error uploading projects:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi upload dữ liệu. Vui lòng thử lại."
      );
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";

    if (typeof value === "number") {
      return value.toLocaleString("vi-VN");
    }

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Format date YYYY-MM-DD to DD/MM/YYYY
      const [year, month, day] = value.split("-");
      return `${day}/${month}/${year}`;
    }

    return String(value);
  };

  const getProjectValue = (project: IProject, header: string): unknown => {
    const projectKey = Object.keys(Headers).find(
      (key) => Headers[key as keyof typeof Headers] === header
    ) as keyof IProject | undefined;

    if (projectKey) {
      return project[projectKey] ?? "";
    }
    return (project as unknown as Record<string, unknown>)[header] ?? "";
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="shrink-0 p-4 pb-0">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            Quản lý Dự án
          </h1>
          <p className="text-gray-600 mb-6">
            Import dữ liệu từ file Excel để quản lý các dự án
          </p>
        </div>

        <div className="mb-4">
          <ExcelReader
            onDataLoad={handleDataLoad}
            disabled={uploading || isLoading}
          />
        </div>

        {/* Upload Progress */}
        {uploading && uploadProgress.total > 0 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                Đang upload dữ liệu...
              </span>
              <span className="text-sm text-blue-600">
                {uploadProgress.current} / {uploadProgress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (uploadProgress.current / uploadProgress.total) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && projects.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}

      {/* Projects Table */}
      {!isLoading && projects.length > 0 && (
        <div className="flex-1 flex flex-col overflow-hidden p-4 pt-0">
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full">
            {/* Header với thông tin phân trang */}
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-xl font-bold text-gray-800">
                Danh sách dự án ({total} dự án)
              </h2>
              <div className="text-sm text-gray-600">
                Trang {query?.page} / {totalPages} ({paginatedData.length} dòng)
              </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-auto w-full max-w-full flex-1 min-h-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {Object.values(Headers).map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b bg-gray-50 whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((project, rowIndex) => (
                    <tr
                      key={project.projectCode || rowIndex}
                      className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {Object.values(Headers).map((header, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b"
                        >
                          {formatCellValue(getProjectValue(project, header))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 shrink-0">
              <div className="text-sm text-gray-600">
                Hiển thị {((query?.page ?? 1) - 1) * DEFAULT_LIMIT + 1} -{" "}
                {Math.min(query?.page ?? 1 * DEFAULT_LIMIT, total)} trong tổng
                số {total} dự án
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(query?.page ?? 1 - 1)}
                  disabled={(query?.page ?? 1) === 1}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    query?.page ?? 1 === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Trước
                </button>

                {/* Số trang */}
                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 text-gray-500"
                        >
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          (query?.page ?? 1) === page
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
                  onClick={() => handlePageChange((query?.page ?? 1) + 1)}
                  disabled={(query?.page ?? 1) === totalPages}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    (query?.page ?? 1) === totalPages
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
