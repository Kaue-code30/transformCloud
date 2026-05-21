import { Bot, Lightbulb, TrendingDown, CheckCircle, AlertTriangle } from "lucide-react";

export default function AIPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-1" style={{ color: "var(--ds-text)" }}>
          AI Insights — O Cérebro
        </h1>
        <p className="text-sm" style={{ color: "var(--ds-text-2)" }}>
          Personalized migration proposal consolidating all modules.
        </p>
      </div>

      <div
        className="border rounded-2xl p-6 mb-6"
        style={{
          background: "linear-gradient(to right, rgba(179,254,113,0.05), transparent)",
          borderColor: "rgba(179,254,113,0.2)",
        }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#b3fe71]/10 flex items-center justify-center flex-shrink-0">
            <Bot size={18} className="text-[var(--ds-accent)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--ds-accent)] font-semibold uppercase tracking-widest mb-2">
              AI Recommendation
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ds-text-2)" }}>
              &ldquo;We suggest migrating your Kubernetes containers from AWS to OCI. High portability
              score, ready-to-run scripts, <strong style={{ color: "var(--ds-text)" }}>30% savings</strong>.
              During migration, optimize VM sizing for an additional{" "}
              <strong style={{ color: "var(--ds-text)" }}>+15% efficiency</strong>.&rdquo;
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          {
            icon: TrendingDown,
            color: "text-[var(--ds-accent)]",
            bg: "bg-[#b3fe71]/10",
            title: "Migrate now",
            items: ["EKS → OKE (Kubernetes)", "RDS PostgreSQL → OCI DB", "S3 → OCI Object Storage"],
            note: "High portability, scripts ready, strong ROI.",
          },
          {
            icon: CheckCircle,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            title: "Optimize first",
            items: ["Right-size EC2 instances", "Enable S3 Intelligent Tiering", "Delete unused snapshots"],
            note: "Quick wins before migration — reduce current bill.",
          },
          {
            icon: Lightbulb,
            color: "text-yellow-400",
            bg: "bg-yellow-400/10",
            title: "Plan for later",
            items: ["Lambda functions → OCI Functions", "CloudFront → OCI CDN", "Cognito → Auth0/Keycloak"],
            note: "Requires refactoring — plan in next sprint.",
          },
          {
            icon: AlertTriangle,
            color: "text-red-400",
            bg: "bg-red-400/10",
            title: "Don't migrate",
            items: ["DynamoDB workloads", "SageMaker ML pipelines"],
            note: "Cost of migration exceeds 12-month savings.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="border rounded-2xl p-5"
            style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={15} className={card.color} />
              </div>
              <h3 className="font-bold text-sm" style={{ color: "var(--ds-text)" }}>{card.title}</h3>
            </div>
            <ul className="space-y-1.5 mb-3">
              {card.items.map((item) => (
                <li key={item} className="text-xs flex items-center gap-2" style={{ color: "var(--ds-muted)" }}>
                  <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p
              className="text-xs pt-3"
              style={{ color: "var(--ds-text-3)", borderTop: "1px solid var(--ds-border-sub)" }}
            >
              {card.note}
            </p>
          </div>
        ))}
      </div>

      <div
        className="mt-6 border rounded-2xl p-5 text-center"
        style={{ background: "var(--ds-card)", borderColor: "var(--ds-border)" }}
      >
        <p className="text-sm mb-3" style={{ color: "var(--ds-text-2)" }}>
          Connect billing data first to get a personalized AI analysis of your actual infrastructure.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#b3fe71] text-black text-sm font-bold rounded-xl hover:bg-[#65a30d] transition-colors"
        >
          <Bot size={14} />
          Connect billing
        </a>
      </div>
    </div>
  );
}
