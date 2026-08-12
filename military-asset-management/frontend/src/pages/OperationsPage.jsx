import React from "react";
import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function OperationsPage({ type }) {
  const { user } = useAuth();

  const [bases, setBases] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");

  const config = {
    purchases: {
      title: "Purchases",
      endpoint: "/purchases",
      fields: ["baseId", "equipmentTypeId", "quantity"],
      button: "Record Purchase",
    },

    transfers: {
      title: "Transfers",
      endpoint: "/transfers",
      fields: [
        "sourceBaseId",
        "destinationBaseId",
        "equipmentTypeId",
        "quantity",
      ],
      button: "Complete Transfer",
    },

    assignments: {
      title: "Assignments",
      endpoint: "/assignments",
      fields: ["baseId", "equipmentTypeId", "personnelName", "quantity"],
      button: "Assign Assets",
    },

    expenditures: {
      title: "Expenditures",
      endpoint: "/expenditures",
      fields: ["baseId", "equipmentTypeId", "quantity", "reason"],
      button: "Record Expenditure",
    },
  }[type];

  async function load() {
    try {
      const [b, e, r] = await Promise.all([
        api.get("/bases"),
        api.get("/equipment-types"),
        api.get(config.endpoint),
      ]);

      setBases(b.data);
      setEquipment(e.data);
      setRows(r.data);

      // BASE_COMMANDER can use only their own base
      if (user?.role === "BASE_COMMANDER" && user?.baseId) {
        setForm((f) => ({
          ...f,
          baseId: String(user.baseId),
          sourceBaseId: String(user.baseId),
        }));
      }

      // ADMIN / LOGISTICS_OFFICER can use all bases
      if (
        ["ADMIN", "LOGISTICS_OFFICER"].includes(user?.role) &&
        !form.baseId &&
        !form.sourceBaseId
      ) {
        setForm((f) => ({
          ...f,
          baseId: "",
          sourceBaseId: "",
        }));
      }
    } catch (err) {
      setMessage("Failed to load data.");
    }
  }

  useEffect(() => {
    load();
  }, [type, user?.baseId, user?.role]);

  function change(k, v) {
    setForm((f) => ({
      ...f,
      [k]: v,
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setMessage("");

    try {
      await api.post(config.endpoint, form);

      setMessage("Saved successfully.");

      setForm((f) => ({
        ...f,
        quantity: "",
        personnelName: "",
        reason: "",
      }));

      load();
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Operation failed."
      );
    }
  }

  const canCreate =
    type === "transfers"
      ? ["ADMIN", "LOGISTICS_OFFICER"].includes(user?.role)
      : type === "assignments" || type === "expenditures"
      ? ["ADMIN", "BASE_COMMANDER"].includes(user?.role)
      : true;

  // BASE_COMMANDER -> only own base
  const availableBases =
    user?.role === "BASE_COMMANDER" && user?.baseId
      ? bases.filter((b) => String(b.id) === String(user.baseId))
      : bases;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{config.title}</h1>

      <p className="text-slate-500 mb-6">
        Manage and review operational records.
      </p>

      {canCreate && (
        <form
          onSubmit={submit}
          className="bg-white p-5 rounded-xl shadow-sm mb-6 grid md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {config.fields.map((field) => {
            // BASE FIELDS
            if (
              field === "baseId" ||
              field === "sourceBaseId" ||
              field === "destinationBaseId"
            ) {
              // For BASE_COMMANDER, destinationBaseId is not used,
              // but if it appears in future, keep all bases available
              // only where appropriate.
              const baseOptions =
                user?.role === "BASE_COMMANDER" &&
                field !== "destinationBaseId"
                  ? availableBases
                  : bases;

              return (
                <label
                  key={field}
                  className="text-sm font-medium"
                >
                  {field.replace(/([A-Z])/g, " $1")}

                  <select
                    value={form[field] || ""}
                    onChange={(e) =>
                      change(field, e.target.value)
                    }
                    required
                    disabled={
                      user?.role === "BASE_COMMANDER" &&
                      field !== "destinationBaseId"
                    }
                    className="mt-1 w-full border rounded-lg p-2"
                  >
                    <option value="">Select base</option>

                    {baseOptions.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            // EQUIPMENT TYPE
            if (field === "equipmentTypeId") {
              return (
                <label
                  key={field}
                  className="text-sm font-medium"
                >
                  Equipment Type

                  <select
                    value={form[field] || ""}
                    onChange={(e) =>
                      change(field, e.target.value)
                    }
                    required
                    className="mt-1 w-full border rounded-lg p-2"
                  >
                    <option value="">
                      Select equipment
                    </option>

                    {equipment.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            // OTHER FIELDS
            return (
              <label
                key={field}
                className="text-sm font-medium"
              >
                {field.replace(/([A-Z])/g, " $1")}

                <input
                  type={field === "quantity" ? "number" : "text"}
                  min={field === "quantity" ? 1 : undefined}
                  value={form[field] || ""}
                  onChange={(e) =>
                    change(field, e.target.value)
                  }
                  required={field !== "reason"}
                  className="mt-1 w-full border rounded-lg p-2"
                />
              </label>
            );
          })}

          <div className="md:col-span-2 xl:col-span-4 flex items-center gap-3">
            <button
              type="submit"
              className="bg-slate-900 text-white px-5 py-2.5 rounded-lg"
            >
              {config.button}
            </button>

            {message && (
              <span className="text-sm">
                {message}
              </span>
            )}
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {rows[0] &&
                Object.keys(rows[0])
                  .filter(
                    (k) =>
                      ![
                        "id",
                        "created_by",
                        "initiated_by",
                        "assigned_by",
                        "recorded_by",
                      ].includes(k)
                  )
                  .map((k) => (
                    <th
                      key={k}
                      className="text-left p-3"
                    >
                      {k.replace(/_/g, " ")}
                    </th>
                  ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-t"
              >
                {Object.entries(row)
                  .filter(
                    ([k]) =>
                      ![
                        "id",
                        "created_by",
                        "initiated_by",
                        "assigned_by",
                        "recorded_by",
                      ].includes(k)
                  )
                  .map(([k, v]) => (
                    <td
                      key={k}
                      className="p-3"
                    >
                      {String(v ?? "—")}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}