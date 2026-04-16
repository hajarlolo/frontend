import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import AuthShell from "../../components/layout/AuthShell";
import { Button, Card, FileDropzone, StepIndicator } from "../../components";
import { uploadStudentVerificationDocument } from "../../services/endpoints";
import { api, ensureCsrfCookie, getApiErrorMessage } from "../../services/api";

const schema = z.object({
  verification_document: z.instanceof(File, { message: "Document obligatoire." }),
});

export default function StudentVerificationDocumentUpload() {
  const [params] = useSearchParams();
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const signedUploadUrl = params.get("upload_url");
  const isGuestFlow = Boolean(signedUploadUrl);

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

      if (!signedUploadUrl) {
        return uploadStudentVerificationDocument(formData);
      }

      await ensureCsrfCookie();

      const response = await api.post(signedUploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
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
    formData.append("verification_document", values.verification_document);
    mutation.mutate(formData);
  };

  return (
    <AuthShell
      title="Vérification de votre statut étudiant"
      subtitle="Étape 3: importez votre justificatif étudiant."
      stepIndicator={<StepIndicator current={3} total={4} label="Document" />}
      footer={
        <Link to={isGuestFlow ? "/verify-email" : "/student/profile-setup"} className="text-sm font-semibold text-brand-violet hover:underline">
          Retour
        </Link>
      }
    >
      <Card className="space-y-4">
        <div className="rounded-xl bg-brand-violet/5 p-4 text-sm text-slate-700">
          <p className="font-semibold text-brand-violet">Le document doit contenir :</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Nom complet de l'étudiant</li>
            <li>Nom de l'université / école</li>
            <li>Année académique ou date d'inscription récente (moins de 3 mois)</li>
          </ul>
        </div>

        {successMessage ? (
          <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <p>{successMessage}</p>
            <div className="flex flex-wrap gap-2">
              <Button as={Link} to="/" variant="primary">
                Retour à l'accueil
              </Button>
              <Button as={Link} to="/login" variant="ghost">
                Se déconnecter
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
                  label="Carte étudiant ou attestation"
                  file={field.value}
                  onChange={(file) => field.onChange(file)}
                  error={errors.verification_document?.message}
                  hint="Formats: PNG, JPG, PDF"
                />
              )}
            />

            <Button type="submit" className="w-full" loading={mutation.isPending} disabled={!isValid}>
              Envoyer le document
            </Button>

            {submitError ? <p className="text-sm text-rose-700">{submitError}</p> : null}
          </form>
        )}
      </Card>
    </AuthShell>
  );
}

