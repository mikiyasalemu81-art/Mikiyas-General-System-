import { IntakeQuestion, ProjectIntake } from '../types';

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  // 1. Scope & Objectives
  {
    id: 'scope-1',
    category: 'Scope & Objectives',
    question: 'What is the exact product format (Single Page App, Multi-page Web, Mobile PWA, or Dashboard)?',
    helpText: 'Helps determine bundle architecture and responsive layout requirements.',
    suggestedAnswers: [
      'Responsive Web App (PWA installable)',
      'Multi-page Marketing Site + Client Portal',
      'High-performance Admin Dashboard',
      'Mobile-first E-Commerce Web App'
    ]
  },
  {
    id: 'scope-2',
    category: 'Scope & Objectives',
    question: 'Is this project an MVP for fast launch, or a full production overhaul of an existing platform?',
    helpText: 'Guides feature prioritization and whether backwards-compatibility is needed.',
    suggestedAnswers: [
      'Greenfield MVP focused on rapid 3-4 week launch',
      'Production rebuild replacing legacy system',
      'Feature expansion for existing product'
    ]
  },

  // 2. Audience & User Personas
  {
    id: 'audience-1',
    category: 'Target Audience',
    question: 'Who is the primary end-user (B2B corporate clients, retail consumers, tech-savvy users, or general public)?',
    helpText: 'Influences accessibility, microcopy, and UI density.',
    suggestedAnswers: [
      'B2B Corporate managers & internal teams',
      'Everyday retail mobile consumers',
      'Freelancers & creative professionals',
      'Enterprise finance & accounting specialists'
    ]
  },
  {
    id: 'audience-2',
    category: 'Target Audience',
    question: 'What device will users use most frequently (Mobile smartphones, iPad/tablets, or Desktop monitors)?',
    helpText: 'Sets responsive breakpoint priorities.',
    suggestedAnswers: [
      'Mobile smartphones (80%+ mobile usage)',
      'Desktop & laptop browsers primarily',
      'Even balance between Desktop and Mobile'
    ]
  },

  // 3. Branding & Design System
  {
    id: 'branding-1',
    category: 'Branding & Design System',
    question: 'What is the desired color palette, brand vibe, and typography aesthetic?',
    helpText: 'e.g. Modern minimalist, bold tech, warm playful, or corporate clean.',
    suggestedAnswers: [
      'Clean modern tech (Slate, Royal Blue, Emerald accents)',
      'Warm premium minimalist (Off-white, Charcoal, Amber)',
      'High-energy bold (Dark mode, Vibrant Neon / Indigo)',
      'Client already has established brand guide & logos'
    ]
  },
  {
    id: 'branding-2',
    category: 'Branding & Design System',
    question: 'Is Light Mode only, Dark Mode only, or a toggleable dual theme required?',
    suggestedAnswers: [
      'Light mode primary with manual Dark Mode toggle',
      'Dark mode only (dashboard / developer aesthetic)',
      'Light mode only for clean corporate clarity'
    ]
  },

  // 4. Features & Functionality
  {
    id: 'features-1',
    category: 'Features & Functionality',
    question: 'What are the top 3 must-have features without which this project cannot launch?',
    helpText: 'Defines the critical MVP path.',
    suggestedAnswers: [
      'Interactive dashboard, search/filter, and export reports',
      'Product catalog, shopping cart, and instant checkout',
      'User onboarding, booking calendar, and email alerts',
      'File upload, automated workflow processing, and status tracker'
    ]
  },
  {
    id: 'features-2',
    category: 'Features & Functionality',
    question: 'What type of authentication is required (Email/Password, OAuth Google/GitHub, Phone OTP, or No Login)?',
    suggestedAnswers: [
      'No login required (local storage / public tool)',
      'Secure Email + Password with password reset',
      'Google & Apple Social Login (OAuth)',
      'Phone SMS / OTP two-factor verification'
    ]
  },
  {
    id: 'features-3',
    category: 'Features & Functionality',
    question: 'Do users need role-based access control (e.g. Super Admin, Manager, Regular User, Guest)?',
    suggestedAnswers: [
      'Single user level (all users have same permissions)',
      'Two levels: Admin and Regular User',
      'Granular RBAC: Admin, Manager, Editor, Read-Only'
    ]
  },

  // 5. Pages & Navigation Architecture
  {
    id: 'pages-1',
    category: 'Pages & Navigation',
    question: 'What are the core pages/screens needed in the application structure?',
    suggestedAnswers: [
      'Home/Overview, List/Explore, Item Details, Settings',
      'Landing Page, Pricing, Auth, User Dashboard, Profile',
      'POS Terminal, Sales History, Inventory, Analytics'
    ]
  },
  {
    id: 'pages-2',
    category: 'Pages & Navigation',
    question: 'What navigation pattern is preferred (Top bar, Sidebar drawer, or Bottom tab bar)?',
    suggestedAnswers: [
      'Bottom pinned tab bar on mobile + sidebar on desktop',
      'Clean sticky top header with responsive hamburger drawer',
      'Collapsible left sidebar navigation'
    ]
  },

  // 6. Third-Party Integrations & APIs
  {
    id: 'integrations-1',
    category: 'Third-Party Integrations',
    question: 'What external APIs or services need to be integrated (CRMs, Email services, SMS gateways, Maps)?',
    suggestedAnswers: [
      'Resend / SendGrid for transactional emails',
      'Twilio / local SMS gateway for phone notifications',
      'Google Maps API for location and route tracking',
      'No external APIs needed for Phase 1'
    ]
  },
  {
    id: 'integrations-2',
    category: 'Third-Party Integrations',
    question: 'Is real-time synchronization needed (WebSockets, Server-Sent Events, or simple polling)?',
    suggestedAnswers: [
      'Standard REST API / HTTP polling is sufficient',
      'Real-time WebSocket feed for live updates & notifications',
      'Offline-first with background sync when reconnected'
    ]
  },

  // 7. Payments & Billing Flow
  {
    id: 'payments-1',
    category: 'Payments & Billing',
    question: 'How will payments or monetization be processed (Stripe, Telebirr, CBE Birr, PayPal, Cash on Delivery)?',
    suggestedAnswers: [
      'Stripe Checkout (Cards & Apple Pay)',
      'Local Ethiopian gateways (Telebirr, CBE Birr, Chapa)',
      'Subscription billing with monthly/annual tiers',
      'No payments (free tool / internal enterprise app)'
    ]
  },
  {
    id: 'payments-2',
    category: 'Payments & Billing',
    question: 'Are automated tax calculation, invoicing, and PDF receipt downloads needed?',
    suggestedAnswers: [
      'Yes, automated PDF receipt generation for each transaction',
      'Basic transaction ledger view is sufficient',
      'Not required for this project'
    ]
  },

  // 8. Languages & Localization
  {
    id: 'languages-1',
    category: 'Languages & Localization',
    question: 'Which languages and currencies must be supported at launch?',
    suggestedAnswers: [
      'English only ($ USD)',
      'English and Amharic dual language (USD & ETB)',
      'Multilingual i18n structure with English, French, and Spanish'
    ]
  },

  // 9. Content, Media & Copywriting
  {
    id: 'content-1',
    category: 'Content & Assets',
    question: 'Who will supply the written copy, photography, illustrations, and legal terms?',
    suggestedAnswers: [
      'Client provides final approved copy and photography',
      'Imako Solution writes draft copy and sources royalty-free assets',
      'AI-generated placeholder copy initially, finalized before launch'
    ]
  },
  {
    id: 'content-2',
    category: 'Content & Assets',
    question: 'Does the app require user media upload (images, avatars, PDF documents) and storage?',
    suggestedAnswers: [
      'Yes, image uploads with client-side resizing and cloud storage (S3/Cloudinary)',
      'Document & PDF attachments only',
      'No user uploads needed'
    ]
  },

  // 10. Hosting, Security & Deployment
  {
    id: 'hosting-1',
    category: 'Hosting & Security',
    question: 'Where will the application be hosted and deployed (Vercel, AWS, Cloudflare, Netlify, or Docker VPS)?',
    suggestedAnswers: [
      'Vercel for frontend + Supabase / PostgreSQL backend',
      'Cloudflare Pages + Workers',
      'AWS (S3, CloudFront, ECS container)',
      'Client provided private VPS / on-premise server'
    ]
  },
  {
    id: 'hosting-2',
    category: 'Hosting & Security',
    question: 'What compliance or data privacy requirements apply (GDPR, HIPAA, local data residency)?',
    suggestedAnswers: [
      'Standard modern web security (HTTPS, CSP, sanitized inputs, rate limits)',
      'GDPR compliance with cookie banner and data export',
      'Financial data audit logging and encryption at rest'
    ]
  },

  // 11. Timeline, Milestones & Launch
  {
    id: 'timeline-1',
    category: 'Timeline & Milestones',
    question: 'What are the major milestone checkpoints between kickoff and final launch?',
    suggestedAnswers: [
      'Milestone 1: Prototype/UI (Week 1), Milestone 2: Functional Core (Week 2), Milestone 3: QA & Launch (Week 3)',
      'Phase 1: Design signoff, Phase 2: Beta staging test, Phase 3: Live production rollout'
    ]
  },
  {
    id: 'timeline-2',
    category: 'Timeline & Milestones',
    question: 'What is the primary definition of success for this project upon launch?',
    suggestedAnswers: [
      'Conversion rate increase and seamless mobile booking/purchase experience',
      'Zero downtime, sub-second load times, and positive client stakeholder feedback',
      'Replacing manual spreadsheet tracking with a fast, reliable internal system'
    ]
  }
];

