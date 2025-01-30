"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation"; // Use useParams from next/navigation

const CreateLedgerEntry = () => {
    const { id } = useParams(); // Get the customer ID from the URL params
    const [transactionType, setTransactionType] = useState("Credit");
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!id) return; // Wait until the ID is available

        // Optionally, you can fetch the customer's data to pre-populate the form if needed
        // For example:
        // axios.get(`/api/customer/${id}`).then((response) => {
        //     // Set customer details into form
        // }).catch((err) => console.error(err));

    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!id) {
            setError("Customer ID is missing.");
            return;
        }

        try {
            const payload = { customerId: id, transactionType, amount, description };
            await axios.post("/api/ledger/create", payload);

            setSuccess("Ledger entry created successfully!");
            setTransactionType("Credit");
            setAmount(0);
            setDescription("");
        } catch (err) {
            console.error(err);
            setError("Failed to create ledger entry. Please try again.");
        }
    };

    if (!id) return <p>Loading customer details...</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-5">
            <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-semibold mb-4">Create Ledger Entry for Customer {id}</h1>

                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Transaction Type</label>
                        <select
                            value={transactionType}
                            onChange={(e) => setTransactionType(e.target.value)}
                            className="border p-2 rounded w-full"
                        >
                            <option value="Credit">Credit</option>
                            <option value="Debit">Debit</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Amount (Rs.)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border p-2 rounded w-full"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Create Entry
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateLedgerEntry;
