import React from "react";

const InfoWindow = ({ show, hotspotData = {} }) =>
  show ? (
    <div className="absolute left-1/2 top-10 z-50 transform -translate-x-1/2 bg-white/80 backdrop-blur-md text-black px-8 py-4 rounded-xl shadow-2xl border border-emerald-200 transition-opacity duration-500 opacity-100">
      <strong className="block text-lg mb-1 text-emerald-700">
        {hotspotData.title || 'Feature'}
      </strong>
      <div className="text-sm">
        {hotspotData.description || 'Point of interest'}
      </div>
    </div>
  ) : null;

export default InfoWindow;