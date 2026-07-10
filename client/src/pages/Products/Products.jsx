import "./Products.css";
import ProductCard from "../../components/ProductCard/ProductCard";
import Loader from "../../components/Loader/Loader";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../features/products/productThunk";
import { useSearchParams } from "react-router-dom";

const categoryOptions = [
  "beauty-personal-care", "electronics", "anime-card", 
  "fashion", "sports-fitness", "books", "mobiles","automotive", 
  "gaming", "home-kitchen", "groceries", "furniture", "pet-supplies"
];

const sortLabels = {
  priceLowToHigh: "Price low to high",
  priceHighToLow: "Price high to low",
  latest: "Latest",
};

const Products = () => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const dispatch = useDispatch();
  const { products, loading, pagination } = useSelector((state) => state.product);

  useEffect(() => {
    const querySearch = searchParams.get("search") || "";
    const queryCategory = searchParams.get("category") || "";
    const querySort = searchParams.get("sort") || "";

    setSearchInput(querySearch);
    setSearch(querySearch);
    setCategory(queryCategory.toLowerCase());
    setSort(querySort);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    dispatch(
      fetchProducts({
        page,
        category,
        search,
        sort,
      })
    );
  }, [dispatch, page, category, search, sort]);

  const syncSearchParams = (nextState) => {
    const params = {};

    if (nextState.search) params.search = nextState.search;
    if (nextState.category) params.category = nextState.category;
    if (nextState.sort) params.sort = nextState.sort;

    setSearchParams(params);
  };

  const activeFilters = useMemo(() => {
    const filters = [];

    if (search) filters.push(`Search: ${search}`);
    if (category) filters.push(`Category: ${category}`);
    if (sort) filters.push(`Sort: ${sortLabels[sort] || sort}`);

    return filters;
  }, [search, category, sort]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const nextSearch = searchInput.trim();

    setPage(1);
    setSearch(nextSearch);
    syncSearchParams({
      search: nextSearch,
      category,
      sort,
    });
  };

  const handleCategorySelect = (nextCategory) => {
    setPage(1);
    setCategory(nextCategory);
    syncSearchParams({
      search,
      category: nextCategory,
      sort,
    });
  };

  const handleSortChange = (event) => {
    const nextSort = event.target.value;
    setPage(1);
    setSort(nextSort);
    syncSearchParams({
      search,
      category,
      sort: nextSort,
    });
  };

  const clearFilters = () => {
    setPage(1);
    setCategory("");
    setSearchInput("");
    setSearch("");
    setSort("");
    setSearchParams({});
  };

  if (loading && products.length === 0) {
    return <Loader />;
  }

  return (
    <div className="products-page">
      <aside className="filters">
        <div className="filter-card">
          <span className="hero-kicker">Explore</span>
          <h3>Filters</h3>
        </div>

        <form className="search-filter" onSubmit={handleSearchSubmit}>
          <label htmlFor="product-search">Search</label>
          <div className="search-inline">
            <input
              id="product-search"
              type="search"
              placeholder="Search products..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button type="submit">Go</button>
          </div>
        </form>

        <div className="filter-group">
          <div className="filter-title-row">
            <h4>Category</h4>
            <button type="button" className="clear-link" onClick={() => handleCategorySelect("")}>
              Clear
            </button>
          </div>

          <div className="category-pills">
            {categoryOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={category === option ? "category-pill active" : "category-pill"}
                onClick={() => handleCategorySelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-title-row">
            <h4>Sort</h4>
          </div>
          <select value={sort} onChange={handleSortChange}>
            <option value="">Default</option>
            <option value="priceLowToHigh">Price low to high</option>
            <option value="priceHighToLow">Price high to low</option>
          </select>
        </div>

        <button type="button" className="reset-btn" onClick={clearFilters}>
          Reset Filters
        </button>
      </aside>

      <section className="products-content">
        <div className="products-header">
          <div>
            <span className="hero-kicker">Catalog</span>
            <h2>All Products</h2>
          </div>
          <div className="header-stats">
            <div className="header-stat">
              <span>Showing</span>
              <strong>{products.length}</strong>
            </div>
            <div className="header-stat">
              <span>Total</span>
              <strong>{pagination?.totalProducts || 0}</strong>
            </div>
          </div>
        </div>

        <div className="filter-summary">
          {activeFilters.length ? activeFilters.join(" | ") : "No filters active"}
        </div>

        {loading && products.length > 0 && <div className="inline-loader">Refreshing catalog...</div>}

        {products.length === 0 ? (
          <div className="empty-products-state">
            <h3>No products found</h3>
            <p>Try a different search term or reset the filters.</p>
            <button type="button" onClick={clearFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div className="pagination">
          <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>

          {[...Array(pagination?.totalPages || 1)].map((_, index) => (
            <button
              type="button"
              key={index}
              className={page === index + 1 ? "active-page" : ""}
              onClick={() => setPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            type="button"
            disabled={page === pagination?.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
};

export default Products;
