import { useState } from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../../components/layout/AuthShell";
import { Button, Input, StepIndicator } from "../../components";
import { getApiErrorMessage, getApiValidationErrors } from "../../services/api";
import { registerStudent } from "../../services/endpoints";

const registerStudentSchema = z.object({
  nom: z.string().min(2, "Nom complet requis."),
  email: z.string().email("Email invalide."),
  password: z.string().min(8, "Minimum 8 caractères."),
});

export default function RegisterStudent() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const role = params.get("role") || "student"; // student or laureat
  
  const [formValues, setFormValues] = useState({
    nom: "",
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const mutation = useMutation({
    mutationFn: registerStudent,
    onSuccess: (data, variables) => {
      setSuccessMessage("Inscription réussie. Un code de vérification a été envoyé.");
      sessionStorage.setItem("verification_email", variables.email);
      const userId = data.user_id || "";
      navigate(`/verification/step-3?role=${role}&email=${encodeURIComponent(variables.email)}&user_id=${userId}`, {
        replace: true,
      });
    },
    onError: (error) => {
      const backendErrors = getApiValidationErrors(error);
      const nextErrors = {};

      if (Array.isArray(backendErrors.nom)) nextErrors.nom = backendErrors.nom[0];
      if (Array.isArray(backendErrors.email)) nextErrors.email = backendErrors.email[0];
      if (Array.isArray(backendErrors.password)) nextErrors.password = backendErrors.password[0];

      if (Object.keys(nextErrors).length) {
        setFormErrors((prev) => ({ ...prev, ...nextErrors }));
      } else {
        setFormErrors({ nom: getApiErrorMessage(error, "Inscription échouée.") });
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
      nom: String(formData.get("nom") ?? formValues.nom ?? "").trim(),
      email: String(formData.get("email") ?? formValues.email ?? "").trim(),
      password: String(formData.get("password") ?? formValues.password ?? ""),
    };
    
    setFormValues(normalizedValues);
    const parsed = registerStudentSchema.safeParse(normalizedValues);
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
      nom: parsed.data.nom,
      email: parsed.data.email,
      password: parsed.data.password,
      password_confirmation: parsed.data.password,
      role: role,
      universite_id: 1, // Placeholder
    });
  };

  const roleTitle = role === "student" ? "Étudiant" : "Lauréat";

  return (
    <AuthShell
      title={`Inscription ${roleTitle}`}
      subtitle="Étape 2 sur 3 - Compte"
      stepIndicator={<StepIndicator current={2} total={3} label="Compte" />}
      footer={
        <p className="text-sm text-slate-600">
           Vous avez déjà un compte ?{" "}
          <Link to="/login" className="font-semibold text-brand-violet hover:underline">
            Se connecter
          </Link>
        </p>
      }
    >
      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        {successMessage ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <Input
          label="Nom de Complet"
          name="nom"
          autoComplete="name"
          placeholder="Votre nom complet"
          value={formValues.nom}
          error={formErrors.nom}
          onChange={(event) => setFieldValue("nom", event.target.value)}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
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

        <Button type="submit" className="w-full h-12 shadow-md hover:shadow-lg transition-all" loading={mutation.isPending} disabled={mutation.isPending}>
          Continuer
        </Button>
      </form>
    </AuthShell>
  );
}
