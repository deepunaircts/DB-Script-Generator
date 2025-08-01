import React, { useState } from "react";

// Modern, professional CSS
const appStyles = `
.dbg-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 32px 40px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.08), 0 1.5px 4px rgba(0,0,0,0.04);
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
}
.dbg-title {
  font-size: 2.2rem;
  color: #2d3748;
  margin-bottom: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.dbg-label {
  font-weight: 500;
  color: #4a5568;
  margin-right: 8px;
}
.dbg-input, .dbg-select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  font-size: 1rem;
  margin-bottom: 8px;
  outline: none;
  transition: border 0.2s;
}
.dbg-input:focus, .dbg-select:focus {
  border: 1.5px solid #3182ce;
}
.dbg-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 18px;
  background: #fafbfc;
  border-radius: 8px;
  overflow: hidden;
}
.dbg-table th, .dbg-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}
.dbg-table th {
  background: #f1f5f9;
  font-weight: 600;
  color: #374151;
}
.dbg-table tr:last-child td {
  border-bottom: none;
}
.dbg-btn {
  padding: 8px 20px;
  margin-right: 10px;
  border: none;
  border-radius: 6px;
  background: #3182ce;
  color: #fff;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(49,130,206,0.08);
  transition: background 0.18s, box-shadow 0.18s;
}
.dbg-btn:disabled {
  background: #b6c6dc;
  cursor: not-allowed;
}
.dbg-btn:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 2px 8px rgba(49,130,206,0.13);
}
.dbg-btn-remove {
  background: #e53e3e;
  color: #fff;
}
.dbg-btn-remove:hover {
  background: #c53030;
}
.dbg-textarea {
  width: 100%;
  padding: 14px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 1rem;
  background: #f8fafc;
  color: #2d3748;
  margin-top: 4px;
  font-family: 'Fira Mono', 'Consolas', monospace;
  resize: vertical;
  min-height: 200px;
}
@media (max-width: 600px) {
  .dbg-container {
    padding: 12px 4vw;
  }
}
`;
if (!document.getElementById('dbg-styles')) {
  const style = document.createElement('style');
  style.id = 'dbg-styles';
  style.innerHTML = appStyles;
  document.head.appendChild(style);
}


const dbSystems = [
  { label: "SQL Server", value: "sqlserver" },
  { label: "MySQL", value: "mysql" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "Oracle", value: "oracle" },
];

const sqlTypes = {
  sqlserver: ["INT", "VARCHAR(255)", "DATETIME", "BIT", "BOOL"],
  mysql: ["INT", "VARCHAR(255)", "DATETIME", "TINYINT(1)", "BOOL"],
  postgresql: ["INTEGER", "VARCHAR(255)", "TIMESTAMP", "BOOLEAN", "BOOL"],
  oracle: ["NUMBER", "VARCHAR2(255)", "DATE", "CHAR(1)", "BOOL"],
};

