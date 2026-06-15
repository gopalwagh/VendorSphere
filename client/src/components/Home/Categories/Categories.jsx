import "./Categories.css";
import { memo } from "react";
import { Link } from "react-router-dom";

const categories = [
  "Electronics",
  "Fashion",
  "Shoes",
  "Books",
  "Mobiles",
  "Gaming",
];

const Categories = () => {
  return (
    <section className="categories">
      <div className="section-heading">
        <span className="hero-kicker">Browse by vibe</span>
        <h2>Shop by category</h2>
      </div>
      <div className="category-grid">
        {categories.map((item) => (
          <Link
            key={item}
            to={`/products?category=${encodeURIComponent(item.toLowerCase())}`}
            className="category-card"
          >
            <span>{item}</span>
            <small>Explore collection</small>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default memo(Categories);
