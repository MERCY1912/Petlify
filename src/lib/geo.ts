export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const EARTH_RADIUS_KM = 6371;

export function createBoundingBox(lat: number, lng: number, radiusKm: number): BoundingBox {
  const angularRadius = radiusKm / EARTH_RADIUS_KM;
  const latRadians = degreesToRadians(lat);

  const minLat = latRadians - angularRadius;
  const maxLat = latRadians + angularRadius;

  const deltaLng = Math.asin(Math.sin(angularRadius) / Math.cos(latRadians));

  return {
    minLat: radiansToDegrees(minLat),
    maxLat: radiansToDegrees(maxLat),
    minLng: lng - radiansToDegrees(deltaLng),
    maxLng: lng + radiansToDegrees(deltaLng),
  };
}

export function haversineDistanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = degreesToRadians(bLat - aLat);
  const dLng = degreesToRadians(bLng - aLng);

  const lat1 = degreesToRadians(aLat);
  const lat2 = degreesToRadians(bLat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_KM * c;
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value: number): number {
  return (value * 180) / Math.PI;
}
