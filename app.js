const speciesProfiles = {
  salmon: {
    commonName: "Atlantic Salmon",
    scientificName: "Salmo salar",
    habitat: "North Atlantic Ocean & coastal rivers",
    diet: "Insects, crustaceans, small fish",
    status: "Least Concern",
    region: { name: "North Atlantic", coords: [54.5, -28.5] },
  },
  tuna: {
    commonName: "Yellowfin Tuna",
    scientificName: "Thunnus albacares",
    habitat: "Tropical and subtropical oceans",
    diet: "Squid, crustaceans, small fish",
    status: "Near Threatened",
    region: { name: "Equatorial Pacific", coords: [0.5, -140.0] },
  },
  grouper: {
    commonName: "Goliath Grouper",
    scientificName: "Epinephelus itajara",
    habitat: "Western Atlantic reefs",
    diet: "Crustaceans and fish",
    status: "Vulnerable",
    region: { name: "Caribbean Sea", coords: [18.2, -67.0] },
  },
  clownfish: {
    commonName: "Orange Clownfish",
    scientificName: "Amphiprion percula",
    habitat: "Coral reefs, anemone symbiosis",
    diet: "Algae, zooplankton",
    status: "Least Concern",
    region: { name: "Great Barrier Reef", coords: [-18.3, 147.7] },
  },
  catfish: {
    commonName: "Channel Catfish",
    scientificName: "Ictalurus punctatus",
    habitat: "North American freshwater rivers",
    diet: "Insects, mollusks, plant matter",
    status: "Least Concern",
    region: { name: "Mississippi Basin", coords: [35.1, -90.1] },
  },
  tilapia: {
    commonName: "Nile Tilapia",
    scientificName: "Oreochromis niloticus",
    habitat: "Lakes and slow rivers",
    diet: "Algae and plant matter",
    status: "Least Concern",
    region: { name: "Nile River", coords: [23.0, 32.9] },
  },
  snapper: {
    commonName: "Red Snapper",
    scientificName: "Lutjanus campechanus",
    habitat: "Gulf of Mexico reefs",
    diet: "Fish, shrimp, crabs",
    status: "Vulnerable",
    region: { name: "Gulf of Mexico", coords: [25.2, -90.5] },
  },
  mackerel: {
    commonName: "Atlantic Mackerel",
    scientificName: "Scomber scombrus",
    habitat: "Temperate ocean waters",
    diet: "Zooplankton and small fish",
    status: "Least Concern",
    region: { name: "North Sea", coords: [56.5, 3.0] },
  },
};

const fallbackProfile = {
  commonName: "Unknown Species",
  scientificName: "Not classified",
  habitat: "Unknown",
  diet: "Unknown",
  status: "Pending",
  region: { name: "Global Ocean", coords: [10, 0] },
};

const imageUpload = document.getElementById("imageUpload");
const identifyImage = document.getElementById("identifyImage");
const imagePreview = document.getElementById("imagePreview");
const resultContainer = document.getElementById("result");
const startCamera = document.getElementById("startCamera");
const captureFrame = document.getElementById("captureFrame");
const video = document.getElementById("video");
const snapshot = document.getElementById("snapshot");

let map;
let marker;
let activeStream = null;

const initMap = () => {
  map = L.map("map").setView([10, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  marker = L.marker([10, 0]).addTo(map);
  marker.bindPopup("Global Ocean").openPopup();
};

const normalizeInput = (value) => value?.toLowerCase().trim() ?? "";

const guessSpecies = (label) => {
  const normalized = normalizeInput(label);
  const hit = Object.keys(speciesProfiles).find((key) =>
    normalized.includes(key)
  );
  return speciesProfiles[hit] || fallbackProfile;
};

const renderResult = (profile, source) => {
  resultContainer.innerHTML = `
    <h4>${profile.commonName}</h4>
    <p><strong>Source:</strong> ${source}</p>
    <div class="result-details">
      <p><strong>Scientific name:</strong> ${profile.scientificName}</p>
      <p><strong>Habitat:</strong> ${profile.habitat}</p>
      <p><strong>Diet:</strong> ${profile.diet}</p>
      <p><strong>Conservation status:</strong> ${profile.status}</p>
      <p><strong>Region focus:</strong> ${profile.region.name}</p>
    </div>
  `;

  marker.setLatLng(profile.region.coords).setPopupContent(profile.region.name);
  map.setView(profile.region.coords, 4, { animate: true });
};

const previewImage = (file) => {
  const reader = new FileReader();
  reader.onload = () => {
    imagePreview.innerHTML = `<img src="${reader.result}" alt="Fish preview" />`;
  };
  reader.readAsDataURL(file);
};

imageUpload.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) {
    previewImage(file);
  }
});

identifyImage.addEventListener("click", () => {
  const file = imageUpload.files?.[0];
  if (!file) {
    renderResult(fallbackProfile, "No image selected");
    return;
  }

  const profile = guessSpecies(file.name);
  renderResult(profile, `Image upload: ${file.name}`);
});

startCamera.addEventListener("click", async () => {
  if (activeStream) {
    activeStream.getTracks().forEach((track) => track.stop());
    activeStream = null;
    video.srcObject = null;
    startCamera.textContent = "Start Camera";
    return;
  }

  try {
    activeStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    video.srcObject = activeStream;
    startCamera.textContent = "Stop Camera";
  } catch (error) {
    renderResult(fallbackProfile, "Camera access blocked");
  }
});

captureFrame.addEventListener("click", () => {
  if (!video.srcObject) {
    renderResult(fallbackProfile, "Camera inactive");
    return;
  }

  const ctx = snapshot.getContext("2d");
  snapshot.width = video.videoWidth || 640;
  snapshot.height = video.videoHeight || 360;
  ctx.drawImage(video, 0, 0, snapshot.width, snapshot.height);

  const randomKey = Object.keys(speciesProfiles)[
    Math.floor(Math.random() * Object.keys(speciesProfiles).length)
  ];
  renderResult(speciesProfiles[randomKey], "Live camera capture");
});

initMap();
