import { useEffect, useState, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { adminApi } from '../../api/axios';
import useAdminSocket from '../../hooks/useAdminSocket';
import toast from 'react-hot-toast';

// ─── Color Palettes ───────────────────────────────────────────────────────────
const STATUS_COLORS = {
  confirmed: '#22c55e',
  pending: '#f59e0b',
  cancelled: '#ef4444',
  completed: '#3b82f6',
  'no-show': '#6b7280',
};
const CLASS_COLORS = {
  economy: '#4F46E5',
  business: '#f59e0b',
  first: '#8b5cf6',
};
const PAYMENT_COLORS = ['#4F46E5', '#22c55e', '#f59e0b', '#6b7280', '#ef4444'];
const AIRLINE_COLORS = ['#4F46E5', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => { try { return format(new Date(d), 'MMM dd'); } catch { return d; } };
const fmtRevenue = (v) => `₹${(v / 1000).toFixed(1)}k`;
const fmtINR = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

function SectionTitle({ children }) {
  return <h2 className="text-base font-bold text-gray-800 mb-1">{children}</h2>;
}

function LoadingSpinner() {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-gray-400">
      <RefreshCw className="w-8 h-8 animate-spin text-primary-400" />
      <p className="text-sm font-medium">Loading reports...</p>
    </div>
  );
}

function MiniLegend({ items, colorMap }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: colorMap ? colorMap[item.name] || '#9ca3af' : PAYMENT_COLORS[i % PAYMENT_COLORS.length] }}
          />
          <span className="capitalize">{item.name}</span>
          <span className="text-gray-400">({item.value})</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const debounceRef = useRef(null);

  const { isConnected, lastEvent } = useAdminSocket();

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.get(`/reports?period=${period}`);
      setData(r.data.data);
      setLastRefreshed(Date.now());
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Fetch on period change
  useEffect(() => { fetchReports(); }, [fetchReports]);

  // Auto-refresh when admin:stats event arrives (debounced 3s)
  useEffect(() => {
    if (!lastEvent) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchReports();
      toast.success('Live data updated', { duration: 2000, id: 'live-update' });
    }, 3000);
    return () => clearTimeout(debounceRef.current);
  }, [lastEvent, fetchReports]);

  // "X seconds ago" counter
  useEffect(() => {
    if (!lastRefreshed) return;
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastRefreshed) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRefreshed]);

  // ── Chart data transforms ──────────────────────────────────────────────────
  const revenueChartData = (data?.revenueByDay || []).map(d => ({
    date: fmtDate(d._id),
    revenue: d.revenue,
    bookings: d.count,
  }));
  const bookingsChartData = (data?.bookingsByDay || []).map(d => ({
    date: fmtDate(d._id),
    bookings: d.count,
  }));
  const statusChartData = (data?.byStatus || []).map(d => ({
    name: d._id,
    value: d.count,
  }));
  const classChartData = (data?.byClass || []).map(d => ({
    name: d._id,
    value: d.count,
    revenue: d.revenue,
  }));
  const paymentChartData = (data?.byPaymentMethod || []).map(d => ({
    name: d._id || 'Unknown',
    value: d.count,
  }));
  const airlineChartData = (data?.revenueByAirline || []).map(d => ({
    name: d._id,
    revenue: d.revenue,
    bookings: d.count,
  }));
  const signupChartData = (data?.userSignupsByDay || []).map(d => ({
    date: fmtDate(d._id),
    users: d.count,
  }));
  const refundChartData = (data?.refundsByDay || []).map(d => ({
    date: fmtDate(d._id),
    amount: d.amount,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Analytics</h1>
          {lastRefreshed && (
            <p className="text-xs text-gray-400 mt-0.5">
              Last updated {secondsAgo}s ago
            </p>
          )}
        </div>
        {/* Live indicator */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
          isConnected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <Wifi className="w-3.5 h-3.5" />
              Live
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              Offline
            </>
          )}
        </div>
      </div>

      {/* Period switcher */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { v: '7d', label: 'Last 7 Days' },
          { v: '30d', label: 'Last 30 Days' },
          { v: '3m', label: 'Last 3 Months' },
          { v: '1y', label: 'Last Year' },
        ].map(({ v, label }) => (
          <button
            key={v}
            onClick={() => setPeriod(v)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              period === v
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
        <button
          onClick={fetchReports}
          disabled={loading}
          className="ml-auto flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && !data ? (
        <LoadingSpinner />
      ) : data === null ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-base font-medium">No data available for the selected period.</p>
        </div>
      ) : (
        <>
          {/* ── SECTION 1: Revenue Analytics ─────────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Revenue by Day — area chart */}
            <div className="lg:col-span-2 card p-5">
              <SectionTitle>Revenue by Day</SectionTitle>
              {revenueChartData.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No revenue data for this period</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmtRevenue} />
                    <Tooltip formatter={(v) => [fmtINR(v), 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Revenue by Airline — pie */}
            <div className="card p-5">
              <SectionTitle>Revenue by Airline</SectionTitle>
              {airlineChartData.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={airlineChartData} cx="50%" cy="50%" outerRadius={80} dataKey="revenue" nameKey="name">
                      {airlineChartData.map((_, i) => (
                        <Cell key={i} fill={AIRLINE_COLORS[i % AIRLINE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmtINR(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── SECTION 2: Booking Trends ─────────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Bookings by Day — bar chart */}
            <div className="card p-5">
              <SectionTitle>Bookings by Day</SectionTitle>
              {bookingsChartData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No booking data for this period</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={bookingsChartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#4F46E5" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* By Status + By Class — two donuts side by side */}
            <div className="grid grid-cols-2 gap-4">
              {/* By Status */}
              <div className="card p-4">
                <SectionTitle>By Status</SectionTitle>
                {statusChartData.length === 0 ? (
                  <div className="h-[150px] flex items-center justify-center text-gray-400 text-xs">No data</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                          {statusChartData.map((d, i) => (
                            <Cell key={i} fill={STATUS_COLORS[d.name] || '#9ca3af'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <MiniLegend items={statusChartData} colorMap={STATUS_COLORS} />
                  </>
                )}
              </div>

              {/* By Class */}
              <div className="card p-4">
                <SectionTitle>By Class</SectionTitle>
                {classChartData.length === 0 ? (
                  <div className="h-[150px] flex items-center justify-center text-gray-400 text-xs">No data</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie data={classChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                          {classChartData.map((d, i) => (
                            <Cell key={i} fill={CLASS_COLORS[d.name] || PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <MiniLegend items={classChartData} colorMap={CLASS_COLORS} />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Revenue by Airline (Horizontal Bar) ───────────── */}
          {airlineChartData.length > 0 && (
            <div className="card p-5">
              <SectionTitle>Revenue by Airline</SectionTitle>
              <ResponsiveContainer width="100%" height={Math.max(150, airlineChartData.length * 40)}>
                <BarChart data={airlineChartData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmtRevenue} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
                  <Tooltip formatter={(v) => fmtINR(v)} />
                  <Bar dataKey="revenue" fill="#4F46E5" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── SECTION 4: User Analytics ─────────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Sign-ups by day */}
            <div className="card p-5">
              <SectionTitle>User Sign-ups by Day</SectionTitle>
              {signupChartData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No sign-up data for this period</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={signupChartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="users" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top users by bookings */}
            <div className="card p-5">
              <SectionTitle>Top Users by Bookings</SectionTitle>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-100">
                      {['#', 'Name', 'Email', 'Bookings', 'Spent'].map(h => (
                        <th key={h} className="pb-2 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.topUsers || []).slice(0, 8).map((u, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="py-2 text-gray-400 text-xs">{i + 1}</td>
                        <td className="py-2 font-medium text-gray-900">{u.name}</td>
                        <td className="py-2 text-gray-500 text-xs">{u.email}</td>
                        <td className="py-2 text-center text-gray-700">{u.count}</td>
                        <td className="py-2 text-right font-medium text-gray-900">{fmtINR(u.spent)}</td>
                      </tr>
                    ))}
                    {(data?.topUsers || []).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-gray-400">No user data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── SECTION 5: Payment Analytics ─────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Payment methods — donut */}
            <div className="card p-5">
              <SectionTitle>Payment Methods</SectionTitle>
              {paymentChartData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No payment data</div>
              ) : (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={paymentChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                        {paymentChartData.map((_, i) => (
                          <Cell key={i} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Refunds by day — line chart */}
            <div className="card p-5">
              <SectionTitle>Refunds by Day</SectionTitle>
              {refundChartData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No refund data for this period</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={refundChartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmtRevenue} />
                    <Tooltip formatter={(v) => [fmtINR(v), 'Refunded']} />
                    <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
