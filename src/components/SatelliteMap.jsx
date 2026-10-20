import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, HeartPulse } from 'lucide-react';
import { MEMBER_DATA, RESPONDER_DATA } from '../config/constants';

const createCustomIcon = (bgColor, label, svgIcon) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%); pointer-events:none;">
        <span style="background: ${bgColor}; color: #ffffff; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.35); white-space: nowrap; margin-bottom: 4px;">
          ${label}
        </span>
        <div style="background: ${bgColor}; border: 2px solid #ffffff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 6px rgba(0,0,0,0.4);">
          ${svgIcon}
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${bgColor};"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const homeSvg = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
const bikeSvg = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`;
const ambSvg = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 7H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M7 10h4"/><path d="M9 8v4"/></svg>`;

export default function SatelliteMap({
  memberCoords,
  responderCoords,
  ambulanceCoords,
  showResponder = false,
  showAmbulance = false,
  statusMessage = "Tracking active responders",
  responderDistance = 1100,
  responderEta = 180,
  ambulanceDistance = 2200,
  ambulanceEta = 360,
  height = "h-64 sm:h-80"
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const respMarkerRef = useRef(null);
  const ambMarkerRef = useRef(null);
  const routeLineRef = useRef(null);
  const ambRouteLineRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: memberCoords,
      zoom: 16,
      zoomControl: false,
      attributionControl: true
    });

    // Real high-resolution satellite imagery from Esri (Public / No key required)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; ResQ public demo'
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Simulated member location
    const homeIcon = createCustomIcon('#dc2626', MEMBER_DATA.name, homeSvg);
    L.marker(memberCoords, { icon: homeIcon }).addTo(map);

    // Simulated responder location
    const bikeIcon = createCustomIcon('#0f766e', RESPONDER_DATA.name, bikeSvg);
    const respMarker = L.marker(memberCoords, { icon: bikeIcon });
    respMarkerRef.current = respMarker;

    // Route line for Responder
    const route = L.polyline([], {
      color: '#2dd4bf',
      weight: 3.5,
      dashArray: '6, 8',
      opacity: 0.95
    });
    routeLineRef.current = route;

    // Simulated ambulance location
    const ambIcon = createCustomIcon('#b91c1c', 'Demo ambulance', ambSvg);
    const ambMarker = L.marker(memberCoords, { icon: ambIcon });
    ambMarkerRef.current = ambMarker;

    // Route line for Ambulance
    const ambRoute = L.polyline([], {
      color: '#f87171',
      weight: 3,
      dashArray: '4, 6',
      opacity: 0.9
    });
    ambRouteLineRef.current = ambRoute;

    mapRef.current = map;

    const invalidateMapSize = () => map.invalidateSize({ pan: false });
    const timer = setTimeout(() => {
      invalidateMapSize();
    }, 250);
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(invalidateMapSize)
      : null;
    resizeObserver?.observe(containerRef.current);
    window.addEventListener('resize', invalidateMapSize);
    window.addEventListener('orientationchange', invalidateMapSize);

    return () => {
      clearTimeout(timer);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', invalidateMapSize);
      window.removeEventListener('orientationchange', invalidateMapSize);
      map.remove();
      mapRef.current = null;
    };
  }, [memberCoords]);

  // Update responder location and line
  useEffect(() => {
    if (respMarkerRef.current && responderCoords) {
      respMarkerRef.current.setLatLng(responderCoords);
      if (showResponder && mapRef.current && !mapRef.current.hasLayer(respMarkerRef.current)) {
        respMarkerRef.current.addTo(mapRef.current);
      } else if (!showResponder && mapRef.current && mapRef.current.hasLayer(respMarkerRef.current)) {
        mapRef.current.removeLayer(respMarkerRef.current);
      }

      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs([responderCoords, memberCoords]);
        if (showResponder && mapRef.current && !mapRef.current.hasLayer(routeLineRef.current)) {
          routeLineRef.current.addTo(mapRef.current);
        } else if (!showResponder && mapRef.current && mapRef.current.hasLayer(routeLineRef.current)) {
          mapRef.current.removeLayer(routeLineRef.current);
        }
      }
    }
  }, [responderCoords, showResponder, memberCoords]);

  // Update ambulance location and line
  useEffect(() => {
    if (ambMarkerRef.current && ambulanceCoords) {
      ambMarkerRef.current.setLatLng(ambulanceCoords);
      if (showAmbulance && mapRef.current && !mapRef.current.hasLayer(ambMarkerRef.current)) {
        ambMarkerRef.current.addTo(mapRef.current);
      } else if (!showAmbulance && mapRef.current && mapRef.current.hasLayer(ambMarkerRef.current)) {
        mapRef.current.removeLayer(ambMarkerRef.current);
      }

      if (ambRouteLineRef.current) {
        ambRouteLineRef.current.setLatLngs([ambulanceCoords, memberCoords]);
        if (showAmbulance && mapRef.current && !mapRef.current.hasLayer(ambRouteLineRef.current)) {
          ambRouteLineRef.current.addTo(mapRef.current);
        } else if (!showAmbulance && mapRef.current && mapRef.current.hasLayer(ambRouteLineRef.current)) {
          mapRef.current.removeLayer(ambRouteLineRef.current);
        }
      }
    }
  }, [ambulanceCoords, showAmbulance, memberCoords]);

  const formatDistance = (meters) => {
    if (meters < 100) return 'Arrived at scene';
    if (meters < 1000) return `${Math.round(meters)} m away`;
    return `${(meters / 1000).toFixed(1)} km away`;
  };

  const formatEta = (seconds) => {
    if (seconds <= 15) return 'Arriving now';
    const mins = Math.ceil(seconds / 60);
    return `~${mins} min${mins > 1 ? 's' : ''}`;
  };

  return (
    <div className="rounded border border-stone-200 overflow-hidden bg-white shadow-xs">
      {/* Satellite Map Container */}
      <div className={`${height} min-h-64 sm:min-h-80 w-full relative`} ref={containerRef}>
        <div className="absolute top-3 left-3 bg-stone-900/90 text-white px-2.5 py-1 rounded text-xs font-medium z-[400] flex items-center space-x-1.5 border border-stone-700 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Esri satellite imagery &bull; Demo area</span>
        </div>
        <div className="absolute top-3 right-3 bg-white/95 text-stone-800 px-2 py-0.5 rounded text-[11px] font-mono font-medium z-[400] shadow-sm border border-stone-200">
          Simulated location
        </div>
      </div>

      {/* Simulated route status */}
      <div className="p-3 bg-stone-50 border-t border-stone-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold text-tealbrand-800 bg-tealbrand-50 border border-tealbrand-200 px-2 py-0.5 rounded uppercase tracking-wider">
              Simulated route
            </span>
            <span className="text-xs text-stone-700 font-medium">{statusMessage}</span>
          </div>
          <span className="text-[11px] text-stone-500 font-mono hidden sm:inline">Approximate demo area</span>
        </div>
      </div>

      {/* Details of everyone reaching the location */}
      <div className="p-3 bg-white border-t border-stone-200 divide-y divide-stone-100">
        <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
          Responding units approaching location:
        </div>

        {/* Simulated responder unit */}
        <div className="py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-tealbrand-50 border border-tealbrand-200 flex items-center justify-center text-tealbrand-700 flex-shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-stone-900">{RESPONDER_DATA.name}</span>
                <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">Bike Unit</span>
              </div>
              <span className="text-[11px] text-stone-500">Sample responder vehicle</span>
            </div>
          </div>
          <div className="text-right">
            {showResponder ? (
              <>
                <div className="text-xs font-bold text-tealbrand-800 font-mono">
                  {formatEta(responderEta)}
                </div>
                <div className="text-[11px] text-stone-500 font-mono">
                  {formatDistance(responderDistance)}
                </div>
              </>
            ) : (
              <span className="text-xs text-stone-400 font-medium">On standby (demo area)</span>
            )}
          </div>
        </div>

        {/* Demo ambulance unit */}
        <div className="pt-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emergency-50 border border-emergency-200 flex items-center justify-center text-emergency-700 flex-shrink-0">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-stone-900">Demo Ambulance</span>
                <span className="text-[10px] text-emergency-700 bg-emergency-50 px-1.5 py-0.2 rounded font-medium">Sample data</span>
              </div>
              <span className="text-[11px] text-stone-500">Simulated response hub &bull; Sample equipment</span>
            </div>
          </div>
          <div className="text-right">
            {showAmbulance ? (
              <>
                <div className="text-xs font-bold text-emergency-700 font-mono">
                  {formatEta(ambulanceEta)}
                </div>
                <div className="text-[11px] text-stone-500 font-mono">
                  {formatDistance(ambulanceDistance)}
                </div>
              </>
            ) : (
              <span className="text-xs text-stone-400 font-medium">Standby at demo hub</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
