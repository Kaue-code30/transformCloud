import { Settings, Cloud, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-1" style={{ color: "var(--ds-text)" }}>Settings</h1>
        <p className="text-sm" style={{ color: "var(--ds-text-2)" }}>
          Configure your cloud connections and preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div
          className="border rounded-2xl p-6"
          style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Cloud size={16} className="text-[var(--ds-accent)]" />
            <h2 className="font-bold text-sm" style={{ color: "var(--ds-text)" }}>Cloud Providers</h2>
          </div>
          {["AWS", "GCP", "Azure", "OCI"].map((p) => (
            <div
              key={p}
              className="flex items-center justify-between py-3 last:border-0"
              style={{ borderBottom: "1px solid var(--ds-border-sub)" }}
            >
              <span className="text-sm" style={{ color: "var(--ds-text)" }}>{p}</span>
              <span
                className="text-xs px-3 py-1 rounded-lg"
                style={{
                  color: "var(--ds-text-3)",
                  background: "var(--ds-card-alt)",
                }}
              >
                {p === "AWS" ? "Connected" : "Not connected"}
              </span>
            </div>
          ))}
        </div>

        <div
          className="border rounded-2xl p-6"
          style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-[var(--ds-accent)]" />
            <h2 className="font-bold text-sm" style={{ color: "var(--ds-text)" }}>Alerts</h2>
          </div>
          <p className="text-sm" style={{ color: "var(--ds-text-2)" }}>
            Budget alert and cost spike notifications — coming soon.
          </p>
        </div>

        <div
          className="border rounded-2xl p-6"
          style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings size={16} className="text-[var(--ds-accent)]" />
            <h2 className="font-bold text-sm" style={{ color: "var(--ds-text)" }}>About</h2>
          </div>
          <p className="text-sm" style={{ color: "var(--ds-text-2)" }}>
            TransformCloud<br />
            Cloud Intelligence Platform v0.1.0
          </p>
        </div>
      </div>
    </div>
  );
}
