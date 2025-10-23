import React, { useEffect, useState } from "react";

const UserDashboard = () => {
  const [favourites, setFavourites] = useState([]);
  const [activity, setActivity] = useState([]);

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Fetch user's favourite properties
    if (user && user.id) {
      fetch(`/api/users/${user.id}/favourites`)
        .then(res => res.json())
        .then(setFavourites);

      // Fetch user's recent activity (implement this endpoint as needed)
      fetch(`/api/users/${user.id}/activity`)
        .then(res => res.json())
        .then(setActivity);
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">User Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome! Here you can view your favourite properties and recent activity.</p>
      <h2 className="text-xl font-semibold mb-2">Favourite Properties</h2>
      <ul className="mb-8">
        {favourites.length === 0 ? (
          <li className="text-gray-500">No favourites yet.</li>
        ) : (
          favourites.map((prop) => (
            <li key={prop._id} className="border-b py-2">{prop.type} - {prop.squareFeet} sqft</li>
          ))
        )}
      </ul>
      <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
      <ul>
        {activity.length === 0 ? (
          <li className="text-gray-500">No recent activity.</li>
        ) : (
          activity.map((act, idx) => (
            <li key={idx} className="border-b py-2">{act}</li>
          ))
        )}
      </ul>
    </div>
  );
};

export default UserDashboard;