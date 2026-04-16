import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthShell from "../../components/layout/AuthShell";
import { Button, Card, FileDropzone, StepIndicator } from "../../components";
import { uploadVerificationDocument } from "../../services/endpoints";
import { getApiErrorMessage } from "../../services/api";

const schema = z.object({
  verification_document: z.instanceof(File, { message: "Document obligatoire." }),
});

export default function UnifiedDocumentUpload() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const email = params.get("email") || sessionStorage.getItem("verification_email");
  const role = params.get("role") || "student";

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      verification_document: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData) => {
      setSubmitError("");
      setSuccessMessage("");
      // Append email to formData because it's required by the backend endpoint
      formData.append("email", email);
      return uploadVerificationDocument(formData);
    },
    onSuccess: () => {
      setSuccessMessage(
        "Votre document a été envoyé avec succès. Votre compte est maintenant en attente de validation par l'administrateur."
      );
    },
    onError: (error) => {
      setSubmitError(
        getApiErrorMessage(
          error,
          "Une erreur est survenue pendant l'envoi. Merci de réessayer."
        )
      );
    },
  });

  const onSubmit = (values) => {
    const formData = new FormData();
    formData.append("document", values.verification_document);
    mutation.mutate(formData);
  };

  const isCompany = role === "company";

  return (
    <AuthShell
      title={isCompany ? "Vérification Entreprise" : "Vérification Étudiant"}
      subtitle={isCompany ? "Étape 3: téléchargez votre ICE ou Registre de Commerce." : "Étape 3: importez votre justificatif étudiant."}
      stepIndicator={<StepIndicator current={3} total={4} label="Document" />}
      footer={
        <Link to="/login" className="text-sm font-semibold text-brand-violet hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      <Card className="space-y-4">
        <div className="rounded-xl bg-brand-violet/5 p-4 text-sm text-slate-700">
          <p className="font-semibold text-brand-violet">Le document doit être :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            {isCompany ? (
              <>
                <li>Un document officiel (ICE, RC ou statut)</li>
                <li>Lisible et bien cadré</li>
                <li>Format PDF ou Image (JPG, PNG)</li>
              </>
            ) : (
              <>
                <li>Une carte étudiant ou certificat d'immatriculation</li>
                <li>Année académique en cours visible</li>
                <li>Format PDF ou Image (JPG, PNG)</li>
              </>
            )}
          </ul>
        </div>

        {successMessage ? (
          <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <p className="font-medium">{successMessage}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate("/login")} variant="primary" className="w-full">
                Aller à la connexion
              </Button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              control={control}
              name="verification_document"
              render={({ field }) => (
                <FileDropzone
                  label={isCompany ? "Justificatif d'existence (ICE/RC)" : "Carte étudiant ou attestation"}
                  file={field.value}
                  onChange={(file) => field.onChange(file)}
                  error={errors.verification_document?.message}
                  hint="Formats: PNG, JPG, PDF (max 5Mo)"
                />
              )}
            />

            <Button type="submit" className="w-full" loading={mutation.isPending} disabled={!isValid}>
              Envoyer le document
            </Button>

            {submitError ? <p className="text-sm text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100">{submitError}</p> : null}
          </form>
        )}
      </Card>
    </AuthShell>
  );
}
