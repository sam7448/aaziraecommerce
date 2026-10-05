import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loginUser, registerUser, logoutUser } from '../store/auth/auth.slice';
import { LoginCredentials, RegisterData } from '../types/auth.types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  return {
    ...authState,
    login: (credentials: LoginCredentials) => dispatch(loginUser(credentials)),
    register: (data: RegisterData) => dispatch(registerUser(data)),
    logout: () => dispatch(logoutUser()),
  };
};
