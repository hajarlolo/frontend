import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/layout/AuthShell";
import { Button, Card, FileDropzone, StepIndicator } from "../../components";
import { completeStudentProfileCv } from "../../services/endpoints";

const schema = z.object({
  cv_file: z.instanceof(File, { message: "CV PDF requis." }),
});

export default function StudentUploadCv() {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      cv_file: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: completeStudentProfileCv,
    onSuccess: () => {
      navigate("/student/verification", { replace: true });
    },
  });

  const onSubmit = (values) => {
    const formData = new FormData();
    formData.append("cv_file", values.cv_file);
    mutation.mutate(formData);
  };

  return (
    <AuthShell
      title="Importer mon CV"
      subtitle="Étape 4: chargez un CV PDF pour avancer rapidement."
      stepIndicator={<StepIndicator current={4} total={5} label="CV" />}
      footer={
        <Link to="/student/profile-setup" className="text-sm font-semibold text-brand-violet hover:underline">
          Retour aux options
        </Link>
      }
    >
      <Card className="space-y-4 border border-slate-200">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="cv_file"
            render={({ field }) => (
              <FileDropzone
                label="CV (PDF uniquement)"
                accept=".pdf"
                file={field.value}
                onChange={(file) => field.onChange(file)}
                error={errors.cv_file?.message}
                hint="Format accepté: PDF"
              />
            )}
          />

          <Button type="submit" className="w-full" loading={mutation.isPending} disabled={!isValid}>
            Envoyer le CV
          </Button>
        </form>
      </Card>
    </AuthShell>
  );
}

