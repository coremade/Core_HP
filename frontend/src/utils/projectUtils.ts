import { Project, ProjectDeveloper } from '@/types/project';

export const initializeProjectDeveloperDates = (
  developers: ProjectDeveloper[],
  project: Project | null
): ProjectDeveloper[] => {
  if (!project) return developers;

  const today = new Date().toISOString().split('T')[0];
  
  return developers.map(dev => ({
    ...dev,
    start_date: dev.start_date || project.project_start_date || today,
    end_date: dev.end_date || project.project_end_date || today
  }));
};

export const formatDateForAPI = (date: string | undefined): string | undefined => {
  if (!date) return undefined;
  
  // YYYYMMDD -> YYYY-MM-DD
  if (date.length === 8 && !date.includes('-')) {
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  }
  
  // 이미 YYYY-MM-DD 형식이면 그대로 반환
  if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date;
  }
  
  return undefined;
};

export const formatDateForDisplay = (date: string | undefined): string => {
  if (!date) return '';
  
  // YYYY-MM-DD -> YYYYMMDD
  if (date.includes('-')) {
    return date.replace(/-/g, '');
  }
  
  return date;
}; 