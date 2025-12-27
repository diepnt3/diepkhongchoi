import {
  DEFAULT_LIMIT,
  DEFAULT_LIMIT_ALL,
  DEFAULT_PAGE,
} from "@/utils/constants";
import { IProject, IProjectQuery } from "@/utils/interfaces";
import { getProjects } from "@/utils/projectsApi";
import { create } from "zustand";

interface ProjectSlice {
  allProjects: IProject[];
  isAllProjectsLoading: boolean;
  projects: IProject[];
  isLoading: boolean;
  total: number;
  totalPages: number;
  query: IProjectQuery;
}

interface ProjectActions {
  getAllProjects: () => Promise<void>;
  getProjects: (query?: IProjectQuery) => Promise<void>;
  setQuery: (query: IProjectQuery) => void;
  reset: () => void;
}

const initialState: ProjectSlice = {
  allProjects: [],
  isAllProjectsLoading: false,
  projects: [],
  isLoading: false,
  total: 0,
  totalPages: 0,
  query: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT },
};

export const useProjectStore = create<ProjectSlice & ProjectActions>((set) => ({
  ...initialState,
  getAllProjects: async () => {
    set({ isAllProjectsLoading: true });
    try {
      const response = await getProjects({
        page: DEFAULT_PAGE,
        limit: DEFAULT_LIMIT_ALL,
      });
      set({ allProjects: response.data });
    } catch {
      set({ allProjects: [] });
    } finally {
      set({ isAllProjectsLoading: false });
    }
    set({ isAllProjectsLoading: false });
  },
  getProjects: async (query) => {
    const updatedQuery = {
      ...initialState.query,
      ...query,
    };
    set({ isLoading: true });
    try {
      set({ query: updatedQuery });
      const response = await getProjects(updatedQuery);
      set({
        projects: response.data,
        total: response.meta.total,
        totalPages: response.meta.totalPages,
      });
    } catch {
      set({ projects: [], total: 0, totalPages: 0 });
    } finally {
      set({ isLoading: false });
    }
  },
  setQuery: (query) => set({ query }),
  reset: () => set({ projects: [], query: { page: 1, limit: 10 } }),
}));