/**
 * Generate a detailed, expert-level Antigravity prompt from project details and answers.
 */
export function generateAntigravityPrompt(intake: ProjectIntake): string {
  const qMap = new Map(INTAKE_QUESTIONS.map(q => [q.id, q]));

  // Group answers by category
  const categoriesMap: Record<string, { question: string; answer: string }[]> = {};
  for (const [qId, answer] of Object.entries(intake.answers)) {
    if (!answer || !answer.trim()) continue;
    const q = qMap.get(qId);
    if (q) {
      if (!categoriesMap[q.category]) {
        categoriesMap[q.category] = [];
      }
      categoriesMap[q.category].push({
        question: q.question,
        answer: answer.trim()
      });
    }
  }

  const promptSections: string[] = [];

  promptSections.push(`# Antigravity Implementation Specification: ${intake.clientName} - ${intake.projectType}`);
  promptSections.push(`*Generated for Imako Solution Client Engagement | Date: ${new Date().toLocaleDateString()}*`);
  promptSections.push(``);

  promptSections.push(`## 1. Executive Summary & Goals`);
  promptSections.push(`- **Client**: ${intake.clientName}`);
  promptSections.push(`- **Project Type**: ${intake.projectType}`);
  promptSections.push(`- **Budget**: ${intake.budget || 'To be finalized'}`);
  promptSections.push(`- **Target Launch Deadline**: ${intake.deadline || 'Flexible'}`);
  promptSections.push(`- **Project Brief**: ${intake.description}`);
  if (intake.referenceLinks) {
    promptSections.push(`- **Reference Inspiration / Benchmarks**: ${intake.referenceLinks}`);
  }
  promptSections.push(``);

  promptSections.push(`## 2. Clarified Technical & Business Requirements`);
  for (const [category, items] of Object.entries(categoriesMap)) {
    promptSections.push(`### ${category}`);
    for (const item of items) {
      promptSections.push(`- **${item.question}**`);
      promptSections.push(`  → *Decision / Specification*: ${item.answer}`);
    }
    promptSections.push(``);
  }

  promptSections.push(`## 3. Recommended Modern Architecture & Tech Stack`);
  promptSections.push(`- **Frontend**: Modern React (v18+) with TypeScript, Vite bundler, and Tailwind CSS.`);
  promptSections.push(`- **Component Design**: Accessible semantic HTML, clean state hooks, high-contrast visual cues for ADHD-friendly developer and user experience.`);
  promptSections.push(`- **Offline & PWA**: Service Worker caching, web app manifest for installable experience.`);
  promptSections.push(`- **State Management**: Local reactive state with clean storage adapter service (allowing zero-friction migration to backend APIs).`);
  promptSections.push(``);

  promptSections.push(`## 4. Step-by-Step Implementation Roadmap`);
  promptSections.push(`1. **Scaffolding & Layout Shell**: Establish responsive navigation, theme system (light/dark with smooth transition), and mobile bottom bar.`);
  promptSections.push(`2. **Data Layer & Type Definitions**: Construct robust TypeScript interfaces matching all entity requirements.`);
  promptSections.push(`3. **Core Feature Sprints**: Implement priority screens with interactive previews, visual feedback, and real-time validation.`);
  promptSections.push(`4. **Edge Cases & Error Handling**: Implement empty states, offline fallbacks, input validation alerts, and loading skeletons.`);
  promptSections.push(`5. **Testing, Build & Delivery**: Run production typecheck and bundle optimizations for sub-second first contentful paint.`);
  promptSections.push(``);

  promptSections.push(`## 5. Antigravity Agent Directive`);
  promptSections.push(`You are pair programming with Mikiyas from Imako Solution. Implement this specification adhering strictly to clean code standards, ADHD-friendly visual hierarchy, and modular component architecture. Deliver clear file links, verifiable tests, and production-ready code.`);

  return promptSections.join('\n');
}
