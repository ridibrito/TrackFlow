import { getSupabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

const supabase = getSupabase()

export interface Project {
  id: string;
  created_at: string;
  name: string | null;
  url: string | null;
  user_id: string;
  client_logo_url?: string | null;
  gtm_id?: string | null;
  ga4_id?: string | null;
  google_ads_id?: string | null;
  google_ads_label?: string | null;
  meta_pixel_id?: string | null;
  tiktok_pixel_id?: string | null;
  linkedin_insight_tag_id?: string | null;
  business_type?: string | null;
  existing_tags?: string[] | null;
  site_analysis_data?: any | null;
  google_ads_customer_id?: string | null;
}

export interface ConversionEvent {
  id: string; // ex: 'lead_whatsapp'
  name: string; // ex: 'Lead via WhatsApp'
  description: string; // ex: 'Disparado quando um usuário clica no botão de WhatsApp'
}

// Assumindo que o plano do usuário está no metadata
// Em um app real, isso poderia vir de uma tabela 'subscriptions'
export const getUserPlan = (user: User | null) => {
  return user?.user_metadata?.plan || 'free'; 
}

export const getProjectsForUser = async (userId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data as Project[];
};

export const addProject = async (
  projectData: Omit<Project, 'id' | 'created_at'>
) => {
  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select();

  if (error) {
    console.error('Error adding project:', error);
  }

  return { data, error };
}

export const getProjectById = async (projectId: string, userId: string): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching project by id:', error);
    return null;
  }

  return data as Project | null;
};

export const updateProject = async (projectId: string, updates: Partial<Project>, userId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
  }

  return { data, error };
}

export const deleteProject = async (projectId: string, userId: string) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting project:', error);
  }

  return { error };
}; 