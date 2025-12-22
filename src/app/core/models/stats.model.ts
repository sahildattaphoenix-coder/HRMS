/**
 * Statistics and Dashboard Models
 */

export interface ProjectStats {
  totalProjects: number;
  workingProjects: number;
  completedProjects: number;
  pendingProjects: number;
}

export interface AdminStats {
  teamCount: number;
  active: number;
  wfh: number;
  absent: number;
}

export interface LeaveStat {
  taken: number;
  total: number;
  balance: number;
  sick: number;
}
