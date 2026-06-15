import "./FeaturedProducts.css";
import { memo } from "react";
import ProductCard from "../../../components/ProductCard/ProductCard.jsx";
import { useSelector } from "react-redux";

const FeaturedProducts = () => {
  const { products } = useSelector((state) => state.product);
  const featuredProducts = products.slice(0, 8);

  return (
    <section className="feature">
      <div className="section-heading">
        <span className="hero-kicker">Best picks</span>
        <h2>Featured products</h2>
      </div>
      <div className="product-grid">
        {featuredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default memo(FeaturedProducts);
