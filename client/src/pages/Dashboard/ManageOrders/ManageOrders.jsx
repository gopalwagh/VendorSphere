import "./ManageOrders.css";
import DataTable from "../../../components/dashboard/DataTable/DataTable";

const ManageOrders = () => {
  const columns = [
    "Order ID",
    "Customer",
    "Amount",
    "Status",
  ];

  const data = [
    {
      "Order ID": "#ORD123",
      Customer: "Gopal",
      Amount: "₹2999",
      Status: "Delivered",
    },
    {
      "Order ID": "#ORD124",
      Customer: "Rahul",
      Amount: "₹1999",
      Status: "Pending",
    },
  ];

  return (
    <div className="manage-orders">
      <h1>Manage Orders</h1>
      <div className="table-wrapper">
        <DataTable
          columns={columns}
          data={data}
        />
      </div>
    </div>
  );
};

export default ManageOrders;