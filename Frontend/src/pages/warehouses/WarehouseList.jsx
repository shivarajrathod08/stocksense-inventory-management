import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Layers,
  RefreshCw,
  Box,
  CheckCircle2
} from 'lucide-react';
import { referenceApi, inventoryApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { LoadingState, ErrorState } from '../../components/common/States';

export default function WarehouseList() {
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [whRes, locRes, invRes] = await Promise.all([
        referenceApi.getWarehouses(),
        referenceApi.getLocations(),
        inventoryApi.list(),
      ]);
      setWarehouses(whRes.data);
      setLocations(locRes.data);
      setInventoryList(invRes.data);
    } catch (err) {
      setError('Failed to load warehouse network from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingState message="Loading warehouse facility topology..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouses & Storage Facilities"
        subtitle="Operational logistics facilities, racking zones, and storage bins"
        breadcrumbs={[
          { label: 'Management', to: '/dashboard' },
          { label: 'Warehouses' },
        ]}
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchData}
            loading={loading}
          >
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {warehouses.map((wh) => {
          const whLocations = locations.filter((loc) => loc.warehouseId === wh.id);
          const whInventory = inventoryList.filter((i) => i.warehouseId === wh.id);
          const totalUnitsInWh = whInventory.reduce((acc, curr) => acc + curr.quantity, 0);

          return (
            <div
              key={wh.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <Badge label="Operational" variant="VALIDATED" size="xs" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">{wh.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{wh.address || 'Standard Logistics Terminal'}</span>
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 py-3 border-y border-slate-100 bg-slate-50/50 rounded-lg px-3">
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Storage Bins</span>
                    <span className="block text-lg font-bold font-mono text-slate-800">
                      {whLocations.length} locations
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase">Stored Units</span>
                    <span className="block text-lg font-bold font-mono text-indigo-600">
                      {totalUnitsInWh.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Assigned Zones & Bins:
                  </h4>
                  <div className="space-y-1.5">
                    {whLocations.map((loc) => {
                      const locUnits = inventoryList
                        .filter((i) => i.locationId === loc.id)
                        .reduce((a, b) => a + b.quantity, 0);

                      return (
                        <div
                          key={loc.id}
                          className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-100"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{loc.name}</span>
                            <span className="ml-2 font-mono text-[10px] text-slate-400">({loc.code})</span>
                          </div>
                          <span className="font-mono font-bold text-slate-700">{locUnits} units</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
