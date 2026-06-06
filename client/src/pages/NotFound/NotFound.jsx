import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-box">
        <h1>404</h1>
        <p>Page Not Found</p>
        <a href="/">Go Back Home</a>
      </div>
    </div>
  );
};

export default NotFound;