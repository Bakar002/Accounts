"use client";

import { useState, useEffect } from "react";

export default function InvoiceHistory() {
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        const fetchInvoices = async () => {
            const res = await fetch("/api/invoice/history", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await res.json();
            setInvoices(data.invoices);
        };
        fetchInvoices();
    }, []);

    const downloadPDF = async (invoiceId) => {
        const res = await fetch("/api/invoice/pdf", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ invoiceId }),
        });

        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Invoice_${invoiceId}.pdf`;
            link.click();
        } else {
            alert("Failed to download PDF");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Invoice History</h1>
                {invoices.length === 0 ? (
                    <p className="text-gray-700">No invoices found.</p>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="border-b py-3 px-4 text-sm font-medium text-gray-700">
                                    Invoice Number
                                </th>
                                <th className="border-b py-3 px-4 text-sm font-medium text-gray-700">
                                    Customer Name
                                </th>
                                <th className="border-b py-3 px-4 text-sm font-medium text-gray-700">
                                    Status
                                </th>
                                <th className="border-b py-3 px-4 text-sm font-medium text-gray-700">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice._id} className="hover:bg-gray-50">
                                    <td className="border-b py-3 px-4 text-gray-800">
                                        {invoice.invoiceNumber}
                                    </td>
                                    <td className="border-b py-3 px-4 text-gray-800">
                                        {invoice.billId.customerName}
                                    </td>
                                    <td className="border-b py-3 px-4 text-gray-800">
                                        {invoice.status}
                                    </td>
                                    <td className="border-b py-3 px-4">
                                        <button
                                            onClick={() => downloadPDF(invoice._id)}
                                            className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition"
                                        >
                                            Download PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
