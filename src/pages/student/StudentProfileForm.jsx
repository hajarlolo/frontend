import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/layout/AuthShell";
import {
  Button,
  Card,
  FileDropzone,
  Input,
  StepIndicator,
  TagsInput,
  TextArea,
} from "../../components";
import { completeStudentProfileManual, searchUniversities } from "../../services/endpoints";

const formationSchema = z.object({
  diplome: z.string().min(1),
  filiere: z.string().min(1),
  etablissement: z.string().min(1),
  niveau: z.string().min(1),
  date_debut: z.string().min(1),
  date_fin: z.string().optional().or(z.literal("")),
  en_cours: z.boolean().optional(),
});

const experienceSchema = z.object({
  type: z.enum(["stage", "emploi", "freelance"]),
  nom_entreprise: z.string().min(1, "L'entreprise est requise."),
  description: z.string().optional().nullable(),
  date_debut: z.string().min(1, "Date de début requise."),
  date_fin: z.string().optional().nullable(),
  competences: z.array(z.string()).default([]),
});

const projectSchema = z.object({
  titre: z.string().min(1, "Titre requis."),
  description: z.string().optional().nullable(),
  technologies: z.string().optional().nullable(),
  lien_demo: z.string().url().optional().or(z.literal("")),
  lien_code: z.string().url().optional().or(z.literal("")),
  date: z.string().optional().or(z.literal("")),
  image_apercu: z.any().optional(),
});

const certificateSchema = z.object({
  titre: z.string().min(1),
  organisme: z.string().min(1),
  date_obtention: z.string().min(1),
});

const manualSchema = z.object({
  date_naissance: z.string().min(1, "Date de naissance requise."),
  universite_id: z.number().int().positive("Sélection université requise."),
  universite_label: z.string().min(1),
  telephone: z.string().min(5),
  adresse: z.string().min(4),
  lien_portfolio: z.string().url().optional().or(z.literal("")),
  photo_profil: z.any().optional(),
  competences: z.array(z.string()).default([]),
  formations: z.array(formationSchema).default([]),
  experiences: z.array(experienceSchema).default([]),
  projets: z.array(projectSchema).default([]),
  certificats: z.array(certificateSchema).default([]),
});

const sections = [
  { key: "personal", title: "Informations personnelles" },
  { key: "skills", title: "Compétences" },
  { key: "formations", title: "Formations" },
  { key: "experiences", title: "Expériences" },
  { key: "projects", title: "Projets" },
  { key: "certificates", title: "Certificats" },
];

