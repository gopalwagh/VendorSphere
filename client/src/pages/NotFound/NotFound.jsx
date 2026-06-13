import "./NotFound.css";
import { useNavigate, } from "react-router-dom";
import { useSelector } from "react-redux";

const NotFound = () => {
  const { user }= useSelector((state)=> state.auth);
  const role = user?.role;
  
  return (
    <div className="not-found">
      <div className="not-found-box">
        <h1>404</h1>
        <p>Page Not Found</p>
        { 
          role==="user" ? 
            (<a href="/">Go Back Home</a>) 
            : (<a href="/dashboard">Go Back Home</a>)
        }
        
      </div>
    </div>
  );
};

export default NotFound;