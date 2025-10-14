import type { IconName, InsightCategory, InsightStatus } from './types';
import { InsightCategory as IC, InsightStatus as IS } from './types';

export const CATEGORY_DETAILS: Record<InsightCategory, { name: string; icon: IconName; color: string; }> = {
  [IC.Language]: { name: 'Lenguaje', icon: 'MessageSquare', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' },
  [IC.Motor]: { name: 'Motor', icon: 'Footprints', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' },
  [IC.Social]: { name: 'Social', icon: 'Heart', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200' },
  [IC.Sleep]: { name: 'Sueño', icon: 'Moon', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200' },
  [IC.Feeding]: { name: 'Alimentación', icon: 'UtensilsCrossed', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' },
  [IC.Cognitive]: { name: 'Cognitivo', icon: 'BrainCircuit', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200' },
  [IC.Play]: { name: 'Juego', icon: 'Palette', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' },
  [IC.Autonomy]: { name: 'Autonomía', icon: 'User', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200' },
};

export const STATUS_DETAILS: Record<InsightStatus, { name: string; colorClasses: string; colorBg: string; colorBorder: string; icon: IconName; }> = {
  [IS.Excellent]: { name: 'Adelantado', colorClasses: 'bg-status-excellent text-white', colorBg: 'bg-status-excellent/10', colorBorder: 'border-status-excellent', icon: 'TrendingUp' },
  [IS.OnTrack]: { name: 'Esperado', colorClasses: 'bg-status-on_track text-white', colorBg: 'bg-status-on_track/10', colorBorder: 'border-status-on_track', icon: 'CheckCircle2' },
  [IS.Developing]: { name: 'En desarrollo', colorClasses: 'bg-status-developing text-black', colorBg: 'bg-status-developing/10', colorBorder: 'border-status-developing', icon: 'Hourglass' },
  [IS.NeedsAttention]: { name: 'A reforzar', colorClasses: 'bg-status-needs_attention text-white', colorBg: 'bg-status-needs_attention/10', colorBorder: 'border-status-needs_attention', icon: 'AlertTriangle' },
};

export const UI_TEXT = {
  appName: "Parent Copilot",
  addChild: "Añadir Niño/a",
  childName: "Nombre del niño/a",
  birthDate: "Fecha de nacimiento",
  saveChild: "Guardar Niño/a",
  selectChild: "Seleccionar Niño/a",
  insights: "Perspectivas de Desarrollo",
  emptyInsightsTitle: "¡Hola! 👋",
  emptyInsightsBody: "Aún no hay perspectivas para {childName}. ¡Comienza una conversación para descubrir ideas sobre su desarrollo!",
  chat: "Chat Proactivo",
  chatPlaceholder: "Escribe tu respuesta aquí...",
  ageYearsMonths: "{years} años y {months} meses",
  ageMonths: "{months} meses",
  ageYear: "1 año",
  ageMonth: "1 mes",
};