// src/components/gallery/Gallery.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/Authentication';
import { toast } from 'react-toastify';
import VideoPlayer from '../components/videoPlayer';
import UploadForm from '../components/uploadForm';

const Gallery = () => {
  const { user, token } = useAuth();
  const [gallery, setGallery] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    if (user && token) {
      fetchGallery();
    }
  }, [user, token]);

  const fetchGallery = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_GALLERY_SERVICE_URL}/videos/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setGallery(data);
      } else {
        toast.error(data.message || 'Failed to load gallery');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchGallery();
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Video Gallery</h1>
        <button 
          onClick={() => setShowUploadForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Upload Video
        </button>
      </div>

      {showUploadForm && (
        <UploadForm 
          onClose={() => setShowUploadForm(false)} 
          onSuccess={handleUploadSuccess}
          token={token}
        />
      )}

      {gallery && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-xl font-semibold mb-3">Storage</h2>
            <div className="mb-2">
              <span className="font-medium">Available: </span>
              {formatBytes(gallery.freeStorage)} of {formatBytes(gallery.totalStorage)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ 
                  width: `${((gallery.totalStorage - gallery.freeStorage) / gallery.totalStorage) * 100}%` 
                }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-xl font-semibold mb-3">Bandwidth</h2>
            <div className="mb-2">
              <span className="font-medium">Available: </span>
              {formatBytes(gallery.freeBandwidth)} of {formatBytes(gallery.totalBandwidth)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ 
                  width: `${((gallery.totalBandwidth - gallery.freeBandwidth) / gallery.totalBandwidth) * 100}%` 
                }}
              ></div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Your Videos</h2>
          {gallery.videos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No videos uploaded yet</p>
              <button 
                onClick={() => setShowUploadForm(true)}
                className="mt-4 text-blue-500 hover:text-blue-700 font-medium"
              >
                Upload your first video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.videos.map(video => (
                <VideoPlayer key={video._id} video={video} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Gallery;