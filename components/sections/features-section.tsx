"use client";

import { Truck, RefreshCw, Shield } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Doprava zdarma",
    description: "Při nákupu nad 5000 Kč",
  },
  {
    icon: RefreshCw,
    title: "30 dní na vrácení",
    description: "Bezplatné vrácení zboží",
  },
  {
    icon: Shield,
    title: "Bezpečná platba",
    description: "Šifrované transakce",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24 bg-muted/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
