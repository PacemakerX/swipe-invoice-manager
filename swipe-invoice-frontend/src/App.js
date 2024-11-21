import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./components/Dashboard";
import FileUpload from "./components/FileUpload"; // Import FileUpload component
import Navbar from "./components/Navbar"; // Adjust path as needed
import './App.css'; // Adjust path to match your project structure


function App() {
  return (
    <div className="App">
      <Navbar />

      <div className="container mt-4">
        <h1 className="text-center">Welcome to Swipe Invoice Manager</h1>
        <p className="text-center">Select a feature to get started:</p>

        {/* Render Dashboard and FileUpload components */}
        <div className="mt-4">
          <FileUpload />
        </div>
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
