"""
City-V Data Simulator
Generates realistic Istanbul city data for all modules.
"""
import asyncio
import random
import math
import logging
from datetime import datetime
from typing import Optional
from app.database import SessionLocal
from app.config import settings

logger = logging.getLogger(__name__)

# Full district monitoring catalog for global-ready pilots
CITY_CENTERS = {
    "İstanbul": {"lat": 41.0082, "lng": 28.9784},
    "Ankara": {"lat": 39.9334, "lng": 32.8597},
    "İzmir": {"lat": 38.4237, "lng": 27.1428},
    "Antalya": {"lat": 36.8969, "lng": 30.7133},
    "Bursa": {"lat": 40.1826, "lng": 29.0665},
}

ISTANBUL_DISTRICT_SEED = [
    {"name": "Kadıköy", "lat": 40.9927, "lng": 29.0277, "density": 0.8},
    {"name": "Beşiktaş", "lat": 41.0422, "lng": 29.0066, "density": 0.9},
    {"name": "Şişli", "lat": 41.0602, "lng": 28.9878, "density": 0.85},
    {"name": "Fatih", "lat": 41.0195, "lng": 28.9395, "density": 0.75},
    {"name": "Beyoğlu", "lat": 41.0369, "lng": 28.9775, "density": 0.88},
    {"name": "Üsküdar", "lat": 41.0231, "lng": 29.0152, "density": 0.70},
    {"name": "Bağcılar", "lat": 41.0387, "lng": 28.8543, "density": 0.65},
    {"name": "Pendik", "lat": 40.8776, "lng": 29.2291, "density": 0.60},
    {"name": "Maltepe", "lat": 40.9355, "lng": 29.1300, "density": 0.72},
    {"name": "Ataşehir", "lat": 40.9923, "lng": 29.1244, "density": 0.78},
    {"name": "Sarıyer", "lat": 41.1672, "lng": 29.0575, "density": 0.55},
    {"name": "Bakırköy", "lat": 40.9755, "lng": 28.8741, "density": 0.82},
]

ANKARA_DISTRICT_SEED = [
    {"name": "Çankaya", "lat": 39.9179, "lng": 32.8630, "density": 0.85},
    {"name": "Keçiören", "lat": 39.9950, "lng": 32.8629, "density": 0.75},
    {"name": "Yenimahalle", "lat": 39.9453, "lng": 32.7936, "density": 0.70},
    {"name": "Mamak", "lat": 39.9194, "lng": 32.9358, "density": 0.65},
    {"name": "Altındağ", "lat": 39.9591, "lng": 32.8760, "density": 0.72},
    {"name": "Etimesgut", "lat": 39.9566, "lng": 32.6789, "density": 0.68},
]

IZMIR_DISTRICT_SEED = [
    {"name": "Konak", "lat": 38.4189, "lng": 27.1287, "density": 0.88},
    {"name": "Karşıyaka", "lat": 38.4626, "lng": 27.1115, "density": 0.80},
    {"name": "Bornova", "lat": 38.4658, "lng": 27.2152, "density": 0.75},
    {"name": "Buca", "lat": 38.3812, "lng": 27.1886, "density": 0.70},
    {"name": "Gaziemir", "lat": 38.3206, "lng": 27.1378, "density": 0.65},
    {"name": "Bayraklı", "lat": 38.4591, "lng": 27.1714, "density": 0.78},
]

ANTALYA_DISTRICT_SEED = [
    {"name": "Muratpaşa", "lat": 36.8969, "lng": 30.7133, "density": 0.85},
    {"name": "Kepez", "lat": 36.9550, "lng": 30.7178, "density": 0.72},
    {"name": "Konyaaltı", "lat": 36.8627, "lng": 30.6307, "density": 0.78},
    {"name": "Aksu", "lat": 36.9200, "lng": 30.8200, "density": 0.60},
    {"name": "Döşemealtı", "lat": 36.9800, "lng": 30.6200, "density": 0.55},
]

BURSA_DISTRICT_SEED = [
    {"name": "Osmangazi", "lat": 40.1961, "lng": 29.0601, "density": 0.82},
    {"name": "Nilüfer", "lat": 40.2200, "lng": 28.9700, "density": 0.80},
    {"name": "Yıldırım", "lat": 40.1938, "lng": 29.1095, "density": 0.70},
    {"name": "Mudanya", "lat": 40.3749, "lng": 28.8842, "density": 0.55},
    {"name": "Gemlik", "lat": 40.4329, "lng": 29.1516, "density": 0.58},
    {"name": "İnegöl", "lat": 40.0765, "lng": 29.5139, "density": 0.62},
]

