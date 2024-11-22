import React from "react";
import { useSelector } from "react-redux";

const ProductsTable = () => {
  const products = useSelector((state) => state.data.extractedData.products);

  return (
    <div>
      <h3 className="mb-4">Products</h3>
      {products.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Tax</th>
              <th>Price with Tax</th>
              <th>Discount (Optional)</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td>{product.product_name}</td>
                <td>{product.quantity}</td>
                <td>{product.tax}</td>
                <td>{product.price_with_tax || "N/A"}</td>
                <td>{product.discount || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No products available.</p>
      )}
    </div>
  );
};

export default ProductsTable;