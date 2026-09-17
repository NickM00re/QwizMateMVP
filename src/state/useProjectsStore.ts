import {create} from 'zustand';
import {projectsRepository} from '../services/storage/repositories';
import {createId, nowIso, type Project} from '../types/models';

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  loadProjects: () => Promise<void>;
  createProject: (name: string, courseName?: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  isLoading: false,

  loadProjects: async () => {
    set({isLoading: true});
    const projects = await projectsRepository.getAll();
    projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    set({projects, isLoading: false});
  },

  createProject: async (name, courseName) => {
    const timestamp = nowIso();
    const project: Project = {
      id: createId(),
      name,
      courseName,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await projectsRepository.save(project);
    set({projects: [project, ...get().projects]});
    return project;
  },

  deleteProject: async id => {
    await projectsRepository.remove(id);
    set({projects: get().projects.filter(p => p.id !== id)});
  },
}));
