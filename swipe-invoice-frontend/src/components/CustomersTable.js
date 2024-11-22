import React from "react";
import { useSelector } from "react-redux";

const CustomersTable = () => {
  const customers = useSelector((state) => state.data.extractedData.customers);

  return (
    <div>
      <h3 className="mb-4">Customers</h3>
      {customers.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Total Purchase Amount</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={index}>
                <td>{customer.customer_name}</td>
                <td>{customer.phone_number || "N/A"}</td>
                <td>{customer.total_purchase_amount || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No customers available.</p>
      )}
    </div>
  );
};

export default CustomersTable;