CITY_DISTRICT_NAMES = {
    "İstanbul": [
        "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş",
        "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih",
        "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer",
        "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu",
    ],
    "Ankara": [
        "Akyurt", "Altındağ", "Ayaş", "Bala", "Beypazarı", "Çamlıdere", "Çankaya", "Çubuk", "Elmadağ", "Etimesgut",
        "Evren", "Gölbaşı", "Güdül", "Haymana", "Kahramankazan", "Kalecik", "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan",
        "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle",
    ],
    "İzmir": [
        "Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova", "Buca", "Çeşme", "Çiğli",
        "Dikili", "Foça", "Gaziemir", "Güzelbahçe", "Karabağlar", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık", "Kiraz",
        "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar", "Selçuk", "Tire", "Torbalı", "Urla",
    ],
    "Antalya": [
        "Akseki", "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike", "Gazipaşa", "Gündoğmuş", "İbradı",
        "Kaş", "Kemer", "Kepez", "Konyaaltı", "Korkuteli", "Kumluca", "Manavgat", "Muratpaşa", "Serik",
        "Lara",
    ],
    "Bursa": [
        "Büyükorhan", "Gemlik", "Gürsu", "Harmancık", "İnegöl", "İznik", "Karacabey", "Keles", "Kestel", "Mudanya",
        "Mustafakemalpaşa", "Nilüfer", "Orhaneli", "Orhangazi", "Osmangazi", "Yenişehir", "Yıldırım",
    ],
}


def _build_city_districts(city: str, seed_rows: list, district_names: list) -> list:
    center = CITY_CENTERS[city]
    seed_by_name = {r["name"]: r for r in seed_rows}
    built = []
    for i, name in enumerate(district_names):
        seed = seed_by_name.get(name)
        if seed:
            built.append({"name": name, "lat": seed["lat"], "lng": seed["lng"], "density": seed["density"], "city": city})
            continue

        angle = math.radians((i * 137.5) % 360)
        radius = 0.03 + (i % 9) * 0.012
        lat = center["lat"] + math.cos(angle) * radius
        lng = center["lng"] + math.sin(angle) * radius
        density = round(min(0.92, max(0.48, 0.58 + ((i * 17) % 26) / 100)), 2)
        built.append({"name": name, "lat": round(lat, 5), "lng": round(lng, 5), "density": density, "city": city})
    return built


ISTANBUL_DISTRICTS = _build_city_districts("İstanbul", ISTANBUL_DISTRICT_SEED, CITY_DISTRICT_NAMES["İstanbul"])
ANKARA_DISTRICTS = _build_city_districts("Ankara", ANKARA_DISTRICT_SEED, CITY_DISTRICT_NAMES["Ankara"])
IZMIR_DISTRICTS = _build_city_districts("İzmir", IZMIR_DISTRICT_SEED, CITY_DISTRICT_NAMES["İzmir"])
ANTALYA_DISTRICTS = _build_city_districts("Antalya", ANTALYA_DISTRICT_SEED, CITY_DISTRICT_NAMES["Antalya"])
BURSA_DISTRICTS = _build_city_districts("Bursa", BURSA_DISTRICT_SEED, CITY_DISTRICT_NAMES["Bursa"])

# Tüm ilçeler birleşik liste (full district monitoring)
ALL_DISTRICTS = ISTANBUL_DISTRICTS + ANKARA_DISTRICTS + IZMIR_DISTRICTS + ANTALYA_DISTRICTS + BURSA_DISTRICTS

