import React from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { usePurchases } from './hooks/usePurchases';
import PurchaseList from './pages/PurchaseList';
import PurchaseForm from './pages/PurchaseForm';
import PurchaseDetail from './pages/PurchaseDetail';
import './App.css';

function App() {
  const { data: purchases, isLoading, error } = usePurchases();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className='min-h-screen bg-gray-50'>
      <nav className='bg-white shadow-md'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex'>
              <Link to='/' className='flex-shrink-0 flex items-center'>
                <span className='text-xl font-semibold text-indigo-600'>Purchase Intelligence</span>
              </Link>
            </div>
            <div className='hidden md:flex md:flex-1 md:items-center md:justify-center'>
              <NavLink 
                to='/' 
                className={
                  'px-3 py-2 rounded-md text-sm font-medium ' + 
                  (location.pathname === '/' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300')
                }
              >
                All Purchases
              </NavLink>
              <NavLink 
                to='/purchases/new' 
                className={
                  'px-3 py-2 rounded-md text-sm font-medium ' + 
                  (location.pathname === '/purchases/new' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300')
                }
              >
                New Purchase
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <Routes>
          <Route path='/' element={<PurchaseList purchases={purchases} />} />
          <Route path='/purchases/new' element={<PurchaseForm />} />
          <Route path='/purchases/:id' element={<PurchaseDetail />} />
          <Route path='/purchases/:id/edit' element={<PurchaseForm />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
