import "./OfferBanner.css";
import { memo } from "react";
import { Link } from "react-router-dom";

const OfferBanner = () => {
  return (
    <section className="offer-banner">
      <div>
        <span className="hero-kicker">Seasonal drop</span>
        <h2>Summer Sale 2026</h2>
        <p>Up to 70% off on selected products with a smoother checkout flow.</p>
      </div>
      <Link to="/products" className="offer-btn">
        Explore Deals
      </Link>
    </section>
  );
};

export default memo(OfferBanner);
