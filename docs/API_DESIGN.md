# MediCore AI — API Design

Base path: `/api/v1`. All routes except `/auth/register` and `/auth/login`
require a valid JWT (`Authorization: Bearer <token>`). RBAC middleware
restricts each route to the listed roles.

## Auth
| Method | Path | Roles |
|---|---|---|
| POST | `/auth/register` | public (admin-invited roles only) |
| POST | `/auth/login` | public |
| POST | `/auth/refresh` | authenticated |
| POST | `/auth/logout` | authenticated |
| GET | `/auth/me` | authenticated |

## Admin
| Method | Path | Roles |
|---|---|---|
| GET/POST | `/admin/users` | admin |
| PATCH/DELETE | `/admin/users/:id` | admin |
| GET | `/admin/overview` | admin |

## Patient
| Method | Path | Roles |
|---|---|---|
| GET/PATCH | `/patients/me` | patient |
| GET | `/patients/:id` | admin, doctor, receptionist |
| GET | `/patients` | admin, receptionist |

## Doctor
| Method | Path | Roles |
|---|---|---|
| GET/PATCH | `/doctors/me` | doctor |
| GET | `/doctors/:id` | admin, patient, receptionist |
| GET | `/doctors` | admin, receptionist, patient |

## Appointment
| Method | Path | Roles |
|---|---|---|
| POST | `/appointments` | patient, receptionist |
| GET | `/appointments/mine` | patient, doctor |
| GET | `/appointments` | admin, receptionist |
| PATCH | `/appointments/:id/status` | doctor, receptionist |
| DELETE | `/appointments/:id` | patient, receptionist |

## Medical Records
| Method | Path | Roles |
|---|---|---|
| POST | `/medical-records` | doctor |
| GET | `/medical-records/patient/:patientId` | doctor, patient, admin |
| GET | `/medical-records/:id` | doctor, patient |

## Prescription
| Method | Path | Roles |
|---|---|---|
| POST | `/prescriptions` | doctor |
| GET | `/prescriptions/patient/:patientId` | doctor, patient, pharmacist |
| GET | `/prescriptions/:id` | doctor, patient, pharmacist |

## Laboratory
| Method | Path | Roles |
|---|---|---|
| POST | `/lab/orders` | doctor |
| PATCH | `/lab/orders/:id/results` | labTechnician |
| GET | `/lab/reports/patient/:patientId` | doctor, patient, labTechnician |

## Pharmacy
| Method | Path | Roles |
|---|---|---|
| GET/POST | `/pharmacy/medicines` | pharmacist, admin |
| PATCH | `/pharmacy/medicines/:id` | pharmacist, admin — added in Phase 11 for restocking/price corrections |
| POST | `/pharmacy/dispense` | pharmacist |
| GET | `/pharmacy/orders` | pharmacist, admin |

## Billing
| Method | Path | Roles |
|---|---|---|
| POST | `/billing/invoices` | receptionist, admin |
| GET | `/billing/invoices/patient/:patientId` | patient, receptionist, admin |
| PATCH | `/billing/invoices/:id/pay` | receptionist |

## Inventory
| Method | Path | Roles |
|---|---|---|
| GET/POST | `/inventory/items` | admin, nurse |
| PATCH | `/inventory/items/:id` | admin |

## Admission
| Method | Path | Roles |
|---|---|---|
| POST | `/admissions` | doctor, nurse |
| PATCH | `/admissions/:id/discharge` | doctor |
| GET | `/admissions/patient/:patientId` | doctor, patient, nurse |

## Notification
| Method | Path | Roles |
|---|---|---|
| GET | `/notifications/mine` | authenticated |
| PATCH | `/notifications/:id/read` | authenticated |

## Analytics
| Method | Path | Roles |
|---|---|---|
| GET | `/analytics/hospital-overview` | admin |
| GET | `/analytics/revenue` | admin |
| GET | `/analytics/medicine-usage` | admin |
| GET | `/analytics/department-performance` | admin |

## AI Assistant (Phase 22)
| Method | Path | Roles |
|---|---|---|
| POST | `/ai/assistant` | patient, doctor, admin |
| GET | `/ai/assistant/history` | patient, doctor, admin |

`POST /ai/assistant` request body:
```json
{ "message": "Explain my latest blood report" }
```
Response (normalized regardless of provider):
```json
{ "reply": "...", "provider": "local", "intent": "lab.explainReport" }
```
