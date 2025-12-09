import { useAuth } from "../context/AuthContext";

export const useApi = () => {
  const { axiosInstance } = useAuth();

  return {
    get: axiosInstance.get,
    post: axiosInstance.post,
    put: axiosInstance.put,
    delete: axiosInstance.delete,
    patch: axiosInstance.patch,
  };
};