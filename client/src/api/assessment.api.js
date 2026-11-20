import axiosInstance from './axiosInstance';

export const startAssessment = (skill) => axiosInstance.get(`/assessment/${skill}/start`);
export const submitAssessment = (skill, answers) => axiosInstance.post(`/assessment/${skill}/submit`, { answers });