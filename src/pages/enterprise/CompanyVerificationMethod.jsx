import { IoArrowBack, IoDocumentTextOutline, IoMailOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AuthShell from "../../components/layout/AuthShell";
import { Button, Card, StepIndicator } from "../../components";
import { readCompanyDraft } from "../../utils/onboarding";

export default function CompanyVerificationMethod() {
  const navigate = useNavigate();
  const draft = readCompanyDraft();

  useEffect(() => {
    if (!draft) {
      navigate("/register/company", { replace: true });
    }
  }, [draft, navigate]);

  if (!draft) return null;

  return (
    <AuthShell
      title="Vérifiez votre entreprise"
      subtitle="Étape 2: choisissez votre méthode de vérification."
      stepIndicator={<StepIndicator current={2} total={4} label="Méthode" />}
      footer={
        <Link to="/register/company" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-violet hover:underline">
          <IoArrowBack />
          Retour
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border border-slate-200 p-0">
          <button
            type="button"
            onClick={() => navigate("/company/verify-email")}
            className="w-full rounded-2xl p-5 text-left transition hover:bg-brand-violet/5"
          >
            <div className="mb-3 inline-flex rounded-xl bg-brand-violet/10 p-2 text-brand-violet">
              <IoMailOutline size={20} />
            </div>
            <h3 className="text-base font-bold text-brand-violet">Email professionnel</h3>
            <p className="mt-1 text-sm text-slate-600">
              Vérification via un code à 6 chiffres envoyé par email.
            </p>
          </button>
        </Card>

        <Card className="border border-slate-200 p-0">
          <button
            type="button"
            onClick={() => navigate("/company/upload-rc")}
            className="w-full rounded-2xl p-5 text-left transition hover:bg-brand-magenta/5"
          >
            <div className="mb-3 inline-flex rounded-xl bg-brand-magenta/10 p-2 text-brand-magenta">
              <IoDocumentTextOutline size={20} />
            </div>
            <h3 className="text-base font-bold text-brand-magenta">Registre de commerce (RC)</h3>
            <p className="mt-1 text-sm text-slate-600">
              Importez votre document RC pour vérification administrative.
            </p>
          </button>
        </Card>
      </div>

      <div className="mt-5 flex justify-end">
        <Button variant="ghost" onClick={() => navigate("/register/company")}>Modifier les informations</Button>
      </div>
    </AuthShell>
  );
}

