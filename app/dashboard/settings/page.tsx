import { Settings, Cloud, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 ">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Settings</h1>
        <p className="text-gray-400 text-sm">Configure your cloud connections and preferences.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-[#242424] border border-[#333] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cloud size={16} className="text-[#b3fe71]" />
            <h2 className="font-bold text-sm">Cloud Providers</h2>
          </div>
          {["AWS", "GCP", "Azure", "OCI"].map((p) => (
            <div key={p} className="flex items-center justify-between py-3 border-b border-[#2a2a2a] last:border-0">
              <span className="text-sm">{p}</span>
              <span className="text-xs text-gray-500 bg-[#1a1a1a] px-3 py-1 rounded-lg">
                {p === "AWS" ? "Connected" : "Not connected"}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-[#242424] border border-[#333] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-[#b3fe71]" />
            <h2 className="font-bold text-sm">Alerts</h2>
          </div>
          <p className="text-sm text-gray-400">Budget alert and cost spike notifications — coming soon.</p>
        </div>

        <div className="bg-[#242424] border border-[#333] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={16} className="text-[#b3fe71]" />
            <h2 className="font-bold text-sm">About</h2>
          </div>
          <p className="text-sm text-gray-400">
            TransformCloud<br />
            Cloud Intelligence Platform v0.1.0
          </p>
        </div>
      </div>
    </div>
  );
}
