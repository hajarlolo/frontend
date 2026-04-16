import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/layout/AuthShell";
import { Button, Card, FileDropzone, StepIndicator } from "../../components";
import { registerCompany } from "../../services/endpoints";
import { getApiErrorMessage } from "../../services/api";
import { clearCompanyDraft, readCompanyDraft } from "../../utils/onboarding";

const schema = z.object({
  registre_commerce: z.instanceof(File, { message: "Le document RC est obligatoire." }),
});

export default function CompanyUploadRc() {
  const navigate = useNavigate();
  const draft = readCompanyDraft();
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!draft) {
      navigate("/register/company", { replace: true });
    }
  }, [draft, navigate]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      registre_commerce: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: registerCompany,
    onSuccess: () => {
      clearCompanyDraft();
      navigate("/company/pending?status=en_attente", { replace: true });
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error, "Impossible d'envoyer le document."));
    },
  });

  if (!draft) return null;

  const onSubmit = (values) => {
    setSubmitError("");
    const formData = new FormData();
    formData.append("nom_entreprise", draft.nom_entreprise);
    formData.append("email", draft.email);
    formData.append("password", draft.password);
    formData.append("password_confirmation", draft.password);
    formData.append("ice", draft.ice);
    formData.append("verification_method", "document");
    formData.append("registre_commerce", values.registre_commerce);

    mutation.mutate({ payload: formData, isMultipart: true });
  };

  return (
    <AuthShell
      title="Upload Registre de Commerce"
      subtitle="Étape 3: importez votre document RC pour vérification."
      stepIndicator={<StepIndicator current={3} total={4} label="Document RC" />}
      footer={
        <Link to="/company/verification-method" className="text-sm font-semibold text-brand-violet hover:underline">
          Retour à la méthode de vérification
        </Link>
      }
    >
      <Card className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="registre_commerce"
            render={({ field }) => (
              <FileDropzone
                label="Registre de commerce"
                accept=".pdf,.png,.jpg,.jpeg"
                file={field.value}
                onChange={(file) => field.onChange(file)}
                error={errors.registre_commerce?.message}
                hint="Formats autorisés: PDF, PNG, JPG"
              />
            )}
          />

          <Button type="submit" className="w-full" loading={mutation.isPending} disabled={!isValid}>
            Envoyer le document
          </Button>

          {submitError ? <p className="text-sm text-rose-700">{submitError}</p> : null}
        </form>
      </Card>
    </AuthShell>
  );
}