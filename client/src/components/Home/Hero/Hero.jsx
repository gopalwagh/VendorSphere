import "./Hero.css";
import { memo } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-kicker">Curated marketplace</span>
        <h1>Discover products that feel hand-picked for your life.</h1>
        <p>
          Shop a clean, modern marketplace with trusted sellers, fast checkout,
          and a product experience built to feel premium from the first click.
        </p>

        <div className="hero-actions">
          <Link to="/products" className="hero-primary">
            Shop Now <FaArrowRight />
          </Link>
          <Link to="/register" className="hero-secondary">
            Create Account
          </Link>
        </div>

        <div className="hero-metrics">
          <div>
            <strong>10K+</strong>
            <span>Curated products</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>Fast support</span>
          </div>
          <div>
            <strong>Secure</strong>
            <span>Razorpay checkout</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-card hero-card-top">
          <span>Trending this week</span>
          <strong>Premium electronics and fashion drops</strong>
        </div>
        <img
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30"
          alt="hero"
        />
        <div className="hero-card hero-card-bottom">
          <span>Fast delivery</span>
          <strong>Reliable sellers. Smooth checkout. No clutter.</strong>
        </div>
      </div>
    </section>
  );
};

export default memo(Hero);