import { useState } from "react";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/layout/AuthShell";
import { Button, Input, StepIndicator } from "../../components";
import { useMutation } from "@tanstack/react-query";
import { registerCompany } from "../../services/endpoints";
import { getApiErrorMessage, getApiValidationErrors } from "../../services/api";

const registerCompanySchema = z.object({
  nom_entreprise: z.string().min(2, "Nom entreprise requis."),
  email: z.string().email("Email invalide."),
  password: z.string().min(8, "Minimum 8 caractères."),
});

export default function RegisterCompany() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    nom_entreprise: "",
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const mutation = useMutation({
    mutationFn: registerCompany,
    onSuccess: (data, variables) => {
      const email = variables.payload?.email;
      if (email) sessionStorage.setItem("verification_email", email);
      
      const userId = data.user_id || "";
      navigate(`/verification/step-3?role=company&email=${encodeURIComponent(email || "")}&user_id=${userId}`, {
        replace: true,
      });
    },
    onError: (error) => {
      const backendErrors = getApiValidationErrors(error);
      const nextErrors = {};

      if (Array.isArray(backendErrors.nom_entreprise)) nextErrors.nom_entreprise = backendErrors.nom_entreprise[0];
      if (Array.isArray(backendErrors.email)) nextErrors.email = backendErrors.email[0];
      if (Array.isArray(backendErrors.password)) nextErrors.password = backendErrors.password[0];

      if (Object.keys(nextErrors).length) {
        setFormErrors((prev) => ({ ...prev, ...nextErrors }));
      } else {
        setFormErrors({
          nom_entreprise: getApiErrorMessage(error, "Inscription entreprise échouée."),
        });
      }
    },
  });

  function setFieldValue(field, value) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  const onSubmit = (event) => {
    event.preventDefault();
    if (mutation.isPending) return;

    const formData = new FormData(event.currentTarget);
    const normalizedValues = {
      nom_entreprise: String(formData.get("nom_entreprise") ?? formValues.nom_entreprise ?? "").trim(),
      email: String(formData.get("email") ?? formValues.email ?? "").trim(),
      password: String(formData.get("password") ?? formValues.password ?? ""),
    };

    setFormValues(normalizedValues);
    const parsed = registerCompanySchema.safeParse(normalizedValues);
    if (!parsed.success) {
      const nextErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (!field || nextErrors[field]) continue;
        nextErrors[field] = issue.message;
      }
      setFormErrors(nextErrors);
      return;
    }

    setFormErrors({});
    mutation.mutate({ 
      payload: { 
        ...parsed.data, 
        password_confirmation: parsed.data.password 
      }, 
      isMultipart: false 
    });
  };

  return (
    <AuthShell
      title="Inscription entreprise"
      subtitle="Étape 2 sur 3 - Compte"
      stepIndicator={<StepIndicator current={2} total={3} label="Compte" />}
      footer={
        <div className="space-y-1 text-sm text-slate-600">
           Vous avez déjà un compte ?{" "}
          <Link to="/login" className="font-semibold text-brand-violet hover:underline">
            Se connecter
          </Link>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        <Input
          label="Nom de l'entreprise"
          name="nom_entreprise"
          autoComplete="organization"
          placeholder="Ex: TalentLink Maroc"
          value={formValues.nom_entreprise}
          error={formErrors.nom_entreprise}
          onChange={(event) => setFieldValue("nom_entreprise", event.target.value)}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="contact@entreprise.com"
          value={formValues.email}
          error={formErrors.email}
          onChange={(event) => setFieldValue("email", event.target.value)}
        />

        <Input
          label="Mot de passe"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="********"
          value={formValues.password}
          error={formErrors.password}
          onChange={(event) => setFieldValue("password", event.target.value)}
        />

        <Button type="submit" className="w-full h-12 shadow-md hover:shadow-lg transition-all" loading={mutation.isPending}>
          Continuer
        </Button>
      </form>
    </AuthShell>
  );
}
