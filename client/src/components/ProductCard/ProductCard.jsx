import "./ProductCard.css";
import { memo } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import useAddToCart from "../../hooks/useAddToCart";

const ProductCard = ({ product }) => {
  if (!product) {
    return null;
  }

  const { addToCart } = useAddToCart();
  const isOutOfStock = product.stock <= 0;

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-link">
        <div className="product-image-wrap">
          <img src={product?.images?.[0]?.url} alt={product.title} />
        </div>
        <div className="product-body">
          <span className="category">{product.category}</span>
          <h3>{product.title}</h3>
          <div className="rating">
            <FaStar />
            <span>{product.averageRating || 0}</span>
          </div>
          <div className="price-box">
            <span className="price">Rs. {product.price}</span>
          </div>
        </div>
      </Link>
      <button
        className="cart-btn"
        onClick={() => addToCart(product)}
        disabled={isOutOfStock}
      >
        {isOutOfStock ? "Out Of Stock" : "Add To Cart"}
      </button>
    </article>
  );
};

export default memo(ProductCard);
