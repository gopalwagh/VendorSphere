import "./NotFound.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getRoleHomePath } from "../../features/auth/roleUtils";

const NotFound = () => {
  const { user } = useSelector((state) => state.auth);
  const homeLink = getRoleHomePath(user?.role);

  return (
    <div className="not-found">
      <div className="not-found-box">
        <span className="detail-eyebrow">404</span>
        <h1>Page Not Found</h1>
        <p>The page you requested does not exist or moved somewhere else.</p>
        <Link to={homeLink}>Go Back Home</Link>
      </div>
    </div>
  );
};

export default NotFound;
