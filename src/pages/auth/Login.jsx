import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AuthShell from "../../components/layout/AuthShell";
import { Button, Input } from "../../components";
import { useAuth } from "../../hooks";
import { getApiErrorMessage } from "../../services/api";
import { login } from "../../services/endpoints";
import { mapBackendRedirect } from "../../utils/helpers";

const loginSchema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(1, "Mot de passe requis."),
});

export default function Login() {
  const { setAuthUser } = useAuth();
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log("=== LOGIN SUCCESS ===");
      console.log("Login response:", data);
      setSubmitError("");
      
      // Set auth user immediately
      console.log("Setting auth user...");
      setAuthUser(data.user ?? null);
      
      const redirectPath = mapBackendRedirect(data.redirect_to, "/login");
      console.log("Redirecting to:", redirectPath);
      console.log("Current URL before redirect:", window.location.href);
      
      // Use window.location.href to force navigation and avoid React Router issues
      setTimeout(() => {
        console.log("Performing hard redirect to:", redirectPath);
        window.location.href = redirectPath;
      }, 100);
    },
    onError: (error) => {
      console.error("=== LOGIN ERROR ===");
      console.error("Login error:", error);
      setSubmitError(getApiErrorMessage(error, "Connexion échouée."));
    },
    onSettled: (data, error) => {
      console.log("=== LOGIN SETTLED ===");
      console.log("Data:", data);
      console.log("Error:", error);
    },
  });

  return (
    <AuthShell
      title="Connexion"
      subtitle="Accédez à votre espace TalentLink."
      footer={
        <p className="text-slate-400 font-medium">
          Vous n’avez pas de compte ?{" "}
          <Link to="/register-type" className="text-brandMagenta font-black hover:opacity-80 transition-opacity">
            S'inscrire
          </Link>
        </p>
      }
    >
      <form
        className="space-y-6"
        onSubmit={handleSubmit((values) => {
          setSubmitError("");
          mutation.mutate(values);
        })}
        noValidate
      >
        <Input
          label="Email"
          type="email"
          placeholder="vous@exemple.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-2">
          <Input
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            placeholder="********"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex justify-end">
            <Link 
              to="/forgot-password" 
              className="text-sm font-bold text-slate-400 hover:text-brandViolet transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        {submitError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs font-bold text-red-500 animate-fade-in-up">
            {submitError}
          </div>
        ) : null}

        <Button type="submit" className="w-full h-14" loading={mutation.isPending}>
          Se connecter
        </Button>
      </form>
    </AuthShell>
  );
}


