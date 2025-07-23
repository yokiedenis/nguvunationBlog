import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../store/Authentication';

const UploadForm = ({ eventId, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { token, user } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please select a valid video file (MP4, WebM, Ogg, MOV, AVI)');
      return;
    }
    
    // Validate file size (100MB max)
    if (selectedFile.size > 100 * 1024 * 1024) {
      toast.error('File size exceeds 100MB limit');
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    };
    video.src = URL.createObjectURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a video file');
      return;
    }
    
    if (!token || !user) {
      toast.error('Authentication required. Please log in.');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title);
      formData.append('description', description);
      
      // Add eventId if provided
      if (eventId) formData.append('eventId', eventId);

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/videos/add/${user._id || user.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }
      
      toast.success('Video uploaded successfully!');
      setTitle('');
      setDescription('');
      setFile(null);
      setPreview(null);
      onSuccess(data.video);
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Upload Video</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {eventId && (
            <div className="mb-4 bg-blue-50 p-3 rounded-lg">
              <label className="block text-gray-700 mb-1 text-sm font-medium">
                Uploading to Event:
              </label>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="font-semibold text-blue-600">
                  {eventId}
                </p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows="3"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Video File</label>
              <div 
                className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => fileInputRef.current.click()}
              >
                {preview ? (
                  <div className="relative">
                    <video 
                      src={preview} 
                      className="w-full max-h-48 mx-auto"
                      controls
                    />
                    <button 
                      type="button"
                      className="mt-2 text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreview(null);
                      }}
                    >
                      Change File
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload a video (MP4, WebM, Ogg)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max file size: 100MB
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="video/mp4,video/webm,video/ogg"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={uploading || !file}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : 'Upload Video'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadForm;