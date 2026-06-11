import "./ManageProducts.css";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAdminProductsThunk,deleteProductThunk } from "../../../features/products/productThunk";
import Loader from "../../../components/common/Loader/Loader";

const ManageProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { adminProducts, loader } = useSelector((state) => state.product);
  
  useEffect(() => {
    dispatch(fetchAdminProductsThunk())
  },[dispatch]);

  if (loader) {
    return (<Loader />) ;
  }

  const handleDelete = async (productId) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if(!confirmed) return;

    const result = await dispatch(deleteProductThunk(productId));

    if(result.success){
      toast.success("Product Deleted");
      
      dispatch(fetchAdminProductsThunk());
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="manage-products">
      <h2> Manage Products </h2>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {
            adminProducts.map(
              (product) => (
                <tr
                  key={product._id}
                >
                  <td>
                    <img
                      src={
                        product.images?.[0]?.url
                      }
                      alt={product.title}
                    />
                  </td>
                  <td>
                    {product.title}
                  </td>
                  <td>
                    {product.category}
                  </td>
                  <td>
                    ₹{product.price}
                  </td>
                  <td>
                    {product.stock}
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/dashboard/products/edit/${product._id}`)}
                    > Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={()=> handleDelete(product._id)} 
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )
          }
        </tbody>
      </table>
    </div>
  );
};

export default ManageProducts;