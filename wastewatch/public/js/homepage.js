document.addEventListener("DOMContentLoaded", () => {
  // === DROPDOWN ===
  const toggle = document.getElementById("dropdownToggle");
  const menu = document.getElementById("dropdownMenu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("hidden");
    });

    window.addEventListener("click", (e) => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add("hidden");
      }
    });
  }

  // === NOTIFICATION MODAL ===
  const notifOpenBtn = document.getElementById("openNotifications");
  const notifModal = document.getElementById("notificationModal");
  const notifCloseBtn = document.getElementById("closeModal");

  if (notifOpenBtn && notifModal && notifCloseBtn) {
    notifOpenBtn.addEventListener("click", () => {
      notifModal.classList.remove("hidden");
      if (menu) menu.classList.add("hidden");
    });

    notifCloseBtn.addEventListener("click", () => {
      notifModal.classList.add("hidden");
    });

    window.addEventListener("click", (e) => {
      if (e.target === notifModal) {
        notifModal.classList.add("hidden");
      }
    });
  }

  // === MAPPING + HISTORY MODAL ===
  const map = L.map("map").setView([7.0806, 125.6476], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const coordinatesList = [];

  const historyOpenBtn = document.getElementById("openHistoryBtn");
  const historyCloseBtn = document.getElementById("closeModalBtn");
  const historyModal = document.getElementById("historyModal");
  const historyContent = historyModal?.querySelector(".space-y-4");

  const simulateList = document.getElementById("coordinateList");

  function updateCoordinateList() {
    if (!simulateList) return;
    simulateList.innerHTML = "";

    if (coordinatesList.length === 0) {
      const item = document.createElement("li");
      item.textContent = "No coordinates selected yet.";
      simulateList.appendChild(item);
    } else {
      coordinatesList.forEach(([lat, lng], index) => {
        const item = document.createElement("li");
        item.textContent = `Coordinate ${index + 1}: ${lat.toFixed(
          4
        )}, ${lng.toFixed(4)}`;
        simulateList.appendChild(item);
      });
    }
  }

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function generateDummyPath(startLat, startLng) {
    const path = [];
    let lat = startLat;
    let lng = startLng;

    for (let i = 0; i < 5; i++) {
      lat += (Math.random() - 0.5) * 0.01;
      lng += (Math.random() - 0.5) * 0.01;
      path.push([lat, lng]);
    }

    return path;
  }

  // Map click: add marker and save coordinate only
  map.on("click", function (e) {
    const { lat, lng } = e.latlng;
    coordinatesList.push([lat, lng]);

    const randomColor = getRandomColor();
    const customIcon = L.icon({
      iconUrl: "icons/Coordinate.png",
      iconSize: [16, 18],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
      iconStyle: `color: ${randomColor};`,
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(map);

    updateCoordinateList();
  });

  // Simulate button logic
  const simulateBtn = document.getElementById("simulateBtn");

  if (simulateBtn) {
    simulateBtn.addEventListener("click", () => {
      const selectedDay = document.getElementById("daySelector")?.value;

      if (!selectedDay) {
        alert("Please select a day first.");
        return;
      }

      if (coordinatesList.length === 0) {
        alert("Please click coordinates on the map.");
        return;
      }

      coordinatesList.forEach(([lat, lng]) => {
        const trashPath = generateDummyPath(lat, lng);
        trashPath.unshift([lat, lng]);
        const pathColor = getRandomColor();
        L.polyline(trashPath, { color: pathColor, weight: 4 }).addTo(map);
      });
    });
  }

  // History modal logic
  if (historyOpenBtn && historyModal && historyCloseBtn && historyContent) {
    historyOpenBtn.addEventListener("click", () => {
      historyContent.innerHTML = "";

      if (coordinatesList.length === 0) {
        historyContent.innerHTML = `<p class="text-black">No coordinates selected yet.</p>`;
      } else {
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-GB");
        const timeStr = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const coordStr = coordinatesList
          .map(([lat, lng]) => `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
          .join("; ");

        const card = document.createElement("div");
        card.className = "rounded-xl p-4 shadow border";
        card.innerHTML = `
            <div class="flex justify-between items-center">
              <p class="font-semibold">${dateStr}</p>
              <span class="text-sm text-gray-600">${timeStr}</span>
            </div>
            <p class="text-sm text-gray-700">${
              coordinatesList.length
            } coordinate${coordinatesList.length > 1 ? "s" : ""} selected</p>
            <p class="text-sm"><span class="font-semibold">Coordinates:</span> ${coordStr}</p>
          `;
        historyContent.appendChild(card);
      }

      historyModal.classList.remove("hidden");
    });

    historyCloseBtn.addEventListener("click", () => {
      historyModal.classList.add("hidden");
    });

    historyModal.addEventListener("click", (e) => {
      if (e.target === historyModal) {
        historyModal.classList.add("hidden");
      }
    });
  }

  updateCoordinateList();
});
