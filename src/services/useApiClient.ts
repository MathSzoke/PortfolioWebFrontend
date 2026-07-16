import getApiClient from './apiClient';
import { useAuth } from './auth';

const useApiClient = () => {
    const { refreshToken } = useAuth();
    return getApiClient(refreshToken);
};

export default useApiClient;
