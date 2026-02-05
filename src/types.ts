export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  locationType: 'onsite' | 'remote' | 'hybrid' | '';
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  technologies: string[]; // Specific stack used in this role
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
  coursework?: string; // Relevant courses
  description: string;
}

export interface Project {
  id: string;
  name: string;
  role: string; // What did you do?
  description: string;
  link?: string;
  technologies: string[];
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Volunteer {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface Publication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url?: string;
  description: string;
}

export interface Language {
  id: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Proficient' | 'Intermediate' | 'Basic';
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: string; // e.g., "Former Manager", "Colleague", "Client"
}

export interface PersonalDetails {
  fullName: string;
  title: string; // Target Job Title
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  github?: string;
  medium?: string;
  summary: string;
}

export interface CVProfile {
  personal: PersonalDetails;
  experience: Experience[];
  education: Education[];
  skills: string[]; // Hard Skills
  languages: Language[];
  projects: Project[];
  certifications: Certification[];
  volunteer: Volunteer[];
  awards: Award[];
  publications: Publication[];
  references: Reference[];
}

export interface JobDescription {
  id: string;
  text: string;
  // We could extract metadata later
}

export interface LayoutStrategy {
  sectionOrder: string[]; // e.g. ['experience', 'education', 'skills']
  hasIntro: boolean; // Should we show a summary/intro?
  reasoning: string; // Why did AI choose this structure?
}

export interface JobAnalysis {
  originalDescription: string;
  tailoredProfile: CVProfile;
  suggestions: string[];
  layoutStrategy?: LayoutStrategy; // Optional for backward compatibility
  matchScore?: number;
  jobTitle?: string; // Extracted from job description by AI
  companyName?: string; // Extracted from job description by AI
}

export type AIModel = 'openai' | 'gemini' | 'grok';

export interface AppSettings {
  aiModel: AIModel;
}

export type ApplicationStatus = 'applied' | 'interviewing' | 'offer' | 'rejected' | 'accepted' | 'archived';

export interface Application {
  id: string;
  jobTitle: string;
  companyName: string;
  dateApplied: string;
  lastUpdated: string;
  status: ApplicationStatus;
  jobDescription: string;
  originalDescription?: string; // Raw job description before any processing
  tailoredProfile: CVProfile; // Snapshot of the resume used
  matchScore?: number;
  notes?: string;
}

export interface ImportRecord {
  id: string;
  fileName: string;
  fileType: 'LinkedIn' | 'Resume' | 'Other';
  date: string;
  status: 'success' | 'failed';
}

export type AnalysisMode = 'strict' | 'creative';

export interface AnalysisOptions {
  mode: AnalysisMode;
  customInstructions?: string;
}
