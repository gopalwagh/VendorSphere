import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { checkAuth } from "./features/auth/authThunk";
import { useEffect } from "react"
import { useDispatch } from "react-redux";
import { getCartThunk } from "./features/cart/cartThunk";

const App = () => { 
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
    dispatch(getCartThunk());
  },[]);

  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>   
  );
}

export default App;
