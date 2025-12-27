"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import ProjectCostChart from "@/components/ProjectCostChart";
import ProjectsByInvestorChart from "@/components/ProjectsByInvestorChart";
import TotalValueByInvestorChart from "@/components/TotalValueByInvestorChart";
import ProjectCompletionChart from "@/components/ProjectCompletionChart";
import ProjectTypeChart from "@/components/ProjectTypeChart";
import PersonnelAllocationChart from "@/components/PersonnelAllocationChart";
import KPICards from "@/components/KPICards";
import { useProjectStore } from "@/store/useProjectStore";
import { useShallow } from "zustand/react/shallow";
import { projectsToExcelData } from "@/utils/helpers";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function DashboardPage() {
  const { allProjects, getAllProjects } = useProjectStore(
    useShallow((state) => ({
      allProjects: state.allProjects,
      getAllProjects: state.getAllProjects,
    }))
  );
  const router = useRouter();

  useEffect(() => {
    getAllProjects();
  }, [getAllProjects]);

  useEffect(() => {
    if (allProjects.length === 0) {
      // Redirect to projects page if no data
      router.push("/projects");
    }
  }, [allProjects.length, router]);

  if (allProjects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  // Convert IProject[] to ExcelData[] for components
  const excelData = projectsToExcelData(allProjects);

  return (
    <div className="w-full h-full overflow-auto bg-gray-50">
      <div className="w-full max-w-[1400px] mx-auto p-4 flex flex-col gap-y-3">
        {/* KPI Cards */}
        <KPICards data={excelData} />

        {/* Row 1: Charts 1, 2, 3 */}
        <div className="w-full flex justify-between items-center gap-3">
          <div className="w-full flex gap-x-3">
            <div className="flex-1 flex flex-row gap-x-3">
              <div className="w-full">
                <ProjectsByInvestorChart data={excelData} />
              </div>
              <div className="w-full">
                <TotalValueByInvestorChart data={excelData} />
              </div>
            </div>
            <div className="basis-[50%]">
              {/* Chart 3: Project Cost Chart */}
              <ProjectCostChart data={excelData} />
            </div>
          </div>
        </div>

        {/* Row 2: Charts 4, 5, 6 */}
        <div className="w-full flex justify-between items-center gap-3">
          <div className="basis-[72%]">
            {/* Chart 4: Project Completion Rate */}
            <ProjectCompletionChart data={excelData} />
          </div>
          <div className="basis-[28%]">
            {/* Chart 5: Project Type Ratio */}
            <ProjectTypeChart data={excelData} />
          </div>
          {/* <div className="w-[calc(40%-8px)]">
            {Chart 6: Personnel Allocation }
            <PersonnelAllocationChart data={excelData} />
          </div> */}
        </div>
      </div>
    </div>
  );
}
