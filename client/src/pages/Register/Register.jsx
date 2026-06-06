import "./Register.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from  "react-redux";
import { registerThunk } from "../../features/auth/authThunk";

const Register = () => {
  const { loading } = useSelector((state) => state.auth.loading);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    const result = await dispatch(
      registerThunk({
        name,
        email,
        password,
      })
    );
    if (result.success) {
      toast.success("Account Created Successfully");
      navigate("/login");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>
          Register
        </h1>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={loading}>
          {
            loading ? "Please Wait...":"Register"
          }
        </button>
      </form>
    </div>
  );
};

export default Register;