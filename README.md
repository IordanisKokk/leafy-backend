# 🌿 leafy - A House-Plant Management API

A fully-typed **Node.js + TypeScript** backend for tracking your house plants, their care schedules, and species data. It exposes a JWT-secured REST API, ships with Docker for friction-free local setup, and serves live Swagger docs.

---

## Features

| Area                  | What you can do                                                                        |
| --------------------- | -------------------------------------------------------------------------------------- |
| **Auth**              | Register & log in (JWT bearer)                                                         |
| **Species catalogue** | Read-only list with default care data & images (seeded from `data/plant-species.json`) |
| **Plants**            | CRUD plants that belong to you; JSON blobs for custom properties & care instructions   |
| **Water logs**        | `POST /plants/:id/water` marks a plant as just watered                                 |
| **Docs**              | Interactive Swagger UI at **`/docs`**                                                  |

---

## Tech stack

* **Node 20 + TypeScript** — typed end-to-end
* **Express** — thin HTTP layer
* **TypeORM** (+ PostgreSQL) — data-mapper & migrations
* **Docker Compose** — dev-DB + hot-reload API
* **Swagger-UI-Express + swagger-jsdoc** — automatic OpenAPI
* **Zod** *(coming soon)* — request validation

---

## Project layout

```text
house-plant-api/
├─ data/                    # JSON fixtures (species catalogue)
├─ scripts/                 # one-off tooling (seeding, migrations)
├─ src/
│  ├─ entities/             # TypeORM models
│  ├─ middleware/           # auth, validation
│  ├─ routes/               # feature routers
│  ├─ config/               # swagger, datasource, env helpers
│  └─ index.ts              # app bootstrap
├─ Dockerfile.dev           # dev image (hot-reload)
├─ docker-compose.yml       # api + postgres services
└─ README.md
```

---

## 🚀 Quick start (Docker)

```bash
# 1 – build & start containers
docker compose up --build -d

# 2 – seed the species catalogue
docker compose exec api npm run seed:species

# 3 – open the docs & play
open http://localhost:3000/docs
```

### Environment

Copy **`.env.example`** → **`.env`** and tweak as needed:

```env
PORT=3000
DATABASE_URL=postgres://plantuser:plantpass@postgres:5432/plantdev
JWT_SECRET=change_me_now
```

---

## Running locally without Docker

```bash
npm i                                  # install deps
export DATABASE_URL=postgres://...     # start your own Postgres
npm run dev                            # ts-node + nodemon
```

---

## Database migrations (soon)

```bash
npm run typeorm migration:generate -n add_water_logs
npm run typeorm migration:run
```

---

## API reference (v1)

| Method   | Path                | Description     | Auth |
| -------- | ------------------- | --------------- | ---- |
| `POST`   | `/auth/register`    | register user   | ✗    |
| `POST`   | `/auth/login`       | obtain JWT      | ✗    |
| `GET`    | `/species`          | list species    | ✗    |
| `GET`    | `/species/:id`      | species detail  | ✗    |
| `POST`   | `/plants`           | create plant    | ✓    |
| `GET`    | `/plants`           | list my plants  | ✓    |
| `PATCH`  | `/plants/:id`       | update plant    | ✓    |
| `DELETE` | `/plants/:id`       | delete plant    | ✓    |
| `POST`   | `/plants/:id/water` | mark as watered | ✓    |

> **Full, up-to-date contract lives in Swagger UI.**

---

## Species data

*Catalogue lives in* **`data/plant-species.json`**. Add or edit entries and rerun:

```bash
npm run seed:species
```

The script performs an **upsert** on `commonName`, so existing rows are updated, new ones inserted.

---

## 🌱 Roadmap

### Plant Care Features
* [ ] **Watering reminders** — push notifications & email alerts based on plant schedules
* [ ] **Care task tracking** — fertilizing, repotting, pruning reminders
* [ ] **Plant health monitoring** — photo uploads & growth tracking
* [ ] **Smart notifications** — weather-based watering adjustments
* [ ] **Care history analytics** — visualize plant care patterns over time

### Technical Improvements
* [ ] Zod validation + error envelope
* [ ] TypeORM migrations & `synchronize: false` in prod
* [ ] OAuth (Google, GitHub)
* [ ] Unit & integration tests (Vitest + Supertest)
* [ ] Background job processing for notifications

PRs welcome! ✨

---

## License

[MIT](LICENSE)