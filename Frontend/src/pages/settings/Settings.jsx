import React from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  Lock,
  GitBranch,
  Server,
  Layers,
  CheckCircle2
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="System Configuration & Engine Settings"
        subtitle="Active enterprise parameters, database schema engine, and security policies"
        breadcrumbs={[
          { label: 'Management', to: '/dashboard' },
          { label: 'Settings' },
        ]}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100">
        {/* Core Architecture */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Backend Application Stack</h2>
              <p className="text-xs text-slate-500">Core runtime, framework and concurrency locking model</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Framework</span>
              <span className="font-bold text-slate-800 text-sm">Spring Boot 3.3.5</span>
              <span className="text-slate-500 block mt-0.5">Java 23 JDK</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Concurrency Lock</span>
              <span className="font-bold text-indigo-700 text-sm">PESSIMISTIC_WRITE</span>
              <span className="text-slate-500 block mt-0.5">Row-level locking</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Audit Model</span>
              <span className="font-bold text-emerald-700 text-sm">Append-Only Journal</span>
              <span className="text-slate-500 block mt-0.5">Immutable stock_ledger</span>
            </div>
          </div>
        </div>

        {/* Database & Migrations */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Database Engine & Migrations</h2>
              <p className="text-xs text-slate-500">PostgreSQL persistence layer and Flyway versioning</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800">PostgreSQL Connection</span>
                <span className="block text-slate-500 text-[11px] font-mono">jdbc:postgresql://localhost:5432/stocksense</span>
              </div>
              <Badge label="Connected" variant="VALIDATED" size="xs" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800">Flyway Migration Engine</span>
                <span className="block text-slate-500 text-[11px]">Applied: V1__initial_schema, V2__seed_data, V3__demo_user</span>
              </div>
              <span className="font-mono text-emerald-700 font-bold">Version v3</span>
            </div>
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Security & Access Control</h2>
              <p className="text-xs text-slate-500">Stateless bearer token authorization and credential hashing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Token Standard</span>
              <span className="font-bold text-slate-800">JSON Web Tokens (JWT)</span>
              <span className="text-slate-500 block mt-0.5">Algorithm: HMAC-SHA384 (jjwt 0.12.6)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block font-semibold uppercase text-[10px]">Password Hashing</span>
              <span className="font-bold text-slate-800">BCrypt Password Encoder</span>
              <span className="text-slate-500 block mt-0.5">Cost factor: 10 with salt generation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
