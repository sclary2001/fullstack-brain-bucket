# HOTEL
> A calm, practical supply desk for thoughtful hotel stays.

`@sclary2001` | `2026-10-13` | `HOTEL`

GOLF built the infrastructure. HOTEL puts it to work: **static frontend → `fetch()` → Express REST API → MongoDB Atlas**.

## Deployments + codebase

| Main | PROD | Dev | DEV | Docs | CI/CD workflow | PROD deployment evidence |
|---|---|---|---|---|---|---|
| [main](https://github.com/sclary2001/fullstack-brain-bucket/tree/main) | [GCP HOTEL](http://34.39.144.144:5500/) — waiting for deploy | [dev branch](https://github.com/sclary2001/fullstack-brain-bucket/tree/dev) | [Development app](https://fullstack-brain-bucket-bpdo.onrender.com) — old app; HOTEL not deployed | [docs/README.md](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/docs/README.md) | [Verify HOTEL](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/.github/workflows/verify-hotel.yml) · [GCP deploy](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/.github/workflows/re-deploy-main-to-gcp.yml) | [GCP deployment history](https://github.com/sclary2001/fullstack-brain-bucket/actions/workflows/re-deploy-main-to-gcp.yml) |

## HOTEL grading dashboard

| Requirement | Evidence |
|---|---|
| MongoDB Atlas connection | [`server/mongo.js`](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/server/mongo.js#L6-L18) |
| GET all | [`GET /api/items`](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/server/app.js#L64-L72) |
| GET one by identifier | [`GET /api/items/:id`](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/server/app.js#L74-L82) |
| Filtered GET (`category`, `q`) | [`GET /api/items?category=...&q=...`](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/server/app.js#L64-L72) |
| POST / create | [`POST /api/items`](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/server/app.js#L84-L94) |
| PATCH / update | [`PATCH /api/items/:id`](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/server/app.js#L96-L109) |
| DELETE | [`DELETE /api/items/:id`](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/server/app.js#L111-L119) |
| Frontend `fetch()` → DOM | [`public/hotel.js`](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/public/hotel.js#L10-L35) |
| Persistent CRUD on PROD | [GCP HOTEL app](http://34.39.144.144:5500/) — pending deployment and server MongoDB setup |
| GCP API health check | [\`/api/health\`](http://34.39.144.144:5500/api/health) — should return \`{"status":"ok"}\` when running |
| HOTEL milestone | [Hotel milestone](https://github.com/sclary2001/fullstack-brain-bucket/milestone/1) |
| Example issue | [Issue #1](https://github.com/sclary2001/fullstack-brain-bucket/issues/1) — assignee, enhancement label, Hotel milestone, acceptance criteria, and branch |
| Development branch | [feature/hotel-supply-crud](https://github.com/sclary2001/fullstack-brain-bucket/tree/feature/hotel-supply-crud) |
| Feature → dev | [PR #2](https://github.com/sclary2001/fullstack-brain-bucket/pull/2) — merged into `dev` |
| dev → main | [PR #3](https://github.com/sclary2001/fullstack-brain-bucket/pull/3) — open for review |
| PROD deployment | [GCP deploy workflow](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/.github/workflows/re-deploy-main-to-gcp.yml); success pending SSH key and server MongoDB URI |

## Current GCP deployment status

The GCP VM shown in your console is `34.39.144.144`. Both deploy workflows now target that VM and run `server/app.js`. The linked app and health-check URLs are not live yet; the health check currently refuses the connection.

To finish:
1. Add the VM's matching private SSH key in GitHub **Settings → Secrets and variables → Actions** as `SSH_PRIVATE_KEY`.
2. Configure `MONGODB_URI` in `app/server/.env` on the VM; keep the URI out of GitHub.
3. Confirm the VM's web traffic route reaches port `5500` (or its configured reverse proxy).
4. Run the [GCP deploy workflow](https://github.com/sclary2001/fullstack-brain-bucket/actions/workflows/re-deploy-main-to-gcp.yml), then check the health and app links above.

## App + API

HOTEL manages guest supplies such as linens and amenities. A user creates, searches, edits, or removes an item; the browser sends JSON with `fetch()`, Express reads or writes MongoDB, and the client renders the JSON response.

| Method | Endpoint | MongoDB operation | Purpose |
|---|---|---|---|
| `GET` | `/api/items` | `find()` | List supplies; optional `category` and name search `q` |
| `GET` | `/api/items/:id` | `findOne()` | Read one item by MongoDB ObjectId |
| `POST` | `/api/items` | `insertOne()` | Create a supply record |
| `PATCH` | `/api/items/:id` | `updateOne()` | Update selected fields |
| `DELETE` | `/api/items/:id` | `deleteOne()` | Delete one supply record |

The API returns JSON. Express serves `public/` and the API from the same origin.

## Architecture

```text
APP:        Browser (public/) → fetch() → Express REST API (server/) → MongoDB Atlas
DELIVERY:   feature branch → PR → dev → PR → main → GitHub Actions → GCP VM
```

## Run locally

1. From `server/`, run `npm ci`.
2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` to a MongoDB Atlas connection string. Set `MONGODB_DB` if the database name differs from `hotel`.
3. Run `npm start` from `server/`; open `http://localhost:5500`.
4. Run tests with `npm test` from `server/`.

`server/mongo.js` reads `process.env.MONGODB_URI` on the server. `.gitignore` excludes `.env` and `.env.*` while allowing the safe `.env.example` template. Never put Atlas credentials in frontend code, README files, issues, gists, or commits. Production Atlas credentials belong in the GCP server environment.

## GitHub Agile flow

Required evidence: **issue → feature branch → PR → `dev` → test on DEV → PR → `main` → GitHub Actions → PROD**. The issue needs acceptance criteria, an assignee, a label, the HOTEL milestone, the development branch, and linked PRs; close it when complete.
