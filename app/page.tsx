"use client";

import dynamic from "next/dynamic";

const MapWithDigipin = dynamic(() => import("../components/MapWithDigipin"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-1 space-y-1">
      <center>
        <h1 className="text-m font-bold text-center leading-relaxed">
          <b>
          Centre of Excellence in Land Administration and Management
          </b>
          <br />
          Administrative Training Institute (ATI), Mysuru, Karnataka
          <br />
          <p className="text-s">
          An Initiative of Department of Land Resources, Ministry of Rural
          Development, Government of India
          </p>
        </h1>
      </center>

      <h2 className="text-l font-bold">On the Fly DigiPin Generator</h2>

      <MapWithDigipin />

      <footer className="text-sm text-center mt-1 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-1 px-3">
          <p>
            Application by: Sumanth M, Centre of Excellence in Land Administration
            and Management, ATI, Mysuru
          </p>
          <a
            href="https://www.indiapost.gov.in/VAS/Pages/digipin.aspx"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source: DIGIPIN Documentation
          </a>
          <a
            href="https://github.com/google/open-location-code"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source: Google Pluscode Documentation
          </a>
        </div>
      </footer>

    </main>
  );
}
