import DataTable from "../../../components/dashboard/DataTable/DataTable";

const ManageProducts = () => {
  const columns = [
    "Name",
    "Price",
    "Stock"
  ];

  const data = [
    {
      Name: "Headphones",
      Price: "₹2999",
      Stock: 20,
    },
    {
      Name: "Watch",
      Price: "₹1999",
      Stock: 15,
    },
  ];

  return (
    <div className="manage-products">
      <div
      className="manage-products-header">
        <h1>
          Manage Products
        </h1>
        <button className="add-product-btn">
          Add Product
        </button>
      </div>
      <div className="table-wrapper">
        <DataTable
          columns={columns}
          data={data}
        />
      </div>
      
    </div>
  );
};

export default ManageProducts;