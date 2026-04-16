import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import AuthShell from "../../components/layout/AuthShell";
import { Button, Card, Input, StepIndicator } from "../../components";
import { getApiErrorMessage } from "../../services/api";
import { resendVerificationEmail, verifyEmailCode } from "../../services/endpoints";

export default function EmailVerification() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [resendMessage, setResendMessage] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");

  const email = params.get("email") || sessionStorage.getItem("verification_email");
  const role = params.get("role") || "student";

  const verifyMutation = useMutation({
    mutationFn: verifyEmailCode,
    onSuccess: (data) => {
      // Step 3: Success email verification -> Proceed to document upload
      navigate(`/verification/document-upload?role=${role}&email=${encodeURIComponent(email)}`, { replace: true });
    },
    onError: (error) => {
      setVerificationError(getApiErrorMessage(error, "Code de vérification invalide."));
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendVerificationEmail,
    onSuccess: (data) => {
      setResendMessage(data.message || "Email de vérification renvoyé.");
    },
    onError: (error) => {
      setResendMessage(getApiErrorMessage(error, "Impossible de renvoyer l’email."));
    },
  });

  const handleVerify = (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError("Le code doit contenir 6 chiffres.");
      return;
    }
    setVerificationError("");
    verifyMutation.mutate({ email, code: verificationCode });
  };

  const handleResend = () => {
    if (resendMutation.isPending) return;
    setResendMessage("");
    if (!email) {
      setResendMessage("Email introuvable. Merci de recommencer l'inscription.");
      return;
    }
    resendMutation.mutate({ email });
  };

  return (
    <AuthShell
      title="Vérifiez votre email"
      subtitle="Saisissez le code de 6 chiffres envoyé à votre adresse email."
      stepIndicator={<StepIndicator current={2} total={4} label="Vérification email" />}
      footer={
        <Link to="/login" className="text-sm font-semibold text-brand-violet hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      <Card className="space-y-4 border border-brand-violet/10 bg-brand-violet/5">
        <p className="text-sm text-slate-700">
          Un email de vérification a été envoyé à <span className="font-bold">{email}</span>.
        </p>

        <form onSubmit={handleVerify} className="space-y-4 pt-2">
          <Input
            label="Code de vérification (6 chiffres)"
            placeholder="000000"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
            error={verificationError}
            required
          />
          <Button 
            type="submit" 
            className="w-full" 
            variant="primary"
            loading={verifyMutation.isPending}
          >
            Vérifier le code
          </Button>
        </form>

        <div className="pt-2 border-t border-slate-100">
          <Button
            variant="ghost"
            className="w-full text-xs"
            onClick={handleResend}
            loading={resendMutation.isPending}
            disabled={resendMutation.isPending || !email}
          >
            Je n'ai pas reçu l'email. Renvoyer.
          </Button>

          {resendMessage ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              {resendMessage}
            </div>
          ) : null}
        </div>
      </Card>
    </AuthShell>
  );
}
