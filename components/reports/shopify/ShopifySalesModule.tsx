'use client';

import { useState } from 'react';
import {
  Package,
  MapPin,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { KPIWidget, KPIData } from '../KPIWidget';

interface ShopifySalesModuleProps {
  businessModel: 'ecommerce' | 'leadgen';
  selectedChannel: string;
}

// ── Sortable Table Header ──
function SortHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
  align = 'right',
}: {
  label: string;
  sortKey: string;
  currentSort: string;
  currentDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  align?: 'left' | 'right';
}) {
  const isActive = currentSort === sortKey;
  return (
    <th
      className={`${align === 'left' ? 'text-left' : 'text-right'} px-4 py-3 text-xs text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors select-none`}
      style={{ fontWeight: 600 }}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (
          currentDir === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        )}
      </span>
    </th>
  );
}

// ── Product-Wise Report Data ──
const productData = [
  { title: 'Premium Wireless Earbuds Pro', grossSales: 680000, discounts: -68400, netSales: 620000, totalSales: 640000, orders: 312 },
  { title: 'Ultra Slim Laptop Stand', grossSales: 530000, discounts: -42300, netSales: 490000, totalSales: 510000, orders: 246 },
  { title: 'Smart Fitness Band v3', grossSales: 470000, discounts: -56100, netSales: 410000, totalSales: 440000, orders: 328 },
  { title: 'Ergonomic Office Chair', grossSales: 410000, discounts: -37100, netSales: 380000, totalSales: 390000, orders: 134 },
  { title: 'Portable Power Bank 20K', grossSales: 390000, discounts: -46300, netSales: 340000, totalSales: 360000, orders: 284 },
  { title: 'Noise Cancelling Headphones', grossSales: 340000, discounts: -34300, netSales: 310000, totalSales: 330000, orders: 178 },
  { title: 'Mechanical Keyboard RGB', grossSales: 300000, discounts: -29800, netSales: 270000, totalSales: 280000, orders: 196 },
  { title: 'USB-C Docking Station', grossSales: 260000, discounts: -31100, netSales: 240000, totalSales: 250000, orders: 142 },
  { title: '4K Webcam Ultra HD', grossSales: 220000, discounts: -22400, netSales: 200000, totalSales: 210000, orders: 168 },
  { title: 'Smart LED Desk Lamp', grossSales: 180000, discounts: -18600, netSales: 160000, totalSales: 170000, orders: 224 },
];

// ── Location-Wise Report Data ──
const locationData = [
  { city: 'Mumbai', totalSales: 890000, orders: 428, netSales: 780000, grossSales: 920000 },
  { city: 'Delhi', totalSales: 760000, orders: 367, netSales: 670000, grossSales: 790000 },
  { city: 'Bangalore', totalSales: 650000, orders: 312, netSales: 570000, grossSales: 680000 },
  { city: 'Hyderabad', totalSales: 420000, orders: 204, netSales: 370000, grossSales: 450000 },
  { city: 'Chennai', totalSales: 390000, orders: 186, netSales: 340000, grossSales: 410000 },
  { city: 'Pune', totalSales: 340000, orders: 165, netSales: 300000, grossSales: 360000 },
  { city: 'Kolkata', totalSales: 280000, orders: 134, netSales: 250000, grossSales: 290000 },
  { city: 'Ahmedabad', totalSales: 230000, orders: 113, netSales: 210000, grossSales: 250000 },
  { city: 'Jaipur', totalSales: 190000, orders: 96, netSales: 170000, grossSales: 200000 },
  { city: 'Lucknow', totalSales: 150000, orders: 78, netSales: 130000, grossSales: 160000 },
];

