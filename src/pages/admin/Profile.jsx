import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaSave, 
  FaSignOutAlt, 
  FaCheckCircle,
  FaExclamationTriangle 
} from "react-icons/fa";
import { toast } from "react-toastify";

import AppShell from "../../components/layout/AppShell";
import { Card, Button, Input } from "../../components";
import { fetchAdminProfile, updateAdminProfile, logout } from "../../services/endpoints";
import { useAuth } from "../../hooks";

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user: authUser, clearAuth, setAuthUser } = useAuth();
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    password: "",
    password_confirmation: ""
  });

  const { data: user } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: fetchAdminProfile,
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nom: user.nom || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: (data) => {
      toast.success(data.message || "Profil mis à jour !");
      setFormData(prev => ({ ...prev, password: "", password_confirmation: "" }));
      // Sync with global auth state
      if (data.user) {
        setAuthUser({
          ...authUser,
          nom: data.user.nom,
          email: data.user.email
        });
      }
    },
    onError: (err) => {
      const errors = err.response?.data;
      if (errors && typeof errors === 'object') {
        Object.values(errors).flat().forEach(msg => toast.error(msg));
      } else {
        toast.error("Erreur lors de la mise à jour.");
      }
    }
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
      navigate("/login");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.password_confirmation) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <AppShell 
      title="Mon Profil" 
      subtitle="Gérez vos informations personnelles et paramètres de sécurité"
    >
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Info Summary */}
        <div className="lg:col-span-1">
          <Card className="text-center p-8">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-brand-violet/10 text-brand-violet ring-8 ring-brand-violet/5">
              <FaUser className="text-4xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">{user?.nom || "Admin"}</h2>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Administrateur Système</p>
            
            <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
               <div className="flex items-center gap-3 text-sm text-slate-600">
                  <FaEnvelope className="text-slate-400" />
                  <span>{user?.email}</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-600">
                  <FaCheckCircle className="text-emerald-500" />
                  <span>Accès Administration Total</span>
               </div>
            </div>

            <Button 
              block 
              variant="outline" 
              className="mt-10 border-red-100 text-red-500 hover:bg-red-50"
              leftIcon={<FaSignOutAlt />}
              onClick={() => logoutMutation.mutate()}
              loading={logoutMutation.isPending}
            >
              Se déconnecter
            </Button>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card 
            title="Modifier mes informations" 
            subtitle="Mettez à jour votre nom, email ou changez votre mot de passe"
          >
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Nom complet"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  placeholder="Votre nom"
                  leftIcon={<FaUser className="text-slate-400" />}
                  required
                />
                <Input
                  label="Adresse Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@talentlink.com"
                  leftIcon={<FaEnvelope className="text-slate-400" />}
                  required
                />
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                  <FaLock className="text-slate-400" /> Sécurité du compte
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <Input
                    label="Nouveau mot de passe"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Laissez vide pour conserver l'actuel"
                    leftIcon={<FaLock className="text-slate-400" />}
                  />
                  <Input
                    label="Confirmer le mot de passe"
                    name="password_confirmation"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    placeholder="Confirmez votre nouveau mot de passe"
                    leftIcon={<FaLock className="text-slate-400" />}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400 italic">
                  <FaExclamationTriangle className="inline mr-1" /> 
                  Le mot de passe doit contenir au moins 8 caractères.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg"
                  leftIcon={<FaSave />}
                  isLoading={updateMutation.isPending}
                >
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
