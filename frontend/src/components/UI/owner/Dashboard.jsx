const Dashboard = ({ ownerName, children, error }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Owner Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome, {ownerName || "Owner"}! Manage your properties below.</p>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {children}
    </div>
  );
};

export default Dashboard;