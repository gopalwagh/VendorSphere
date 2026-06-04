import "./ProductDetails.css";

const ProductDetails = () => {
  return (
    <div className="product-details">
      <div className="product-image">
        <img
          src="https://picsum.photos/600"
          alt="product"
        />
      </div>
      <div className="product-info">
        <h1>
          Wireless Headphones
        </h1>
        <h2>
          ₹2999
        </h2>
        <p>
          Premium wireless headphones
          with noise cancellation.
        </p>
        <div className="product-actions">
          <button>
            Add To Cart
          </button>
          <button>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;