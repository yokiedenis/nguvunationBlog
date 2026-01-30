import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import VideoPlayer from "../components/videoPlayer";
import UploadForm from "../components/uploadForm";
import EventOrganizerDashboard from "../components/EventOrganizerDashboard";
import EventParticipantManager from "../components/EventParticipantManager";
import { useAuth } from "../store/Authentication";

const EventGallery = () => {
  const { eventId } = useParams();
  const { user, token } = useAuth();
  const [event, setEvent] = useState(null);
  const [videos, setVideos] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showOrganizerDashboard, setShowOrganizerDashboard] = useState(false);
  const [showParticipantManager, setShowParticipantManager] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEventData = useCallback(async () => {
    if (!eventId) {
      console.warn("EventGallery: No eventId provided");
      return;
    }

    try {
      setLoading(true);

      // Fetch event details
      const eventResponse = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/events/${eventId}`,
      );
      if (!eventResponse.ok) {
        console.error(
          `Event fetch failed: ${eventResponse.status}`,
          eventResponse.statusText,
        );
        return;
      }
      const eventData = await eventResponse.json();
      setEvent(eventData);

      // Fetch event videos
      const videosResponse = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/videos/event/${eventId}`,
      );
      if (!videosResponse.ok) {
        console.error(
          `Videos fetch failed: ${videosResponse.status}`,
          videosResponse.statusText,
        );
        return;
      }
      const videosData = await videosResponse.json();
      setVideos(videosData.videos || []);
    } catch (error) {
      console.error("Error fetching event data:", error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  const handleUploadSuccess = useCallback(() => {
    setShowUploadForm(false);
    fetchEventData(); // Re-fetch data after upload
  }, [fetchEventData]);

  if (loading) {
    return <div className="text-center py-8">Loading event gallery...</div>;
  }

  if (!event) {
    return <div className="text-center py-8">Event not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <p className="text-gray-600 mb-4">{event.description}</p>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-gray-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {new Date(event.startDate).toLocaleDateString()} -{" "}
            {new Date(event.endDate).toLocaleDateString()}
          </div>

          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-gray-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {event.location}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Event Videos</h2>
            <p className="text-gray-500">
              {videos.length} video{videos.length !== 1 ? "s" : ""} shared
            </p>
          </div>

          {user && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 sm:px-4 rounded text-sm sm:text-base"
              >
                Share Video
              </button>
              {event && user?._id === event.organizer && (
                <>
                  <button
                    onClick={() => setShowOrganizerDashboard(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 sm:px-4 rounded text-sm sm:text-base"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setShowParticipantManager(true)}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 sm:px-4 rounded text-sm sm:text-base"
                  >
                    Participants
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showUploadForm && (
        <UploadForm
          eventId={eventId}
          onClose={() => setShowUploadForm(false)}
          onSuccess={handleUploadSuccess}
          token={token}
        />
      )}

      {showOrganizerDashboard && (
        <EventOrganizerDashboard
          eventId={eventId}
          onClose={() => {
            setShowOrganizerDashboard(false);
            fetchEventData();
          }}
        />
      )}

      {showParticipantManager && (
        <EventParticipantManager
          eventId={eventId}
          onClose={() => {
            setShowParticipantManager(false);
            fetchEventData();
          }}
        />
      )}

      {videos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold mt-4">No Videos Yet</h3>
          <p className="text-gray-600 mt-2">
            Be the first to share your experience from this event!
          </p>
          {user && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Upload Video
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoPlayer key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventGallery;
