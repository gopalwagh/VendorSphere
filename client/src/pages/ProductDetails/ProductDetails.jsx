import "./ProductDetails.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProductDetails } from "../../features/products/productThunk";
import { setSelectedProduct } from "../../features/products/productSlice";
import Loader from "../../components/Loader/Loader";
import useAddToCart from "../../hooks/useAddToCart";
import toast from "react-hot-toast";
import ProductCard from "../../components/ProductCard/ProductCard";
import { getProductReviewsApi, postReviewApi, getAllProducts } from "../../api/productApi";
import { FaStar } from "react-icons/fa";

const ProductDetails = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToCart } = useAddToCart();

  const { selectedProduct, loading, error } = useSelector((state) => state.product);
  const { addToCartLoading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    dispatch(fetchProductDetails(productId));
    setQuantity(1);
  }, [dispatch, productId]);

  useEffect(() => {
    getProductReviewsApi(productId)
      .then((data) => setReviews(data.data.reviews || []))
      .catch((err) => console.log(err));
  }, [productId]);

  useEffect(() => {
    if (!selectedProduct?.category) {
      return;
    }

    getAllProducts({ category: selectedProduct.category, limit: 10 })
      .then((res) => {
        const filtered = res.data.data.products.filter((p) => p._id !== productId);
        setSimilarProducts(filtered.slice(0, 10));
      })
      .catch((err) => console.log(err));
  }, [selectedProduct, productId]);

  const handleAddToCart = async () => {
    const result = await addToCart(selectedProduct, quantity);
    if (result?.success) {
      navigate("/cart");
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    try {
      const postResponse = await postReviewApi(productId, { rating, comment });
      toast.success("Review submitted successfully");
      setRating("");
      setComment("");

      const reviewResponse = await getProductReviewsApi(productId);

      dispatch(setSelectedProduct(postResponse.data || selectedProduct));
      setReviews(reviewResponse.data.reviews || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
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
  const averageRating = Number(selectedProduct.averageRating || 0).toFixed(1);

  return (
    <div className="product-details-container">
      <section className="product-details-card">
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
            <FaStar />
            <span>{averageRating}</span>
            <span className="rating-note">
              ({selectedProduct.numOfReviews || 0} reviews)
            </span>
          </div>

          <p className="product-description">{selectedProduct.description}</p>

          <div className="product-meta">
            <span>
              <strong>Brand:</strong> {selectedProduct.brand || "No brand listed"}
            </span>
            <span className={isOutOfStock ? "out-stock" : "in-stock"}>
              {isOutOfStock
                ? "Out of stock"
                : `In stock (${selectedProduct.stock})`}
            </span>
          </div>

          <div className="quantity-wrapper">
            <button
              type="button"
              className="quantity-btn"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={isOutOfStock}
            >
              -
            </button>
            <span className="quantity-value">{quantity}</span>
            <button
              type="button"
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
            type="button"
            className="add-cart-btn"
            disabled={addToCartLoading || isOutOfStock}
            onClick={handleAddToCart}
          >
            {isOutOfStock
              ? "Out of stock"
              : addToCartLoading
                ? "Adding..."
                : "Add to cart"}
          </button>
        </div>
      </section>

      <section className="reviews-section">
        <div className="section-header-block">
          <div>
            <span className="section-kicker">Reviews</span>
            <h2>Comments from buyers</h2>
          </div>
          <div className="section-chip">
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="reviews-layout">
          <div className="review-form-card">
            <h3>Write a review</h3>
            {isAuthenticated ? (
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label>Rating</label>
                  <select
                    value={rating}
                    onChange={(event) => setRating(event.target.value)}
                    required
                  >
                    <option value="">Select rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    required
                    rows="5"
                    placeholder="Share what you liked, what could be better, and any details future buyers should know."
                  />
                </div>

                <button type="submit" className="submit-review-btn">
                  Submit review
                </button>
              </form>
            ) : (
              <p className="login-prompt">
                Please <Link to="/login">login</Link> to write a review.
              </p>
            )}
          </div>

          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <article key={review._id || index} className="review-card">
                  <div className="review-header">
                    <div>
                      <strong>{review.name || review.user?.name || "Anonymous"}</strong>
                      <p>{review.comment}</p>
                    </div>
                    <div className="review-rating">
                      <FaStar />
                      <span>{review.rating}/5</span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-reviews-state">
                <h3>No reviews yet</h3>
                <p>Be the first one to add a helpful comment about this product.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section className="similar-products-section">
          <div className="section-header-block">
            <div>
              <span className="section-kicker">Similar products</span>
              <h2>More in this category</h2>
            </div>
            <div className="section-chip">{similarProducts.length} items</div>
          </div>
          <div className="similar-products-grid">
            {similarProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
