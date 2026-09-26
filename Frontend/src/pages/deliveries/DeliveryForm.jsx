import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Save, AlertCircle, ArrowUpRight } from 'lucide-react';
import { deliveryApi, productApi, referenceApi, inventoryApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { LoadingState } from '../../components/common/States';

export default function DeliveryForm() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  
  const [sourceId, setSourceId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReferences = async () => {
      try {
        const [locRes, prodRes, invRes] = await Promise.all([
          referenceApi.getLocations(),
          productApi.list({ size: 100 }),
          inventoryApi.list(),
        ]);
        setLocations(locRes.data);
        setProducts(prodRes.data.content);
        setInventoryList(invRes.data);
        if (locRes.data.length > 0) {
          setSourceId(locRes.data[0].id.toString());
        }
      } catch (err) {
        setError('Failed to load required form references.');
      } finally {
        setInitLoading(false);
      }
    };
    loadReferences();
  }, []);

  const getAvailableStockAtSource = (productId) => {
    if (!sourceId || !productId) return 0;
    const inv = inventoryList.find(
      (i) => i.locationId === Number(sourceId) && i.productId === Number(productId)
    );
    return inv ? inv.quantity : 0;
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
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

    if (!sourceId) {
      setError('Please select a source warehouse location.');
      return;
    }

    const invalidItem = items.find((i) => !i.productId || i.quantity <= 0);
    if (invalidItem) {
      setError('Each item line must have a valid product selected and quantity > 0.');
      return;
    }

    // Client-side stock check for fast feedback
    for (const item of items) {
      const avail = getAvailableStockAtSource(item.productId);
      const prod = products.find((p) => p.id === Number(item.productId));
      if (item.quantity > avail) {
        setError(`Insufficient stock for ${prod?.name || 'product'} at selected location. Available: ${avail}, Requested: ${item.quantity}.`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        sourceId: Number(sourceId),
        notes: notes.trim(),
        items: items.map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
        })),
      };

      const res = await deliveryApi.create(payload);
      navigate(`/deliveries/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create delivery order.');
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
        title="Create Outbound Delivery"
        subtitle="Schedule customer order pick, pack and warehouse dispatch"
        breadcrumbs={[
          { label: 'Deliveries', to: '/deliveries' },
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

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">
            Delivery Source & Shipping Notes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fulfilling Warehouse Location <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
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
                Customer Name / Destination Reference
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Order #ORD-8821 — Apex Logistics Corp"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Line Items Card with available stock preview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Products to Dispatch
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
            {items.map((item, idx) => {
              const avail = getAvailableStockAtSource(item.productId);
              const isInsufficient = item.productId && item.quantity > avail;

              return (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isInsufficient ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/40'
                  }`}
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
                      {products.map((p) => {
                        const localQty = getAvailableStockAtSource(p.id);
                        return (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku}) — In Location: {localQty} {p.unitOfMeasure}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="w-full sm:w-40">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:hidden">
                      Quantity
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className={`w-full px-3 py-2 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 ${
                          isInsufficient ? 'border-rose-400 focus:ring-rose-500 text-rose-700' : 'border-slate-300 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                    {item.productId && (
                      <span className={`text-[10px] block mt-0.5 ${isInsufficient ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                        Avail at bin: {avail}
                      </span>
                    )}
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
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to="/deliveries">
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
            Create Outbound Delivery
          </Button>
        </div>
      </form>
    </div>
  );
}
