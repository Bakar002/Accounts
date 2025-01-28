'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from 'react-toastify';
import Link from 'next/link';

export default function InventoryDashboard() {
    const [tiles, setTiles] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetchTiles();
    }, []);

    const fetchTiles = async () => {
        const res = await fetch("/api/inventory/fetch", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setTiles(data.tiles);
    };

    const handleEdit = (tileId) => {
        router.push(`/inventory/edit/${tileId}`);
    };

    const handleDelete = async (tileId) => {
        if (confirm("Are you sure you want to delete this tile?")) {
            const res = await fetch(`/api/inventory/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ id: tileId })
            });

            if (res.ok) {
                toast.success("Tile deleted successfully");
                fetchTiles(); // Refresh the list
            } else {
                const errorData = await res.json();
                toast.error(`Failed to delete tile: ${errorData.message}`);
            }
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Inventory Dashboard</h1>

            {/* Add Tile Button */}
            <div className="mb-6 text-right">
                <Link href="/inventory/add">
                    <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">
                        Add Tile
                    </button>
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow-lg">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="py-3 px-4 uppercase font-semibold text-sm">Name</th>
                            <th className="py-3 px-4 uppercase font-semibold text-sm">Size</th>
                            <th className="py-3 px-4 uppercase font-semibold text-sm">Boxes</th>
                            <th className="py-3 px-4 uppercase font-semibold text-sm">Tiles per Box</th>
                            <th className="py-3 px-4 uppercase font-semibold text-sm">Packaging per Box</th>
                            <th className="py-3 px-4 uppercase font-semibold text-sm">Stock</th>
                            <th className="py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {tiles.map((tile) => (
                            <tr key={tile._id} className="hover:bg-gray-100">
                                <td className="py-3 px-4">{tile.name}</td>
                                <td className="py-3 px-4">{tile.size}</td>
                                <td className="py-3 px-4">{tile.boxes}</td>
                                <td className="py-3 px-4">{tile.tilesPerBox}</td>
                                <td className="py-3 px-4">{tile.packagingPerBox}</td>
                                <td className="py-3 px-4">{tile.stock}</td>
                                <td className="py-3 px-4 flex items-center space-x-2">
                                    <button onClick={() => handleEdit(tile._id)} className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded">Edit</button>
                                    <button onClick={() => handleDelete(tile._id)} className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
        </div>
    );
}
