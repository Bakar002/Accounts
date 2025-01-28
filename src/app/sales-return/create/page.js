"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateSalesReturn() {
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBill, setSelectedBill] = useState(null);
    const [items, setItems] = useState([]);
    const [reason, setReason] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchBills = async () => {
            const res = await fetch("/api/billing/fetch", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await res.json();
            setBills(data.bills);
            setFilteredBills(data.bills); // Initialize filtered bills
        };
        fetchBills();
    }, []);

    useEffect(() => {
        setFilteredBills(
            bills.filter(
                (bill) =>
                    bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    bill._id.includes(searchTerm)
            )
        );
    }, [searchTerm, bills]);

    const handleBillSelect = (billId) => {
        const bill = bills.find((b) => b._id === billId);
        if (bill) {
            setSelectedBill(bill);
            setItems(bill.tiles.map((t) => ({ ...t, returnQuantity: 0, isError: false })));
            setIsDropdownOpen(false); // Close the dropdown after selection
        }
    };

    const handleQuantityChange = (index, value) => {
        const quantity = parseInt(value) || 0;
        setItems((prevItems) =>
            prevItems.map((item, i) => {
                if (i === index) {
                    const isError = quantity < 0 || quantity > item.quantity; // Validate quantity
                    return { ...item, returnQuantity: quantity, isError };
                }
                return item;
            })
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const returnItems = items
            .filter((item) => item.returnQuantity > 0 && !item.isError)
            .map((item) => ({
                tileId: item.tileId._id,
                quantity: item.returnQuantity,
                reason,
            }));

        if (returnItems.length === 0) {
            alert("Please fix errors or add valid return quantities.");
            return;
        }

        const res = await fetch("/api/sales-return/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                billId: selectedBill._id,
                items: returnItems,
            }),
        });

        if (res.ok) {
            alert("Sales return created successfully!");
            router.push("/sales-return/history");
        } else {
            alert("Failed to create sales return");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <form
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                    }
                }}
                className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl"
            >
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Sales Return</h1>

                <div className="relative mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select a Bill
                    </label>
                    <input
                        type="text"
                        placeholder="Search by customer name or Bill ID"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(true);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {isDropdownOpen && (
                        <div className="absolute z-10 bg-white shadow-md border border-gray-300 mt-1 rounded-lg max-h-60 overflow-auto w-full">
                            {filteredBills.length > 0 ? (
                                filteredBills.map((bill) => (
                                    <div
                                        key={bill._id}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleBillSelect(bill._id)}
                                    >
                                        {bill.customerName} - {bill.grandTotal}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-gray-600">No bills found</div>
                            )}
                        </div>
                    )}
                </div>

                {selectedBill && (
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Items in Bill</h2>
                        {items.map((item, index) => (
                            <div
                                key={item.tileId._id}
                                className="flex items-center justify-between mb-3"
                            >
                                <span className="text-gray-700">
                                    {item.tileId.name} (Max: {item.quantity})
                                </span>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        value={item.returnQuantity}
                                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                                        placeholder="Return Quantity"
                                        className={`w-24 px-2 py-1 border ${
                                            item.isError
                                                ? "border-red-500 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-blue-500"
                                        } rounded-lg focus:outline-none`}
                                    />
                                    {item.isError && (
                                        <span className="text-red-500 text-sm ml-2">
                                            Invalid quantity
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Return
                    </label>
                    <textarea
                        placeholder="Reason for Return"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}
