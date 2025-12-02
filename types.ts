
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // Squadran Owner
  LEAD = 'LEAD', // Formerly Institution Admin
  FOUNDER = 'FOUNDER', // Formerly Student
  DEVELOPER = 'DEVELOPER', // Formerly Alumni/Builder
  NONE = 'NONE'
}

export enum ViewType {
  SQUADRAN_HOME = 'SQUADRAN_HOME',
  SUPER_ADMIN_DASHBOARD = 'SUPER_ADMIN_DASHBOARD',
  SPRINT_HUB = 'SPRINT_HUB', // Step 6: Project Dashboard
  DEV_MARKET = 'DEV_MARKET', // Step 4: Developers Apply
  LAUNCHPAD = 'LAUNCHPAD', // Step 8: Project Delivery
  NETWORKING = 'NETWORKING',
  MESSAGES = 'MESSAGES',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD', 
  USER_DASHBOARD = 'USER_DASHBOARD',
  PROFILE = 'PROFILE'
}

export enum FeatureType {
  CONTENT_ASSISTANT = 'CONTENT_ASSISTANT',
}

export interface Feature {
  id: FeatureType;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  suggestedPrompts?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// --- Squadran Schema Types ---

export interface Institution {
  id: string;
  name: string;
  code: string; // e.g. BATCH25, S24
  logo: string;
  description: string;
  themeColor: string;
}

export interface OnboardingRequest {
  id: string;
  instituteName: string;
  email: string;
  contactName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface UserProfile {
  uid: string;
  institutionId: string; 
  name: string;
  email?: string;
  phone?: string; // Added
  role: UserRole;
  avatar?: string;
  bio?: string;
  blocked?: boolean;

  // Founder Specific Fields
  startupName?: string;
  startupStage?: string;
  startupDescription?: string;
  techHelpNeeded?: string;
  budget?: string;
  timeline?: string;

  // Developer Specific Fields
  college?: string;
  skills?: string;
  githubUrl?: string;
  timeAvailability?: string;
  experience?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface MVPData {
  description: string;
  techStack: string[];
  docLink: string;
  status: 'READY' | 'IN_PROGRESS';
}

export interface Post {
  id: string;
  institutionId: string; 
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  title?: string;
  image?: string;
  likes: number;
  comments: Comment[];
  status: 'PENDING' | 'VERIFIED'; // PENDING = Step 2 Review, VERIFIED = Step 3 MVP Ready
  type: 'SPRINT_UPDATE' | 'OPEN_ROLE' | 'DELIVERY' | 'IDEA_SUBMISSION';
  timestamp: number;
  company?: string;
  jobLink?: string;
  
  // Step 3-5 Additions
  mvp?: MVPData;
  applicants?: string[]; // Array of User UIDs
  team?: string[]; // Array of User UIDs
}
