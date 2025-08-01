# DB Script Generator

A modern, interactive web application for generating ready-to-use SQL scripts (DDL and CRUD procedures) for multiple database systems.

## Features

- **Supports Multiple DB Systems:**
  - SQL Server
  - MySQL
  - PostgreSQL
  - Oracle
- **Custom Table & Column Design:**
  - Set database and table name
  - Add, remove, and edit columns
  - Choose data types (including BOOL for all systems)
  - Set nullable and primary key flags
- **Generates Scripts for:**
  - Database and table creation
  - Stored procedures/functions for Create, Update, and Delete operations with transaction handling (commit/rollback)
- **Modern UI:**
  - Clean, professional design
  - Responsive and intuitive
  - Download script as `.sql` file
  - Remove/clear generated script

## How to Use

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the app:**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Generate SQL Scripts:**
   - Select the database system.
   - Enter the database and table name.
   - Add columns, choosing data type, nullable, and primary key as needed.
   - Click **Generate Script** to see the full SQL script (including table and CRUD procedures).
   - Use **Download Script** to save the script as a `.sql` file.
   - Use **Remove Script** to clear the output.
   - Add or remove columns at any time.

## Data Types

- Common types are available for each DB system, including `BOOL` for convenience.
- For systems where `BOOL` is not native, it is mapped to the closest equivalent (e.g., `BIT`, `TINYINT(1)`, `BOOLEAN`, `CHAR(1)`).

## CRUD Procedures/Functions

- **Create:** Inserts a new row. All non-primary columns are parameters.
- **Update:** Updates all non-primary columns based on primary key(s).
- **Delete:** Deletes a row based on primary key(s).
- **Transaction Handling:** Each procedure/function uses proper transaction logic (`BEGIN/COMMIT/ROLLBACK` or equivalent) for safety.

## UI/UX

- Built with React and modern CSS for a professional look.
- Responsive layout adapts to desktop and mobile screens.
- All actions are accessible via intuitive buttons.

## File Structure

- `src/App.js` — Main React component and logic
- `src/index.js` — React entry point
- `public/index.html` — HTML template
- `package.json` — Dependencies and scripts

## Customization

- You can extend the data types, add more DB systems, or enhance the generated scripts as needed.
- The UI can be further themed or branded by editing the CSS in `App.js`.

## License

MIT License

---

**Enjoy generating robust SQL scripts for your projects!**