function App() {
  // ...existing state and handlers...

  const handleDownload = () => {
    const blob = new Blob([script], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (dbName || 'script') + '.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const [dbSystem, setDbSystem] = useState("sqlserver");
  const [dbName, setDbName] = useState("");
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState([
    { name: "id", type: "INT", nullable: false, primary: true },
  ]);
  const [script, setScript] = useState("");

  // List of all forbidden data type names (flattened and lowercased)
const forbiddenColNames = Array.from(
  new Set(
    Object.values(sqlTypes).flat().map(t => t.toLowerCase().replace(/\(.+\)/, ""))
  )
);

const [colNameError, setColNameError] = useState("");

const handleColumnChange = (idx, field, value) => {
  let error = "";
  if (field === "name") {
    // Check against forbidden names (case-insensitive, ignore spaces)
    const nameToCheck = value.trim().toLowerCase();
    if (forbiddenColNames.includes(nameToCheck)) {
      error = `Column name cannot be a data type (${value})`;
    }
  }
  setColNameError(error);

  const newCols = columns.map((col, i) =>
    i === idx ? { ...col, [field]: value } : col
  );
  setColumns(newCols);
};

  const addColumn = () => {
    setColumns([
      ...columns,
      { name: "", type: sqlTypes[dbSystem][0], nullable: true, primary: false },
    ]);
  };

  const removeColumn = (idx) => {
    setColumns(columns.filter((_, i) => i !== idx));
  };

  const generateScript = () => {
    // Helper for column definition
    const colDefs = columns.map((col) => {
      let def = `${col.name} ${col.type}`;
      if (!col.nullable) def += " NOT NULL";
      if (col.primary) def += " PRIMARY KEY";
      return def;
    });
    let script = "";
    // Create Database
    switch (dbSystem) {
      case "sqlserver":
        script += `CREATE DATABASE [${dbName}];\nUSE [${dbName}];\n`;
        break;
      case "mysql":
        script += `CREATE DATABASE \`${dbName}\`;\nUSE \`${dbName}\`;\n`;
        break;
      case "postgresql":
        script += `CREATE DATABASE \"${dbName}\";\n\\c \"${dbName}\";\n`;
        break;
      case "oracle":
        script += `-- In Oracle, users own schemas; create user and grant privileges if needed.\n`;
        break;
      default:
        break;
    }
    // Create Table
    script += `CREATE TABLE ${tableName} (\n  ${colDefs.join(",\n  ")}\n);\n`;
    // Stored Procedures (CRUD)
    // For brevity, only basic templates for each DB system
    // CREATE
    switch (dbSystem) {
      case "sqlserver":
        script += `\n-- CREATE PROCEDURE\nCREATE PROCEDURE sp_Create_${tableName}\n  ${columns.filter(c=>!c.primary).map(c=>`@${c.name} ${c.type}`).join(", ")}\nAS\nBEGIN\n  BEGIN TRY\n    BEGIN TRANSACTION;\n    INSERT INTO ${tableName} (${columns.filter(c=>!c.primary).map(c=>c.name).join(", ")})\n    VALUES (${columns.filter(c=>!c.primary).map(c=>`@${c.name}`).join(", ")});\n    COMMIT;\n  END TRY\n  BEGIN CATCH\n    ROLLBACK;\n    THROW;\n  END CATCH\nEND\nGO\n`;
        break;
      case "mysql":
        script += `\n-- CREATE PROCEDURE\nDELIMITER //\nCREATE PROCEDURE sp_Create_${tableName} (${columns.filter(c=>!c.primary).map(c=>`IN p_${c.name} ${c.type}`).join(", ")})\nBEGIN\n  DECLARE EXIT HANDLER FOR SQLEXCEPTION\n  BEGIN\n    ROLLBACK;\n  END;\n  START TRANSACTION;\n  INSERT INTO ${tableName} (${columns.filter(c=>!c.primary).map(c=>c.name).join(", ")}) VALUES (${columns.filter(c=>!c.primary).map(c=>`p_${c.name}`).join(", ")});\n  COMMIT;\nEND;//\nDELIMITER ;\n`;
        break;
      case "postgresql":
        script += `\n-- CREATE FUNCTION\nCREATE OR REPLACE FUNCTION sp_create_${tableName}(${columns.filter(c=>!c.primary).map(c=>`${c.name} ${c.type}`).join(", ")})\nRETURNS void AS $$\nBEGIN\n  BEGIN\n    INSERT INTO ${tableName} (${columns.filter(c=>!c.primary).map(c=>c.name).join(", ")}) VALUES (${columns.filter(c=>!c.primary).map((c, i) => `$${i+1}`).join(", ")});\n    COMMIT;\n  EXCEPTION\n    WHEN OTHERS THEN\n      ROLLBACK;\n      RAISE;\n  END;\nEND;\n$$ LANGUAGE plpgsql;\n`;
        break;
      case "oracle":
        script += `\n-- CREATE PROCEDURE\nCREATE OR REPLACE PROCEDURE sp_create_${tableName} (${columns.filter(c=>!c.primary).map(c=>`p_${c.name} IN ${c.type}`).join(", ")}) AS\nBEGIN\n  SAVEPOINT sp_before_insert;\n  BEGIN\n    INSERT INTO ${tableName} (${columns.filter(c=>!c.primary).map(c=>c.name).join(", ")}) VALUES (${columns.filter(c=>!c.primary).map(c=>`p_${c.name}`).join(", ")});\n    COMMIT;\n  EXCEPTION\n    WHEN OTHERS THEN\n      ROLLBACK TO sp_before_insert;\n      RAISE;\n  END;\nEND;\n/\n`;
        break;
      default:
        break;
    }
    // UPDATE
    switch (dbSystem) {
      case "sqlserver":
        script += `\n-- UPDATE PROCEDURE\nCREATE PROCEDURE sp_Update_${tableName}\n  ${columns.map(c=>`@${c.name} ${c.type}`).join(", ")}\nAS\nBEGIN\n  BEGIN TRY\n    BEGIN TRANSACTION;\n    UPDATE ${tableName} SET ${columns.filter(c=>!c.primary).map(c=>`${c.name} = @${c.name}`).join(", ")} WHERE ${columns.filter(c=>c.primary).map(c=>`${c.name} = @${c.name}`).join(" AND ")};\n    COMMIT;\n  END TRY\n  BEGIN CATCH\n    ROLLBACK;\n    THROW;\n  END CATCH\nEND\nGO\n`;
        break;
      case "mysql":
        script += `\n-- UPDATE PROCEDURE\nDELIMITER //\nCREATE PROCEDURE sp_Update_${tableName} (${columns.map(c=>`IN p_${c.name} ${c.type}`).join(", ")})\nBEGIN\n  DECLARE EXIT HANDLER FOR SQLEXCEPTION\n  BEGIN\n    ROLLBACK;\n  END;\n  START TRANSACTION;\n  UPDATE ${tableName} SET ${columns.filter(c=>!c.primary).map(c=>`${c.name} = p_${c.name}`).join(", ")} WHERE ${columns.filter(c=>c.primary).map(c=>`${c.name} = p_${c.name}`).join(" AND ")};\n  COMMIT;\nEND;//\nDELIMITER ;\n`;
        break;
      case "postgresql":
        script += `\n-- UPDATE FUNCTION\nCREATE OR REPLACE FUNCTION sp_update_${tableName}(${columns.map(c=>`${c.name} ${c.type}`).join(", ")})\nRETURNS void AS $$\nBEGIN\n  BEGIN\n    UPDATE ${tableName} SET ${columns.filter(c=>!c.primary).map((c,i)=>`${c.name} = $${i+1}`).join(", ")} WHERE ${columns.filter(c=>c.primary).map((c,i)=>`${c.name} = $${columns.findIndex(cc=>cc.name===c.name)+1}`).join(" AND ")};\n    COMMIT;\n  EXCEPTION\n    WHEN OTHERS THEN\n      ROLLBACK;\n      RAISE;\n  END;\nEND;\n$$ LANGUAGE plpgsql;\n`;
        break;
      case "oracle":
        script += `\n-- UPDATE PROCEDURE\nCREATE OR REPLACE PROCEDURE sp_update_${tableName} (${columns.map(c=>`p_${c.name} IN ${c.type}`).join(", ")}) AS\nBEGIN\n  SAVEPOINT sp_before_update;\n  BEGIN\n    UPDATE ${tableName} SET ${columns.filter(c=>!c.primary).map(c=>`${c.name} = p_${c.name}`).join(", ")} WHERE ${columns.filter(c=>c.primary).map(c=>`${c.name} = p_${c.name}`).join(" AND ")};\n    COMMIT;\n  EXCEPTION\n    WHEN OTHERS THEN\n      ROLLBACK TO sp_before_update;\n      RAISE;\n  END;\nEND;\n/\n`;
        break;
      default:
        break;
    }
    // DELETE
    switch (dbSystem) {
      case "sqlserver":
        script += `\n-- DELETE PROCEDURE\nCREATE PROCEDURE sp_Delete_${tableName}\n  ${columns.filter(c=>c.primary).map(c=>`@${c.name} ${c.type}`).join(", ")}\nAS\nBEGIN\n  BEGIN TRY\n    BEGIN TRANSACTION;\n    DELETE FROM ${tableName} WHERE ${columns.filter(c=>c.primary).map(c=>`${c.name} = @${c.name}`).join(" AND ")};\n    COMMIT;\n  END TRY\n  BEGIN CATCH\n    ROLLBACK;\n    THROW;\n  END CATCH\nEND\nGO\n`;
        break;
      case "mysql":
        script += `\n-- DELETE PROCEDURE\nDELIMITER //\nCREATE PROCEDURE sp_Delete_${tableName} (${columns.filter(c=>c.primary).map(c=>`IN p_${c.name} ${c.type}`).join(", ")})\nBEGIN\n  DECLARE EXIT HANDLER FOR SQLEXCEPTION\n  BEGIN\n    ROLLBACK;\n  END;\n  START TRANSACTION;\n  DELETE FROM ${tableName} WHERE ${columns.filter(c=>c.primary).map(c=>`${c.name} = p_${c.name}`).join(" AND ")};\n  COMMIT;\nEND;//\nDELIMITER ;\n`;
        break;
      case "postgresql":
        script += `\n-- DELETE FUNCTION\nCREATE OR REPLACE FUNCTION sp_delete_${tableName}(${columns.filter(c=>c.primary).map(c=>`${c.name} ${c.type}`).join(", ")})\nRETURNS void AS $$\nBEGIN\n  BEGIN\n    DELETE FROM ${tableName} WHERE ${columns.filter(c=>c.primary).map((c,i)=>`${c.name} = $${i+1}`).join(" AND ")};\n    COMMIT;\n  EXCEPTION\n    WHEN OTHERS THEN\n      ROLLBACK;\n      RAISE;\n  END;\nEND;\n$$ LANGUAGE plpgsql;\n`;
        break;
      case "oracle":
        script += `\n-- DELETE PROCEDURE\nCREATE OR REPLACE PROCEDURE sp_delete_${tableName} (${columns.filter(c=>c.primary).map(c=>`p_${c.name} IN ${c.type}`).join(", ")}) AS\nBEGIN\n  SAVEPOINT sp_before_delete;\n  BEGIN\n    DELETE FROM ${tableName} WHERE ${columns.filter(c=>c.primary).map(c=>`${c.name} = p_${c.name}`).join(" AND ")};\n    COMMIT;\n  EXCEPTION\n    WHEN OTHERS THEN\n      ROLLBACK TO sp_before_delete;\n      RAISE;\n  END;\nEND;\n/\n`;
        break;
      default:
        break;
    }
    setScript(script);
  };

  return (
    <div className="dbg-container">
      <h2 className="dbg-title">DB Script Generator</h2>
      <label className="dbg-label">Database System: </label>
      <select className="dbg-select" value={dbSystem} onChange={e => { setDbSystem(e.target.value); setColumns([{ name: "id", type: sqlTypes[e.target.value][0], nullable: false, primary: true }]); }}>
        {dbSystems.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <br /><br />
      <label className="dbg-label">Database Name: </label>
      <input className="dbg-input" value={dbName} onChange={e => setDbName(e.target.value)} />
      <br /><br />
      <label className="dbg-label">Table Name: </label>
      <input className="dbg-input" value={tableName} onChange={e => setTableName(e.target.value)} />
      <br /><br />
      <h4 className="dbg-label" style={{fontSize:'1.15rem', marginBottom:8}}>Columns</h4>
      {colNameError && (
        <div style={{ color: 'red', marginBottom: 8 }}>{colNameError}</div>
      )}
      <table className="dbg-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Nullable</th>
            <th>Primary Key</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {columns.map((col, idx) => (
            <tr key={idx}>
              <td><input className="dbg-input" value={col.name} onChange={e => handleColumnChange(idx, "name", e.target.value)} /></td>
              <td>
                <select className="dbg-select" value={col.type} onChange={e => handleColumnChange(idx, "type", e.target.value)}>
                  {sqlTypes[dbSystem].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </td>
              <td style={{textAlign:'center'}}><input type="checkbox" checked={col.nullable} onChange={e => handleColumnChange(idx, "nullable", e.target.checked)} /></td>
              <td style={{textAlign:'center'}}><input type="checkbox" checked={col.primary} onChange={e => handleColumnChange(idx, "primary", e.target.checked)} /></td>
              <td>{columns.length > 1 && <button className="dbg-btn dbg-btn-remove" onClick={() => removeColumn(idx)}>Remove</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="dbg-btn" onClick={addColumn}>Add Column</button>
      <br /><br />
      <button className="dbg-btn" onClick={generateScript} disabled={!!colNameError}>Generate Script</button>
      <button className="dbg-btn" onClick={() => setScript("")}>Remove Script</button>
      <button className="dbg-btn" onClick={handleDownload} disabled={!script}>Download Script</button>
      <br /><br />
      <textarea className="dbg-textarea" value={script} readOnly rows={15} />
    </div>
  );
}

export default App;
