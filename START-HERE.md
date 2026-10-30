# AI Mobile Clinic - complete project

Three parts, three terminals:

| Part | Folder | Run | Address |
|---|---|---|---|
| Backend (Express) | `Backend/` | `npm install` then `npm start` | http://localhost:3000 |
| AI service (Python) | `ML/` | `pip install -r requirements.txt` then `python dataset_eda_api.py` | http://127.0.0.1:5001 |
| Frontend (Angular 14) | `mobileClinic/` | `npm install` then `ng serve` | http://localhost:4200 |

Your own `.env` is not in this zip. Keep using yours in `Backend/.env`
(`Backend/.env.example` shows the layout).

## One-time setup

1. **Backend `.env`** needs: `DATABASE_URL` (Supabase *Session pooler* string), `JWT_SECRET`
   (a long random value, not a placeholder), `SUPABASE_URL` (`https://<project>.supabase.co`,
   no `db.` prefix), `SUPABASE_SECRET_KEY`, `CORS_ORIGIN=http://localhost:4200`.
   The server refuses to start with a clear message if one is missing.
2. **Database:** open the Supabase SQL editor and run `Backend/db/migration.sql`
   (safe to run twice). It adds the `ai_predictions` and `nurse_assessments` tables
   and a `doctors.user_id` link column.
3. **Accounts** (run inside `Backend/`; passwords are stored hashed):

```
node db/create-user.js admin@clinic.com  "Admin#12345"  admin  Clinic Admin
node db/create-user.js nurse@clinic.com  "Nurse#12345"  nurse  Sam Nurse
node db/create-user.js dr.dlamini@clinic.com "Doctor#12345" doctor Nomsa Dlamini 1
```
   The last number is the `id` of that doctor in the `doctors` table (see the Doctors page
   in the admin app or the Supabase table editor). It links the login to the doctor profile;
   the doctor dashboard needs it. Patients register themselves on `/register`.

## What each role sees after logging in

| Role | Lands on | Can do |
|---|---|---|
| Admin | `/dashboard` | everything: patients, doctors, nurses, appointments, records, AI triage/analytics, dataset EDA, reports, settings; can also open the nurse dashboard |
| Nurse | `/nurse/dashboard` | day's queue, check patients in, record vitals + notes, see the patient's AI predictions and history, Patients / Appointments / Records / AI Triage pages |
| Doctor | `/doctor/dashboard` | own appointments for a day, nurse vitals, AI predictions, previous visits; write diagnosis/treatment -> saves a medical record and completes the visit; AI Analytics |
| Patient | `/patient/dashboard` | symptom checker -> AI prediction, book / view / cancel appointments, view own records |

Appointment status flow: **Pending** (booked) -> **Confirmed** (checked in by the nurse,
or automatically when vitals are saved) -> **Completed** (doctor saves the record).

## Security rules enforced by the server

- Every API route except `/login`, `/signup`, `/test` needs a valid token (401 otherwise).
- Roles are checked on the server (403 otherwise); the Angular guards only hide pages.
- A patient can only read or change their own appointments, records, messages and predictions.
- Public sign-up always creates a patient. Staff accounts come from `create-user.js` or an admin.

## Quick end-to-end check

1. Log in as the **patient** -> Symptom Checker -> fill it in -> a prediction appears (the
   AI service must be running on port 5001) -> Book Appointment -> Confirm.
2. Log in as the **nurse** -> that appointment shows in the queue with the AI prediction ->
   Check in -> open the patient -> save vitals.
3. Log in as the **doctor** -> open the same appointment -> see vitals and the AI prediction ->
   save diagnosis -> the status becomes Completed.
4. Log back in as the patient -> My records shows the new record.
5. Logged out, open `http://localhost:3000/api/patients` -> `401`.

## Known gaps (not built)

Prescriptions, Messages, Health Tips and Profile pages on the patient app have no screens
yet (their buttons do nothing), and forgot-password is only a stub.
