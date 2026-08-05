export async function detectPlace() {
  if (!("geolocation" in navigator)) {
    throw new Error("Geolocation is not supported in this browser");
  }

  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      enableHighAccuracy: false,
    });
  });

  const { latitude, longitude } = position.coords;
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
  );
  if (!res.ok) throw new Error("Failed to look up your location");

  const data = await res.json();
  const parts = [data.city || data.locality, data.principalSubdivision, data.countryName].filter(
    Boolean
  );
  return parts.join(", ");
}
