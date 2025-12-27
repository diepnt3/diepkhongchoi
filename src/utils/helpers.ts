import * as XLSX from "xlsx";
import { ExcelData, IProject } from "./interfaces";

// Helper function to parse Vietnamese number format (e.g., "147.000.000.000" -> 147000000000)
export const parseVietnameseNumber = (value: unknown): number => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;

  const str = String(value).trim();
  // Remove dots (thousands separator) and commas, then parse
  const cleaned = str.replace(/\./g, "").replace(/,/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const readSheet = (
  workbook: XLSX.WorkBook,
  sheetName: string
): {
  headers: string[];
  data: ExcelData[];
} => {
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<ExcelData>(worksheet);

  if (!jsonData || jsonData.length === 0) {
    return { headers: [], data: [] };
  }

  const headers = Object.keys(jsonData[0] || {});
  return { headers, data: jsonData };
};

export const readFile = (
  file: File
): Promise<{
  headers: string[];
  data: ExcelData[];
  sheetNames: string[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error("Không thể đọc file"));
          return;
        }

        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetNames = workbook.SheetNames;

        if (sheetNames.length === 0) {
          reject(new Error("File không chứa sheet nào"));
          return;
        }

        // Đọc sheet đầu tiên
        const { headers, data } = readSheet(workbook, sheetNames[0]);
        resolve({ headers, data, sheetNames });
      } catch (error) {
        console.error("Lỗi khi đọc file:", error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Lỗi khi đọc file"));
    };

    reader.readAsArrayBuffer(file);
  });
};

// Chart 1: Projects by investor (count projects)
export const getProjectsByInvestor = (
  data: ExcelData[]
): { labels: string[]; values: number[] } => {
  const investorCounts: { [key: string]: number } = {};

  data.forEach((row) => {
    const investor = row.investor;
    if (investor) {
      const investorStr = String(investor).trim();
      if (investorStr) {
        investorCounts[investorStr] = (investorCounts[investorStr] || 0) + 1;
      }
    }
  });

  const labels = Object.keys(investorCounts);
  const values = labels.map((label) => investorCounts[label]);

  return { labels, values };
};

// Chart 2: Total project value by investor
export const getTotalValueByInvestor = (
  data: ExcelData[]
): { labels: string[]; values: number[] } => {
  const investorValues: { [key: string]: number } = {};

  data.forEach((row) => {
    const investor = row.investor;
    const contractValue = parseVietnameseNumber(row.contractValue);

    if (investor && contractValue > 0) {
      const investorStr = String(investor).trim();
      if (investorStr) {
        investorValues[investorStr] =
          (investorValues[investorStr] || 0) + contractValue;
      }
    }
  });

  const labels = Object.keys(investorValues);
  const values = labels.map((label) => investorValues[label]);

  return { labels, values };
};

// Chart 3: Project cost chart (Budget vs Actual Cost)
export const getProjectCosts = (
  data: ExcelData[]
): {
  labels: string[];
  budget: number[];
  actual: number[];
} => {
  const projectData: Array<{
    projectCode: string;
    budget: number;
    actual: number;
  }> = [];

  data.forEach((row) => {
    const projectCode = row.shortName;
    const budgetVND = parseVietnameseNumber(row.contractValue);
    const actualVND = parseVietnameseNumber(row.executedValue);

    // Convert to billions (tỷ)
    const budget = budgetVND / 1000000000;
    const actual = actualVND / 1000000000;
    console.log("budget", budget, "actual", actual);
    if (projectCode && (budget > 0 || actual > 0)) {
      projectData.push({
        projectCode: String(projectCode).trim(),
        budget,
        actual,
      });
    }
  });

  // Limit to top 10 projects by budget for better visualization
  const sortedProjects = projectData
    .sort((a, b) => b.budget - a.budget)
    .slice(0, 10);

  const labels = sortedProjects.map((p) => p.projectCode);
  const budget = sortedProjects.map((p) => p.budget);
  const actual = sortedProjects.map((p) => p.actual);

  return { labels, budget, actual };
};

