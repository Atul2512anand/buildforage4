
import { UserProfile, Post, UserRole, Comment, Message, Institution, OnboardingRequest } from '../types';

// --- Local Storage Keys ---
const KEYS = {
  INSTITUTIONS: 'BF_INSTITUTIONS',
  USERS: 'BF_USERS',
  POSTS: 'BF_POSTS',
  MESSAGES: 'BF_MESSAGES',
  REQUESTS: 'BF_REQUESTS'
};

// --- Initial Mock Data (used if storage is empty) ---
const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: 'cohort_alpha',
    name: 'BuildForge Alpha',
    code: 'ALPHA',
    logo: 'https://cdn-icons-png.flaticon.com/512/3413/3413535.png',
    description: 'First Cohort: Forging ideas into MVP.',
    themeColor: '#FF725E'
  },
  {
    id: 'cohort_beta',
    name: 'BuildForge Beta',
    code: 'BETA',
    logo: 'https://cdn-icons-png.flaticon.com/512/2997/2997274.png',
    description: 'Advanced Product Acceleration.',
    themeColor: '#6C63FF'
  }
];

const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'super_admin',
    institutionId: 'squadran',
    name: 'Squadran CEO',
    role: UserRole.SUPER_ADMIN,
    avatar: 'https://ui-avatars.com/api/?name=CEO',
    blocked: false
  },
  {
    uid: 'founder_01',
    institutionId: 'cohort_alpha',
    name: 'Rohan (Founder)',
    email: 'rohan@buildforge.io',
    role: UserRole.FOUNDER,
    startupName: 'DecentraVote',
    avatar: 'https://picsum.photos/seed/student1/200',
    bio: 'Building a decentralized voting app.',
    blocked: false
  },
  {
    uid: 'admin_alpha',
    institutionId: 'cohort_alpha',
    name: 'Alpha Lead',
    role: UserRole.LEAD,
    email: 'lead@alpha.io',
    avatar: 'https://ui-avatars.com/api/?name=Lead',
    blocked: false
  },
  {
    uid: 'dev_beta_1',
    institutionId: 'cohort_beta',
    name: 'Vikram (Dev)',
    email: 'vikram@buildforge.io',
    role: UserRole.DEVELOPER,
    skills: 'React, Node.js',
    avatar: 'https://picsum.photos/seed/iit1/200',
    bio: 'Full Stack Developer looking for projects.',
    blocked: false
  }
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'post_alpha_1',
    institutionId: 'cohort_alpha',
    authorId: 'admin_alpha',
    authorName: 'Alpha Lead',
    authorRole: UserRole.LEAD,
    title: 'Demo Day: Project Delivery',
    content: 'Join us for the final project delivery showcase.',
    timestamp: Date.now() - 100000,
    likes: 150,
    comments: [],
    status: 'VERIFIED',
    type: 'DELIVERY'
  },
  {
    id: 'post_beta_1',
    institutionId: 'cohort_beta',
    authorId: 'dev_beta_1',
    authorName: 'Vikram (Dev)',
    authorRole: UserRole.DEVELOPER,
    title: 'Smart Canteen App',
    content: 'We are building a queue management system for the canteen.',
    timestamp: Date.now() - 50000,
    likes: 20,
    comments: [],
    status: 'VERIFIED',
    type: 'IDEA_SUBMISSION',
    mvp: {
      description: "Mobile App (Flutter) + Node.js Backend for real-time order tracking.",
      techStack: ["Flutter", "Node.js", "Firebase"],
      docLink: "#",
      status: 'READY'
    },
    applicants: ['dev_beta_1'],
    team: ['dev_beta_1'] // Already assigned in mock
  }
];

// --- Helper Functions ---
const getStorage = <T>(key: string, defaultData: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Storage Error", e);
    return defaultData;
  }
};

const setStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Storage Write Error", e);
  }
};

// --- Service Methods ---

