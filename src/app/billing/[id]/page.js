"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BillDetail({ params }) {
    const [bill, setBill] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchBill = async () => {
            const res = await fetch(`/api/billing/fetch/${params.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await res.json();
            setBill(data.bill);
        };
        fetchBill();
    }, [params.id]);

    return (
        bill && (
            <div>
                <h1>Bill Details</h1>
                <p>Bill Number: {bill.billNumber}</p>
                <p>Customer: {bill.customerName}</p>
                <p>Phone: {bill.phone}</p>
                <p>Address: {bill.address}</p>
                <p>Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Tile Name</th>
                            <th>Quantity (Boxes)</th>
                            <th>Packaging</th>
                            <th>Quantity (Meters)</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.tiles.map((tile) => (
                            <tr key={tile.tileId._id}>
                                <td>{tile.tileId.name}</td>
                                <td>{tile.quantityInBoxes}</td>
                                <td>{tile.packagingPerBox}</td>
                                <td>{tile.quantityInMeters}</td>
                                <td>{tile.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    );
}
