import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  Eye,
  Store,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import {
  useProducts,
  useTodayAnalytics,
  useStoreAnalytics,
} from "@/shared/hooks";

/**
 * Individual stat card with animation
 */
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color = "primary",
  delay = 0,
}) {
  const colorClasses = {
    primary: "text-(--color-primary)",
    success: "text-(--color-success)",
    warning: "text-(--color-warning)",
    muted: "text-(--color-fg-muted)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="p-5 bg-(--color-card) border border-(--color-card-border) rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`p-2 rounded-lg bg-(--color-bg-secondary) ${colorClasses[color]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-(--color-fg-secondary)">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-(--color-fg)">{value}</p>
      {subValue && (
        <p className="text-xs text-(--color-fg-muted) mt-1">{subValue}</p>
      )}
    </motion.div>
  );
}

/**
 * Custom tooltip for the chart
 */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-(--color-card) border border-(--color-card-border) rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-(--color-fg) mb-1">{label}</p>
        <p className="text-sm text-(--color-primary)">
          Visitas: {payload[0]?.value || 0}
        </p>
        <p className="text-sm text-(--color-fg-muted)">
          Únicos: {payload[1]?.value || 0}
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Traffic chart component - shows last 7 days of visits using Recharts
 */
function TrafficChart({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-6 bg-(--color-card) border border-(--color-card-border) rounded-2xl">
        <div className="h-4 w-32 bg-(--color-bg-tertiary) rounded mb-4 animate-pulse" />
        <div className="h-64 bg-(--color-bg-tertiary) rounded animate-pulse" />
      </div>
    );
  }

  const days = data?.documents || [];

  // Generate last 7 days
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayData = days.find((d) => d.date === dateStr);

    chartData.push({
      date: dateStr,
      name: date.toLocaleDateString("es-MX", {
        weekday: "short",
        day: "numeric",
      }),
      visitas: dayData?.totalViews || 0,
      unicos: dayData?.uniqueViews || 0,
    });
  }

  const totalWeekly = chartData.reduce((sum, d) => sum + d.visitas, 0);
  const uniqueWeekly = chartData.reduce((sum, d) => sum + d.unicos, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="p-6 bg-(--color-card) border border-(--color-card-border) rounded-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-(--color-fg)">
            Tráfico últimos 7 días
          </h3>
          <p className="text-sm text-(--color-fg-muted)">
            {totalWeekly} visitas totales · {uniqueWeekly} visitantes únicos
          </p>
        </div>
        <TrendingUp className="w-5 h-5 text-(--color-primary)" />
      </div>

      {totalWeekly === 0 ? (
        <div className="h-64 flex items-center justify-center text-(--color-fg-muted) text-sm">
          Aún no hay visitas registradas. Publica tu tienda y comparte el
          enlace.
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorUnicos" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-success)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-success)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-card-border)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-fg-muted)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--color-fg-muted)", fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="visitas"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVisitas)"
                animationDuration={1000}
                animationBegin={0}
              />
              <Area
                type="monotone"
                dataKey="unicos"
                stroke="var(--color-success)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorUnicos)"
                animationDuration={1000}
                animationBegin={200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

/**
 * StatsGrid - Dashboard statistics grid with real data
 */
export function StatsGrid({ store }) {
  const { data: productsData, isLoading: loadingProducts } = useProducts(
    store?.$id,
    { includeInactive: true },
  );
  const { data: todayAnalytics, isLoading: loadingAnalytics } =
    useTodayAnalytics(store?.$id);
  const { data: weeklyAnalytics, isLoading: loadingWeekly } = useStoreAnalytics(
    store?.$id,
    7,
  );

  const products = productsData?.documents || [];

  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.status === true).length;

  const isLoading = loadingProducts || loadingAnalytics;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-5 bg-(--color-card) border border-(--color-card-border) rounded-2xl animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-(--color-bg-tertiary) rounded-lg" />
                <div className="h-4 w-20 bg-(--color-bg-tertiary) rounded" />
              </div>
              <div className="h-7 w-16 bg-(--color-bg-tertiary) rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main stats row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Productos"
          value={totalProducts}
          subValue={`${publishedProducts} publicados`}
          color="primary"
          delay={0}
        />
        <StatCard
          icon={store?.published ? CheckCircle : XCircle}
          label="Estado"
          value={store?.published ? "Publicada" : "No publicada"}
          subValue={
            store?.published ? "Catálogo visible" : "Solo tú puedes verlo"
          }
          color={store?.published ? "success" : "warning"}
          delay={0.03}
        />
        <StatCard
          icon={Eye}
          label="Visitas Hoy"
          value={todayAnalytics?.totalViews || 0}
          subValue={`${todayAnalytics?.uniqueViews || 0} únicos`}
          color="primary"
          delay={0.06}
        />
        <StatCard
          icon={Store}
          label="Visitantes Únicos"
          value={todayAnalytics?.uniqueViews || 0}
          subValue="Personas distintas hoy"
          color="muted"
          delay={0.09}
        />
      </div>

      {/* Traffic chart */}
      <TrafficChart data={weeklyAnalytics} isLoading={loadingWeekly} />
    </div>
  );
}
