import "./Categories.css";

const Categories = () => {
  const categories = [
    "Electronics",
    "Fashion",
    "Shoes",
    "Books",
    "Mobiles",
    "Gaming"
  ];

  return (
    <section className="categories">
      <h2>Shop By Category</h2>
      <div className="category-grid">
        {
          categories.map((item)=>(
            <div 
              key={item}
              className="category-card"
            >
              {item}
            </div>  
          ))
        }
      </div>
    </section>
  )
}

export default Categories;