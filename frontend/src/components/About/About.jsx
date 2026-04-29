/**
 * About Page Component
 * Shows project details, team info, and teacher info
 * Only accessible to authenticated users
 */

import React from "react";
import BrandMark from "../UI/BrandMark";
import Card from "../UI/Card";

const About = () => {
  const teamMembers = [
    {
      image: "/r.jpg",
      name: "Ehsanul Haque",
      role: "Team Lead",
      bio: "Full-stack developer focusing on authentication flow, architecture, and deployment readiness.",
    },
    {
      image: "/team-member-1.svg",
      name: "Team Mate One",
      role: "Frontend Developer",
      bio: "Designed responsive interfaces, reusable components, and polished user interactions.",
    },
    {
      image: "/team-member-2.svg",
      name: "Team Mate Two",
      role: "Security Engineer",
      bio: "Implemented encryption protocols, rate limiting, CSRF defense, and suspicious login alerts.",
    },
  ];

  return (
    <div className="relative min-h-screen px-4 py-20 overflow-hidden sm:px-8">
      <div className="absolute inset-0 nova-grid-bg" />
      <div className="absolute w-64 h-64 rounded-full pointer-events-none -left-24 top-10 bg-cyan-300/20 blur-3xl" />
      <div className="absolute rounded-full pointer-events-none -right-16 bottom-14 h-72 w-72 bg-emerald-300/20 blur-3xl" />

      <div className="relative max-w-6xl mx-auto animate-rise">
        <div className="flex justify-center mb-12">
          <BrandMark />
        </div>

        {/* About Section */}
        <section className="grid gap-6 mb-10 lg:grid-cols-3 scroll-mt-24">
          <Card className="lg:col-span-2 border-cyan-200/20 bg-slate-950/45 p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">
              About This Project
            </p>
            <h2 className="mt-3 text-4xl text-white font-heading">
              About AuthNova
            </h2>
            <p className="max-w-3xl mt-5 text-lg leading-relaxed text-slate-300">
              AuthNova is a full-stack secure authentication platform focused on
              real-world security patterns, modern UI design, and
              production-ready user experience. This project demonstrates JWT
              auth, 2FA, account lock control, reset flow, and suspicious login
              tracking in one complete system.
            </p>

            <div className="grid gap-4 mt-8 md:grid-cols-2">
              <div className="p-4 border rounded-2xl border-white/10 bg-black/25">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">
                  Tech Stack
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  <li>✨ React 18 + Vite (Frontend)</li>
                  <li>🛠️ Node.js + Express (Backend)</li>
                  <li>🔐 JWT + Bcrypt (Security)</li>
                  <li>📱 MongoDB (Database)</li>
                </ul>
              </div>

              <div className="p-4 border rounded-2xl border-white/10 bg-black/25">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">
                  Key Features
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  <li>🔐 Two-Factor Authentication</li>
                  <li>📧 Email Verification</li>
                  <li>🚨 Suspicious Login Alerts</li>
                  <li>🌓 Dark/Light Theme</li>
                </ul>
              </div>
            </div>

            <div className="p-4 mt-6 border rounded-2xl border-white/10 bg-black/25">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">
                Submitted By
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Project:{" "}
                <span className="font-semibold text-cyan-200">
                  AuthNova - Trust Refined
                </span>
              </p>
            </div>
          </Card>

          {/* Teacher Card */}
          <Card className="border-amber-200/20 bg-slate-950/45 p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-200/90">
              Submitted To
            </p>
            <div className="p-4 mt-4 overflow-hidden border rounded-2xl border-white/15 bg-black/20">
              <img
                src="/t.jpg"
                alt="Teacher"
                className="object-cover w-full h-40 rounded-xl ring-2 ring-amber-300/40"
              />
              <h3 className="mt-4 text-lg font-semibold text-white">
                Jahid Tanvir
              </h3>
              <p className="text-sm text-amber-200/90">Lecturer</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Mentor for software engineering and secure web application
                architecture, guiding this project on best practices.
              </p>
            </div>
          </Card>
        </section>

        {/* Team Members Section */}
        <section>
          <Card className="border-cyan-200/20 bg-slate-950/45 p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">
              Meet The Team
            </p>
            <h3 className="mt-3 text-3xl text-white font-heading">Team Mates</h3>

            <div className="grid gap-4 mt-6 md:grid-cols-2 xl:grid-cols-3">
              {teamMembers.map((member) => (
                <article
                  key={member.name}
                  className="p-4 transition-transform duration-300 border rounded-2xl border-white/10 bg-black/25 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="flex-shrink-0 object-cover w-16 h-16 rounded-xl ring-2 ring-cyan-300/35"
                    />

                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {member.name}
                      </h3>
                      <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/80">
                        {member.role}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default About;
