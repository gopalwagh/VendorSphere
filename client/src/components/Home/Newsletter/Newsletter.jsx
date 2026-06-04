import "./Newsletter.css";

function Newsletter() {
  return (
    <section className="newsletter">
      <h2>
        Subscribe Newsletter
      </h2>
      <p>
        Get latest offers and updates
      </p>
      <div className="newsletter-form">
        <input
          type="email"
          placeholder="Enter email"
        />
        <button>
          Subscribe
        </button>
      </div>
    </section>
  );
};

export default Newsletter;