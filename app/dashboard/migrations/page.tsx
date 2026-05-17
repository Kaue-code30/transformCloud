import { Zap, CheckCircle, Clock, ArrowRight } from "lucide-react";

const recipes = [
  {
    title: "Kubernetes Workload",
    from: "EKS (AWS)",
    to: "OKE (OCI)",
    effort: "Low",
    saving: "-40%",
    steps: ["Export kubeconfig", "Migrate container images to OCI Registry", "Apply manifests to OKE cluster", "Update DNS/ingress", "Validate with smoke tests"],
    status: "ready",
  },
  {
    title: "PostgreSQL Database",
    from: "RDS (AWS)",
    to: "MySQL HeatWave (OCI)",
    effort: "Medium",
    saving: "-35%",
    steps: ["Export data with pg_dump", "Provision OCI DB instance", "Restore data", "Update connection strings", "Run integration tests"],
    status: "ready",
  },
  {
    title: "Object Storage",
    from: "S3 (AWS)",
    to: "Object Storage (OCI)",
    effort: "Low",
    saving: "-30%",
    steps: ["Install rclone or aws s3 sync", "Configure OCI credentials", "Sync bucket contents", "Update app config", "Validate checksums"],
    status: "ready",
  },
  {
    title: "VM Instances",
    from: "EC2 (AWS)",
    to: "Compute (OCI)",
    effort: "Medium",
    saving: "-45%",
    steps: ["Create VM image/snapshot", "Export to OCI-compatible format", "Import to OCI Compute", "Configure networking", "Test connectivity"],
    status: "beta",
  },
];

const effortColor: Record<string, string> = {
  Low: "text-[#b3fe71] bg-[#b3fe71]/10",
  Medium: "text-yellow-400 bg-yellow-400/10",
  High: "text-red-400 bg-red-400/10",
};

export default function MigrationsPage() {
  return (
    <div className="p-6 lg:p-8 ">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Migration Automation</h1>
        <p className="text-gray-400 text-sm">
          Ready-to-use recipes for migrating portable infrastructure between providers.
        </p>
      </div>

      <div className="space-y-4">
        {recipes.map((r) => (
          <div
            key={r.title}
            className="bg-[#242424] border border-[#333] rounded-2xl p-6 hover:border-[#b3fe71]/40 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#b3fe71]/10 flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-[#b3fe71]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h3 className="font-bold">{r.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${effortColor[r.effort]}`}>
                    {r.effort} effort
                  </span>
                  {r.status === "beta" && (
                    <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md">beta</span>
                  )}
                  {r.status === "ready" && (
                    <span className="text-xs text-[#b3fe71] bg-[#b3fe71]/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle size={10} /> ready
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{r.from}</span>
                  <ArrowRight size={10} />
                  <span>{r.to}</span>
                  <span className="ml-auto text-[#b3fe71] font-bold">{r.saving}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#2a2a2a] pt-4">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">Steps</p>
              <ol className="space-y-2">
                {r.steps.map((step, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-[#b3fe71]/10 text-[#b3fe71] text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock size={11} />
                Estimated time: {r.effort === "Low" ? "2–4h" : "4–8h"}
              </div>
              <button className="px-4 py-1.5 bg-[#b3fe71] text-black text-xs font-bold rounded-lg hover:bg-[#65a30d] transition-colors">
                Run automation
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
