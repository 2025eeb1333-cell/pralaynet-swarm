/**
 * OSRM Router Engine
 * Snaps disaster supply corridors to real asphalt highway LineStrings via Project OSRM
 * Applies real-bridge waypoint deflection across river boundaries
 */

import { computeRouteInundationKm, postOsrmPolygonEvasion } from './spatialCritic.js';

export async function fetchOsrmDrivingRoute(origin, destination, viaWaypoints = []) {
  const coordParts = [
    `${origin.lon.toFixed(5)},${origin.lat.toFixed(5)}`,
    ...viaWaypoints.map(w => `${w[1].toFixed(5)},${w[0].toFixed(5)}`),
    `${destination.lon.toFixed(5)},${destination.lat.toFixed(5)}`
  ];

  const url = `https://router.project-osrm.org/route/v1/driving/${coordParts.join(';')}?overview=full&geometries=geojson&steps=true`;
  const t0 = performance.now();

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const latMs = Math.round(performance.now() - t0);
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    const data = await res.json();

    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const route = data.routes[0];
      const latLngs = route.geometry.coordinates.map(c => [c[1], c[0]]);
      return {
        latLngs,
        distanceKm: Number((route.distance / 1000).toFixed(2)),
        durationMin: Math.round(route.duration / 60),
        latencyMs: latMs,
        live: true
      };
    }
    throw new Error('OSRM response code not Ok');
  } catch (err) {
    console.warn(`[osrmRouter] Live OSRM fetch failed: ${err.message}. Retaining corridor fallback.`);
    return {
      latLngs: null,
      error: err.message,
      live: false
    };
  }
}

export function selectActiveCorridor(cache, allHazards, surgeMultiplier = 1.0) {
  const eastCol = computeRouteInundationKm(cache.east, allHazards, surgeMultiplier);
  const westCol = computeRouteInundationKm(cache.west, allHazards, surgeMultiplier);

  let selectedDetourRaw;
  let selectedRoute2Raw;
  let isDetourWest = false;

  if (eastCol === 0 && westCol > 0) {
    selectedDetourRaw = cache.east;
    selectedRoute2Raw = cache.west;
    isDetourWest = false;
  } else if (westCol === 0 && eastCol > 0) {
    // East is inundated -> auto-reroute Route 1 to open West Corridor!
    selectedDetourRaw = cache.west;
    selectedRoute2Raw = cache.east;
    isDetourWest = true;
  } else if (eastCol === 0 && westCol === 0) {
    selectedDetourRaw = cache.east;
    selectedRoute2Raw = cache.west;
    isDetourWest = false;
  } else {
    if (eastCol <= westCol) {
      selectedDetourRaw = cache.east;
      selectedRoute2Raw = cache.west;
      isDetourWest = false;
    } else {
      selectedDetourRaw = cache.west;
      selectedRoute2Raw = cache.east;
      isDetourWest = true;
    }
  }

  return {
    detourPoints: postOsrmPolygonEvasion(selectedDetourRaw, allHazards, surgeMultiplier, isDetourWest),
    route2Points: postOsrmPolygonEvasion(selectedRoute2Raw, allHazards, surgeMultiplier, !isDetourWest),
    isDetourWest
  };
}
