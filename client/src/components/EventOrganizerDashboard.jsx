import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../store/Authentication";
import EventParticipantManager from "./EventParticipantManager";

const EventOrganizerDashboard = ({ eventId, onClose }) => {
  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showParticipantManager, setShowParticipantManager] = useState(false);
  const [editingSettings, setEditingSettings] = useState(false);
  const [allowVideoUpload, setAllowVideoUpload] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);

      // Fetch event details
      const eventRes = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setEvent(eventRes.data.event);
      setAllowVideoUpload(eventRes.data.event.allowVideoUpload !== false);

      // Fetch event analytics
      try {
        const analyticsRes = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/videos/event/${eventId}/analytics`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setAnalytics(analyticsRes.data.analytics || {});
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }

      // Fetch event videos
      try {
        const videosRes = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/videos/event/${eventId}/videos`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setVideos(videosRes.data.videos || []);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      toast.error("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/events/${eventId}`,
        { allowVideoUpload },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setEditingSettings(false);
      toast.success("Event settings updated");
      fetchEventData();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  };

  const handleDeleteEvent = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Event deleted successfully");
      onClose();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-4 sm:my-8">
        {/* Header */}
        <div className="flex justify-between items-start sm:items-center p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
              {event?.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
              {event?.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 flex-shrink-0"
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

        {/* Tabs */}
        <div className="flex border-b bg-gray-50 overflow-x-auto">
          {["overview", "videos", "analytics", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Event Details */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Location</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                    {event?.location || "N/A"}
                  </p>
                </div>
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Participants
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800">
                    {event?.participants?.length || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Event Date</p>
                  <p className="text-base sm:text-lg font-semibold text-gray-800">
                    {formatDate(event?.eventDate)}
                  </p>
                </div>
                <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {new Date(event?.eventDate) > new Date()
                      ? "Upcoming"
                      : "Completed"}
                  </p>
                </div>
              </div>

              {/* Stats */}
              {analytics && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {event?.eventGalleryStats?.totalViews || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">Total Likes</p>
                    <p className="text-2xl font-bold text-red-600">
                      {event?.eventGalleryStats?.totalEngagement?.likes || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">Total Videos</p>
                    <p className="text-2xl font-bold text-green-600">
                      {event?.eventGalleryStats?.totalVideos || 0}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === "videos" && (
            <div className="space-y-3">
              {videos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No videos uploaded yet
                </div>
              ) : (
                videos.map((video, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition"
                  >
                    <div className="w-16 h-16 bg-gray-300 rounded flex-shrink-0 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM4 9h12M4 13h12" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{video.title}</p>
                      <p className="text-xs text-gray-500">
                        {video.views || 0} views • {video.likes?.length || 0}{" "}
                        likes
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {formatDate(video.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-4">
              {analytics ? (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Average Views per Video
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {videos.length > 0
                        ? Math.round(
                            (event?.eventGalleryStats?.totalViews || 0) /
                              videos.length,
                          )
                        : 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Total Engagement Rate
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {videos.length > 0
                        ? Math.round(
                            ((event?.eventGalleryStats?.totalEngagement
                              ?.likes || 0) /
                              (event?.eventGalleryStats?.totalViews || 1)) *
                              100,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Participation Rate</p>
                    <p className="text-3xl font-bold text-green-600">
                      {Math.round(
                        ((event?.participants?.length || 0) /
                          Math.max(event?.participants?.length || 1, 1)) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500">
                  No analytics available
                </p>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      Allow Video Uploads
                    </p>
                    <p className="text-sm text-gray-600">
                      {allowVideoUpload
                        ? "Participants can upload videos"
                        : "Video uploads are disabled"}
                    </p>
                  </div>
                  {editingSettings ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowVideoUpload}
                        onChange={(e) => setAllowVideoUpload(e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                    </label>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        allowVideoUpload
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {allowVideoUpload ? "Enabled" : "Disabled"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowParticipantManager(true)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition"
                >
                  Manage Participants
                </button>
                {editingSettings ? (
                  <>
                    <button
                      onClick={handleUpdateSettings}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition"
                    >
                      Save Settings
                    </button>
                    <button
                      onClick={() => setEditingSettings(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingSettings(true)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition"
                  >
                    Edit Settings
                  </button>
                )}
              </div>

              <button
                onClick={handleDeleteEvent}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition"
              >
                Delete Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Participant Manager Modal */}
      {showParticipantManager && (
        <EventParticipantManager
          eventId={eventId}
          onClose={() => {
            setShowParticipantManager(false);
            fetchEventData();
          }}
        />
      )}
    </div>
  );
};

export default EventOrganizerDashboard;
