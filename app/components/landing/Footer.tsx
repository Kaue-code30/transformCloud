import Link from "next/link";

const links = {
  Plataforma: ["Dashboard", "Billing", "Portabilidade", "Migrações", "IA Insights"],
  Legal: ["Privacidade", "Termos de Uso", "LGPD"],
};

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5">
      <div className="section-container py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-14 sm:mb-16">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-[10px] bg-[#b3fe71] flex items-center justify-center">
                <span className="text-black font-black text-xs">TC</span>
              </div>
              <span className="font-black text-white text-base">
                Transform<span className="text-[#b3fe71]">Cloud</span>
              </span>
            </Link>
            <p className="text-sm text-[#555] leading-relaxed max-w-[200px]">
              Inteligência para decisões de infraestrutura cloud.
            </p>
            
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-bold text-[#555] uppercase tracking-widest mb-4">
                {section}
              </h4>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href="/dashboard"
                      className="text-sm text-[#555] hover:text-[#a3a3a3] transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-10 sm:pt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <p className="text-xs text-[#444]">
            © 2026 TransformCloud. Desenvolvido com Quave × Oracle Cloud × FIAP.
          </p>
          <p className="text-xs text-[#333]">
            Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
