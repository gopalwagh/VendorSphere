import './CreateProduct.css';
import toast from "react-hot-toast";
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProductDetails,
  fetchAdminProductsThunk, 
  createProductThunk, 
  updateProductThunk,
  bulkUploadProductsThunk
} from "../../../features/products/productThunk";
import Loader from '../../../components/Loader/Loader';
import { Download, UploadCloud, X, Info, FileSpreadsheet, Plus, LayoutGrid, Image as ImageIcon } from 'lucide-react';
import * as XLSX from 'xlsx';

const CreateProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { productId } = useParams();
  const { loading } = useSelector((state) => state.product);
  const isEditMode = Boolean(productId);

  useEffect(() => {
    if(productId){
      dispatch(fetchProductDetails(productId));  
    }
  }, [dispatch,productId]);

  const { selectedProduct } = useSelector((state) => state.product);

  const [activeTab, setActiveTab] = useState(isEditMode ? "manual" : "manual");
  
  // Manual Form States
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  // Bulk Upload States
  const [bulkFile, setBulkFile] = useState(null);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if(selectedProduct && isEditMode){
      setTitle(selectedProduct.title || "");
      setPrice(selectedProduct.price || "");
      setStock(selectedProduct.stock || "");
      setCategory(selectedProduct.category || "");
      setDescription(selectedProduct.description || "");
    }
  },[selectedProduct, isEditMode]);
  
  const categories = [
    { label: "Electronics", value: "electronics" },
    { label: "Anime Card", value: "anime-card" },
    { label: "Fashion", value: "fashion" },
    { label: "Books", value: "books" },
    { label: "Home & Kitchen", value: "home-kitchen" },
    { label: "Beauty & Personal Care", value: "beauty-personal-care" },    
    { label: "Sports & Fitness", value: "sports-fitness" },
    { label: "Groceries", value: "groceries" },
    { label: "Furniture", value: "furniture" },
    { label: "Automotive", value: "automotive" },
    { label: "Pet Supplies", value: "pet-supplies" },
    { label: "Gaming", value: "gaming" },
  ];

  const handleManualSubmit = async(e) => {
    e.preventDefault();
    if (!title || !price || !stock || !category || !description) {
      toast.error("Please fill all required fields");
      return;
    }

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
      await dispatch(fetchAdminProductsThunk());
      toast.success(isEditMode ? "Product Updated" : "Product Created");
      navigate("/dashboard/products");
    } else {
      toast.error(result.message);
    }
  }

  // Bulk handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    validateAndSetBulkFile(file);
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetBulkFile(file);
  };
  
  const validateAndSetBulkFile = (file) => {
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setBulkFile(file);
      } else {
        toast.error("Please upload a valid Excel file (.xlsx or .xls)");
      }
    }
  };

  const handleProcessUpload = async () => {
    if (!bulkFile) {
      toast.error("Please select a file to upload");
      return;
    }
    
    setIsProcessingBulk(true);
    
    const formData = new FormData();
    formData.append("excelFile", bulkFile);
    
    const result = await dispatch(bulkUploadProductsThunk(formData));
    
    if (result.success) {
      toast.success(result.data?.message || "File uploaded successfully!");
      setBulkFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // refresh products
      await dispatch(fetchAdminProductsThunk());
      navigate("/dashboard/products");
    } else {
      const errorMessage = 
        result.payload?.message || // Standard RTK rejectWithValue path
        result.error?.message ||   // RTK default serializable error path
        result.message ||           // Custom return path
        "Bulk upload failed";
        
      toast.error(errorMessage);
    }
    
    setIsProcessingBulk(false);
  };

  const handleDownloadTemplate = () => {
    // Generate an array with exactly one row representing the headers
    const ws = XLSX.utils.json_to_sheet([
      { title: "", description: "", price: "", category: "", brand: "", stock: "" }
    ]);
    
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products Template");
    
    // Download the Excel file
    XLSX.writeFile(wb, "bulk_upload_template.xlsx");
  };

  if(loading) { 
    return <Loader />
  }

  return (
    <div className="cp-container">
      {/* Header Section */}
      <div className="cp-header">
        <h1>{isEditMode ? "Edit Product" : "Add New Products"}</h1>
        <p>
          {isEditMode 
            ? "Update the details of your existing product below." 
            : "Expand your catalog by adding products manually or via bulk excel upload."}
        </p>
      </div>

      {/* Tabs */}
      {!isEditMode && (
        <div className="cp-tabs">
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`cp-tab-btn ${activeTab === "manual" ? "active" : ""}`}
          >
            <Plus size={18} />
            Add Manually
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bulk")}
            className={`cp-tab-btn ${activeTab === "bulk" ? "active" : ""}`}
          >
            <FileSpreadsheet size={18} />
            Bulk Import via Excel
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="cp-content-box">
        
        {/* TAB 1: BULK IMPORT */}
        {activeTab === "bulk" && !isEditMode && (
          <div className="cp-bulk-section">
            <div className="cp-bulk-header">
              <div>
                <h2>Upload Excel File</h2>
                <p>Download the template, fill it out, and upload it back here.</p>
              </div>
              <button type="button" className="cp-download-btn" onClick={handleDownloadTemplate}>
                <Download size={16} />
                Download Sample Template
              </button>
            </div>

            {/* Alert Box */}
            <div className="cp-alert-box">
              <Info className="cp-alert-icon" size={20} />
              <p>
                <strong>Note:</strong> Bulk upload imports <strong> textual </strong>details only (Title, Price, Stock, Category, Brand, Description). You can add or <strong>update images</strong> for these products individually post-upload from the Product Management list.
              </p>
            </div>

            {/* Drag and Drop Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cp-dropzone ${isDragging ? "dragging" : ""} ${bulkFile ? "has-file" : ""}`}
            >
              <input 
                type="file" 
                className="cp-hidden-input" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
              />
              
              {!bulkFile ? (
                <>
                  <div className="cp-dropzone-icon">
                    <UploadCloud size={32} />
                  </div>
                  <h3>Click to upload or drag and drop</h3>
                  <p>XLSX or XLS (Max. 5MB)</p>
                </>
              ) : (
                <div className="cp-dropzone-file">
                  <div className="cp-dropzone-icon success">
                    <FileSpreadsheet size={32} />
                  </div>
                  <h3>{bulkFile.name}</h3>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBulkFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="cp-remove-file-btn"
                  >
                    <X size={14} />
                    Remove File
                  </button>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="cp-bulk-actions">
              <button
                type="button"
                onClick={handleProcessUpload}
                disabled={!bulkFile || isProcessingBulk}
                className="cp-process-btn"
              >
                {isProcessingBulk ? (
                  <>
                    <span className="cp-spinner"></span>
                    Uploading to background queue...
                  </>
                ) : (
                  "Process Upload"
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: ADD MANUALLY (and Edit Mode) */}
        {(activeTab === "manual" || isEditMode) && (
          <form onSubmit={handleManualSubmit} className="cp-manual-form">
            
            {/* LEFT COLUMN */}
            <div className="cp-form-left">
              <div className="cp-form-section">
                <div className="cp-section-title">
                  <LayoutGrid size={20} />
                  <h3>General Information</h3>
                </div>
                <div className="cp-form-group">
                  <label>Product Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Premium Wireless Headphones"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="cp-form-group">
                  <label>Product Description</label>
                  <textarea
                    placeholder="Describe the features, benefits, and details of your product..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>

              <hr className="cp-divider" />

              <div className="cp-form-section">
                <div className="cp-section-title">
                  <h3>Pricing & Inventory</h3>
                </div>
                <div className="cp-row-2">
                  <div className="cp-form-group cp-relative">
                    <label>Price (Rs.)</label>
                    <div className="cp-input-prefix">
                      <span>₹</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="cp-form-group">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="cp-form-right">
              
              {/* Product Image */}
              <div className="cp-card">
                <div className="cp-section-title">
                  <ImageIcon size={20} />
                  <h3>Product Image</h3>
                </div>
                
                <div className="cp-image-upload">
                  <div className="cp-image-preview">
                    {image ? (
                      <img
                        src={URL.createObjectURL(image)}
                        alt="preview"
                      />
                    ) : selectedProduct?.images?.[0]?.url ? (
                      <img
                        src={selectedProduct.images[0].url}
                        alt="preview"
                      />
                    ) : (
                      <div className="cp-image-placeholder">
                        <ImageIcon size={48} />
                        <span>No image selected</span>
                      </div>
                    )}
                    <label className="cp-image-overlay">
                      <span>Change Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                      />
                    </label>
                  </div>
                  {!image && !selectedProduct?.images?.[0]?.url && (
                    <label className="cp-upload-btn-label">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="cp-card">
                <div className="cp-section-title">
                  <h3>Category</h3>
                </div>
                <div className="cp-form-group">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="cp-select"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="cp-submit-btn">
                {isEditMode ? "Update Product" : "Create Product"}
              </button>
            </div>
            
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateProduct;