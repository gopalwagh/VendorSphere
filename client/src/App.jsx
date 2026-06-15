import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { checkAuth } from "./features/auth/authThunk";
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { getCartThunk } from "./features/cart/cartThunk";

const App = () => { 
  const dispatch = useDispatch();
  const { user, isAuthenticated, fetchedUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  },[dispatch]);

  useEffect(() => {
    if (fetchedUser && isAuthenticated && user?.role === "user") {
      dispatch(getCartThunk());
    }
  }, [dispatch, fetchedUser, isAuthenticated, user?.role]);
  
  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>   
  );
}

export default App;
