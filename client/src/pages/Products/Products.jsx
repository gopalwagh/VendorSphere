import "./Products.css";
import ProductCard from "../../components/product/ProductCard/ProductCard";

const Products = () => {
  return (
    <div className="products-page">
      <aside className="filters">
        <h3>Filters</h3>
        <div className="filter-group">
          <h4>Category</h4>
          <label>
            <input type="checkbox" />
            Electronics
          </label>
          <label>
            <input type="checkbox" />
            Fashion
          </label>
          <label>
            <input type="checkbox" />
            Books
          </label>
        </div>
        <div className="filter-group">
          <h4>Price</h4>
          <input type="range" min="0" max="5000" />
        </div>
      </aside>

      <section className="products-content">
        <h2>All Products</h2>
        <div className="products-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <ProductCard key={item} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Products;
