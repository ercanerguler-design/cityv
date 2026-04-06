# City-V Real API Plan

Bu dokuman, simule veriden gercek veriye gecis icin kullanilacak API kaynaklarini ve entegrasyon sirasini ozetler.

## 1) Trafik Modulu

- HERE Traffic API
  - Kullanim: akim hizi, yogunluk, olaylar, yol segment bazli trafik
  - Alanlar: segment_id, speed_kmh, jam_factor, incident_type, lat, lng
- Google Maps Traffic (Roads/Routes)
  - Kullanim: ETA, rota sureleri, alternatif rota etkisi

## 2) Enerji Modulu

- TEDAS / Belediye acik enerji verileri (sehir bazli acik dataset)
- EPDK kamu veri setleri
  - Kullanim: tuketim trendleri, bolgesel dagilim
- SCADA entegrasyonu (pilot belediye)
  - Kullanim: trafo anlik yuk, alarm durumlari

## 3) Atik Modulu

- Belediye akilli konteyner IoT platformu (MQTT/HTTP webhook)
  - Kullanim: fill_pct, konteyner tipleri, cihaz pil bilgisi
- ArcGIS/Belediye GIS servisleri
  - Kullanim: toplama rota katmanlari, servis bolgeleri

## 4) Guvenlik Modulu

- 112 Acil acik veri istatistikleri (uygun erisim modeliyle)
- Belediye acik guvenlik verileri
- Emniyet/AFAD olay feedleri (kurumsal entegrasyon)

## 5) Hava Kalitesi Modulu

- OpenWeather Air Pollution API
- IQAir API
- MGM (Meteoroloji) acik verileri

## 6) Vatandas Modulu

- E-Devlet kimlik dogrulama (kurumsal)
- Belediye cagrimerkezi CRM API

## 7) Mekan Yogunlugu Modulu

- Google Places Popular Times (lisans ve kosullar kontrol edilmeli)
- Here Places + check-in kaynaklari
- Belediye turizm/etkinlik acik veri feedleri

## AI Katmani (Uretim)

- Azure OpenAI (onerilen)
  - Gorevler: trend ozetleme, olay siniflandirma, operasyonel oneri uretimi
  - Not: Tahmin modeli (time-series) backendde, LLM sadece aciklama/onerilerde kullanilmali

## Entegrasyon Fazlari

1. Faz A: Mevcut simulasyon + gercek API adapter katmani
2. Faz B: Trafik + Hava Kalitesi gercek API gecisi
3. Faz C: Atik IoT + Enerji SCADA pilot entegrasyonu
4. Faz D: Guvenlik + Vatandas resmi entegrasyonlari
5. Faz E: AI model tuning + MLOps + gozlemlenebilirlik

## Teknik Uygulama Notlari

- Tum harici API cagri noktalarini backendde `services/providers/` altinda topla.
- Her provider icin timeout, retry, cache ve fallback uygula.
- Simulasyon fallbackini kapatma; provider hata durumunda sistem ayakta kalmali.
- API key'leri sadece environment variable uzerinden yonet.
