"use client";

import dynamic from "next/dynamic";

const MapWithDigipin = dynamic(() => import("../components/MapWithDigipin"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-1 space-y-1">
      <center>
        <h1 className="text-2xl font-bold text-center leading-relaxed">
          Centre of Excellence in Land Administration and Management
          <br />
          Administrative Training Institute (ATI), Mysuru, Karnataka
          <br />
          An Initiative of Department of Land Resources, Ministry of Rural
          Development, Government of India
        </h1>
      </center>

      <h2 className="text-2xl font-bold">On the Fly DigiPin Generator</h2>

      <MapWithDigipin />

      <footer className="text-sm text-center mt-4 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-4">
          <p>
            Application by: Sumanth M, Centre of Excellence in Land Administration
            and Management, ATI, Mysuru
          </p>
          <p>
            Special Thanks to: Ministry of Communications Department of Posts for
            providing DIGIPIN Algorithm for Implementation
          </p>
          <a
            href="https://www.indiapost.gov.in/VAS/Pages/digipin.aspx"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source: DIGIPIN Documentation
          </a>
        </div>
      </footer>

    </main>
  );
}
