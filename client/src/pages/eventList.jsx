// src/pages/EventList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CreateEventModal from "../components/CreateEventModal";
import { useAuth } from "../store/Authentication";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/events`,
        );
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventCreated = (newEvent) => {
    setEvents([newEvent, ...events]);
  };

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Events</h1>
          {user && token && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-2 rounded-lg font-medium transition shadow-md"
            >
              <svg
                className="w-5 h-5 inline mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Event
            </button>
          )}
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No events available yet.
            </p>
            {user && token && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Create the First Event
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-white opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <svg
                      className="w-4 h-4 mr-1"
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

                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <svg
                      className="w-4 h-4 mr-1"
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

                  <Link
                    to={`/events/${event._id}`}
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-medium transition"
                  >
                    View Gallery & Videos
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleEventCreated}
      />
    </>
  );
};

export default EventList;