# Venues: malls, cafes, restaurants, streets in Istanbul
ISTANBUL_VENUES = [
    # --- Shopping Malls (AVM) ---
    {"id": "VEN-MALL-01", "name": "Cevahir AVM", "district": "Şişli", "category": "mall", "subcategory": "büyük AVM",
     "lat": 41.0667, "lng": 28.9936, "capacity": 4000},
    {"id": "VEN-MALL-02", "name": "İstinye Park", "district": "Sarıyer", "category": "mall", "subcategory": "büyük AVM",
     "lat": 41.1143, "lng": 29.0571, "capacity": 3500},
    {"id": "VEN-MALL-03", "name": "Zorlu Center", "district": "Beşiktaş", "category": "mall", "subcategory": "lüks AVM",
     "lat": 41.0664, "lng": 29.0094, "capacity": 2800},
    {"id": "VEN-MALL-04", "name": "Capitol AVM", "district": "Üsküdar", "category": "mall", "subcategory": "orta AVM",
     "lat": 41.0117, "lng": 29.0256, "capacity": 2200},
    {"id": "VEN-MALL-05", "name": "CarrefourSA", "district": "Bakırköy", "category": "mall", "subcategory": "orta AVM",
     "lat": 40.9728, "lng": 28.8675, "capacity": 2500},
    {"id": "VEN-MALL-06", "name": "Marmara Forum", "district": "Bakırköy", "category": "mall", "subcategory": "büyük AVM",
     "lat": 41.0004, "lng": 28.8611, "capacity": 3800},
    {"id": "VEN-MALL-07", "name": "Palladium Tower", "district": "Ataşehir", "category": "mall", "subcategory": "büyük AVM",
     "lat": 40.9838, "lng": 29.1156, "capacity": 3200},
    {"id": "VEN-MALL-08", "name": "Akasya AVM", "district": "Üsküdar", "category": "mall", "subcategory": "büyük AVM",
     "lat": 41.0173, "lng": 29.0503, "capacity": 3100},
    # --- Cafes ---
    {"id": "VEN-CAFE-01", "name": "Starbucks Kadıköy", "district": "Kadıköy", "category": "cafe", "subcategory": "zincir kafe",
     "lat": 40.9903, "lng": 29.0267, "capacity": 80},
    {"id": "VEN-CAFE-02", "name": "Kahve Dünyası Beşiktaş", "district": "Beşiktaş", "category": "cafe", "subcategory": "zincir kafe",
     "lat": 41.0425, "lng": 29.0055, "capacity": 70},
    {"id": "VEN-CAFE-03", "name": "Mandabatmaz", "district": "Beyoğlu", "category": "cafe", "subcategory": "tarihi kafe",
     "lat": 41.0330, "lng": 28.9765, "capacity": 40},
    {"id": "VEN-CAFE-04", "name": "Gloria Jean's Şişli", "district": "Şişli", "category": "cafe", "subcategory": "zincir kafe",
     "lat": 41.0611, "lng": 28.9866, "capacity": 90},
    {"id": "VEN-CAFE-05", "name": "Karaköy Güllüoğlu", "district": "Beyoğlu", "category": "cafe", "subcategory": "tatlı-kafe",
     "lat": 41.0235, "lng": 28.9745, "capacity": 120},
    {"id": "VEN-CAFE-06", "name": "Çay Evi Üsküdar", "district": "Üsküdar", "category": "cafe", "subcategory": "çay bahçesi",
     "lat": 41.0240, "lng": 29.0140, "capacity": 150},
    {"id": "VEN-CAFE-07", "name": "Mado Bağcılar", "district": "Bağcılar", "category": "cafe", "subcategory": "zincir kafe",
     "lat": 41.0372, "lng": 28.8521, "capacity": 60},
    {"id": "VEN-CAFE-08", "name": "Costa Coffee Ataşehir", "district": "Ataşehir", "category": "cafe", "subcategory": "zincir kafe",
     "lat": 40.9936, "lng": 29.1242, "capacity": 75},
    # --- Restaurants ---
    {"id": "VEN-REST-01", "name": "Çiya Sofrası", "district": "Kadıköy", "category": "restaurant", "subcategory": "Türk mutfağı",
     "lat": 40.9894, "lng": 29.0312, "capacity": 100},
    {"id": "VEN-REST-02", "name": "Mikla", "district": "Beyoğlu", "category": "restaurant", "subcategory": "fine dining",
     "lat": 41.0348, "lng": 28.9774, "capacity": 80},
    {"id": "VEN-REST-03", "name": "Nusr-Et Beşiktaş", "district": "Beşiktaş", "category": "restaurant", "subcategory": "steakhouse",
     "lat": 41.0398, "lng": 28.9991, "capacity": 120},
    {"id": "VEN-REST-04", "name": "Hamdi Restaurant", "district": "Fatih", "category": "restaurant", "subcategory": "Türk mutfağı",
     "lat": 41.0195, "lng": 28.9741, "capacity": 200},
    {"id": "VEN-REST-05", "name": "Tarihi Sultanahmet Köftecisi", "district": "Fatih", "category": "restaurant", "subcategory": "köfte",
     "lat": 41.0050, "lng": 28.9771, "capacity": 90},
    {"id": "VEN-REST-06", "name": "Nusret Maltepe", "district": "Maltepe", "category": "restaurant", "subcategory": "steakhouse",
     "lat": 40.9323, "lng": 29.1323, "capacity": 110},
    {"id": "VEN-REST-07", "name": "Balık Evi Sarıyer", "district": "Sarıyer", "category": "restaurant", "subcategory": "balık",
     "lat": 41.1650, "lng": 29.0568, "capacity": 130},
    {"id": "VEN-REST-08", "name": "Kaşıbeyaz Ataşehir", "district": "Ataşehir", "category": "restaurant", "subcategory": "kebap",
     "lat": 40.9918, "lng": 29.1287, "capacity": 160},
    # --- Streets (Caddeler) ---
    {"id": "VEN-STR-01", "name": "İstiklal Caddesi", "district": "Beyoğlu", "category": "street", "subcategory": "alışveriş caddesi",
     "lat": 41.0328, "lng": 28.9769, "capacity": 15000},
    {"id": "VEN-STR-02", "name": "Bağdat Caddesi", "district": "Kadıköy", "category": "street", "subcategory": "alışveriş caddesi",
     "lat": 40.9611, "lng": 29.0633, "capacity": 8000},
    {"id": "VEN-STR-03", "name": "Nişantaşı Abdi İpekçi", "district": "Şişli", "category": "street", "subcategory": "lüks cadde",
     "lat": 41.0514, "lng": 28.9951, "capacity": 5000},
    {"id": "VEN-STR-04", "name": "Çarşıkapı Uzunçarşı", "district": "Fatih", "category": "street", "subcategory": "tarihi çarşı",
     "lat": 41.0133, "lng": 28.9633, "capacity": 6000},
    {"id": "VEN-STR-05", "name": "Kapalıçarşı Çevresi", "district": "Fatih", "category": "street", "subcategory": "tarihi çarşı",
     "lat": 41.0105, "lng": 28.9680, "capacity": 10000},
    {"id": "VEN-STR-06", "name": "Moda Caddesi", "district": "Kadıköy", "category": "street", "subcategory": "sahil caddesi",
     "lat": 40.9831, "lng": 29.0289, "capacity": 4000},
    {"id": "VEN-STR-07", "name": "Ortaköy Sahil", "district": "Beşiktaş", "category": "street", "subcategory": "sahil caddesi",
     "lat": 41.0475, "lng": 29.0284, "capacity": 5000},
    {"id": "VEN-STR-08", "name": "Bostancı Sahil Yolu", "district": "Ataşehir", "city": "İstanbul", "category": "street", "subcategory": "sahil caddesi",
     "lat": 40.9637, "lng": 29.1046, "capacity": 3500},
]