// ── Format helpers ──
function fmtCurrency(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

// ── Sort helper ──
function sortRows<T>(rows: T[], key: string, dir: 'asc' | 'desc'): T[] {
  return [...rows].sort((a, b) => {
    const av = (a as any)[key];
    const bv = (b as any)[key];
    if (typeof av === 'number' && typeof bv === 'number') {
      return dir === 'asc' ? av - bv : bv - av;
    }
    return dir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });
}

export function ShopifySalesModule({ businessModel, selectedChannel }: ShopifySalesModuleProps) {
  const [productSort, setProductSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'totalSales', dir: 'desc' });
  const [locationSort, setLocationSort] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'totalSales', dir: 'desc' });

  const handleProductSort = (key: string) => {
    setProductSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleLocationSort = (key: string) => {
    setLocationSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc',
    }));
  };

  const sortedProducts = sortRows(productData, productSort.key, productSort.dir);
  const sortedLocations = sortRows(locationData, locationSort.key, locationSort.dir);

  // KPI Data
  const kpiData: KPIData[] = [
    { label: 'Gross Sales', value: '₹44.3L', delta: 60.6, deltaLabel: 'vs last period', status: 'good', format: 'currency' },
    { label: 'Returning Customer Rate', value: '28.4%', delta: 4.2, deltaLabel: 'vs last period', status: 'good', format: 'percentage' },
    { label: 'Orders Fulfilled', value: '1,847', delta: 12.5, deltaLabel: 'vs last period', status: 'good', format: 'number' },
    { label: 'Total Orders', value: '2,134', delta: 18.3, deltaLabel: 'vs last period', status: 'good', format: 'number' },
    { label: 'Avg Order Value', value: '₹2,076', delta: 34, deltaLabel: 'vs last period', status: 'good', format: 'currency' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiData.map((kpi, index) => (
          <KPIWidget key={index} data={kpi} />
        ))}
      </div>

      {/* Product-Wise Report */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-base text-gray-900" style={{ fontWeight: 600 }}>Product-Wise Report</h3>
            <p className="text-sm text-gray-500" style={{ fontWeight: 400 }}>Sales performance by product</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <SortHeader label="Product Title" sortKey="title" currentSort={productSort.key} currentDir={productSort.dir} onSort={handleProductSort} align="left" />
                <SortHeader label="Gross Sales" sortKey="grossSales" currentSort={productSort.key} currentDir={productSort.dir} onSort={handleProductSort} />
                <SortHeader label="Discounts" sortKey="discounts" currentSort={productSort.key} currentDir={productSort.dir} onSort={handleProductSort} />
                <SortHeader label="Net Sales" sortKey="netSales" currentSort={productSort.key} currentDir={productSort.dir} onSort={handleProductSort} />
                <SortHeader label="Total Sales" sortKey="totalSales" currentSort={productSort.key} currentDir={productSort.dir} onSort={handleProductSort} />
                <SortHeader label="Orders" sortKey="orders" currentSort={productSort.key} currentDir={productSort.dir} onSort={handleProductSort} />
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 500 }}>{row.title}</td>
                  <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-700">{fmtCurrency(row.grossSales)}</td>
                  <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-red-500" style={{ fontWeight: 500 }}>{fmtCurrency(row.discounts)}</td>
                  <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-700">{fmtCurrency(row.netSales)}</td>
                  <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 600 }}>{fmtCurrency(row.totalSales)}</td>
                  <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-700" style={{ fontWeight: 500 }}>{row.orders.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-gray-50/80 border-t border-gray-200">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 700 }}>Total</td>
                <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 600 }}>{fmtCurrency(productData.reduce((s, r) => s + r.grossSales, 0))}</td>
                <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-red-500" style={{ fontWeight: 600 }}>{fmtCurrency(productData.reduce((s, r) => s + r.discounts, 0))}</td>
                <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 600 }}>{fmtCurrency(productData.reduce((s, r) => s + r.netSales, 0))}</td>
                <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 700 }}>{fmtCurrency(productData.reduce((s, r) => s + r.totalSales, 0))}</td>
                <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 600 }}>{productData.reduce((s, r) => s + r.orders, 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Location-Wise Report */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base text-gray-900" style={{ fontWeight: 600 }}>Location-Wise Report</h3>
            <p className="text-sm text-gray-500" style={{ fontWeight: 400 }}>Sales performance by billing city</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <SortHeader label="Billing City" sortKey="city" currentSort={locationSort.key} currentDir={locationSort.dir} onSort={handleLocationSort} align="left" />
                <SortHeader label="Total Sales" sortKey="totalSales" currentSort={locationSort.key} currentDir={locationSort.dir} onSort={handleLocationSort} />
                <SortHeader label="Orders" sortKey="orders" currentSort={locationSort.key} currentDir={locationSort.dir} onSort={handleLocationSort} />
                <SortHeader label="Net Sales" sortKey="netSales" currentSort={locationSort.key} currentDir={locationSort.dir} onSort={handleLocationSort} />
                <SortHeader label="Gross Sales" sortKey="grossSales" currentSort={locationSort.key} currentDir={locationSort.dir} onSort={handleLocationSort} />
              </tr>
            </thead>
            <tbody>
              {sortedLocations.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 500 }}>{row.city}</td>
                  <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 600 }}>{fmtCurrency(row.totalSales)}</td>
                  <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-700" style={{ fontWeight: 500 }}>{row.orders.toLocaleString()}</td>
                  <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-700">{fmtCurrency(row.netSales)}</td>
                  <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-700">{fmtCurrency(row.grossSales)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50/80 border-t border-gray-200">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 700 }}>Total</td>
                <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 700 }}>{fmtCurrency(locationData.reduce((s, r) => s + r.totalSales, 0))}</td>
                <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 600 }}>{locationData.reduce((s, r) => s + r.orders, 0).toLocaleString()}</td>
                <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 600 }}>{fmtCurrency(locationData.reduce((s, r) => s + r.netSales, 0))}</td>
                <td className="text-right px-4 py-4 whitespace-nowrap text-sm text-gray-900" style={{ fontWeight: 600 }}>{fmtCurrency(locationData.reduce((s, r) => s + r.grossSales, 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
