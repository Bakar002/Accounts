"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GenerateInvoice() {
    const [bills, setBills] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchBills = async () => {
            const res = await fetch("/api/billing/fetch", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await res.json();
            setBills(data.bills);
        };
        fetchBills();
    }, []);

    const handleGenerate = async (billId) => {
        const res = await fetch("/api/invoice/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ billId }),
        });

        if (res.ok) {
            alert("Invoice generated successfully!");
            router.push("/invoice/history");
        } else {
            alert("Failed to generate invoice");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Generate Invoice</h1>
                <ul className="space-y-4">
                    {bills.length === 0 ? (
                        <p className="text-gray-700">No bills available to generate invoices.</p>
                    ) : (
                        bills.map((bill) => (
                            <li
                                key={bill._id}
                                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm"
                            >
                                <div>
                                    <p className="text-gray-800 font-medium">
                                        {bill.customerName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Grand Total: ${bill.grandTotal.toFixed(2)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleGenerate(bill._id)}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                                >
                                    Generate Invoice
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