ANKARA_VENUES = [
    {"id": "ANK-MALL-01", "name": "Armada AVM", "district": "Çankaya", "city": "Ankara", "category": "mall", "subcategory": "büyük AVM",
     "lat": 39.9024, "lng": 32.8213, "capacity": 3200},
    {"id": "ANK-MALL-02", "name": "Ankamall", "district": "Yenimahalle", "city": "Ankara", "category": "mall", "subcategory": "büyük AVM",
     "lat": 39.9561, "lng": 32.7749, "capacity": 4000},
    {"id": "ANK-MALL-03", "name": "Kentpark AVM", "district": "Çankaya", "city": "Ankara", "category": "mall", "subcategory": "büyük AVM",
     "lat": 39.9232, "lng": 32.8478, "capacity": 3600},
    {"id": "ANK-CAFE-01", "name": "Kızılay Kahveci", "district": "Çankaya", "city": "Ankara", "category": "cafe", "subcategory": "tarihi kafe",
     "lat": 39.9199, "lng": 32.8543, "capacity": 60},
    {"id": "ANK-CAFE-02", "name": "Starbucks Tunalı", "district": "Çankaya", "city": "Ankara", "category": "cafe", "subcategory": "zincir kafe",
     "lat": 39.9042, "lng": 32.8606, "capacity": 80},
    {"id": "ANK-REST-01", "name": "Trilye Restaurant", "district": "Çankaya", "city": "Ankara", "category": "restaurant", "subcategory": "Türk mutfağı",
     "lat": 39.9190, "lng": 32.8620, "capacity": 120},
    {"id": "ANK-REST-02", "name": "Hacı Arif Bey", "district": "Altındağ", "city": "Ankara", "category": "restaurant", "subcategory": "köfte",
     "lat": 39.9400, "lng": 32.8600, "capacity": 150},
    {"id": "ANK-STR-01", "name": "Kızılay Meydanı", "district": "Çankaya", "city": "Ankara", "category": "street", "subcategory": "merkez meydan",
     "lat": 39.9199, "lng": 32.8543, "capacity": 8000},
    {"id": "ANK-STR-02", "name": "Tunalı Hilmi Caddesi", "district": "Çankaya", "city": "Ankara", "category": "street", "subcategory": "alışveriş caddesi",
     "lat": 39.9042, "lng": 32.8606, "capacity": 5000},
]

IZMIR_VENUES = [
    {"id": "IZM-MALL-01", "name": "Agora AVM", "district": "Konak", "city": "İzmir", "category": "mall", "subcategory": "büyük AVM",
     "lat": 38.4434, "lng": 27.1584, "capacity": 3000},
    {"id": "IZM-MALL-02", "name": "Kipa Bornova", "district": "Bornova", "city": "İzmir", "category": "mall", "subcategory": "büyük AVM",
     "lat": 38.4658, "lng": 27.2152, "capacity": 2500},
    {"id": "IZM-CAFE-01", "name": "Kemeraltı Kahvesi", "district": "Konak", "city": "İzmir", "category": "cafe", "subcategory": "tarihi kafe",
     "lat": 38.4125, "lng": 27.1383, "capacity": 50},
    {"id": "IZM-CAFE-02", "name": "Kordon Starbucks", "district": "Konak", "city": "İzmir", "category": "cafe", "subcategory": "zincir kafe",
     "lat": 38.4254, "lng": 27.1408, "capacity": 70},
    {"id": "IZM-REST-01", "name": "Deniz Restaurant Kordon", "district": "Konak", "city": "İzmir", "category": "restaurant", "subcategory": "deniz ürünleri",
     "lat": 38.4280, "lng": 27.1430, "capacity": 140},
    {"id": "IZM-STR-01", "name": "Kordon Yolu", "district": "Konak", "city": "İzmir", "category": "street", "subcategory": "sahil caddesi",
     "lat": 38.4254, "lng": 27.1408, "capacity": 10000},
    {"id": "IZM-STR-02", "name": "Kemeraltı Çarşısı", "district": "Konak", "city": "İzmir", "category": "street", "subcategory": "tarihi çarşı",
     "lat": 38.4125, "lng": 27.1383, "capacity": 6000},
]

