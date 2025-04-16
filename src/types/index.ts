/**
 * Types partagés dans toute l'application
 */

// Prospect
export interface Prospect {
  id: string;
  name: string;
  email: string;
  company: string | null;
  project: string | null;
  first_contact: string;
  next_followup: string | null;
  status: ProspectStatus;
  followup_stage: number;
  notes: string | null;
  source: string | null;
  user_id: string;
}

export type ProspectStatus = 
  | 'Pending' 
  | 'Sent' 
  | 'Opened' 
  | 'Clicked' 
  | 'Responded' 
  | 'Unsubscribed';

// Template
export interface Template {
  id: string;
  user_id: string;
  name: string;
  stage: number;
  subject: string;
  body: string;
  created_at?: string;
  updated_at?: string;
}

// Entrée d'historique
export interface HistoryEntry {
  id: string;
  user_id: string;
  prospect_id: string;
  template_id: string;
  sent_at: string;
  status: 'Sent' | 'Opened' | 'Clicked' | 'Responded' | 'Failed';
  prospect?: {
    name: string;
    email: string;
    company: string;
  };
  template?: {
    subject: string;
    stage: number;
  };
}

// Données de graphique pour le Dashboard
export interface ChartData {
  date: string;
  emails: number;
  responses: number;
}

// Statistiques du Dashboard
export interface DashboardStats {
  activeProspects: number;
  responseRate: number;
  pendingFollowups: number;
  totalEmails: number;
  openRate: number;
  clickRate: number;
  prospectsChange?: number;
  responseRateChange?: number;
  pendingFollowupsChange?: number;
  emailsSentToday: number;
  emailsSentThisWeek: number;
  prospectsByStage: Array<{ stage: number; count: number }>;
  recentActivity: Array<any>;
} 