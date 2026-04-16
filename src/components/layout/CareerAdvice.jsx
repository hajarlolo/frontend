import { useState, useEffect } from "react";
import { FaLightbulb } from "react-icons/fa";

const advices = [
  "Un profil LinkedIn optimisé avec des mots-clés sectoriels multiplie par trois vos opportunités de recrutement.",
  "Une lettre de motivation ciblée sur les besoins de l'entreprise augmente significativement vos chances d'être convoqué.",
  "Un réseau professionnel actif vous ouvre des portes invisibles sur le marché caché de l'emploi.",
  "Une préparation sérieuse aux questions d'entretien transforme votre stress en confiance communicative.",
  "Un titre de profil accrocheur sur votre CV capte l'attention du recruteur dès les premières secondes.",
  "Une veille sectorielle régulière renforce votre crédibilité et votre valeur aux yeux des employeurs.",
  "Un portfolio en ligne bien structuré remplace avantageusement dix lignes de description sur un CV.",
  "Une relance courtoise après un entretien distingue votre candidature de celles des autres postulants.",
  "Un objectif professionnel clair et précis guide les recruteurs vers le bon poste pour vous.",
  "Une expérience de bénévolat pertinente comble efficacement un trou dans votre parcours professionnel.",
  "Un CV d'une page bien structuré retient l'attention d'un recruteur plus longtemps qu'un document dense.",
  "Une formation complémentaire ciblée booste votre employabilité dans un secteur en pleine transformation.",
  "Un discours d'ascenseur bien rodé maximise l'impact de chaque rencontre professionnelle imprévue.",
  "Une présence active dans des événements de networking accélère votre transition vers un nouveau secteur.",
  "Un entretien bien préparé sur la culture d'entreprise prouve votre motivation bien au-delà des compétences techniques.",
  "Une recommandation LinkedIn sincère d'un ancien manager renforce votre crédibilité auprès des recruteurs.",
  "Un suivi régulier de vos candidatures vous permet d'identifier les approches les plus efficaces rapidement.",
  "Une photo professionnelle sur votre profil en ligne augmente nettement votre taux de réponse.",
  "Un ton authentique et direct dans votre lettre de motivation vous démarque des candidatures génériques.",
  "Une spécialisation affirmée dans un domaine précis vous rend plus attractif qu'un profil trop généraliste.",
  "Un entretien informationnel avec un professionnel du secteur vous donne des informations inaccessibles en ligne.",
  "Une mise en valeur chiffrée de vos réalisations convainc les recruteurs bien mieux que de simples descriptifs.",
  "Un profil cohérent entre votre CV et LinkedIn évite les doutes et renforce la confiance du recruteur.",
  "Une candidature spontanée bien argumentée peut débloquer un poste encore non publié officiellement.",
  "Un résumé percutant en haut de votre CV donne immédiatement envie au recruteur de continuer sa lecture.",
  "Une attitude positive et proactive en entretien compense souvent un léger manque d'expérience technique.",
  "Un CV adapté aux systèmes ATS augmente vos chances de passer le premier filtre automatique de sélection.",
  "Une maîtrise démontrée des outils numériques du secteur renforce votre attractivité sur le marché actuel.",
  "Un changement de secteur bien raconté dans votre pitch transforme une faiblesse perçue en atout différenciant.",
  "Une connaissance approfondie des concurrents de l'entreprise impressionne toujours lors d'un entretien.",
  "Un titre de poste clairement visible sur votre CV aide le recruteur à vous positionner immédiatement.",
  "Une participation visible à des forums professionnels en ligne accroît votre notoriété dans votre domaine.",
  "Un retour constructif après un refus vous permet d'améliorer votre candidature pour la prochaine opportunité.",
  "Une mobilité géographique mentionnée explicitement élargit considérablement votre bassin d'opportunités professionnelles.",
  "Un mentorat avec un expert du secteur accélère votre progression et affine votre stratégie de carrière.",
  "Une disponibilité rapide clairement indiquée sur votre candidature peut faire basculer un choix en votre faveur.",
  "Un blog professionnel régulièrement alimenté démontre votre expertise bien mieux qu'un diplôme seul.",
  "Une écoute active en entretien vous permet de reformuler vos réponses selon les besoins réels du poste.",
  "Un réseau d'anciens étudiants bien entretenu multiplie vos introductions à des décideurs clés de votre secteur.",
  "Une compétence linguistique supplémentaire valorisée sur votre CV élargit immédiatement votre champ d'opportunités.",
  "Un projet personnel abouti présenté en entretien prouve votre initiative bien au-delà de vos expériences passées.",
  "Une recherche approfondie sur le poste avant l'entretien vous permet de poser des questions réellement stratégiques.",
  "Un profil de compétences mis à jour chaque trimestre maintient votre candidature compétitive sur le long terme.",
  "Une présence sur des plateformes spécialisées à votre secteur vous connecte aux recruteurs les plus pertinents.",
  "Un CV sans fautes d'orthographe évite une élimination immédiate dans plus de la moitié des recrutements.",
  "Une approche personnalisée pour chaque recruteur sur LinkedIn génère un taux de réponse nettement supérieur.",
  "Un projet de formation continue affiché clairement rassure les recruteurs sur votre capacité d'adaptation.",
  "Une expérience internationale bien mise en valeur distingue votre profil dans des environnements multiculturels.",
  "Un objectif de reconversion clairement assumé inspire la confiance plutôt que la méfiance chez le recruteur.",
  "Un suivi de votre e-réputation régulier vous évite de perdre des opportunités à cause d'un contenu inadapté en ligne."
];

export default function CareerAdvice() {
  const [advice, setAdvice] = useState("");

  useEffect(() => {
    // Select a random advice on mount
    const randomAdvice = advices[Math.floor(Math.random() * advices.length)];
    setAdvice(randomAdvice);
  }, []);

  if (!advice) return null;

  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-violet to-brand-magenta p-6 text-white shadow-lg shadow-brand-violet/20 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-white/20 rounded-lg shadow-inner">
          <FaLightbulb className="text-xl text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]" />
        </div>
        <h3 className="font-bold text-sm tracking-wide">Conseil Carrière</h3>
      </div>
      <p className="text-sm opacity-90 leading-relaxed italic font-medium">
        "{advice}"
      </p>
    </div>
  );
}
