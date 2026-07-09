export const LINKS = {
  email: 'dpmanek@gmail.com',
  github: 'https://github.com/dpmanek',
  linkedin: 'https://www.linkedin.com/in/deepmanek',
  resume: '/api/resume',
}

export interface Project {
  index: string
  title: string
  subtitle: string
  description: string
  stack: string[]
  metric: string
  metricLabel: string
  year: string
  flagship?: boolean
  link?: string
}

export const PROJECTS: Project[] = [
  {
    index: '01',
    title: 'Document Intelligence Engine',
    subtitle: 'AI-powered migration discovery platform',
    description:
      'Replaced static intake documents with a dynamic, schema-driven questionnaire. A React + TypeScript front end renders fields, validations, and guided discovery flows from backend-generated JSON schemas, while AWS Bedrock, Lambda, DynamoDB, and OpenSearch-based RAG handle document ingestion, contextual Q&A, and migration recommendations.',
    stack: ['AWS Bedrock', 'RAG · OpenSearch', 'React + TypeScript', 'Lambda', 'DynamoDB'],
    metric: 'Weeks → Days',
    metricLabel: 'discovery cycle time',
    year: '2026',
    flagship: true,
  },
  {
    index: '02',
    title: 'Model Observability Dashboard',
    subtitle: 'Real-time model observability for data-science teams',
    description:
      'Interactive analytics dashboard visualizing accuracy, loss, and F1 across experiment runs — with run comparison, model versioning, and alert-based drift tracking. Optimized API calls and caching cut data-retrieval latency by 40%.',
    stack: ['MLflow', 'React', 'Flask', 'Model Observability'],
    metric: '−40%',
    metricLabel: 'data-retrieval latency',
    year: '2025',
  },
  {
    index: '03',
    title: 'Web Intelligence Pipeline',
    subtitle: 'Universal scraping & analytics automation',
    description:
      'Node.js + Puppeteer automation that aggregates postings and support tickets across web portals into structured datasets — headless scraping with smart delays, deduplication, and automated S3 archival. Stakeholders track trends without manual collection.',
    stack: ['Node.js', 'Puppeteer', 'AWS S3', 'Data Pipelines'],
    metric: '−70%',
    metricLabel: 'reporting time',
    year: '2025',
  },
  {
    index: '04',
    title: 'Voice-First Enterprise Agent',
    subtitle: 'Voice-first virtual agent replacing enterprise IVR',
    description:
      'Voice-enabled virtual agent built on Kore.ai SmartAssist with custom Node.js APIs — intent routing, fallback handling, and contextual FAQ retrieval powered by knowledge graphs and webhooks. A working proof-of-concept: speech recognition and dynamic dialogue chaining showed voice-first AI can retire traditional IVR menus.',
    stack: ['Kore.ai SmartAssist', 'Knowledge Graphs', 'Node.js', 'Speech Recognition'],
    metric: '0→1',
    metricLabel: 'voice-first IVR replacement — proof-of-concept',
    year: '2024',
  },
  {
    index: '05',
    title: 'JARVIS-mlx',
    subtitle: 'Fully offline AI assistant on Apple Silicon',
    description:
      'Personal R&D: an all-in-one productivity assistant running state-of-the-art local models via MLX — no cloud, no API keys, Stark-level ambition. Explores what forward-deployed AI looks like when the deployment target is your own machine.',
    stack: ['MLX', 'Local LLMs', 'Python', 'macOS'],
    metric: '100%',
    metricLabel: 'offline — zero cloud calls',
    year: '2026',
    link: 'https://github.com/dpmanek/jarvis-mlx',
  },
  {
    index: '06',
    title: 'Graphify',
    subtitle: 'Knowledge-graph skill for AI coding assistants',
    description:
      'Open-source skill for Claude Code, Cursor, Codex, and nine other AI coding agents: turns any folder of code, docs, papers, images, or videos into a queryable knowledge graph. MIT licensed.',
    stack: ['Python', 'Knowledge Graphs', 'Claude Code', 'Open Source'],
    metric: '10+',
    metricLabel: 'AI agents supported',
    year: '2026',
    link: 'https://github.com/dpmanek/graphify',
  },
]

export interface Engagement {
  client: string
  role: string
  detail: string
}

export interface Job {
  company: string
  role: string
  period: string
  location: string
  summary: string
  points: string[]
  engagements?: Engagement[]
}

