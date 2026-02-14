export type CityOption = {
  name: string;
  slug: string;
  districtCount?: number;
  sourcePath: string;
};

export type DistrictOption = {
  name: string;
  slug: string;
  citySlug: string;
  cityName?: string;
  sourcePath: string;
};

export type RawPharmacy = {
  id: string;
  name: string;
  address: string;
  phone: string;
  district: string;
  city: string;
  shiftLabel: string;
  sourcePath: string;
  detailPath: string;
  note?: string;
};

export type PharmacyDetails = {
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
};

export type Coordinate = {
  lat: number;
  lng: number;
};

export type RouteInfo = {
  destination: Coordinate;
  destinationLabel: string;
  distanceKm?: number;
  durationMin?: number;
  path: Coordinate[];
};

export type Pharmacy = RawPharmacy &
  PharmacyDetails & {
    distanceKm?: number;
    routeDistanceKm?: number;
  };

export type DistrictDutyResult = {
  citySlug: string;
  districtSlug: string;
  cityName: string;
  districtName: string;
  shiftLabel: string;
  sourcePath: string;
  fetchedAt: string;
  pharmacies: RawPharmacy[];
};

export type GeocodeResult = {
  displayName?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  districtCandidates: string[];
};
