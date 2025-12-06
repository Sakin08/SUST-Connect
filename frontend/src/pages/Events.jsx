import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import eventsApi from "../api/events.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";

import EventCard from "../components/EventCard.jsx";
import SearchFilter from "../components/SearchFilter.jsx";
import TrendingSection from "../components/TrendingSection.jsx";
import SkeletonLoader from "../components/SkeletonLoader.jsx";
import CalendarPopup from "../components/CalendarPopup.jsx";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [filterOptions, setFilterOptions] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState(null);

  const { user } = useAuth();
  const { socket, eventUpdates } = useSocket();

  /* --------------------------
      INITIAL LOAD
  --------------------------- */
  useEffect(() => {
    loadEvents();
  }, []);

  /* --------------------------
      SOCKET JOIN / LEAVE
  --------------------------- */
  useEffect(() => {
    if (!socket) return;

    socket.emit("joinEvents");
    return () => socket.emit("leaveEvents");
  }, [socket]);

  /* --------------------------
      REAL-TIME UPDATES
  --------------------------- */
  useEffect(() => {
    if (!eventUpdates) return;

    const { type, data } = eventUpdates;

    if (type === "created") {
      setEvents(prev => [data, ...prev]);
      showNotification(`New event: ${data.title}`, "success");
    } else if (type === "interestUpdated") {
      setEvents(prev =>
        prev.map(e => (e._id === data.eventId ? data.event : e))
      );
    }
  }, [eventUpdates]);

  /* --------------------------
      HELPERS
  --------------------------- */
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadEvents = async () => {
    try {
      const res = await eventsApi.getAll();
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = dateEvents => {
    setSelectedDateEvents(dateEvents);
    setShowCalendar(false);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  /* --------------------------
      FILTER + SORT + SEARCH
  --------------------------- */
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    if (selectedDateEvents) filtered = selectedDateEvents;

    if (filterOptions.searchTerm) {
      const term = filterOptions.searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        [event.title, event.description, event.location]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }

    if (filterOptions.location) {
      const loc = filterOptions.location.toLowerCase();
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(loc)
      );
    }

    if (filterOptions.dateFrom) {
      const from = new Date(filterOptions.dateFrom);
      filtered = filtered.filter(event => new Date(event.date) >= from);
    }

    if (filterOptions.dateTo) {
      const to = new Date(filterOptions.dateTo);
      to.setHours(23, 59, 59);
      filtered = filtered.filter(event => new Date(event.date) <= to);
    }

    switch (filterOptions.sortBy) {
      case "popular":
        filtered.sort(
          (a, b) =>
            (b.interested?.length || 0) - (a.interested?.length || 0)
        );
        break;
      case "recent":
        filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      default:
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return filtered;
  }, [events, filterOptions, selectedDateEvents]);

  /* --------------------------
      LOADING SCREEN
  --------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Campus Events
              </h1>
              <p className="mt-1 text-gray-600">
                Stay updated with what's happening around campus
              </p>
            </div>
          </div>
          <SkeletonLoader count={6} />
        </div>
      </div>
    );
  }

  /* --------------------------
      MAIN RETURN
  --------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 py-8 sm:py-12">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2 sm:gap-3 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-white shadow-2xl animate-slide-in-right backdrop-blur-lg ${notification.type === "success"
            ? "bg-green-500/95"
            : "bg-blue-500/95"
            } border border-white/20`}
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm sm:text-base">{notification.message}</span>
        </div>
      )}

      {/* Container */}
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <header className="mb-8 sm:mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-2xl shadow-lg flex-shrink-0">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                  Campus Events
                </h1>
                <p className="text-sm sm:text-base text-purple-200 mt-1">
                  Stay updated with what's happening around campus
                </p>

                {selectedDateEvents && (
                  <button
                    onClick={() => setSelectedDateEvents(null)}
                    className="mt-2 flex items-center gap-1 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 transition"
                  >
                    <svg
                      className="h-3 w-3 sm:h-4 sm:w-4"
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
                    Clear date filter
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowCalendar(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 sm:py-3 font-bold text-white shadow-lg transition hover:shadow-xl hover:scale-105"
              >
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
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
                Calendar
              </button>

              {user && (
                <Link
                  to="/events/create"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 sm:py-3 font-bold text-white shadow-lg transition hover:shadow-xl hover:scale-105"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Event
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Trending Section */}
        <TrendingSection />

        {/* Search Filter */}
        <div className="mb-6">
          <SearchFilter
            onFilterChange={setFilterOptions}
            type="events"
          />
        </div>

        {/* Event Grid */}
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-white/20 bg-white/80 backdrop-blur-lg p-12 sm:p-16 text-center shadow-2xl">
            <div className="mb-4 text-5xl sm:text-6xl">🔍</div>
            <h3 className="mb-2 text-xl sm:text-2xl font-bold text-gray-900">
              No Events Found
            </h3>
            <p className="mx-auto max-w-md text-sm sm:text-base text-gray-600">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-xs sm:text-sm text-gray-600 font-medium bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
              Showing {filteredEvents.length} of {events.length} events
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map(event => (
                <EventCard
                  key={event._id}
                  event={event}
                  onUpdate={updatedEvent => {
                    if (updatedEvent) {
                      setEvents(prev =>
                        prev.map(e =>
                          e._id === updatedEvent._id ? updatedEvent : e
                        )
                      );
                    } else {
                      loadEvents();
                    }
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Calendar */}
      <CalendarPopup
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        events={events}
        onDateSelect={handleDateSelect}
      />
    </div>
  );
};

export default Events;
