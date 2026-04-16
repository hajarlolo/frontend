import React, { useState } from "react";
import AppShell from "../../components/layout/AppShell";
import { Card, Button, Badge } from "../../components";
import { FaCloudUploadAlt, FaCheckCircle, FaSearch, FaSyncAlt, FaFilePdf } from "react-icons/fa";
import { toast } from "react-toastify";

export default function StudentCvScanner() {
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Mock scan logic
  const handleScan = () => {
    if (!file) {
      toast.error("Veuillez sélectionner un CV");
      return;
    }
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setResult({
        name: "Amine El Amrani",
        email: "amine.elamrani@example.ma",
        skills: "React, Laravel, Node.js, SQL, Tailwind CSS",
        experience: "3 ans chez TechDev, Stage chez Digital Solution",
        education: "Master en Ingénierie des Systèmes d'Information",
        certificats: " base de donnee, securite des systeme d'information",
        projets: "bbbbbbbb,bbbbbb"
      });
      setShowResult(true);
    }, 3000);
  };

  const handleDecision = (useScanned) => {
    if (useScanned) {
      toast.success("Vos données ont été mises à jour avec les informations scannées !");
    } else {
      toast.success("Données actuelles conservées.");
    }
    setFile(null);
    setShowResult(false);
    setResult(null);
  };

  return (
    <AppShell title="Scanner mon CV" subtitle="Automatisez la saisie de votre profil">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-none bg-gradient-to-br from-brand-violet/5 to-white shadow-sm ring-1 ring-brand-violet/10 p-8">
            <h3 className="mb-4 text-xl font-bold text-slate-800">1. Charger votre CV</h3>
            <p className="mb-6 text-sm text-slate-500 leading-relaxed">
              Téléchargez votre CV au format PDF ou DOCX. Notre intelligence artificielle identifiera vos compétences et expériences en quelques secondes.
            </p>

            <label className="group relative block cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center transition-all hover:border-brand-violet hover:bg-brand-violet/5">
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => setFile(e.target.files[0])}
              />
              <FaCloudUploadAlt size={48} className="mx-auto mb-4 text-slate-300 transition-colors group-hover:text-brand-violet" />
              <p className="text-sm font-bold text-slate-700">
                {file ? (
                  <span className="flex items-center justify-center gap-2 text-brand-violet">
                    <FaFilePdf size={24} /> {file.name}
                  </span>
                ) : (
                  <>Déposez votre fichier ici <span className="block text-xs text-slate-400 mt-1">(PDF, DOCX)</span></>
                )}
              </p>
            </label>

            <Button 
               className="mt-8 w-full justify-center rounded-2xl bg-brand-violet py-4 text-white shadow-lg shadow-brand-violet/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
               onClick={handleScan}
               isLoading={scanning}
               disabled={!file || scanning}
            >
               {scanning ? "Analyse en cours..." : "Lancer l'IA"}
            </Button>
          </Card>
          
          <div className="rounded-3xl border border-brand-violet/20 bg-brand-violet/5 p-8 flex items-start gap-4">
               <div className="rounded-2xl bg-brand-violet/10 p-4 text-brand-violet shadow-sm">
                  <FaSyncAlt className={scanning ? 'animate-spin' : ''} />
               </div>
               <div>
                  <h4 className="font-bold text-slate-800">Technologie TalentScan™</h4>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                     L'IA extrait automatiquement vos coordonnées, formations, expériences et compétences pour les injecter directement dans votre profil TalentLink.
                  </p>
               </div>
          </div>
        </div>

        <div className="relative">
          {!showResult ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-3xl bg-slate-50 p-12 text-center ring-1 ring-slate-100 italic text-slate-400 transition-all">
              <FaSearch size={40} className="mb-4 opacity-20" />
              <p>Le résultat de l'IA s'affichera ici après l'analyse.</p>
            </div>
          ) : (
            <Card className="h-full border-none bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <FaCheckCircle className="text-green-500" /> Profil Détecté
                </h3>
                <Badge className="bg-green-100 text-green-700 animate-pulse">Scan Réussi</Badge>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom Complet</label>
                  <p className="mt-1 text-lg font-bold text-brand-violet">{result.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">E-mail</label>
                  <p className="mt-1 font-semibold text-slate-700">{result.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Compétences</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.skills.split(',').map((skill, i) => (
                      <span key={i} className="rounded-lg bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-100">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expérience</label>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed leading-relaxed font-medium">
                    {result.experience}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Formation</label>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">
                    {result.education}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Certificats</label>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">
                    {result.certificats}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Projets</label>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">
                    {result.projets}
                  </p>
                </div>  
              </div>

              <div className="mt-10 border-t border-slate-50 pt-8">
                 <p className="mb-6 text-center text-sm font-bold text-slate-500">
                    Souhaitez-vous conserver vos anciennes données ou les remplacer par ces nouvelles informations ?
                 </p>
                 <div className="grid gap-3 sm:grid-cols-2">
                    <Button 
                       onClick={() => handleDecision(false)}
                       className="rounded-xl bg-slate-100 text-slate-600 border-none justify-center py-4 hover:bg-slate-200"
                    >
                       Garder l'ancien
                    </Button>
                    <Button 
                       onClick={() => handleDecision(true)}
                       className="rounded-xl bg-brand-violet text-white border-none justify-center py-4 shadow-lg shadow-brand-violet/20 hover:scale-[1.02]"
                    >
                       Utiliser le scan
                    </Button>
                 </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
