export async function getCurrentPosition() {
  if (!("geolocation" in navigator)) {
    throw new Error("Geolocation is not supported in this browser");
  }
  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      enableHighAccuracy: false,
    });
  });
  return position.coords;
}

export async function reverseGeocode(latitude, longitude) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  );
  if (!res.ok) throw new Error("Failed to look up your location");
  const data = await res.json();
  return data.display_name;
}

export async function detectPlace() {
  const { latitude, longitude } = await getCurrentPosition();
  return reverseGeocode(latitude, longitude);
}

export async function searchPlaces(query) {
  if (!query.trim()) return [];
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=6`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((item) => ({ id: item.place_id, label: item.display_name }));
}
