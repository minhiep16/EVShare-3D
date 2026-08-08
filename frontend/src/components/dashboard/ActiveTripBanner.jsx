import React, { useState, useEffect } from 'react';

const TripBannerItem = ({ trip }) => {
  const [duration, setDuration] = useState('00:00:00');

  useEffect(() => {
    if (!trip) return;

    const startTime = new Date(trip.startTime).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const diffMs = now - startTime;
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setDuration(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [trip]);

  return (
    <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white px-4 py-2 shadow-lg flex items-center justify-between border-b border-brand-700 animate-in slide-in-from-top duration-300 w-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse shadow-inner">
          <i className="ph ph-steering-wheel text-lg text-white"></i>
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide">XE ĐANG CHẠY</p>
          <p className="text-xs text-brand-100 font-medium">{trip.vehiclePlate} • Người mượn: {trip.userName}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 bg-black/20 rounded-xl px-4 py-1.5 border border-white/10 shadow-inner">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-brand-200 uppercase font-bold tracking-wider mb-0.5">Thời gian chạy</span>
          <span className="text-base font-mono font-bold tabular-nums leading-none tracking-tight">{duration}</span>
        </div>
      </div>
    </div>
  );
};

const ActiveTripBanner = () => {
  const [activeTrips, setActiveTrips] = useState([]);

  const checkActiveTrips = () => {
    const saved = localStorage.getItem('evshare_activeTrips');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setActiveTrips(parsed);
        }
      } catch (e) {
        setActiveTrips([]);
      }
    } else {
      setActiveTrips([]);
    }
  };

  useEffect(() => {
    checkActiveTrips();
    window.addEventListener('evshare_trip_update', checkActiveTrips);
    return () => window.removeEventListener('evshare_trip_update', checkActiveTrips);
  }, []);

  if (!activeTrips || activeTrips.length === 0) return null;

  return (
    <div className="flex flex-col z-50 sticky top-0 shrink-0 w-full max-h-[150px] overflow-y-auto">
      {activeTrips.map(trip => (
        <TripBannerItem key={trip.vehicleId} trip={trip} />
      ))}
    </div>
  );
};

export default ActiveTripBanner;
