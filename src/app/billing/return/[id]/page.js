// src/app/billing/return/[id]/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";

export default function SalesReturnPage() {
    const { id } = useParams();
    const [bill, setBill] = useState(null);
    const [returnedTiles, setReturnedTiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const response = await fetch(`/api/billing/fetch/${id}`);
                const data = await response.json();

                setBill(data.bill);
                console.log(data.bill)
                setReturnedTiles(data.bill.tiles.map((tile) => ({ ...tile, quantityInPieces: 0 })));
            } catch (error) {
                toast.error("Failed to fetch bill details");
            }
        };
        fetchBill();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/billing/return", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    billId: id,
                    returnedTiles: returnedTiles.filter((tile) => tile.quantityInPieces > 0),
                    totalQuantity: returnedTiles.reduce((sum, tile) => sum + tile.quantityInPieces, 0),
                    grandTotal: returnedTiles.reduce((sum, tile) => sum + tile.price, 0),
                }),
            });

            if (!response.ok) throw new Error("Failed to process sales return");

            const data = await response.json();
            toast.success("Sales return processed successfully!");
            router.push("/billing");
        } catch (error) {
            toast.error("Failed to process sales return. Please try again.");
            console.error("Error processing sales return:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <ToastContainer position="top-right" autoClose={3000} />
            <h1 className="text-2xl font-bold mb-4">Sales Return</h1>
            {bill ? (
                <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-2">Bill Details</h2>
                        <p>Bill Number: {bill.billNumber}</p>
                        <p>Customer: {bill.customer.name}</p>
                        <p>Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-2">Returned Tiles</h2>
                        {returnedTiles.map((tile, index) => (
                            <div key={index} className="border p-3 rounded bg-gray-100 mb-2">
                                <h3 className="font-semibold">{tile.tileId.name}</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Quantity (Pieces)</label>
                                        <input
                                            type="number"
                                            value={tile.quantityInPieces}
                                            onChange={(e) => {
                                                const updatedTiles = [...returnedTiles];
                                                updatedTiles[index].quantityInPieces = parseInt(e.target.value) || 0;
                                                setReturnedTiles(updatedTiles);
                                            }}
                                            className="border p-2 rounded w-full"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Rate</label>
                                        <p className="mt-2">{tile.rate.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Price</label>
                                        <p className="mt-2">{tile.price.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        disabled={loading}
                    >
                        {loading ? <ClipLoader color="#FFF" size={20} /> : "Process Return"}
                    </button>
                </form>
            ) : (
                <div className="flex justify-center items-center h-screen">
                    <ClipLoader color="#2563EB" size={50} />
                </div>
            )}
        </div>
    );
}