import { useEffect, useMemo, useState } from "react";
import api from "../../../services/axiosClient";

const ROLE_OPTIONS = [
  "SUPER_ADMIN",
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "RECEPTIONIST",
  "PHARMACIST",
  "LAB_TECHNICIAN",
  "BILLING_STAFF",
  "PATIENT",
];

const TABLES = [
  {
    key: "users",
    label: "Users",
    listEndpoint: "/api/v1/admin/users",
    create: { method: "post", url: "/api/v1/admin/users" },
    update: { method: "patch", url: (id) => `/api/v1/admin/users/${id}` },
    remove: { method: "delete", url: (id) => `/api/v1/admin/users/${id}` },
    idField: "id",
    hiddenFields: [
      "password",
      "passwordHash",
      "hashedPassword",
      "token",
      "refreshToken",
    ],
    fields: [
      "id",
      "firstName",
      "lastName",
      "email",
      "mobileNumber",
      "role",
      "password",
      "isActive",
    ],
    fieldTypes: { isActive: "boolean" },
  },
  {
    key: "patients",
    label: "Patients",
    listEndpoint: "/api/patients",
    create: {
      method: "post",
      url: "/api/patients",
      params: (data) => ({ userId: normalizeParamNumber(data.userId) }),
    },
    update: { method: "put", url: (id) => `/api/patients/${id}` },
    remove: { method: "delete", url: (id) => `/api/patients/${id}` },
    idField: "id",
    hiddenFields: [],
    requiredFields: ["userId"],
    fields: [
      "id",
      "patientId",
      "userId",
      "firstName",
      "lastName",
      "email",
      "address",
      "dateOfBirth",
      "gender",
      "bloodType",
      "bloodPressure",
      "heartRate",
      "temperature",
      "oxygenSaturation",
      "respiratoryRate",
      "height",
      "weight",
      "lastVitalsUpdate",
      "admissionDate",
      "admissionReason",
      "admissionStatus",
      "dischargeDate",
      "primaryDoctor",
      "mobileNumber",
      "emergencyContactName",
      "emergencyContactPhone",
      "emergencyContactRelation",
      "medicalHistory",
      "allergies",
      "currentMedications",
      "createdAt",
      "updatedAt",
    ],
    fieldTypes: {
      heartRate: "number",
      temperature: "number",
      oxygenSaturation: "number",
      respiratoryRate: "number",
      height: "number",
      weight: "number",
      dateOfBirth: "date",
      lastVitalsUpdate: "datetime",
      admissionDate: "datetime",
      dischargeDate: "datetime",
      createdAt: "datetime",
      updatedAt: "datetime",
    },
  },
  {
    key: "appointments",
    label: "Appointments",
    listEndpoint: "/api/appointments",
    create: { method: "post", url: "/api/appointments" },
    update: { method: "put", url: (id) => `/api/appointments/${id}` },
    remove: { method: "delete", url: (id) => `/api/appointments/${id}` },
    idField: "id",
    hiddenFields: [],
    fields: [
      "id",
      "patientId",
      "patientName",
      "patientEmail",
      "doctorId",
      "doctorName",
      "doctorSpecialization",
      "appointmentDateTime",
      "durationMinutes",
      "reason",
      "notes",
      "status",
      "createdAt",
      "updatedAt",
    ],
    fieldTypes: {
      durationMinutes: "number",
      appointmentDateTime: "datetime",
      createdAt: "datetime",
      updatedAt: "datetime",
    },
  },
  {
    key: "medicalRecords",
    label: "Medical Records",
    listEndpoint: "/api/medical-records",
    create: { method: "post", url: "/api/medical-records" },
    update: { method: "put", url: (id) => `/api/medical-records/${id}` },
    remove: { method: "delete", url: (id) => `/api/medical-records/${id}` },
    idField: "id",
    hiddenFields: [],
    fields: [
      "id",
      "patientId",
      "patientName",
      "doctorId",
      "doctorName",
      "recordType",
      "description",
      "diagnosis",
      "treatment",
      "testName",
      "testResult",
      "attachmentUrl",
      "createdAt",
      "updatedAt",
    ],
    fieldTypes: { createdAt: "datetime", updatedAt: "datetime" },
  },
  {
    key: "doctors",
    label: "Doctors",
    listEndpoint: "/api/doctors",
    create: {
      method: "post",
      url: "/api/doctors",
      params: (data) => ({ userId: normalizeParamNumber(data.userId) }),
    },
    update: { method: "put", url: (id) => `/api/doctors/${id}` },
    remove: { method: "delete", url: (id) => `/api/doctors/${id}` },
    idField: "id",
    hiddenFields: [],
    requiredFields: ["userId", "specialization"],
    fields: [
      "id",
      "userId",
      "firstName",
      "lastName",
      "email",
      "mobileNumber",
      "specialization",
      "licenseNumber",
      "hospital",
      "department",
      "consultationFee",
      "bio",
      "isAvailable",
      "createdAt",
      "updatedAt",
    ],
    fieldTypes: {
      consultationFee: "number",
      isAvailable: "boolean",
      createdAt: "datetime",
      updatedAt: "datetime",
    },
  },
];

const normalizeRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeParamNumber = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? undefined : numberValue;
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

const buildInitialForm = (table, row = {}) => {
  const nextForm = {};
  table.fields.forEach((field) => {
    const value = row[field];
    if (value === null || value === undefined) {
      nextForm[field] = "";
    } else {
      nextForm[field] = value;
    }
  });
  return nextForm;
};

const normalizeDate = (value) => {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 10);
};

const normalizeDateTime = (value) => {
  if (!value) return null;
  let trimmed = String(value).trim();
  if (!trimmed) return null;
  trimmed = trimmed.replace(" ", "T");
  if (trimmed.length === 16) {
    return `${trimmed}:00`;
  }
  return trimmed;
};

const toDateInputValue = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

const toDateTimeInputValue = (value) => {
  if (!value) return "";
  const normalized = String(value).replace(" ", "T");
  return normalized.length >= 16 ? normalized.slice(0, 16) : normalized;
};

const coerceValue = (value, type) => {
  if (value === "" || value === undefined) return null;
  if (type === "number") {
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? null : numberValue;
  }
  if (type === "boolean") {
    if (value === true || value === false) return value;
    return value === "true";
  }
  if (type === "date") {
    return normalizeDate(value);
  }
  if (type === "datetime") {
    return normalizeDateTime(value);
  }
  return value;
};

const buildPayload = (table, formData) => {
  const payload = {};
  table.fields.forEach((field) => {
    payload[field] = coerceValue(formData[field], table.fieldTypes?.[field]);
  });
  return payload;
};

const validateRequired = (table, data) => {
  const required = table.requiredFields || [];
  const missing = required.filter((field) => {
    const value = data[field];
    return value === null || value === undefined || value === "";
  });
  return missing;
};

const getTableByKey = (key) => TABLES.find((table) => table.key === key);

