import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdatePurchase, useDeletePurchase } from '../hooks/usePurchases';

const PurchaseList = ({ purchases }) => {
  const navigate = useNavigate();
  const { mutate: updatePurchase } = useUpdatePurchase();
  const { mutate: deletePurchase } = useDeletePurchase();

  const handleEdit = (id) => {
    navigate(`/purchases/${id}/edit`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      deletePurchase(id);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Purchases</h1>
      {purchases.length === 0 ? (
        <p className="text-gray-500">No purchases found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-left">Item</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(purchase => (
              <tr key={purchase.id} className="border-t hover:bg-gray-50">
                <td className="p-4">{purchase.item}</td>
                <td className="p-4">${purchase.price}</td>
                <td className="p-4">{new Date(purchase.date).toLocaleDateString()}</td>
                <td className="p-4">{purchase.category}</td>
                <td className="p-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(purchase.id)}
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(purchase.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-6">
        <a href="/purchases/new" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Add New Purchase
        </a>
      </div>
    </div>
  );
};

export default PurchaseList;
