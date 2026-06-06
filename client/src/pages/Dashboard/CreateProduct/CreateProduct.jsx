import './CreateProduct.css';

const CreateProduct = () => {
  return (
    <div className="create-product">
      <h1>
        Create Product
      </h1>
      <form className="create-product-form">
        <input
          type="text"
          placeholder="Product Name"
        />
        <input
          type="number"
          placeholder="Price"
        />
        <input
          type="number"
          placeholder="Stock"
        />
        <textarea
          placeholder="Description"
        />
        <input
          type="file"
        />
        <button className="create-product-btn">
          Create Product
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;