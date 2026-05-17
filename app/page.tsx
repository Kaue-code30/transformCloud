import Navbar from "./components/Navbar";
import HeroSection from "./components/landing/HeroSection";
import StatsSection from "./components/landing/StatsSection";
import ComparisonSection from "./components/landing/ComparisonSection";
import PlatformSection from "./components/landing/PlatformSection";
import ModulesSection from "./components/landing/ModulesSection";
import HowItWorksSection from "./components/landing/HowItWorksSection";
import CTASection from "./components/landing/CTASection";
import Footer from "./components/landing/Footer";

export default function Home() {
  return (
    <main className="w-full bg-[#0f0f0f] text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ComparisonSection />
      <PlatformSection />
      <ModulesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </main>
  );
}
