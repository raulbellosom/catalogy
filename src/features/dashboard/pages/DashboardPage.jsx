import { Package, Store, TrendingUp, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/providers";
import { Button } from "@/shared/ui/atoms/Button";
import { motion } from "motion/react";

/**
 * Dashboard page - Main app landing after login
 */
export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-fg)]">
          Hola, {user?.name?.split(" ")[0] || "Usuario"}
        </h1>
        <p className="text-[var(--color-fg-secondary)]">
          Bienvenido a tu panel de control
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <QuickActionCard
          icon={Store}
          title="Configurar tienda"
          description="Personaliza tu catalogo y elige tu slug"
          to="/app/store"
          delay={0}
        />
        <QuickActionCard
          icon={Package}
          title="Agregar productos"
          description="Agrega productos a tu catalogo"
          to="/app/products/new"
          delay={0.1}
        />
        <QuickActionCard
          icon={ExternalLink}
          title="Ver mi catalogo"
          description="Abre tu catalogo publico"
          to="#"
          external
          delay={0.2}
        />
      </div>

      {/* Stats placeholder */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={Package} label="Productos" value="0" delay={0.3} />
        <StatCard icon={TrendingUp} label="Visitas hoy" value="0" delay={0.4} />
        <StatCard
          icon={Store}
          label="Estado"
          value="No publicado"
          delay={0.5}
        />
      </div>
    </div>
  );
}

/**
 * Quick action card
 */
function QuickActionCard({
  icon: Icon,
  title,
  description,
  to,
  external,
  delay,
}) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl hover:border-[var(--color-primary)] transition-colors group cursor-pointer"
    >
      <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[var(--color-primary)]/20 transition-colors">
        <Icon className="w-6 h-6 text-[var(--color-primary)]" />
      </div>
      <h3 className="font-semibold text-[var(--color-fg)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-fg-secondary)]">{description}</p>
    </motion.div>
  );

  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link to={to}>{content}</Link>;
}

/**
 * Stat card
 */
function StatCard({ icon: Icon, label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-[var(--color-fg-muted)]" />
        <span className="text-sm text-[var(--color-fg-secondary)]">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-[var(--color-fg)]">{value}</p>
    </motion.div>
  );
}
