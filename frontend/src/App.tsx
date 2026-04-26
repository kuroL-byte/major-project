import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
};

type Page = "Dashboard" | "Predictions" | "Alerts" | "Map" | "EMS Services" | "Settings";

type Toast = { id: string; title: string; message?: string; tone?: "primary" | "success" | "danger" };

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 text-white/80 shadow-glow">
      {children}
    </span>
  );
}

function GlassCard({
  title,
  subtitle,
  right,
  className,
  children
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-white/6 backdrop-blur-xl ring-1 ring-white/12 shadow-glass",
        "transition duration-200 hover:bg-white/8",
        className
      )}
    >
      {(title || subtitle || right) && (
        <header className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title && (
              <h2 className="truncate text-sm font-semibold tracking-wide text-white/90">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-xs leading-5 text-white/60">{subtitle}</p>
            )}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </header>
      )}
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

function GradientButton({
  children,
  variant = "primary",
  className,
  onClick,
  disabled
}: {
  children: React.ReactNode;
  variant?: "primary" | "danger" | "success";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}) {
  const bg =
    variant === "danger"
      ? "bg-danger"
      : variant === "success"
        ? "bg-success"
        : "bg-primary";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-black/90",
        bg,
        "shadow-glow transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(0,0,0,0.45)] active:translate-y-0",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-glow",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        className
      )}
    >
      {children}
    </button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/6 px-2.5 py-1 text-xs font-medium text-white/70 ring-1 ring-white/10">
      {children}
    </span>
  );
}

