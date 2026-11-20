import axiosInstance from './axiosInstance';

export const submitGithubEvidence = (skill, repoUrl) =>
  axiosInstance.post(`/github/${skill}/submit`, { repoUrl });