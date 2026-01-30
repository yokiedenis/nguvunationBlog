# Frontend Integration Guide - Event Video Solution

## React Component Examples

### 1. Video Upload Component (User Gallery)

```jsx
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";

export const VideoUploadForm = ({ userId, onSuccess }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    visibility: "public",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, video: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append("video", formData.video);
      uploadData.append("title", formData.title);
      uploadData.append("description", formData.description);
      uploadData.append("category", formData.category);
      uploadData.append("visibility", formData.visibility);

      const response = await axios.post(
        `http://localhost:5000/videos/add/${userId}`,
        uploadData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setFormData({
        title: "",
        description: "",
        category: "other",
        visibility: "public",
      });

      onSuccess(response.data.video);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Upload Video</h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Video File *
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Video title"
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Video description"
          rows="4"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="fundraiser">Fundraiser</option>
            <option value="performance">Performance</option>
            <option value="testimonial">Testimonial</option>
            <option value="behind-the-scenes">Behind the Scenes</option>
            <option value="announcement">Announcement</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Visibility
          </label>
          <select
            name="visibility"
            value={formData.visibility}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="membersOnly">Members Only</option>
          </select>
        </div>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Video"}
      </button>
    </form>
  );
};
```

---

### 2. Event Gallery Component

```jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export const EventGallery = ({ eventId }) => {
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({
    category: "",
    sort: "recent",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventGallery();
  }, [eventId, filter]);

  const fetchEventGallery = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.category) params.category = filter.category;
      params.sort = filter.sort;

      const response = await axios.get(
        `http://localhost:5000/videos/event/${eventId}/videos`,
        { params },
      );

      setVideos(response.data.videos);

      // Fetch stats
      const statsResponse = await axios.get(
        `http://localhost:5000/videos/event/${eventId}`,
      );
      setStats(statsResponse.data.stats);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Event Gallery</h2>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded">
          <div>
            <p className="text-gray-600">Total Videos</p>
            <p className="text-2xl font-bold">{stats.totalVideos}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Views</p>
            <p className="text-2xl font-bold">{stats.totalViews}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Likes</p>
            <p className="text-2xl font-bold">{stats.totalLikes}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Category
          </label>
          <select
            value={filter.category}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, category: e.target.value }))
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="">All Categories</option>
            <option value="fundraiser">Fundraiser</option>
            <option value="performance">Performance</option>
            <option value="testimonial">Testimonial</option>
            <option value="behind-the-scenes">Behind the Scenes</option>
            <option value="announcement">Announcement</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Sort By
          </label>
          <select
            value={filter.sort}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, sort: e.target.value }))
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="recent">Recent</option>
            <option value="views">Most Viewed</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center text-gray-500 py-8">No videos found</div>
      )}
    </div>
  );
};

