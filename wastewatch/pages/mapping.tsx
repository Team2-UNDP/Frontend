// utils/leafletMap.ts

export async function initializeLeafletMap(
  container: HTMLDivElement,
  onClickCallback: (lat: number, lng: number) => void
) {
  const L = await import("leaflet");

  const map = L.map(container).setView([7.0806, 125.6476], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  map.on("click", (e: any) => {
    const { lat, lng } = e.latlng;
    onClickCallback(lat, lng);

    const customIcon = L.icon({
      iconUrl: "/icons/Coordinate.png",
      iconSize: [16, 18],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(map);
  });

  return map;
}
