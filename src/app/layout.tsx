import type { Metadata } from "next";
import { Geist_Mono, Inter, Jost, Newsreader } from "next/font/google";
import "./globals.css";
import AuraBackground from "@/components/display/AuraBackground";
import { DisplayEffects } from "@/components/display/DisplayProvider";
import SovereignHeader from "@/components/display/SovereignHeader";

// Jost is the FrissonWorks typeface; thin weights (200-300) carry the Vogue title and the hero.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500"],
  style: ["normal", "italic"],
});

// The other faces of the TYPE setting.
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin", "latin-ext"], weight: ["200", "300", "400", "500"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"], weight: ["200", "300", "400", "500"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FrissonWorks Design Lab",
  description: "A sandbox for prototyping shared FrissonWorks components.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-text-scale="normal"
      data-type-style="jost"
      className={`${jost.variable} ${newsreader.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="theme-ocean flex min-h-full flex-col font-sans" data-kinematics="normal" data-shadow="on">
        <DisplayEffects />
        <AuraBackground />
        <SovereignHeader />
        {children}
      </body>
    </html>
  );
}
