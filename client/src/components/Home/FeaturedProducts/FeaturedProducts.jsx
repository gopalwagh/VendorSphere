import "./FeaturedProducts.css";
import ProductCard from "../../product/ProductCard/ProductCard";

const FeaturedProducts = () => {
  return (
    <section className="feature">
      <h2>Featured Products</h2>
      <div className="product-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <ProductCard key={item} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
