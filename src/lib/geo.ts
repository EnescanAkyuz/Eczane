const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceKm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const latitudeDistance = toRadians(toLat - fromLat);
  const longitudeDistance = toRadians(toLng - fromLng);

  const a =
    Math.sin(latitudeDistance / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(longitudeDistance / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export type GeoPoint = {
  lat: number;
  lng: number;
};

function toCartesianKm(point: GeoPoint, referenceLat: number): { x: number; y: number } {
  const kmPerLat = 110.574;
  const kmPerLng = 111.32 * Math.cos(toRadians(referenceLat));

  return {
    x: point.lng * kmPerLng,
    y: point.lat * kmPerLat,
  };
}

function pointToSegmentDistanceKm(
  point: GeoPoint,
  start: GeoPoint,
  end: GeoPoint,
): number {
  const referenceLat = (point.lat + start.lat + end.lat) / 3;
  const p = toCartesianKm(point, referenceLat);
  const a = toCartesianKm(start, referenceLat);
  const b = toCartesianKm(end, referenceLat);

  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;
  const abSquared = abx * abx + aby * aby;

  if (abSquared <= 0) {
    const dx = p.x - a.x;
    const dy = p.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abSquared));
  const closestX = a.x + abx * t;
  const closestY = a.y + aby * t;
  const dx = p.x - closestX;
  const dy = p.y - closestY;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceToPolylineKm(point: GeoPoint, path: GeoPoint[]): number {
  if (!path.length) {
    return Number.POSITIVE_INFINITY;
  }
  if (path.length === 1) {
    return haversineDistanceKm(point.lat, point.lng, path[0].lat, path[0].lng);
  }

  let shortestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < path.length - 1; index += 1) {
    const distance = pointToSegmentDistanceKm(point, path[index], path[index + 1]);
    if (distance < shortestDistance) {
      shortestDistance = distance;
    }
  }

  return shortestDistance;
}

export function polylineDistanceKm(path: GeoPoint[]): number {
  if (path.length < 2) {
    return 0;
  }

  let total = 0;
  for (let index = 0; index < path.length - 1; index += 1) {
    total += haversineDistanceKm(
      path[index].lat,
      path[index].lng,
      path[index + 1].lat,
      path[index + 1].lng,
    );
  }

  return total;
}
