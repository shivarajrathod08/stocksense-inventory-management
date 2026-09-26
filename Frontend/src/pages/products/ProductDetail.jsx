import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Layers,
  MapPin,
  History,
  ArrowDownLeft,
  Sliders,
  Edit,
  RefreshCw,
  Building2
} from 'lucide-react';
import { productApi, inventoryApi, ledgerApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { LoadingState, ErrorState } from '../../components/common/States';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [locationsStock, setLocationsStock] = useState([]);
  const [ledgerHistory, setLedgerHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, invRes, ledRes] = await Promise.all([
        productApi.get(id),
        inventoryApi.list(),
        ledgerApi.list({ productId: id, size: 10 }),
      ]);

      setProduct(pRes.data);
      // Filter inventory rows for this product
      const productInventory = invRes.data.filter((item) => item.productId === Number(id));
      setLocationsStock(productInventory);
      setLedgerHistory(ledRes.data.content || []);
    } catch (err) {
      setError('Failed to load product details from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <LoadingState message="Loading product information..." />;
  if (error || !product) return <ErrorState message={error || 'Product not found'} onRetry={fetchData} />;

  const isLow = product.totalStock <= product.reorderPoint;
  const isOut = product.totalStock === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        subtitle={`SKU: ${product.sku} • Category: ${product.categoryName || 'Unassigned'}`}
        breadcrumbs={[
          { label: 'Products', to: '/products' },
          { label: product.sku },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link to={`/products`}>
              <Button variant="secondary" size="sm">
                Back to List
              </Button>
            </Link>
            <Link to={`/adjustments/new`}>
              <Button variant="secondary" size="sm" icon={Sliders}>
                Adjust Stock
              </Button>
            </Link>
            <Link to={`/receipts/new`}>
              <Button variant="primary" size="sm" icon={ArrowDownLeft}>
                Receive Stock
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Details & Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Available
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}`}>
              {product.totalStock}
            </span>
            <span className="text-xs font-medium text-slate-500">{product.unitOfMeasure}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Reorder Point
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-700">
              {product.reorderPoint}
            </span>
            <span className="text-xs font-medium text-slate-500">safety threshold</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Inventory Status
          </span>
          <div className="mt-2">
            {isOut ? (
              <Badge label="Out of Stock" variant="OUT_OF_STOCK" />
            ) : isLow ? (
              <Badge label="Low Stock Warning" variant="LOW_STOCK" />
            ) : (
              <Badge label="Healthy Stock" variant="VALIDATED" />
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Storage Locations
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-indigo-600">
              {locationsStock.length}
            </span>
            <span className="text-xs font-medium text-slate-500">active bins</span>
          </div>
        </div>
      </div>

      {/* Location Stock Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-indigo-600" />
          Location Stock Breakdown
        </h2>

        {locationsStock.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No stock currently located in any warehouse. Receive stock via a Receipt operation.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Warehouse</th>
                  <th className="py-2.5 px-3">Location / Bin</th>
                  <th className="py-2.5 px-3">Location Code</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locationsStock.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {loc.warehouseName || 'Warehouse'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">
                      {loc.locationName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {loc.locationCode}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                      {loc.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {loc.updatedAt ? new Date(loc.updatedAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Audit History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            Audit Ledger Trail for {product.sku}
          </h2>
          <Link to={`/ledger?productId=${product.id}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            View in Stock Ledger &rarr;
          </Link>
        </div>

        {ledgerHistory.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No audit ledger entries found for this product yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Operation</th>
                  <th className="py-2.5 px-3">Source &rarr; Destination</th>
                  <th className="py-2.5 px-3 text-right">Delta</th>
                  <th className="py-2.5 px-3 text-right">Resulting Balance</th>
                  <th className="py-2.5 px-3">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge label={entry.operationType} variant={entry.operationType} size="xs" />
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {entry.sourceLocationName ? entry.sourceLocationName : 'Vendor'} &rarr;{' '}
                      {entry.destLocationName ? entry.destLocationName : 'Customer'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={entry.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {entry.quantityChange > 0 ? `+${entry.quantityChange}` : entry.quantityChange}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900">
                      {entry.resultingQuantity}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {entry.performedByName || 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
