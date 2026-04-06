# City-V - AI Smart City Platform

City-V, coklu tenant mimaride calisan yapay zeka destekli akilli sehir yonetim platformudur.
Trafik, enerji, atik, guvenlik, hava kalitesi, vatandas bildirimleri ve mekan yogunlugu modullerini tek panelde toplar.

Bu README iki farkli ihtiyaca gore hazirlandi:

1. Gercek aktif (production) ortama alma: Hangi urunler ve hangi API'ler lazim?
2. Urun kullanmadan direkt calistirma: Sadece sunucu + acik kaynak stack ile nasil ayaga kalkar?

---

## 1) Mimari Ozet

- Frontend: Next.js (App Router)
- Backend: FastAPI + WebSocket
- Veri: PostgreSQL
- Gercek zamanli akis: WebSocket `/ws` (default 5 saniye)
- Kimlik dogrulama: JWT + tenant tabanli erisim

---

## 2) Gercek Aktif Ortam (Urunlu)

Bu yol, musteriye acik kesintisiz ve olceklenebilir kullanim icindir.

### 2.1 Kullanilacak urunler

Asagidaki urunler minimum production setidir. Vendor bagimsiz dusunebilirsin (Azure, AWS, GCP veya on-prem managed servisler):

| Katman | Onerilen urun tipi | Neden gerekli |
|---|---|---|
| DNS + Domain | Domain yonetimi (Cloudflare, Route53 vb.) | `app.senin-domainin.com` yayini |
| TLS/SSL | Managed sertifika veya Let's Encrypt | HTTPS zorunlulugu |
| Reverse Proxy | Nginx / Traefik / cloud load balancer | 80/443 yonetimi, WebSocket proxy |
| Uygulama calistirma | Docker + orchestrator veya VM service | Surekli calisan backend/frontend |
| Veritabani | Managed PostgreSQL | Backup, failover, performans |
| Secret yonetimi | Vault/KeyVault/Secrets Manager | Sifre/token guvenligi |
| Gozlemlenebilirlik | Log + metric + alert (Grafana/Prometheus vb.) | Ariza tespiti ve alarm |
| CI/CD | GitHub Actions/GitLab CI | Otomatik test + otomatik deploy |

### 2.2 Kullanilacak API siniflari

Bu projede iki API grubu var:

1. Dahili City-V API'leri (zorunlu):
- `/api/dashboard/summary`
- `/api/traffic/live`
- `/api/energy/live`
- `/api/waste/live`
- `/api/safety/summary`
- `/api/air-quality/live`
- `/api/citizens/reports`
- `/api/venues/live`
- `/api/admin/*`
- `ws://.../ws` veya `wss://.../ws`

2. Harici API'ler (opsiyonel, gercek veri icin):
- Trafik: sehir acik veri API'leri, harita servisleri
- Hava: meteoroloji veya hava kalitesi veri saglayicilari
- Guvenlik/olay: belediye/kurum olay akislari
- Mekan yogunlugu: IoT/sensor veya partner data feed

Not: Harici API baglanmazsan sistem simulator ile canliya benzer veri ureterek calisir.

### 2.3 Production'a cikis adimlari

1. Domain ve SSL hazirla.
2. PostgreSQL'i production ortaminda ac (managed onerilir).
3. Backend ve frontend icin ayri servis tanimla.
4. Reverse proxy ile:
   - `/` -> frontend
   - `/api` -> backend
   - `/ws` -> backend websocket upgrade
5. Ortam degiskenlerini secret olarak tanimla.
6. CI/CD pipeline kur:
   - test
   - lint
   - build
   - deploy
7. Monitoring + alert kur (CPU, RAM, DB, 5xx, websocket kopma).

---

## 3) Urun Kullanmadan Direkt Calistirma (Self-Hosted)

Bu yol, hic managed urun kullanmadan tek VPS/fiziksel sunucuda ayaga kaldirmak icindir.

### 3.1 Gereksinimler

- Ubuntu 22.04+ veya Windows Server
- Python 3.11+
- Node.js 18+
- npm 9+
- PostgreSQL 15+
- Nginx (onerilir)

### 3.2 Projeyi hazirlama

1. Repo'yu cek.
2. Klasore gir.
3. Veritabani bootstrap scriptini calistir.

Windows ornek:

- PostgreSQL baglantisi ile `postgres-bootstrap.sql` dosyasini calistir.
- Beklenen sonuc: `cityv_user` ve `cityv` olusur.

