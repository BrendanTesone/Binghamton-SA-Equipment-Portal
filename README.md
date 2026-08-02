# Binghamton SA Equipment Management Portal

[![Live Demo](https://img.shields.io/badge/Live_Site-equipment.binghamtonsa.org-blue?style=for-the-badge&logo=google-chrome)](https://equipment.binghamtonsa.org)
[![React](https://img.shields.io/badge/Frontend-React_%2B_Vite-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![PHP](https://img.shields.io/badge/Backend-PHP_REST_API-777BB4?style=for-the-badge&logo=php)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

An end-to-end web portal for student organizations and executive officers at Binghamton SA to request, manage, approve, and track event equipment rentals and warehouse inventory.

---

## [::] Live Application
- **Production URL:** [https://equipment.binghamtonsa.org](https://equipment.binghamtonsa.org)

---

## [::] Interface & System Screenshots

All system screenshots are organized in [`docs/screenshots/`](docs/screenshots/):

### [->] Authentication & Access Control
| Google OAuth 2.0 Sign-In | User Profile & Sign-Out | Access Control & Permissions |
| :---: | :---: | :---: |
| ![Google Sign-In](docs/screenshots/signin.png) | ![User Profile & Sign-Out](docs/screenshots/signout.png) | ![Access Control](docs/screenshots/grant-access.png) |
| `docs/screenshots/signin.png` | `docs/screenshots/signout.png` | `docs/screenshots/grant-access.png` |

### [->] Client Equipment Request Workflow
| 1. Contact & Event Details | 2. Equipment Availability & Selection | 3. Order Submission |
| :---: | :---: | :---: |
| ![Contact & Event Details](docs/screenshots/form-contact.png) | ![Equipment Availability](docs/screenshots/form-avail.png) | ![Order Submission](docs/screenshots/form-submit.png) |
| `docs/screenshots/form-contact.png` | `docs/screenshots/form-avail.png` | `docs/screenshots/form-submit.png` |

### [->] Administrative & Warehouse Management
| Admin Control & Warehouse Management Dashboard |
| :---: |
| ![Admin Control & Warehouse Dashboard](docs/screenshots/Admin.png) |
| `docs/screenshots/Admin.png` |

---

## [::] Basic Functionality Summary

### 1. Client Request Portal (`ClientOrderTab`)
- Club officers submit rental requests specifying event details, pickup/dropoff date ranges, and target equipment.
- Dynamic equipment selection table with real-time availability and stock validation.

### 2. Administrative Processing (`FormTab`)
- Admins review pending requests with status filtering (Pending, Approved, Rejected).
- Modal-based processing for approving orders, assigning pickup/dropoff schedules, or issuing rejections.

### 3. Inventory & Warehouse Management (`WarehouseTab`)
- Centralized tracking of physical equipment, serial numbers, categories, condition, and stock counts.

### 4. Automated Communications (`EmailTemplateTab` & PHPMailer)
- Automated HTML email dispatch using PHPMailer to notify club representatives of order approvals, rejections, and schedule changes.

---

## [::] Authentication & Security Architecture

### Google Identity Services (GIS) + PHP Session Bridge
1. **Frontend Authentication:** The React frontend uses Google OAuth 2.0 (`@react-oauth/google` / GIS) to prompt user login via university Google credentials.
2. **ID Token Verification:** Upon successful login, the frontend passes the Google ID token to `php-backend/authentication.php`.
3. **Server-Side Validation:** The PHP backend uses `Google_Client` to cryptographically verify the ID token payload server-side.
4. **Session Persistence:** Once verified, a PHP session (`session.php`) is instantiated to gate API requests to `api.php`.
5. **Credential Protection:** Sensitive database and SMTP parameters are stored in non-tracked configuration files (`secrets/`) or environment variables, keeping credentials isolated from git tracking.

---

## [::] Software Engineering & Design Rationale

### Why React + Vite (SPA)?
- Provides instantaneous tab switching between orders, warehouse, and email configuration, giving administrators a fast desktop-like experience.

### Why PHP REST Backend?
- Fits lightweight deployment requirements on existing campus web server infrastructure without requiring long-running Node daemon processes.

### Why Google OAuth 2.0?
- Eliminates local password storage risks and restricts access to verified university accounts.

### Clean Code Principles
- Adheres to modular component separation, single-responsibility handlers, and clear RESTful endpoint boundaries as outlined in project clean code standards.

---

## [::] System Requirements

- **Frontend Build Environment:** Node.js (v18+) & npm
- **Backend Web Server:** PHP (v8.0+) with `pdo_mysql` and `openssl` extensions
- **Database Engine:** MySQL 5.7+ / MariaDB 10.3+

---

## [::] Build & Deployment Instructions

1. **Frontend Build & Deployment:**
   - Ensure the backend server API endpoint URL is properly linked/embedded in the frontend configuration prior to building.
   - Install dependencies and build the production static bundle:
     ```bash
     npm install
     npm run build
     ```
   - Upload the generated static files inside `dist/` to your frontend web server.

2. **Backend Server Configuration:**
   - Upload the contents of `php-backend/` to your PHP web server.
   - Backend database and SMTP configuration files must be placed in a non-web-accessible `secrets/` directory on the root of the backend webserver.

---

## [::] Author & Attribution

- **Organization:** Binghamton University Student Association (EVP Office)
- **Developer:** Brendan Tesone ([@BrendanTesone](https://github.com/BrendanTesone))