export const JOBS: Job[] = [
  {
    company: 'Mphasis',
    role: 'Software Engineer — AI & Platforms',
    period: 'Sep 2024 — Present',
    location: 'New York City',
    summary:
      'Forward-deployed across four banking & enterprise clients — the exact work of an FDE: land inside the client, learn the domain, ship the system.',
    points: [
      'AI-enabled features with AWS Bedrock, Anthropic Claude APIs, knowledge graphs, and vector databases',
      'CI/CD, release automation, and cloud architecture across AWS and Azure DevOps',
    ],
    engagements: [
      {
        client: 'Fortune-100 asset manager',
        role: 'Full Stack Developer',
        detail:
          'Schema-driven UI system rendering components on-the-fly from LLM-generated JSON — deterministic component injection for AI-driven responses, deployed via S3 + CloudFront.',
      },
      {
        client: 'Global benefits administrator',
        role: 'DevOps Engineer',
        detail:
          'Multi-region CI/CD for a platform modernization program (Jenkins, GitHub Actions, Azure DevOps) — release turnaround cut in half across US & UK delivery teams.',
      },
      {
        client: 'National card issuer & servicer',
        role: 'DevOps Lead',
        detail:
          'Modernized the enterprise Data Lakehouse: migrated 100+ GitHub repos to Azure DevOps with full history, built CI/CD for Airflow DAGs, Glue jobs, and Snowflake pipelines.',
      },
      {
        client: 'Top-tier US retail bank',
        role: 'API / Migration Engineer',
        detail:
          'MuleSoft API-led connectivity for digital banking + enterprise data-center consolidation — end-to-end migration lifecycles, DR replication, runbooks, and cutover leadership.',
      },
    ],
  },
  {
    company: 'At Last Sportswear',
    role: 'Software Developer',
    period: 'May 2023 — Sep 2024',
    location: 'Secaucus, NJ',
    summary:
      'Re-engineered the company e-commerce platform from an aging monolith into a modern React/Node application.',
    points: [
      'ADA-compliant components and rebuilt product/cart flows — accessibility scores and retention up',
      'REST APIs for ERP integration and checkout: −20% data latency, −30% sync issues, 30% QoQ sales lift supported',
    ],
  },
  {
    company: 'Larsen & Toubro Infotech',
    role: 'Associate Data Scientist',
    period: 'Oct 2019 — Dec 2021',
    location: 'Mumbai, India',
    summary:
      'Government-scale full stack + early NLP work — where the AI thread started.',
    points: [
      "Ministry of India's NIIP portal (MERN): +20% engagement, +30% page-load performance",
      'Two NLP chatbots for Johnson Controls International: +25% response accuracy, +30% adoption',
    ],
  },
]

export const STATS = [
  { value: 6, suffix: '+', label: 'years shipping production software' },
  { value: 4, suffix: '', label: 'enterprise clients, embedded on-site' },
  { value: 100, suffix: '+', label: 'repos migrated with zero history loss' },
  { value: 40, suffix: '%', label: 'latency cut on ML observability APIs' },
]

export const STACK_GROUPS: { name: string; items: string[] }[] = [
  {
    name: 'Applied AI',
    items: [
      'AWS Bedrock',
      'Claude API',
      'LangChain',
      'RAG Pipelines',
      'Agentic Workflows',
      'MCP',
      'Vector DBs · FAISS / Pinecone',
      'Knowledge Graphs',
      'MLflow',
      'OpenSearch',
    ],
  },
  {
    name: 'Engineering',
    items: [
      'TypeScript',
      'React',
      'Node.js',
      'Next.js',
      'Stencil · Web Components',
      'Python',
      'Express',
      'REST · Microservices',
      'MuleSoft',
      'System Design',
    ],
  },
  {
    name: 'Cloud & DevOps',
    items: [
      'AWS · EC2 / S3 / Lambda / Glue',
      'API Gateway · CloudFront',
      'Azure DevOps',
      'Jenkins',
      'GitHub Actions',
      'Docker',
      'CI/CD Architecture',
      'Grafana · Prometheus',
      'ELK Stack',
    ],
  },
  {
    name: 'Data',
    items: ['MongoDB', 'PostgreSQL', 'Snowflake', 'Redis', 'MySQL', 'DynamoDB', 'Airflow'],
  },
]

export const MANIFESTO =
  'Anyone can demo AI. Deploying it inside a bank — through compliance, legacy systems, and real users — is the hard part. That is where I work: embedded with the client, translating ambition into architecture, and shipping LLM systems that hold up in production.'
