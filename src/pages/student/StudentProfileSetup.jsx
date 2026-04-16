import { IoDocumentTextOutline, IoPencilOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import AuthShell from "../../components/layout/AuthShell";
import { Card, StepIndicator } from "../../components";

export default function StudentProfileSetup() {
  return (
    <AuthShell
      title="Complétez votre profil"
      subtitle="Étape 3: choisissez comment renseigner votre profil étudiant."
      stepIndicator={<StepIndicator current={3} total={5} label="Profil" />}
      footer={
        <Link to="/verify-email?role=student" className="text-sm font-semibold text-brand-violet hover:underline">
          Retour
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border border-slate-200 p-0">
          <Link
            to="/student/upload-cv"
            className="block rounded-2xl p-5 transition hover:bg-brand-violet/5"
          >
            <div className="mb-3 inline-flex rounded-xl bg-brand-violet/10 p-2 text-brand-violet">
              <IoDocumentTextOutline size={20} />
            </div>
            <h3 className="text-base font-bold text-brand-violet">Importer un CV (recommandé)</h3>
            <p className="mt-1 text-sm text-slate-600">
              Upload rapide d'un CV PDF pour pré-remplir votre profil.
            </p>
          </Link>
        </Card>

        <Card className="border border-slate-200 p-0">
          <Link
            to="/student/profile-form"
            className="block rounded-2xl p-5 transition hover:bg-brand-magenta/5"
          >
            <div className="mb-3 inline-flex rounded-xl bg-brand-magenta/10 p-2 text-brand-magenta">
              <IoPencilOutline size={20} />
            </div>
            <h3 className="text-base font-bold text-brand-magenta">Remplir manuellement</h3>
            <p className="mt-1 text-sm text-slate-600">
              Saisissez vos informations, formations, expériences et projets.
            </p>
          </Link>
        </Card>
      </div>
    </AuthShell>
  );
}

