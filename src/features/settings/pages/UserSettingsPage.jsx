import { useState, useEffect } from "react";
import {
  User,
  Palette,
  Save,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Camera,
  Mail,
  Phone,
} from "lucide-react";
import { useAuth, useTheme } from "@/app/providers";
import * as profileService from "@/shared/services/profileService";
import { storage, BUCKETS } from "@/shared/lib/appwrite";
import { Button } from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms/Input";
import { ImageUpload, ImageViewerModal, useToast } from "@/shared/ui/molecules";

/**
 * User settings page
 */
export function UserSettingsPage() {
  const { user } = useAuth();
  const { preference, setPreference } = useTheme();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    avatarFileId: "",
  });

  // Helper to get avatar URL
  const getAvatarUrl = (fileId) => {
    if (!fileId) return null;
    return storage.getFilePreview(BUCKETS.AVATARS, fileId).href;
  };

  const [avatarPreview, setAvatarPreview] = useState(null);

  // Load Profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.$id) return;

      try {
        setLoading(true);
        const profile = await profileService.getProfile(user.$id);

        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          phone: profile.phone || "",
          avatarFileId: profile.avatarFileId || "",
        });

        if (profile.avatarFileId) {
          setAvatarPreview(getAvatarUrl(profile.avatarFileId));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("No se pudo cargar la información del perfil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (file) => {
    try {
      // 1. If existing avatar, delete it first to avoid clutter
      if (formData.avatarFileId) {
        try {
          await storage.deleteFile(BUCKETS.AVATARS, formData.avatarFileId);
        } catch (err) {
          console.warn("Could not delete old avatar:", err);
          // Continue anyway, it might be already deleted or not strictly necessary to block
        }
      }

      // 2. Upload to Storage
      const result = await storage.createFile(
        BUCKETS.AVATARS,
        "unique()",
        file,
      );
      const newFileId = result.$id;

      // 3. Update Profile immediately in DB
      await profileService.updateProfile(user.$id, {
        avatarFileId: newFileId,
      });

      // 4. Update local state
      setFormData((prev) => ({ ...prev, avatarFileId: newFileId }));
      setAvatarPreview(getAvatarUrl(newFileId));

      toast.success("Tu foto de perfil ha sido actualizada", "Imagen guardada");
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("No se pudo actualizar la imagen de perfil");
    }
  };

  const handleSave = async () => {
    if (!user?.$id) return;

    try {
      setSaving(true);

      // Basic validation
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error("Nombre y Apellido son obligatorios", "Campos requeridos");
        setSaving(false);
        return;
      }

      await profileService.updateProfile(user.$id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        avatarFileId: formData.avatarFileId,
      });

      toast.success(
        "Tu perfil ha sido actualizado correctamente",
        "Cambios guardados",
      );
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("No se pudieron guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-fg)]">
          Configuración
        </h1>
        <p className="text-[var(--color-fg-secondary)] mt-1">
          Gestiona tu cuenta y preferencias personales
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--color-border)] mb-8">
        <TabButton
          active={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
          icon={User}
          label="Perfil"
        />
        <TabButton
          active={activeTab === "appearance"}
          onClick={() => setActiveTab("appearance")}
          icon={Palette}
          label="Apariencia"
        />
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-300">
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
            {/* Left Column: Avatar */}
            <div className="space-y-4 flex flex-col items-center md:items-start">
              <div className="pt-2 w-full max-w-xs">
                <ImageUpload
                  label=""
                  currentImageUrl={avatarPreview}
                  onUpload={handleAvatarUpload}
                  isUploading={false}
                  onImageClick={(src) => {
                    setAvatarPreview(src); // Ensure preview is sync
                    setIsViewerOpen(true);
                  }}
                />
                <p className="text-xs text-center text-[var(--color-fg-muted)] mt-2">
                  Recomendado: 800x800px. JPG, PNG.
                </p>
              </div>
            </div>

            {/* Right Column: Profile Form */}
            <div className="space-y-6 bg-[var(--color-card)] p-6 md:p-8 rounded-2xl border border-[var(--color-card-border)] shadow-sm">
              <div className="flex items-center gap-2 pb-4 border-b border-[var(--color-border)] mb-4">
                <User className="w-5 h-5 text-[var(--color-primary)]" />
                <h2 className="font-semibold text-lg text-[var(--color-fg)]">
                  Información Personal
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    label="Nombre"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label="Apellido"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  label="Correo electrónico"
                  value={user?.email || ""}
                  disabled
                  icon={Mail}
                  hint="El correo no se puede cambiar por seguridad"
                  className="bg-[var(--color-bg-tertiary)]"
                />
              </div>

              <div className="space-y-2">
                <Input
                  label="Teléfono"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  icon={Phone}
                  placeholder="+52 123 456 7890"
                />
              </div>

              <div className="pt-6 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="min-w-[140px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="max-w-2xl">
            <div className="bg-[var(--color-card)] p-6 md:p-8 rounded-2xl border border-[var(--color-card-border)] shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-[var(--color-border)]">
                <Palette className="w-5 h-5 text-[var(--color-primary)]" />
                <h2 className="font-semibold text-lg text-[var(--color-fg)]">
                  Tema de la interfaz
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ThemeOption
                  active={preference === "system"}
                  onClick={() => setPreference("system")}
                  icon={Monitor}
                  label="Sistema"
                  description="Se adapta a tu dispositivo"
                />
                <ThemeOption
                  active={preference === "light"}
                  onClick={() => setPreference("light")}
                  icon={Sun}
                  label="Claro"
                  description="Modo diurno"
                />
                <ThemeOption
                  active={preference === "dark"}
                  onClick={() => setPreference("dark")}
                  icon={Moon}
                  label="Oscuro"
                  description="Modo nocturno"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        src={avatarPreview}
        alt="Foto de perfil"
      />
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative
        ${active ? "text-[var(--color-primary)]" : "text-[var(--color-fg-secondary)] hover:text-[var(--color-fg)]"}
      `}
    >
      <Icon className="w-4 h-4" />
      {label}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-t-full" />
      )}
    </button>
  );
}

function ThemeOption({ active, onClick, icon: Icon, label, description }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all text-center gap-3
        ${
          active
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
            : "border-[var(--color-border)] hover:border-[var(--color-fg-muted)] hover:bg-[var(--color-bg-tertiary)]"
        }
      `}
    >
      <div
        className={`
        p-3 rounded-full 
        ${active ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg-secondary)] text-[var(--color-fg-muted)]"}
      `}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div
          className={`font-semibold ${active ? "text-[var(--color-primary)]" : "text-[var(--color-fg)]"}`}
        >
          {label}
        </div>
        <div className="text-xs text-[var(--color-fg-secondary)] mt-1">
          {description}
        </div>
      </div>
    </button>
  );
}