// Get all project costs (no limit) for detail page
export const getAllProjectCosts = (
  data: ExcelData[]
): {
  labels: string[];
  budget: number[];
  actual: number[];
} => {
  const projectData: Array<{
    projectCode: string;
    budget: number;
    actual: number;
  }> = [];

  data.forEach((row) => {
    const projectCode = row.shortName;
    const budgetVND = parseVietnameseNumber(row.contractValue);
    const actualVND = parseVietnameseNumber(row.executedValue);

    // Convert to billions (tỷ)
    const budget = budgetVND / 1000000000;
    const actual = actualVND / 1000000000;

    if (projectCode && (budget > 0 || actual > 0)) {
      projectData.push({
        projectCode: String(projectCode).trim(),
        budget,
        actual,
      });
    }
  });

  // Sort by budget (descending) but don't limit
  const sortedProjects = projectData.sort((a, b) => b.budget - a.budget);

  const labels = sortedProjects.map((p) => p.projectCode);
  const budget = sortedProjects.map((p) => p.budget);
  const actual = sortedProjects.map((p) => p.actual);

  return { labels, budget, actual };
};

export const classNames = (...classes: string[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Format billions: remove trailing zeros if no decimal part
export const formatBillions = (value: number): string => {
  const billions = value / 1000000000;
  const formatted = billions.toFixed(2);
  // Remove trailing zeros and decimal point if not needed
  return parseFloat(formatted).toString();
};

export const parseVietnameseDate = (value: unknown): Date | null => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
  }
  return null;
};

// Chart 4: Project completion rate - Gantt chart
export const getProjectCompletionRate = (
  data: ExcelData[]
): {
  labels: string[];
  startDates: number[];
  endDates: number[];
} => {
  const projectData: Array<{
    projectCode: string;
    startDate: Date;
    endDate: Date;
    completionRate: number;
  }> = [];

  data.forEach((row) => {
    const projectCode = row.shortName;
    const startDateStr = row.startDate;
    const endDateStr = row.expectedEndDate;
    const completionRate = parseVietnameseNumber(row.completionPercentage);

    if (projectCode && startDateStr) {
      const startDate = parseVietnameseDate(startDateStr);
      const endDateExpected = parseVietnameseDate(endDateStr);

      if (startDate) {
        let endDate: Date;
        if (endDateExpected && completionRate >= 0 && completionRate <= 100) {
          const totalDuration = endDateExpected.getTime() - startDate.getTime();
          const actualDuration = totalDuration * (completionRate / 100);
          endDate = new Date(startDate.getTime() + actualDuration);
          endDate = endDateExpected;
        } else if (endDateExpected) {
          endDate = endDateExpected;
        } else {
          endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        }
        console.log("endDatestr", endDateExpected);
        console.log("endDate", endDate);
        projectData.push({
          projectCode: String(projectCode).trim(),
          startDate,
          endDate,
          completionRate: completionRate || 0,
        });
      }
    }
  });

  // Sort by completion rate (descending) and limit to top 10
  const sortedProjects = projectData
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 10);

  const labels = sortedProjects.map((p) => p.projectCode);
  const startDates = sortedProjects.map((p) => p.startDate.getTime());
  const endDates = sortedProjects.map((p) => p.endDate.getTime());

  return { labels, startDates, endDates };
};

// Get all project completion rates (no limit) for detail page
export const getAllProjectCompletionRate = (
  data: ExcelData[]
): {
  labels: string[];
  startDates: number[];
  endDates: number[];
} => {
  const projectData: Array<{
    projectCode: string;
    startDate: Date;
    endDate: Date;
    completionRate: number;
  }> = [];

  data.forEach((row) => {
    const projectCode = row.shortName;
    const startDateStr = row.startDate;
    const endDateStr = row.expectedEndDate;
    const completionRate = parseVietnameseNumber(row.completionPercentage);

    if (projectCode && startDateStr) {
      const startDate = parseVietnameseDate(startDateStr);
      const endDateExpected = parseVietnameseDate(endDateStr);
      if (startDate) {
        let endDate: Date;
        if (endDateExpected && completionRate >= 0 && completionRate <= 100) {
          const totalDuration = endDateExpected.getTime() - startDate.getTime();
          const actualDuration = totalDuration * (completionRate / 100);
          endDate = new Date(startDate.getTime() + actualDuration);
          endDate = endDateExpected;
        } else if (endDateExpected) {
          endDate = endDateExpected;
        } else {
          endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        }
        projectData.push({
          projectCode: String(projectCode).trim(),
          startDate,
          endDate,
          completionRate: completionRate || 0,
        });
      }
    }
  });

  // Sort by completion rate (descending) but don't limit
  const sortedProjects = projectData.sort(
    (a, b) => b.completionRate - a.completionRate
  );

  const labels = sortedProjects.map((p) => p.projectCode);
  const startDates = sortedProjects.map((p) => p.startDate.getTime());
  const endDates = sortedProjects.map((p) => p.endDate.getTime());

  return { labels, startDates, endDates };
};

