import "./sidebar.css";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaBars } from "react-icons/fa";

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const isApproved = user?.sellerStatus === "approved";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sellerLinks = [
    {
      label: "Seller Application",
      path: "/seller/application",
    },
  ];

  const adminLinks = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Products",
      path: "/dashboard/products",
    },
    {
      label: "Create",
      path: "/dashboard/products/create",
    },
    {
      label: "Orders",
      path: "/dashboard/orders",
    },
    {
      label: "Analytics",
      path: "/dashboard/analytics",
    },
  ];

  const superAdminLinks = [
    {
      label: "Dashboard",
      path: "/super-admin",
    },
    {
      label: "Pending Applications",
      path: "/super-admin/applications",
    },
    {
      label: "Approved Sellers",
      path: "/super-admin/approved-sellers",
    },
    {
      label: "Users",
      path: "/super-admin/users",
    },
    {
      label: "Coupons",
      path: "/super-admin/coupons",
    },
  ];

  const links = user?.role === "superAdmin" ? superAdminLinks : isApproved ? adminLinks : sellerLinks;

  return (
    <>
      <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} type="button">
        <FaBars />
      </button>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={sidebarOpen ? "sidebar open" : "sidebar"}>
        <h2>{user?.role === "superAdmin" ? "Super Admin" : "Seller Panel"}</h2>

        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </aside>
    </>
  );
};

export default Sidebar;
