"""Citizen Chatbot — rule-based NLP for citizen requests."""
import re
import uuid
from typing import Dict, Tuple

CATEGORY_KEYWORDS = {
    "pothole":     ["çukur", "delik", "kaldırım", "yol bozuk", "asfalt", "yol çukuru"],
    "lighting":    ["sokak lambası", "aydınlatma", "ışık yok", "karanlık", "aydınlatma arıza"],
    "noise":       ["gürültü", "ses", "rahatsız", "müzik", "gece sesi"],
    "water":       ["su kesintisi", "su yok", "su baskını", "boru patladı", "su akmıyor"],
    "garbage":     ["çöp", "koku", "atık", "çöp tenekesi", "çöp toplamıyor"],
    "tree":        ["ağaç", "dal", "süprüntü", "park"],
    "traffic":     ["trafik", "ışık bozuk", "sinyal", "kavşak"],
    "illegal":     ["kaçak", "izinsiz", "şikayet", "suç", "hırsız", "soygun"],
    "other":       [],
}

RESPONSES = {
    "pothole": "Yol bozukluğu şikayetiniz alındı. Altyapı ekipleri 48 saat içinde bölgeyi inceleyecek.",
    "lighting": "Aydınlatma arızası kaydedildi. Elektrik ekibi 24 saat içinde müdahale edecek.",
    "noise": "Gürültü şikayetiniz ilgili birime iletildi. Saatler kurallara uygun değilse zabıta ekibi devreye girecek.",
    "water": "Su sorunu bildirimi İSKİ'ye iletildi. 6-12 saat içinde müdahale planlanıyor.",
    "garbage": "Atık yönetim ekibi bilgilendirildi. En kısa sürede temizlik yapılacak.",
    "tree": "Park ve Bahçeler Müdürlüğü'ne iletildi. 72 saat içinde müdahale edilecek.",
    "traffic": "Trafik arızası Trafik Müdürlüğü'ne bildirildi. Ekipler yönlendirildi.",
    "illegal": "Acil şikayetiniz Emniyet Müdürlüğü'ne iletildi. Gerekirse 155'i arayabilirsiniz.",
    "other": "Şikayetiniz kayıt altına alındı ve ilgili birime yönlendirildi. Teşekkür ederiz.",
}

PRIORITY_MAP = {
    "pothole": ("medium", 0.5),
    "lighting": ("medium", 0.5),
    "noise": ("low", 0.3),
    "water": ("high", 0.75),
    "garbage": ("medium", 0.4),
    "tree": ("low", 0.2),
    "traffic": ("high", 0.7),
    "illegal": ("urgent", 0.95),
    "other": ("low", 0.3),
}


def classify_report(title: str, description: str) -> Tuple[str, str, float, str]:
    text = (title + " " + description).lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text:
                priority, score = PRIORITY_MAP[category]
                return category, priority, score, RESPONSES[category]
    return "other", "low", 0.3, RESPONSES["other"]


def process_citizen_report(title: str, description: str, district: str) -> Dict:
    category, priority, priority_score, ai_response = classify_report(title, description)
    report_id = f"CIT-{uuid.uuid4().hex[:8].upper()}"
    return {
        "report_id": report_id,
        "category": category,
        "priority": priority,
        "priority_score": priority_score,
        "ai_response": ai_response,
    }