export default function StudentProfileForm() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("personal");
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const manualForm = useForm({
    resolver: zodResolver(manualSchema),
    mode: "onChange",
    defaultValues: {
      date_naissance: "",
      universite_id: 0,
      universite_label: "",
      telephone: "",
      adresse: "",
      lien_portfolio: "",
      photo_profil: undefined,
      competences: [],
      formations: [],
      experiences: [],
      projets: [],
      certificats: [],
    },
  });

  const formationsArray = useFieldArray({ control: manualForm.control, name: "formations" });
  const experiencesArray = useFieldArray({ control: manualForm.control, name: "experiences" });
  const projectsArray = useFieldArray({ control: manualForm.control, name: "projets" });
  const certificatesArray = useFieldArray({ control: manualForm.control, name: "certificats" });

  const universitiesQuery = useQuery({
    queryKey: ["universities", searchValue],
    queryFn: () => searchUniversities(searchValue),
    enabled: searchValue.trim().length >= 1,
  });

  const manualMutation = useMutation({
    mutationFn: (formData) => completeStudentProfileManual(formData, true),
    onSuccess: () => {
      navigate("/student/verification", { replace: true });
    },
  });

  const photoFile = manualForm.watch("photo_profil");
  const photoPreview = useMemo(
    () => (photoFile instanceof File ? URL.createObjectURL(photoFile) : null),
    [photoFile]
  );

  useEffect(
    () => () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    },
    [photoPreview]
  );

  function selectUniversity(option) {
    manualForm.setValue("universite_id", option.id, { shouldValidate: true });
    manualForm.setValue("universite_label", option.name, { shouldValidate: true });
    setSearchValue(option.name);
    setShowSuggestions(false);
  }

  function onManualSubmit(values) {
    const formData = new FormData();

    formData.append("date_naissance", values.date_naissance);
    formData.append("universite_id", String(values.universite_id));
    formData.append("telephone", values.telephone);
    formData.append("adresse", values.adresse);
    if (values.lien_portfolio) formData.append("lien_portfolio", values.lien_portfolio);
    if (values.photo_profil instanceof File) {
      formData.append("photo_profil", values.photo_profil);
    }

    values.competences.forEach((competence, index) => {
      formData.append(`competences[${index}]`, competence);
    });

    values.formations.forEach((formation, index) => {
      Object.entries(formation).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(`formations[${index}][${key}]`, String(value));
        }
      });
    });

    values.experiences.forEach((experience, index) => {
      Object.entries(experience).forEach(([key, value]) => {
        if (key === "competences" && Array.isArray(value)) {
          value.forEach((skill, skillIdx) => {
            formData.append(`experiences[${index}][competences][${skillIdx}]`, skill);
          });
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(`experiences[${index}][${key}]`, String(value));
        }
      });
    });

    values.projets.forEach((project, index) => {
      Object.entries(project).forEach(([key, value]) => {
        if (key === "image_apercu" && value instanceof File) {
          formData.append(`projets[${index}][image_apercu]`, value);
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(`projets[${index}][${key}]`, String(value));
        }
      });
    });

    values.certificats.forEach((certificate, index) => {
      Object.entries(certificate).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(`certificats[${index}][${key}]`, String(value));
        }
      });
    });

    manualMutation.mutate(formData);
  }

  return (
    <AuthShell
      title="Remplir mon profil"
      subtitle="Étape 4: complétez votre profil manuellement."
      stepIndicator={<StepIndicator current={4} total={5} label="Profil détaillé" />}
      footer={
        <Link to="/student/profile-setup" className="text-sm font-semibold text-brand-violet hover:underline">
          Retour aux options
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit">
          <p className="text-sm font-semibold text-slate-600">Étapes du profil</p>
          <div className="mt-3 space-y-2">
            {sections.map((section) => (
              <button
                key={section.key}
                type="button"
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${activeSection === section.key
                    ? "bg-brand-violet text-white"
                    : "text-slate-600 hover:bg-brand-violet/5"
                  }`}
                onClick={() => setActiveSection(section.key)}
              >
                {section.title}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <form className="space-y-6" onSubmit={manualForm.handleSubmit(onManualSubmit)}>
            {activeSection === "personal" ? (
              <div className="space-y-4">
                <Input
                  label="Date de naissance"
                  type="date"
                  error={manualForm.formState.errors.date_naissance?.message}
                  {...manualForm.register("date_naissance")}
                />

                <div className="relative">
                  <Input
                    label="École/Université"
                    value={searchValue}
                    error={manualForm.formState.errors.universite_id?.message}
                    placeholder="Tapez EMSI, ISGA, UIR..."
                    onChange={(event) => {
                      setSearchValue(event.target.value);
                      manualForm.setValue("universite_id", 0, { shouldValidate: true });
                      manualForm.setValue("universite_label", event.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
                  />
                  {showSuggestions && searchValue.trim().length >= 1 ? (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl">
                      {universitiesQuery.data?.length ? (
                        <ul className="max-h-56 overflow-y-auto py-1">
                          {universitiesQuery.data.map((university) => (
                            <li key={university.id}>
                              <button
                                type="button"
                                onMouseDown={() => selectUniversity(university)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-brand-violet/5"
                              >
                                {university.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="px-3 py-2 text-sm text-slate-500">Aucun résultat</p>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Téléphone"
                    error={manualForm.formState.errors.telephone?.message}
                    {...manualForm.register("telephone")}
                  />
                  <Input
                    label="Adresse"
                    error={manualForm.formState.errors.adresse?.message}
                    {...manualForm.register("adresse")}
                  />
                </div>

                <Input
                  label="Portfolio (URL)"
                  placeholder="https://github.com/username"
                  error={manualForm.formState.errors.lien_portfolio?.message}
                  {...manualForm.register("lien_portfolio")}
                />

                <Controller
                  control={manualForm.control}
                  name="photo_profil"
                  render={({ field }) => (
                    <FileDropzone
                      label="Photo de profil"
                      accept=".png,.jpg,.jpeg"
                      file={field.value}
                      onChange={(file) => field.onChange(file)}
                    />
                  )}
                />

                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="profile"
                    className="h-24 w-24 rounded-2xl border border-slate-200 object-cover"
                  />
                ) : null}
              </div>
            ) : null}

            {activeSection === "skills" ? (
              <Controller
                control={manualForm.control}
                name="competences"
                render={({ field }) => (
                  <TagsInput
                    label="Compétences techniques et soft skills"
                    tags={field.value || []}
                    onChange={field.onChange}
                  />
                )}
              />
            ) : null}

            {activeSection === "formations" ? (
              <div className="space-y-4">
                {formationsArray.fields.map((item, index) => (
                  <Card key={item.id} className="space-y-3 border border-brand-violet/15">
                    <div className="flex justify-between">
                      <p className="font-semibold text-brand-violet">Formation #{index + 1}</p>
                      <Button variant="ghost" size="sm" onClick={() => formationsArray.remove(index)}>
                        Supprimer
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input {...manualForm.register(`formations.${index}.diplome`)} label="Diplôme" />
                      <Input {...manualForm.register(`formations.${index}.filiere`)} label="Filière" />
                      <Input {...manualForm.register(`formations.${index}.etablissement`)} label="Établissement" />
                      <label className="block space-y-1.5">
                        <span className="text-sm font-semibold">Niveau</span>
                        <select
                          {...manualForm.register(`formations.${index}.niveau`)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                        >
                          <option value="bac">Bac</option>
                          <option value="bac+2">Bac+2</option>
                          <option value="licence">Licence</option>
                          <option value="master">Master</option>
                          <option value="doctorat">Doctorat</option>
                          <option value="autre">Autre</option>
                        </select>
                      </label>
                      <Input type="date" {...manualForm.register(`formations.${index}.date_debut`)} label="Début" />
                      <Input type="date" {...manualForm.register(`formations.${index}.date_fin`)} label="Fin" />
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    formationsArray.append({
                      diplome: "",
                      filiere: "",
                      etablissement: "",
                      niveau: "bac",
                      date_debut: "",
                      date_fin: "",
                      en_cours: false,
                    })
                  }
                >
                  Ajouter une formation
                </Button>
              </div>
            ) : null}

            {activeSection === "experiences" ? (
              <div className="space-y-4">
                {experiencesArray.fields.map((item, index) => (
                  <Card key={item.id} className="space-y-3 border border-brand-violet/15">
                    <div className="flex justify-between">
                      <p className="font-semibold text-brand-violet">Expérience #{index + 1}</p>
                      <Button variant="ghost" size="sm" onClick={() => experiencesArray.remove(index)}>
                        Supprimer
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block space-y-1.5">
                        <span className="text-sm font-semibold">Type</span>
                        <select
                          {...manualForm.register(`experiences.${index}.type`)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                        >
                          <option value="stage">Stage</option>
                          <option value="emploi">Emploi</option>
                          <option value="freelance">Freelance</option>
                        </select>
                      </label>
                      <Input label="Entreprise" {...manualForm.register(`experiences.${index}.nom_entreprise`)} />
                      <Input type="date" label="Début" {...manualForm.register(`experiences.${index}.date_debut`)} />
                      <Input type="date" label="Fin" {...manualForm.register(`experiences.${index}.date_fin`)} />
                      <Input
                        type="number"
                        label="Durée (mois)"
                        {...manualForm.register(`experiences.${index}.duree`, { valueAsNumber: true })}
                      />
                    </div>
                    <TextArea label="Description" rows={3} {...manualForm.register(`experiences.${index}.description`)} />
                    <Controller
                      control={manualForm.control}
                      name={`experiences.${index}.competences`}
                      render={({ field }) => (
                        <TagsInput
                          label="Compétences utilisées"
                          tags={field.value || []}
                          onChange={field.onChange}
                          placeholder="Ajouter une compétence..."
                        />
                      )}
                    />
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    experiencesArray.append({
                      type: "stage",
                      nom_entreprise: "",
                      description: "",
                      date_debut: "",
                      date_fin: "",
                      duree: 1,
                    })
                  }
                >
                  Ajouter une expérience
                </Button>
              </div>
            ) : null}

            {activeSection === "projects" ? (
              <div className="space-y-4">
                {projectsArray.fields.map((item, index) => (
                  <Card key={item.id} className="space-y-3 border border-brand-violet/15">
                    <div className="flex justify-between">
                      <p className="font-semibold text-brand-violet">Projet #{index + 1}</p>
                      <Button variant="ghost" size="sm" onClick={() => projectsArray.remove(index)}>
                        Supprimer
                      </Button>
                    </div>
                    <Input label="Titre" {...manualForm.register(`projets.${index}.titre`)} />
                    <TextArea label="Description" {...manualForm.register(`projets.${index}.description`)} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Technologies" {...manualForm.register(`projets.${index}.technologies`)} />
                      <Input type="date" label="Date" {...manualForm.register(`projets.${index}.date`)} />
                      <Input label="Lien demo" {...manualForm.register(`projets.${index}.lien_demo`)} />
                      <Input label="Lien code" {...manualForm.register(`projets.${index}.lien_code`)} />
                    </div>
                    <Controller
                      control={manualForm.control}
                      name={`projets.${index}.image_apercu`}
                      render={({ field }) => (
                        <FileDropzone
                          label="Image d'aperçu"
                          file={field.value}
                          onChange={field.onChange}
                          hint="Capture d'écran du projet"
                        />
                      )}
                    />
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    projectsArray.append({
                      titre: "",
                      description: "",
                      technologies: "",
                      lien_demo: "",
                      lien_code: "",
                      date: "",
                    })
                  }
                >
                  Ajouter un projet
                </Button>
              </div>
            ) : null}

            {activeSection === "certificates" ? (
              <div className="space-y-4">
                {certificatesArray.fields.map((item, index) => (
                  <Card key={item.id} className="space-y-3 border border-brand-violet/15">
                    <div className="flex justify-between">
                      <p className="font-semibold text-brand-violet">Certificat #{index + 1}</p>
                      <Button variant="ghost" size="sm" onClick={() => certificatesArray.remove(index)}>
                        Supprimer
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Titre" {...manualForm.register(`certificats.${index}.titre`)} />
                      <Input label="Organisme" {...manualForm.register(`certificats.${index}.organisme`)} />
                      <Input
                        type="date"
                        label="Date d'obtention"
                        {...manualForm.register(`certificats.${index}.date_obtention`)}
                      />
                    </div>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => certificatesArray.append({ titre: "", organisme: "", date_obtention: "" })}
                >
                  Ajouter un certificat
                </Button>
              </div>
            ) : null}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button type="submit" loading={manualMutation.isPending}>
                Enregistrer le profil
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AuthShell>
  );
}
