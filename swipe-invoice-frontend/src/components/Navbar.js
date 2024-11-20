import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";
import logo from "../assets/swipe_logo.svg";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          <img
            src={logo}
            alt="Swipe Logo"
            width="40"
            height="40"
            className="d-inline-block align-top"
            style={{ marginRight: "20px" }}
          />
          <span>Swipe Invoice Manager</span>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="#invoices">
                Invoices
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="./products">
                Products
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#customers">
                Customers
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
