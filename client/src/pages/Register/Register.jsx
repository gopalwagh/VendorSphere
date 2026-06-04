import "./Register.css";

const Register = () => {
  return (
    <div className="auth-page">
      <form className="auth-form">
        <h1>
          Register
        </h1>
        <input
          type="text"
          placeholder="Full Name"
        />
        <input
          type="email"
          placeholder="Email"
        />
        <input
          type="password"
          placeholder="Password"
        />
        <button>
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;