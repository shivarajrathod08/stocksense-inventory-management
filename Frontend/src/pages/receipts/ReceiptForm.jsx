import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Save, AlertCircle, ArrowDownLeft } from 'lucide-react';
import { receiptApi, productApi, referenceApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { LoadingState } from '../../components/common/States';

export default function ReceiptForm() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [supplierId, setSupplierId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 10 }]);

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReferences = async () => {
      try {
        const [supRes, locRes, prodRes] = await Promise.all([
          referenceApi.getSuppliers(),
          referenceApi.getLocations(),
          productApi.list({ size: 100 }),
        ]);
        setSuppliers(supRes.data);
        setLocations(locRes.data);
        setProducts(prodRes.data.content);
        if (locRes.data.length > 0) {
          setDestinationId(locRes.data[0].id.toString());
        }
      } catch (err) {
        setError('Failed to load required form references.');
      } finally {
        setInitLoading(false);
      }
    };
    loadReferences();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 10 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'quantity' ? Math.max(1, parseInt(value) || 1) : value,
    };
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!destinationId) {
      setError('Please select a destination warehouse location.');
      return;
    }

    const invalidItem = items.find((i) => !i.productId || i.quantity <= 0);
    if (invalidItem) {
      setError('Each item line must have a valid product selected and quantity > 0.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        supplierId: supplierId ? Number(supplierId) : null,
        destinationId: Number(destinationId),
        notes: notes.trim(),
        items: items.map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
        })),
      };

      const res = await receiptApi.create(payload);
      // Navigate straight to detail view for validation
      navigate(`/receipts/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create receipt. Please verify input data.');
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return <LoadingState message="Loading form data..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Create Inbound Receipt"
        subtitle="Record incoming goods from vendor or external supplier"
        breadcrumbs={[
          { label: 'Receipts', to: '/receipts' },
          { label: 'New' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Header information card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">
            Receipt Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Destination Warehouse Location <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.warehouseName ? `${loc.warehouseName} — ` : ''}{loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Supplier / Vendor
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Standard Vendor / Internal</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Receipt Notes / PO Reference
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. PO-2026-902 received via FedEx Freight"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Line Items Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Products to Receive
            </h2>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={handleAddItem}
            >
              Add Line Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/40"
              >
                <div className="flex-1 w-full sm:w-auto">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:hidden">
                    Product
                  </label>
                  <select
                    required
                    value={item.productId}
                    onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Product SKU</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — Available: {p.totalStock} {p.unitOfMeasure}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-36">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:hidden">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    placeholder="Qty"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  disabled={items.length <= 1}
                  className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
                  title="Remove line"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to="/receipts">
            <Button variant="secondary" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Save}
            loading={loading}
          >
            Create Inbound Receipt
          </Button>
        </div>
      </form>
    </div>
  );
}
