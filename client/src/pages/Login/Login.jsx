import "./Login.css";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { loginThunk } from "../../features/auth/authThunk";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const loading = useSelector((state) => state.auth.loading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    // agar dono empty hain to turant return
    if (email.length === 0 || password.length === 0) {
      toast.error("Email and Password are required");
      return;
    }
    
    const result = await dispatch(
      loginThunk({ email,password, })
    );
    
    if (result.success) {
      toast.success("Login Successful");

      if (result.role === "superadmin") {
        navigate("/super-admin");

      } else if (result.role === "admin") {
        if (result.sellerStatus === "approved") {
          navigate("/dashboard");
        } else {
          navigate("/seller/application");
        }
      } else {
        navigate("/");
        }
    } else {
        toast.error(result.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit} >
        <h1>
          Login
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={
            (e) => setEmail(e.target.value)
          }
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={
            (e) => setPassword(e.target.value)
          }
        />
        <button disabled={loading}>
          {
            loading ? "Logging In..." : "Login"
          }
        </button>
        <p className="auth-link">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>
            Sign up
          </span>
        </p>
      </form>
    </div>
  )
}

export default Login;
