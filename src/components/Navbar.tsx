"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Retrieve role from localStorage
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo or Brand */}
        <div className="text-lg font-semibold">MyApp</div>

        {/* Navigation Links */}
        <div className="space-x-4">
          <Link href="/admin" className="px-3 py-2 rounded hover:bg-gray-700">
            Home
          </Link>
          <Link href="/about" className="px-3 py-2 rounded hover:bg-gray-700">
            About
          </Link>

          {/* Conditional Links Based on Role */}
          {role === "Admin" && (
            <>
              <Link href="/admin" className="px-3 py-2 rounded hover:bg-gray-700">
                Admin Dashboard
              </Link>
              <Link href="/manage-users" className="px-3 py-2 rounded hover:bg-gray-700">
                Manage Users
              </Link>
            </>
          )}

          {role === "Salesperson" && (
            <Link href="/sales" className="px-3 py-2 rounded hover:bg-gray-700">
              Sales Dashboard
            </Link>
          )}

          {role === "Manager" && (
            <Link href="/reports" className="px-3 py-2 rounded hover:bg-gray-700">
              Reports
            </Link>
          )}

          {/* Links for All Authenticated Users */}
          {role && (
            <>
              <Link href="/profile" className="px-3 py-2 rounded hover:bg-gray-700">
                Profile
              </Link>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "auth/login";
                }}
                className="px-3 py-2 rounded bg-red-500 hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}

          {/* Links for Unauthenticated Users */}
          {!role && (
            <>
              <Link href="auth/login" className="px-3 py-2 rounded hover:bg-gray-700">
                Login
              </Link>
              <Link href="auth/signup" className="px-3 py-2 rounded hover:bg-gray-700">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
