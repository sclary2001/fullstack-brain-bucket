# HOTEL
> A simple supply desk for tracking the items a hotel team needs.

`@sclary2001` | `2026-10-20` | `HOTEL`

HOTEL uses a browser page, `fetch()`, an Express REST API, and MongoDB Atlas. This page is the quick map to the app, code, and grading evidence.

## Quick links

| Link | What it opens |
|---|---|
| [HOTEL on GCP — PROD](http://34.39.144.144:5500/) | Production app on the GCP VM; deployment is still being set up |
| [HOTEL API health check](http://34.39.144.144:5500/api/health) | Returns JSON when the HOTEL server is running |
| [Existing Render app](https://fullstack-brain-bucket-bpdo.onrender.com) | Existing GOLF app; HOTEL is not deployed there |
| [MongoDB Atlas dashboard](https://cloud.mongodb.com/) | Sign in to view the Atlas cluster and database |
| [GCP deployment workflow](https://github.com/sclary2001/fullstack-brain-bucket/actions/workflows/re-deploy-main-to-gcp.yml) | Starts deployment to the GCP VM |
| [GCP deployment history](https://github.com/sclary2001/fullstack-brain-bucket/actions/workflows/re-deploy-main-to-gcp.yml) | View deployment runs and results |
| [GitHub main branch](https://github.com/sclary2001/fullstack-brain-bucket/tree/main) | Production source |
| [GitHub dev branch](https://github.com/sclary2001/fullstack-brain-bucket/tree/dev) | Development source |
| [GitHub repository](https://github.com/sclary2001/fullstack-brain-bucket) | All code, issues, branches, and pull requests |
| [GOLF site reference](https://sclary.barrycumbie.com/) | Existing GOLF project site |
| [This README](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/docs/README.md) | HOTEL landing page and grading dashboard |
| [HOTEL verification workflow](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/.github/workflows/verify-hotel.yml) | Runs the automated checks |

## Grading dashboard

| Requirement | Direct evidence |
|---|---|
| MongoDB Atlas connection | [Connection code](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/server/mongo.js#L6-L18) |
| GET all supplies | [GET endpoint](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/server/app.js#L64-L72) |
| GET one supply by ID | [GET by ID endpoint](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/server/app.js#L74-L82) |
| Filter supplies by category or search text | [Filtered GET endpoint](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/server/app.js#L64-L72) |
| POST creates a supply | [POST endpoint](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/server/app.js#L84-L94) |
| PATCH updates a supply | [PATCH endpoint](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/server/app.js#L96-L109) |
| DELETE removes a supply | [DELETE endpoint](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/server/app.js#L111-L119) |
| Frontend uses `fetch()` and updates the page | [HOTEL browser code](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/public/hotel.js#L10-L35) |
| HOTEL page shown at the site root | [public/index.html](https://github.com/sclary2001/fullstack-brain-bucket/blob/main/public/index.html) |
| Persistent CRUD on PROD | [GCP HOTEL app](http://34.39.144.144:5500/) — verify after deployment |
| HOTEL milestone | [HOTEL milestone](https://github.com/sclary2001/fullstack-brain-bucket/milestone/1) |
| Example issue with acceptance criteria | [Issue #1](https://github.com/sclary2001/fullstack-brain-bucket/issues/1) |
| Development branch | [Feature branch](https://github.com/sclary2001/fullstack-brain-bucket/tree/feature/hotel-supply-crud) |
| Feature → dev | [PR #2](https://github.com/sclary2001/fullstack-brain-bucket/pull/2) — merged |
| dev → main | [PR #3](https://github.com/sclary2001/fullstack-brain-bucket/pull/3) — merged |
| GCP workflow fix | [PR #4](https://github.com/sclary2001/fullstack-brain-bucket/pull/4) — merged into dev |
| Current GCP deployment fix | [PR #9](https://github.com/sclary2001/fullstack-brain-bucket/pull/9) |

## What the app does

The HOTEL page tracks supplies such as towels, linens, and guest amenities. Team members can add an item, search or filter the list, edit a saved item, and delete it. The browser sends JSON to Express; Express reads and writes MongoDB Atlas and returns JSON to the page.

| HTTP method | Endpoint | MongoDB action | Use |
|---|---|---|---|
| `GET` | `/api/items` | `find()` | List items; filter with `category` or `q` |
| `GET` | `/api/items/:id` | `findOne()` | Read one item by ID |
| `POST` | `/api/items` | `insertOne()` | Create an item |
| `PATCH` | `/api/items/:id` | `updateOne()` | Update an item |
| `DELETE` | `/api/items/:id` | `deleteOne()` | Delete an item |

## Architecture and workflow

```text
Browser (public/) → fetch() → Express REST API (server/) → MongoDB Atlas
feature branch → PR → dev → PR → main → GitHub Actions → GCP VM
```

## Deployment status

The GCP VM address is `34.39.144.144`. The existing GOLF site is in `~/app`; HOTEL is set up in a separate `~/hotel` folder. The HOTEL app and health check are not confirmed live yet. [PR #9](https://github.com/sclary2001/fullstack-brain-bucket/pull/9) updates deployment to use the separate HOTEL folder.

To run locally, open a terminal in `server/`, run `npm ci`, copy `server/.env.example` to `server/.env`, set your Atlas connection string in `MONGODB_URI`, then run `npm start`. The local site opens at http://localhost:5500.

Keep Atlas credentials in the server's ignored `.env` file. Never put the URI in frontend code, README files, issues, gists, or commits. `.gitignore` excludes `.env` and `node_modules/`.

## Agile evidence

The project flow is **issue → feature branch → PR → dev → test → PR → main → GitHub Actions → PROD**. Issue #1 links the HOTEL milestone, feature branch, and pull requests.