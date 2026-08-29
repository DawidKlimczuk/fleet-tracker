"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Car, 
  Wrench, 
  Fuel, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  Receipt, 
  BarChart3, 
  X,
  Loader2
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { getFleetData, createVehicle, createExpense } from "./actions";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"dashboard" | "vehicles" | "expenses">("dashboard");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formularz kosztu
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [expenseType, setExpenseType] = useState<"fuel" | "service" | "insurance" | "other">("fuel");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Modal pojazdu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModel, setNewModel] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const [newYear, setNewYear] = useState("2022");
  const [newMileage, setNewMileage] = useState("");

  const refreshData = async () => {
    try {
      const data = await getFleetData();
      setVehicles(data.vehicles);
      setExpenses(data.expenses);
      if (data.vehicles.length > 0 && !selectedVehicle) {
        setSelectedVehicle(data.vehicles[0].id);
      }
    } catch (err) {
      console.error("Błąd pobierania danych:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    refreshData();
  }, []);

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("pl-PL").format(val);
  };

  // Obliczenia TCO na żywo
  const fleetWithTco = vehicles.map(v => {
    const vExpenses = v.expenses || [];
    const tco = vExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    return { ...v, totalCost: tco };
  });

  const totalFleetCost = fleetWithTco.reduce((sum, v) => sum + v.totalCost, 0);
  const totalFleetMileage = fleetWithTco.reduce((sum, v) => sum + v.mileage, 0);
  const avgCostPerKm = totalFleetMileage > 0 ? (totalFleetCost / totalFleetMileage).toFixed(2) : "0.00";
  const activeVehiclesCount = fleetWithTco.filter(v => v.status === "active").length;
  const alertVehiclesCount = fleetWithTco.filter(v => v.status !== "active").length;

  const chartData = fleetWithTco.map(v => ({
    name: v.plate,
    tco: v.totalCost,
  }));

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !selectedVehicle) return;

    startTransition(async () => {
      await createExpense({
        vehicleId: selectedVehicle,
        type: expenseType,
        amount: parseFloat(amount),
        description,
      });
      setAmount("");
      setDescription("");
      await refreshData();
    });
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel || !newPlate) return;

    startTransition(async () => {
      await createVehicle({
        model: newModel,
        plate: newPlate,
        year: parseInt(newYear) || 2022,
        mileage: parseInt(newMileage) || 0,
      });
      setNewModel("");
      setNewPlate("");
      setNewMileage("");
      setIsModalOpen(false);
      await refreshData();
    });
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="animate-spin text-violet-500" size={36} />
        <span className="text-sm font-medium">Ładowanie systemu floty...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-violet-600 rounded-xl text-white shadow-lg shadow-violet-600/30">
              <Car size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white tracking-wide">FleetMaster</h2>
              <span className="text-[10px] text-violet-400 font-bold tracking-widest uppercase">PostgreSQL Live</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${
                activeTab === "dashboard" 
                  ? "bg-violet-600/15 text-violet-400 border border-violet-500/30" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <TrendingUp size={18} />
              Pulpit główny
            </button>

            <button 
              onClick={() => setActiveTab("vehicles")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${
                activeTab === "vehicles" 
                  ? "bg-violet-600/15 text-violet-400 border border-violet-500/30" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Car size={18} />
              Pojazdy ({fleetWithTco.length})
            </button>

            <button 
              onClick={() => setActiveTab("expenses")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition text-sm ${
                activeTab === "expenses" 
                  ? "bg-violet-600/15 text-violet-400 border border-violet-500/30" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Receipt size={18} />
              Rejestr Kosztów ({expenses.length})
            </button>
          </nav>
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck size={16} /> PostgreSQL Online
          </div>
          <p className="text-xs text-slate-400">Trwały zapis w bazie Supabase.</p>
        </div>
      </aside>

      {/* Główna sekcja */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {activeTab === "dashboard" && "Pulpit Zarządzania Flotą"}
              {activeTab === "vehicles" && "Ewidencja Floty Pojazdów"}
              {activeTab === "expenses" && "Dziennik Kosztów i Faktur"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Bieżący monitoring wskaźników TCO, amortyzacji i przeglądów.</p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-600/25 transition shrink-0"
          >
            <Plus size={16} /> Dodaj Pojazd
          </button>
        </header>

        {/* Metryki KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Łączne TCO</span>
              <DollarSign size={18} className="text-violet-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{formatNumber(totalFleetCost)} PLN</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Zapisane w PostgreSQL</span>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Średni Koszt / KM</span>
              <TrendingUp size={18} className="text-violet-400" />
            </div>
            <div className="text-2xl font-bold text-violet-300 font-mono">{avgCostPerKm} PLN/km</div>
            <span className="text-[11px] text-emerald-400 mt-1 block font-medium">Efektywność floty</span>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">W Trasie</span>
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">{activeVehiclesCount} <span className="text-slate-500 text-base">/ {fleetWithTco.length}</span></div>
            <span className="text-[11px] text-slate-500 mt-1 block">Zestawy aktywne</span>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Wymaga Uwagi</span>
              <AlertTriangle size={18} className="text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono">{alertVehiclesCount}</div>
            <span className="text-[11px] text-amber-500/80 mt-1 block font-medium">Status warsztat / przegląd</span>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Tabela skrócona */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white">Ewidencja Bieżąca</h2>
                  <button onClick={() => setActiveTab("vehicles")} className="text-xs text-violet-400 hover:underline">Pokaż wszystkie &rarr;</button>
                </div>
                {fleetWithTco.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    Brak pojazdów w bazie. Dodaj pierwszy pojazd przyciskiem u góry!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="pb-3">Pojazd</th>
                          <th className="pb-3">Przebieg</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">TCO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {fleetWithTco.map((v) => (
                          <tr key={v.id} className="hover:bg-slate-800/20 transition">
                            <td className="py-3.5">
                              <div className="font-semibold text-slate-100">{v.model}</div>
                              <div className="text-xs text-slate-500 font-mono">{v.plate} ({v.year})</div>
                            </td>
                            <td className="py-3.5 text-slate-300 font-mono">{formatNumber(v.mileage)} km</td>
                            <td className="py-3.5">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                W trasie
                              </span>
                            </td>
                            <td className="py-3.5 text-right font-bold text-violet-300 font-mono">
                              {formatNumber(v.totalCost)} PLN
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Formularz wpisu */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-1">Rejestracja Kosztu</h2>
                <p className="text-xs text-slate-400 mb-5">Zapis do PostgreSQL na żywo.</p>

                {fleetWithTco.length === 0 ? (
                  <p className="text-xs text-slate-500">Najpierw dodaj pojazd do bazy.</p>
                ) : (
                  <form onSubmit={handleAddExpense} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 mb-1 block">Pojazd docelowy</label>
                      <select 
                        value={selectedVehicle} 
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
                      >
                        {fleetWithTco.map(v => (
                          <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 mb-1 block">Typ wydatku</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "fuel", label: "Paliwo", icon: Fuel },
                          { id: "service", label: "Serwis", icon: Wrench },
                        ].map(t => {
                          const Icon = t.icon;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setExpenseType(t.id as any)}
                              className={`flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-medium transition ${
                                expenseType === t.id 
                                  ? "bg-violet-600/20 border-violet-500 text-violet-300 font-semibold" 
                                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                              }`}
                            >
                              <Icon size={14} /> {t.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 mb-1 block">Kwota Brutto (PLN)</label>
                      <input 
                        type="number"
                        placeholder="np. 3500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 mb-1 block">Opis / Nr faktury</label>
                      <input 
                        type="text"
                        placeholder="np. Tankowanie 500L Orlen"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isPending}
                      className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-violet-600/20 text-sm disabled:opacity-50"
                    >
                      {isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      Zapisz do Bazy
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Wykres */}
            {fleetWithTco.length > 0 && (
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 size={20} className="text-violet-400" />
                  <h2 className="text-lg font-bold text-white">Porównanie Kosztów Całkowitych Floty (TCO)</h2>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "12px" }}
                        itemStyle={{ color: "#a78bfa" }}
                        formatter={(value: any) => [`${formatNumber(Number(value))} PLN`, "Suma TCO"]}
                      />
                      <Bar dataKey="tco" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Widok: Pojazdy */}
        {activeTab === "vehicles" && (
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Pełna Ewidencja Floty</h2>
            {fleetWithTco.length === 0 ? (
              <p className="text-slate-500 text-sm">Brak pojazdów w bazie.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fleetWithTco.map((v) => (
                  <div key={v.id} className="p-5 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">{v.model}</h3>
                          <p className="text-xs font-mono text-violet-400">{v.plate} • Rok: {v.year}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                          W trasie
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/50">
                          <span className="text-slate-500 block">Przebieg</span>
                          <span className="text-slate-200 font-mono font-bold text-sm">{formatNumber(v.mileage)} km</span>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/50">
                          <span className="text-slate-500 block">Suma TCO</span>
                          <span className="text-violet-300 font-mono font-bold text-sm">{formatNumber(v.totalCost)} PLN</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Widok: Wydatki */}
        {activeTab === "expenses" && (
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Historia Wydatków w Bazie</h2>
            {expenses.length === 0 ? (
              <p className="text-slate-500 text-sm">Brak zarejestrowanych wydatków.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="pb-3">Data</th>
                      <th className="pb-3">Pojazd</th>
                      <th className="pb-3">Kategoria</th>
                      <th className="pb-3">Opis</th>
                      <th className="pb-3 text-right">Kwota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-800/20 transition">
                        <td className="py-3.5 text-slate-400 font-mono text-xs">{new Date(e.date).toLocaleDateString("pl-PL")}</td>
                        <td className="py-3.5 font-mono text-violet-300 font-semibold">{e.vehicle?.plate || "N/A"}</td>
                        <td className="py-3.5">
                          <span className="capitalize px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300">
                            {e.type}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-300">{e.description || "-"}</td>
                        <td className="py-3.5 text-right font-mono font-bold text-emerald-400">
                          {formatNumber(e.amount)} PLN
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal dodawania pojazdu */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Nowy Pojazd w Bazie</h3>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Marka i Model</label>
                <input 
                  type="text" 
                  placeholder="np. Scania 500S Super"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Nr Rejestracyjny</label>
                <input 
                  type="text" 
                  placeholder="np. WA 7890C"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 font-mono uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Rok Produkcji</label>
                  <input 
                    type="number" 
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Przebieg (km)</label>
                  <input 
                    type="number" 
                    placeholder="np. 240000"
                    value={newMileage}
                    onChange={(e) => setNewMileage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isPending}
                className="w-full mt-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl transition shadow-lg shadow-violet-600/20 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Zapisz w PostgreSQL
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}