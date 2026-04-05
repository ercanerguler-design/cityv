/**
 * City-V — Akıllı Şehir İzleme Platformu
 * Trafik, Enerji, Atık, Güvenlik ve Çevre verilerini
 * İstanbul, Ankara, İzmir, Antalya ve Bursa için tek platformdan izler.
 */

// ─── City Data ────────────────────────────────────────────────────────────────

const CITIES = {
  istanbul: {
    name: "İstanbul",
    desc: "Türkiye'nin en kalabalık metropolü",
    population: "15.8M",
    traffic: {
      density: 82,
      speed: "28 km/h",
      accidents: 7,
      status: "Yoğun",
      level: "danger",
    },
    energy: {
      consumption: "12.400 MWh",
      renewable: "%18",
      grid: "Stabil",
      status: "Normal",
      level: "ok",
      bar: 74,
    },
    waste: {
      daily: "14.200 ton",
      recycle: "%34",
      bins: "1.240 / 4.800",
      status: "Toplanıyor",
      level: "ok",
      bar: 26,
    },
    security: {
      cameras: "22.400 / 24.000",
      alarms: 14,
      response: "4.2 dk",
      status: "Normal",
      level: "ok",
      bar: 93,
    },
    environment: {
      aqi: 87,
      noise: "68 dB",
      temp: "19°C",
      status: "Orta",
      level: "warning",
    },
  },

  ankara: {
    name: "Ankara",
    desc: "Türkiye Cumhuriyeti'nin başkenti",
    population: "5.8M",
    traffic: {
      density: 61,
      speed: "42 km/h",
      accidents: 3,
      status: "Orta Yoğun",
      level: "warning",
    },
    energy: {
      consumption: "5.200 MWh",
      renewable: "%24",
      grid: "Stabil",
      status: "Normal",
      level: "ok",
      bar: 58,
    },
    waste: {
      daily: "4.800 ton",
      recycle: "%39",
      bins: "380 / 1.600",
      status: "İyi",
      level: "ok",
      bar: 24,
    },
    security: {
      cameras: "8.900 / 9.200",
      alarms: 5,
      response: "3.8 dk",
      status: "Normal",
      level: "ok",
      bar: 97,
    },
    environment: {
      aqi: 54,
      noise: "61 dB",
      temp: "14°C",
      status: "İyi",
      level: "ok",
    },
  },

  izmir: {
    name: "İzmir",
    desc: "Ege'nin incisi, Türkiye'nin üçüncü büyük kenti",
    population: "4.4M",
    traffic: {
      density: 55,
      speed: "48 km/h",
      accidents: 2,
      status: "Akıcı",
      level: "ok",
    },
    energy: {
      consumption: "3.900 MWh",
      renewable: "%31",
      grid: "Stabil",
      status: "İyi",
      level: "ok",
      bar: 52,
    },
    waste: {
      daily: "3.600 ton",
      recycle: "%44",
      bins: "210 / 1.200",
      status: "İyi",
      level: "ok",
      bar: 18,
    },
    security: {
      cameras: "6.200 / 6.500",
      alarms: 3,
      response: "4.0 dk",
      status: "Normal",
      level: "ok",
      bar: 95,
    },
    environment: {
      aqi: 42,
      noise: "58 dB",
      temp: "22°C",
      status: "İyi",
      level: "ok",
    },
  },

  antalya: {
    name: "Antalya",
    desc: "Türkiye'nin turizm başkenti, Akdeniz'in gözbebeği",
    population: "2.7M",
    traffic: {
      density: 49,
      speed: "52 km/h",
      accidents: 1,
      status: "Akıcı",
      level: "ok",
    },
    energy: {
      consumption: "2.400 MWh",
      renewable: "%38",
      grid: "Stabil",
      status: "İyi",
      level: "ok",
      bar: 44,
    },
    waste: {
      daily: "2.200 ton",
      recycle: "%41",
      bins: "140 / 800",
      status: "İyi",
      level: "ok",
      bar: 18,
    },
    security: {
      cameras: "4.100 / 4.200",
      alarms: 2,
      response: "4.5 dk",
      status: "Normal",
      level: "ok",
      bar: 98,
    },
    environment: {
      aqi: 35,
      noise: "55 dB",
      temp: "26°C",
      status: "Çok İyi",
      level: "ok",
    },
  },

  bursa: {
    name: "Bursa",
    desc: "Osmanlı'nın ilk başkenti, sanayi ve tarih kenti",
    population: "3.2M",
    traffic: {
      density: 67,
      speed: "38 km/h",
      accidents: 4,
      status: "Orta Yoğun",
      level: "warning",
    },
    energy: {
      consumption: "3.100 MWh",
      renewable: "%22",
      grid: "Stabil",
      status: "Normal",
      level: "ok",
      bar: 63,
    },
    waste: {
      daily: "2.900 ton",
      recycle: "%37",
      bins: "290 / 1.000",
      status: "Toplanıyor",
      level: "ok",
      bar: 29,
    },
    security: {
      cameras: "5.400 / 5.800",
      alarms: 6,
      response: "4.8 dk",
      status: "Normal",
      level: "ok",
      bar: 93,
    },
    environment: {
      aqi: 63,
      noise: "64 dB",
      temp: "17°C",
      status: "Orta",
      level: "warning",
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a status level based on AQI value */
function aqiLevel(aqi) {
  if (aqi <= 50)  return "ok";
  if (aqi <= 100) return "warning";
  return "danger";
}

/** Returns a status level based on traffic density (0–100) */
function trafficLevel(density) {
  if (density < 50) return "ok";
  if (density < 70) return "warning";
  return "danger";
}

/** Formats the current time as HH:MM:SS */
function timeNow() {
  return new Date().toLocaleTimeString("tr-TR");
}

// ─── DOM helpers ─────────────────────────────────────────────────────────────

function el(id) { return document.getElementById(id); }

function setStatusDot(dotId, level) {
  const dot = el(dotId);
  dot.className = "status-dot";
  if (level === "warning") dot.classList.add("warning");
  if (level === "danger")  dot.classList.add("danger");
}

function setProgressBar(barId, percent, level) {
  const bar = el(barId);
  bar.style.width = Math.min(percent, 100) + "%";
  bar.className = "progress-bar";
  if (level === "warning") bar.classList.add("warning");
  if (level === "danger")  bar.classList.add("danger");
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderCity(cityKey) {
  const city = CITIES[cityKey];
  if (!city) return;

  // Hero
  el("city-name").textContent    = city.name;
  el("city-desc").textContent    = city.desc;
  el("city-status").textContent  = "● Canlı İzleme";

  // ── Traffic ──────────────────────────────────────────────────────────────
  const tLevel = trafficLevel(city.traffic.density);
  setStatusDot("traffic-dot", tLevel);
  el("traffic-density").textContent  = city.traffic.density + "%";
  el("traffic-speed").textContent    = city.traffic.speed;
  el("traffic-accidents").textContent = city.traffic.accidents;
  el("traffic-status").textContent   = city.traffic.status;
  setProgressBar("traffic-bar", city.traffic.density, tLevel);

  // ── Energy ───────────────────────────────────────────────────────────────
  setStatusDot("energy-dot", city.energy.level);
  el("energy-consumption").textContent = city.energy.consumption;
  el("energy-renewable").textContent   = city.energy.renewable;
  el("energy-grid").textContent        = city.energy.grid;
  el("energy-status").textContent      = city.energy.status;
  setProgressBar("energy-bar", city.energy.bar, city.energy.level);

  // ── Waste ─────────────────────────────────────────────────────────────────
  setStatusDot("waste-dot", city.waste.level);
  el("waste-daily").textContent   = city.waste.daily;
  el("waste-recycle").textContent = city.waste.recycle;
  el("waste-bins").textContent    = city.waste.bins;
  el("waste-status").textContent  = city.waste.status;
  setProgressBar("waste-bar", city.waste.bar, city.waste.level);

  // ── Security ──────────────────────────────────────────────────────────────
  setStatusDot("security-dot", city.security.level);
  el("security-cameras").textContent  = city.security.cameras;
  el("security-alarms").textContent   = city.security.alarms;
  el("security-response").textContent = city.security.response;
  el("security-status").textContent   = city.security.status;
  setProgressBar("security-bar", city.security.bar, city.security.level);

  // ── Environment ───────────────────────────────────────────────────────────
  const eLevel = aqiLevel(city.environment.aqi);
  setStatusDot("environment-dot", eLevel);
  el("environment-aqi").textContent   = city.environment.aqi;
  el("environment-noise").textContent = city.environment.noise;
  el("environment-temp").textContent  = city.environment.temp;
  el("environment-status").textContent = city.environment.status;
  setProgressBar("environment-bar", city.environment.aqi, eLevel);

  // Timestamp
  el("last-updated-time").textContent = timeNow();
}

// ─── City Tab Logic ───────────────────────────────────────────────────────────

let activeCity = "istanbul";

function selectCity(cityKey) {
  activeCity = cityKey;

  document.querySelectorAll(".city-tab").forEach(btn => {
    const isActive = btn.dataset.city === cityKey;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });

  renderCity(cityKey);
}

// ─── Auto-refresh (simulate live data with small random deltas) ───────────────

function jitter(value, range) {
  return Math.max(0, Math.min(100, value + Math.floor(Math.random() * range * 2 + 1) - range));
}

function refreshLiveData() {
  // Apply tiny random changes to traffic density and AQI to simulate live feed
  Object.values(CITIES).forEach(city => {
    city.traffic.density    = jitter(city.traffic.density, 3);
    city.environment.aqi    = jitter(city.environment.aqi, 2);
    city.energy.bar         = jitter(city.energy.bar, 2);
  });

  renderCity(activeCity);
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

document.querySelectorAll(".city-tab").forEach(btn => {
  btn.addEventListener("click", () => selectCity(btn.dataset.city));
});

// Initial render
selectCity("istanbul");

// Refresh every 5 seconds
setInterval(refreshLiveData, 5000);
