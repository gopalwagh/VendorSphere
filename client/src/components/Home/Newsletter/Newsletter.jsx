import "./Newsletter.css";
import { memo, useState } from "react";
import toast from "react-hot-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    toast.success("Subscribed successfully");
    setEmail("");
  };

  return (
    <section className="newsletter">
      <div className="section-heading">
        <span className="hero-kicker">Stay updated</span>
        <h2>Subscribe to the newsletter</h2>
      </div>
      <p>Get latest offers, product drops, and seller updates in one place.</p>
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Subscribe</button>
      </form>
    </section>
  );
};

export default memo(Newsletter);
