import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Search, Mail, Shield, User, Clock } from "lucide-react";
import { listProfiles } from "@/shared/services/profileService";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { motion } from "motion/react";

/**
 * Admin users page - Manage all users in the system
 */
export function UsersAdminPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: profilesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: () => listProfiles(),
  });

  // Filter profiles based on search
  const filteredProfiles = profilesData?.documents?.filter((profile) => {
    const query = searchQuery.toLowerCase();
    return (
      profile.firstName?.toLowerCase().includes(query) ||
      profile.lastName?.toLowerCase().includes(query) ||
      profile.email?.toLowerCase().includes(query)
    );
  });

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--color-error)]">
          Error al cargar los usuarios. Por favor intenta de nuevo.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-fg)] mb-2">
          Gestión de Usuarios
        </h1>
        <p className="text-[var(--color-fg-secondary)]">
          Administra todos los usuarios de la plataforma
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Input
            type="search"
            placeholder="Buscar por nombre o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-fg-muted)]" />
        </div>
      </div>

      {/* Stats */}
      {!isLoading && profilesData && (
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={Users}
            label="Total usuarios"
            value={profilesData.total || 0}
          />
          <StatCard
            icon={Shield}
            label="Administradores"
            value={
              profilesData.documents?.filter((p) => p.role === "admin")
                .length || 0
            }
          />
          <StatCard
            icon={User}
            label="Usuarios"
            value={
              profilesData.documents?.filter((p) => p.role === "user").length ||
              0
            }
          />
        </div>
      )}

      {/* Users table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-[var(--color-fg-secondary)]">
            Cargando usuarios...
          </p>
        </div>
      ) : filteredProfiles && filteredProfiles.length > 0 ? (
        <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-secondary)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-secondary)] uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-secondary)] uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-secondary)] uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-secondary)] uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-fg-secondary)] uppercase tracking-wider">
                    Creado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredProfiles.map((profile, index) => (
                  <motion.tr
                    key={profile.$id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-[var(--color-bg-secondary)] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[var(--color-fg)]">
                            {profile.firstName} {profile.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-[var(--color-fg-secondary)]">
                        <Mail className="w-4 h-4 mr-2" />
                        {profile.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.role === "admin"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}
                      >
                        {profile.role === "admin" ? (
                          <Shield className="w-3 h-3 mr-1" />
                        ) : (
                          <User className="w-3 h-3 mr-1" />
                        )}
                        {profile.role === "admin" ? "Admin" : "Usuario"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.active && profile.enabled
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {profile.active && profile.enabled
                          ? "Activo"
                          : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-fg-secondary)]">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(profile.$createdAt).toLocaleDateString(
                          "es-MX",
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-[var(--color-border)]">
            {filteredProfiles.map((profile, index) => (
              <motion.div
                key={profile.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--color-fg)] mb-1">
                      {profile.firstName} {profile.lastName}
                    </div>
                    <div className="text-sm text-[var(--color-fg-secondary)] mb-2">
                      {profile.email}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          profile.role === "admin"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}
                      >
                        {profile.role === "admin" ? (
                          <Shield className="w-3 h-3 mr-1" />
                        ) : (
                          <User className="w-3 h-3 mr-1" />
                        )}
                        {profile.role === "admin" ? "Admin" : "Usuario"}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          profile.active && profile.enabled
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {profile.active && profile.enabled
                          ? "Activo"
                          : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl">
          <Users className="w-12 h-12 text-[var(--color-fg-muted)] mx-auto mb-4" />
          <p className="text-[var(--color-fg-secondary)]">
            {searchQuery
              ? "No se encontraron usuarios"
              : "No hay usuarios registrados"}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Stat card component
 */
function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <p className="text-xs text-[var(--color-fg-secondary)] mb-0.5">
            {label}
          </p>
          <p className="text-xl font-bold text-[var(--color-fg)]">{value}</p>
        </div>
      </div>
    </div>
  );
}
