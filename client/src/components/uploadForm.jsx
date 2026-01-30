import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../store/Authentication";
import UploadProgressBar from "./UploadProgressBar";

const UploadForm = ({ eventId, onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [uploadedSize, setUploadedSize] = useState(0);
  const fileInputRef = useRef(null);
  const { token, user } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error(
        "Please select a valid video file (MP4, WebM, Ogg, MOV, AVI)",
      );
      return;
    }

    // Validate file size (1GB max)
    if (selectedFile.size > 1 * 1024 * 1024 * 1024) {
      toast.error("File size exceeds 1GB limit");
      return;
    }

    setFile(selectedFile);

    // Create preview
    const video = document.createElement("video");
    video.preload = "metadata";
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
      toast.error("Please select a video file");
      return;
    }

    if (!token || !user) {
      toast.error("Authentication required. Please log in.");
      return;
    }

    // Get userId from user object
    const userId = user?._id || user?.userId || user?.id;
    if (!userId) {
      toast.error("User ID not available. Please log in again.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadedSize(0);
    setUploadSpeed(0);
    setTimeRemaining(0);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title);
      formData.append("description", description);

      // Add eventId if provided
      if (eventId) formData.append("eventId", eventId);

      const uploadUrl = eventId
        ? `${import.meta.env.VITE_SERVER_URL}/videos/add/event/${eventId}`
        : `${import.meta.env.VITE_SERVER_URL}/videos/add/${userId}`;

      // Use XMLHttpRequest for real-time progress tracking
      const xhr = new XMLHttpRequest();
      const startTime = Date.now();
      let lastUploadedSize = 0;
      let lastTime = startTime;

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
          setUploadedSize(e.loaded);

          // Calculate upload speed and ETA
          const currentTime = Date.now();
          const timeDiff = (currentTime - lastTime) / 1000; // in seconds
          const sizeDiff = e.loaded - lastUploadedSize;

          if (timeDiff > 0.5) {
            // Update speed every 500ms
            const speed = sizeDiff / timeDiff;
            setUploadSpeed(speed);

            const remainingBytes = e.total - e.loaded;
            const eta = remainingBytes / speed;
            setTimeRemaining(eta);

            lastUploadedSize = e.loaded;
            lastTime = currentTime;
          }
        }
      });

      // Handle upload completion
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            toast.success("Video uploaded successfully!");
            setTitle("");
            setDescription("");
            setFile(null);
            setPreview(null);
            setUploading(false);
            onSuccess(data.video);
          } catch (parseError) {
            console.error("Error parsing response:", parseError);
            toast.error("Upload successful but error processing response");
            setUploading(false);
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            toast.error(data.message || `Upload failed: ${xhr.status}`);
          } catch (parseError) {
            toast.error(`Upload failed with status ${xhr.status}`);
          }
          setUploading(false);
        }
      });

      // Handle upload error
      xhr.addEventListener("error", () => {
        console.error("XHR error:", xhr);
        toast.error(
          "Network error during upload. Please check your connection.",
        );
        setUploading(false);
      });

      // Handle upload abort
      xhr.addEventListener("abort", () => {
        toast.error("Upload was cancelled");
        setUploading(false);
      });

      // Set authorization header and send
      xhr.open("POST", uploadUrl, true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed");
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Upload Video</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={uploading}
            >
              <svg
                className="w-5 sm:w-6 h-5 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="mb-6">
              <UploadProgressBar
                isUploading={uploading}
                progress={uploadProgress}
                uploadSpeed={uploadSpeed}
                timeRemaining={timeRemaining}
                fileSize={file?.size}
                uploadedSize={uploadedSize}
                fileName={file?.name}
              />
            </div>
          )}

          {!uploading && (
            <>
              {eventId && (
                <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                  <label className="block text-gray-700 mb-1 text-xs sm:text-sm font-medium">
                    Uploading to Event:
                  </label>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="font-semibold text-blue-600 text-sm truncate">
                      {eventId}
                    </p>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-sm">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-sm">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    rows="2"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 text-sm">
                    Video File
                  </label>
                  <div
                    className="border-2 border-dashed rounded-md p-6 sm:p-8 text-center cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {preview ? (
                      <div className="relative">
                        <video
                          src={preview}
                          className="w-full max-h-40 sm:max-h-48 mx-auto"
                          controls
                        />
                        <button
                          type="button"
                          className="mt-2 text-red-500 hover:text-red-700 text-sm"
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
                        <svg
                          className="w-8 sm:w-12 h-8 sm:h-12 mx-auto text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mt-2 text-xs sm:text-sm text-gray-600">
                          Click to upload (MP4, WebM, Ogg, MOV, AVI, MKV, FLV)
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Max: 1GB</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="video/*"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="order-2 sm:order-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="order-1 sm:order-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center text-sm font-medium"
                    disabled={uploading || !file}
                  >
                    {uploading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      "Upload Video"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadForm;
