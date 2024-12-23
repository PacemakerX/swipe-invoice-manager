import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setMessage, setExtractedData } from "../store/actions";
import axios from "axios";

const FileUpload = () => {
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null); // Ref for the file input field

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setSelectedFile(uploadedFile);
      dispatch(setMessage(`File "${uploadedFile.name}" selected.`));
    } else {
      dispatch(setMessage("No file selected."));
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      dispatch(setMessage("Please select a file first."));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        "https://swipe-invoice-manager-backend.onrender.com/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (event) => {
            if (event.total) {
              setUploadProgress(Math.round((event.loaded * 100) / event.total));
            }
          },
        }
      );

      if (!response.data) {
        throw new Error("Failed to process file.");
      }

      dispatch(setExtractedData(response.data.structuredData));
      dispatch(setMessage("File processed successfully."));
    } catch (error) {
      dispatch(setMessage(`Error: ${error.message}`));
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset the file input field
    }
  };

  return (
    <div
      className="card p-4"
      style={{ borderRadius: "15px", backgroundColor: "#f8f9fa" }}
    >
      <h4 className="text-center mb-3">File Upload</h4>
      <div className="mb-3">
        <input
          ref={fileInputRef} // Attach the ref to the file input
          type="file"
          className="form-control"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
      <button
        className="btn btn-primary w-100"
        onClick={handleFileUpload}
        disabled={isUploading || !selectedFile}
      >
        {isUploading ? "Uploading..." : "Upload File"}
      </button>
      {isUploading && (
        <div className="mt-3">
          <div className="progress">
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              style={{ width: `${uploadProgress}%` }}
              aria-valuenow={uploadProgress}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {uploadProgress}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
