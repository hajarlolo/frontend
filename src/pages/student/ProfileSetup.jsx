import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaTimes, FaSave, FaArrowLeft } from 'react-icons/fa';
import AppShell from '../../components/layout/AppShell';
import { Button, Card, Input, TagsInput } from '../../components';
import { Controller } from 'react-hook-form';
import CvParser from '../../components/common/CvParser';
import { api } from '../../services/api';

const profileSchema = z.object({
  nom_complet: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(1, 'Téléphone requis'),
  country: z.string().optional(),
  city: z.string().optional(),
  annee_etude: z.string().optional(),
  date_naissance: z.string().min(1, 'Date de naissance requise'),
  lien_portfolio: z.string().url('URL invalide').optional().or(z.literal('')),
  universite_id: z.string().min(1, 'Université requise'),
  competences: z.array(z.string()).optional(),
  experiences: z.array(z.object({
    type: z.string(),
    titre: z.string(),
    entreprise_nom: z.string().optional(),
    description: z.string().optional(),
    date_debut: z.string(),
    date_fin: z.string().optional(),
    en_cours: z.boolean().optional(),
  })).optional(),
  formations: z.array(z.object({
    diplome: z.string(),
    filiere: z.string(),
    niveau: z.string(),
    etablissement: z.string(),
    date_debut: z.string(),
    date_fin: z.string().optional(),
    en_cours: z.boolean().optional(),
  })).optional(),
  projets: z.array(z.object({
    titre: z.string(),
    description: z.string(),
    technologies: z.array(z.string()).optional().default([]),
    date: z.string(),
    lien_demo: z.string().url().optional().or(z.literal('')),
    lien_code: z.string().url().optional().or(z.literal('')),
  })).optional(),
  certificats: z.array(z.object({
    titre: z.string(),
    organisme: z.string(),
    date_obtention: z.string(),
  })).optional(),
});

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [showCvParser, setShowCvParser] = useState(true);
  const [parsedData, setParsedData] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nom_complet: '',
      email: '',
      telephone: '',
      adresse: '',
      annee_etude: '',
      date_naissance: '',
      portfolio: '',
      ecole_actuelle: '',
      competences: [],
      experiences: [],
      formations: [],
      projets: [],
      certificats: [],
    },
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: 'experiences',
  });

  const {
    fields: formationFields,
    append: appendFormation,
    remove: removeFormation,
  } = useFieldArray({
    control,
    name: 'formations',
  });

  const {
    fields: projetFields,
    append: appendProjet,
    remove: removeProjet,
  } = useFieldArray({
    control,
    name: 'projets',
  });

  const {
    append: appendCertificat,
  } = useFieldArray({
    control,
    name: 'certificats',
  });

  const handleCvParseSuccess = (data) => {
    setParsedData(data);
    
    // Fill form with parsed data
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        if (Array.isArray(data[key])) {
          // Handle array fields separately
          if (key === 'experiences' && data[key].length > 0) {
            data[key].forEach((item, index) => {
              appendExperience(item);
            });
          } else if (key === 'formations' && data[key].length > 0) {
            data[key].forEach((item, index) => {
              appendFormation(item);
            });
          } else if (key === 'projets' && data[key].length > 0) {
            data[key].forEach((item, index) => {
              appendProjet(item);
            });
          } else if (key === 'certificats' && data[key].length > 0) {
            data[key].forEach((item, index) => {
              appendCertificat(item);
            });
          } else if (key === 'competences') {
            setValue(key, data[key]);
          }
        } else if (key === 'country' || key === 'city') {
          setValue(key, data[key]);
        } else {
          // Handle simple fields
          setValue(key, data[key]);
        }
      }
    });

    setShowCvParser(false);
  };

  const onSubmit = async (data) => {
    try {
      console.log('=== Submitting Profile Data ===');
      console.log('Form data:', data);
      console.log('Form errors:', errors);
      
      // Save profile data
      const response = await api.post('/student/profile', data);
      console.log('Save response:', response.data);
      
      // Navigate to dashboard
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Failed to save profile:', error);
      console.error('Error response:', error.response?.data);
      alert('Erreur lors de la sauvegarde du profil: ' + (error.response?.data?.message || error.message));
    }
  };

  const addSkill = (skill) => {
    const currentSkills = watch('competences') || [];
    if (skill && !currentSkills.includes(skill)) {
      setValue('competences', [...currentSkills, skill]);
    }
  };

  const removeSkill = (skillToRemove) => {
    const currentSkills = watch('competences') || [];
    setValue('competences', currentSkills.filter(skill => skill !== skillToRemove));
  };

  if (showCvParser) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto py-8">
          <div className="mb-8">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <FaArrowLeft />
              Retour au tableau de bord
            </button>
            <h1 className="text-3xl font-bold text-slate-800 mt-4">Configuration du profil</h1>
            <p className="text-slate-600 mt-2">
              Complétez votre profil en utilisant l'analyse automatique de CV ou manuellement
            </p>
          </div>

          <div className="flex justify-center">
            <CvParser onParseSuccess={handleCvParseSuccess} />
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setShowCvParser(false)}
              className="text-brand-violet hover:text-brand-magenta font-medium"
            >
              Je préfère remplir mon profil manuellement
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <FaArrowLeft />
            Retour au tableau de bord
          </button>
          <h1 className="text-3xl font-bold text-slate-800 mt-4">Configuration du profil</h1>
          <p className="text-slate-600 mt-2">
            {parsedData ? 'Vérifiez et modifiez les informations extraites de votre CV' : 'Remplissez les informations de votre profil'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Informations de base</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom complet *
                </label>
                <Input
                  {...register('nom_complet')}
                  placeholder="Votre nom complet"
                  error={errors.nom_complet?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="votre@email.com"
                  error={errors.email?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Téléphone
                </label>
                <Input
                  {...register('telephone')}
                  placeholder="+212 6 XX XX XX XX"
                  error={errors.telephone?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pays
                </label>
                <Input
                  {...register('country')}
                  placeholder="Pays"
                  error={errors.country?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ville
                </label>
                <Input
                  {...register('city')}
                  placeholder="Ville"
                  error={errors.city?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Année d'étude
                </label>
                <Input
                  {...register('annee_etude')}
                  placeholder="1ère année, 2ème année, etc."
                  error={errors.annee_etude?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date de naissance *
                </label>
                <Input
                  {...register('date_naissance')}
                  type="date"
                  error={errors.date_naissance?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Université *
                </label>
                <select
                  {...register('universite_id')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent"
                >
                  <option value="">Sélectionnez une université</option>
                                    </select>
                {errors.universite_id?.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.universite_id?.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Portfolio
                </label>
                <Input
                  {...register('lien_portfolio')}
                  placeholder="https://votreportfolio.com"
                  error={errors.lien_portfolio?.message}
                />
              </div>
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Compétences</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(watch('competences') || []).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-brand-violet/10 text-brand-violet rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-brand-violet/60 hover:text-brand-violet"
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter une compétence"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    addSkill(input.value);
                    input.value = '';
                  }}
                  className="px-4"
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </Card>

          {/* Formations */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Formations</h2>
            <div className="space-y-4">
              {formationFields.map((field, index) => (
                <div key={field.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Diplôme</label>
                      <Input {...register(`formations.${index}.diplome`)} placeholder="Nom du diplôme" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Filière</label>
                      <Input {...register(`formations.${index}.filiere`)} placeholder="Domaine d'étude" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Établissement</label>
                      <Input {...register(`formations.${index}.etablissement`)} placeholder="Nom de l'établissement" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Niveau</label>
                      <select {...register(`formations.${index}.niveau`)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-violet focus:border-transparent">
                        <option value="bac">Bac</option>
                        <option value="bac+2">Bac+2</option>
                        <option value="licence">Licence</option>
                        <option value="master">Master</option>
                        <option value="doctorat">Doctorat</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Date de début</label>
                      <Input {...register(`formations.${index}.date_debut`)} type="date" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Date de fin</label>
                      <Input {...register(`formations.${index}.date_fin`)} type="date" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFormation(index)}
                    className="mt-4 text-red-500 hover:text-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => appendFormation({
                  diplome: '',
                  filiere: '',
                  niveau: 'bac',
                  etablissement: '',
                  date_debut: '',
                  date_fin: '',
                  en_cours: false
                })}
              >
                Ajouter une formation
              </Button>
            </div>
          </Card>

          {/* Projects */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Projets</h2>
            <div className="space-y-4">
              {projetFields.map((field, index) => (
                <div key={field.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Titre du projet</label>
                      <Input {...register(`projets.${index}.titre`)} placeholder="Nom du projet" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                      <Input {...register(`projets.${index}.date`)} type="date" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                      <Input {...register(`projets.${index}.description`)} placeholder="Description du projet" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Lien démo</label>
                      <Input {...register(`projets.${index}.lien_demo`)} placeholder="https://demo.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Lien code source</label>
                      <Input {...register(`projets.${index}.lien_code`)} placeholder="https://github.com" />
                    </div>
                    <div className="md:col-span-2">
                      <Controller
                        control={control}
                        name={`projets.${index}.technologies`}
                        render={({ field }) => (
                          <TagsInput
                            label="Technologies"
                            tags={field.value || []}
                            onChange={field.onChange}
                            placeholder="Ajouter une technologie..."
                          />
                        )}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProjet(index)}
                    className="mt-4 text-red-500 hover:text-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => appendProjet({
                  titre: '',
                  description: '',
                  technologies: [],
                  date: '',
                  lien_demo: '',
                  lien_code: ''
                })}
              >
                Ajouter un projet
              </Button>
            </div>
          </Card>

          {/* Experiences */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Expériences</h2>
            <div className="space-y-4">
              {experienceFields.map((field, index) => (
                <div key={field.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Titre du poste/projet</label>
                      <Input {...register(`experiences.${index}.titre`)} placeholder="Ex: Développeur Web" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Entreprise</label>
                      <Input {...register(`experiences.${index}.entreprise_nom`)} placeholder="Nom de l'entreprise" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                      <select {...register(`experiences.${index}.type`)} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                        <option value="stage">Stage</option>
                        <option value="emploi">Emploi</option>
                        <option value="freelance">Freelance</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                      <Input {...register(`experiences.${index}.description`)} placeholder="Description de l'expérience" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Date de début</label>
                      <Input {...register(`experiences.${index}.date_debut`)} type="date" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Date de fin</label>
                      <Input {...register(`experiences.${index}.date_fin`)} type="date" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">En cours</label>
                      <input
                        type="checkbox"
                        {...register(`experiences.${index}.en_cours`)}
                        className="w-4 h-4 text-brand-violet border-slate-300 rounded focus:ring-brand-violet"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="mt-4 text-red-500 hover:text-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => appendExperience({
                  type: 'stage',
                  titre: '',
                  entreprise_nom: '',
                  description: '',
                  date_debut: '',
                  date_fin: '',
                  en_cours: false
                })}
              >
                Ajouter une expérience
              </Button>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (parsedData) {
                  setShowCvParser(true);
                } else {
                  navigate('/student/dashboard');
                }
              }}
            >
              {parsedData ? 'Réanalyser le CV' : 'Annuler'}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <FaSave />
              {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder le profil'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
