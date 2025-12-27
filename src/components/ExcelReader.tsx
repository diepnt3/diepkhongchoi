"use client";

import { useState, useRef, useEffect } from "react";
import { ExcelData } from "@/utils/interfaces";
import { readFile } from "@/utils/helpers";

interface ExcelReaderProps {
  onDataLoad?: (data: ExcelData[], headers: string[]) => void;
  disabled?: boolean;
}

export default function ExcelReader({
  onDataLoad,
  disabled = false,
}: ExcelReaderProps) {
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng file
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      alert("Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV");
      return;
    }

    setFileName(file.name);

    try {
      const { headers, data } = await readFile(file);
      if (onDataLoad) {
        onDataLoad(data, headers);
      }
    } catch (error) {
      console.error("Lỗi khi đọc file:", error);
      alert("Có lỗi xảy ra khi đọc file. Vui lòng thử lại.");
      setFileName("");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Chọn file Excel (.xlsx, .xls) hoặc CSV
      </label>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        disabled={disabled}
        className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900 dark:file:text-blue-300
              dark:hover:file:bg-blue-800
              cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {fileName && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Đã chọn: <span className="font-semibold">{fileName}</span>
        </p>
      )}
    </div>
  );
}
