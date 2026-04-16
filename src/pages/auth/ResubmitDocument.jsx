import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import AuthShell from "../../components/layout/AuthShell";
import { Button, Card, FileDropzone } from "../../components";
import { uploadVerificationDocument, fetchVerificationStatus } from "../../services/endpoints";
import { getApiErrorMessage } from "../../services/api";
import { useAuth } from "../../hooks";

const schema = z.object({
  verification_document: z.instanceof(File, { message: "Document obligatoire." }),
});

export default function ResubmitDocument() {
  const { user, logout } = useAuth();
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { data: statusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["verification-status", user?.email],
    queryFn: () => fetchVerificationStatus(user?.email),
    enabled: !!user?.email,
  });

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
      formData.append("email", user?.email);
      return uploadVerificationDocument(formData);
    },
    onSuccess: () => {
      setSuccessMessage(
        "Votre nouveau document a été envoyé avec succès. Un administrateur va le vérifier prochainement."
      );
    },
    onError: (error) => {
      setSubmitError(
        getApiErrorMessage(error, "Une erreur est survenue pendant l'envoi.")
      );
    },
  });

  const onSubmit = (values) => {
    const formData = new FormData();
    formData.append("document", values.verification_document);
    mutation.mutate(formData);
  };

  if (isLoadingStatus) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <AuthShell
      title="Révision de votre dossier"
      subtitle="Un administrateur a demandé des corrections sur votre document."
      footer={
        <Button variant="ghost" onClick={logout} className="text-sm font-semibold text-brand-violet hover:underline">
          Se déconnecter
        </Button>
      }
    >
      <Card className="space-y-4">
        {statusData?.status_note && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-bold">Note de l'administrateur :</p>
            <p className="mt-1 italic">"{statusData.status_note}"</p>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <p className="font-medium">{successMessage}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => logout()} variant="primary" className="w-full">
                Fermer la session
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
                  label="Téléverser le nouveau document"
                  file={field.value}
                  onChange={(file) => field.onChange(file)}
                  error={errors.verification_document?.message}
                  hint="Formats: PNG, JPG, PDF (max 5Mo)"
                />
              )}
            />

            <Button type="submit" className="w-full" loading={mutation.isPending} disabled={!isValid}>
              Soumettre à nouveau
            </Button>

            {submitError ? <p className="text-sm text-rose-700">{submitError}</p> : null}
          </form>
        )}
      </Card>
    </AuthShell>
  );
}
