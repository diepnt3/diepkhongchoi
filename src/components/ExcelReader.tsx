'use client';

import { useState, useRef, useEffect } from 'react';
import { ExcelData } from '@/utils/interfaces';
import { readFile } from '@/utils/helpers';

interface ExcelReaderProps {
  onDataLoad?: (data: ExcelData[], headers: string[]) => void;
  initialHeaders?: string[];
}

export default function ExcelReader({ onDataLoad, initialHeaders = [] }: ExcelReaderProps) {
  const [headers, setHeaders] = useState<string[]>(initialHeaders);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialHeaders.length > 0) {
      setHeaders(initialHeaders);
    }
  }, [initialHeaders]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng file
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      alert('Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV');
      return;
    }

    setFileName(file.name);
    
    try {
      const { headers, data } = await readFile(file);
      setHeaders(headers);
      if (onDataLoad) {
        onDataLoad(data, headers);
      }
    } catch (error) {
      console.error('Lỗi khi đọc file:', error);
      alert('Có lỗi xảy ra khi đọc file. Vui lòng thử lại.');
      setFileName('');
    }
  };

  const handleReset = () => {
    setHeaders([]);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onDataLoad) {
      onDataLoad([], []);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {/* File Upload */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Chọn file Excel (.xlsx, .xls) hoặc CSV
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900 dark:file:text-blue-300
              dark:hover:file:bg-blue-800
              cursor-pointer"
          />
          {fileName && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Đã chọn: <span className="font-semibold">{fileName}</span>
            </p>
          )}
        </div>

        {/* Reset Button */}
        {headers.length > 0 && (
          <button
            onClick={handleReset}
            className="mb-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 
              transition-colors duration-200"
          >
            Xóa dữ liệu
          </button>
        )}

        {/* Empty State */}
        {headers.length === 0 && !fileName && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">Chưa có dữ liệu</p>
            <p className="text-sm mt-2">Vui lòng chọn file Excel để bắt đầu</p>
          </div>
        )}
    </div>
  );
}

