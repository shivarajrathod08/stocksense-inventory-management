import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { productApi, referenceApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { LoadingState } from '../../components/common/States';

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    unitOfMeasure: 'units',
    reorderPoint: 10,
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await referenceApi.getCategories();
        setCategories(catRes.data);

        if (isEdit) {
          const prodRes = await productApi.get(id);
          const p = prodRes.data;
          setFormData({
            name: p.name || '',
            sku: p.sku || '',
            categoryId: p.categoryId ? p.categoryId.toString() : '',
            unitOfMeasure: p.unitOfMeasure || 'units',
            reorderPoint: p.reorderPoint ?? 10,
            description: p.description || '',
          });
        }
      } catch (err) {
        setError('Failed to load initial form data from server.');
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'reorderPoint' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.sku.trim()) {
      setError('Product Name and SKU are mandatory.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        unitOfMeasure: formData.unitOfMeasure,
        description: formData.description.trim(),
        reorderPoint: formData.reorderPoint,
      };

      if (isEdit) {
        await productApi.update(id, payload);
      } else {
        await productApi.create(payload);
      }

      navigate('/products');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save product. Please check the SKU uniqueness.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <LoadingState message="Loading product information..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Product' : 'Create New Product'}
        subtitle={isEdit ? 'Update product specifications and safety stock thresholds' : 'Add a new catalog SKU to the StockSense inventory system'}
        breadcrumbs={[
          { label: 'Products', to: '/products' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
        {error && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ergonomic Office Chair"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                SKU (Stock Keeping Unit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                required
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. FUR-CHR-01"
                className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Unit of Measure <span className="text-rose-500">*</span>
              </label>
              <select
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="units">Units</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="boxes">Boxes</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="rolls">Rolls</option>
                <option value="meters">Meters</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Reorder Point
              </label>
              <input
                type="number"
                name="reorderPoint"
                min="0"
                value={formData.reorderPoint}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400">Trigger low-stock alert below this count</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed product specifications, vendor part numbers, or handling requirements..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/products">
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
              {isEdit ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
