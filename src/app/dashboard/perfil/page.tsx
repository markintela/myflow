"use client";

import { useRef, useState } from "react";
import { User, Camera, Wallet } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useProfile } from "@/hooks/use-profile";
import type { BloodType, Profile } from "@/lib/types";

const BLOOD_TYPES: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MONTH_START_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return null;
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  const hasHadBirthdayThisYear =
    today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export default function PerfilPage() {
  const { profile, loading, error, update, uploadAvatar } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Partial<Profile> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const values = form ?? profile ?? {};
  const age = calculateAge(values.date_of_birth ?? null);

  const setField = (field: keyof Profile, value: string) => {
    setForm({ ...values, [field]: value });
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setSaveError(null);
    const result = await update(form);
    if (result.error) {
      setSaveError(result.error);
    } else {
      setForm(null);
      setSaved(true);
    }
    setSaving(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const result = await uploadAvatar(file);
    if (result.error) setUploadError(result.error);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading && !profile) {
    return <p className="text-sm text-slate-400">Carregando...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Perfil</h1>
      <p className="text-slate-500 text-sm mb-6">Seus dados pessoais e de saúde.</p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User size={18} className="text-brand-blue" />
            <CardTitle>Dados pessoais</CardTitle>
          </div>
        </CardHeader>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-brand-blueSoft overflow-hidden flex items-center justify-center">
              {values.avatar_url ? (
                // Thumbnail já reduzido no upload — exibido em tamanho pequeno.
                <img src={values.avatar_url} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <User size={28} className="text-brand-blue" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
              aria-label="Alterar foto"
            >
              <Camera size={13} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-sm text-slate-600">
              {uploading ? "Enviando foto..." : "Clique no ícone para trocar a foto."}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">A imagem é reduzida automaticamente.</p>
            {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="full_name">Nome completo</Label>
            <Input
              id="full_name"
              value={values.full_name ?? ""}
              onChange={(e) => setField("full_name", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="date_of_birth">
              Data de nascimento {age !== null && <span className="text-slate-400">({age} anos)</span>}
            </Label>
            <Input
              id="date_of_birth"
              type="date"
              value={values.date_of_birth ?? ""}
              onChange={(e) => setField("date_of_birth", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="height_cm">Altura (cm)</Label>
            <Input
              id="height_cm"
              type="number"
              step="0.1"
              value={values.height_cm ?? ""}
              onChange={(e) => setField("height_cm", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="weight_kg">Peso (kg)</Label>
            <Input
              id="weight_kg"
              type="number"
              step="0.1"
              value={values.weight_kg ?? ""}
              onChange={(e) => setField("weight_kg", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="blood_type">Tipo sanguíneo</Label>
            <select
              id="blood_type"
              value={values.blood_type ?? ""}
              onChange={(e) => setField("blood_type", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue"
            >
              <option value="">Não informado</option>
              {BLOOD_TYPES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={values.phone ?? ""} onChange={(e) => setField("phone", e.target.value)} />
          </div>

          <div>
            <Label htmlFor="emergency_contact_name">Contato de emergência (nome)</Label>
            <Input
              id="emergency_contact_name"
              value={values.emergency_contact_name ?? ""}
              onChange={(e) => setField("emergency_contact_name", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="emergency_contact_phone">Contato de emergência (telefone)</Label>
            <Input
              id="emergency_contact_phone"
              value={values.emergency_contact_phone ?? ""}
              onChange={(e) => setField("emergency_contact_phone", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-3 mt-1">
            <Button type="submit" size="sm" disabled={saving || !form}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            {saved && <span className="text-xs text-brand-green">Salvo com sucesso.</span>}
            {saveError && <span className="text-xs text-red-600">{saveError}</span>}
          </div>
        </form>
      </Card>

      <Card className="max-w-2xl mt-5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-brand-blue" />
            <CardTitle>Mês financeiro</CardTitle>
          </div>
        </CardHeader>
        <form onSubmit={handleSave}>
          <p className="text-sm text-slate-500 mb-1">
            Dia em que o mês começa para os cálculos de receitas e despesas (dashboard e calendário).
          </p>
          <p className="text-xs text-slate-400 mb-3">
            Por exemplo, começando no dia {values.month_start_day ?? 25}, o "mês" vai do dia{" "}
            {values.month_start_day ?? 25} até o dia anterior do mês seguinte — útil para alinhar com a data do
            salário.
          </p>
          <div className="grid grid-cols-7 gap-1.5 max-w-xs mb-4">
            {MONTH_START_DAYS.map((day) => {
              const selected = Number(values.month_start_day ?? 25) === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setField("month_start_day", String(day))}
                  aria-pressed={selected}
                  aria-label={`Começar o mês no dia ${day}`}
                  className={`h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
                    selected
                      ? "bg-brand-blue text-white font-semibold"
                      : "text-slate-600 hover:bg-brand-blueSoft"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={saving || !form}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            {saved && <span className="text-xs text-brand-green">Salvo com sucesso.</span>}
            {saveError && <span className="text-xs text-red-600">{saveError}</span>}
          </div>
        </form>
      </Card>
    </div>
  );
}
