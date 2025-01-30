"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ViewBills = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);

    // Fetch all bills from the API
    useEffect(() => {
        async function fetchBills() {
            try {
                setLoading(true);
                const response = await axios.get("/api/billing/fetch");
                setBills(response.data?.bills || []);
                setLoading(false);
                toast.success("Bills fetched successfully!");
            } catch (error) {
                setLoading(false);
                toast.error("Error fetching bills. Please try again.");
                console.error("Error fetching bills:", error);
            }
        }
        fetchBills();
    }, []);

    const router = useRouter();

const handleSalesReturn = (billId) => {
    router.push(`/billing/return/${billId}`);
};
    // Generate PDF for a specific bill
    const handlePrintBill = async (billId) => {
        setDownloading(billId);
        try {
            const response = await axios.post(
                "/api/billing/invoice",
                { billId },
                { responseType: "blob" } // Expect binary data
            );

            // Create a Blob URL for the PDF and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Bill_${billId}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Bill #${billId} downloaded successfully!`);
        } catch (error) {
            toast.error("Failed to download the bill. Please try again.");
            console.error("Error printing bill:", error);
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center p-5 relative">
            {/* Toast Notifications */}
            <ToastContainer position="top-right" autoClose={3000} />

            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <ClipLoader color="#2563EB" size={50} />
                </div>
            ) : (
                <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-4xl">
                    <h1 className="text-2xl font-bold mb-5">View Bills</h1>

                    {/* Create Bill Button */}
                    <div className="mb-5 text-right">
                        <Link href="/billing/create">
                            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">
                                Create Bill
                            </button>
                        </Link>
                    </div>

                    {bills.length === 0 ? (
                        <p>No bills found.</p>
                    ) : (
                        <table className="w-full border-collapse border border-gray-200" aria-label="Bills Table">
                            <caption className="sr-only">List of Bills</caption>
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Bill Number</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Customer</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map((bill) => (
                                    <tr key={bill._id} className="hover:bg-gray-100">
                                        <td className="border border-gray-300 px-4 py-2">{bill.billNumber}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {bill.customer?.name || "N/A"}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {new Date(bill.date).toLocaleDateString()}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">{bill.grandTotal.toFixed(2)}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            


                                            
                                        <button
    className={`${
        downloading === bill._id
            ? "bg-gray-400"
            : "bg-blue-500 hover:bg-blue-600"
    } text-white px-3 py-1 rounded flex items-center justify-center mr-2`}
    disabled={downloading === bill._id}
    onClick={() => handlePrintBill(bill._id)}
>
    {downloading === bill._id ? (
        <ClipLoader color="#FFF" size={20} />
    ) : (
        "Download Invoice"
    )}
</button>
<button
    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center justify-center"
    onClick={() => handleSalesReturn(bill._id)}
>
    Sales Return
</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewBills;
