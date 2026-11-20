import axiosInstance from './axiosInstance';

export const startChallenge = (skill) => axiosInstance.get(`/challenge/${skill}/start`);
export const submitChallenge = (skill, data) => axiosInstance.post(`/challenge/${skill}/submit`, data);