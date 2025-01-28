"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

const LedgerEntries = () => {
    const params = useParams(); // Retrieve params using useParams
    const customerId = params?.customerId; // Access the customerId
    const [ledgerEntries, setLedgerEntries] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchLedger() {
            // if (!customerId) return; // Ensure customerId exists

            try {
                // Fetch ledger entries
                const ledgerResponse = await axios.get(`/api/ledger/?customerId=${customerId}`);
                setLedgerEntries(ledgerResponse.data.ledgers);
                console.log(ledgerResponse)

                // Fetch customer details
                const customerResponse = await axios.get(`/api/customer/${customerId}`);
                setCustomer(customerResponse.data);

                setLoading(false);
            } catch (err) {
                setError("Failed to fetch ledger data.");
                console.error(err);
                setLoading(false);
            }
        }

        fetchLedger();
    }, [customerId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-5">
            <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-semibold mb-4">Ledger for {customer?.name}</h1>
                <p className="mb-6">Current Balance: <strong>Rs. {customer?.balance?.toFixed(2)}</strong></p>

                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                            <th className="border border-gray-300 px-4 py-2 text-right">Amount (Rs.)</th>
                        </tr>
                    </thead>
                    <tbody>
                    {ledgerEntries?.length > 0 ? (
    ledgerEntries.map((entry) => (
        <tr key={entry._id}>
            <td>{entry.transactionType}</td>
            <td>{entry.amount}</td>
            <td>{entry.description || "N/A"}</td>
            <td>{entry.bill?.billNumber || "No Bill"}</td>
        </tr>
    ))
) : (
    <tr>
        <td colSpan="4">No ledger entries found.</td>
    </tr>
)}

                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LedgerEntries;
