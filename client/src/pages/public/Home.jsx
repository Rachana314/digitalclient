import { useEffect } from "react";

import homecensus from "../../assets/censushome.png";
import howItWorksImg from "../../assets/howitworks.png";
import contactImg from "../../assets/contactillustration.png";
import householdImg from "../../assets/household.png";
import familyImg from "../../assets/family.png";
import updateImg from "../../assets/updates.png";
import secureImg from "../../assets/secure.png";
import statusImg from "../../assets/status.png";
import noticesImg from "../../assets/notices.png";
import privacyImg from "../../assets/privacy.png";

function SectionTitle({ title, desc }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-brandBlack">{title}</h2>
      {desc ? (
        <p className="mt-2 text-sm sm:text-base text-black/60 max-w-2xl">{desc}</p>
      ) : null}
    </div>
  );
}

function Card({ title, desc }) {
  return (
    <div className="rounded-3xl bg-white border border-black/10 p-6 hover:shadow-sm transition">
      <p className="font-extrabold text-brandBlack">{title}</p>
      <p className="mt-2 text-sm text-black/60">{desc}</p>
      <button
        type="button"
        className="mt-4 text-sm font-extrabold text-brandRed hover:text-brandOrange transition"
      >
        Learn more →
      </button>
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;

    els.forEach((el) => el.classList.add("is-visible"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -10% 0px" }
    );

  
    els.forEach((el) => {
      el.classList.remove("is-visible");
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return (
    <div className="w-full">
      <section id="home" className="scroll-mt-24">
        <div className="w-full px-4 pt-6 pb-14">
          <div
            className="relative overflow-hidden rounded-[42px] min-h-[580px] sm:min-h-[660px] lg:min-h-[760px] border border-black/10"
            style={{
              backgroundImage: `url(${homecensus})`,
              backgroundSize: "cover",
              backgroundPosition: "center right",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />

            <div className="relative h-full flex items-center">
              <div className="max-w-6xl mx-auto w-full px-6 sm:px-10 lg:px-12 py-12">
                <h1 className="mt-6 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white max-w-2xl">
                  Digital Census
                  <br />
                  for Citizen Services.
                </h1>

                <p className="mt-5 text-white/90 text-sm sm:text-base max-w-xl">
                  Verified citizen information and digital service delivery — faster access, clear
                  tracking, and trusted data management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brandBlack">Services</h2>
            <div className="mx-auto mt-3 h-[3px] w-44 rounded-full bg-brandOrange" />
            <p className="mt-4 text-sm sm:text-base text-black/60">
              Digital household census services — submit, update, track status, and receive notices
              securely.
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {[
              {
                title: "Household Information Submission",
                desc: "Submit complete household details online through a single form instead of visiting the ward office multiple times.",
                points: ["One form submission", "Easy household details", "Faster processing"],
                img: householdImg,
              },
              {
                title: "Add & Manage Family Members",
                desc: "Enter details of all household members, including name, age, gender, and relationship.",
                points: ["Add members", "Manage relationship", "Update anytime"],
                img: familyImg,
              },
              {
                title: "Update or Correct Information",
                desc: "Request updates for changes like birth, death, migration, or correction of mistakes.",
                points: ["Correction requests", "Change support", "Accuracy maintained"],
                img: updateImg,
              },
              {
                title: "Secure Record Storage",
                desc: "After verification by the admin, household data is stored digitally to reduce risk of loss or damage.",
                points: ["Admin verified", "Digital storage", "Safer records"],
                img: secureImg,
              },
              {
                title: "Status Tracking",
                desc: "Track whether your submitted census data is pending review, verified, or locked by the admin.",
                points: ["Pending review", "Verified status", "Locked by admin"],
                img: statusImg,
              },
              {
                title: "Receive Notices & Updates",
                desc: "View important announcements and census-related notices published by the ward/municipality.",
                points: ["Official notices", "Announcements", "Latest updates"],
                img: noticesImg,
              },
              {
                title: "Privacy & Secure Access",
                desc: "User data is protected and access is restricted to authorized officials only.",
                points: ["Secure access", "Role-based control", "Privacy protection"],
                img: privacyImg,
              },
            ].map((s, idx) => {
              const reverse = idx % 2 === 1;

              return (
                <div
                  key={s.title}
                  data-reveal
                  className={`reveal grid gap-8 items-center lg:grid-cols-2 ${
                    reverse ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute -inset-6 rounded-full bg-brandBg" />
                      <img
                        src={s.img}
                        alt={s.title}
                        className="relative w-[220px] sm:w-[260px] lg:w-[280px] h-auto animate-float hover:scale-[1.04] transition duration-300"
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-brandBlack">{s.title}</h3>
                    <p className="mt-2 text-sm sm:text-base text-black/60">{s.desc}</p>

                    <ul className="mt-5 space-y-2">
                      {s.points.map((p) => (
                        <li key={p} className="flex gap-2 text-sm sm:text-base text-black/70">
                          <span className="mt-[7px] h-2 w-2 rounded-full bg-brandOrange" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Animations */}
        <style>{`
          @keyframes floaty {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: floaty 3.2s ease-in-out infinite;
          }

          .reveal {
            opacity: 0;
            transform: translateY(22px);
            transition: opacity 700ms ease, transform 700ms ease;
          }
          .reveal.is-visible {
            opacity: 1;
            transform: translateY(0px);
          }
        `}</style>
      </section>

      {/* HOW IT WORKS */}
      <section id="howitworks" className="scroll-mt-24 bg-white border-y border-black/10">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brandBlack">How it works</h2>
            <p className="mt-3 text-sm sm:text-base text-black/60">
              Simple process: register, verify, and use services with clear tracking.
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <img
              src={howItWorksImg}
              alt="How it works"
              className="w-full max-w-5xl h-auto rounded-xl border border-black/10 shadow-md"
            />
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              [
                "Register",
                "Create an account by filling in your essential personal and contact details to set up secure access to the platform.",
              ],
              [
                "Verification",
                "Your submitted information is carefully checked and validated to ensure accuracy, prevent errors, and protect against misuse.",
              ],
              [
                "Use Services",
                "Once verified, you can apply for available services, track the status of your requests, and download results or documents when they are ready.",
              ],
            ].map(([t, d]) => (
              <div
                key={t}
                className="rounded-2xl border p-6 bg-brandBg text-center transition hover:shadow-md"
                style={{ borderColor: "var(--color-brandOrange)" }}
              >
                <p className="font-extrabold text-brandBlack text-lg">{t}</p>
                <p className="mt-2 text-sm text-black/60">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section id="news" className="scroll-mt-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">

          {/* Centered Title */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brandBlack hover:text-brandOrange transition">
              News & Updates
            </h2>
            <div className="mx-auto mt-4 h-[3px] w-32 rounded-full bg-brandRed" />
            <p className="mt-4 text-black/60">
              Notices, announcements, and important updates related to the Digital Census system.
            </p>
          </div>

          {/* News Cards */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {[
              {
                title: "System Maintenance Notice",
                desc: "Scheduled system upgrades will take place this weekend to improve performance, reliability, and security.",
              },
              {
                title: "New Services Coming Soon",
                desc: "Additional citizen services will be gradually introduced to make digital access easier and more efficient.", 
              },
              {
                title: "Improved Verification Process",
                desc: "Updates to the verification system will reduce processing delays and increase accuracy of citizen data.",
              },
              {
                title: "Security Enhancements Released",
                desc: "New security controls and monitoring tools have been added to better protect user information.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-3xl bg-white border border-black/10 p-6 transition hover:-translate-y-1 hover:shadow-lg hover:border-brandOrange"
              >
                <p className="text-xs font-semibold text-brandBlue">{item.date}</p>

                <h3 className="mt-2 text-lg font-extrabold text-brandBlack group-hover:text-brandOrange transition">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm text-black/60 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


  
    {/* PRIVACY */}
<section id="privacy" className="scroll-mt-24 bg-white border-y border-black/10">
  <div className="max-w-4xl mx-auto px-4 py-16">

    {/* Centered Title */}
    <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-brandBlack hover:text-brandOrange transition">
      Privacy Policy
    </h2>
    <div className="mx-auto mt-4 h-[3px] w-32 rounded-full bg-brandRed" />

    <p className="mt-6 text-center text-black/60">
      The Digital Census system is committed to protecting citizen data and ensuring secure,
      responsible, and transparent use of personal information.
    </p>

    {/* Policy Points */}
    <div className="mt-12 space-y-6 text-black/70 text-sm sm:text-base leading-relaxed">

      <div className="flex gap-3">
        <span className="mt-2 h-2 w-2 rounded-full bg-brandOrange shrink-0" />
        <p>
          We collect only the necessary information required for digital census services,
          including household details, family member data, and contact information.
        </p>
      </div>

      <div className="flex gap-3">
        <span className="mt-2 h-2 w-2 rounded-full bg-brandOrange shrink-0" />
        <p>
          Your data is used strictly for service delivery, verification, status tracking,
          and supporting local government planning and development.
        </p>
      </div>

      <div className="flex gap-3">
        <span className="mt-2 h-2 w-2 rounded-full bg-brandOrange shrink-0" />
        <p>
          Strong security measures, including secure servers, encryption, and monitoring
          systems, are applied to protect your information from unauthorized access or misuse.
        </p>
      </div>

      <div className="flex gap-3">
        <span className="mt-2 h-2 w-2 rounded-full bg-brandOrange shrink-0" />
        <p>
          Access to personal data is restricted to authorized government officials based
          on their roles and responsibilities.
        </p>
      </div>

      <div className="flex gap-3">
        <span className="mt-2 h-2 w-2 rounded-full bg-brandOrange shrink-0" />
        <p>
          Personal information is not shared with third parties except authorized government
          bodies or when required by law.
        </p>
      </div>

      <div className="flex gap-3">
        <span className="mt-2 h-2 w-2 rounded-full bg-brandOrange shrink-0" />
        <p>
          Citizens have the right to request corrections, updates, and track the status of
          their submitted information through official channels.
        </p>
      </div>

      <div className="flex gap-3">
        <span className="mt-2 h-2 w-2 rounded-full bg-brandOrange shrink-0" />
        <p>
          Information is securely stored as official government records and retained according
          to national data management policies.
        </p>
      </div>

      <div className="flex gap-3">
        <span className="mt-2 h-2 w-2 rounded-full bg-brandOrange shrink-0" />
        <p>
          We are committed to maintaining the confidentiality, integrity, and availability of
          all digital census data through controlled and monitored systems.
        </p>
      </div>

      <div className="flex gap-3">
        <span className="mt-2 h-2 w-2 rounded-full bg-brandOrange shrink-0" />
        <p>
          For privacy-related questions or concerns, please contact your local municipality
          office or the official helpdesk support.
        </p>
      </div>

    </div>
  </div>
</section>



        {/* CONTACT */}
        <section
          id="contact"
          className="scroll-mt-24 relative overflow-hidden"
          style={{
            backgroundImage: `url(${contactImg})`,
            backgroundSize: "cover",
            backgroundPosition: "left center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />

          <div className="relative max-w-6xl mx-auto px-4 py-20">
            <div className="lg:ml-auto lg:max-w-xl">
              <h2 className="mt-2 text-3xl sm:text-5xl font-extrabold text-brandBlack">
                Get Support From Here!.
              </h2>

              <div className="mt-4 h-[4px] w-full rounded-full bg-gradient-to-r from-brandBlue to-brandRed" />

              <div className="mt-10 space-y-8">
                {/* Phone */}
                <div className="flex gap-4 items-start">
                  <div className="h-12 w-12 rounded-full bg-white shadow border border-black/10 flex items-center justify-center">
                    <span className="text-xl">📞</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-brandBlack">Call us</p>
                    <p className="text-black/60">021-555231</p>
                  </div>
                </div>

                {/* Email - FIXED POPUP */}
                <div className="flex gap-4 items-start">
                  <div className="h-12 w-12 rounded-full bg-white shadow border border-black/10 flex items-center justify-center">
                    <span className="text-xl">✉️</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-brandBlack">Email</p>
                    <button 
                      onClick={() => {
                        window.open(
                          "https://mail.google.com/mail/?view=cm&fs=1&to=digitalcensus4@gmail.com",
                          "GmailCompose",
                          "width=600,height=700,left=300,top=100"
                        );
                      }}
                      className="text-black/60 hover:text-brandBlue transition-colors text-left"
                    >
                      digitalcensus4@gmail.com
                    </button>
                  </div>
                </div>

                {/* Location */}
                <div className="flex gap-4 items-start">
                  <div className="h-12 w-12 rounded-full bg-white shadow border border-black/10 flex items-center justify-center">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-brandBlack">Location</p>
                    <p className="text-black/60">PathariSanishchare 9,Morang</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}
