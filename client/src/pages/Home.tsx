import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Github, MessageCircle, Play, Zap, Shield } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

/**
 * iOS Underground Telegram Mini App
 *
 * Design Philosophy: Premium Tech Aesthetic
 * - Deep slate background with gradient accents (blue to purple)
 * - Clean asymmetric layouts with strategic whitespace
 * - Smooth, purposeful animations
 * - Premium feel with subtle depth and shadows
 */

export default function Home() {
  const [activeTab, setActiveTab] = useState("featured");
  const [, navigate] = useLocation();

  const socialLinks = [
    {
      name: "Telegram Channel",
      url: "https://t.me/jhidios",
      icon: MessageCircle,
      color: "from-blue-500 to-cyan-500",
      description: "Join our community",
      external: true,
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@ios-underground?si=P9-nNU56YLlU-arj",
      icon: Play,
      color: "from-red-500 to-pink-500",
      description: "Watch tutorials",
      external: true,
    },
    {
      name: "IPA Signer",
      url: "/signer",
      icon: Zap,
      color: "from-purple-500 to-indigo-500",
      description: "Sign IPAs with your cert",
      external: false,
    },
  ];

  const featuredContent = [
    {
      title: "IPA Signer Tool",
      description: "Sign any IPA with your own certificate — free, private, no third-party sites",
      category: "Tool",
      link: "/signer",
      external: false,
    },
    {
      title: "Latest iOS Mods",
      description: "Discover the newest app modifications for iOS",
      category: "Mods",
      link: "https://ios-underground.web.app/index.html",
      external: true,
    },
    {
      title: "Community Resources",
      description: "Access tools, tips, and resources for iOS enthusiasts",
      category: "Resources",
      link: "https://t.me/jhidios",
      external: true,
    },
  ];

  const services = [
    {
      name: "IPA Signer",
      description: "Sign IPAs with your own p12 certificate — built in, always free",
      price: "Free",
      icon: "🔐",
      action: () => navigate("/signer"),
    },
    {
      name: "App Mods",
      description: "Premium modified iOS apps",
      price: "Variable",
      icon: "📱",
      action: () => window.open("https://t.me/jhidios", "_blank"),
    },
    {
      name: "Community Help",
      description: "Get help from the iOS Underground community",
      price: "Free",
      icon: "💬",
      action: () => window.open("https://t.me/jhidios", "_blank"),
    },
  ];

  const handleLinkClick = (url: string, external: boolean) => {
    if (external) {
      window.open(url, "_blank");
    } else {
      navigate(url);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex flex-col justify-center items-center px-4 py-20 overflow-hidden"
        style={{
          backgroundImage:
            "url('https://d2xsxph8kpxj0f.cloudfront.net/310519663667256916/9LYWon4kc5WqvNPRPPjnev/hero-tech-gradient-jdyZtzczRZbSMbmArkXh62.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            iOS Underground
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-8">
            Your gateway to premium iOS modifications, IPA signing, and exclusive community content
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
              onClick={() => window.open("https://t.me/jhidios", "_blank")}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Join Telegram
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-purple-500/50 hover:bg-purple-500/10"
              onClick={() => navigate("/signer")}
            >
              <Zap className="mr-2 h-5 w-5" />
              Sign IPA Free
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce">
            <div className="text-foreground/50 text-sm">Scroll to explore</div>
          </div>
        </div>
      </section>

      {/* Social Links Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Connect With Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Card
                  key={link.name}
                  className="group relative overflow-hidden bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/20"
                  onClick={() => handleLinkClick(link.url, link.external)}
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r ${link.color} transition-opacity duration-300`}
                  />

                  <div className="relative p-6">
                    <div
                      className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${link.color} mb-4`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{link.name}</h3>
                    <p className="text-foreground/60 mb-4">{link.description}</p>
                    <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform">
                      <span className="text-sm font-medium">
                        {link.external ? "Visit" : "Open"}
                      </span>
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12">Featured Content</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredContent.map((item, idx) => (
              <Card
                key={idx}
                className="group relative overflow-hidden bg-card border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/20"
                onClick={() => handleLinkClick(item.link, item.external)}
              >
                {/* Gradient Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="p-6">
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-4">
                    {item.category}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-foreground/60 mb-4">{item.description}</p>
                  <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">
                      {item.external ? "Learn more" : "Open tool"}
                    </span>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12">Our Services</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <Card
                key={idx}
                className="relative overflow-hidden bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group cursor-pointer"
                onClick={service.action}
              >
                {/* Glassmorphism Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-blue-500 to-purple-500 transition-opacity duration-300" />

                <div className="relative p-6">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                  <p className="text-foreground/60 mb-4">{service.description}</p>
                  <div className="text-lg font-bold text-primary">{service.price}</div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
              onClick={() => navigate("/signer")}
            >
              <Zap className="mr-2 h-5 w-5" />
              Try IPA Signer Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card/30 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">iOS Underground</h4>
              <p className="text-foreground/60 text-sm">
                Premium iOS modifications and free IPA signing for the community.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a
                    href="https://ios-underground.web.app/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Main Website
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/signer")}
                    className="hover:text-primary transition-colors text-left"
                  >
                    IPA Signer
                  </button>
                </li>
                <li>
                  <a
                    href="https://t.me/jhidios"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Telegram
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a
                    href="https://ios-underground.web.app/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://ios-underground.web.app/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8">
            <p className="text-center text-foreground/50 text-sm">
              © 2026 iOS Underground. All rights reserved. | Telegram Mini App
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
