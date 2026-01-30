import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../store/Authentication";

const EventParticipantManager = ({ eventId, onClose }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [addingParticipant, setAddingParticipant] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchParticipants();
  }, [eventId]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.event && response.data.event.participants) {
        setParticipants(response.data.event.participants);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
      toast.error("Failed to load participants");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    if (!window.confirm("Remove this participant from the event?")) return;

    try {
      // Note: This endpoint may need to be created on the backend
      // For now, we'll handle it through event update if available
      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/events/${eventId}/participants/${participantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setParticipants(participants.filter((p) => p !== participantId));
      toast.success("Participant removed successfully");
    } catch (error) {
      console.error("Error removing participant:", error);
      toast.error("Failed to remove participant");
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newParticipantEmail.trim()) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      setAddingParticipant(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/events/${eventId}/add-participant`,
        { email: newParticipantEmail },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.participant) {
        setParticipants([...participants, response.data.participant]);
        setNewParticipantEmail("");
        setShowAddModal(false);
        toast.success("Participant added successfully");
      }
    } catch (error) {
      console.error("Error adding participant:", error);
      toast.error(error.response?.data?.message || "Failed to add participant");
    } finally {
      setAddingParticipant(false);
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const name = typeof p === "string" ? p : p.name || p.email || p._id;
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-bold">Event Participants</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 flex-shrink-0"
            aria-label="Close"
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Search and Add */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Add Participant
            </button>
          </div>

          {/* Add Participant Modal */}
          {showAddModal && (
            <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <form onSubmit={handleAddParticipant}>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    required
                  />
                  <button
                    type="submit"
                    disabled={addingParticipant}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                  >
                    {addingParticipant ? "Adding..." : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewParticipantEmail("");
                    }}
                    className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Participants List */}
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No participants found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredParticipants.map((participant, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {(typeof participant === "string"
                          ? participant[0]
                          : (participant.name || participant.email || "?")[0]
                        ).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {typeof participant === "string"
                          ? participant
                          : participant.name ||
                            participant.email ||
                            participant._id}
                      </p>
                      {participant.email && (
                        <p className="text-xs text-gray-500">
                          {participant.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleRemoveParticipant(
                        typeof participant === "string"
                          ? participant
                          : participant._id,
                      )
                    }
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <div className="text-sm text-gray-600">
            Total:{" "}
            <span className="font-semibold">{filteredParticipants.length}</span>{" "}
            participant{filteredParticipants.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventParticipantManager;