ANTALYA_VENUES = [
    {"id": "ANT-MALL-01", "name": "TerraCity AVM", "district": "Muratpaşa", "city": "Antalya", "category": "mall", "subcategory": "büyük AVM",
     "lat": 36.8723, "lng": 30.7236, "capacity": 3500},
    {"id": "ANT-MALL-02", "name": "Deepo Outlet", "district": "Kepez", "city": "Antalya", "category": "mall", "subcategory": "outlet AVM",
     "lat": 36.9300, "lng": 30.7100, "capacity": 2800},
    {"id": "ANT-CAFE-01", "name": "Kaleiçi Kahvesi", "district": "Muratpaşa", "city": "Antalya", "category": "cafe", "subcategory": "tarihi kafe",
     "lat": 36.8869, "lng": 30.7056, "capacity": 45},
    {"id": "ANT-REST-01", "name": "Club Arma", "district": "Muratpaşa", "city": "Antalya", "category": "restaurant", "subcategory": "sahil restoranı",
     "lat": 36.8869, "lng": 30.7056, "capacity": 180},
    {"id": "ANT-STR-01", "name": "Kaleiçi Tarihi Bölge", "district": "Muratpaşa", "city": "Antalya", "category": "street", "subcategory": "turizm bölgesi",
     "lat": 36.8869, "lng": 30.7056, "capacity": 12000},
    {"id": "ANT-STR-02", "name": "Konyaaltı Plaj Yolu", "district": "Konyaaltı", "city": "Antalya", "category": "street", "subcategory": "sahil caddesi",
     "lat": 36.8627, "lng": 30.6307, "capacity": 8000},
]

BURSA_VENUES = [
    {"id": "BRS-MALL-01", "name": "Zafer Plaza", "district": "Osmangazi", "city": "Bursa", "category": "mall", "subcategory": "büyük AVM",
     "lat": 40.1956, "lng": 29.0607, "capacity": 2800},
    {"id": "BRS-MALL-02", "name": "Korupark AVM", "district": "Nilüfer", "city": "Bursa", "category": "mall", "subcategory": "büyük AVM",
     "lat": 40.2318, "lng": 28.9812, "capacity": 3200},
    {"id": "BRS-CAFE-01", "name": "Ulu Cami Yanı Kafe", "district": "Osmangazi", "city": "Bursa", "category": "cafe", "subcategory": "tarihi kafe",
     "lat": 40.1831, "lng": 29.0606, "capacity": 55},
    {"id": "BRS-REST-01", "name": "İskender Salonu Hacıbey", "district": "Osmangazi", "city": "Bursa", "category": "restaurant", "subcategory": "İskender kebap",
     "lat": 40.1961, "lng": 29.0601, "capacity": 200},
    {"id": "BRS-STR-01", "name": "Kapalı Çarşı Bursa", "district": "Osmangazi", "city": "Bursa", "category": "street", "subcategory": "tarihi çarşı",
     "lat": 40.1831, "lng": 29.0606, "capacity": 7000},
    {"id": "BRS-STR-02", "name": "Nilüfer Caddesi", "district": "Nilüfer", "city": "Bursa", "category": "street", "subcategory": "alışveriş caddesi",
     "lat": 40.2200, "lng": 28.9700, "capacity": 4000},
]

ALL_VENUES = ISTANBUL_VENUES + ANKARA_VENUES + IZMIR_VENUES + ANTALYA_VENUES + BURSA_VENUES

TRAFFIC_LOCATIONS = [
    ("D-100 Otoyolu", 0.12), ("E-5 Karayolu", 0.10),
    ("FSM Köprüsü", 0.08), ("Boğaziçi Köprüsü", 0.09),
    ("Bağlantı Yolu", 0.05), ("Çevre Yolu", 0.07),
    ("Ana Cadde", 0.06), ("Kavşak Noktası", 0.04),
]

WASTE_TYPES = ["general", "recycling", "organic"]
INCIDENT_TYPES = ["traffic_accident", "fire", "theft", "medical", "vandalism", "infrastructure"]
INCIDENT_DESCRIPTIONS = {
    "traffic_accident": "Trafik kazası meydana geldi, ambulans ve trafik ekipleri yönlendirildi.",
    "fire": "Yangın ihbarı alındı, itfaiye ekipleri sevk edildi.",
    "theft": "Hırsızlık ihbarı değerlendiriliyor, polis devriyesi bölgeye gönderildi.",
    "medical": "Acil tıbbi müdahale gerekiyor, sağlık ekipleri yönlendirildi.",
    "vandalism": "Vandalizm vakası tespit edildi, ekipler olay yerine gidiyor.",
    "infrastructure": "Altyapı hasarı rapor edildi, teknik ekip göreve çağrıldı.",
}


def get_time_factor() -> float:
    """Rush hour factor: higher during 8-10 AM and 6-8 PM."""
    hour = datetime.now().hour
    if 7 <= hour <= 9:
        return 0.85 + random.uniform(0, 0.15)
    elif 17 <= hour <= 19:
        return 0.80 + random.uniform(0, 0.20)
    elif 12 <= hour <= 14:
        return 0.55 + random.uniform(0, 0.15)
    elif 0 <= hour <= 5:
        return 0.10 + random.uniform(0, 0.10)
    else:
        return 0.40 + random.uniform(0, 0.20)


def congestion_from_score(score: float) -> str:
    if score >= 0.75:
        return "CRITICAL"
    elif score >= 0.55:
        return "HIGH"
    elif score >= 0.35:
        return "MODERATE"
    else:
        return "LOW"


def aqi_category(aqi: int) -> str:
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"


