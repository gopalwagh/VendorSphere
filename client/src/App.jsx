import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { checkAuth } from "./features/auth/authThunk";
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { getCartThunk } from "./features/cart/cartThunk";

const App = () => { 
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  },[dispatch]);

  useEffect(()=> {
    if(user) {
      dispatch(getCartThunk());
    }
  }, [user,dispatch]);
  
  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>   
  );
}

export default App;
