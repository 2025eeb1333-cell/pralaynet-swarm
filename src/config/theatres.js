/**
 * PralayNet Disaster Theatres Configuration
 * Defines high-risk inundation corridors, origin logistics depots, regional trauma hubs,
 * real-bridge bypass corridors, and telemetry bounds for Punjab, Odisha, and Assam.
 */

export const THEATRES = {
  punjab: {
    id: 'punjab',
    name: 'Sutlej River Inundation Corridor',
    center: [31.1135, 75.7167],
    zoom: 10,
    origin: { name: 'CWC Central Logistics Depot Ludhiana', lat: 30.9010, lon: 75.8573 },
    depot1: { name: 'CWC Central Depot, Ludhiana', lat: 30.9010, lon: 75.8573 },
    depot2: { name: 'Markfed Regional Depot, Nakodar', lat: 31.1250, lon: 75.4760 },
    destination: { name: 'Civil Hospital Trauma Center Jalandhar', lat: 31.3260, lon: 75.5762 },
    hazard: { lat: 31.0620, lon: 75.7580, radiusKm: 4.8, name: 'Sutlej River Bridge Inundation Zone' },
    baseRadiusKm: 4.8,
    baselineWaypoints: [
      [30.9010, 75.8573],
      [31.0200, 75.7860], // Phillaur NH-44 bridge (submerged)
      [31.3260, 75.5762]
    ],
    eastBridgeCorridor: [
      [30.9010, 75.8573],
      [30.8950, 76.0400],
      [30.9350, 76.1650], // Machhiwara
      [31.0550, 76.1180], // Rahon Sutlej Bridge (32km East)
      [31.1850, 75.9650], // Nawanshahr / Banga
      [31.2650, 75.7800], // Phagwara North Bypass
      [31.3260, 75.5762]  // Jalandhar Civil Hospital
    ],
    westBridgeCorridor: [
      [30.9010, 75.8573],
      [30.9150, 75.6200],
      [30.9550, 75.5050], // Sidhwan Bet Bridge (30km West)
      [31.1250, 75.4760], // Nakodar Depot
      [31.2350, 75.5250],
      [31.3260, 75.5762]  // Jalandhar Civil Hospital
    ],
    baseBypassW1: [31.0550, 76.1180], // Rahon Bridge Crossing
    bypassW1: [31.0550, 76.1180],
    discharge: 2180,
    weather: { temp: 27.8, wind: 48, rain: 34 },
    dailyDischarge: [2180, 2460, 2890, 2620, 2100, 1750, 1420],
    dailyRain: [34, 45, 28, 12, 5, 1, 0],
    firmsBbox: '74.5,30.5,76.5,32.0'
  },
  odisha: {
    id: 'odisha',
    name: 'Coastal Cyclone Corridor',
    center: [20.0548, 85.8278],
    zoom: 10,
    origin: { name: 'OSDMA Emergency Warehouse Bhubaneswar', lat: 20.2961, lon: 85.8245 },
    depot1: { name: 'OSDMA Central Depot, Bhubaneswar', lat: 20.2961, lon: 85.8245 },
    depot2: { name: 'OSDMA Regional Depot, Jatni', lat: 20.1650, lon: 85.7050 },
    destination: { name: 'District HQ Hospital Puri', lat: 19.8135, lon: 85.8312 },
    hazard: { lat: 20.0680, lon: 85.8330, radiusKm: 5.2, name: 'Daya River Surge & NH-316 Sector' },
    baseRadiusKm: 5.2,
    baselineWaypoints: [
      [20.2961, 85.8245],
      [20.0680, 85.8330],
      [19.8135, 85.8312]
    ],
    eastBridgeCorridor: [
      [20.2961, 85.8245],
      [20.2150, 85.9120],
      [20.1250, 86.0120], // Nimapada Bridge
      [20.0250, 86.0350], // Gop Highway
      [19.9150, 85.9550],
      [19.8135, 85.8312]
    ],
    westBridgeCorridor: [
      [20.2961, 85.8245],
      [20.1650, 85.7050], // Jatni Depot
      [20.0820, 85.6950], // Delang Bridge
      [19.9850, 85.7350], // Kanas
      [19.8750, 85.7850],
      [19.8135, 85.8312]
    ],
    baseBypassW1: [20.1250, 86.0120],
    bypassW1: [20.1250, 86.0120],
    discharge: 3450,
    weather: { temp: 29.4, wind: 94, rain: 86 },
    dailyDischarge: [3450, 4120, 4200, 3750, 2900, 2100, 1650],
    dailyRain: [86, 112, 64, 22, 8, 0, 0],
    firmsBbox: '85.0,19.5,86.8,20.8'
  },
  assam: {
    id: 'assam',
    name: 'Brahmaputra Flood Plain',
    center: [26.2945, 91.5852],
    zoom: 10,
    origin: { name: 'ASDMA Central Medical Depot Guwahati', lat: 26.1445, lon: 91.7362 },
    depot1: { name: 'ASDMA Central Depot, Guwahati', lat: 26.1445, lon: 91.7362 },
    depot2: { name: 'ASDMA Regional Depot, Hajo', lat: 26.2410, lon: 91.3850 },
    destination: { name: 'Civil Hospital Nalbari Trauma Center', lat: 26.4446, lon: 91.4342 },
    hazard: { lat: 26.2850, lon: 91.5880, radiusKm: 5.5, name: 'Brahmaputra Breach & NH-27 Zone' },
    baseRadiusKm: 5.5,
    baselineWaypoints: [
      [26.1445, 91.7362],
      [26.2850, 91.5880],
      [26.4446, 91.4342]
    ],
    eastBridgeCorridor: [
      [26.1445, 91.7362],
      [26.2550, 91.7550],
      [26.3450, 91.7100], // Baihata Chariali Bridge
      [26.4150, 91.6250],
      [26.4446, 91.4342]
    ],
    westBridgeCorridor: [
      [26.1445, 91.7362],
      [26.2050, 91.6880],
      [26.2410, 91.3850], // Hajo Bridge
      [26.3450, 91.3650],
      [26.4446, 91.4342]
    ],
    baseBypassW1: [26.3450, 91.7100],
    bypassW1: [26.3450, 91.7100],
    discharge: 18900,
    weather: { temp: 25.2, wind: 56, rain: 52 },
    dailyDischarge: [18900, 20400, 22400, 21800, 19500, 17200, 15100],
    dailyRain: [52, 64, 48, 31, 14, 6, 0],
    firmsBbox: '91.0,25.8,92.5,26.8'
  }
};
