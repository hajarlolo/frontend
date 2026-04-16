import { Link, useSearchParams } from "react-router-dom";
import AuthShell from "../../components/layout/AuthShell";
import { Badge, Button, Card, StepIndicator } from "../../components";
import { useAuth } from "../../hooks";

function getStatusLabel(status) {
  switch (status) {
    case "approved":
      return "Approuve";
    case "rejected":
      return "Refuse";
    case "pending_document":
      return "Document requis";
    case "pending_admin":
      return "Validation admin";
    case "pending_email":
      return "Verification email";
    default:
      return "En attente";
  }
}

function normalizeStatus(rawStatus) {
  switch (String(rawStatus || "").toLowerCase()) {
    case "valide":
    case "approuve":
      return "approved";
    case "refuse":
      return "rejected";
    case "en_attente":
      return "pending_admin";
    case "email_pending":
      return "pending_email";
    default:
      return String(rawStatus || "pending_admin").toLowerCase();
  }
}

export default function CompanyPending() {
  const [params] = useSearchParams();
  const { user } = useAuth();

  const rawStatus =
    params.get("status") || user?.verification_status || user?.statut || user?.status || user?.validation_status;
  const status = normalizeStatus(rawStatus);

  const statusLabel = getStatusLabel(status);

  return (
    <AuthShell
      title="Statut de validation entreprise"
      subtitle="Étape 4: suivez l'état de votre demande."
      stepIndicator={<StepIndicator current={4} total={4} label="Décision" />}
      footer={
        <Link to="/" className="text-sm font-semibold text-brand-violet hover:underline">
          Retour à l'accueil
        </Link>
      }
    >
      <Card className="space-y-4 border border-slate-200">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-700">Statut actuel</p>
          <div className="flex items-center gap-2">
            <Badge value={status} />
            <span className="text-xs font-medium text-slate-600">{statusLabel}</span>
          </div>
        </div>

        {status === "approved" ? (
          <p className="text-sm text-slate-700">
            Votre compte entreprise est validé. Vous pouvez accéder à votre tableau de bord.
          </p>
        ) : status === "rejected" ? (
          <p className="text-sm text-slate-700">
            Votre demande a été refusée. Merci de contacter l'administration pour plus de détails.
          </p>
        ) : status === "pending_document" ? (
          <p className="text-sm text-slate-700">
            Votre email est vérifié mais le dossier entreprise doit encore être complété.
          </p>
        ) : (
          <p className="text-sm text-slate-700">
            Votre compte est en cours de validation. Vous recevrez une notification dès qu'une décision sera prise.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {status === "approved" && (
            <Button as={Link} to="/company/dashboard">
              Aller au tableau de bord entreprise
            </Button>
          )}
        </div>
      </Card>
    </AuthShell>
  );
}

