import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppShell from "../../components/layout/AppShell";
import { Card, Input, Select, Badge, Button, Skeleton } from "../../components";
import { fetchAdminOffers } from "../../services/endpoints";
import { IoSearchOutline, IoEyeOutline, IoFlagOutline } from "react-icons/io5";

export default function Offers() {
  const [filters, setFilters] = useState({ status: "", type: "", search: "" });

  const { data: offers, isLoading } = useQuery({
    queryKey: ["admin-offers", filters],
    queryFn: () => fetchAdminOffers(filters),
  });

  const filteredOffers = (offers || []).filter(o => {
    if (filters.status && o.status !== filters.status) return false;
    if (filters.type && o.type !== filters.type) return false;
    if (filters.search && !o.title.toLowerCase().includes(filters.search.toLowerCase()) && !o.company.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppShell title="Gestion des Offres" subtitle="Emplois, Stages et Missions Freelance">
      <Card>
        <div className="flex flex-wrap gap-4 items-end">
          <Input 
            label="Recherche" 
            placeholder="Titre, entreprise..." 
            className="flex-1"
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
          />
          <Select 
            label="Type" 
            className="w-48"
            onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
          >
            <option value="">Tous</option>
            <option value="emploi">Emploi</option>
            <option value="stage">Stage</option>
            <option value="freelance">Freelance</option>
          </Select>
          <Select 
            label="Statut" 
            className="w-48"
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">Tous</option>
            <option value="publie">Publié</option>
            <option value="ferme">Fermé</option>
          </Select>
        </div>
      </Card>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-700">Titre</th>
              <th className="px-6 py-4 font-bold text-slate-700">Entreprise</th>
              <th className="px-6 py-4 font-bold text-slate-700">Type</th>
              <th className="px-6 py-4 font-bold text-slate-700">Candidats</th>
              <th className="px-6 py-4 font-bold text-slate-700">Statut</th>
              <th className="px-6 py-4 font-bold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-10" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                </tr>
              ))
            ) : (
                filteredOffers.map(offer => (
                <tr key={offer.id + offer.type} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{offer.title}</td>
                  <td className="px-6 py-4 text-slate-600">{offer.company}</td>
                  <td className="px-6 py-4 capitalize text-slate-500">{offer.type}</td>
                  <td className="px-6 py-4 text-slate-900 font-medium">{offer.applicants}</td>
                  <td className="px-6 py-4">
                    <Badge value={offer.status === 'publie' ? 'publiée' : 'fermée'} />
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button size="sm" variant="ghost" className="p-2"><IoEyeOutline /></Button>
                    <Button size="sm" variant="ghost" className="p-2 text-red-500 hover:bg-red-50"><IoFlagOutline /></Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
