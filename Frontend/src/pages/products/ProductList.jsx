import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  AlertTriangle,
  RefreshCw,
  Package
} from 'lucide-react';
import { productApi, referenceApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/States';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await referenceApi.getCategories();
      setCategories(res.data);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: 15,
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
      };
      const res = await productApi.list(params);
      setProducts(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      setError('Failed to fetch product catalog from backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Inventory"
        subtitle="Manage SKU catalog, units of measure, safety stock levels and live quantities"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Products' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchProducts}
              loading={loading}
            >
              Refresh
            </Button>
            <Link to="/products/new">
              <Button variant="primary" size="sm" icon={Plus}>
                New Product
              </Button>
            </Link>
          </div>
        }
      />

      {/* Search and Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="text-xs sm:text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingState message="Loading catalog from database..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProducts} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description={search ? `No products matching "${search}"` : 'Your product catalog is currently empty.'}
          action={
            <Link to="/products/new">
              <Button variant="primary" size="sm" icon={Plus}>
                Create First Product
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4 text-right">Available Stock</th>
                  <th className="py-3 px-4 text-right">Reorder Level</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isLow = p.totalStock <= p.reorderPoint;
                  const isOut = p.totalStock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <Link to={`/products/${p.id}`} className="hover:text-indigo-600">
                          {p.name}
                        </Link>
                        {p.description && (
                          <span className="block text-xs text-slate-400 truncate max-w-xs">
                            {p.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700">
                        {p.sku}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {p.categoryName || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-500">
                        {p.unitOfMeasure}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        <span className={isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}>
                          {p.totalStock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-500">
                        {p.reorderPoint}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <Badge label="Out of Stock" variant="OUT_OF_STOCK" size="xs" />
                        ) : isLow ? (
                          <Badge label="Low Stock" variant="LOW_STOCK" size="xs" />
                        ) : (
                          <Badge label="In Stock" variant="IN_STOCK" size="xs" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/products/${p.id}`}>
                            <button
                              title="View Stock Breakdown"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-700">{products.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalElements}</span> items
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="px-2 font-medium text-slate-700">
                {page + 1} / {Math.max(1, totalPages)}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
