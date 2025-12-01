import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { login, logout } from "@/redux/slices/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jwt, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  return {
    jwt,
    isAuthenticated,
    login: (token: string) => dispatch(login(token)),
    logout: () => dispatch(logout()),
  };
};
