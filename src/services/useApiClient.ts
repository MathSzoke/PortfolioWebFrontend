import getApiClient from './apiClient';
import { useAuth } from './auth';
import { useMemo } from 'react';

const useApiClient = () => {
    const { refreshToken } = useAuth();
    return useMemo(() => getApiClient(refreshToken), [refreshToken]);
};

export default useApiClient;