### 3.3 Ortam degiskenleri

Kok dizinde `.env` olustur:

| Degisken | Ornek |
|---|---|
| DATABASE_URL | postgresql+psycopg://cityv_user:cityv_secret@localhost:5432/cityv |
| ADMIN_BOOTSTRAP_USERNAME | platform-admin |
| ADMIN_BOOTSTRAP_PASSWORD | ChangeMe_123! |
| ACCESS_TOKEN_EXPIRE_MINUTES | 720 |
| BACKEND_PORT | 8000 |
| SIMULATION_INTERVAL | 5 |
| CORS_ORIGINS | http://localhost:3000 |

### 3.4 Backend calistirma

Windows:

1. `python -m venv .venv`
2. `.\.venv\Scripts\Activate.ps1`
3. `pip install -r backend/requirements.txt`
4. `python backend/start.py`

Backend:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

### 3.5 Frontend calistirma

1. `cd frontend`
2. `npm install`
3. `npm run dev`

Frontend:
- http://localhost:3000

### 3.6 Docker ile tek komutta

Kok dizinde:

- `docker-compose up --build`

---

## 4) Gercek Canliya Gecis (Urun kullanmadan, tek sunucuda)

Bu senaryo cloud managed servis yokken en pratik yoldur.

1. Frontend production build:
- `cd frontend`
- `npm ci`
- `npm run build`
- `npm run start -- -p 3000`

2. Backend service olarak:
- `pip install -r backend/requirements.txt`
- `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
- `PYTHONPATH=backend` ayarini unutma.

3. Nginx reverse proxy (ozet):
- `https://senin-domainin` -> `http://127.0.0.1:3000`
- `https://senin-domainin/api` -> `http://127.0.0.1:8000/api`
- `https://senin-domainin/ws` -> `http://127.0.0.1:8000/ws` (Upgrade header gerekli)

4. Servis surekliligi:
- Linux: systemd
- Windows: NSSM veya Task Scheduler

5. Backup:
- Gunluk PostgreSQL dump
- Frontend build ve .env yedegi

---

## 5) Hangi API'yi Nerede Kullanacagim?

### 5.1 Frontend tarafi

- Tum ekranlar REST ile backend'den veri ceker.
- Anlik guncellemeler icin WebSocket `/ws` dinlenir.
- Dashboard, city-map, traffic gibi ekranlar bu akistan state gunceller.

### 5.2 Admin/Tenant tarafi

- Giris: `POST /api/admin/auth/login`
- Profil: `GET /api/admin/auth/me`
- Tenant yonetimi: `GET/POST/PUT /api/admin/tenants*`
- Kullanici yonetimi: `GET/POST /api/admin/users`
- Host cozumleme: `GET /api/admin/resolve?host=...`

### 5.3 Harici entegrasyonlar (opsiyonel)

- Simulatorden gercek dataya gecmek icin adapter servisleri ekleyebilirsin:
  - `backend/app/services/traffic_ai.py`
  - `backend/app/services/air_quality_analyzer.py`
  - `backend/app/services/safety_analyzer.py`

---

## 6) Smoke Test Kontrol Listesi

Sistemi ayaga kaldirdiktan sonra su kontrolleri yap:

1. API health:
- `GET /api/dashboard/summary` 200 donmeli.

2. Modul endpointleri:
- `GET /api/traffic/live`
- `GET /api/energy/live`
- `GET /api/waste/live`
- `GET /api/venues/live`

3. WebSocket:
- `/ws` baglantisi kurulup periyodik `live_update` event'i gelmeli.

4. Frontend:
- Landing acilmali.
- Dashboard kartlari dolmali.
- City map hata vermeden marker gostermeli.

---

## 7) Guvenlik ve Operasyon Notlari

- Default admin sifrelerini ilk gun degistir.
- `.env` dosyasini repoya koyma.
- Production'da sadece HTTPS kullan.
- DB ve API icin firewall kurallari uygula.
- CORS origin'i tek domain ile sinirla.
- Rate limit ve log takibi ekle.

---

## 8) Proje Klasor Ozet

- backend: FastAPI, servisler, modeller, routerlar
- frontend: Next.js sayfalari, componentler, API/WS client
- docker-compose.yml: konteynerli calistirma
- postgres-bootstrap.sql: DB rol ve DB olusturma

---

City-V v1.0.0
