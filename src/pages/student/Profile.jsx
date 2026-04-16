import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppShell from "../../components/layout/AppShell";
import {
  Button,
  Card,
  FileDropzone,
  Input,
  TagsInput,
  TextArea,
  Modal,
  Avatar,
  Badge,
} from "../../components";
import {
  fetchStudentProfile,
  updateStudentPersonalInfo,
  updateStudentCompetences,
  updateStudentFormations,
  updateStudentExperiences,
  updateStudentProjets,
  updateStudentCertificats,
  searchUniversities,
} from "../../services/endpoints";
import { getStorageUrl } from "../../utils/storageUrl";
import { api } from "../../services/api";
import { toast } from "react-toastify";
import { 
  FaUser, 
  FaTools, 
  FaGraduationCap, 
  FaBriefcase, 
  FaCode, 
  FaCertificate,
  FaPlus,
  FaTrash,
  FaEdit,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaUniversity,
  FaCalendarAlt,
  FaStar,
  FaQuoteRight
} from "react-icons/fa";

// Schemas
const personalInfoSchema = z.object({
  nom: z.string().min(2, "Nom requis."),
  email: z.string().email(),
  telephone: z.string().nullable().optional(),
  adresse: z.string().nullable().optional(),
  date_naissance: z.string().nullable().optional(),
  universite_id: z.number().int().positive("Sélection université requise."),
  universite_label: z.string().min(1),
  academic_year: z.string().nullable().optional(),
  lien_portfolio: z.string().url().nullable().optional().or(z.literal("")),
  photo_profil: z.any().optional(),
});

const experienceSchema = z.object({
  type: z.enum(["stage", "emploi", "freelance"]),
  nom_entreprise: z.string().min(1, "L'entreprise est requise."),
  description: z.string().optional().nullable(),
  date_debut: z.string().min(1, "Date de début requise."),
  date_fin: z.string().optional().nullable(),
  competences: z.array(z.string()).optional().default([]),
});

const projetSchema = z.object({
  titre: z.string().min(1, "Le titre est requis."),
  description: z.string().optional().nullable(),
  technologies: z.array(z.string()).optional().default([]),
  lien_demo: z.string().optional().nullable().or(z.literal("")),
  lien_code: z.string().optional().nullable().or(z.literal("")),
  date: z.string().optional().nullable(),
  image_apercu: z.any().optional(),
});

