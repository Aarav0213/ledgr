import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreatePurchase, useUpdatePurchase } from "../hooks/usePurchases";
import { usePurchase } from "../hooks/usePurchase";

const PurchaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: purchase, isLoading, error } = usePurchase(id);
  const { mutate: createPurchase, isLoading: isCreating } = useCreatePurchase();
  const { mutate: updatePurchase, isLoading: isUpdating } = useUpdatePurchase();

  const [formData, setFormData] = useState({
    item: purchase?.item || "",
    price: purchase?.price || "",
    date: purchase?.date ? new Date(purchase.date).toISOString().split("T")[0] : "",
    category: purchase?.category || "",
    description: purchase?.description || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const purchaseData = {
      item: formData.item,
      price: parseFloat(formData.price),
      date: formData.date,
      category: formData.category,
      description: formData.description,
    };

    if (id) {
      updatePurchase({ id, updates: purchaseData }, { onSuccess: () => {
        navigate(`/purchases/${id}`);
      }});
    } else {
      createPurchase(purchaseData, { onSuccess: (data) => {
        navigate(`/purchases/${data.id}`);
      }});
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">
          {id ? "Edit Purchase" : "Add New Purchase"}
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Item:</label>
          <input
            type="text"
            name="item"
            value={formData.item}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Price:</label>
          <input
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Category:</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            rows={4}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {isCreating || isUpdating ? "Saving..." : "Save Purchase"}
          </button>
          {id && (
            <button
              type="button"
              onClick={() => navigate(`/purchases/${id}`)}
              className="px-4 py-2 bg-gray-300 text-white rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PurchaseForm;
