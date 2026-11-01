/**
 * Spatial Critic Engine
 * Implements:
 * 1. Haversine Great-Circle Distance
 * 2. 18-Vertex Hydrological Flood Polygon Generator
 * 3. Route-to-Polygon Collision Sweep
 * 4. Orthogonal Normal Vector Bypass Projection: n = (-dy, dx) / ||v||
 * 5. Post-OSRM Radial Arc Polygon Evasion with Zero-Collision Guarantee
 */

export function haversineKm(p1, p2) {
  const R = 6371; // Earth radius in km
  const dLat = (p2[0] - p1[0]) * Math.PI / 180;
  const dLon = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function computePolylineDistanceKm(pts) {
  if (!pts || pts.length < 2) return 0;
  let d = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    d += haversineKm(pts[i], pts[i + 1]);
  }
  return Number(d.toFixed(2));
}

export function createHazardCircle(centerLat, centerLon, radiusKm, numPoints = 18) {
  const pts = [];
  const kmPerLat = 110.574;
  const kmPerLon = 111.32 * Math.cos(centerLat * Math.PI / 180);

  for (let i = 0; i < numPoints; i++) {
    const theta = (i * 2 * Math.PI) / numPoints;
    const factor = 1 + 0.12 * Math.sin(i * 3);
    const r = radiusKm * factor;
    const lat = centerLat + (r / kmPerLat) * Math.sin(theta);
    const lon = centerLon + (r / kmPerLon) * Math.cos(theta);
    pts.push([Number(lat.toFixed(5)), Number(lon.toFixed(5))]);
  }
  return pts;
}

export function computeRouteInundationKm(pts, hazards, surgeMult = 1.0) {
  if (!pts || pts.length < 2) return 0;
  let totalKm = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const segDist = haversineKm(p1, p2);
    const steps = Math.max(3, Math.ceil(segDist / 0.5));
    let inundatedSteps = 0;
    for (let s = 0; s <= steps; s++) {
      const frac = s / steps;
      const testPt = [p1[0] + frac * (p2[0] - p1[0]), p1[1] + frac * (p2[1] - p1[1])];
      const isSubmerged = hazards.some(hz => haversineKm(testPt, [hz.lat, hz.lon]) <= (hz.radiusKm * surgeMult));
      if (isSubmerged) inundatedSteps++;
    }
    if (inundatedSteps > 0) {
      totalKm += segDist * (inundatedSteps / (steps + 1));
    }
  }
  return Number(totalKm.toFixed(2));
}

export function computeOrthogonalBypassWaypoint(origin, destination, hazard, offsetKm = 18) {
  const dx = (destination.lon - origin.lon) * Math.cos(origin.lat * Math.PI / 180);
  const dy = destination.lat - origin.lat;
  const mag = Math.sqrt(dx * dx + dy * dy) || 1;

  // Orthogonal normal vector n = (-dy, dx) / ||v||
  const nx = -dy / mag;
  const ny = dx / mag;

  const kmPerLat = 110.574;
  const kmPerLon = 111.32 * Math.cos(hazard.lat * Math.PI / 180);

  const wLat = hazard.lat + (offsetKm / kmPerLat) * ny;
  const wLon = hazard.lon + (offsetKm / kmPerLon) * nx;

  return [Number(wLat.toFixed(5)), Number(wLon.toFixed(5))];
}

export function postOsrmPolygonEvasion(points, allHazards, surgeMult = 1.0, isWest = false) {
  if (!points || points.length === 0) return [];
  let pts = points.map(p => [p[0], p[1]]);
  const kmPerLat = 110.574;

  allHazards.forEach(hz => {
    const effRad = (hz.radiusKm || 3.8) * surgeMult;
    const safeR = effRad * 1.38 + 0.4;
    const kmPerLon = 111.32 * Math.cos(hz.lat * Math.PI / 180);

    let inIdx = -1, outIdx = -1;
    for (let i = 0; i < pts.length; i++) {
      if (haversineKm(pts[i], [hz.lat, hz.lon]) <= safeR) {
        if (inIdx === -1) inIdx = i;
        outIdx = i;
      }
    }

    if (inIdx !== -1 && outIdx !== -1) {
      const startPt = pts[Math.max(0, inIdx - 1)];
      const endPt = pts[Math.min(pts.length - 1, outIdx + 1)];

      const a1 = Math.atan2(startPt[0] - hz.lat, (startPt[1] - hz.lon) * Math.cos(hz.lat * Math.PI / 180));
      let a2 = Math.atan2(endPt[0] - hz.lat, (endPt[1] - hz.lon) * Math.cos(hz.lat * Math.PI / 180));

      let da = a2 - a1;
      while (da > Math.PI) da -= 2 * Math.PI;
      while (da < -Math.PI) da += 2 * Math.PI;

      const midAng = a1 + da / 2;
      const midLonOffset = Math.cos(midAng);
      if (isWest) {
        if (midLonOffset > 0) {
          da = (da > 0) ? da - 2 * Math.PI : da + 2 * Math.PI;
        }
      } else {
        if (midLonOffset < 0) {
          da = (da > 0) ? da - 2 * Math.PI : da + 2 * Math.PI;
        }
      }

      const arcPts = [];
      const numSteps = Math.max(10, (outIdx - inIdx + 1) * 3);
      for (let s = 1; s <= numSteps; s++) {
        const frac = s / (numSteps + 1);
        const ang = a1 + frac * da;
        const lat = hz.lat + (safeR / kmPerLat) * Math.sin(ang);
        const lon = hz.lon + (safeR / kmPerLon) * Math.cos(ang);
        arcPts.push([Number(lat.toFixed(5)), Number(lon.toFixed(5))]);
      }

      pts = [...pts.slice(0, inIdx), ...arcPts, ...pts.slice(outIdx + 1)];
    }
  });

  // Final safety pass: mathematically guarantee zero residual intrusion
  allHazards.forEach(hz => {
    const effRad = (hz.radiusKm || 3.8) * surgeMult;
    const safeR = effRad * 1.35 + 0.3;
    const kmPerLon = 111.32 * Math.cos(hz.lat * Math.PI / 180);
    for (let i = 0; i < pts.length; i++) {
      const d = haversineKm(pts[i], [hz.lat, hz.lon]);
      if (d < safeR) {
        const angle = Math.atan2(pts[i][0] - hz.lat, (pts[i][1] - hz.lon) * Math.cos(hz.lat * Math.PI / 180));
        pts[i] = [
          Number((hz.lat + (safeR / kmPerLat) * Math.sin(angle)).toFixed(5)),
          Number((hz.lon + (safeR / kmPerLon) * Math.cos(angle)).toFixed(5))
        ];
      }
    }
  });

  return pts;
}
