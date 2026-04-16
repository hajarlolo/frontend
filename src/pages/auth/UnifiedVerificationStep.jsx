import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import AuthShell from "../../components/layout/AuthShell";
import { Button, Card, Input, FileDropzone, StepIndicator } from "../../components";
import { submitStep3, resendVerificationEmail } from "../../services/endpoints";
import { getApiErrorMessage } from "../../services/api";

export default function UnifiedVerificationStep() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  
  const [verificationCode, setVerificationCode] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  
  const [errorStatus, setErrorStatus] = useState("");
  const [step, setStep] = useState(1); // 1: Input, 2: Success/Review

  const rawEmail = params.get("email") || sessionStorage.getItem("verification_email");
  const email = (rawEmail && rawEmail !== "undefined") ? rawEmail : "";
  const role = params.get("role") || "student";
  const initialStatus = params.get("status");

  useEffect(() => {
    if (initialStatus === "pending") {
      setStep(2);
    }
  }, [initialStatus]);

  const isCompany = role === "company";
  const isLaureat = role === "laureat";

  const mutation = useMutation({
    mutationFn: async () => {
      setErrorStatus("");
      if (!verificationCode || verificationCode.length !== 6) {
        throw new Error("Le code de vérification doit contenir 6 chiffres.");
      }
      if (!documentFile) {
        throw new Error("Veuillez sélectionner un document justificatif.");
      }
      
      const formData = new FormData();
      formData.append("email", email);
      formData.append("code", verificationCode);
      formData.append("document", documentFile);
      
      return submitStep3(formData);
    },
    onSuccess: () => {
      setStep(2);
    },
    onError: (error) => {
      setErrorStatus(getApiErrorMessage(error, error.message));
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendVerificationEmail,
    onSuccess: () => alert("Un nouveau code a été envoyé."),
    onError: (e) => alert(getApiErrorMessage(e, "Échec de l'envoi.")),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (step === 2) {
    return (
      <AuthShell
        title="Vérification en cours"
        subtitle="Votre compte est en attente de validation."
        stepIndicator={<StepIndicator current={3} total={3} label="Vérification" />}
      >
        <Card className="space-y-6 border-brand-violet/10 bg-brand-violet/5">
          <div className="flex justify-center">
            <div className="rounded-full bg-brand-violet/10 p-4 text-brand-violet">
               <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-black text-slate-900 leading-tight">Dossier sous examen</h3>
            <p className="mt-4 text-sm font-medium text-slate-600 leading-relaxed">
              Nous avons bien reçu votre code et votre document. Un administrateur va les vérifier. 
              Vous recevrez un email dès que votre accès sera activé.
            </p>
          </div>
          <Button onClick={() => navigate("/login")} variant="primary" className="w-full h-12 shadow-lg">
            Retour à la connexion
          </Button>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Vérification du compte"
      subtitle="Étape 3 sur 3 - Validation de votre identité"
      stepIndicator={<StepIndicator current={3} total={3} label="Vérification" />}
      footer={
        <Link to="/login" className="text-sm font-semibold text-brand-violet hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-2xl border border-brand-violet/10 bg-brand-violet/5 p-4">
          <p className="text-sm font-medium text-slate-700 leading-relaxed">
            Un email a été envoyé à l'adresse <span className="font-bold text-brand-violet">{email}</span> pour confirmer votre code de vérification.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Code de vérification (6 chiffres)"
            placeholder="000000"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
            required
            hint={
              <button 
                type="button" 
                onClick={() => resendMutation.mutate({ email })}
                className="text-[10px] font-bold text-brand-violet uppercase tracking-wider hover:underline"
                disabled={resendMutation.isPending}
              >
                Renvoyer le code
              </button>
            }
          />

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
                {isCompany ? "Registre de commerce (RC)" : isLaureat ? "Diplôme ou preuve d'activité" : "Bulletin ou attestation scolaire"}
            </label>
            <p className="text-[11px] text-slate-500 font-medium italic">
                {isCompany 
                  ? "Nous avons besoin de votre registre de commerce pour valider votre entreprise."
                  : isLaureat 
                    ? "Fournissez une copie de votre diplôme ou justificatif de travail."
                    : "Fournissez tout document officiel avec votre nom, année et université."}
            </p>
            <FileDropzone
                file={documentFile}
                onChange={setDocumentFile}
                hint="Formats acceptés: PDF, JPG, PNG (max 5Mo)"
            />
          </div>
        </div>

        {!email && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 font-medium">
             Nous n'avons pas pu identifier votre adresse email. 
             Veuillez retourner à l'étape précédente ou vous connecter.
          </div>
        )}

        {errorStatus && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-medium whitespace-pre-wrap">
            {errorStatus}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full h-12 shadow-xl shadow-brand-violet/20" 
          loading={mutation.isPending}
          disabled={!verificationCode || !documentFile || !email}
        >
          Confirmer et Envoyer
        </Button>
      </form>
    </AuthShell>
  );
}
