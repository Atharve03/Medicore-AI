# MediCore AI — Database Design (MongoDB / Mongoose)

Design principles: reference over duplication, one collection per aggregate
root, denormalize only small, rarely-changing display fields (e.g. a doctor's
name cached on an Appointment) to avoid extra lookups on hot read paths.

> Full Mongoose schemas (with validation, indexes, hooks) are generated in
> each module's own phase (Phase 4–15). This document fixes the **shape** of
> the data model so every later phase builds against the same contract.

## 1. Collections Overview

| Collection | Owner Module | Purpose |
|---|---|---|
| `users` | Auth | Login identity + role for every person in the system |
| `patients` | Patient | Patient profile, linked to a `users` doc |
| `doctors` | Doctor | Doctor profile, specialization, schedule |
| `staff` | Admin | Receptionist / Nurse / Pharmacist / Lab Technician profiles |
| `appointments` | Appointment | Booking between patient and doctor |
| `medicalRecords` | Medical Record | Visit notes, diagnosis, attachments |
| `prescriptions` | Prescription | Medicines prescribed per visit |
| `labReports` | Laboratory | Test orders and results |
| `medicines` | Pharmacy | Pharmacy catalog |
| `pharmacyOrders` | Pharmacy | Dispense records against a prescription |
| `invoices` | Billing | Billing line items and payment status |
| `inventoryItems` | Inventory | Non-medicine hospital stock (equipment, supplies) |
| `admissions` | Admission | Inpatient admission/bed/discharge tracking |
| `notifications` | Notification | In-app/email notification records |
| `auditLogs` | Cross-cutting | AI + sensitive-action audit trail |

## 2. Entity-Relationship Summary

```
users ──1:1── patients
users ──1:1── doctors
users ──1:1── staff

patients ──1:N── appointments ──N:1── doctors
patients ──1:N── medicalRecords ──N:1── doctors
medicalRecords ──1:N── prescriptions
medicalRecords ──1:N── labReports
prescriptions ──1:N── pharmacyOrders ──N:1── medicines
patients ──1:N── invoices
patients ──1:N── admissions
inventoryItems (standalone, referenced by admissions for bed/equipment use)
users ──1:N── notifications
```

## 3. Collection Field Sketches

### `users`
```
{ _id, email, passwordHash, role: enum[admin,doctor,patient,receptionist,
  nurse,pharmacist,labTechnician], isActive, lastLoginAt, createdAt, updatedAt }
```

### `patients`
```
{ _id, userId -> users, fullName, dateOfBirth, gender, bloodGroup,
  contactNumber, address, emergencyContact, allergies[], createdAt }
```

### `doctors`
```
{ _id, userId -> users, fullName, specialization, qualifications[],
  department, consultationFee, availability[{ day, startTime, endTime }],
  createdAt }
```

### `staff`
```
{ _id, userId -> users, fullName, role: enum[receptionist,nurse,pharmacist,
  labTechnician], department, shift, createdAt }
```

### `appointments`
```
{ _id, patientId -> patients, doctorId -> doctors, scheduledAt, status:
  enum[requested,confirmed,completed,cancelled,noShow], reasonForVisit,
  createdBy -> users, createdAt }
```

### `medicalRecords`
```
{ _id, patientId -> patients, doctorId -> doctors, appointmentId ->
  appointments (nullable), visitDate, symptoms[], diagnosis, notes,
  attachments[{ url, type }], createdAt }
```

### `prescriptions`
```
{ _id, medicalRecordId -> medicalRecords, patientId -> patients, doctorId ->
  doctors, medicines: [{ medicineId -> medicines, dosage, frequency,
  durationDays }], status: enum[active,dispensed,expired], createdAt }
```

### `labReports`
```
{ _id, patientId -> patients, doctorId -> doctors, testType, orderedAt,
  resultAt, status: enum[ordered,inProgress,completed], results: [{
  parameter, value, unit, referenceRange }], reportFileUrl, createdAt }
```

### `medicines`
```
{ _id, name, genericName, manufacturer, category, unitPrice, stockQuantity,
  reorderLevel, expiryDate, createdAt }
```

### `pharmacyOrders`
```
{ _id, prescriptionId -> prescriptions, patientId -> patients, dispensedBy ->
  users (the pharmacist's account — no separate Staff profile module is
  built in this project, see Phase 11), items: [{ medicineId -> medicines,
  quantity, unitPrice }], totalAmount, dispensedAt }
```

### `invoices`
```
{ _id, patientId -> patients, relatedTo: { type: enum[appointment,
  admission,pharmacyOrder,lab], refId }, lineItems: [{ description, amount }],
  totalAmount, paidAmount, status: enum[pending,partiallyPaid,paid,void],
  createdAt }
```

### `inventoryItems`
```
{ _id, name, category, unit, quantityInStock, reorderLevel, location,
  lastRestockedAt, createdAt }
```

### `admissions`
```
{ _id, patientId -> patients, doctorId -> doctors, wardType, bedNumber,
  admittedAt, expectedDischargeAt, dischargedAt, status: enum[admitted,
  discharged], createdAt }
```

### `notifications`
```
{ _id, userId -> users, type: enum[appointment,billing,lab,system], title,
  message, isRead, createdAt }
```

### `auditLogs`
```
{ _id, actorUserId -> users, action, targetType, targetId, aiProvider
  (nullable), createdAt }
```

## 4. Indexing Plan (applied when each module's schema is created)

- `users.email` — unique index.
- `appointments.{doctorId, scheduledAt}` — compound index for schedule lookups.
- `labReports.{patientId, resultAt}` — compound index for "latest report" queries.
- `medicines.name` — text index for pharmacy search.
- `notifications.{userId, isRead}` — compound index for unread-count queries.

## 5. Duplication Kept Intentionally Minimal

The only accepted denormalization in this design: a display-only cached
`doctorName`/`patientName` snapshot may be added to `appointments` in a later
phase purely to avoid a join on list views — the source of truth always
remains `doctors`/`patients`.
