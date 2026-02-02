import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Globe,
  Zap,
  Shield,
  Smartphone,
  Palette,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { Footer } from "@/shared/ui/organisms/Footer";
import { motion } from "motion/react";

// Stock images from Unsplash (free to use)
const MOCK_IMAGES = {
  hero: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
  catalog1:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
  catalog2:
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80",
  catalog3:
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80",
  phone:
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80",
  dashboard:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  products:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
};

/**
 * Landing page for root domain
 * Showcases Catalogy features and CTA to sign up
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  100% Gratis para empezar
                </span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-fg)] mb-6 leading-tight"
              >
                Tu catalogo digital{" "}
                <span className="text-[var(--color-primary)]">en minutos</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg sm:text-xl text-[var(--color-fg-secondary)] mb-8"
              >
                Crea, personaliza y publica tu catalogo de productos. Comparte
                tu tienda con un enlace unico y empieza a mostrar tus productos
                hoy.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Crear mi catalogo gratis
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="#como-funciona">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Ver como funciona
                  </Button>
                </a>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-center gap-6 mt-8 pt-8 border-t border-[var(--color-border)]"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--color-fg)]">
                    500+
                  </p>
                  <p className="text-sm text-[var(--color-fg-muted)]">
                    Catalogos creados
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--color-fg)]">
                    10k+
                  </p>
                  <p className="text-sm text-[var(--color-fg-muted)]">
                    Productos publicados
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--color-fg)]">
                    99.9%
                  </p>
                  <p className="text-sm text-[var(--color-fg-muted)]">Uptime</p>
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <img
                  src={MOCK_IMAGES.hero}
                  alt="Dashboard de Catalogy"
                  className="rounded-2xl shadow-2xl border border-[var(--color-border)]"
                />
                {/* Floating cards */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="absolute -left-8 top-1/4 bg-[var(--color-card)] p-4 rounded-xl shadow-xl border border-[var(--color-border)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-fg)]">
                        Catalogo publicado
                      </p>
                      <p className="text-xs text-[var(--color-fg-muted)]">
                        Hace 2 minutos
                      </p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -right-4 bottom-1/4 bg-[var(--color-card)] p-4 rounded-xl shadow-xl border border-[var(--color-border)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-fg)]">
                        +150 visitas hoy
                      </p>
                      <p className="text-xs text-[var(--color-fg-muted)]">
                        Tu catalogo crece
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted by / Social proof */}
      <section className="py-12 px-4 border-y border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-[var(--color-fg-muted)] mb-6">
            Utilizado por emprendedores y negocios en todo Mexico
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {[
              "Tiendas locales",
              "Artesanos",
              "Restaurantes",
              "Boutiques",
              "Freelancers",
            ].map((name) => (
              <span
                key={name}
                className="text-lg font-semibold text-[var(--color-fg-muted)]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-fg)] mb-4">
              Todo lo que necesitas para tu catalogo
            </h2>
            <p className="text-lg text-[var(--color-fg-secondary)] max-w-2xl mx-auto">
              Herramientas profesionales para crear y gestionar tu catalogo de
              productos online
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Zap}
              title="Rapido y sencillo"
              description="Configura tu catalogo en minutos. Sin conocimientos tecnicos requeridos."
            />
            <FeatureCard
              icon={Globe}
              title="Tu propio subdominio"
              description="Obtén un enlace unico como tutienda.catalog.racoondevs.com"
            />
            <FeatureCard
              icon={Sparkles}
              title="Diseno profesional"
              description="Elige entre multiples templates diseñados para convertir visitantes."
            />
            <FeatureCard
              icon={Smartphone}
              title="Optimizado para moviles"
              description="Tu catalogo se ve perfecto en cualquier dispositivo, especialmente en celulares."
            />
            <FeatureCard
              icon={Palette}
              title="Personalizable"
              description="Edita colores, fuentes y estructura con nuestro editor visual."
            />
            <FeatureCard
              icon={Shield}
              title="Seguro y confiable"
              description="Tu informacion esta protegida con los mas altos estandares de seguridad."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="como-funciona"
        className="py-20 px-4 bg-[var(--color-bg-secondary)]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-fg)] mb-4">
              ¿Como funciona?
            </h2>
            <p className="text-lg text-[var(--color-fg-secondary)]">
              En solo 3 pasos tendras tu catalogo listo
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="Crea tu cuenta"
              description="Registrate gratis en menos de un minuto con tu correo electronico."
              image={MOCK_IMAGES.dashboard}
            />
            <StepCard
              number={2}
              title="Agrega productos"
              description="Sube fotos, precios y descripciones de tus productos facilmente."
              image={MOCK_IMAGES.products}
            />
            <StepCard
              number={3}
              title="Comparte tu enlace"
              description="Publica y comparte tu catalogo en redes sociales o WhatsApp."
              image={MOCK_IMAGES.phone}
            />
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-fg)] mb-4">
              Catalogos que inspiran
            </h2>
            <p className="text-lg text-[var(--color-fg-secondary)]">
              Mira lo que otros negocios han logrado con Catalogy
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <ShowcaseCard
              image={MOCK_IMAGES.catalog1}
              title="Boutique Elena"
              category="Moda y accesorios"
            />
            <ShowcaseCard
              image={MOCK_IMAGES.catalog2}
              title="Tech Store MX"
              category="Electronica"
            />
            <ShowcaseCard
              image={MOCK_IMAGES.catalog3}
              title="Artesanias del Sur"
              category="Artesanias"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-[var(--color-bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-fg)] mb-4">
              Lo que dicen nuestros usuarios
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="Catalogy me ayudo a mostrar mis productos de manera profesional. Mis clientes ahora pueden ver todo mi inventario desde su celular."
              author="Maria Garcia"
              role="Dueña de boutique"
            />
            <TestimonialCard
              quote="Super facil de usar. En 10 minutos ya tenia mi catalogo listo y funcionando. Lo mejor es que es gratis."
              author="Carlos Mendez"
              role="Vendedor de electronica"
            />
            <TestimonialCard
              quote="El mejor servicio para catalogos online. El soporte es excelente y siempre estan mejorando la plataforma."
              author="Ana Lopez"
              role="Artesana"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              ¿Listo para crear tu catalogo?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Unete a cientos de negocios que ya usan Catalogy para mostrar sus
              productos online.
            </p>
            <Link to="/auth/register">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-white/90 font-semibold"
              >
                Comenzar gratis ahora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-white/60 mt-4">
              Sin tarjeta de credito requerida
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

/**
 * Feature card component
 */
function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl hover:border-[var(--color-primary)]/30 transition-colors"
    >
      <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[var(--color-primary)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-fg)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--color-fg-secondary)]">{description}</p>
    </motion.div>
  );
}

/**
 * Step card component
 */
function StepCard({ number, title, description, image }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="relative mb-6">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover rounded-2xl"
        />
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-[var(--color-fg)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--color-fg-secondary)]">{description}</p>
    </motion.div>
  );
}

/**
 * Showcase card component
 */
function ShowcaseCard({ image, title, category }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-2xl mb-4">
        <img
          src={image}
          alt={title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-sm text-white/80">{category}</p>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Testimonial card component
 */
function TestimonialCard({ quote, author, role }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-[var(--color-fg-secondary)] mb-6 italic">
        &quot;{quote}&quot;
      </p>
      <div>
        <p className="font-semibold text-[var(--color-fg)]">{author}</p>
        <p className="text-sm text-[var(--color-fg-muted)]">{role}</p>
      </div>
    </motion.div>
  );
}
