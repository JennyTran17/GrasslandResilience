"use client";
import { useState } from "react";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function FieldList({ fields, userId }) {
  const [editing, setEditing] = useState(null);
  async function handleDelete(id) {
    if (!confirm("Delete this field?")) return;
    await deleteDoc(doc(db, "users", userId, "fields", id));
  }
  async function handleRename(id, newName) {
    await updateDoc(doc(db, "users", userId, "fields", id), { name: newName });
    setEditing(null);
  }

  return (
    <div>
      {fields.map(f => (
        <div key={f.id} className="p-2 flex items-center justify-between">
          <div>
            {editing === f.id ? (
              <input defaultValue={f.name} onBlur={(e) => handleRename(f.id, e.target.value)} />
            ) : (
              <div>{f.name}</div>
            )}
            <div className="text-xs text-slate-500">{f.geometry?.coordinates?.[1]?.toFixed?.(3)},{f.geometry?.coordinates?.[0]?.toFixed?.(3)}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(f.id)}>Edit</button>
            <button onClick={() => handleDelete(f.id)} className="text-red-600">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
