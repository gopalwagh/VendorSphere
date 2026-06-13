import "./ProductDetails.css";
import { useParams, useNavigate  } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProductDetails, } from "../../features/products/productThunk";
import Loader from "../../components/common/Loader/Loader";
import useAddToCart from "../../hooks/useAddToCart";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToCart } = useAddToCart();

  const { selectedProduct, loading} = useSelector((state) => state.product);
  const { addToCartLoading, } = useSelector((state) => state.cart);

  const [quantity, setQuantity] = useState(1);
  
  useEffect(() => {
    dispatch(fetchProductDetails(productId));
  },[dispatch, productId]);

  if (loading || !selectedProduct) {
    return <Loader />;
  }

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
          <h1 className="product-title">
            {selectedProduct.title}
          </h1>
          <div className="product-price">
            ₹{selectedProduct.price}
          </div>
          <div className="product-rating">
            ⭐ {selectedProduct.averageRating}
            ({selectedProduct.numOfReviews} Reviews)
          </div>
          <p className="product-description">
            {selectedProduct.description}
          </p>

          <div className="product-meta">
            <span>
              <strong>Category:</strong>
              {" "}
              {selectedProduct.category}
            </span>
            <span>
              <strong>Brand:</strong>
              {" "}
              {selectedProduct.brand}
            </span>
            <span
              className={
                selectedProduct.stock > 0 ? "in-stock" : "out-stock"
              }
            >
              {selectedProduct.stock > 0
                ? `In Stock (${selectedProduct.stock})`
                : "Out Of Stock"}
            </span>
          </div>

          <div className="quantity-wrapper">
            <button
              className="quantity-btn"
              onClick={() =>setQuantity(Math.max(1, quantity - 1))
              }
            > -
            </button>
            <span className="quantity-value">
              {quantity}
            </span>
            <button
              className="quantity-btn"
              onClick={() => 
                {
                  if (quantity < selectedProduct.stock){ setQuantity(quantity + 1);} 
                  else {toast.error("⚠️ Stock limit reached!"); }
                }
              }
            > +
            </button>
          </div>

          <button 
            className="add-cart-btn"
            disabled= { addToCartLoading }
            onClick={
              ()=> {
                addToCart(selectedProduct,quantity) 
                navigate("/cart")
              }
            }
          >
            { 
              addToCartLoading ? "Adding..." : "Add To Cart"
            }
          </button>

        </div>

      </div>
    </div>
  );
};

export default ProductDetails;