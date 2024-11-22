import React from "react";
import { useSelector } from "react-redux";

const InvoicesTable = () => {
  const invoices = useSelector((state) => state.data.extractedData.invoices);

  return (
    <div className="mt-4">
      <h4>Invoices</h4>
      {invoices.length > 0 ? (
        <table className="table table-bordered">
          <thead className="thead-dark">
            <tr>
              <th>Serial Number</th>
              <th>Customer Name</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr key={index}>
                <td>{invoice.serial_number}</td>
                <td>{invoice.customer_name}</td> {/* Adjusted property names */}
                <td>{invoice.product_name}</td>
                <td>{invoice.quantity}</td>
                <td>{invoice.total_amount}</td>
                <td>{invoice.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No invoices data available. Please upload a file to populate this tab.</p>
      )}
    </div>
  );
};

export default InvoicesTable;