// Chart 5: Project type ratio
export const getProjectTypeRatio = (
  data: ExcelData[]
): {
  labels: string[];
  values: number[];
} => {
  const typeCounts: { [key: string]: number } = {};

  data.forEach((row) => {
    const projectType = row.projectType;
    if (projectType) {
      const typeStr = String(projectType).trim();
      if (typeStr) {
        typeCounts[typeStr] = (typeCounts[typeStr] || 0) + 1;
      }
    }
  });

  const labels = Object.keys(typeCounts);
  const values = labels.map((label) => typeCounts[label]);

  return { labels, values };
};

// Chart 6: Personnel allocation - Count number of personnel per project
export const getPersonnelAllocation = (
  data: ExcelData[]
): {
  labels: string[];
  values: number[];
} => {
  const projectPersonnelData: Array<{
    projectCode: string;
    personnelCount: number;
  }> = [];

  data.forEach((row) => {
    const projectCode = row.projectCode;
    const projectManager = row.projectDirector;

    if (projectCode && projectManager) {
      const projectCodeStr = String(projectCode).trim();
      const managerStr = String(projectManager).trim();

      if (projectCodeStr && managerStr) {
        // Split by '+' and count number of personnel for this project
        const managers = managerStr
          .split("+")
          .map((m) => m.trim())
          .filter((m) => m);
        projectPersonnelData.push({
          projectCode: projectCodeStr,
          personnelCount: managers.length,
        });
      }
    }
  });

  // Sort by personnel count (descending) and limit to top 10
  const sortedProjects = projectPersonnelData
    .sort((a, b) => b.personnelCount - a.personnelCount)
    .slice(0, 10);

  const labels = sortedProjects.map((p) => p.projectCode);
  const values = sortedProjects.map((p) => p.personnelCount);

  return { labels, values };
};

// KPI Statistics
export interface KPIStats {
  totalProjects: number;
  totalBudget: number; // Tổng giá trị hợp đồng (Dự toán)
  totalPersonnel: number; // Tổng số nhân sự unique
  onScheduleRate: number; // Tỉ lệ đúng tiến độ (%)
  estimatedCost: number; // Chi phí dự kiến (tỷ)
}

export const getKPIStats = (data: ExcelData[]): KPIStats => {
  const uniqueProjects = new Set<string>();
  let totalContractValue = 0;
  let totalPersonnel = 0; // Tổng số nhân sự của tất cả dự án (có thể trùng lặp)
  let totalCompletionRate = 0;
  let projectsWithCompletionRate = 0;
  let totalEstimatedBudget = 0;

  data.forEach((row) => {
    // Tổng dự án
    const projectCode = row.projectCode;
    if (projectCode) {
      uniqueProjects.add(String(projectCode).trim());
    }

    // Dự toán (Tổng giá trị hợp đồng)
    const contractValue = parseVietnameseNumber(row.contractValue);
    totalContractValue += contractValue;

    // Tổng số nhân sự (tổng của từng dự án, có thể trùng lặp)
    const projectManager = row.projectDirector;
    if (projectManager) {
      const managerStr = String(projectManager).trim();
      if (managerStr) {
        const managers = managerStr
          .split("+")
          .map((m) => m.trim())
          .filter((m) => m);
        totalPersonnel += managers.length; // Đếm tổng số nhân sự của dự án này
      }
    }

    // Tỉ lệ đúng tiến độ (% hoàn thành trung bình)
    const completionRate = parseVietnameseNumber(row.completionPercentage);
    if (completionRate >= 0) {
      totalCompletionRate += completionRate;
      projectsWithCompletionRate++;
    }

    // Chi phí dự kiến (Tổng ngân sách)
    const budget = parseVietnameseNumber(row["Ngân sách (VND)"]);
    totalEstimatedBudget += budget;
  });

  const avgCompletionRate =
    projectsWithCompletionRate > 0
      ? totalCompletionRate / projectsWithCompletionRate
      : 0;

  return {
    totalProjects: uniqueProjects.size,
    totalBudget: totalContractValue / 1000000000,
    totalPersonnel: totalPersonnel,
    onScheduleRate: avgCompletionRate,
    estimatedCost: totalEstimatedBudget / 1000000000,
  };
};

/**
 * Convert IProject to ExcelData format
 */
export function projectToExcelData(project: IProject): ExcelData {
  return {
    ...project,
  } as ExcelData;
}

/**
 * Convert IProject[] to ExcelData[]
 */
export function projectsToExcelData(projects: IProject[]): ExcelData[] {
  return projects.map(projectToExcelData);
}
