import { Link, useSearchParams } from "react-router-dom";
import AuthShell from "../../components/layout/AuthShell";
import { Button, Card, StepIndicator } from "../../components";

function normalizeStatus(rawStatus) {
  switch (String(rawStatus || "").toLowerCase()) {
    case "approuve":
      return "approved";
    case "refuse":
      return "rejected";
    case "en_attente":
      return "pending_admin";
    default:
      return String(rawStatus || "pending_admin").toLowerCase();
  }
}

export default function StudentPending() {
  const [params] = useSearchParams();
  const status = normalizeStatus(params.get("status") || "pending_admin");

  const statusMessage =
    status === "pending_document"
      ? "Votre email est validé. Merci de téléverser votre document étudiant pour continuer."
      : status === "rejected"
        ? "Votre dossier a été refusé. Merci de contacter l'administration pour la suite."
        : "Notre équipe vérifie votre document. Vous recevrez une notification après décision.";

  return (
    <AuthShell
      title="Validation en cours"
      subtitle="Suivez l'état de votre dossier"
      stepIndicator={<StepIndicator current={5} total={5} label="En attente" />}
      footer={
        <Link to="/login" className="text-sm font-semibold text-brand-violet hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      <Card className="space-y-4 border border-slate-200">
        <p className="text-sm text-slate-700">{statusMessage}</p>

        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Actualiser le statut
          </Button>
          {status === "pending_document" ? (
            <Button as={Link} to="/student/onboarding/document-upload">
              Déposer un document
            </Button>
          ) : null}
        </div>
      </Card>
    </AuthShell>
  );
}

