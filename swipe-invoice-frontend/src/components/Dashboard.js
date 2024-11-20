import React, { useState } from "react";
import InvoicesTable from "./InvoicesTable"; // Placeholder for Invoices
import ProductsTable from "./ProductsTable"; // Placeholder for Products
import CustomersTable from "./CustomersTable"; // Placeholder for Customers

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(null);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "invoices":
        return <InvoicesTable />;
      case "products":
        return <ProductsTable />;
      case "customers":
        return <CustomersTable />;
      default:
        return <p>Please select a feature</p>;
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-4">
          <div
            className="card"
            onClick={() => setActiveTab("invoices")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body">
              <h5 className="card-title">Invoices</h5>
              <p className="card-text">Manage your invoices here.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card"
            onClick={() => setActiveTab("products")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body">
              <h5 className="card-title">Products</h5>
              <p className="card-text">View and manage product details.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="card"
            onClick={() => setActiveTab("customers")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-body">
              <h5 className="card-title">Customers</h5>
              <p className="card-text">View and manage customers.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">{renderActiveTab()}</div>
    </div>
  );
};

export default Dashboard;
