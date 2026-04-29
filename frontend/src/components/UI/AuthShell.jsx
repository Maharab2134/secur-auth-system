import React from "react";
import BrandMark from "./BrandMark";

const AuthShell = ({ title, subtitle, children, sideTitle, sideCopy }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-midnight px-4 py-10 sm:px-8">
      <div className="absolute inset-0 nova-grid-bg" />
      <div className="pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full bg-cyan-400/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

      <div className="theme-shell relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-2xl backdrop-blur-xl lg:grid-cols-5">
        <aside className="theme-side hidden lg:col-span-2 lg:flex lg:flex-col lg:justify-between lg:border-r lg:border-white/10 lg:bg-gradient-to-br lg:from-cyan-900/70 lg:via-slate-900/70 lg:to-emerald-900/50 lg:p-10">
          <BrandMark />
          <div>
            <h2 className="font-heading text-4xl leading-tight text-white">
              {sideTitle}
            </h2>
            <p className="mt-4 max-w-sm text-slate-200/85">{sideCopy}</p>
          </div>
          <p className="text-sm text-cyan-100/70">
            Security-first identity for modern products.
          </p>
        </aside>

        <main className="lg:col-span-3">
          <div className="theme-divider border-b border-white/10 p-6 lg:hidden">
            <BrandMark />
          </div>
          <div className="p-6 sm:p-10">
            <header className="mb-8">
              <h1 className="font-heading text-3xl text-white sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 text-slate-300">{subtitle}</p>
            </header>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthShell;
