import "./Products.css";
import ProductCard from "../../components/product/ProductCard/ProductCard";
import { useEffect, useState } from "react";
import { useDispatch, useSelector, } from "react-redux";
import { fetchProducts, } from "../../features/products/productThunk";

const Products = () => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  const dispatch = useDispatch();
 
  const { products, loading, pagination, } = useSelector((state)=> state.product);

  useEffect(() => {
    dispatch(fetchProducts({
        page,
        category,
        search,
        sort,
      })
    );
  }, [dispatch, page, category, search, sort]);

  return (
    <div className="products-page">
      <aside className="filters">
        <h3>Filters</h3>
        <div className="filter-group">
          <h4>Category</h4>
          <label>
            <input 
              type="radio" 
              name="category"
              onChange={() => 
                setCategory("electronics")
              }
            />
            Electronics
          </label>
          <label>
            <input
              type="radio"
              name="category"
              onChange={()=>
                setCategory("fashion")
              } 
            />
            Fashion
          </label>
          <label>
            <input 
              type="radio"
              name="category"
              onChange={()=>
                setCategory("Books")
              }
            />
            Books
          </label>
          <select
            value={sort}
            onChange={(e) =>
              setSort(
                e.target.value
              )
            }
          >
            <option value=""> Default </option>
            <option value="priceLowToHigh">
              Price Low To High
            </option>
            <option value="priceHighToLow">
              Price High To Low
            </option>
          </select>
        </div>
      </aside>
      
      <section className="products-content">
        <h2>All Products</h2>
        <div className="products-grid">
          {
            products.map((product) =>  (
              <ProductCard key={product._id} product={product} />
            )
          )}
        </div>
        {/* Pagination below products grid */}
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>

          {[...Array(pagination?.totalPages || 1)].map((_, index) => (
            <button
              key={index}
              className={page === index + 1 ? "active-page" : ""}
              onClick={() => setPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={page === pagination?.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  )
}

export default Products;
