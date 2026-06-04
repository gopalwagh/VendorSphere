import "./Login.css";



const Login = () => {
  return (
    <div className="auth-page">
      <form className="auth-form">
        <h1>
          Login
        </h1>
        <input
          type="email"
          placeholder="Email"
        />
        <input
          type="password"
          placeholder="Password"
        />
        <button>
          Login
        </button>
      </form>
    </div>
  )
}

export default Login;
