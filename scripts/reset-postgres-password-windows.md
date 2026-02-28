# Reset PostgreSQL `postgres` password (Windows)

Use this if you get "password authentication failed for user postgres" or don't remember the password.

## 1. Find `pg_hba.conf`

Usually at:

- `C:\Program Files\PostgreSQL\16\data\pg_hba.conf` (replace `16` with your version)

Or in PowerShell:

```powershell
Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "pg_hba.conf" | Select-Object FullName
```

## 2. Edit `pg_hba.conf` as Administrator

1. Open Notepad (or your editor) **as Administrator**.
2. Open `pg_hba.conf`.
3. Find the two lines that look like:

   ```
   host    all    all    127.0.0.1/32    scram-sha-256
   host    all    all    ::1/128         scram-sha-256
   ```

4. Change the last column from `scram-sha-256` to `trust` for both:

   ```
   host    all    all    127.0.0.1/32    trust
   host    all    all    ::1/128         trust
   ```

5. Save and close.

## 3. Restart PostgreSQL

In **PowerShell as Administrator**:

```powershell
Restart-Service postgresql-x64-16
```

(Replace `16` with your version if different. To list: `Get-Service postgresql*`.)

## 4. Set the new password

In a **new** terminal (no admin needed):

```powershell
psql -U postgres -d postgres
```

You should get in without a password. Then run:

```sql
ALTER USER postgres PASSWORD 'YourNewPassword';
\q
```

Replace `YourNewPassword` with the password you want.

## 5. Restore `pg_hba.conf` and restart

1. Open `pg_hba.conf` again (as Administrator).
2. Change `trust` back to `scram-sha-256` for those two lines.
3. Save.
4. Restart PostgreSQL again:

   ```powershell
   Restart-Service postgresql-x64-16
   ```

## 6. Use the new password

- Connect: `psql -U postgres -d postgres` (enter the new password when prompted).
- In `server/.env`: set  
  `DATABASE_URL=postgresql://postgres:YourNewPassword@localhost:5432/react_template`

Then create the DB if you haven’t yet:

```powershell
psql -U postgres -c "CREATE DATABASE react_template;"
psql -U postgres -d react_template -f server/scripts/init-db.sql
```

---

## Still can't connect after setting `trust`?

### 1. Confirm you're editing the file PostgreSQL actually uses

The service uses a specific **data directory**; `pg_hba.conf` must be in that folder.

**Find the data directory** (PowerShell):

```powershell
Get-ItemProperty -Path "HKLM:\SOFTWARE\PostgreSQL\Installations\*" -ErrorAction SilentlyContinue | Select-Object DataDirectory
```

Or open **`postgresql.conf`** in the same folder as `pg_hba.conf` (e.g. `C:\Program Files\PostgreSQL\16\data`). Check for `data_directory` or `hba_file`—that’s the exact config in use. Edit the **`pg_hba.conf`** in that data directory.

### 2. Force IPv4 so the right rule is used

Try connecting explicitly to IPv4:

```powershell
psql -h 127.0.0.1 -U postgres -d postgres
```

(When prompted for password, press Enter while `trust` is in place.)

### 3. Restart and wait

After saving `pg_hba.conf`: close the file, then in **PowerShell as Administrator**: `Restart-Service postgresql-x64-16`. Wait 5–10 seconds, then try again.

### 4. No other file needed

Only **`pg_hba.conf`** controls who can connect. **`postgresql.conf`** does not need to be changed. If it still fails, the usual cause is the wrong `pg_hba.conf` (different data directory) or the service not restarted after the edit.
