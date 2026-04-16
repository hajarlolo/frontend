import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import AppShell from "../../components/layout/AppShell";
import { Card, Button, Input, Select } from "../../components";
import { api as axios } from "../../services/api";
import { FaCamera, FaStar, FaQuoteRight } from "react-icons/fa";
import { getStorageUrl } from "../../utils/helpers";
import { Avatar, Badge } from "../../components";

export default function EnterpriseProfile() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    ice: "",
    email_professionnel: "",
    telephone: "",
    localisation: "",
    secteur_activite: "",
    taille: "",
    site_web: "",
    description: "",
    logo: null,
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["enterprise-profile"],
    queryFn: async () => {
      const { data } = await axios.get("/company/profile");
      return data;
    },
  });
  
  // Fetch evaluations targeting this enterprise
  const { data: evaluations, isLoading: isEvalLoading } = useQuery({
    queryKey: ["enterprise-evaluations", profile?.entreprise?.id_entreprise],
    queryFn: async () => {
      const { data } = await axios.get(`/evaluations/entreprise/${profile.entreprise.id_entreprise}`);
      return data;
    },
    enabled: !!profile?.entreprise?.id_entreprise,
  });

  useEffect(() => {
    if (profile?.entreprise) {
      setFormData({
        nom: profile.entreprise.user?.nom || "",
        ice: profile.entreprise.ice || "",
        email_professionnel: profile.entreprise.email_professionnel || "",
        telephone: profile.entreprise.telephone || "",
        localisation: profile.entreprise.localisation || "",
        secteur_activite: profile.entreprise.secteur_activite || "",
        taille: profile.entreprise.taille || "",
        site_web: profile.entreprise.site_web || "",
        description: profile.entreprise.description || "",
        logo: null,
      });
      if (profile.entreprise.logo_url) {
        setLogoPreview(getStorageUrl(profile.entreprise.logo_url));
      }
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const form = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== null) {
          form.append(key, data[key]);
        }
      });
      const { data: response } = await axios.post("/company/profile/update", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["enterprise-profile"]);
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès !");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <AppShell title="Chargement..."><Card>Patientez s'il vous plaît...</Card></AppShell>;
  }

  return (
    <AppShell 
      title="Profil Entreprise" 
      subtitle="Gérez les informations de votre entreprise et votre logo."
      actions={
        !isEditing && (
          <Button onClick={() => setIsEditing(true)}>Modifier le profil</Button>
        )
      }
    >
      <div className="grid gap-6">
        <Card className="overflow-hidden p-0">
          <div className="h-32 bg-gradient-to-r from-brand-violet to-brand-magenta opacity-80" />
          <div className="px-8 pb-8">
            <div className="-mt-12 flex flex-col sm:flex-row sm:items-end gap-6">
              <div className="relative group shrink-0">
                <div className="h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-xl transition-transform group-hover:scale-105">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-black text-slate-300">
                      {formData.nom?.charAt(0)}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-violet text-white shadow-lg transition-all hover:bg-brand-magenta hover:scale-110 active:scale-95 z-10"
                  >
                    <FaCamera />
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
              <div className="mb-2 flex-1 pt-4 sm:pt-0">
                <h2 className="text-3xl font-black text-slate-900 break-words leading-tight">{formData.nom}</h2>
                <p className="text-sm font-bold text-brand-violet uppercase tracking-widest break-words mt-2">{formData.secteur_activite || "Secteur non défini"}</p>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Input label="Nom de l'entreprise" name="nom" value={formData.nom} onChange={handleChange} required />
                  <Input label="ICE" name="ice" value={formData.ice} onChange={handleChange} />
                  <Input label="Email Professionnel" type="email" name="email_professionnel" value={formData.email_professionnel} onChange={handleChange} required />
                  <Input label="Téléphone" name="telephone" value={formData.telephone} onChange={handleChange} />
                  <Input label="Localisation" name="localisation" value={formData.localisation} onChange={handleChange} />
                  <Select label="Taille entreprise" name="taille" value={formData.taille} onChange={handleChange}>
                    <option value="">Sélectionnez la taille</option>
                    <option value="TPE">TPE (Moins de 10 salariés)</option>
                    <option value="PME">PME (10 à 250 salariés)</option>
                    <option value="Grande">Grande (Plus de 250 salariés)</option>
                  </Select>
                  <Input label="Site Web" name="site_web" value={formData.site_web} onChange={handleChange} />
                  <Input label="Secteur d'activité" name="secteur_activite" value={formData.secteur_activite} onChange={handleChange} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">Description de l'entreprise</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-medium focus:border-brand-violet focus:ring-4 focus:ring-brand-violet/10 transition-all outline-none"
                    rows="5"
                    placeholder="Décrivez votre entreprise, votre mission et vos valeurs..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Annuler</Button>
                  <Button type="submit" loading={updateMutation.isPending} className="px-8 shadow-lg shadow-brand-violet/20 font-bold">
                    Enregistrer les modifications
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-12 grid gap-12 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-6">
                  <InfoItem label="Email" value={formData.email_professionnel} />
                  <InfoItem label="Téléphone" value={formData.telephone} />
                  <InfoItem label="ICE" value={formData.ice} />
                  <InfoItem label="Localisation" value={formData.localisation} />
                </div>
                <div className="lg:col-span-1 space-y-6">
                  <InfoItem label="Site Web" value={formData.site_web ? <a href={formData.site_web} target="_blank" rel="noreferrer" className="text-brand-violet font-bold hover:underline">{formData.site_web}</a> : null} />
                  <InfoItem label="Taille" value={formData.taille} />
                  <InfoItem label="Secteur" value={formData.secteur_activite} />
                </div>
                <div className="lg:col-span-1">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">À propos</h3>
                  <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap italic">
                    {formData.description || "Aucune description de l'entreprise n'a été rédigée pour le moment."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Evaluations Section */}
        <Card className="border-none shadow-xl shadow-slate-200/40 p-8">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <FaStar className="text-amber-400" /> Feedback et Évaluations
                 </h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ce que les candidats disent de vous</p>
              </div>
              <div className="bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                 <span className="text-2xl font-black text-amber-600">
                    {evaluations?.length > 0 ? (evaluations.reduce((acc, curr) => acc + parseFloat(curr.note), 0) / evaluations.length).toFixed(1) : "0.0"}
                 </span>
                 <span className="text-sm font-bold text-amber-400 ml-1">/ 5</span>
              </div>
           </div>

           {isEvalLoading ? (
              <div className="py-10 text-center text-slate-400">Chargement des avis...</div>
           ) : (!evaluations || evaluations.length === 0) ? (
              <div className="py-16 text-center bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100">
                 <div className="text-slate-300 mb-4 flex justify-center"><FaQuoteRight size={32} className="opacity-20" /></div>
                 <p className="font-bold text-slate-400">Aucune évaluation reçue pour le moment.</p>
              </div>
           ) : (
              <div className="grid gap-6 md:grid-cols-2">
                 {evaluations?.map((ev, index) => (
                    <div key={index} className="p-6 rounded-[32px] bg-slate-50/50 border border-slate-100 flex flex-col gap-4 relative group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                       <FaQuoteRight className="absolute top-6 right-6 text-slate-100 group-hover:text-brand-violet/5 transition-colors" size={40} />
                       
                       <div className="flex items-center gap-3">
                          {[...Array(5)].map((_, i) => (
                             <FaStar key={i} size={14} className={i < Math.round(ev.note) ? "text-amber-400" : "text-slate-200"} />
                          ))}
                       </div>

                       <p className="text-slate-600 font-medium italic relative z-10">"{ev.commentaire || "Pas de commentaire."}"</p>
                       
                       <div className="mt-auto flex items-center gap-3 pt-4 border-t border-slate-100/50">
                          <Avatar size={32} src={getStorageUrl(ev.candidat?.user?.photo_profil)} alt="Avatar" />
                          <div>
                             <p className="text-sm font-bold text-slate-800">{ev.candidat?.user?.prenom} {ev.candidat?.user?.nom}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(ev.date_evaluation).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </Card>
      </div>
    </AppShell>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="group flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 group-hover:text-brand-violet transition-colors block">{label}</span>
      <span className="font-bold text-slate-800 text-lg break-words whitespace-normal block">{value || "—"}</span>
    </div>
  );
}