function ToastStack({
  toasts,
  onDismiss
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-[60] w-[320px] max-w-[calc(100vw-2rem)] space-y-2">
      {toasts.map((t) => {
        const ring =
          t.tone === "danger"
            ? "ring-[#FF416C]/35"
            : t.tone === "success"
              ? "ring-[#a8e063]/30"
              : "ring-[#00D9F5]/30";
        const dot =
          t.tone === "danger"
            ? "bg-danger"
            : t.tone === "success"
              ? "bg-success"
              : "bg-primary";
        return (
          <div
            key={t.id}
            className={cn(
              "rounded-2xl bg-white/8 backdrop-blur-xl p-4 ring-1 ring-white/12 shadow-glow",
              ring
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />
                  <div className="truncate text-sm font-semibold text-white/90">
                    {t.title}
                  </div>
                </div>
                {t.message ? (
                  <div className="mt-1 text-xs leading-5 text-white/65">{t.message}</div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                className="rounded-xl bg-white/6 px-2.5 py-1 text-xs font-semibold text-white/70 ring-1 ring-white/10 transition hover:bg-white/8 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatRow({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: string;
  tone?: "neutral" | "danger" | "success";
}) {
  const dot =
    tone === "danger"
      ? "bg-[#FF416C]"
      : tone === "success"
        ? "bg-[#a8e063]"
        : "bg-[#00D9F5]";
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />
        <span className="text-xs text-white/65">{label}</span>
      </div>
      <span className="text-xs font-semibold text-white/85">{value}</span>
    </div>
  );
}

function LineChartPlaceholder() {
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,245,160,0.18),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(0,217,245,0.14),transparent_50%),radial-gradient(circle_at_65%_85%,rgba(255,65,108,0.12),transparent_55%)]" />
      <svg
        viewBox="0 0 600 220"
        className="relative h-full w-full"
        aria-label="Prediction graph placeholder"
        role="img"
      >
        <defs>
          <linearGradient id="grid" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
          <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#00F5A0" />
            <stop offset="1" stopColor="#00D9F5" />
          </linearGradient>
        </defs>

        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={(i * 600) / 7}
            y1="0"
            x2={(i * 600) / 7}
            y2="220"
            stroke="url(#grid)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={(i * 220) / 5}
            x2="600"
            y2={(i * 220) / 5}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        <path
          d="M 0 160 C 60 120, 110 130, 170 100 C 230 70, 280 85, 330 60 C 380 35, 430 45, 480 30 C 530 18, 570 30, 600 22"
          fill="none"
          stroke="url(#line)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 0 160 C 60 120, 110 130, 170 100 C 230 70, 280 85, 330 60 C 380 35, 430 45, 480 30 C 530 18, 570 30, 600 22 L 600 220 L 0 220 Z"
          fill="rgba(0,217,245,0.10)"
        />
      </svg>

      <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
        <Pill>Model: v2.4</Pill>
        <Pill>Latency: 83ms</Pill>
        <Pill>Confidence: 0.91</Pill>
      </div>
    </div>
  );
}

function MaharashtraLeafletMap() {
  const maharashtraCenter: [number, number] = [19.7515, 75.7139];
  const mumbai: [number, number] = [19.076, 72.8777];

  // Simple outline (placeholder-quality, not authoritative GIS boundary)
  const mhOutline: Array<[number, number]> = [
    [22.2, 73.4],
    [21.4, 74.8],
    [20.8, 76.2],
    [19.8, 77.7],
    [18.2, 78.3],
    [16.7, 74.3],
    [18.4, 72.6],
    [20.1, 72.9],
    [22.2, 73.4]
  ];

  return (
    <MapContainer
      center={maharashtraCenter}
      zoom={6}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Polygon
        positions={mhOutline}
        pathOptions={{
          color: "#00D9F5",
          weight: 2,
          opacity: 0.9,
          fillColor: "#00F5A0",
          fillOpacity: 0.12
        }}
      />

      <Marker position={mumbai}>
        <Popup>
          <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
            <div style={{ fontWeight: 700 }}>Maharashtra</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Mumbai marker</div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

function MapViewPlaceholder() {
  return (
    <div className="relative mt-4 h-[150px] overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 sm:h-[190px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(0,245,160,0.12),transparent_55%),radial-gradient(circle_at_70%_35%,rgba(0,217,245,0.10),transparent_55%),radial-gradient(circle_at_55%_75%,rgba(255,65,108,0.08),transparent_60%)]" />
      <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="absolute inset-0">
        <MaharashtraLeafletMap />
      </div>

      <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap items-center gap-2">
        <Pill>Map view</Pill>
        <Pill>Maharashtra</Pill>
        <Pill>Leaflet</Pill>
      </div>
    </div>
  );
}

function MapPlaceholder() {
  const [view, setView] = React.useState<"map" | "grid">("map");
  return (
    <div className="relative h-[280px] w-full overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 sm:h-[340px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(0,245,160,0.16),transparent_55%),radial-gradient(circle_at_75%_40%,rgba(0,217,245,0.12),transparent_50%),radial-gradient(circle_at_55%_80%,rgba(255,65,108,0.10),transparent_55%)]" />
      {view === "grid" ? (
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
      ) : null}

      <div className="absolute inset-0 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white/90">
              Live Disaster Map
            </div>
            <div className="mt-1 text-xs text-white/60">
              Realtime layers (placeholder UI)
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-full bg-white/6 p-1 ring-1 ring-white/10">
              <button
                type="button"
                onClick={() => setView("map")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  view === "map"
                    ? "bg-primary text-black/90 shadow-glow"
                    : "text-white/70 hover:text-white"
                )}
              >
                Map
              </button>
              <button
                type="button"
                onClick={() => setView("grid")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  view === "grid"
                    ? "bg-primary text-black/90 shadow-glow"
                    : "text-white/70 hover:text-white"
                )}
              >
                Grid
              </button>
            </div>
            <Pill>Heat</Pill>
            <Pill>Flood</Pill>
            <Pill>Storm</Pill>
          </div>
        </div>

        {view === "map" ? <MapViewPlaceholder /> : null}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-white/6 px-3 py-2 ring-1 ring-white/10">
            <StatRow label="Active signals" value="128" />
          </div>
          <div className="rounded-xl bg-white/6 px-3 py-2 ring-1 ring-white/10">
            <StatRow label="Anomalies" value="12" tone="danger" />
          </div>
          <div className="rounded-xl bg-white/6 px-3 py-2 ring-1 ring-white/10">
            <StatRow label="Safe zones" value="34" tone="success" />
          </div>
          <div className="rounded-xl bg-white/6 px-3 py-2 ring-1 ring-white/10">
            <StatRow label="Uptime" value="99.98%" />
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-10 blur-2xl" />

        {[
          { x: "18%", y: "56%", tone: "success" as const },
          { x: "42%", y: "38%", tone: "neutral" as const },
          { x: "68%", y: "46%", tone: "danger" as const },
          { x: "80%", y: "70%", tone: "neutral" as const }
        ].map((p, idx) => (
          <div
            key={idx}
            className="absolute"
            style={{ left: p.x, top: p.y }}
          >
            <span
              className={cn(
                "relative block h-3.5 w-3.5 rounded-full ring-2 ring-white/20",
                p.tone === "danger"
                  ? "bg-[#FF416C]"
                  : p.tone === "success"
                    ? "bg-[#a8e063]"
                    : "bg-[#00D9F5]"
              )}
            />
            <span className="absolute -inset-4 block rounded-full bg-white/10 blur-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskCard({
  label,
  value,
  hint,
  tone
}: {
  label: "Low" | "Medium" | "High";
  value: string;
  hint: string;
  tone: "success" | "primary" | "danger";
}) {
  const ring =
    tone === "danger"
      ? "ring-[#FF416C]/35"
      : tone === "success"
        ? "ring-[#a8e063]/30"
        : "ring-[#00D9F5]/30";

  const chip =
    tone === "danger"
      ? "bg-danger text-black/90"
      : tone === "success"
        ? "bg-success text-black/90"
        : "bg-primary text-black/90";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white/6 p-4 ring-1 ring-white/12 shadow-glow",
        "transition duration-200 hover:-translate-y-0.5 hover:bg-white/8",
        ring
      )}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/8 blur-2xl transition duration-300 group-hover:bg-white/12" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium tracking-wide text-white/60">
            Risk Level
          </div>
          <div className="mt-1 text-lg font-semibold text-white/90">
            {label}
          </div>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", chip)}>
          {value}
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/60">{hint}</p>
    </div>
  );
}

function AlertsPanel({ onToast }: { onToast?: (t: Omit<Toast, "id">) => void }) {
  // Legacy panel kept for Dashboard; the full Alerts page has richer controls.
  const alerts = [
    { title: "Cyclone watch", meta: "Bay of Bengal · ETA 12h", sev: "High" },
    { title: "Flash flood risk", meta: "Western Ghats · 48% ↑", sev: "High" },
    { title: "Heatwave anomaly", meta: "North India · Threshold +2.3°C", sev: "Medium" },
    { title: "Landslide advisory", meta: "Himalayan belt · Saturation high", sev: "Medium" },
    { title: "Urban flooding", meta: "Mumbai · Drainage stress detected", sev: "High" }
  ] as const;

  return (
    <GlassCard
      title="Alerts"
      subtitle="Priority incidents requiring attention"
      right={<Pill>Live</Pill>}
      className="h-full"
    >
      <div className="space-y-3">
        {alerts.map((a, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl p-4 ring-1 ring-white/10",
              "bg-danger shadow-glow",
              "transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-black/90">
                  {a.title}
                </div>
                <div className="mt-1 text-xs text-black/70">{a.meta}</div>
              </div>
              <span className="rounded-full bg-black/15 px-2.5 py-1 text-xs font-semibold text-black/90 ring-1 ring-black/10">
                {a.sev}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onToast?.({
                    title: "Alert acknowledged",
                    message: `${a.title} acknowledged (demo).`,
                    tone: "success"
                  })
                }
                className="rounded-xl bg-black/15 px-3 py-2 text-xs font-semibold text-black/90 ring-1 ring-black/10 transition hover:bg-black/20"
              >
                Acknowledge
              </button>
              <button
                type="button"
                onClick={() =>
                  onToast?.({ title: a.title, message: a.meta, tone: "danger" })
                }
                className="rounded-xl bg-black/10 px-3 py-2 text-xs font-semibold text-black/90 ring-1 ring-black/10 transition hover:bg-black/15"
              >
                View details
              </button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function MapPage() {
  return (
    <GlassCard
      title="Map"
      subtitle="Interactive map view (React-Leaflet)"
      right={
        <div className="flex items-center gap-2">
          <Pill>India</Pill>
          <Pill>Maharashtra</Pill>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="relative h-[520px] overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,245,160,0.12),transparent_55%),radial-gradient(circle_at_70%_30%,rgba(0,217,245,0.10),transparent_55%),radial-gradient(circle_at_55%_85%,rgba(255,65,108,0.08),transparent_60%)]" />
            <div className="absolute inset-0">
              <MaharashtraLeafletMap />
            </div>
            <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap items-center gap-2">
              <Pill>Big placeholder</Pill>
              <Pill>React-Leaflet</Pill>
              <Pill>OSM tiles</Pill>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="space-y-4">
            <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
              <div className="text-sm font-semibold text-white/85">Layers</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill>Flood</Pill>
                <Pill>Cyclone</Pill>
                <Pill>Heat</Pill>
                <Pill>Landslide</Pill>
              </div>
              <div className="mt-4 space-y-2">
                <StatRow label="Markers" value="1" />
                <StatRow label="Polygons" value="1" />
                <StatRow label="Tile source" value="OSM" />
              </div>
            </div>
            <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
              <div className="text-sm font-semibold text-white/85">Notes</div>
              <p className="mt-2 text-xs leading-5 text-white/60">
                Maharashtra boundary outline is a UI placeholder (not an official GIS
                border). Replace with a proper GeoJSON when you’re ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function EMSServicesPage() {
  return (
    <GlassCard
      title="EMS Services"
      subtitle="Interactive map view of local emergency medical services"
    >
      <div className="relative h-[65dvh] min-h-[500px] w-full overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
        <iframe
          src="https://www.google.com/maps/d/u/4/embed?mid=1qe6YypS5YWtfFsknEEl3pFOXfuPtXMA&ehbc=2E312F&noprof=1&ll=18.92286033774148%2C72.82634314999997&z=14"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="EMS Services Map"
          className="absolute inset-0"
        />
      </div>
    </GlassCard>
  );
}

function PredictionsPage({
  onToast
}: {
  onToast: (t: Omit<Toast, "id">) => void;
}) {
  const API_BASE =
    (import.meta as any)?.env?.VITE_API_BASE?.toString?.() || "http://127.0.0.1:5000";

  const [city, setCity] = React.useState("Mumbai");
  const [cityResult, setCityResult] = React.useState<any | null>(null);
  const [cityLoading, setCityLoading] = React.useState(false);
  const [cityError, setCityError] = React.useState<string | null>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [imgResult, setImgResult] = React.useState<any | null>(null);
  const [imgLoading, setImgLoading] = React.useState(false);
  const [imgError, setImgError] = React.useState<string | null>(null);

  async function runCityPrediction() {
    setCityLoading(true);
    setCityError(null);
    setCityResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/flood-risk?city=${encodeURIComponent(city)}`);
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error || "Request failed");
      setCityResult(json);
      onToast({
        title: "City prediction complete",
        message: `${json.city}: ${json.prediction}`,
        tone: json.prediction === "Unsafe" ? "danger" : "success"
      });
    } catch (e: any) {
      setCityError(e?.message || "Failed");
      onToast({ title: "Prediction failed", message: "Backend not reachable", tone: "danger" });
    } finally {
      setCityLoading(false);
    }
  }

  async function runImageCheck() {
    if (!file) {
      setImgError("Please choose an image first.");
      return;
    }
    setImgLoading(true);
    setImgError(null);
    setImgResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/api/classify-image`, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error || "Request failed");
      setImgResult(json);
      onToast({
        title: "Image check complete",
        message: `${json.prediction} (${json.confidence}%)`,
        tone: json.prediction === "Flooded" ? "danger" : "success"
      });
    } catch (e: any) {
      setImgError(e?.message || "Failed");
      onToast({ title: "Image check failed", message: "Backend not reachable", tone: "danger" });
    } finally {
      setImgLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <GlassCard
          title="Flood Risk Prediction (City)"
          subtitle="Uses your backend flood model + weather features"
          right={<Pill>API: /api/flood-risk</Pill>}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-8">
              <label className="text-xs font-semibold text-white/70">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Mumbai"
                className="mt-2 w-full rounded-2xl bg-white/6 px-4 py-3 text-sm text-white/90 ring-1 ring-white/10 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              {cityError ? <div className="mt-2 text-xs text-[#FF416C]">{cityError}</div> : null}
            </div>
            <div className="sm:col-span-4 sm:flex sm:items-end">
              <GradientButton className="w-full" variant="primary" onClick={runCityPrediction as any}>
                {cityLoading ? "Running..." : "Run prediction"}
              </GradientButton>
            </div>
          </div>

          {cityResult ? (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-xs font-semibold text-white/70">Result</div>
                <div className="mt-2 text-lg font-semibold text-white/90">
                  {cityResult.prediction}
                </div>
                <div className="mt-2 text-xs text-white/60">
                  Lat/Lon: {cityResult.lat}, {cityResult.lon}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-xs font-semibold text-white/70">Features</div>
                <div className="mt-3 space-y-2">
                  <StatRow label="Avg temp" value={`${cityResult.features.avg_temp}`} />
                  <StatRow label="Max temp" value={`${cityResult.features.max_temp}`} />
                  <StatRow label="Precip" value={`${cityResult.features.total_precip}`} />
                </div>
              </div>
            </div>
          ) : null}
        </GlassCard>
      </div>

      <div className="lg:col-span-5">
        <GlassCard
          title="Flood Image Check"
          subtitle="Upload an image to classify Flooded vs Not Flooded"
          right={<Pill>API: /api/classify-image</Pill>}
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/70">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full rounded-2xl bg-white/6 px-4 py-3 text-sm text-white/70 ring-1 ring-white/10 file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white/80 hover:bg-white/7"
              />
              {imgError ? <div className="mt-2 text-xs text-[#FF416C]">{imgError}</div> : null}
            </div>

            <GradientButton className="w-full" variant="primary" onClick={runImageCheck as any}>
              {imgLoading ? "Checking..." : "Check prediction"}
            </GradientButton>

            {imgResult ? (
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-white/70">Result</div>
                    <div className="mt-2 text-lg font-semibold text-white/90">
                      {imgResult.prediction}
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      Confidence: {imgResult.confidence}%
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      imgResult.prediction === "Flooded"
                        ? "bg-danger text-black/90"
                        : "bg-success text-black/90"
                    )}
                  >
                    {imgResult.prediction === "Flooded" ? "Danger" : "OK"}
                  </span>
                </div>
                {imgResult.image_base64_png ? (
                  <img
                    alt="Uploaded"
                    className="mt-4 w-full rounded-2xl ring-1 ring-white/10"
                    src={`data:image/png;base64,${imgResult.image_base64_png}`}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function AlertsPage({
  onToast
}: {
  onToast: (t: Omit<Toast, "id">) => void;
}) {
  const [alerts, setAlerts] = React.useState(
    [
      { id: uid(), title: "Cyclone alert", meta: "Odisha coast · Landfall risk 18–24h", sev: "High" as const, ack: false },
      { id: uid(), title: "Flash flood warning", meta: "Assam · River level rising", sev: "High" as const, ack: false },
      { id: uid(), title: "Heatwave advisory", meta: "Rajasthan · 45°C threshold", sev: "Medium" as const, ack: false },
      { id: uid(), title: "Landslide risk", meta: "Himachal Pradesh · Heavy rainfall", sev: "Medium" as const, ack: false },
      { id: uid(), title: "Urban flooding watch", meta: "Mumbai · Short intense rainfall", sev: "High" as const, ack: false }
    ]
  );

  function acknowledge(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, ack: true } : a)));
    onToast({ title: "Alert acknowledged", message: "Marked as acknowledged", tone: "success" });
  }

  function viewDetails(a: (typeof alerts)[number]) {
    onToast({ title: a.title, message: a.meta, tone: a.sev === "High" ? "danger" : "primary" });
  }

  return (
    <GlassCard
      title="Alerts"
      subtitle="Dummy India-focused incidents (demo data)"
      right={<Pill>{alerts.filter((a) => !a.ack).length} active</Pill>}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={cn(
              "rounded-2xl p-4 ring-1 ring-white/10 shadow-glow transition duration-200 hover:-translate-y-0.5",
              a.sev === "High" ? "bg-danger" : "bg-white/6 backdrop-blur-xl"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className={cn("truncate text-sm font-semibold", a.sev === "High" ? "text-black/90" : "text-white/90")}>
                  {a.title}
                </div>
                <div className={cn("mt-1 text-xs", a.sev === "High" ? "text-black/70" : "text-white/60")}>
                  {a.meta}
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                  a.sev === "High"
                    ? "bg-black/15 text-black/90 ring-black/10"
                    : "bg-white/6 text-white/80 ring-white/10"
                )}
              >
                {a.sev}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={a.ack}
                onClick={() => acknowledge(a.id)}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition",
                  a.sev === "High"
                    ? "bg-black/15 text-black/90 ring-black/10 hover:bg-black/20 disabled:opacity-60"
                    : "bg-white/6 text-white/80 ring-white/10 hover:bg-white/8 disabled:opacity-60"
                )}
              >
                {a.ack ? "Acknowledged" : "Acknowledge"}
              </button>
              <button
                type="button"
                onClick={() => viewDetails(a)}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition",
                  a.sev === "High"
                    ? "bg-black/10 text-black/90 ring-black/10 hover:bg-black/15"
                    : "bg-white/6 text-white/80 ring-white/10 hover:bg-white/8"
                )}
              >
                View details
              </button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function ActivityFeed() {
  const items = [
    {
      title: "Model retrained",
      meta: "Flood classifier · improved recall +3.2%",
      time: "2m ago"
    },
    {
      title: "New data ingested",
      meta: "Satellite tiles · 1,284 assets",
      time: "18m ago"
    },
    {
      title: "Alert resolved",
      meta: "Heatwave anomaly · downgraded to Low",
      time: "1h ago"
    },
    {
      title: "System check",
      meta: "Sensors · 99.98% uptime · green",
      time: "3h ago"
    }
  ] as const;

  return (
    <GlassCard title="Recent Activity" subtitle="Operational log stream" className="h-full">
      <div className="space-y-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 transition hover:bg-white/7"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white/85">
                {it.title}
              </div>
              <div className="mt-1 line-clamp-2 text-xs leading-5 text-white/60">
                {it.meta}
              </div>
            </div>
            <div className="shrink-0 text-xs font-medium text-white/55">{it.time}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function Sidebar({ nav }: { nav: NavItem[] }) {
  return (
    <aside className="hidden h-full w-[280px] shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col p-5">
        <div className="flex items-center gap-3 rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 shadow-glow">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-black/90 shadow-glow">
            <span className="text-sm font-black tracking-tight">DP</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white/90">
              Disaster Predict
            </div>
            <div className="mt-0.5 text-xs text-white/60">
              AI control center dashboard
            </div>
          </div>
        </div>

        <nav className="mt-6 space-y-2">
          {nav.map((item) => (
            <button
              key={item.label}
              type="button"
              className={cn(
                "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left",
                "ring-1 ring-white/10 transition duration-200",
                item.active
                  ? "bg-white/10 text-white shadow-glow"
                  : "bg-white/5 text-white/75 hover:bg-white/8 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-xl ring-1 ring-white/10 transition",
                  item.active
                    ? "bg-primary text-black/90"
                    : "bg-white/5 text-white/75 group-hover:bg-white/7"
                )}
              >
                {item.icon}
              </span>
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
            <div className="text-xs font-semibold text-white/80">System</div>
            <div className="mt-3 space-y-2">
              <StatRow label="Threat index" value="0.62" />
              <StatRow label="Active alerts" value="3" tone="danger" />
              <StatRow label="Services" value="Online" tone="success" />
            </div>
            <div className="mt-4">
              <GradientButton variant="primary" className="w-full">
                Run scan
              </GradientButton>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({
  onExport,
  onNewAnalysis
}: {
  onExport: () => void;
  onNewAnalysis: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/6 ring-1 ring-white/10 lg:hidden">
            <span className="text-xs font-bold text-white/80">DP</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white/90">
              Disaster Prediction & Analysis
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <Pill>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#a8e063]" />
                Systems nominal
              </Pill>
              <Pill>Region: Global</Pill>
              <Pill>Mode: Realtime</Pill>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExport}
            className="hidden rounded-xl bg-white/6 px-3 py-2 text-xs font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/8 sm:inline-flex"
          >
            Export
          </button>
          <GradientButton variant="primary" className="hidden sm:inline-flex" onClick={onNewAnalysis as any}>
            New analysis
          </GradientButton>
          <div className="ml-1 flex items-center gap-3 rounded-2xl bg-white/6 px-3 py-2 ring-1 ring-white/10">
            <div className="h-9 w-9 rounded-xl bg-[radial-gradient(circle_at_30%_30%,rgba(0,245,160,0.35),transparent_55%),radial-gradient(circle_at_70%_20%,rgba(0,217,245,0.25),transparent_55%),rgba(255,255,255,0.08)] ring-1 ring-white/10" />
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-white/85">Operator</div>
              <div className="text-[11px] text-white/55">admin@disasterpredict</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function App() {
  const [page, setPage] = React.useState<Page>("Dashboard");
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  function pushToast(t: Omit<Toast, "id">) {
    const id = uid();
    setToasts((prev) => [{ id, ...t }, ...prev].slice(0, 4));
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }

  const nav: NavItem[] = [
    {
      label: "Dashboard",
      active: page === "Dashboard",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M4 13.5V20a1 1 0 0 0 1 1h5v-7.5H4Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M14 3h5a1 1 0 0 1 1 1v7.5h-6V3Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M4 3h5a1 1 0 0 1 1 1v6H4V3Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M14 14h6v6a1 1 0 0 1-1 1h-5v-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      )
    },
    {
      label: "Predictions",
      active: page === "Predictions",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M5 18V6m0 12h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M7 14l3-3 3 2 4-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 8h3v3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    },
    {
      label: "Alerts",
      active: page === "Alerts",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M12 3c-3.5 0-6.5 3-6.5 6.5V14l-1.5 2h16L18.5 14V9.5C18.5 6 15.5 3 12 3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 18a2.5 2.5 0 0 0 5 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )
    },
    {
      label: "Map",
      active: page === "Map",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 3v15M15 6v15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )
    },
    {
      label: "EMS Services",
      active: page === "EMS Services",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M4.5 12h15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 4.5v15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      )
    },
    {
      label: "Settings",
      active: page === "Settings",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M19.4 15a8.5 8.5 0 0 0 .1-1l2-1.2-2-3.4-2.3.6a8.7 8.7 0 0 0-1.7-1l-.3-2.4H11l-.3 2.4a8.7 8.7 0 0 0-1.7 1l-2.3-.6-2 3.4 2 1.2a8.5 8.5 0 0 0 .1 1 8.5 8.5 0 0 0-.1 1l-2 1.2 2 3.4 2.3-.6c.5.4 1.1.7 1.7 1l.3 2.4h4.1l.3-2.4c.6-.3 1.2-.6 1.7-1l2.3.6 2-3.4-2-1.2a8.5 8.5 0 0 0-.1-1Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-dvh bg-dash-bg text-white">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary opacity-25 blur-3xl" />
        <div className="absolute right-[-120px] top-24 h-[420px] w-[420px] rounded-full bg-danger opacity-15 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/2 h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-success opacity-12 blur-3xl" />
      </div>

      <div className="relative flex min-h-dvh">
        <aside className="hidden h-full w-[280px] shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-xl lg:block">
          <div className="flex h-full flex-col p-5">
            <div className="flex items-center gap-3 rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 shadow-glow">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-black/90 shadow-glow">
                <span className="text-sm font-black tracking-tight">DP</span>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white/90">
                  Disaster Predict
                </div>
                <div className="mt-0.5 text-xs text-white/60">
                  AI control center dashboard
                </div>
              </div>
            </div>

            <nav className="mt-6 space-y-2">
              {nav.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setPage(item.label as Page)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left",
                    "ring-1 ring-white/10 transition duration-200",
                    item.active
                      ? "bg-white/10 text-white shadow-glow"
                      : "bg-white/5 text-white/75 hover:bg-white/8 hover:text-white"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-xl ring-1 ring-white/10 transition",
                      item.active
                        ? "bg-primary text-black/90"
                        : "bg-white/5 text-white/75 group-hover:bg-white/7"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto">
              <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
                <div className="text-xs font-semibold text-white/80">System</div>
                <div className="mt-3 space-y-2">
                  <StatRow label="Threat index" value="0.62" />
                  <StatRow label="Active alerts" value="5" tone="danger" />
                  <StatRow label="Services" value="Online" tone="success" />
                </div>
                <div className="mt-4">
                  <GradientButton
                    variant="primary"
                    className="w-full"
                    onClick={() => pushToast({ title: "Scan started", message: "Running diagnostics...", tone: "primary" })}
                  >
                    Run scan
                  </GradientButton>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            onExport={() => pushToast({ title: "Export queued", message: "Generating report bundle...", tone: "primary" })}
            onNewAnalysis={() => {
              setPage("Predictions");
              pushToast({ title: "New analysis", message: "Opened Predictions", tone: "primary" });
            }}
          />

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
            {page === "Dashboard" ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
                <div className="lg:col-span-8">
                  <MapPlaceholder />
                </div>

                <div className="lg:col-span-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-6">
                    <RiskCard
                      label="Low"
                      value="0.18"
                      hint="Stable environment. Monitor minor sensor drift."
                      tone="success"
                    />
                    <RiskCard
                      label="Medium"
                      value="0.54"
                      hint="Elevated anomalies. Increase sampling frequency."
                      tone="primary"
                    />
                    <RiskCard
                      label="High"
                      value="0.86"
                      hint="Critical signals detected. Trigger incident response."
                      tone="danger"
                    />
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <GlassCard
                    title="Prediction Graph"
                    subtitle="Projected risk trend (placeholder UI)"
                    right={
                      <div className="flex items-center gap-2">
                        <Pill>24h</Pill>
                        <Pill>7d</Pill>
                        <Pill>30d</Pill>
                      </div>
                    }
                  >
                    <LineChartPlaceholder />
                  </GlassCard>
                </div>

                <div className="lg:col-span-4">
                  <AlertsPanel onToast={pushToast} />
                </div>

                <div className="lg:col-span-12">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
                    <div className="lg:col-span-7">
                      <GlassCard
                        title="Command Center"
                        subtitle="Quick actions & status"
                        right={<Pill>Secure</Pill>}
                      >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                            <div className="flex items-center gap-3">
                              <Icon>
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                                  <path
                                    d="M4 12h16"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                  />
                                  <path
                                    d="M12 4v16"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </Icon>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-white/85">
                                  Create scenario
                                </div>
                                <div className="mt-1 text-xs text-white/60">
                                  Simulate multi-factor incidents
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <GradientButton
                                variant="primary"
                                onClick={() =>
                                  pushToast({
                                    title: "Scenario launched",
                                    message: "Simulation started (demo).",
                                    tone: "primary"
                                  })
                                }
                              >
                                Launch
                              </GradientButton>
                              <button
                                type="button"
                                onClick={() =>
                                  pushToast({
                                    title: "Configure",
                                    message: "Configuration panel coming soon.",
                                    tone: "primary"
                                  })
                                }
                                className="rounded-xl bg-white/6 px-4 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/8"
                              >
                                Configure
                              </button>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                            <div className="flex items-center gap-3">
                              <Icon>
                                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                                  <path
                                    d="M6 18h12M7.5 14.5l3-3 2 2 4-5"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M5 6h14v12H5V6Z"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </Icon>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-white/85">
                                  Data pipeline
                                </div>
                                <div className="mt-1 text-xs text-white/60">
                                  Ingest sensors + satellite feeds
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 space-y-2">
                              <StatRow label="Ingest rate" value="2.4k/min" />
                              <StatRow label="Queue depth" value="37" />
                              <StatRow label="Last sync" value="12s" tone="success" />
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </div>

                    <div className="lg:col-span-5">
                      <ActivityFeed />
                    </div>
                  </div>
                </div>
              </div>
            ) : page === "Map" ? (
              <MapPage />
            ) : page === "Predictions" ? (
              <PredictionsPage onToast={pushToast} />
            ) : page === "Alerts" ? (
              <AlertsPage onToast={pushToast} />
            ) : page === "EMS Services" ? (
              <EMSServicesPage />
            ) : (
              <GlassCard title="Settings" subtitle="Project configuration (placeholder)">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
                    <div className="text-sm font-semibold text-white/85">Backend URL</div>
                    <div className="mt-2 text-xs text-white/60">Currently uses `http://127.0.0.1:5000`.</div>
                  </div>
                  <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
                    <div className="text-sm font-semibold text-white/85">Theme</div>
                    <div className="mt-2 text-xs text-white/60">Glassmorphism · Dark gradient</div>
                  </div>
                </div>
              </GlassCard>
            )}
          </main>

          <footer className="border-t border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>© {new Date().getFullYear()} Disaster Predict</div>
              <div className="flex flex-wrap gap-3">
                <span>Incident ID: DP-AX9-42</span>
                <span>Build: ControlCenter</span>
                <span>Secure channel: Enabled</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

