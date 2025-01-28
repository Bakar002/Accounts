"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

const CustomerLedgerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchCustomers() {
            try {
                const response = await axios.get("/api/customer"); // Assuming an API endpoint to fetch all customers
                setCustomers(response.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch customers.");
                console.error(err);
                setLoading(false);
            }
        }

        fetchCustomers();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-5">
            <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-semibold mb-4">Customer Ledger List</h1>

                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-4 py-2 text-left">Customer Name</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Phone</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Current Balance</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer._id} className="hover:bg-gray-100">
                                <td className="border border-gray-300 px-4 py-2">{customer.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{customer.phone}</td>
                                <td className="border border-gray-300 px-4 py-2">Rs. {customer.balance.toFixed(2)}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <Link
                                        href={`/ledger/${customer._id}`}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                    >
                                        View Ledger
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerLedgerList;
