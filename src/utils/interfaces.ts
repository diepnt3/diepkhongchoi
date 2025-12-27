export interface ExcelData {
  [key: string]: unknown;
}

// Project interface theo API
export interface IProject {
  projectCode: string;
  projectName: string;
  shortName?: string;
  projectType?: string;
  investor?: string;
  block?: string;
  projectDirector?: string;
  biddingScope?: string;
  initStatus?: string;
  progressStatus?: string;
  startDate?: string; // Format: YYYY-MM-DD
  expectedEndDate?: string; // Format: YYYY-MM-DD
  durationDays?: number;
  durationMonths?: number;
  contractValue?: number;
  executedValue?: number;
  acceptedValue?: number;
  proposedPaymentValue?: number;
  remainingValue?: number;
  completionPercentage?: number;
}

// API Response interfaces
export interface IProjectsResponse {
  data: IProject[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IProjectQuery {
  page?: number;
  limit?: number;
}
