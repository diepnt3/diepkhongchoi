import { ExcelData } from "./interfaces";
import { IProject } from "./interfaces";

/**
 * Parse date từ nhiều format khác nhau
 */
function parseDate(value: unknown): string | undefined {
  if (!value) return undefined;

  // Nếu là string, thử parse
  if (typeof value === "string") {
    // Format: DD/MM/YYYY hoặc YYYY-MM-DD
    if (value.includes("/")) {
      const parts = value.split("/");
      if (parts.length === 3) {
        const day = parts[0].padStart(2, "0");
        const month = parts[1].padStart(2, "0");
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
    }
    // Đã là YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    return undefined;
  }

  // Nếu là number (Excel date serial number)
  if (typeof value === "number") {
    if (value > 25569 && value < 73415) {
      const utcDays = value - 25569;
      const date = new Date(utcDays * 86400 * 1000);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }

  // Nếu là Date object
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return undefined;
}

/**
 * Parse number từ nhiều format
 */
function parseNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    // Remove spaces, commas, và các ký tự không phải số
    const cleaned = value.replace(/[^\d.-]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Map ExcelData sang Project format
 * Cần map các field từ Excel header sang Project fields
 */
export function mapExcelDataToProject(
  excelRow: ExcelData,
  headerMapping?: Record<string, keyof IProject>
): IProject {
  // Default mapping - có thể tùy chỉnh
  const defaultMapping: Record<string, keyof IProject> = {
    "Mã dự án": "projectCode",
    "Tên dự án": "projectName",
    "Tên rút gọn": "shortName",
    "Loại dự án": "projectType",
    "Chủ đầu tư": "investor",
    Khối: "block",
    "Giám đốc dự án": "projectDirector",
    "Phạm vi thầu": "biddingScope",
    "Trạng thái khởi tạo": "initStatus",
    "Trạng thái trễ tiến độ": "progressStatus",
    "Ngày bắt đầu": "startDate",
    "Ngày kết thúc dự kiến": "expectedEndDate",
    "Duration time (day)": "durationDays",
    "Duration time (month)": "durationMonths",
    "Giá trị hợp đồng (VND)": "contractValue",
    "Giá trị đã thực hiện (VND)": "executedValue",
    "Giá trị đã nghiệm thu": "acceptedValue",
    "Giá trị đã đề nghị TT, TƯ hợp đồng": "proposedPaymentValue",
    "Giá trị còn lại": "remainingValue",
    "% hoàn thành": "completionPercentage",
    // English variations
    projectCode: "projectCode",
    projectName: "projectName",
    shortName: "shortName",
    projectType: "projectType",
    investor: "investor",
    block: "block",
    projectDirector: "projectDirector",
    biddingScope: "biddingScope",
    initStatus: "initStatus",
    progressStatus: "progressStatus",
    startDate: "startDate",
    expectedEndDate: "expectedEndDate",
    durationDays: "durationDays",
    durationMonths: "durationMonths",
    contractValue: "contractValue",
    executedValue: "executedValue",
    acceptedValue: "acceptedValue",
    proposedPaymentValue: "proposedPaymentValue",
    remainingValue: "remainingValue",
    completionPercentage: "completionPercentage",
  };

  const mapping = headerMapping || defaultMapping;

  const getValue = (key: string): unknown => {
    // Thử tìm theo key chính xác
    if (excelRow[key] !== undefined) {
      return excelRow[key];
    }
    // Thử tìm không phân biệt hoa thường
    const lowerKey = key.toLowerCase();
    const foundKey = Object.keys(excelRow).find(
      (k) => k.toLowerCase() === lowerKey
    );
    return foundKey ? excelRow[foundKey] : undefined;
  };

  const project: IProject = {
    projectCode: "",
    projectName: "",
  };

  // Map từng field
  Object.entries(mapping).forEach(([excelHeader, projectField]) => {
    const value = getValue(excelHeader);
    if (value !== undefined && value !== null && value !== "") {
      // Xử lý theo type của field
      if (projectField === "startDate" || projectField === "expectedEndDate") {
        const dateValue = parseDate(value);
        if (dateValue) {
          project[projectField] = dateValue;
        }
      } else if (
        projectField === "durationDays" ||
        projectField === "durationMonths" ||
        projectField === "contractValue" ||
        projectField === "executedValue" ||
        projectField === "acceptedValue" ||
        projectField === "proposedPaymentValue" ||
        projectField === "remainingValue" ||
        projectField === "completionPercentage"
      ) {
        const numValue = parseNumber(value);
        if (numValue !== undefined) {
          project[projectField] = numValue;
        }
      } else {
        // String fields
        project[projectField] = String(value).trim();
      }
    }
  });

  // Đảm bảo có projectCode và projectName (required fields)
  if (!project.projectCode && !project.projectName) {
    throw new Error("Project must have at least projectCode or projectName");
  }

  // Nếu không có projectCode, dùng projectName
  if (!project.projectCode && project.projectName) {
    project.projectCode = project.projectName.substring(0, 10); // Lấy 10 ký tự đầu
  }

  // Nếu không có projectName, dùng projectCode
  if (!project.projectName && project.projectCode) {
    project.projectName = project.projectCode;
  }

  return project;
}

/**
 * Map nhiều ExcelData rows sang Project array
 */
export function mapExcelDataToProjects(
  excelData: ExcelData[],
  headerMapping?: Record<string, keyof IProject>
): IProject[] {
  return excelData
    .map((row) => {
      try {
        return mapExcelDataToProject(row, headerMapping);
      } catch (error) {
        console.error("Error mapping row to project:", error, row);
        return null;
      }
    })
    .filter((project): project is IProject => project !== null);
}
