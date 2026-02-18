import { useAppSelector } from './redux';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  
  return {
    user,
    isAuthenticated,
    isLoading,
  };
};
