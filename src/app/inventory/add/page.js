'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddTile() {
    const [formData, setFormData] = useState({
        name: "",
        size: "",
        boxes: 0,
        tilesPerBox: 0,
        packagingPerBox: 0,
    });
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.size) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const res = await fetch("/api/inventory/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            toast.success("Tile added successfully!");
            router.push("/inventory");
        } else {
            const errorData = await res.json();
            toast.error(`Failed to add tile: ${errorData.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <form onSubmit={handleSubmit} className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-lg">
                <h1 className="text-xl font-bold text-center text-gray-900">Add New Tile</h1>
                {[
                    { name: "name", label: "Name", type: "text", placeholder: "Enter tile name" },
                    { name: "size", label: "Size", type: "text", placeholder: "Enter tile size" },
                    { name: "boxes", label: "Boxes", type: "number", placeholder: "Number of boxes" },
                    { name: "tilesPerBox", label: "Tiles per Box", type: "number", placeholder: "Tiles per box" },
                    { name: "packagingPerBox", label: "Packaging per Box", type: "number", placeholder: "Packaging per box" }
                ].map(field => (
                    <div key={field.name}>
                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                            {field.label}
                        </label>
                        <input
                            type={field.type}
                            name={field.name}
                            id={field.name}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder={field.placeholder}
                            value={formData[field.name]}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        />
                    </div>
                ))}
                <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Add Tile
                </button>
            </form>
            <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
        </div>
    );
}
