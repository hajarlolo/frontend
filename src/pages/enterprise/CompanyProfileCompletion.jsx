import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/layout/AuthShell";
import {
  Button,
  Card,
  FileDropzone,
  Input,
  Select,
  StepIndicator,
  TextArea,
} from "../../components";
import { completeCompanyProfile } from "../../services/endpoints";

const schema = z.object({
  description: z
    .string()
    .min(100, "Minimum 100 caractères.")
    .max(300, "Maximum 300 caractères."),
  secteur_activite: z.string().min(2),
  site_web: z.string().url("URL invalide."),
  taille: z.enum(["1-10", "10-50", "50-200", "+200"]),
  telephone: z.string().min(6),
  localisation: z.string().min(4),
  email_professionnel: z.string().email("Email professionnel invalide."),
  logo: z.any().optional(),
});

export default function CompanyProfileCompletion() {
  const navigate = useNavigate();
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      description: "",
      secteur_activite: "",
      site_web: "",
      taille: "1-10",
      telephone: "",
      localisation: "",
      email_professionnel: "",
      logo: undefined,
    },
  });

  const logoFile = watch("logo");
  const logoPreview = useMemo(
    () => (logoFile instanceof File ? URL.createObjectURL(logoFile) : null),
    [logoFile]
  );

  useEffect(
    () => () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    },
    [logoPreview]
  );

  const mutation = useMutation({
    mutationFn: completeCompanyProfile,
    onSuccess: () => {
      navigate("/company/dashboard", { replace: true });
    },
  });

  const onSubmit = (values) => {
    const formData = new FormData();
    formData.append("description", values.description);
    formData.append("secteur_activite", values.secteur_activite);
    formData.append("site_web", values.site_web);
    formData.append("taille", values.taille);
    formData.append("telephone", values.telephone);
    formData.append("localisation", values.localisation);
    formData.append("email_professionnel", values.email_professionnel);
    if (values.logo instanceof File) {
      formData.append("logo", values.logo);
    }
    mutation.mutate(formData);
  };

  return (
    <AuthShell
      title="Complétion profil entreprise"
      subtitle="Étape 4: complétez votre profil entreprise."
      stepIndicator={<StepIndicator current={4} total={4} label="Profil entreprise" />}
      footer={
        <Link to="/company/pending" className="text-sm font-semibold text-brand-violet hover:underline">
          Retour
        </Link>
      }
    >
      <Card className="max-w-4xl">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <TextArea
            label="Description"
            rows={5}
            hint="Présentation de 100 à 300 mots: activité, mission, valeurs."
            error={errors.description?.message}
            {...register("description")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Secteur d'activité"
              placeholder="Informatique, Finance..."
              error={errors.secteur_activite?.message}
              {...register("secteur_activite")}
            />
            <Select label="Taille d'entreprise" error={errors.taille?.message} {...register("taille")}>
              <option value="1-10">1-10</option>
              <option value="10-50">10-50</option>
              <option value="50-200">50-200</option>
              <option value="+200">+200</option>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Site web officiel"
              placeholder="https://www.entreprise.ma"
              error={errors.site_web?.message}
              {...register("site_web")}
            />
            <Input
              label="Email professionnel"
              type="email"
              placeholder="contact@entreprise.com"
              error={errors.email_professionnel?.message}
              {...register("email_professionnel")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Téléphone"
              placeholder="+212 ..."
              error={errors.telephone?.message}
              {...register("telephone")}
            />
            <Input
              label="Adresse / localisation"
              placeholder="Casablanca, Maroc"
              error={errors.localisation?.message}
              {...register("localisation")}
            />
          </div>

          <Controller
            control={control}
            name="logo"
            render={({ field }) => (
              <FileDropzone
                label="Logo entreprise"
                accept=".png,.jpg,.jpeg"
                file={field.value}
                onChange={(file) => field.onChange(file)}
                hint="Format carré ou rectangle - JPG/PNG"
              />
            )}
          />

          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Aperçu logo"
              className="h-24 w-24 rounded-xl border border-slate-200 object-cover"
            />
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" loading={mutation.isPending} disabled={!isValid}>
              Enregistrer le profil entreprise
            </Button>
          </div>
        </form>
      </Card>
    </AuthShell>
  );
}

