import axiosInstance from './axiosInstance';

export const searchCandidates = (params) =>
  axiosInstance.get('/recruiter/candidates', { params });

export const getTalentPool = (params) =>
  axiosInstance.get('/recruiter/talent-pool', { params });

export const getSavedCandidates = () =>
  axiosInstance.get('/recruiter/saved');

export const saveCandidate = (payload) =>
  axiosInstance.post('/recruiter/saved', payload);

export const unsaveCandidate = (username) =>
  axiosInstance.delete(`/recruiter/saved/${username}`);

export const getRecruiterStats = () =>
  axiosInstance.get('/recruiter/stats');