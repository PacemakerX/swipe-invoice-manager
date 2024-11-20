import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setMessage, setExtractedData } from '../store/actions'; 

const FileUpload = () => {
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setSelectedFile(uploadedFile);
    if (uploadedFile) {
      dispatch(setMessage(`File "${uploadedFile.name}" selected.`));
    } else {
      dispatch(setMessage('No file selected.'));
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      dispatch(setMessage('Please select a file first.'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      dispatch(setExtractedData(data.extractedData));
      dispatch(setMessage('File uploaded and processed successfully.'));
    } catch (error) {
      dispatch(setMessage(`Error: ${error.message}`));
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
    </div>
  );
};

export default FileUpload;
