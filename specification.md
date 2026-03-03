# Image Admin Application — Technical Specification

**Version:** 1.0
**Purpose:** Lightweight image management admin for a static website
**Architecture Type:** Headless CMS (filesystem + JSON)
**Backend:** Node.js
**Frontend:** Vue 3
**Deployment:** VM + rsync

---

# 1. System Goal

The application provides an admin interface allowing authorized users to manage images displayed on an existing static website.

Main responsibilities:

- Upload images
- Automatically process and compress images
- Assign images to predefined categories
- Define a single hero image per category
- Reorder images via drag & drop
- Generate/update a JSON file consumed by the static frontend

The system is intentionally minimal and optimized for:

- 2 admin users only
- No database
- Filesystem storage
- Simple deployment
- High reliability

---

# 2. High-Level Architecture

Admin SPA (Vue)
        │
        │ REST API
        ▼
Node.js Backend (Express)
(Auth + Upload + JSON management)
        │
        ▼
Filesystem Storage
 ├── images/
 ├── archive/
 └── data/images.json
        │
        ▼
Static Website (fetches JSON)

---

# 3. Technology Stack

## Backend
- Node.js (LTS)
- Express.js
- sharp (image processing)
- multer (file upload)
- jsonwebtoken (authentication)
- bcrypt (password hashing)
- fs/promises

## Frontend
- Vue 3
- Vite
- Axios
- vue-draggable (drag & drop sorting)

---

# 4. Authentication

## Users

Only two users exist. No registration or password reset UI.

Users are defined manually in:

/config/users.json

Example:

{
  "users": [
    {
      "username": "admin",
      "passwordHash": "bcrypt_hash_here"
    }
  ]
}

## Authentication Flow

1. POST /api/login
2. Backend validates credentials
3. JWT issued
4. JWT stored in httpOnly cookie

Token expiration: 7 days

---

# 5. Filesystem Structure

/var/www/aracolor/

resources/img/bs/
  arteviva/
    img_001.jpg

archive/
  arteviva/
    img_001_original.png

data/
  images.json

admin/   (Vue build output)

---

# 6. Image Processing Pipeline

When an image is uploaded:

1. Validate file type:
   - jpg
   - png
   - webp
   - heic

2. Store original file:

archive/{category}/{id}_original.ext

3. Convert image:
   - format: JPEG
   - quality: 80

4. Ensure output size ≤ 1MB
   - iterative compression or resize if needed

5. Save processed image:

images/{category}/{id}.jpg

Maximum upload size: 20MB

---

# 7. Data Model (images.json)

## Root Structure

{
  "version": 1,
  "categories": {},
  "images": {}
}

## Categories

Categories are predefined and NOT editable via UI.

{
  "arteviva": {
    "title": "Arteviva",
    "heroImageId": "img_002",
    "imageIds": [
      "img_003",
      "img_002",
      "img_001"
    ]
  }
}

Rules:

- Exactly one hero image per category
- Hero must exist inside imageIds
- Images cannot belong to multiple categories

## Images

{
  "img_001": {
    "category": "arteviva",
    "src": "/resources/img/bs/arteviva/img_001.jpg",
    "order": 3,
    "uploadedAt": "2026-02-22T10:30:00Z"
  }
}

## Ordering Rules

- Default ordering: newest first
- Drag & drop updates order
- order stored explicitly as integers

---

# 8. API Specification

## Authentication

POST /api/login

Request:
{
  "username": "admin",
  "password": "password"
}

Response:
200 OK + JWT cookie

---

## Categories

GET /api/categories

Returns categories and images data.

---

## Upload Images

POST /api/upload

Content-Type:
multipart/form-data

Fields:
files[] (multiple allowed)
category

Behavior:
- supports bulk upload
- processes each file
- updates JSON

---

## Reorder Images

POST /api/reorder

{
  "category": "nature",
  "orderedIds": ["img_3","img_1","img_2"]
}

---

## Set Hero Image

POST /api/set-hero

{
  "category": "nature",
  "imageId": "img_002"
}

---

## Delete Image

DELETE /api/image/:id

Behavior:
- deletes processed image
- keeps archived original

---

# 9. Frontend (Vue SPA)

## Views

### LoginView
- username/password login

### DashboardView

Contains:

Category Selector:
- dropdown of predefined categories

Gallery Grid:
- image grid layout
- lazy loading

Bulk Upload:
- drag & drop upload
- multi-file selection

Drag & Drop Ordering:
- implemented using vue-draggable

Hero Selector:
- star button
- immediate update

Hero image visually highlighted.

---

# 10. Public Website Integration

Static website loads:

fetch("/data/images.json")

Frontend:
- sorts images by order
- resolves hero via heroImageId

Content updates after page refresh.

---

# 11. Deployment

Deployment method:
rsync

Requirements:

Backend must have write permissions for:
- images/
- archive/
- data/

IMPORTANT:
Deployment must NOT overwrite /data.

---

# 12. CDN Readiness (Future)

Image paths are relative:

/images/...

Future CDN support example:

https://cdn.domain.com/images/...

Only frontend base URL needs changing.

---

# 13. Error Handling

Backend validates:

- authentication
- file type
- max upload size
- valid category

Error format:

{
  "error": "MESSAGE"
}

---

# 14. Security

- JWT stored in httpOnly cookie
- Same-origin only (no CORS)
- Upload limits enforced
- Filenames never derived from user input

Image ID format:

img_<timestamp>_<random>

---

# 15. Edge Cases

- Hero image deleted → newest image becomes hero automatically
- Reorder without change → no-op
- Upload failure → JSON rollback

---

# 16. Non-Goals

Not included:

- Public API
- Multi-user permissions
- Database
- Real-time updates
- SEO management UI

---

# Result

After implementation:

1. Admin uploads images
2. Backend optimizes images
3. JSON updates automatically
4. Static website displays new content on refresh

Result: lightweight headless CMS without a database.