import React from "react";

const InfoWindow = ({ show, hotspotData = {} }) => {
  if (!show) return null;
  
  return (
    <div className="absolute left-1/2 top-10 z-50 transform -translate-x-1/2 bg-white/80 backdrop-blur-md text-black px-8 py-4 rounded-xl shadow-2xl border border-emerald-200 transition-all duration-300 animate-fade-in-down">
      <strong className="block text-lg mb-2 text-emerald-700">
        {hotspotData?.title || 'Feature'}
      </strong>
      <div className="text-sm max-w-xs">
        {hotspotData?.description || 'Point of interest'}
      </div>
    </div>
  );
};

export default InfoWindow;