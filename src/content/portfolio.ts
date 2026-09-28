import type { Portfolio } from './types';

/**
 * All site content lives here. Edit this file to update the portfolio;
 * layout, commands, case study pages, SEO metadata and the share image are
 * derived from it.
 *
 * Accuracy rules for this file: no invented metrics, users, savings or
 * results; statuses use Implemented / Ongoing / In development / Planned /
 * Conceptual; planned features are labelled as planned.
 */
export const portfolio: Portfolio = {
  name: 'Ysmael Noche',
  fullName: 'Flourdfiel Ysmael B. Noche',
  handle: 'ysmael',
  role: 'Junior Data Engineer',
  school: 'Lyceum of Alabang',
  location: 'Philippines · GMT+8',
  email: 'ysmaelnoche02@gmail.com',
  phone: '+63 969 049 3331',
  portrait: {
    pixel: '/portrait/pixel.png',
    photo: '/portrait/gray.webp',
    alt: 'Portrait of Ysmael Noche in a dark suit and tie, smiling',
  },
  intro:
    'I start with the business problem, then the process and the data behind it — and build what solves it: data pipelines, dashboards, automations and internal tools.',
  bio: [
    'I’m a junior data engineer in the Data & AI team at TVS Philippines, with a background in full-stack development, workflow automation, API integration and analytics. I like understanding how a business actually runs, finding the gaps in its processes, and building practical solutions with data, software, automation and AI.',
    'My work started in full-stack development and grew into system integration, data engineering, business intelligence and AI. The tools change; the approach doesn’t — understand the problem, the process and the data first, then design, build, validate and improve.',
    'I’m early in my career and I learn by building real systems for real business problems. Where I’m heading is the intersection of data engineering and AI engineering: systems where data, software and intelligence work together.',
  ],
  approach: ['Problem', 'Process', 'Data', 'Design', 'Build', 'Validate', 'Improve'],
  availability: 'Open to conversations about data engineering, automation and AI',
  projects: [
    // ------------------------------------------------------------ Data & AI, TVS Philippines
    {
      id: 'network-dashboard',
      name: 'Network Management Dashboard',
      status: 'Implemented',
      year: '2026',
      context: 'Data & AI · TVS Philippines',
      kind: 'Data Engineering / Business Intelligence',
      summary:
        'An end-to-end Databricks pipeline on the Medallion Architecture that turns dealer network source data into a business-ready Power BI dashboard for the Philippines dealer network.',
      stack: [
        'Databricks',
        'PySpark',
        'Spark DataFrames',
        'Delta Lake',
        'Medallion Architecture',
        'Power BI',
        'DAX',
        'Power BI Semantic Models',
      ],
      facts: [
        { label: 'Architecture', value: 'Medallion' },
        { label: 'Market', value: 'Philippines' },
      ],
      visual: { type: 'flow', steps: ['Source data', 'Bronze', 'Silver', 'Gold', 'Semantic model', 'Dashboard'] },
      sections: [
        {
          title: 'Problem',
          body: [
            'Dealer network information needed to be transformed from source-level data into a more structured, reliable and business-ready analytics layer.',
            'Without a structured pipeline and reporting layer, converting the available operational data into consistent business insight is difficult.',
          ],
        },
        {
          title: 'Solution',
          body: ['I developed an end-to-end data pipeline in Databricks using the Medallion Architecture.'],
          flow: ['Source data', 'Bronze', 'Silver', 'Gold', 'Power BI semantic model', 'Network Management Dashboard'],
          items: [
            'Data ingestion and transformation with PySpark and Spark DataFrames',
            'Delta Lake tables across the Bronze, Silver and Gold layers',
            'Business-ready datasets',
            'Semantic modeling and DAX',
            'Power BI dashboard development',
          ],
        },
        {
          title: 'Outcome',
          body: [
            'Implemented for the Philippines dealer network.',
            'The Philippines implementation is also being considered as a template for Indonesia’s Network Dealer Dashboard — an opportunity to reuse and standardize parts of the analytics solution across markets.',
          ],
        },
        {
          title: 'Future direction',
          body: [
            'As more historical data becomes available, the goal is to evolve the dashboard from reporting performance into a platform for deeper, more actionable business insight:',
          ],
          items: [
            'Deeper trend analysis',
            'Historical performance comparison',
            'Expanded KPI monitoring',
            'Identifying long-term dealer patterns',
            'Reusable analytics structures for additional markets',
          ],
        },
      ],
    },
    {
      id: 'bulletin-board',
      name: 'Digital Bulletin Board',
      status: 'Implemented',
      statusNote: 'continuing development',
      year: '2026',
      context: 'Data & AI · TVS Philippines',
      kind: 'Internal platform / Full-stack development',
      summary:
        'An internal platform that gives employees one place for announcements, policies, forms, surveys, department information and internal links — with controlled content administration.',
      stack: ['Next.js', 'Supabase'],
      facts: [
        { label: 'Access', value: 'Role + department' },
        { label: 'Next', value: 'NAVI (planned)' },
      ],
      visual: {
        type: 'flow',
        steps: ['Authorized admins', 'Content management', 'Role & department access', 'Employee portal'],
        planned: ['NAVI assistant'],
      },
      sections: [
        {
          title: 'Problem',
          body: [
            'Employees need a simple, centralized way to reach important internal information instead of relying on channels and sources scattered across platforms.',
            'Announcements, policies, forms, surveys, department information, useful systems and links become hard to find when they are spread across multiple places.',
          ],
        },
        {
          title: 'Solution',
          body: [
            'I developed the Digital Bulletin Board, an internal platform for TVS Philippines that gives employees a centralized place for organizational information and resources:',
          ],
          items: [
            'Company announcements',
            'Policies and information',
            'Forms and requests',
            'Surveys',
            'Department information',
            'Internal systems and links',
            'Frequently asked questions',
          ],
        },
        {
          title: 'How it’s built',
          items: [
            'Next.js with Supabase for authentication and the database',
            'Role-based and department-based access',
            'Controlled content administration, so authorized users can manage and maintain what employees see',
          ],
        },
        {
          title: 'Purpose',
          items: [
            'Centralize important internal information',
            'Reduce the time employees spend searching for resources',
            'Make company information easier to access',
            'Simplify internal content administration',
            'Provide a cleaner digital communication channel for employees',
          ],
        },
        {
          title: 'Future direction (planned)',
          body: [
            'NAVI, an AI-powered internal assistant, is planned. It is intended to let employees ask questions conversationally and retrieve relevant internal information without manually searching through policies, announcements and FAQs.',
            'The longer-term direction is to evolve the Digital Bulletin Board from a centralized information platform into an AI-assisted internal knowledge system.',
          ],
        },
      ],
    },
    {
      id: 'device-management',
      name: 'IT Device Management System',
      status: 'Implemented',
      year: '2026',
      context: 'Data & AI · TVS Philippines',
      kind: 'Internal business application',
      summary:
        'An internal system that centralizes records of TVS-owned and agency-issued laptops and other devices, giving Philippines IT Support a structured way to track and review them.',
      stack: [],
      facts: [
        { label: 'Built for', value: 'PH IT Support' },
        { label: 'Tracks', value: 'TVS & agency devices' },
      ],
      visual: { type: 'flow', steps: ['Device records', 'Central registry', 'IT Support review'] },
      sections: [
        {
          title: 'Problem',
          body: [
            'Philippines IT Support needs to manage and track TVS-owned and agency-issued laptops and other devices. Fragmented or manually maintained records make it harder to keep visibility over IT assets.',
          ],
        },
        {
          title: 'Solution',
          body: [
            'I developed an internal IT Device Management System that centralizes device and asset information for Philippines IT Support, with a more structured way of maintaining and reviewing device records.',
          ],
        },
        {
          title: 'Purpose',
          items: [
            'Centralize IT asset records',
            'Improve device visibility',
            'Simplify tracking',
            'Provide a structured approach to IT asset management',
          ],
        },
        {
          title: 'Future direction',
          body: ['The system can keep evolving with IT Support’s actual requirements, including:'],
          items: [
            'Device lifecycle history',
            'Improved reporting',
            'Historical tracking',
            'Stronger asset visibility',
            'Additional operational functions',
          ],
        },
      ],
    },
    {
      id: 'btl-analytics',
      name: 'BTL Activity Analytics',
      status: 'Ongoing',
      year: '2026',
      context: 'Data & AI · TVS Philippines',
      kind: 'Data Analytics / Business Intelligence',
      summary:
        'Consolidating incomplete, inconsistently structured Below-the-Line activity data to understand performance, productivity and cost efficiency across activity types, areas and regions.',
      stack: ['Data Analytics'],
      facts: [
        { label: 'Lens', value: 'Productivity × cost' },
        { label: 'Scope', value: 'Areas & regions' },
      ],
      visual: { type: 'quadrant', x: 'Cost', y: 'Productivity' },
      sections: [
        {
          title: 'Problem',
          body: [
            'Historical Below-the-Line (BTL) activity data is incomplete and inconsistently structured, which makes it hard to compare activities accurately and tell which ones perform well relative to their cost.',
            'The available information includes:',
          ],
          items: [
            'Activity types, costs and targets',
            'Actual results: enquiries, applications and retail',
            'Areas, regions and outcomes',
          ],
        },
        {
          title: 'Current work',
          body: [
            'I am consolidating and analyzing the available BTL activity data to better understand performance, productivity and cost efficiency, looking at how activity performance relates to spending and for patterns across activity types, areas and regions.',
            'One analytical direction compares activities across four combinations:',
          ],
          items: [
            'High productivity / high cost',
            'Low productivity / high cost',
            'High productivity / low cost',
            'Low productivity / low cost',
          ],
        },
        {
          title: 'Data quality',
          body: [
            'Data completeness varies significantly across historical records. Part of the work is identifying the data quality and completeness gaps that currently limit deeper analysis, and conclusions are drawn carefully with that in mind.',
          ],
        },
        {
          title: 'Objective',
          body: ['Build a stronger analytical foundation for:'],
          items: [
            'BTL performance evaluation',
            'Cost efficiency analysis',
            'Activity comparison',
            'Regional analysis',
            'Future activity planning',
            'Data-driven decision-making',
          ],
        },
      ],
    },
    {
      id: 'lead-accountability',
      name: 'Zoho CRM Lead Accountability',
      status: 'Ongoing',
      year: '2026',
      context: 'Data & AI · TVS Philippines',
      kind: 'CRM / Business process improvement',
      summary:
        'Designing a traceable lead-management process so every customer lead can be followed from inquiry to handling to final outcome — closing the visibility gap between CRM and Area Coordinators.',
      stack: ['Zoho CRM'],
      facts: [
        { label: 'Stages', value: '5' },
        { label: 'Goal', value: 'End-to-end traceability' },
      ],
      visual: { type: 'flow', steps: ['Lead received', 'Assigned', 'Contact attempt', 'Follow-up', 'Outcome'] },
      sections: [
        {
          title: 'Problem',
          body: [
            'Marketing and CRM receive customer leads — name, phone number, email, location, motorcycle model of interest, inquiry details and lead source. CRM consolidates them and forwards each one to the right Area Coordinator for follow-up.',
            'The gap appears after the handover. Coordinators may report that a customer has been contacted, but CRM has limited visibility to independently verify:',
          ],
          items: [
            'Whether, when and by whom the customer was contacted',
            'What action was taken and what communication occurred',
            'Whether follow-up happened',
            'The current lead status, and whether it converted or was lost',
          ],
        },
        {
          title: 'Solution being developed',
          body: ['A more traceable lead-management process:'],
          flow: ['Lead received', 'Assigned', 'Contact attempt', 'Follow-up', 'Outcome'],
          items: [
            'Activity history and status tracking',
            'Timestamps and ownership',
            'Notes and communication records',
            'Evidence of actions where appropriate',
            'A final lead outcome',
          ],
        },
        {
          title: 'Goal',
          body: [
            'The goal isn’t simply to store more customer information in a CRM. It is end-to-end lead accountability: every lead traceable from initial inquiry to actual customer handling and final outcome.',
            'That can eventually support reporting on follow-up compliance, response times, lead conversion, lead source effectiveness, area performance and coordinator activity.',
          ],
        },
      ],
    },

    // ------------------------------------------------------------ Comrise internship
    {
      id: 'resume-harvesting',
      name: 'Resume Harvesting Platform',
      status: 'Implemented',
      year: '2026',
      context: 'Comrise, Inc. · internship',
      kind: 'Full-stack development / Recruitment automation',
      summary:
        'A full-stack platform that retrieves resumes from email, extracts candidate information with rule-based parsing, manages a processing queue and syncs candidates to CEIPAL ATS.',
      stack: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'IMAP', 'CEIPAL ATS'],
      facts: [
        { label: 'Parsing', value: 'Rule-based' },
        { label: 'Syncs to', value: 'CEIPAL ATS' },
      ],
      visual: {
        type: 'flow',
        steps: ['Email (IMAP)', 'Processing queue', 'Rule-based extraction', 'Admin & reprocessing', 'CEIPAL ATS'],
      },
      group: 'comrise',
      sections: [
        {
          title: 'Problem',
          body: ['Candidate resumes received by email required manual processing and synchronization with recruitment systems.'],
        },
        {
          title: 'Solution',
          body: ['A full-stack platform that:'],
          items: [
            'Retrieves resumes from email (IMAP)',
            'Processes resume documents and extracts candidate information',
            'Maintains processing queues and tracks processing status',
            'Provides administrative controls and supports reprocessing',
            'Synchronizes candidate information with CEIPAL ATS',
          ],
        },
        {
          title: 'A note on parsing',
          body: [
            'Resume parsing is rule-based, not AI-powered. AI-powered parsing was considered as a possible improvement but was not implemented because of cost.',
          ],
        },
      ],
    },
    {
      id: 'leads-sync',
      name: 'Leads Data Source Automation',
      status: 'Implemented',
      year: '2026',
      context: 'Comrise, Inc. · internship',
      kind: 'Data integration / Automation',
      summary:
        'An automated integration that retrieves lead and contact data from the CEIPAL BI APIs — with pagination and rate-limit recovery — and syncs it into Google Sheets for reporting.',
      stack: ['CEIPAL BI', 'Google Apps Script', 'Google Sheets', 'REST APIs'],
      facts: [
        { label: 'Records surfaced', value: '4,400+' },
        { label: 'Handles', value: 'Pagination · rate limits' },
      ],
      visual: {
        type: 'flow',
        steps: ['CEIPAL BI APIs', 'Paginated fetch', 'Rate-limit recovery', 'Lead & contact sync', 'Reports'],
      },
      group: 'comrise',
      sections: [
        {
          title: 'Problem',
          body: ['Large volumes of lead and contact information needed to be retrieved and synchronized from CEIPAL BI.'],
        },
        {
          title: 'Solution',
          body: ['An automated data integration workflow that handles:'],
          items: ['API pagination', 'Rate-limit recovery', 'Lead synchronization', 'Contact synchronization', 'Automated reporting'],
        },
        {
          title: 'Outcome',
          body: ['The implementation handled and surfaced 4,400+ lead and contact records.'],
        },
      ],
    },
    {
      id: 'right-to-represent',
      name: 'Right to Represent System',
      status: 'Implemented',
      year: '2026',
      context: 'Comrise, Inc. · internship',
      kind: 'Workflow automation / Recruitment',
      summary:
        'A secure candidate authorization workflow that digitizes the recruiter-to-candidate Right to Represent process, with signed, expiring approval links and a central audit trail.',
      stack: ['Google Sheets'],
      facts: [
        { label: 'Links', value: 'HMAC-signed, expiring' },
        { label: 'Output', value: 'PDF + audit log' },
      ],
      visual: {
        type: 'flow',
        steps: ['Recruiter request', 'Signed link (HMAC)', 'Candidate approval', 'PDF + email', 'Audit log'],
      },
      group: 'comrise',
      sections: [
        {
          title: 'Purpose',
          body: ['Digitize and improve the recruiter-to-candidate Right to Represent authorization process.'],
        },
        {
          title: 'Solution',
          body: ['A secure candidate authorization workflow with:'],
          items: [
            'HMAC-signed approval links',
            'Expiring authorization links',
            'Automated PDF generation',
            'Email notifications',
            'Google Sheets logging',
            'Centralized audit information',
          ],
        },
      ],
    },
    {
      id: 'taa-tracker',
      name: 'TAA Tracker',
      status: 'Implemented',
      year: '2026',
      context: 'Comrise, Inc. · internship',
      kind: 'Workflow automation / Recruitment systems',
      summary:
        'A recruitment workflow app where job requisitions are submitted once and synchronized to both Google Sheets and CEIPAL ATS, removing duplicate data entry.',
      stack: ['Google Apps Script', 'HTML5', 'React', 'Bootstrap', 'CEIPAL ATS', 'Google Sheets'],
      facts: [
        { label: 'Entry', value: 'Once' },
        { label: 'Syncs to', value: 'Sheets + ATS' },
      ],
      visual: { type: 'flow', steps: ['Requisition form', 'Submitted once', 'Google Sheets', 'CEIPAL ATS'] },
      group: 'comrise',
      sections: [
        {
          title: 'Problem',
          body: ['Job requisition information required duplicate manual entry across different systems.'],
        },
        {
          title: 'Solution',
          body: [
            'A recruitment workflow application that lets job requisition information be submitted once and synchronized with both Google Sheets and CEIPAL ATS.',
          ],
        },
        {
          title: 'Purpose',
          body: ['Reduce duplicate data entry and streamline the job requisition process.'],
        },
      ],
    },
    {
      id: 'mdc-sync',
      name: 'MDC Data Source Automation',
      status: 'Implemented',
      year: '2026',
      context: 'Comrise, Inc. · internship',
      kind: 'Data integration / Automation',
      summary:
        'Scheduled synchronization of CEIPAL ATS data into Google Sheets for operational reporting, with ownership mapping, duplicate prevention and stale-record handling.',
      stack: ['Google Apps Script', 'CEIPAL ATS', 'Google Sheets', 'REST APIs'],
      facts: [
        { label: 'Sync', value: 'Scheduled' },
        { label: 'Guards', value: 'Dedupe · stale records' },
      ],
      visual: {
        type: 'flow',
        steps: ['CEIPAL ATS', 'Scheduled sync', 'Ownership mapping', 'Dedupe & stale checks', 'Google Sheets'],
      },
      group: 'comrise',
      sections: [
        {
          title: 'Problem',
          body: ['CEIPAL ATS information needed to be synchronized with Google Sheets for operational reporting and data access.'],
        },
        {
          title: 'Solution',
          body: ['An automated synchronization process with:'],
          items: ['Scheduled synchronization', 'Ownership mapping', 'Duplicate prevention', 'Stale record handling'],
        },
        {
          title: 'Purpose',
          body: ['Reduce manual data synchronization and improve reporting consistency.'],
        },
      ],
    },

    // ------------------------------------------------------------ Personal & academic
    {
      id: 'local-agent',
      name: 'Local Personal AI Agent',
      status: 'In development',
      year: '2026',
      context: 'Personal project',
      kind: 'AI Engineering / RAG / Local AI',
      summary:
        'A private AI assistant that runs on my own computer and answers from my Obsidian knowledge base, using retrieval-augmented generation with a local LLM.',
      stack: [
        'Python',
        'FastAPI',
        'React',
        'Vite',
        'Tailwind CSS',
        'Ollama',
        'Qwen',
        'Supabase',
        'pgvector',
        'LangChain',
        'LangGraph',
      ],
      facts: [
        { label: 'Model', value: 'Qwen3 8B' },
        { label: 'Runs', value: 'Locally (Ollama)' },
      ],
      visual: {
        type: 'flow',
        steps: ['Obsidian vault', 'Processing', 'Embeddings', 'pgvector', 'Retrieval', 'Local LLM', 'FastAPI', 'React'],
      },
      sections: [
        {
          title: 'Goal',
          body: [
            'A private AI assistant that retrieves information from my own knowledge base and uses it as contextual memory — running locally on my computer.',
          ],
        },
        {
          title: 'Architecture',
          flow: [
            'Obsidian vault',
            'Document processing',
            'Embeddings',
            'Vector database',
            'Retrieval',
            'Local LLM',
            'FastAPI',
            'React',
          ],
        },
        {
          title: 'Stack',
          items: [
            'LLM: Qwen3 8B, running on Ollama',
            'Embeddings: nomic-embed-text',
            'Vector database: Supabase with pgvector',
            'Backend: Python and FastAPI',
            'Frontend: React, Vite and Tailwind CSS',
            'Orchestration: LangChain and LangGraph',
            'Knowledge base: Obsidian',
          ],
        },
        {
          title: 'What I’m exploring',
          items: [
            'Retrieval-augmented generation',
            'AI agents and local LLMs',
            'Embeddings, semantic search and vector databases',
            'Context engineering and metadata-aware retrieval',
            'Personal knowledge systems',
          ],
        },
      ],
    },
    // Draft: Ysmael will send the full Orbit details. Until then only list areas being explored, not finished features.
    {
      id: 'orbit',
      name: 'Orbit',
      status: 'In development',
      year: '2026',
      context: 'Personal product project',
      kind: 'Windows application / Product engineering',
      summary:
        'A Windows desktop utility built around a small floating object that expands contextually when needed — an ambient tool that keeps frequent actions close without interrupting your work.',
      stack: [],
      facts: [
        { label: 'Platform', value: 'Windows' },
        { label: 'Direction', value: 'Minimal · monochrome' },
      ],
      sections: [
        {
          title: 'What it is',
          body: [
            'Rather than another traditional application launcher, Orbit is designed as an ambient desktop utility: a small floating object that expands when needed, making frequently used actions available without disrupting your workflow.',
          ],
        },
        {
          title: 'Areas being explored',
          body: ['Orbit is in development. These are areas being explored, not finished features:'],
          items: [
            'Media controls',
            'Timers and focus tools',
            'Search',
            'Screenshot tools',
            'Scratchpad',
            'System information',
            'Desktop interactions',
            'Context-aware interfaces',
            'Motion and animation',
          ],
        },
        {
          title: 'Visual direction',
          items: ['Minimal', 'Monochrome', 'Premium', 'Compact', 'Highly interactive', 'Native to the desktop'],
        },
        {
          title: 'Why',
          body: [
            'Orbit is where I explore product engineering, Windows development, interaction design, animation and polished user experiences.',
          ],
        },
      ],
    },
    {
      id: 'workflow-system',
      name: 'Workflow Process Management System',
      status: 'Implemented',
      context: 'Capstone project · Lyceum of Alabang',
      kind: 'Enterprise application / Workflow automation',
      role: 'Lead developer',
      summary:
        'A system that digitizes organizational workflows — routing, request tracking, approvals with electronic signatures, notifications and dashboards — with Google Gemini integration.',
      stack: ['Laravel', 'PHP', 'MySQL', 'JavaScript', 'Bootstrap', 'REST APIs', 'Pusher', 'Google Gemini API'],
      facts: [
        { label: 'Role', value: 'Lead developer' },
        { label: 'Type', value: 'Capstone' },
      ],
      visual: { type: 'flow', steps: ['Request', 'Routing', 'Approval + e-signature', 'Notifications', 'Dashboard'] },
      sections: [
        {
          title: 'Problem',
          body: [
            'Organizational requests and workflows relied heavily on manual processes, routing, approvals, documentation and coordination across departments.',
          ],
        },
        {
          title: 'Solution',
          body: ['I led the development of a Workflow Process Management System to digitize and automate organizational workflows:'],
          items: [
            'Workflow routing and request tracking',
            'Approval management with electronic signatures',
            'Role-based access control',
            'Dashboard analytics',
            'Real-time notifications (Pusher)',
            'REST API integrations',
            'Document management',
            'Google Gemini integration',
          ],
        },
        {
          title: 'Why it mattered',
          body: [
            'This project strengthened my interest in workflow automation, enterprise applications, AI integration and business process improvement.',
          ],
        },
      ],
    },
  ],
  groups: [
    {
      id: 'comrise',
      title: 'Comrise internship',
      role: 'Full Stack Developer Intern',
      org: 'Comrise, Inc.',
      period: 'Feb – May 2026',
      summary:
        '450 hours of full-stack development, backend work, API integration, workflow automation and data synchronization for recruitment systems.',
      facts: [
        { label: 'Hours', value: '450' },
        { label: 'Recognition', value: 'Top Performer' },
      ],
      stack: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Google Apps Script', 'Google Sheets', 'REST APIs', 'CEIPAL ATS', 'CEIPAL BI'],
    },
  ],
  skills: [
    { group: 'Languages', items: ['Python', 'SQL', 'JavaScript', 'PHP', 'HTML5', 'CSS3', 'Google Apps Script'] },
    {
      group: 'Data engineering',
      items: ['Databricks', 'PySpark', 'Spark DataFrames', 'Delta Lake', 'ETL', 'Medallion Architecture', 'Data Pipelines'],
    },
    { group: 'BI & analytics', items: ['Power BI', 'DAX', 'Power BI Semantic Models', 'Dashboard Development', 'Data Analytics'] },
    { group: 'Frontend', items: ['React', 'Next.js', 'Vite', 'Tailwind CSS', 'Bootstrap'] },
    { group: 'Backend', items: ['FastAPI', 'Laravel', 'REST APIs', 'API Integration'] },
    { group: 'Databases', items: ['PostgreSQL', 'MySQL', 'Supabase', 'pgvector'] },
    {
      group: 'AI & automation',
      items: ['Workflow Automation', 'AI Integration', 'Google Gemini API', 'Databricks Genie AI', 'Prompt Engineering'],
    },
    {
      // Personal experimentation — deliberately kept apart from production experience.
      group: 'Exploring',
      items: ['Ollama', 'Qwen', 'RAG', 'Embeddings', 'Vector Search', 'LangChain', 'LangGraph', 'AI Agents'],
    },
    { group: 'Platforms', items: ['Zoho CRM', 'BoldDesk', 'CEIPAL ATS', 'CEIPAL BI'] },
    { group: 'Tools', items: ['Git', 'GitHub', 'VS Code', 'Postman'] },
  ],
  timeline: [
    { years: 'Jul 2026 — Now', role: 'Junior Data Engineer', org: 'Data & AI, TVS Philippines' },
    {
      years: 'May 2026',
      role: 'B.S. Information Technology',
      org: 'Lyceum of Alabang',
      note: 'Graduated · lead developer, capstone project',
    },
    {
      years: 'Feb — May 2026',
      role: 'Full Stack Developer Intern',
      org: 'Comrise, Inc.',
      note: 'Top Performer Award · 450 hours',
    },
  ],
  links: [
    { label: 'GitHub', handle: '@ysmaelnoche', href: 'https://github.com/ysmaelnoche' },
    { label: 'LinkedIn', handle: 'in/ysmaelnoche', href: 'https://www.linkedin.com/in/ysmaelnoche' },
    // TODO: résumé (put the PDF in /public and link '/resume.pdf').
  ],
  hints: { open: 'orbit', grep: 'python' },
};
