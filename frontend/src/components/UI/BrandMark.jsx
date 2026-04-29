import React from "react";

const BrandMark = ({ compact = false }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-cyan-300/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(34,211,238,0.7),transparent_62%)]" />
        <span className="relative text-lg font-black tracking-tight text-cyan-200">
          AN
        </span>
      </div>
      {!compact ? (
        <div>
          <p className="font-heading text-lg leading-none text-white">
            AuthNova
          </p>
          <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-200/70">
            Trust Refined
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default BrandMark;
