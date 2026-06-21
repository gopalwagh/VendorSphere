import "./ProductCard.css";
import { memo } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import useAddToCart from "../../hooks/useAddToCart";

const ProductCard = ({ product }) => {
  const { addToCart } = useAddToCart();

  if (!product) {
    return null;
  }

  const isOutOfStock = product.stock <= 0;
  const averageRating = Number(product.averageRating || 0).toFixed(1);
  const reviewCount = product.numOfReviews || 0;

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-media-link">
        <div className="product-image-wrap">
          <img src={product?.images?.[0]?.url} alt={product.title} />
          {isOutOfStock && <span className="stock-badge">Out of stock</span>}
        </div>
      </Link>

      <div className="product-body">
        <span className="category">{product.category}</span>
        <Link to={`/products/${product._id}`} className="product-title-link">
          <h3>{product.title}</h3>
        </Link>
        <div className="price-row">
          <span className="price-label">Price</span>
          <span className="price">Rs. {product.price}</span>
        </div>
      </div>

      <div className="product-footer">
        <div className="product-rating-meta">
          <div className="rating">
            <FaStar />
            <span>{averageRating}</span>
          </div>
          <span className="review-count">{reviewCount} reviews</span>
        </div>
        <button
          className="cart-btn"
          onClick={() => addToCart(product)}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? "Out Of Stock" : "Add To Cart"}
        </button>
      </div>
    </article>
  );
};

export default memo(ProductCard);
