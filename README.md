# KidTrack — School Bus Safety & Tracking Platform

**Founder:** Sasiprakash | **Version:** 1.0 MVP

A full-stack school transportation safety platform with real-time GPS tracking, OTP-based login, attendance management, parent notifications and a school admin portal.

---

## 📁 Repository Structure

```
kidtrack/
├── KidTrack.API/          # ASP.NET Core 8 Web API (Azure-ready)
├── admin-portal/          # React + TypeScript Admin Web App
├── parent-app/            # React Native (Expo) Parent Mobile App
├── driver-app/            # React Native (Expo) Driver Mobile App
└── .github/workflows/     # CI/CD pipelines
```

---

## 🏗️ Architecture

```
Parent App  ──┐
Driver App  ──┼──▶  ASP.NET Core 8 API (Azure App Service)
Admin Portal──┘         │           │           │
                    Azure SQL   Firebase FCM  Google Maps
```

---

## 🚀 Quick Start

### 1. Backend API

```bash
cd KidTrack.API
# Configure connection string in appsettings.Development.json
dotnet restore
dotnet ef database update
dotnet run
# Swagger UI: http://localhost:5000
```

### 2. Admin Portal

```bash
cd admin-portal
npm install
npm run dev
# Open: http://localhost:3000
```

### 3. Parent App (Expo)

```bash
cd parent-app
npm install
npx expo start
# Scan QR with Expo Go on your phone
```

### 4. Driver App (Expo)

```bash
cd driver-app
npm install
npx expo start
```

---

## 🔑 Environment Variables

### Backend (`appsettings.json`)
| Key | Description |
|-----|-------------|
| `ConnectionStrings:DefaultConnection` | Azure SQL connection string |
| `Jwt:Key` | JWT signing secret (min 256-bit) |
| `Firebase:CredentialsPath` | Path to Firebase service account JSON |
| `ApplicationInsights:ConnectionString` | Azure App Insights key |

### Mobile Apps (`.env`)
| Key | Description |
|-----|-------------|
| `EXPO_PUBLIC_API_URL` | Base URL of deployed API |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Send OTP to phone |
| POST | `/api/auth/verify` | Verify OTP, get JWT |
| GET | `/api/students` | List students |
| GET | `/api/bus/{id}/location` | Get live bus location |
| POST | `/api/bus/location` | Update bus GPS location |
| GET | `/api/attendance` | Get attendance records |
| POST | `/api/attendance/checkin` | Check in student |
| GET | `/api/notifications` | Parent notifications |
| POST | `/api/trips/start` | Start a trip |
| POST | `/api/trips/{id}/complete` | Complete a trip |
| GET | `/api/schools/{id}/dashboard` | Admin dashboard stats |

---

## 🗄️ Database Tables

`School` · `Student` · `Parent` · `Bus` · `Driver` · `Route` · `Attendance` · `Notification` · `TripHistory` · `StudentParent` (join)

---

## 🧪 Testing

```bash
cd KidTrack.API
dotnet test
```

| Layer | Approach |
|-------|----------|
| Unit | xUnit + Moq for Services |
| API | Integration tests with WebApplicationFactory |
| E2E | Playwright for Admin Portal |
| Mobile | Detox for React Native |
| Load | Azure Load Testing (k6) |

---

## ☁️ Azure Deployment

### Resources Required
- Azure App Service (B2 or P1v3)
- Azure SQL Database (S2)
- Azure Application Insights
- Firebase Project (FCM)
- Google Maps API Key

### CI/CD
GitHub Actions workflow in `.github/workflows/deploy.yml` builds, tests and deploys on push to `main`.

---

## 📱 App Modules

### Parent App
- OTP Login → Dashboard → Live Bus Tracking → Notifications → Attendance History

### Driver App
- OTP Login → Route Selection → Start Trip → GPS Broadcast → Student Check-In → Complete Trip

### Admin Portal
- Dashboard → Students → Buses → Drivers → Routes → Attendance → Reports

---

## 🗓️ Delivery Timeline

| Week | Milestone |
|------|-----------|
| 1-2 | Requirements & Wireframes |
| 3-4 | UI/UX Design |
| 5-8 | Backend Development |
| 6-10 | Mobile Development |
| 9-11 | Admin Portal |
| 12-13 | Testing & QA |
| 14 | Pilot School Launch |
| 15 | Production Go-Live |

---

## 🚀 Go-Live Checklist

- [ ] Production Azure environment provisioned
- [ ] Monitoring & logging (App Insights) active
- [ ] Database automated backup configured
- [ ] Push notification (FCM) end-to-end tested
- [ ] App Store / Play Store submissions ready
- [ ] Support model & incident process documented
- [ ] Pilot school data seeded and tested

---

## 🔭 Roadmap

- WhatsApp Integration
- AI Route Optimisation
- RFID Attendance
- Face Recognition
- Fee Management
- Multi-School SaaS Platform

---

## 📄 License

MIT — © 2024 KidTrack / Sasiprakash

> Last build triggered: 2026-09-29 22:00:33
