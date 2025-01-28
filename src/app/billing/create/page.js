"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import { useRouter } from "next/navigation";

export default function CreateBill() {
    const [customer, setCustomer] = useState({ name: "", address: "", phone: "" });
    const [salesmanName, setSalesmanName] = useState("");
    const [paymentType, setPaymentType] = useState("Cash");
    const [ledgerNumber, setLedgerNumber] = useState("");
    const [existingLedgers, setExistingLedgers] = useState([]);
    const [tiles, setTiles] = useState([]);
    const [selectedTiles, setSelectedTiles] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [tax, setTax] = useState(0);
    const [freight, setFreight] = useState(0);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);
    const [billNumber, setBillNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Fetch available tiles
    useEffect(() => {
        async function fetchTiles() {
            setLoading(true);
            try {
                const response = await axios.get("/api/inventory/fetch");
                setTiles(response.data.tiles);
                toast.success("Tiles loaded successfully!");
            } catch (error) {
                toast.error("Failed to load tiles. Please try again.");
                console.error("Error fetching tiles:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTiles();
    }, []);

    // Fetch ledgers for credit payment
    useEffect(() => {
        if (paymentType === "Credit" && customer.name) {
            async function fetchLedgers() {
                setLoading(true);
                try {
                    const response = await axios.get(`/api/ledger/get?customerName=${customer.name}`);
                    setExistingLedgers(response.data.ledgers);
                    toast.success("Ledgers fetched successfully!");
                } catch (error) {
                    toast.error("Failed to fetch ledgers. Please try again.");
                    console.error("Error fetching ledgers:", error);
                } finally {
                    setLoading(false);
                }
            }
            fetchLedgers();
        }
    }, [paymentType, customer.name]);

    // Generate unique bill number
    useEffect(() => {
        const generateBillNumber = () => {
            const date = new Date();
            const uniquePart = Math.floor(1000 + Math.random() * 9000);
            return `BILL-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}${date
                .getDate()
                .toString()
                .padStart(2, "0")}-${uniquePart}`;
        };
        setBillNumber(generateBillNumber());
    }, []);

    // Add tile to the bill
    const addTile = (tile) => {
        setSelectedTiles([
            ...selectedTiles,
            {
                ...tile,
                quantityInPieces: 0,
                quantityInBoxes: 0,
                remainingPieces: 0,
                quantityInMeters: 0,
                rate: 0,
                price: 0,
            },
        ]);
    };

    // Update tile details and totals
    const updateTile = (index, field, value) => {
        const updatedTiles = [...selectedTiles];
        const tile = updatedTiles[index];

        if (field === "quantityInPieces") {
            const pieces = parseInt(value) || 0;
            tile.quantityInPieces = pieces;
            tile.quantityInBoxes = Math.floor(pieces / tile.tilesPerBox);
            tile.remainingPieces = pieces % tile.tilesPerBox;
            tile.quantityInMeters = (pieces / tile.tilesPerBox) * tile.packagingPerBox;
        }

        if (field === "rate") {
            tile.rate = parseFloat(value) || 0;
        }

        tile.price = tile.rate * tile.quantityInMeters;
        updatedTiles[index] = tile;

        setSelectedTiles(updatedTiles);
        calculateTotals(updatedTiles);
    };

    const calculateTotals = (tiles) => {
        const totalQty = tiles.reduce((sum, tile) => sum + tile.quantityInMeters, 0);
        const totalPrice = tiles.reduce((sum, tile) => sum + tile.price, 0);
        const finalTotal =
            totalPrice - (totalPrice * discount) / 100 + (totalPrice * tax) / 100 + parseFloat(freight || 0);

        setTotalQuantity(totalQty);
        setGrandTotal(finalTotal > 0 ? finalTotal : 0);
    };

    useEffect(() => {
        calculateTotals(selectedTiles);
    }, [discount, tax, freight, selectedTiles]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                customer,
                salesmanName,
                paymentType,
                ledgerNumber: paymentType === "Credit" ? ledgerNumber : null,
                tiles: selectedTiles.map((tile) => ({
                    tileId: tile._id,
                    quantityInPieces: tile.quantityInPieces,
                    quantityInBoxes: tile.quantityInBoxes,
                    remainingPieces: tile.remainingPieces,
                    quantityInMeters: tile.quantityInMeters,
                    rate: tile.rate,
                    price: tile.price,
                })),
                discount,
                tax,
                freight,
                totalQuantity,
                grandTotal,
                billNumber,
            };

            // Step 1: Create the bill
            const createResponse = await axios.post("/api/billing/create", payload);

            if (createResponse.status === 201) {
                toast.success("Bill created successfully!");
                const { bill } = createResponse.data;

                // Step 2: Generate and download the bill PDF
                const printResponse = await axios.post(
                    "/api/billing/pdf",
                    { billId: bill._id },
                    { responseType: "blob" }
                );

                const url = window.URL.createObjectURL(new Blob([printResponse.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `Bill_${bill.billNumber}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                resetForm();
                router.push("/billing"); // Redirect to the dashboard

            } else {
                throw new Error("Failed to create the bill.");
            }
        } catch (error) {
            toast.error("Failed to create and print the bill. Please try again.");
            console.error("Error creating and printing bill:", error);
        } finally {
            setLoading(false);
        }
    };

    // Reset form fields
    const resetForm = () => {
        setCustomer({ name: "", address: "", phone: "" });
        setSalesmanName("");
        setPaymentType("Cash");
        setLedgerNumber("");
        setSelectedTiles([]);
        setDiscount(0);
        setTax(0);
        setFreight(0);
        setTotalQuantity(0);
        setGrandTotal(0);
    };


    return (
        <div className="min-h-screen bg-gray-50 p-8">
        {/* Toast Notifications */}
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-2xl font-semibold mb-4">Create Bill</h1>
            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <ClipLoader color="#2563EB" size={50} />
                </div>
            ) : (

                <form onSubmit={handleSubmit}>
                    {/* Customer Details */}
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-2">Customer Details</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={customer.name}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                    className="border p-2 rounded w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Address</label>
                                <input
                                    type="text"
                                    value={customer.address}
                                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                    className="border p-2 rounded w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={customer.phone}
                                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                    className="border p-2 rounded w-full"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-2">Payment Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Salesman Name</label>
                                <input
                                    type="text"
                                    value={salesmanName}
                                    onChange={(e) => setSalesmanName(e.target.value)}
                                    className="border p-2 rounded w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Payment Type</label>
                                <select
                                    value={paymentType}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                    className="border p-2 rounded w-full"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Credit">Credit</option>
                                </select>
                            </div>
                        </div>
                        {paymentType === "Credit" && (
                            <div className="mt-3">
                                <label className="block text-sm font-medium mb-1">Ledger Number</label>
                                <select
                                    value={ledgerNumber}
                                    onChange={(e) => setLedgerNumber(e.target.value)}
                                    className="border p-2 rounded w-full"
                                >
                                    <option value="">Select Ledger</option>
                                    {existingLedgers.map((ledger) => (
                                        <option key={ledger._id} value={ledger.number}>
                                            Ledger #{ledger.number}
                                        </option>
                                    ))}
                                    <option value="new">Create New Ledger</option>
                                </select>
                            </div>
                        )}
                    </div>

               {/* Tile Selection */}
<div className="mb-4">
    <h2 className="text-lg font-semibold mb-2">Tiles</h2>
    <select
        onChange={(e) => {
            const tile = tiles.find((t) => t._id === e.target.value);
            if (tile) addTile(tile);
        }}
        className="border p-2 rounded w-full"
    >
        <option value="">Select Tile</option>
        {tiles.map((tile) => (
            <option key={tile._id} value={tile._id}>
                {tile.name} - {tile.size}
            </option>
        ))}
    </select>
    {selectedTiles.map((tile, index) => (
        <div key={index} className="mt-3 border p-3 rounded bg-gray-100">
            <h3 className="font-semibold">{tile.name}</h3>
            <div className="grid grid-cols-6 gap-2 mt-2">
                {/* Quantity in Pieces Input */}
                <div>
                    <label className="block text-sm font-medium mb-1">Pieces</label>
                    <input
                        type="number"
                        value={tile.quantityInPieces}
                        onChange={(e) => updateTile(index, "quantityInPieces", e.target.value)}
                        className="border p-2 rounded w-full"
                        required
                    />
                </div>

                {/* Rate Input */}
                <div>
                    <label className="block text-sm font-medium mb-1">Rate</label>
                    <input
                        type="number"
                        value={tile.rate}
                        onChange={(e) => updateTile(index, "rate", e.target.value)}
                        className="border p-2 rounded w-full"
                        required
                    />
                </div>

                {/* Quantity in Boxes */}
                <div className="self-center">
                    <label className="block text-sm font-medium mb-1">Boxes</label>
                    <p className="mt-2">{tile.quantityInBoxes}</p>
                </div>

                {/* Remaining Pieces */}
                <div className="self-center">
                    <label className="block text-sm font-medium mb-1">Remaining Pieces</label>
                    <p className="mt-2">{tile.remainingPieces}</p>
                </div>

                {/* Quantity in Meters */}
                <div className="self-center">
                    <label className="block text-sm font-medium mb-1">Meters</label>
                    <p className="mt-2">{tile.quantityInMeters.toFixed(2)}</p>
                </div>

                {/* Price */}
                <div className="self-center">
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <p className="mt-2">{tile.price.toFixed(2)}</p>
                </div>
            </div>
        </div>
    ))}
</div>


                    {/* Summary */}
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold mb-2">Summary</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Discount (%)</label>
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    className="border p-2 rounded w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tax (%)</label>
                                <input
                                    type="number"
                                    value={tax}
                                    onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                                    className="border p-2 rounded w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Freight</label>
                                <input
                                    type="number"
                                    value={freight}
                                    onChange={(e) => setFreight(parseFloat(e.target.value) || 0)}
                                    className="border p-2 rounded w-full"
                                />
                            </div>
                        </div>
                        <p className="mt-2 font-bold">Total Quantity: {totalQuantity.toFixed(2)} meters</p>
                        <p className="mt-2 font-bold">Grand Total: {grandTotal.toFixed(2)}</p>
                    </div>

                    <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                        Create Bill
                    </button>
                </form>                )}

            </div>
        </div>


    );
}