export default function StudentProfile() {
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["student-profile"],
    queryFn: fetchStudentProfile,
  });

  const { data: evaluations, isLoading: isEvalLoading } = useQuery({
    queryKey: ["student-evaluations", profile?.personal_info?.id_candidat],
    queryFn: async () => {
      const res = await api.get(`/evaluations/candidat/${profile.personal_info.id_candidat}`);
      return res.data;
    },
    enabled: !!profile?.personal_info?.id_candidat,
  });

  const universitiesQuery = useQuery({
    queryKey: ["universities", searchValue],
    queryFn: () => searchUniversities(searchValue),
    enabled: searchValue.trim().length >= 1,
  });

  // Forms
  const personalForm = useForm({ resolver: zodResolver(personalInfoSchema), mode: "onChange" });
  const competencesForm = useForm();
  const formationsForm = useForm();
  const experiencesForm = useForm({ resolver: zodResolver(z.object({ experiences: z.array(experienceSchema) })) });
  const projectsForm = useForm({ resolver: zodResolver(z.object({ projets: z.array(projetSchema) })) });
  const certificatesForm = useForm();

  const formationsArray = useFieldArray({ control: formationsForm.control, name: "formations" });
  const experiencesArray = useFieldArray({ control: experiencesForm.control, name: "experiences" });
  const projectsArray = useFieldArray({ control: projectsForm.control, name: "projets" });
  const certificatesArray = useFieldArray({ control: certificatesForm.control, name: "certificats" });

  useEffect(() => {
    if (profile) {
      personalForm.reset(profile.personal_info);
      setSearchValue(profile.personal_info.universite_label || "");
      competencesForm.reset({ competences: profile.competences });
      formationsForm.reset({ formations: profile.formations });
      experiencesForm.reset({ experiences: profile.experiences });
      projectsForm.reset({ projets: profile.projets });
      certificatesForm.reset({ certificats: profile.certificats });
    }
  }, [profile, personalForm, competencesForm, formationsForm, experiencesForm, projectsForm, certificatesForm]);

  const mutationOptions = (sectionName) => ({
    onSuccess: () => {
      toast.success(`${sectionName} mis à jour avec succès.`);
      queryClient.invalidateQueries(["student-profile"]);
      setActiveModal(null);
    },
    onError: () => {
      toast.error(`Erreur lors de la mise à jour de ${sectionName}.`);
    }
  });

  const personalMutation = useMutation({
    mutationFn: (data) => updateStudentPersonalInfo(data, true),
    ...mutationOptions("Informations personnelles")
  });

  const skillsMutation = useMutation({
    mutationFn: (data) => updateStudentCompetences(data.competences),
    ...mutationOptions("Compétences")
  });

  const formationsMutation = useMutation({
    mutationFn: (data) => updateStudentFormations(data.formations),
    ...mutationOptions("Formations")
  });

  const experiencesMutation = useMutation({
    mutationFn: (data) => updateStudentExperiences(data.experiences),
    ...mutationOptions("Expériences")
  });

  const projectsMutation = useMutation({
    mutationFn: (data) => {
      const formData = new FormData();
      data.projets.forEach((p, idx) => {
        Object.entries(p).forEach(([key, val]) => {
          if (key === 'image_apercu' && val instanceof File) {
            formData.append(`projets[${idx}][image_apercu]`, val);
          } else if (key === 'image_apercu' && typeof val === 'string' && !val.startsWith('blob:')) {
            formData.append(`projets[${idx}][image_apercu_existing]`, val);
          } else if (val !== undefined && val !== null) {
            if (Array.isArray(val)) {
              val.forEach((item, arrIdx) => {
                formData.append(`projets[${idx}][${key}][${arrIdx}]`, item);
              });
            } else {
              formData.append(`projets[${idx}][${key}]`, val);
            }
          }
        });
      });
      return updateStudentProjets(formData, true);
    },
    ...mutationOptions("Projets")
  });

  const certificatesMutation = useMutation({
    mutationFn: (data) => updateStudentCertificats(data.certificats),
    ...mutationOptions("Certificats")
  });

  if (isLoading) return <AppShell title="Mon Profil">Chargement...</AppShell>;

  const onPersonalSubmit = (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'photo_profil' && value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null && key !== 'email') {
        formData.append(key, value);
      }
    });
    personalMutation.mutate(formData);
  };

  const SectionHeader = ({ title, icon: Icon, onAdd, addLabel = "Ajouter" }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-violet/10 rounded-lg text-brand-violet">
          <Icon size={20} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onAdd}
        className="text-brand-violet hover:bg-brand-violet/10"
      >
        <FaPlus className="mr-2" /> {addLabel}
      </Button>
    </div>
  );

  return (
    <AppShell title="Mon Profil" subtitle="Gérez vos informations professionnelles et académiques.">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Personal Info Header Card */}
        <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 p-0">
          <div className="h-32 bg-gradient-to-r from-brand-violet to-violet-400" />
          <div className="px-8 pb-8 -mt-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                <div className="relative group">
                   <Avatar 
                    src={getStorageUrl(profile?.personal_info?.photo_profil)} 
                    alt={profile?.personal_info?.prenom} 
                    size={120} 
                    className="border-4 border-white shadow-xl"
                  />
                </div>
                <div className="text-center md:text-left pb-2">
                  <h1 className="text-3xl font-bold text-slate-800">
                    {profile?.personal_info?.nom}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-slate-500 text-sm">
                    <span className="flex items-center gap-1.5"><FaUniversity /> {profile?.personal_info?.universite_label}</span>
                    <span className="flex items-center gap-1.5"><FaMapMarkerAlt /> {profile?.personal_info?.adresse || "Non spécifié"}</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setActiveModal('personal')}
                className="mb-2"
              >
                <FaEdit className="mr-2" /> Modifier le profil
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <FaEnvelope />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Email</p>
                  <p className="text-slate-700 font-medium">{profile?.personal_info?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <FaPhone />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Téléphone</p>
                  <p className="text-slate-700 font-medium">{profile?.personal_info?.telephone || "Non spécifié"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <FaGlobe />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Portfolio</p>
                  {profile?.personal_info?.lien_portfolio ? (
                    <a href={profile?.personal_info?.lien_portfolio} target="_blank" rel="noreferrer" className="text-brand-violet hover:underline font-medium truncate max-w-[200px] block">
                      {profile?.personal_info?.lien_portfolio.replace(/^https?:\/\//, '')}
                    </a>
                  ) : <p className="text-slate-700 font-medium">Non spécifié</p>}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Sections Grid */}
        <div className="grid gap-8">
          
          {/* Compétences */}
          <Card className="border-none shadow-lg shadow-slate-200/40">
            <SectionHeader title="Compétences" icon={FaTools} onAdd={() => setActiveModal('skills')} />
            <div className="flex flex-wrap gap-2">
              {profile?.competences?.length > 0 ? (
                profile.competences.map((skill, idx) => (
                  <Badge key={idx} variant="brand" className="px-4 py-1.5 text-sm">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-slate-400 italic text-sm">Aucune compétence ajoutée.</p>
              )}
            </div>
          </Card>

          {/* Formations */}
          <Card className="border-none shadow-lg shadow-slate-200/40">
            <SectionHeader title="Formations" icon={FaGraduationCap} onAdd={() => setActiveModal('formations')} />
            <div className="space-y-6">
              {profile?.formations?.length > 0 ? (
                profile.formations.map((formation, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet shrink-0">
                        <FaGraduationCap />
                      </div>
                      {idx !== profile.formations.length - 1 && <div className="w-0.5 h-full bg-slate-100 my-1" />}
                    </div>
                    <div className="pb-4">
                      <h4 className="font-bold text-slate-800">{formation.diplome} - {formation.filiere}</h4>
                      <p className="text-brand-violet font-medium text-sm">{formation.universite_label || "Non défini"}</p>
                      <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                        <FaCalendarAlt /> {formation.date_debut} — {formation.date_fin || "Aujourd'hui"}
                      </p>
                      <Badge variant="secondary" className="mt-2 text-[10px] uppercase">{formation.niveau}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic text-sm">Aucune formation ajoutée.</p>
              )}
            </div>
          </Card>

          {/* Expériences */}
          <Card className="border-none shadow-lg shadow-slate-200/40">
            <SectionHeader title="Expériences" icon={FaBriefcase} onAdd={() => setActiveModal('experiences')} />
            <div className="space-y-6">
              {profile?.experiences?.length > 0 ? (
                profile.experiences.map((exp, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <FaBriefcase />
                      </div>
                      {idx !== profile.experiences.length - 1 && <div className="w-0.5 h-full bg-slate-100 my-1" />}
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800">{exp.nom_entreprise}</h4>
                          <p className="text-slate-600 font-medium text-sm uppercase tracking-wider">{exp.type}</p>
                        </div>
                        <p className="text-slate-400 text-xs flex items-center gap-1">
                          <FaCalendarAlt /> {exp.date_debut} — {exp.date_fin || "Aujourd'hui"}
                        </p>
                      </div>
                      <p className="text-slate-600 text-sm mt-3 whitespace-pre-line leading-relaxed">
                        {exp.description}
                      </p>
                      
                      {exp.competences?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {exp.competences.map((skill, si) => (
                            <Badge key={si} variant="secondary" className="bg-slate-100 text-slate-500 font-medium">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic text-sm">Aucune expérience ajoutée.</p>
              )}
            </div>
          </Card>

          {/* Projets */}
          <Card className="border-none shadow-lg shadow-slate-200/40">
            <SectionHeader title="Projets" icon={FaCode} onAdd={() => setActiveModal('projects')} />
            <div className="grid gap-6 sm:grid-cols-2">
              {profile?.projets?.length > 0 ? (
                profile.projets.map((project, idx) => (
                  <div key={idx} className="p-0 rounded-2xl bg-white border border-slate-100 hover:border-brand-violet/30 transition-shadow overflow-hidden group shadow-sm hover:shadow-md">
                    {project.image_apercu_url && (
                      <div className="h-40 w-full overflow-hidden">
                        <img 
                          src={getStorageUrl(project.image_apercu_url)} 
                          alt={project.titre} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h4 className="font-bold text-slate-800 mb-2">{project.titre}</h4>
                      <p className="text-slate-600 text-xs line-clamp-3 mb-4 leading-relaxed">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(Array.isArray(project.technologies) ? project.technologies : typeof project.technologies === 'string' ? project.technologies.split(',') : []).map((tech, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">{tech.trim ? tech.trim() : tech}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-brand-violet">
                        {project.lien_demo && <a href={project.lien_demo} target="_blank" rel="noreferrer" className="hover:underline">DEMO</a>}
                        {project.lien_code && <a href={project.lien_code} target="_blank" rel="noreferrer" className="hover:underline">GITHUB</a>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic text-sm col-span-2">Aucun projet ajouté.</p>
              )}
            </div>
          </Card>

          {/* Certificats */}
          <Card className="border-none shadow-lg shadow-slate-200/40">
            <SectionHeader title="Certificats" icon={FaCertificate} onAdd={() => setActiveModal('certificates')} />
            <div className="grid gap-6 sm:grid-cols-2">
              {profile?.certificats?.length > 0 ? (
                profile.certificats.map((cert, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                      <FaCertificate size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug">{cert.titre}</h4>
                      <p className="text-slate-500 text-xs mt-1">{cert.organisme}</p>
                      <p className="text-slate-400 text-[10px] mt-1 italic">{cert.date_obtention}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic text-sm col-span-2">Aucun certificat ajouté.</p>
              )}
            </div>
          </Card>

          {/* Evaluations / Feedback Section */}
          <Card className="border-none shadow-xl shadow-slate-200/40 p-8">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                      <FaStar size={20} />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-slate-800">Feedback et Recommandations</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ce que les entreprises disent de votre travail</p>
                   </div>
                </div>
                <div className="bg-amber-50 px-4 py-1.5 rounded-xl border border-amber-100 flex items-center gap-2">
                   <span className="text-xl font-black text-amber-600">
                      {evaluations && evaluations.length > 0 ? (evaluations.reduce((acc, curr) => acc + parseFloat(curr.note), 0) / evaluations.length).toFixed(1) : "0.0"}
                   </span>
                   <div className="flex items-center">
                      <FaStar size={14} className="text-amber-400" />
                   </div>
                </div>
             </div>

             {isEvalLoading ? (
                <div className="py-10 text-center text-slate-400 text-sm">Chargement des avis...</div>
             ) : (!evaluations || evaluations.length === 0) ? (
                <div className="py-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                   <p className="text-sm font-bold text-slate-400 italic">Vous n'avez pas encore reçu d'évaluations.</p>
                </div>
             ) : (
                <div className="grid gap-6 md:grid-cols-2">
                   {evaluations.map((ev, index) => (
                      <div key={index} className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 flex flex-col gap-4 relative group hover:bg-white hover:shadow-lg transition-all">
                         <FaQuoteRight className="absolute top-4 right-4 text-slate-200 opacity-30" size={32} />
                         
                         <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                               <FaStar key={i} size={12} className={i < Math.round(ev.note) ? "text-amber-400" : "text-slate-200"} />
                            ))}
                         </div>

                         <p className="text-slate-600 text-sm italic">"{ev.commentaire || "Pas de commentaire."}"</p>
                         
                         <div className="mt-auto flex items-center gap-3 pt-4 border-t border-slate-100">
                            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-violet font-bold border border-slate-100">
                               {ev.entreprise?.user?.nom?.charAt(0) || "C"}
                            </div>
                            <div>
                               <p className="text-xs font-bold text-slate-800">{ev.entreprise?.user?.nom}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(ev.date_evaluation).toLocaleDateString()}</p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </Card>

        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Personal Info Modal */}
      <Modal 
        open={activeModal === 'personal'} 
        onClose={() => setActiveModal(null)} 
        title="Modifier les informations personnelles"
      >
        <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nom complet" {...personalForm.register("nom")} error={personalForm.formState.errors.nom?.message} />
            <Input label="Email" {...personalForm.register("email")} disabled hint="L'email ne peut pas être modifié." />
            <Input label="Téléphone" {...personalForm.register("telephone")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Date de naissance" type="date" {...personalForm.register("date_naissance")} />
            <Input label="Année d'étude (ex: 2ème année, Master...)" {...personalForm.register("academic_year")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <Input
                label="École/Université"
                value={searchValue}
                placeholder="Rechercher..."
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  personalForm.setValue("universite_id", 0);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                error={personalForm.formState.errors.universite_id?.message}
              />
              {showSuggestions && searchValue && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {universitiesQuery.data?.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm hover:bg-brand-violet/5 hover:text-brand-violet"
                      onMouseDown={() => {
                        personalForm.setValue("universite_id", u.id, { shouldValidate: true });
                        personalForm.setValue("universite_label", u.name);
                        setSearchValue(u.name);
                        setShowSuggestions(false);
                      }}
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Input label="Portfolio / Site web" {...personalForm.register("lien_portfolio")} error={personalForm.formState.errors.lien_portfolio?.message} />
          </div>

          <Input label="Adresse" {...personalForm.register("adresse")} />
          
          <Controller
            control={personalForm.control}
            name="photo_profil"
            render={({ field }) => (
              <FileDropzone
                label="Photo de profil"
                file={field.value}
                onChange={field.onChange}
                hint="JPG, PNG (Max 2MB)"
              />
            )}
          />
          <div className="flex justify-end gap-3 pt-4">
             <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Annuler</Button>
             <Button type="submit" loading={personalMutation.isPending}>Enregistrer</Button>
          </div>
        </form>
      </Modal>

      {/* Compétences Modal */}
      <Modal 
        open={activeModal === 'skills'} 
        onClose={() => setActiveModal(null)} 
        title="Gérer les compétences"
      >
        <form onSubmit={competencesForm.handleSubmit((v) => skillsMutation.mutate(v))} className="space-y-6">
          <Controller
            control={competencesForm.control}
            name="competences"
            render={({ field }) => (
              <TagsInput
                label="Vos compétences"
                tags={field.value || []}
                onChange={field.onChange}
                placeholder="ex: React, Project Management..."
              />
            )}
          />
          <div className="flex justify-end gap-3">
             <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Annuler</Button>
             <Button type="submit" loading={skillsMutation.isPending}>Enregistrer</Button>
          </div>
        </form>
      </Modal>

      {/* Formations Modal */}
      <Modal 
        open={activeModal === 'formations'} 
        onClose={() => setActiveModal(null)} 
        title="Gérer les formations"
      >
        <form onSubmit={formationsForm.handleSubmit((v) => formationsMutation.mutate(v))} className="space-y-6">
          <div className="space-y-4">
            {formationsArray.fields.map((item, index) => (
              <div key={item.id} className="relative p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                <button 
                  type="button" 
                  onClick={() => formationsArray.remove(index)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-rose-500"
                >
                  <FaTrash />
                </button>
                <div className="grid gap-4 sm:grid-cols-2 mt-2">
                  <Input label="Diplôme" {...formationsForm.register(`formations.${index}.diplome`)} />
                  <Input label="Filière" {...formationsForm.register(`formations.${index}.filiere`)} />
                  <div className="relative">
                    <Input 
                      label="Établissement" 
                      {...formationsForm.register(`formations.${index}.universite_label`, {
                        onChange: (e) => {
                          setSearchValue(e.target.value);
                          setShowSuggestions(`formations-${index}`);
                          formationsForm.setValue(`formations.${index}.id_universite`, null);
                        }
                      })}
                      placeholder="Rechercher..."
                      onFocus={(e) => {
                        setSearchValue(e.target.value);
                        setShowSuggestions(`formations-${index}`);
                      }}
                      autoComplete="off"
                    />
                    {showSuggestions === `formations-${index}` && searchValue && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {universitiesQuery.data?.map(u => (
                          <button
                            key={u.id}
                            type="button"
                            className="w-full px-4 py-2 text-left text-sm hover:bg-brand-violet/5 hover:text-brand-violet truncate border-b border-slate-50 last:border-0"
                            onMouseDown={() => {
                              formationsForm.setValue(`formations.${index}.id_universite`, u.id);
                              formationsForm.setValue(`formations.${index}.universite_label`, u.name);
                              setSearchValue(u.name);
                              setShowSuggestions(null);
                            }}
                          >
                            {u.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Niveau d'étude</label>
                    <select {...formationsForm.register(`formations.${index}.niveau`)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-violet/20">
                      <option value="bac">Bac</option>
                      <option value="bac+2">Bac+2</option>
                      <option value="licence">Licence / Bac+3</option>
                      <option value="master">Master / Bac+5</option>
                      <option value="doctorat">Doctorat</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <Input label="Date début" type="date" {...formationsForm.register(`formations.${index}.date_debut`)} />
                  <Input label="Date fin" type="date" {...formationsForm.register(`formations.${index}.date_fin`)} />
                </div>
              </div>
            ))}
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full border-dashed border-2"
              onClick={() => formationsArray.append({})}
            >
              <FaPlus className="mr-2" /> Ajouter une formation
            </Button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
             <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Annuler</Button>
             <Button type="submit" loading={formationsMutation.isPending}>Enregistrer tout</Button>
          </div>
        </form>
      </Modal>

      {/* Expériences Modal */}
      <Modal 
        open={activeModal === 'experiences'} 
        onClose={() => setActiveModal(null)} 
        title="Gérer les expériences"
      >
        <form onSubmit={experiencesForm.handleSubmit((v) => experiencesMutation.mutate(v))} className="space-y-6">
          <div className="space-y-4">
            {experiencesArray.fields.map((item, index) => (
              <div key={item.id} className="relative p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                <button 
                  type="button" 
                  onClick={() => experiencesArray.remove(index)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-rose-500"
                >
                  <FaTrash />
                </button>
                <div className="grid gap-4 sm:grid-cols-2 mt-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Type</label>
                    <select {...experiencesForm.register(`experiences.${index}.type`)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-violet/20">
                      <option value="stage">Stage</option>
                      <option value="emploi">Emploi</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  <Input label="Entreprise" {...experiencesForm.register(`experiences.${index}.nom_entreprise`)} />
                  <Input label="Date début" type="date" {...experiencesForm.register(`experiences.${index}.date_debut`)} />
                  <Input label="Date fin" type="date" {...experiencesForm.register(`experiences.${index}.date_fin`)} />
                </div>
                <div className="mt-4">
                  <TextArea label="Description" rows={3} {...experiencesForm.register(`experiences.${index}.description`)} />
                </div>
                
                <div className="mt-4">
                  <Controller
                    control={experiencesForm.control}
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
                </div>
              </div>
            ))}
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full border-dashed border-2"
              onClick={() => experiencesArray.append({ type: 'stage' })}
            >
              <FaPlus className="mr-2" /> Ajouter une expérience
            </Button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
             <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Annuler</Button>
             <Button type="submit" loading={experiencesMutation.isPending}>Enregistrer tout</Button>
          </div>
        </form>
      </Modal>

      {/* Projets Modal */}
      <Modal 
        open={activeModal === 'projects'} 
        onClose={() => setActiveModal(null)} 
        title="Gérer les projets"
      >
        <form 
          onSubmit={projectsForm.handleSubmit(
            (v) => projectsMutation.mutate(v),
            () => toast.error("Veuillez corriger les erreurs dans le formulaire.")
          )} 
          className="space-y-6"
        >
          <div className="space-y-4">
            {projectsArray.fields.map((item, index) => (
              <div key={item.id} className="relative p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                <button 
                  type="button" 
                  onClick={() => projectsArray.remove(index)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-rose-500"
                >
                  <FaTrash />
                </button>
                <div className="space-y-4 mt-2">
                  <Input 
                    label="Titre du projet" 
                    {...projectsForm.register(`projets.${index}.titre`)} 
                    error={projectsForm.formState.errors.projets?.[index]?.titre?.message} 
                  />
                  <TextArea 
                    label="Description" 
                    rows={2} 
                    {...projectsForm.register(`projets.${index}.description`)} 
                    error={projectsForm.formState.errors.projets?.[index]?.description?.message} 
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Controller
                      control={projectsForm.control}
                      name={`projets.${index}.technologies`}
                      render={({ field }) => (
                        <TagsInput
                          label="Technologies utilisées"
                          tags={field.value || []}
                          onChange={field.onChange}
                          placeholder="Ajouter une technologie..."
                          error={projectsForm.formState.errors.projets?.[index]?.technologies?.message}
                        />
                      )}
                    />
                    <Input 
                      label="Date" 
                      type="date" 
                      {...projectsForm.register(`projets.${index}.date`)} 
                      error={projectsForm.formState.errors.projets?.[index]?.date?.message} 
                    />
                    <Input 
                      label="Lien Démo" 
                      {...projectsForm.register(`projets.${index}.lien_demo`)} 
                      error={projectsForm.formState.errors.projets?.[index]?.lien_demo?.message} 
                      placeholder="https://..."
                    />
                    <Input 
                      label="Lien Code source" 
                      {...projectsForm.register(`projets.${index}.lien_code`)} 
                      error={projectsForm.formState.errors.projets?.[index]?.lien_code?.message} 
                      placeholder="https://github.com/..."
                    />
                  </div>
                  
                  <Controller
                    control={projectsForm.control}
                    name={`projets.${index}.image_apercu`}
                    render={({ field }) => (
                      <FileDropzone
                        label="Image d'aperçu"
                        file={field.value}
                        onChange={field.onChange}
                        hint="Format paysage recommandé (JPG, PNG, max 2MB)"
                      />
                    )}
                  />
                </div>
              </div>
            ))}
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full border-dashed border-2"
              onClick={() => projectsArray.append({})}
            >
              <FaPlus className="mr-2" /> Ajouter un projet
            </Button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
             <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Annuler</Button>
             <Button type="submit" loading={projectsMutation.isPending}>Enregistrer tout</Button>
          </div>
        </form>
      </Modal>

      {/* Certificats Modal */}
      <Modal 
        open={activeModal === 'certificates'} 
        onClose={() => setActiveModal(null)} 
        title="Gérer les certificats"
      >
        <form onSubmit={certificatesForm.handleSubmit((v) => certificatesMutation.mutate(v))} className="space-y-6">
          <div className="space-y-4">
            {certificatesArray.fields.map((item, index) => (
              <div key={item.id} className="relative p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                <button 
                  type="button" 
                  onClick={() => certificatesArray.remove(index)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-rose-500"
                >
                  <FaTrash />
                </button>
                <div className="grid gap-4 sm:grid-cols-2 mt-2">
                  <Input label="Titre du certificat" {...certificatesForm.register(`certificats.${index}.titre`)} />
                  <Input label="Organisme" {...certificatesForm.register(`certificats.${index}.organisme`)} />
                  <Input label="Date d'obtention" type="date" {...certificatesForm.register(`certificats.${index}.date_obtention`)} />
                </div>
              </div>
            ))}
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full border-dashed border-2"
              onClick={() => certificatesArray.append({})}
            >
              <FaPlus className="mr-2" /> Ajouter un certificat
            </Button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
             <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>Annuler</Button>
             <Button type="submit" loading={certificatesMutation.isPending}>Enregistrer tout</Button>
          </div>
        </form>
      </Modal>

    </AppShell>
  );
}
