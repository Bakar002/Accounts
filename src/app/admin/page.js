"use client";

import Link from "next/link";

export default function AdminPage() {
  const links = [
    { path: "/inventory", label: "Inventory" },
    { path: "/billing", label: "Bills" },
    { path: "/ledger", label: "Ledger" },
    { path: "/inventory/add", label: "Inventory +" },
    { path: "/billing/create", label: "Bill Create" },
    { path: "/billing/create", label: "Ledger Create" },

  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.path}
            className="block bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition hover:bg-blue-50"
          >
            <h2 className="text-lg font-semibold text-gray-800">{link.label}</h2>
            <p className="text-sm text-gray-600 mt-2">
              Navigate to {link.label}.
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