const AllTables = () => {
  const [tables, setTables] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({
    open: false,
    tableKey: null,
    mode: "create",
    data: {},
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const loadTables = async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.all(
        TABLES.map(async (table) => {
          try {
            const { data } = await api.get(table.listEndpoint);
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

  const openCreateModal = (tableKey) => {
    const table = getTableByKey(tableKey);
    if (!table) return;
    setModalError("");
    setModal({
      open: true,
      tableKey,
      mode: "create",
      data: buildInitialForm(table),
    });
  };

  const openEditModal = (tableKey, row) => {
    const table = getTableByKey(tableKey);
    if (!table) return;
    setModalError("");
    setModal({
      open: true,
      tableKey,
      mode: "edit",
      data: buildInitialForm(table, row),
    });
  };

  const closeModal = () => {
    if (saving) return;
    setModalError("");
    setModal({ open: false, tableKey: null, mode: "create", data: {} });
  };

  const handleFormChange = (field, value) => {
    setModal((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
    }));
  };

  const handleDelete = async (tableKey, row) => {
    if (!window.confirm("Delete this row?")) return;
    const table = getTableByKey(tableKey);
    if (!table) return;

    setError("");
    try {
      const id = row[table.idField];
      await api({ method: table.remove.method, url: table.remove.url(id) });
      await loadTables();
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message ||
          "Failed to delete row. Please try again.",
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const table = getTableByKey(modal.tableKey);
    if (!table) return;

    if (modal.mode === "create") {
      const missing = validateRequired(table, modal.data);
      if (missing.length > 0) {
        setModalError(`Missing required fields: ${missing.join(", ")}`);
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      const payload = buildPayload(table, modal.data);
      if (modal.mode === "create") {
        await api({
          method: table.create.method,
          url: table.create.url,
          data: payload,
          params: table.create.params ? table.create.params(modal.data) : undefined,
        });
      } else {
        const id = modal.data[table.idField];
        await api({
          method: table.update.method,
          url: table.update.url(id),
          data: payload,
        });
      }
      await loadTables();
      closeModal();
    } catch (saveError) {
      setError(
        saveError.response?.data?.message ||
          "Unable to save row. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

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
                  <p className="text-xs text-slate-500">{table.listEndpoint}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span>Total rows: {table.totalCount}</span>
                  <button
                    type="button"
                    onClick={() => openCreateModal(table.key)}
                    className="px-3 py-1 rounded-md bg-emerald-600 text-white text-xs hover:bg-emerald-700"
                  >
                    Add {table.label}
                  </button>
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
                        <th className="px-4 py-3">Actions</th>
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
                          <td className="px-4 py-3 text-sm">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(table.key, row)}
                                className="px-3 py-1 rounded-md border border-slate-200 text-slate-700 text-xs hover:bg-slate-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(table.key, row)}
                                className="px-3 py-1 rounded-md border border-red-200 text-red-600 text-xs hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
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

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <form
            onSubmit={handleSubmit}
            className="relative z-10 w-full max-w-3xl rounded-xl bg-white p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                {modal.mode === "create" ? "Add" : "Edit"} {getTableByKey(modal.tableKey)?.label}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {modalError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {getTableByKey(modal.tableKey)?.fields.map((field) => {
                const value = modal.data[field] ?? "";
                if (field === "role") {
                  return (
                    <label key={field} className="text-sm text-slate-600">
                      {field}
                      <select
                        value={value}
                        onChange={(event) => handleFormChange(field, event.target.value)}
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="">Select role</option>
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                }

                if (getTableByKey(modal.tableKey)?.fieldTypes?.[field] === "boolean") {
                  return (
                    <label key={field} className="text-sm text-slate-600">
                      {field}
                      <select
                        value={String(value)}
                        onChange={(event) => handleFormChange(field, event.target.value)}
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="">Select</option>
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    </label>
                  );
                }

                const fieldType = getTableByKey(modal.tableKey)?.fieldTypes?.[field];
                const inputType =
                  fieldType === "date"
                    ? "date"
                    : fieldType === "datetime"
                      ? "datetime-local"
                      : "text";
                const inputValue =
                  fieldType === "date"
                    ? toDateInputValue(value)
                    : fieldType === "datetime"
                      ? toDateTimeInputValue(value)
                      : value;

                return (
                  <label key={field} className="text-sm text-slate-600">
                    {field}
                    <input
                      name={field}
                      type={inputType}
                      value={inputValue}
                      onChange={(event) => handleFormChange(field, event.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-md border border-slate-200 text-sm"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-60"
              >
                {saving ? "Saving..." : modal.mode === "create" ? "Create" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AllTables;
