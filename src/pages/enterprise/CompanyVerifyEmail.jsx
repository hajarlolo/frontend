import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/layout/AuthShell";
import { Button, Card, Input, StepIndicator } from "../../components";
import { getApiErrorMessage } from "../../services/api";
import { registerCompany, verifyCompanyCode } from "../../services/endpoints";
import { clearCompanyDraft, readCompanyDraft, saveCompanyDraft } from "../../utils/onboarding";

const schema = z.object({
  email_professionnel: z.string().email("Email professionnel invalide."),
  code: z.string().length(6, "Le code doit contenir 6 chiffres."),
});

export default function CompanyVerifyEmail() {
  const navigate = useNavigate();
  const draft = readCompanyDraft();
  const [codeSent, setCodeSent] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    if (!draft) {
      navigate("/register/company", { replace: true });
    }
  }, [draft, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      email_professionnel: draft?.email || "",
      code: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerCompany,
    onSuccess: (data) => {
      setCodeSent(true);
      setRegisteredUserId(data?.user_id ?? null);
      setSubmitError("");
      setSubmitSuccess("Un code a été envoyé à l'email professionnel.");
      saveCompanyDraft({ ...draft, email: getValues("email_professionnel") });
    },
    onError: (error) => {
      setSubmitSuccess("");
      setSubmitError(getApiErrorMessage(error, "Impossible d'envoyer le code."));
    },
  });

  const verifyMutation = useMutation({
    mutationFn: verifyCompanyCode,
    onSuccess: () => {
      clearCompanyDraft();
      navigate("/company/pending?status=en_attente", { replace: true });
    },
    onError: (error) => {
      setSubmitSuccess("");
      setSubmitError(getApiErrorMessage(error, "Code invalide ou expiré."));
    },
  });

  if (!draft) return null;

  const sendCode = () => {
    const emailProfessionnel = getValues("email_professionnel");
    setSubmitError("");
    setSubmitSuccess("");

    registerMutation.mutate({
      payload: {
        nom_entreprise: draft.nom_entreprise,
        email: emailProfessionnel,
        password: draft.password,
        password_confirmation: draft.password,
        ice: draft.ice,
        verification_method: "email_code",
      },
      isMultipart: false,
    });
  };

  return (
    <AuthShell
      title="Vérification par email professionnel"
      subtitle="Étape 3: envoyez puis confirmez votre code de vérification."
      stepIndicator={<StepIndicator current={3} total={4} label="Code email" />}
      footer={
        <Link to="/company/verification-method" className="text-sm font-semibold text-brand-violet hover:underline">
          Retour à la méthode de vérification
        </Link>
      }
    >
      <Card className="space-y-4">
        <Input
          label="Email professionnel"
          type="email"
          placeholder="contact@entreprise.com"
          error={errors.email_professionnel?.message}
          {...register("email_professionnel")}
        />

        <Button
          type="button"
          className="w-full"
          onClick={sendCode}
          loading={registerMutation.isPending}
          disabled={!watch("email_professionnel") || Boolean(errors.email_professionnel)}
        >
          Envoyer le code
        </Button>

        <Input
          label="Code à 6 chiffres"
          placeholder="123456"
          inputMode="numeric"
          maxLength={6}
          error={errors.code?.message}
          {...register("code")}
        />

        <Button
          type="button"
          className="w-full"
          onClick={handleSubmit((values) => verifyMutation.mutate({ code: values.code, user_id: registeredUserId }))}
          loading={verifyMutation.isPending}
          disabled={!isValid || !codeSent || !registeredUserId}
        >
          Vérifier le code
        </Button>

        {submitSuccess ? <p className="text-sm text-emerald-700">{submitSuccess}</p> : null}
        {submitError ? <p className="text-sm text-rose-700">{submitError}</p> : null}

        {!codeSent ? (
          <p className="text-xs text-slate-500">Envoyez d'abord le code avant de confirmer la vérification.</p>
        ) : null}
      </Card>
    </AuthShell>
  );
}