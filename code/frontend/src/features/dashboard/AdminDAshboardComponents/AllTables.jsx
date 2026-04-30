import { useEffect, useMemo, useState } from "react";
import api from "../../../services/axiosClient";

const TABLES = [
  {
    key: "users",
    label: "Users",
    endpoint: "/api/v1/admin/users",
    hiddenFields: [
      "password",
      "passwordHash",
      "hashedPassword",
      "token",
      "refreshToken",
    ],
  },
  { key: "patients", label: "Patients", endpoint: "/api/patients", hiddenFields: [] },
  {
    key: "appointments",
    label: "Appointments",
    endpoint: "/api/appointments",
    hiddenFields: [],
  },
  {
    key: "medicalRecords",
    label: "Medical Records",
    endpoint: "/api/medical-records",
    hiddenFields: [],
  },
  { key: "doctors", label: "Doctors", endpoint: "/api/doctors", hiddenFields: [] },
];

const normalizeRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const formatCell = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const matchesQuery = (row, query) => {
  const entries = Object.values(row || {});
  return entries.some((entry) =>
    formatCell(entry).toLowerCase().includes(query),
  );
};

const getVisibleColumns = (rows, hiddenFields) => {
  if (!rows.length) return [];
  const hidden = new Set(hiddenFields.map((field) => field.toLowerCase()));
  return Object.keys(rows[0])
    .filter((key) => !hidden.has(key.toLowerCase()))
    .slice(0, 8);
};

const AllTables = () => {
  const [tables, setTables] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const loadTables = async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.all(
        TABLES.map(async (table) => {
          try {
            const { data } = await api.get(table.endpoint);
            return { key: table.key, rows: normalizeRows(data), error: "" };
          } catch (tableError) {
            return {
              key: table.key,
              rows: [],
              error:
                tableError.response?.data?.message ||
                "Failed to load data. Please try again.",
            };
          }
        }),
      );

      const nextState = {};
      results.forEach((result) => {
        nextState[result.key] = { rows: result.rows, error: result.error };
      });
      setTables(nextState);
    } catch (loadError) {
      setError(
        loadError.response?.data?.message ||
          "Failed to load tables. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const tableViews = useMemo(
    () =>
      TABLES.map((table) => {
        const tableState = tables[table.key] || { rows: [], error: "" };
        const filteredRows = normalizedQuery
          ? tableState.rows.filter((row) => matchesQuery(row, normalizedQuery))
          : tableState.rows;
        const columns = getVisibleColumns(tableState.rows, table.hiddenFields);

        return {
          ...table,
          rows: filteredRows,
          totalCount: tableState.rows.length,
          error: tableState.error,
          columns,
          hasMoreColumns:
            tableState.rows.length > 0 &&
            Object.keys(tableState.rows[0] || {}).length > columns.length,
        };
      }),
    [normalizedQuery, tables],
  );

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">All Tables</h1>
          <p className="text-sm text-slate-600">
            View data across users, patients, appointments, medical records, and doctors.
          </p>
        </div>
        <button
          type="button"
          onClick={loadTables}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search across all tables"
          className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-sm text-slate-500">
          Loading all tables...
        </div>
      ) : (
        <div className="space-y-6">
          {tableViews.map((table) => (
            <div key={table.key} className="bg-white rounded-xl shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b px-4 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">{table.label}</h2>
                  <p className="text-xs text-slate-500">{table.endpoint}</p>
                </div>
                <div className="text-xs text-slate-600">
                  Total rows: {table.totalCount}
                </div>
              </div>

              {table.error && (
                <div className="px-4 py-3 text-sm text-red-700 border-b border-red-100 bg-red-50">
                  {table.error}
                </div>
              )}

              {!table.error && table.rows.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-500">No data found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead>
                      <tr className="border-b text-xs uppercase tracking-wide text-slate-500">
                        {table.columns.map((column) => (
                          <th key={column} className="px-4 py-3">
                            {column}
                          </th>
                        ))}
                        {table.hasMoreColumns && (
                          <th className="px-4 py-3 text-slate-400">More</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, index) => (
                        <tr key={row.id ?? index} className="border-b last:border-0">
                          {table.columns.map((column) => (
                            <td
                              key={column}
                              className="px-4 py-3 text-sm text-slate-600 max-w-[220px] truncate"
                              title={formatCell(row[column])}
                            >
                              {formatCell(row[column])}
                            </td>
                          ))}
                          {table.hasMoreColumns && (
                            <td className="px-4 py-3 text-xs text-slate-400">
                              +{Object.keys(row || {}).length - table.columns.length} more
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllTables;
