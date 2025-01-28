"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditTile({ params }) {
    const [tileData, setTileData] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        size: "",
        boxes: 0,
        tilesPerBox: 0,
        packagingPerBox: 0,
    });
    const router = useRouter();

    useEffect(() => {
        const fetchTile = async () => {
            const res = await fetch(`/api/inventory/fetch/${params.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await res.json();
            setTileData(data.tile);
            setFormData({
                name: data.tile.name,
                size: data.tile.size,
                boxes: data.tile.boxes,
                tilesPerBox: data.tile.tilesPerBox,
                packagingPerBox: data.tile.packagingPerBox,
            });
        };
        fetchTile();
    }, [params.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch(`/api/inventory/edit`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                id: params.id,
                ...formData,
            }),
        });

        if (res.ok) {
            alert("Tile updated successfully!");
            router.push("/inventory"); // Redirect to inventory page after update
        } else {
            alert("Failed to update tile");
        }
    };

    return (
        tileData && (
            <form onSubmit={handleSubmit}>
                <h1>Edit Tile</h1>
                <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Boxes"
                    value={formData.boxes}
                    onChange={(e) => setFormData({ ...formData, boxes: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Tiles per Box"
                    value={formData.tilesPerBox}
                    onChange={(e) => setFormData({ ...formData, tilesPerBox: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Packaging per Box"
                    value={formData.packagingPerBox}
                    onChange={(e) => setFormData({ ...formData, packagingPerBox: e.target.value })}
                />
                <button type="submit">Save Changes</button>
            </form>
        )
    );
}
