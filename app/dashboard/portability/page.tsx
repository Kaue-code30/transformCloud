"use client";
import { Shield, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const services = [
  { name: "Amazon EKS (Kubernetes)", portable: "high", score: 95, note: "Standard K8s — fully portable to any cloud." },
  { name: "Amazon RDS (PostgreSQL)", portable: "high", score: 85, note: "Open standard DB — equivalent on GCP/OCI/Azure." },
  { name: "Amazon S3", portable: "medium", score: 60, note: "Proprietary API but S3-compatible alternatives exist." },
  { name: "AWS Lambda", portable: "low", score: 30, note: "Serverless functions have cloud-specific tooling." },
  { name: "Amazon DynamoDB", portable: "low", score: 20, note: "Proprietary NoSQL — requires refactoring to migrate." },
  { name: "Amazon CloudFront", portable: "medium", score: 55, note: "CDN equivalents on all providers, config differs." },
  { name: "AWS Cognito", portable: "low", score: 25, note: "Auth service is vendor-specific." },
  { name: "Amazon SQS", portable: "medium", score: 65, note: "Message queues available everywhere, API differs." },
];

const colorMap: Record<string, string> = {
  high: "#b3fe71",
  medium: "#f59e0b",
  low: "#ef4444",
};

const iconMap: Record<string, React.ComponentType<{ size: number; className: string }>> = {
  high: CheckCircle,
  medium: AlertTriangle,
  low: XCircle,
};

const labelMap: Record<string, string> = {
  high: "High portability",
  medium: "Medium portability",
  low: "Low portability",
};

const overallScore = Math.round(
  services.reduce((sum, s) => sum + s.score, 0) / services.length
);

export default function PortabilityPage() {
  return (
    <div className="p-6 lg:p-8 ">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Portability Score</h1>
        <p className="text-gray-400 text-sm">
          Analyze your vendor dependency and migration feasibility.
        </p>
      </div>

      {/* Score card */}
      <div className="bg-[#242424] border border-[#333] rounded-2xl p-8 mb-6 flex flex-col sm:flex-row items-center gap-8">
        <div className="text-center">
          <div
            className="text-7xl font-black"
            style={{ color: overallScore >= 70 ? "#b3fe71" : overallScore >= 40 ? "#f59e0b" : "#ef4444" }}
          >
            {overallScore}
          </div>
          <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Portability Score</div>
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-sm text-gray-300 leading-relaxed">
            Your infrastructure uses a mix of portable and proprietary services. Migration is feasible for the K8s and DB workloads, but serverless functions and DynamoDB would require significant refactoring.
          </p>
          <div className="flex gap-4 mt-4 text-xs">
            {[["high", "#b3fe71"], ["medium", "#f59e0b"], ["low", "#ef4444"]].map(([k, c]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                <span className="text-gray-400 capitalize">{k}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services list */}
      <div className="bg-[#242424] border border-[#333] rounded-2xl divide-y divide-[#2a2a2a]">
        {services.map((s) => {
          const Icon = iconMap[s.portable];
          return (
            <div key={s.name} className="p-5 flex items-start gap-4">
              <Shield size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="font-medium text-sm">{s.name}</span>
                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold flex-shrink-0"
                    style={{ color: colorMap[s.portable] }}
                  >
                    <Icon size={12} className="" />
                    {labelMap[s.portable]}
                  </div>
                </div>
                <p className="text-xs text-gray-500">{s.note}</p>
                <div className="mt-2 w-full bg-[#1a1a1a] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${s.score}%`, background: colorMap[s.portable] }}
                  />
                </div>
              </div>
              <div
                className="text-sm font-black flex-shrink-0"
                style={{ color: colorMap[s.portable] }}
              >
                {s.score}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
