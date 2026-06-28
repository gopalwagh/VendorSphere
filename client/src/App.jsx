import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { checkAuth } from "./features/auth/authThunk";
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { getCartThunk } from "./features/cart/cartThunk";
import { ROLES, normalizeRole } from "./features/auth/roleUtils";
import { initializeForegroundNotifications } from "./firebase/notificationListener";

const App = () => { 
  const dispatch = useDispatch();
  const { user, isAuthenticated, fetchedUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  },[dispatch]);

  useEffect(() => {
    if (fetchedUser && isAuthenticated && normalizeRole(user?.role) === ROLES.USER) {
      dispatch(getCartThunk());
    }
  }, [dispatch, fetchedUser, isAuthenticated, user?.role]);

  initializeForegroundNotifications();
  
  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>   
  );
}

export default App;
