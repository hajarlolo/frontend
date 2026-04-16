import { FiZap } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function AuthShell({ title, subtitle, children, footer, stepIndicator, maxWidth = "max-w-[520px]" }) {
  return (
    <div
      className="min-h-screen relative flex bg-cover bg-center transition-colors duration-500"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      {/* The Shadow overlay from the right */}
      <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-l 
        from-slate-900/80 via-slate-900/60 to-slate-900/20 
        pointer-events-none"
      ></div>

      {/* Main Layout Container */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row max-w-[1600px] mx-auto">

        {/* Left Side: Branding and Hero Text */}
        <div className="hidden lg:flex w-full lg:w-1/2 flex-col justify-center p-12 lg:pl-24 xl:pl-32 text-white">
          <Link to="/" className="inline-flex items-center gap-3 mb-10 group transition-transform hover:scale-105">
            <div className="w-14 h-14 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-premium group-hover:rotate-12 transition-transform duration-500">
              <FiZap className="text-white w-8 h-8" />
            </div>
            <span className="text-4xl font-black text-white tracking-tight drop-shadow-lg">TalentLink</span>
          </Link>

          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
            L'avenir du <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandMagenta to-brandViolet filter drop-shadow-md">recrutement</span><br /> commence ici.
          </h1>
          <p className="text-xl font-medium text-white/90 max-w-lg leading-relaxed drop-shadow-md">
            Rejoignez la plateforme d'excellence connectant les étudiants et lauréats ambitieux avec les entreprises leaders du marché.
          </p>
        </div>

        {/* Right Side: Auth Form Container */}
        <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-center items-center lg:items-end p-6 lg:p-12 lg:pr-12 xl:pr-24">

          {/* Mobile Brand Logo Link */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 group transition-transform hover:scale-105">
            <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center shadow-premium group-hover:rotate-12 transition-transform duration-500">
              <FiZap className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight drop-shadow-md">TalentLink</span>
          </Link>

          {/* Form Box */}
          <div className={`w-full ${maxWidth} relative group`}>
            {/* Ambient blur behind the form box */}
            <div className="absolute -inset-1 bg-brand-gradient rounded-[34px] blur-lg opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>

            <div className="p-8 md:p-10 border border-white/20 dark:border-white/10 shadow-2xl relative overflow-hidden bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-[32px] transition-all duration-500">

              <header className="mb-6 space-y-1.5">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors drop-shadow-sm">{title}</h2>
                {subtitle ? <p className="text-slate-600 dark:text-slate-400 font-medium text-sm leading-relaxed">{subtitle}</p> : null}
                {stepIndicator ? (
                  <div className="pt-3">
                    {stepIndicator}
                  </div>
                ) : null}
              </header>

              <main className="space-y-6">
                {children}
              </main>

              {footer ? (
                <footer className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/10 text-center">
                  {footer}
                </footer>
              ) : null}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