class CitySimulator:
    def __init__(self):
        self._task: Optional[asyncio.Task] = None
        self._running = False
        # In-memory store of latest readings per sensor
        self.latest_traffic = {}
        self.latest_energy = {}
        self.latest_waste = {}
        self.latest_air = {}
        self.latest_venues = {}
        self.active_incidents = {}
        self.zone_risks = {}
        self._init_static_data()

    def _init_static_data(self):
        """Pre-create sensors/containers for all districts."""
        sensor_idx = 0
        for district in ALL_DISTRICTS:
            d = district["name"]
            # 3 traffic sensors per district
            for i in range(3):
                road, offset = TRAFFIC_LOCATIONS[(sensor_idx + i) % len(TRAFFIC_LOCATIONS)]
                sid = f"TRF-{d[:3].upper()}-{i+1:02d}"
                self.latest_traffic[sid] = {
                    "sensor_id": sid, "district": d, "city": district.get("city", "İstanbul"),
                    "location_name": f"{d} - {road}",
                    "lat": district["lat"] + random.uniform(-0.02, 0.02),
                    "lng": district["lng"] + random.uniform(-0.02, 0.02),
                    "vehicle_count": 0, "avg_speed": 50.0,
                    "congestion_level": "LOW", "congestion_score": 0.1,
                    "predicted_congestion": "LOW",
                }
            sensor_idx += 3

            # 1 energy substation per district
            eid = f"ENE-{d[:3].upper()}-01"
            self.latest_energy[eid] = {
                "substation_id": eid, "district": d, "city": district.get("city", "İstanbul"),
                "lat": district["lat"] + random.uniform(-0.01, 0.01),
                "lng": district["lng"] + random.uniform(-0.01, 0.01),
                "current_consumption": 0, "predicted_consumption": 0,
                "capacity": 5000 + district["density"] * 3000,
                "utilization_pct": 0, "is_anomaly": False, "anomaly_score": 0.0,
                "renewable_pct": random.uniform(15, 40),
            }

            # 4 waste containers per district
            for i in range(4):
                cid = f"WST-{d[:3].upper()}-{i+1:02d}"
                self.latest_waste[cid] = {
                    "container_id": cid, "district": d, "city": district.get("city", "İstanbul"),
                    "location_name": f"{d} - Nokta {i+1}",
                    "lat": district["lat"] + random.uniform(-0.025, 0.025),
                    "lng": district["lng"] + random.uniform(-0.025, 0.025),
                    "fill_pct": random.uniform(10, 60),
                    "capacity_liters": random.choice([120, 240, 660, 1100]),
                    "container_type": WASTE_TYPES[i % 3],
                    "needs_collection": False,
                }

            # 1 air quality station per district
            aid = f"AIR-{d[:3].upper()}-01"
            self.latest_air[aid] = {
                "station_id": aid, "district": d, "city": district.get("city", "İstanbul"),
                "location_name": f"{d} Hava Kalitesi İstasyonu",
                "lat": district["lat"] + random.uniform(-0.01, 0.01),
                "lng": district["lng"] + random.uniform(-0.01, 0.01),
                "aqi": 50, "pm25": 10.0, "pm10": 20.0,
                "no2": 15.0, "co2": 400.0, "o3": 30.0,
                "aqi_category": "Good", "predicted_aqi": 50, "alert_active": False,
            }

            # Safety zone risk per district
            self.zone_risks[d] = {
                "zone_id": f"ZONE-{d[:3].upper()}",
                "district": d, "city": district.get("city", "İstanbul"),
                "lat": district["lat"], "lng": district["lng"],
                "risk_score": 0.2, "risk_level": "LOW",
                "incident_count_24h": 0,
            }

        # Venues initialization
        for v in ALL_VENUES:
            self.latest_venues[v["id"]] = {
                "venue_id": v["id"],
                "name": v["name"],
                "city": v.get("city", "İstanbul"),
                "district": v["district"],
                "category": v["category"],
                "subcategory": v["subcategory"],
                "lat": v["lat"],
                "lng": v["lng"],
                "capacity": v["capacity"],
                "current_occupancy": int(v["capacity"] * 0.3),
                "occupancy_pct": 30.0,
                "occupancy_level": "LOW",
                "wait_minutes": 0,
                "trend": "stable",
                "is_peak": False,
            }

    def _update_traffic(self):
        tf = get_time_factor()
        for sid, data in self.latest_traffic.items():
            district = next((d for d in ALL_DISTRICTS if d["name"] == data["district"]), {"density": 0.7})
            score = tf * district["density"] + random.gauss(0, 0.08)
            score = max(0.0, min(1.0, score))
            speed = max(5.0, 80.0 * (1 - score) + random.gauss(0, 3))
            vehicles = int(score * 400 * district["density"] + random.uniform(0, 30))
            data["congestion_score"] = round(score, 3)
            data["congestion_level"] = congestion_from_score(score)
            data["avg_speed"] = round(speed, 1)
            data["vehicle_count"] = vehicles
            # Predict 1-hour ahead (slightly regress toward mean)
            future_score = score * 0.85 + 0.5 * 0.15 + random.gauss(0, 0.05)
            future_score = max(0.0, min(1.0, future_score))
            data["predicted_congestion"] = congestion_from_score(future_score)

    def _update_energy(self):
        hour = datetime.now().hour
        # Consumption peaks at 14:00 and 20:00
        base_factor = 0.4 + 0.6 * (math.sin((hour - 6) * math.pi / 12) ** 2)
        for eid, data in self.latest_energy.items():
            district = next((d for d in ALL_DISTRICTS if d["name"] == data["district"]), {"density": 0.7})
            consumption = data["capacity"] * base_factor * district["density"]
            consumption += random.gauss(0, consumption * 0.05)
            consumption = max(0, consumption)
            utilization = (consumption / data["capacity"]) * 100

            # Anomaly: occasionally spike
            anomaly_score = 0.0
            if random.random() < 0.03:
                consumption *= 1.4
                utilization = min(100, utilization * 1.4)
                anomaly_score = random.uniform(0.7, 1.0)

            data["current_consumption"] = round(consumption, 1)
            data["predicted_consumption"] = round(consumption * (0.9 + random.uniform(0, 0.2)), 1)
            data["utilization_pct"] = round(min(100, utilization), 1)
            data["is_anomaly"] = anomaly_score > 0.5
            data["anomaly_score"] = round(anomaly_score, 3)

    def _update_waste(self):
        for cid, data in self.latest_waste.items():
            # Fill pct increases over time
            data["fill_pct"] = min(100, data["fill_pct"] + random.uniform(0, 1.2))
            data["needs_collection"] = data["fill_pct"] >= 80

    def _update_venues(self):
        hour = datetime.now().hour
        PEAK_HOURS = {
            "mall":       [(11, 15), (17, 21)],
            "cafe":       [(8, 11), (14, 17), (20, 23)],
            "restaurant": [(12, 14), (19, 22)],
            "street":     [(9, 11), (14, 18), (19, 22)],
        }
        for vid, data in self.latest_venues.items():
            cat = data["category"]
            is_peak = any(s <= hour <= e for s, e in PEAK_HOURS.get(cat, []))
            base = 0.68 if is_peak else 0.22
            district = next((d for d in ALL_DISTRICTS if d["name"] == data["district"]), None)
            density = district["density"] if district else 0.7
            pct = base * density + random.gauss(0, 0.07)
            pct = max(0.02, min(1.0, pct))
            occ = int(pct * data["capacity"])
            prev_pct = data["occupancy_pct"] / 100.0
            if pct > prev_pct + 0.05:
                trend = "rising"
            elif pct < prev_pct - 0.05:
                trend = "falling"
            else:
                trend = "stable"
            wait = 0
            if cat in ("restaurant", "cafe") and pct > 0.80:
                wait = int((pct - 0.80) * 120)
            if pct >= 0.90:
                level = "PACKED"
            elif pct >= 0.70:
                level = "HIGH"
            elif pct >= 0.40:
                level = "MODERATE"
            else:
                level = "LOW"
            data.update({
                "current_occupancy": occ,
                "occupancy_pct": round(pct * 100, 1),
                "occupancy_level": level,
                "wait_minutes": wait,
                "trend": trend,
                "is_peak": is_peak,
            })

    def _update_air(self):
        tf = get_time_factor()
        for aid, data in self.latest_air.items():
            district = next((d for d in ALL_DISTRICTS if d["name"] == data["district"]), {"density": 0.7})
            # AQI correlated with traffic density and time
            base_aqi = 30 + tf * 120 * district["density"]
            pm25 = base_aqi * 0.22 + random.gauss(0, 3)
            pm10 = pm25 * 1.8 + random.gauss(0, 4)
            no2 = base_aqi * 0.15 + random.gauss(0, 2)
            co2 = 380 + tf * 120 * district["density"] + random.gauss(0, 10)
            o3 = max(0, 40 - tf * 20 + random.gauss(0, 5))
            aqi = int(max(0, min(500, base_aqi + random.gauss(0, 8))))

            data.update({
                "aqi": aqi, "pm25": round(max(0, pm25), 1),
                "pm10": round(max(0, pm10), 1), "no2": round(max(0, no2), 1),
                "co2": round(co2, 1), "o3": round(max(0, o3), 1),
                "aqi_category": aqi_category(aqi),
                "predicted_aqi": int(aqi * (0.9 + random.uniform(0, 0.15))),
                "alert_active": aqi > 150,
            })

    def _maybe_add_incident(self, db):
        from app.models.safety import SafetyIncident
        import uuid
        if random.random() < 0.15:  # 15% chance each tick
            district = random.choice(ALL_DISTRICTS)
            itype = random.choice(INCIDENT_TYPES)
            severity_score = random.uniform(0.2, 1.0)
            if severity_score >= 0.8:
                severity = "CRITICAL"
            elif severity_score >= 0.6:
                severity = "HIGH"
            elif severity_score >= 0.35:
                severity = "MEDIUM"
            else:
                severity = "LOW"

            incident = SafetyIncident(
                incident_id=f"INC-{uuid.uuid4().hex[:8].upper()}",
                district=district["name"],
                location_name=f"{district['name']} - {random.choice(['Merkez', 'Kuzey', 'Güney', 'Doğu', 'Batı'])}",
                lat=district["lat"] + random.uniform(-0.03, 0.03),
                lng=district["lng"] + random.uniform(-0.03, 0.03),
                incident_type=itype,
                severity=severity,
                severity_score=round(severity_score, 3),
                status=random.choice(["active", "investigating", "resolved"]),
                units_dispatched=random.randint(1, 6),
                description=INCIDENT_DESCRIPTIONS[itype],
                timestamp=datetime.utcnow(),
            )
            db.add(incident)
            db.commit()

            # Update zone risk
            zone = self.zone_risks.get(district["name"])
            if zone:
                zone["incident_count_24h"] = zone.get("incident_count_24h", 0) + 1
                zone["risk_score"] = min(1.0, zone["risk_score"] + severity_score * 0.1)
                if zone["risk_score"] >= 0.75:
                    zone["risk_level"] = "CRITICAL"
                elif zone["risk_score"] >= 0.55:
                    zone["risk_level"] = "HIGH"
                elif zone["risk_score"] >= 0.30:
                    zone["risk_level"] = "MEDIUM"
                else:
                    zone["risk_level"] = "LOW"

    def _persist_to_db(self):
        from app.models.traffic import TrafficReading
        from app.models.energy import EnergyReading
        from app.models.waste import WasteContainer
        from app.models.air_quality import AirQualityReading
        db = SessionLocal()
        try:
            ts = datetime.utcnow()
            # Save traffic readings (limit DB growth - only save every 60 seconds effectively)
            for data in list(self.latest_traffic.values())[:6]:
                db.add(TrafficReading(**data, timestamp=ts))
            for data in list(self.latest_energy.values())[:4]:
                db.add(EnergyReading(**data, timestamp=ts))
            for data in list(self.latest_air.values())[:4]:
                db.add(AirQualityReading(**data, timestamp=ts))
            # Upsert waste containers
            for data in self.latest_waste.values():
                existing = db.query(WasteContainer).filter_by(
                    container_id=data["container_id"]).first()
                if existing:
                    existing.fill_pct = data["fill_pct"]
                    existing.needs_collection = data["needs_collection"]
                    existing.timestamp = ts
                else:
                    db.add(WasteContainer(**data, timestamp=ts))
            self._maybe_add_incident(db)
            db.commit()
        except Exception as e:
            logger.error(f"DB persist error: {e}")
            db.rollback()
        finally:
            db.close()

    def get_live_snapshot(self) -> dict:
        tf = get_time_factor()
        critical_traffic = sum(
            1 for d in self.latest_traffic.values() if d["congestion_level"] == "CRITICAL"
        )
        anomaly_energy = sum(1 for d in self.latest_energy.values() if d["is_anomaly"])
        waste_alerts = sum(1 for d in self.latest_waste.values() if d["needs_collection"])
        air_alerts = sum(1 for d in self.latest_air.values() if d["alert_active"])
        avg_aqi = int(sum(d["aqi"] for d in self.latest_air.values()) / len(self.latest_air)) if self.latest_air else 0

        return {
            "type": "live_update",
            "timestamp": datetime.utcnow().isoformat(),
            "stats": {
                "traffic": {
                    "critical_sensors": critical_traffic,
                    "total_sensors": len(self.latest_traffic),
                    "avg_speed": round(
                        sum(d["avg_speed"] for d in self.latest_traffic.values()) / max(1, len(self.latest_traffic)), 1
                    ),
                },
                "energy": {
                    "anomalies": anomaly_energy,
                    "total_consumption": round(
                        sum(d["current_consumption"] for d in self.latest_energy.values()), 1
                    ),
                    "avg_utilization": round(
                        sum(d["utilization_pct"] for d in self.latest_energy.values()) / max(1, len(self.latest_energy)), 1
                    ),
                },
                "waste": {
                    "needs_collection": waste_alerts,
                    "total_containers": len(self.latest_waste),
                    "avg_fill_pct": round(
                        sum(d["fill_pct"] for d in self.latest_waste.values()) / max(1, len(self.latest_waste)), 1
                    ),
                },
                "air": {
                    "alerts": air_alerts,
                    "avg_aqi": avg_aqi,
                    "total_stations": len(self.latest_air),
                },
            },
            "traffic_sensors": list(self.latest_traffic.values()),
            "energy_substations": list(self.latest_energy.values()),
            "air_stations": list(self.latest_air.values()),
            "waste_containers": list(self.latest_waste.values()),
            "zone_risks": list(self.zone_risks.values()),
            "venues": list(self.latest_venues.values()),
        }

    async def _loop(self, ws_manager):
        tick = 0
        while self._running:
            try:
                self._update_traffic()
                self._update_energy()
                self._update_air()
                self._update_waste()
                self._update_venues()
                # Persist to DB every 12 ticks (~60s)
                if tick % 12 == 0:
                    self._persist_to_db()
                snapshot = self.get_live_snapshot()
                await ws_manager.broadcast(snapshot)
            except Exception as e:
                logger.error(f"Simulator loop error: {e}")
            tick += 1
            await asyncio.sleep(settings.SIMULATION_INTERVAL)

    async def start(self, ws_manager):
        self._running = True
        self._task = asyncio.create_task(self._loop(ws_manager))
        logger.info("City-V Simulator started.")

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("City-V Simulator stopped.")
