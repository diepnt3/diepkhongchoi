import { create } from 'zustand';
import { ExcelData } from '@/utils/interfaces';

interface ExcelStore {
  excelData: ExcelData[];
  headers: string[];
  setExcelData: (data: ExcelData[], headers: string[]) => void;
  clearExcelData: () => void;
}

export const useExcelStore = create<ExcelStore>((set) => ({
  excelData: [],
  headers: [],
  setExcelData: (data, headers) => set({ excelData: data, headers }),
  clearExcelData: () => set({ excelData: [], headers: [] }),
}));

