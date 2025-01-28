"use client";

import { useState, useEffect } from "react";

export default function ReturnHistory() {
    const [returns, setReturns] = useState([]);

    useEffect(() => {
        const fetchReturns = async () => {
            const res = await fetch("/api/sales-return/history", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await res.json();
            setReturns(data.returns);
        };
        fetchReturns();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Return History</h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="px-4 py-2 border border-gray-300 text-left">Bill ID</th>
                                <th className="px-4 py-2 border border-gray-300 text-left">Items</th>
                                <th className="px-4 py-2 border border-gray-300 text-left">Total Refund</th>
                                <th className="px-4 py-2 border border-gray-300 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returns.length > 0 ? (
                                returns.map((ret) => (
                                    <tr key={ret._id} className="hover:bg-gray-100">
                                        <td className="px-4 py-2 border border-gray-300">
                                            {ret.billId._id}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300">
                                            {ret.items.map((item) => (
                                                <div key={item.tileId._id} className="text-gray-700">
                                                    {item.tileId.name} - {item.quantity} pcs
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300">
                                            {ret.totalRefund}
                                        </td>
                                        <td className="px-4 py-2 border border-gray-300">
                                            {new Date(ret.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="text-center py-4 text-gray-600 border border-gray-300"
                                    >
                                        No returns found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
