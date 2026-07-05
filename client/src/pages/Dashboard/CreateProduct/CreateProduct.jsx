import './CreateProduct.css';
import toast from "react-hot-toast";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProductDetails,
  fetchAdminProductsThunk, 
  createProductThunk, 
  updateProductThunk 
} from "../../../features/products/productThunk";
import Loader from '../../../components/Loader/Loader';

const CreateProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { productId } = useParams();
  const { loading } = useSelector((state => state.product))
  const isEditMode = Boolean(productId);

  useEffect(() => {
    if(productId){
      dispatch(fetchProductDetails(productId));  
    }
  }, [dispatch,productId]);

  const { selectedProduct, loader } = useSelector((state) => state.product);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if(selectedProduct){
      setTitle(selectedProduct.title);
      setPrice(selectedProduct.price);
      setStock(selectedProduct.stock);
      setCategory(selectedProduct.category);
      setDescription(selectedProduct.description);
    }
  },[selectedProduct]);

  const handleSubmit = async(e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("title", title);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("category", category);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    let result;
    if(isEditMode) {
      result = await dispatch(updateProductThunk( productId, formData ));
    } 
    else {
      result = await dispatch(createProductThunk(formData)); 
    }
    
    if(result.success){
      await dispatch(
        fetchAdminProductsThunk()
      );
      toast.success(isEditMode
        ? "Product Updated"
        : "Product Created"
      )
      navigate("/dashboard/products");

    } else {
      toast.error(result.message);
    }
  }

  if( loading ){ 
    return <Loader />
  }

  return (
    <div className="product-form-page">
      <div className="product-form-header">
        <h1>
          {isEditMode
          ? "Update Product"
            : "Create Product"}
        </h1>
      </div>

      <form
        className="product-form-layout"
        onSubmit={handleSubmit}>
        {/* LEFT */}
        <div className="product-left">
          <div className="form-card">
            <h3>General Information</h3>
            <input
              type="text"
              placeholder="Product Title"
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
            />
            <textarea
              placeholder="Product Description"
              value={description}
              onChange={(e)=>setDescription(e.target.value)}
            />
          </div>
          <div className="form-card">
            <h3>Pricing & Stock</h3>
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e)=>setPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Stock"
              value={stock}
              onChange={(e)=>setStock(e.target.value)}
            />
          </div>
        </div>
        {/* RIGHT */}
        <div className="product-right">
          <div className="form-card">
            <h3>Product Image</h3>
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="preview-image"
              />
            ) : selectedProduct?.images?.[0]?.url ? (
              <img
                src={selectedProduct.images[0].url}
                alt="preview"
                className="preview-image"
              />
            ) : null}
            <input
              type="file"
              onChange={(e)=>
                setImage(e.target.files[0])
              }
            />
          </div>
          <div className="form-card">
            <h3>Category</h3>
            <select
              value={category}
              onChange={(e)=>setCategory(e.target.value)}
            >
              <option value="">
                Select Category
              </option>
              <option value="electronics">
                Electronics
              </option>
              <option value="anime-card">
                Anime Card
              </option>
              <option value="fashion">
                Fashion
              </option>
              <option value="books">
                Books
              </option>
            </select>
          </div>
          <button
            type="submit"
            className="submit-btn"
          >
            {isEditMode
              ? "Update Product"
              : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;