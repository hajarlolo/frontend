import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/layout/AuthShell";
import { Button, Input } from "../../components";
import { api, getApiErrorMessage } from "../../services/api";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaKey, FaArrowLeft, FaCheck } from "react-icons/fa";

const emailSchema = z.object({
  email: z.string().email("Email invalide."),
});

const codeSchema = z.object({
  code: z.string().length(6, "Le code doit contenir 6 chiffres."),
});

const passwordSchema = z.object({
  password: z.string().min(8, "Minimum 8 caractères."),
  password_confirmation: z.string()
}).refine(data => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["password_confirmation"]
});

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState("");
  const [choices, setChoices] = useState([]);
  const [resetToken, setResetToken] = useState("");
  const navigate = useNavigate();

  // Step 1: Request Code
  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const emailMutation = useMutation({
    mutationFn: (data) => api.post("/forgot-password", data),
    onSuccess: (res) => {
      setEmail(emailForm.getValues("email"));
      setChoices(res.data.choices);
      setStep(2);
      toast.info("Vérifiez votre boîte mail.");
    },
    onError: (err) => toast.error(getApiErrorMessage(err))
  });

  // Step 2: Verify Code
  const codeMutation = useMutation({
    mutationFn: (code) => api.post("/verify-reset-code", { code, email }),
    onSuccess: (res) => {
      setResetToken(res.data.reset_token);
      setStep(3);
    },
    onError: (err) => toast.error(getApiErrorMessage(err))
  });

  // Step 3: Reset Password
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });
  const passwordMutation = useMutation({
    mutationFn: (data) => api.post("/reset-password", { 
        ...data, 
        email, 
        token: resetToken,
        password_confirmation: data.password_confirmation 
    }),
    onSuccess: () => {
      toast.success("Mot de passe mis à jour !");
      navigate("/login");
    },
    onError: (err) => toast.error(getApiErrorMessage(err))
  });

  return (
    <AuthShell
      title="Récupération"
      subtitle={
        step === 1 ? "Entrez votre email pour recevoir un code." :
        step === 2 ? "Vérification de sécurité via email." :
        "Créez votre nouveau mot de passe."
      }
      footer={
        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brandViolet">
          <FaArrowLeft size={12} /> Retour à la connexion
        </Link>
      }
    >
      <div className="forgot-password-container py-4">
        
        {step === 1 && (
          <form onSubmit={emailForm.handleSubmit(v => emailMutation.mutate(v))} className="space-y-6">
            <Input
              label="Email"
              placeholder="votre@email.com"
              icon={<FaEnvelope />}
              error={emailForm.formState.errors.email?.message}
              {...emailForm.register("email")}
            />
            <Button type="submit" className="w-full" loading={emailMutation.isPending}>
              Vérifier l'email
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-brandViolet/5 p-6 rounded-xl border border-brandViolet/20 text-center mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Un code a été envoyé à <strong>{email}</strong>.<br/>
                  Veuillez choisir le code correct ci-dessous :
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                  {choices.map((code, idx) => (
                    <Button 
                      key={idx}
                      variant="outline"
                      className="py-6 text-xl font-mono tracking-widest hover:bg-brandViolet hover:text-white transition-all border-2"
                      onClick={() => codeMutation.mutate(code)}
                      loading={codeMutation.isPending}
                    >
                      {code}
                    </Button>
                  ))}
                </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={passwordForm.handleSubmit(v => passwordMutation.mutate(v))} className="space-y-6">
            <Input
              label="Nouveau mot de passe"
              type="password"
              icon={<FaLock />}
              error={passwordForm.formState.errors.password?.message}
              {...passwordForm.register("password")}
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              icon={<FaCheck />}
              error={passwordForm.formState.errors.password_confirmation?.message}
              {...passwordForm.register("password_confirmation")}
            />
            <Button type="submit" className="w-full" loading={passwordMutation.isPending}>
              Changer le mot de passe
            </Button>
          </form>
        )}

      </div>
    </AuthShell>
  );
}
