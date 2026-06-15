import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader/Loader";
import { useEffect } from "react";
import { getAllUsersThunk } from "../../features/seller/sellerThunk";
import { FiUsers } from "react-icons/fi";
import "./Users.css";

const Users = () => {
  const dispatch = useDispatch();
  const { allUsers, loading } = useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(getAllUsersThunk());
  }, [dispatch]);

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <div className="page-header-row">
        <h1>All Users <span className="count-badge">{allUsers.length}</span></h1>
      </div>

      {allUsers.length === 0 ? (
        <div className="empty-state">
          <FiUsers className="empty-state-icon" />
          <h3>No Users Found</h3>
          <p>There are no users registered on the platform yet.</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>
                    <span style={{ color: "var(--muted)" }}>{user.email}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.role === 'superAdmin' ? 'rejected' : user.role === 'admin' ? 'approved' : 'pending'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;