export const db = {
  // --- Squadran Super Admin ---
  loginSuperAdmin: (password: string): { success: boolean, user?: UserProfile } => {
    if (password === 'squadran_root') {
        const users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
        let admin = users.find(u => u.role === UserRole.SUPER_ADMIN);
        if (!admin) {
            admin = INITIAL_USERS[0];
            users.push(admin);
            setStorage(KEYS.USERS, users);
        }
        return { success: true, user: admin };
    }
    return { success: false };
  },

  getInstitutions: (): Institution[] => getStorage(KEYS.INSTITUTIONS, INITIAL_INSTITUTIONS),

  getInstitutionByCode: (code: string): Institution | undefined => {
    const insts = getStorage<Institution[]>(KEYS.INSTITUTIONS, INITIAL_INSTITUTIONS);
    return insts.find(i => i.code.trim().toUpperCase() === code.trim().toUpperCase());
  },

  createInstitution: (name: string, code: string, logo: string, desc: string, themeColor: string = '#4AA4F2'): Institution => {
    const insts = getStorage<Institution[]>(KEYS.INSTITUTIONS, INITIAL_INSTITUTIONS);
    const users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
    const posts = getStorage<Post[]>(KEYS.POSTS, INITIAL_POSTS);

    const newInst: Institution = {
      id: `inst_${Date.now()}`,
      name,
      code,
      logo: logo || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      description: desc,
      themeColor: themeColor
    };
    insts.push(newInst);
    
    // Create a default admin
    users.push({
      uid: `admin_${newInst.id}`,
      institutionId: newInst.id,
      name: `${code} Lead`,
      email: `lead@${code.toLowerCase()}.io`,
      role: UserRole.LEAD,
      avatar: `https://ui-avatars.com/api/?name=${code}+Lead`,
      blocked: false
    });

    // Create a welcome post
    posts.unshift({
      id: `post_welcome_${newInst.id}`,
      institutionId: newInst.id,
      authorId: `admin_${newInst.id}`,
      authorName: `${code} Lead`,
      authorRole: UserRole.LEAD,
      title: `Welcome to BuildForge`,
      content: `Welcome to the ${name} workspace. Submit ideas to begin the forging process.`,
      timestamp: Date.now(),
      likes: 0,
      comments: [],
      status: 'VERIFIED',
      type: 'SPRINT_UPDATE'
    });

    setStorage(KEYS.INSTITUTIONS, insts);
    setStorage(KEYS.USERS, users);
    setStorage(KEYS.POSTS, posts);

    return newInst;
  },

  deleteInstitution: (instId: string): void => {
    let insts = getStorage<Institution[]>(KEYS.INSTITUTIONS, INITIAL_INSTITUTIONS);
    let users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
    let posts = getStorage<Post[]>(KEYS.POSTS, INITIAL_POSTS);

    insts = insts.filter(i => i.id !== instId);
    users = users.filter(u => u.institutionId !== instId);
    posts = posts.filter(p => p.institutionId !== instId);

    setStorage(KEYS.INSTITUTIONS, insts);
    setStorage(KEYS.USERS, users);
    setStorage(KEYS.POSTS, posts);
  },

  // Onboarding Requests
  submitOnboardingRequest: (instituteName: string, email: string, contactName: string): void => {
    const reqs = getStorage<OnboardingRequest[]>(KEYS.REQUESTS, []);
    reqs.push({
      id: `req_${Date.now()}`,
      instituteName,
      email,
      contactName,
      status: 'PENDING'
    });
    setStorage(KEYS.REQUESTS, reqs);
  },

  getOnboardingRequests: (): OnboardingRequest[] => {
    const reqs = getStorage<OnboardingRequest[]>(KEYS.REQUESTS, []);
    return reqs.filter(r => r.status === 'PENDING');
  },

  approveRequest: (requestId: string): void => {
    const reqs = getStorage<OnboardingRequest[]>(KEYS.REQUESTS, []);
    const req = reqs.find(r => r.id === requestId);
    if (req) {
      req.status = 'APPROVED';
      setStorage(KEYS.REQUESTS, reqs);
      
      const colors = ['#FF725E', '#4AA4F2', '#6C63FF', '#43D9AD', '#FFC75F'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      db.createInstitution(
        req.instituteName, 
        req.instituteName.substring(0, 4).toUpperCase(), 
        '', 
        'Partner Cohort', 
        randomColor
      );
    }
  },

  rejectRequest: (requestId: string): void => {
    let reqs = getStorage<OnboardingRequest[]>(KEYS.REQUESTS, []);
    const req = reqs.find(r => r.id === requestId);
    if (req) {
      req.status = 'REJECTED';
      setStorage(KEYS.REQUESTS, reqs);
    }
  },

  // --- Auth (Scoped) ---

  // FOUNDER REGISTRATION
  signupFounder: (data: Partial<UserProfile> & { institutionId: string, name: string, email: string }): UserProfile => {
    const users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
    const newUser: UserProfile = {
      uid: `founder_${Date.now()}`,
      institutionId: data.institutionId,
      name: data.name,
      email: data.email,
      role: UserRole.FOUNDER,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}`,
      blocked: false,
      ...data
    };
    users.push(newUser);
    setStorage(KEYS.USERS, users);
    return newUser;
  },

  // DEVELOPER REGISTRATION
  signupDeveloper: (data: Partial<UserProfile> & { institutionId: string, name: string, email: string }): UserProfile => {
    const users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
    const newUser: UserProfile = {
      uid: `dev_${Date.now()}`,
      institutionId: data.institutionId,
      name: data.name,
      email: data.email,
      role: UserRole.DEVELOPER,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}`,
      blocked: false,
      ...data
    };
    users.push(newUser);
    setStorage(KEYS.USERS, users);
    return newUser;
  },

  // LEAD LOGIN / ACCESS
  loginLead: (email: string, accessKey: string, institutionId: string): { user: UserProfile | null, error?: string } => {
     const users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
     const existingUser = users.find(u => u.email === email && u.role === UserRole.LEAD && u.institutionId === institutionId);

     // Check master key for the institution (mocking 'admin' as key)
     if (accessKey === 'admin') {
         if (existingUser) {
             return { user: existingUser };
         } else {
             // Create new Lead if doesn't exist but key is valid
             const newLead: UserProfile = {
                 uid: `lead_${Date.now()}`,
                 institutionId,
                 name: email.split('@')[0] || 'Lead',
                 email,
                 role: UserRole.LEAD,
                 avatar: `https://ui-avatars.com/api/?name=Lead`,
                 blocked: false
             };
             users.push(newLead);
             setStorage(KEYS.USERS, users);
             return { user: newLead };
         }
     }
     return { user: null, error: "Invalid Access Key" };
  },

  // Generic Login for Founder/Dev
  loginUserByEmail: (email: string, institutionId: string): { user: UserProfile | null, error?: string } => {
    const users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
    const user = users.find(u => u.email === email && u.institutionId === institutionId);
    
    if (user) {
        if (user.blocked) return { user: null, error: "Access Denied: Account Deboarded/Blocked." };
        return { user };
    }
    return { user: null, error: "User not found. Please Register." };
  },

  updateUser: (uid: string, data: Partial<UserProfile>): UserProfile | null => {
    let users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
    const index = users.findIndex(u => u.uid === uid);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      setStorage(KEYS.USERS, users);
      return users[index];
    }
    return null;
  },

  // --- Strict Super Admin Workflow Helpers ---

  // Get all developers in the cohort for assignment
  getDevelopers: (institutionId: string): UserProfile[] => {
    const users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
    return users.filter(u => 
      u.institutionId === institutionId && 
      u.role === UserRole.DEVELOPER && 
      !u.blocked
    );
  },

  adminGetAllUsers: (institutionId: string): UserProfile[] => {
    const users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
    return users.filter(u => u.institutionId === institutionId && u.role !== UserRole.LEAD && u.role !== UserRole.SUPER_ADMIN);
  },

  // For Squadran Root Super Admin: Get ALL users in an institution, including the Lead
  superAdminGetInstitutionUsers: (institutionId: string): UserProfile[] => {
    const users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
    return users.filter(u => u.institutionId === institutionId && u.role !== UserRole.SUPER_ADMIN);
  },

  adminDeleteUser: (uid: string): void => {
    let users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
    users = users.filter(u => u.uid !== uid);
    setStorage(KEYS.USERS, users);
  },

  adminToggleBlockUser: (uid: string): UserProfile | undefined => {
    let users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
    const user = users.find(u => u.uid === uid);
    if (user) {
      user.blocked = !user.blocked;
      setStorage(KEYS.USERS, users);
      return user;
    }
    return undefined;
  },

  getAllUsers: (currentUserId: string, institutionId: string): UserProfile[] => {
    const users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
    return users.filter(u => 
      u.institutionId === institutionId && 
      u.uid !== currentUserId && 
      u.role !== UserRole.LEAD && 
      !u.blocked
    );
  },

  getConnectedUsers: (currentUser: UserProfile, institutionId: string): UserProfile[] => {
    const users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
    const posts = getStorage<Post[]>(KEYS.POSTS, INITIAL_POSTS);

    // 0. Super Admin sees everyone on the platform (except self)
    if (currentUser.role === UserRole.SUPER_ADMIN) {
        return users.filter(u => u.uid !== currentUser.uid);
    }

    // 1. Leads see everyone in their cohort
    if (currentUser.role === UserRole.LEAD) {
        return users.filter(u => u.institutionId === institutionId && u.uid !== currentUser.uid && !u.blocked);
    }

    // Always include the Cohort Lead(s) for communication
    const leads = users.filter(u => u.institutionId === institutionId && u.role === UserRole.LEAD && !u.blocked);
    const connectedUsers = new Set<UserProfile>(leads);

    // 2. Founders see assigned Developers
    if (currentUser.role === UserRole.FOUNDER) {
        // Find posts authored by this founder
        const myPosts = posts.filter(p => p.authorId === currentUser.uid);
        myPosts.forEach(post => {
            if (post.team && post.team.length > 0) {
                post.team.forEach(devId => {
                    const dev = users.find(u => u.uid === devId && !u.blocked);
                    if (dev) connectedUsers.add(dev);
                });
            }
        });
    }

    // 3. Developers see Founders of projects they are assigned to
    if (currentUser.role === UserRole.DEVELOPER) {
        // Find posts where this dev is in the team
        const assignedPosts = posts.filter(p => p.team && p.team.includes(currentUser.uid));
        assignedPosts.forEach(post => {
            const founder = users.find(u => u.uid === post.authorId && !u.blocked);
            if (founder) connectedUsers.add(founder);
        });
    }

    // Filter out self just in case
    return Array.from(connectedUsers).filter(u => u.uid !== currentUser.uid);
  },

  getUserById: (uid: string): UserProfile | undefined => {
    const users = getStorage<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
    return users.find(u => u.uid === uid);
  },

  getPosts: (institutionId: string, type: string, requesterRole?: UserRole, requesterId?: string): Post[] => {
    const posts = getStorage<Post[]>(KEYS.POSTS, INITIAL_POSTS);
    
    return posts.filter(p => {
      // 1. Institution check
      if (p.institutionId !== institutionId) return false;

      // 2. Type check
      const isProjectPost = p.type === 'IDEA_SUBMISSION' || p.type === 'OPEN_ROLE';

      if (requesterRole === UserRole.LEAD || requesterRole === UserRole.SUPER_ADMIN) {
        return p.type === type || (type === 'SPRINT_UPDATE' && p.type === 'IDEA_SUBMISSION' && p.status === 'VERIFIED');
      }

      if (requesterRole === UserRole.FOUNDER) {
          if (p.type === 'IDEA_SUBMISSION') {
              return p.authorId === requesterId; // Only own ideas
          }
          return p.type === type && p.status === 'VERIFIED';
      }

      if (requesterRole === UserRole.DEVELOPER) {
          if (p.type === 'IDEA_SUBMISSION') {
              return p.team && p.team.includes(requesterId || ''); // Only assigned
          }
          return p.type === type && p.status === 'VERIFIED';
      }

      return false;

    }).sort((a, b) => b.timestamp - a.timestamp);
  },

  getPendingPosts: (institutionId: string): Post[] => {
    const posts = getStorage<Post[]>(KEYS.POSTS, INITIAL_POSTS);
    return posts.filter(p => p.institutionId === institutionId && p.status === 'PENDING');
  },

  getUserPosts: (userId: string): Post[] => {
    const posts = getStorage<Post[]>(KEYS.POSTS, INITIAL_POSTS);
    return posts.filter(p => p.authorId === userId).sort((a, b) => b.timestamp - a.timestamp);
  },

  createPost: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'status' | 'applicants' | 'team'>): void => {
    const posts = getStorage<Post[]>(KEYS.POSTS, INITIAL_POSTS);
    const newPost: Post = {
      ...post,
      id: `post_${Date.now()}`,
      timestamp: Date.now(),
      likes: 0,
      comments: [],
      status: 'PENDING', 
      applicants: [],
      team: []
    };
    posts.unshift(newPost);
    setStorage(KEYS.POSTS, posts);
  },

  verifyPost: (postId: string): void => {
    const posts = getStorage<Post[]>(KEYS.POSTS, INITIAL_POSTS);
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.status = 'VERIFIED'; 
        if (post.type === 'IDEA_SUBMISSION') {
            post.mvp = {
                description: `MVP Architecture for "${post.title}": Focus on core user loops. Authentication, Database Schema, and Primary Workflow.`,
                techStack: ['React Native', 'Firebase', 'Node.js'],
                docLink: '#',
                status: 'READY'
            };
        }
        setStorage(KEYS.POSTS, posts);
    }
  },

  deletePost: (postId: string): void => {
    let posts = getStorage<Post[]>(KEYS.POSTS, INITIAL_POSTS);
    posts = posts.filter(p => p.id !== postId);
    setStorage(KEYS.POSTS, posts);
  },

  toggleLike: (postId: string): void => {
    const posts = getStorage<Post[]>(KEYS.POSTS, INITIAL_POSTS);
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.likes += 1;
        setStorage(KEYS.POSTS, posts);
    }
  },

  applyToProject: (postId: string, userId: string): boolean => {
    const posts = getStorage<Post[]>(KEYS.POSTS, INITIAL_POSTS);
    const post = posts.find(p => p.id === postId);
    if (post && post.type === 'IDEA_SUBMISSION') {
        if (!post.applicants) post.applicants = [];
        if (!post.applicants.includes(userId)) {
            post.applicants.push(userId);
            setStorage(KEYS.POSTS, posts);
            return true;
        }
    }
    return false;
  },

  assignDeveloper: (postId: string, userId: string): void => {
    const posts = getStorage<Post[]>(KEYS.POSTS, INITIAL_POSTS);
    const post = posts.find(p => p.id === postId);
    if (post && post.type === 'IDEA_SUBMISSION') {
        if (!post.team) post.team = [];
        if (!post.team.includes(userId)) {
            post.team.push(userId);
            setStorage(KEYS.POSTS, posts);
        }
    }
  },

  addComment: (postId: string, userId: string, userName: string, text: string): Comment => {
    const posts = getStorage<Post[]>(KEYS.POSTS, INITIAL_POSTS);
    const post = posts.find(p => p.id === postId);
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      userId,
      userName,
      text,
      timestamp: Date.now()
    };
    if (post) {
      post.comments.push(newComment);
      setStorage(KEYS.POSTS, posts);
    }
    return newComment;
  },

  getMessages: (currentUserId: string, otherUserId: string): Message[] => {
    const messages = getStorage<Message[]>(KEYS.MESSAGES, []);
    return messages.filter(m => 
      (m.senderId === currentUserId && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === currentUserId)
    ).sort((a, b) => a.timestamp - b.timestamp);
  },

  getConversations: (currentUserId: string): string[] => {
    const messages = getStorage<Message[]>(KEYS.MESSAGES, []);
    const userIds = new Set<string>();
    messages.forEach(m => {
      if (m.senderId === currentUserId) userIds.add(m.receiverId);
      if (m.receiverId === currentUserId) userIds.add(m.senderId);
    });
    return Array.from(userIds);
  },

  sendMessage: (senderId: string, receiverId: string, text: string): void => {
    const messages = getStorage<Message[]>(KEYS.MESSAGES, []);
    messages.push({
      id: `m_${Date.now()}`,
      senderId,
      receiverId,
      text,
      timestamp: Date.now(),
      read: false
    });
    setStorage(KEYS.MESSAGES, messages);
  }
};