const VideoCard = ({ video }) => {
  const [liked, setLiked] = useState(false);
  const { token } = useAuth();

  const handleLike = async () => {
    if (!token) {
      alert("Please login to like videos");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/videos/${video._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setLiked(!liked);
    } catch (error) {
      console.error("Like failed:", error);
    }
  };

  const handleView = async () => {
    try {
      await axios.post(`http://localhost:5000/videos/${video._id}/view`, {});
    } catch (error) {
      console.error("View tracking failed:", error);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      {video.thumbnail ? (
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-40 object-cover cursor-pointer"
          onClick={handleView}
        />
      ) : (
        <div
          className="w-full h-40 bg-gray-300 flex items-center justify-center cursor-pointer"
          onClick={handleView}
        >
          <span className="text-gray-600">No Thumbnail</span>
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{video.description}</p>

        <div className="flex items-center justify-between text-gray-600 text-sm mb-3">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {video.category}
          </span>
          <span>{video.duration}s</span>
        </div>

        <div className="flex items-center justify-between text-gray-600 text-sm mb-3">
          <span>👁️ {video.views} views</span>
          <span>💬 {video.likes} likes</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleLike}
            className={`flex-1 py-2 rounded text-sm font-semibold transition ${
              liked
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {liked ? "❤️ Liked" : "🤍 Like"}
          </button>
          <button
            onClick={handleView}
            className="flex-1 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
          >
            Watch
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

### 3. Event Video Upload Component

```jsx
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";

export const EventVideoUpload = ({ eventId, onSuccess }) => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    visibility: "public",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, video: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const uploadData = new FormData();
      uploadData.append("video", formData.video);
      uploadData.append("title", formData.title);
      uploadData.append("description", formData.description);
      uploadData.append("category", formData.category);
      uploadData.append("visibility", formData.visibility);

      const response = await axios.post(
        `http://localhost:5000/videos/add/event/${eventId}`,
        uploadData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setFormData({
        title: "",
        description: "",
        category: "other",
        visibility: "public",
      });

      onSuccess(response.data.video);
      alert("Video uploaded successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Upload to Event</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Video File *
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            required
            className="w-full border-2 border-dashed rounded px-3 py-4"
          />
          <p className="text-gray-600 text-sm mt-1">
            Supported: MP4, WebM, Ogg, Mov, Avi
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Event Highlights"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your video"
            rows="3"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="fundraiser">Fundraiser</option>
              <option value="performance">Performance</option>
              <option value="testimonial">Testimonial</option>
              <option value="behind-the-scenes">Behind the Scenes</option>
              <option value="announcement">Announcement</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Visibility
            </label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="membersOnly">Members Only</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 font-semibold"
        >
          {loading ? "Uploading..." : "Upload to Event"}
        </button>
      </form>
    </div>
  );
};
```

---

### 4. Event Analytics Component (Organizer)

```jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";

export const EventAnalytics = ({ eventId }) => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [eventId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/videos/event/${eventId}/analytics`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAnalytics(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-center p-4">Loading analytics...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!analytics) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Event Analytics</h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Videos" value={analytics.totalVideos} />
        <StatCard label="Total Views" value={analytics.totalViews} />
        <StatCard label="Total Engagement" value={analytics.totalEngagement} />
        <StatCard
          label="Avg Views/Video"
          value={analytics.engagement.avgViewsPerVideo}
        />
      </div>

      {/* Engagement Metrics */}
      <div className="bg-gray-50 p-4 rounded mb-6">
        <h3 className="font-semibold text-lg mb-4">Engagement Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Avg Likes/Video</p>
            <p className="text-2xl font-bold">
              {analytics.engagement.avgLikesPerVideo}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Engagement Rate</p>
            <p className="text-2xl font-bold">
              {analytics.engagement.engagementRate}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Event Type</p>
            <p className="text-2xl font-bold capitalize">
              {analytics.eventType}
            </p>
          </div>
        </div>
      </div>

      {/* Videos by Category */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-4">Videos by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(analytics.videosByCategory).map(
            ([category, count]) => (
              <div key={category} className="bg-blue-50 p-4 rounded">
                <p className="text-gray-600 capitalize">{category}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Top Videos */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-4">Top Performing Videos</h3>
        <div className="space-y-3">
          {analytics.topVideos.map((video, index) => (
            <div
              key={video._id}
              className="border rounded p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    #{index + 1} - {video.title}
                  </p>
                  <p className="text-gray-600 text-sm">
                    By: {video.uploadedBy.name}
                  </p>
                </div>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded capitalize">
                  {video.category}
                </span>
              </div>
              <div className="flex gap-6 mt-2 text-sm text-gray-600">
                <span>👁️ {video.views} views</span>
                <span>❤️ {video.likes} likes</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
    <p className="text-gray-700 text-sm">{label}</p>
    <p className="text-3xl font-bold text-blue-600">{value}</p>
  </div>
);
```

---

### 5. API Service Hook

```jsx
// hooks/useVideoAPI.js
import { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/videos";

export const useVideoAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Upload video to user gallery
  const uploadUserVideo = async (userId, formData, token) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/add/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload video to event
  const uploadEventVideo = async (eventId, formData, token) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/add/event/${eventId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user gallery
  const getUserGallery = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/user/${userId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch gallery");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get event gallery
  const getEventGallery = async (eventId, category = null) => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      const response = await axios.get(`${API_BASE}/event/${eventId}`, {
        params,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch gallery");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Like video
  const likeVideo = async (videoId, token) => {
    try {
      const response = await axios.post(
        `${API_BASE}/${videoId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Like action failed");
      throw err;
    }
  };

  // Record view
  const recordView = async (videoId) => {
    try {
      const response = await axios.post(`${API_BASE}/${videoId}/view`, {});
      return response.data;
    } catch (err) {
      console.error("View tracking failed:", err);
    }
  };

  // Get analytics
  const getEventAnalytics = async (eventId, token) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/event/${eventId}/analytics`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch analytics");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    uploadUserVideo,
    uploadEventVideo,
    getUserGallery,
    getEventGallery,
    likeVideo,
    recordView,
    getEventAnalytics,
  };
};
```

---

## Integration Checklist

- [ ] Install axios (already in project)
- [ ] Create auth context with token storage
- [ ] Import VideoUploadForm in user profile page
- [ ] Add EventGallery to event detail page
- [ ] Add EventVideoUpload to event edit page (organizer only)
- [ ] Add EventAnalytics to event dashboard (organizer only)
- [ ] Setup useVideoAPI hook
- [ ] Add video player component
- [ ] Add like/view tracking on video play
- [ ] Style components to match design
- [ ] Test all upload scenarios
- [ ] Test visibility controls
- [ ] Test analytics rendering

---

## Environment Variables (Frontend)

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_VIDEO_API=http://localhost:5000/videos
```

---

**Last Updated:** January 30, 2026
**Version:** 1.0
