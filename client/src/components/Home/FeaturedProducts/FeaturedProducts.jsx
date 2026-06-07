import "./FeaturedProducts.css";
import ProductCard from "../../product/ProductCard/ProductCard";
import { useSelector } from "react-redux";

const FeaturedProducts = () => {
  const { products } = useSelector((state)=> state.product);

  return (
    <section className="feature">
      <h2>Featured Products</h2>
      <div className="product-grid">
        {
          products.slice(0,8).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        }
      </div>
    </section>
  );
};

export default FeaturedProducts;
