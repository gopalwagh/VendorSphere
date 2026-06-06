import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { checkAuth } from "./features/auth/authThunk";
import { useEffect } from "react"
import { useDispatch } from "react-redux";

const App = () => { 
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  },[dispatch]);

  return (
    <>
      <Toaster position="top-right" />
      <AppRoutes />
    </>   
  );
}

export default App;
