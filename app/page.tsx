import AnimatedBackground from "./components/AnimatedBackground";
import CustomCursor from "./components/CustomCursor";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Comparison from "./components/Comparison";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <CustomCursor />
      <main className="min-h-screen relative">
        <Navbar />
        <Hero />
        <div className="dotted-divider max-w-5xl mx-auto my-4" />
        <Features />
        <div className="dotted-divider max-w-5xl mx-auto my-4" />
        <HowItWorks />
        <div className="dotted-divider max-w-5xl mx-auto my-4" />
        <Comparison />
        <div className="dotted-divider max-w-5xl mx-auto my-4" />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
