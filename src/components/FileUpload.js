import React, { useState } from 'react';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setMessage(`File "${uploadedFile.name}" selected.`);
    } else {
      setMessage('');
    }
  };

  const handleFileUpload = () => {
    if (file) {
      // Simulate file upload
      setMessage(`Uploading "${file.name}"...`);
      setTimeout(() => {
        setMessage(`"${file.name}" uploaded successfully!`);
      }, 1500); // Simulate upload delay
    } else {
      setMessage('Please select a file to upload.');
    }
  };

  return (
    <div className="card p-4" style={{ borderRadius: '15px', backgroundColor: '#f8f9fa' }}>
      <h4 className="text-center mb-3">File Upload</h4>
      <div className="mb-3">
        <input
          type="file"
          className="form-control"
          onChange={handleFileChange}
        />
      </div>
      <button
        className="btn btn-primary w-100"
        onClick={handleFileUpload}
      >
        Upload File
      </button>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
};

export default FileUpload;
