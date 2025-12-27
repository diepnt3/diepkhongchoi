import axios from "axios";
import { IProject, IProjectQuery, IProjectsResponse } from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Tạo axios instance với token
 */
function createAxiosInstance(accessToken?: string) {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  return instance;
}

/**
 * Xóa tất cả projects
 */
export async function deleteAllProjects(accessToken?: string): Promise<void> {
  const apiClient = createAxiosInstance(accessToken);
  await apiClient.delete("/projects/all");
}

/**
 * Tạo mới một project
 */
export async function createProject(
  project: IProject,
  accessToken?: string
): Promise<IProject> {
  const apiClient = createAxiosInstance(accessToken);
  const response = await apiClient.post("/projects", project);
  return response.data;
}

/**
 * Tạo nhiều projects (từng cái một)
 */
export async function createProjects(
  projects: IProject[],
  accessToken?: string,
  onProgress?: (current: number, total: number) => void
): Promise<IProject[]> {
  const results: IProject[] = [];
  const total = projects.length;

  for (let i = 0; i < projects.length; i++) {
    try {
      const project = await createProject(projects[i], accessToken);
      results.push(project);
      if (onProgress) {
        onProgress(i + 1, total);
      }
    } catch (error) {
      console.error(`Error creating project ${i + 1}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Lấy danh sách projects với pagination
 */
export async function getProjects(
  query: IProjectQuery,
  accessToken?: string
): Promise<IProjectsResponse> {
  const apiClient = createAxiosInstance(accessToken);
  const response = await apiClient.get(`/projects`, { params: query });
  return response.data;
}
