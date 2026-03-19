import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePurchase } from "../hooks/usePurchase";

const PurchaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: purchase, isLoading, error } = usePurchase(id);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!purchase) return <div>Purchase not found</div>;

  const handleEdit = () => {
    navigate(`/purchases/${purchase.id}/edit`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex items-center mb-4">
        <button onClick={handleBack} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">
          ? Back
        </button>
        <h1 className="text-2xl font-bold ml-4">Purchase Details</h1>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="mb-2"><strong>Item:</strong> {purchase.item}</p>
        <p className="mb-2"><strong>Price:</strong> ${purchase.price}</p>
        <p className="mb-2"><strong>Date:</strong> {new Date(purchase.date).toLocaleDateString()}</p>
        <p className="mb-2"><strong>Category:</strong> {purchase.category}</p>
        <p className="mb-2"><strong>Description:</strong> {purchase.description || "No description"}</p>
        <div className="mt-4">
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Edit Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetail;
