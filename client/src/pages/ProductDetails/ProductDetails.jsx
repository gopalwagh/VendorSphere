import "./ProductDetails.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProductDetails } from "../../features/products/productThunk";
import Loader from "../../components/Loader/Loader";
import useAddToCart from "../../hooks/useAddToCart";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToCart } = useAddToCart();

  const { selectedProduct, loading, error } = useSelector((state) => state.product);
  const { addToCartLoading } = useSelector((state) => state.cart);

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchProductDetails(productId));
    setQuantity(1);
  }, [dispatch, productId]);

  const handleAddToCart = async () => {
    const result = await addToCart(selectedProduct, quantity);
    if (result?.success) {
      navigate("/cart");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !selectedProduct) {
    return (
      <div className="product-details-container empty-product-state">
        <div className="empty-product-card">
          <span className="detail-eyebrow">Item unavailable</span>
          <h1>We could not find this product.</h1>
          <p>The item may have been removed or is no longer available.</p>
          <Link to="/products" className="back-link">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = selectedProduct.stock <= 0;

  return (
    <div className="product-details-container">
      <div className="product-details-card">
        <div className="product-image-section">
          <img
            src={selectedProduct.images?.[0]?.url}
            alt={selectedProduct.title}
          />
        </div>

        <div className="product-info-section">
          <span className="detail-eyebrow">{selectedProduct.category}</span>
          <h1 className="product-title">{selectedProduct.title}</h1>
          <div className="product-price">Rs. {selectedProduct.price}</div>
          <div className="product-rating">
            Rating {selectedProduct.averageRating} ({selectedProduct.numOfReviews} Reviews)
          </div>
          <p className="product-description">{selectedProduct.description}</p>

          <div className="product-meta">
            <span>
              <strong>Brand:</strong> {selectedProduct.brand}
            </span>
            <span
              className={isOutOfStock ? "out-stock" : "in-stock"}
            >
              {isOutOfStock
                ? "Out of stock"
                : `In stock (${selectedProduct.stock})`}
            </span>
          </div>

          <div className="quantity-wrapper">
            <button
              className="quantity-btn"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={isOutOfStock}
            >
              -
            </button>
            <span className="quantity-value">{quantity}</span>
            <button
              className="quantity-btn"
              onClick={() => {
                if (quantity < selectedProduct.stock) {
                  setQuantity(quantity + 1);
                } else {
                  toast.error("Stock limit reached");
                }
              }}
              disabled={isOutOfStock}
            >
              +
            </button>
          </div>

          <button
            className="add-cart-btn"
            disabled={addToCartLoading || isOutOfStock}
            onClick={handleAddToCart}
          >
            {isOutOfStock
              ? "Out Of Stock"
              : addToCartLoading
                ? "Adding..."
                : "Add To Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
