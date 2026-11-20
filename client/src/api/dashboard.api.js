import axiosInstance from './axiosInstance';

export const getDashboardOverview = () => axiosInstance.get('/dashboard/overview');