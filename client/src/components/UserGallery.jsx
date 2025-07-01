// src/components/gallery/UserGallery.jsx
import React, { useState, useEffect } from 'react';
import VideoPlayer from './videoPlayer';
import UploadForm from './uploadForm';
import { useAuth } from '../store/Authentication';
import { toast } from 'react-toastify';

const UserGallery = ({ userId, token }) => {
  const { user: currentUser } = useAuth();
  const [gallery, setGallery] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const isCurrentUser = currentUser && currentUser.user._id === userId;

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const endpoint = isCurrentUser 
          ? `${import.meta.env.VITE_GALLERY_SERVICE_URL}/videos/me`
          : `${import.meta.env.VITE_GALLERY_SERVICE_URL}/videos/user/${userId}`;
        
        const headers = isCurrentUser 
          ? { Authorization: `Bearer ${token}` }
          : {};
        
        const response = await fetch(endpoint, { headers });
        const data = await response.json();
        
        if (response.ok) {
          setGallery(data);
        } else {
          toast.error(data.message || 'Failed to load gallery');
        }
      } catch (error) {
        toast.error('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [userId, token, isCurrentUser]);

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
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i]);
  };

  if (loading) {
    return <div className="text-center py-8">Loading gallery...</div>;
  }

  if (!gallery) {
    return <div className="text-center py-8">No gallery found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Video Gallery</h1>
        {isCurrentUser && (
          <button 
            onClick={() => setShowUploadForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Upload Video
          </button>
        )}
      </div>

      {showUploadForm && isCurrentUser && (
        <UploadForm 
          onClose={() => setShowUploadForm(false)} 
          onSuccess={handleUploadSuccess}
          token={token}
        />
      )}

      <div className="mb-8">
        {isCurrentUser && (
          <>
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
          </>
        )}

        <h2 className="text-xl font-semibold mb-4">Videos</h2>
        {gallery.videos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No videos uploaded yet</p>
            {isCurrentUser && (
              <button 
                onClick={() => setShowUploadForm(true)}
                className="mt-4 text-blue-500 hover:text-blue-700 font-medium"
              >
                Upload your first video
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.videos.map(video => (
              <VideoPlayer key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserGallery;