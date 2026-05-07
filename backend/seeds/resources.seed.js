const mongoose = require('mongoose');
const Resource = require('../models/Resource');

const resourcesData = [
  {
    title: 'Startup India Seed Fund',
    type: 'government',
    organization: 'Department for Promotion of Industry and Internal Trade (DPIIT)',
    description:
      'Financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization. The scheme aims to support high-potential startups across the country.',
    fundingAmount: '₹20 Lakhs - ₹50 Lakhs',
    stage: ['Idea', 'MVP'],
    sector: ['Tech', 'EdTech', 'AgriTech', 'FinTech', 'HealthTech'],
    eligibility:
      'Must be a startup registered with DPIIT. The founder should be at least 18 years old. The startup should have been in operation for less than 6 years. Should be a private limited company or registered partnership or limited liability partnership.',
    requirements: ['DPIIT registration', 'Business plan', 'Financial projections', 'Team details'],
    location: ['India'],
    deadline: new Date('2026-03-31'),
    link: 'https://www.startupindia.gov.in',
    contactEmail: 'seedfund@dpiit.gov.in',
    isFeatured: true,
    featuredUntil: new Date('2026-06-30'),
    isActive: true,
    verifiedAt: new Date(),
    createdBy: 'admin',
  },
  {
    title: 'MSME Soft Loan Scheme',
    type: 'loan',
    organization: 'Small Industries Development Bank of India (SIDBI)',
    description:
      'Soft loans to MSMEs for expansion, modernization, and working capital needs. The scheme provides collateral-free loans with a government guarantee.',
    fundingAmount: '₹10 Lakhs - ₹1 Crore',
    stage: ['Early Revenue', 'Growth'],
    sector: ['Manufacturing', 'Services', 'Tech', 'AgriTech'],
    eligibility:
      'Must be registered as MSME. Annual turnover less than ₹100 crores. Manufacturing units with investment in plant and machinery less than ₹25 crores. Service enterprises with investment in equipments less than ₹10 crores.',
    requirements: ['MSME certificate', 'Business plan', 'Bank details', 'Income tax returns'],
    location: ['India'],
    deadline: new Date('2026-05-15'),
    link: 'https://www.sidbi.in',
    contactEmail: 'msme@sidbi.in',
    isFeatured: true,
    isActive: true,
    verifiedAt: new Date(),
    createdBy: 'admin',
  },
  {
    title: 'Telangana Innovation Cell Grant',
    type: 'government',
    organization: 'T-Hub, Telangana Innovation Cell',
    description:
      'Grants and mentoring for early-stage tech startups in Telangana. Covers ecosystem support, networking, and growth programs. Includes office space at subsidized rates.',
    fundingAmount: '₹5 Lakhs - ₹25 Lakhs',
    stage: ['Idea', 'MVP', 'Early Revenue'],
    sector: ['Tech', 'EdTech', 'FinTech', 'HealthTech'],
    eligibility:
      'Startup must be registered in Telangana. Founders should be willing to relocate to Hyderabad. Technology-focused startups preferred. Preferably less than 2 years old.',
    requirements: ['Business plan', 'Pitch deck', 'Team credentials', 'Product demo'],
    location: ['Telangana'],
    deadline: new Date('2026-04-30'),
    link: 'https://www.t-hub.co',
    contactEmail: 'support@t-hub.co',
    isFeatured: true,
    isActive: true,
    verifiedAt: new Date(),
    createdBy: 'admin',
  },
  {
    title: 'Y Combinator Startup School',
    type: 'accelerator',
    organization: 'Y Combinator',
    description:
      'Free startup school program with online curriculum, mentoring from YC partners, and access to investor network. Designed to prepare startups for growth. Selective batch program available for funding.',
    fundingAmount: '₹50 Lakhs - ₹1.5 Crores (for batch startups)',
    stage: ['Idea', 'MVP', 'Early Revenue'],
    sector: ['Tech', 'SaaS', 'Deeptech', 'FinTech'],
    eligibility:
      'Startup school is open to anyone. For batch program: early-stage startups, tech-focused, with founding team of at least 2 people. Must be willing to relocate or be based in SF Bay area.',
    requirements: ['Application form', 'Company description', 'Video introduction'],
    location: ['India', 'Global'],
    deadline: null,
    link: 'https://www.ycombinator.com',
    isFeatured: false,
    isActive: true,
    verifiedAt: new Date(),
    createdBy: 'admin',
  },
  {
    title: 'Sequoia Capital India Fund',
    type: 'private',
    organization: 'Sequoia Capital India',
    description:
      'Early-stage and growth-stage venture capital funding for high-potential Indian startups. Provides capital, mentoring, and strategic guidance. Focus on tech, fintech, healthtech, and deeptech startups.',
    fundingAmount: '₹50 Lakhs - ₹5 Crores+',
    stage: ['MVP', 'Early Revenue', 'Growth', 'Scale'],
    sector: ['Tech', 'FinTech', 'HealthTech', 'Deeptech', 'SaaS'],
    eligibility:
      'Early-stage to growth-stage startups. Proven product-market fit preferred. Strong founding team with relevant industry experience. Indian or India-focused startups preferred.',
    requirements: ['Pitch deck', 'Financial projections', 'Market analysis', 'Team backgrounds'],
    location: ['India'],
    deadline: null,
    link: 'https://www.sequoiacap.com',
    contactEmail: 'india@sequoia.com',
    isFeatured: false,
    isActive: true,
    verifiedAt: new Date(),
    createdBy: 'admin',
  },
  {
    title: 'Atal Innovation Mission Grants',
    type: 'government',
    organization: 'Atal Innovation Mission (AIM), NITI Aayog',
    description:
      'Support for innovation and entrepreneurship through grants, mentoring, and incubation. Covers deep tech, startups, and innovation hubs across India. Part of Government of India initiative.',
    fundingAmount: '₹20 Lakhs - ₹50 Lakhs',
    stage: ['Idea', 'MVP'],
    sector: ['Deeptech', 'Hardware', 'AI/ML', 'Robotics'],
    eligibility:
      'Registered Indian startup or entrepreneur. Technology or innovation-focused. Can be applied through an incubation center. Preferably less than 5 years old.',
    requirements: ['Project plan', 'Technical specifications', 'Team details', 'Budget breakdown'],
    location: ['India'],
    deadline: new Date('2026-02-28'),
    link: 'https://www.aim.gov.in',
    contactEmail: 'support@aim.gov.in',
    isFeatured: false,
    isActive: true,
    verifiedAt: new Date(),
    createdBy: 'admin',
  },
  {
    title: 'Techstars Accelerator Program',
    type: 'accelerator',
    organization: 'Techstars',
    description:
      'Intensive 3-month accelerator program with seed funding, mentoring from Techstars network, and demo day with investors. Available in multiple locations including India.',
    fundingAmount: '₹20 Lakhs - ₹50 Lakhs (+ mentoring)',
    stage: ['Idea', 'MVP'],
    sector: ['Tech', 'SaaS', 'FinTech', 'HealthTech'],
    eligibility:
      'Early-stage startups with a working prototype or MVP. Strong founding team (at least 2 co-founders preferred). Willing to relocate for the program duration.',
    requirements: ['Online application', 'Pitch video', 'Team information', 'Company description'],
    location: ['India', 'Global'],
    deadline: null,
    link: 'https://www.techstars.com',
    isFeatured: false,
    isActive: true,
    verifiedAt: new Date(),
    createdBy: 'admin',
  },
  {
    title: 'Mudra Loan Scheme',
    type: 'loan',
    organization: 'Ministry of Micro, Small & Medium Enterprises',
    description:
      'Unsecured loans up to ₹10 lakhs for micro businesses and startups without collateral. Designed to support entrepreneurs and small business owners. Fast approval process.',
    fundingAmount: '₹50,000 - ₹10 Lakhs',
    stage: ['Idea', 'MVP'],
    sector: ['All sectors'],
    eligibility:
      'Indian citizen aged 18 years or above. Micro business or small enterprise. Not a defaulter in any bank or financial institution. Business should not have existed for more than 5 years.',
    requirements: ['ID proof', 'Address proof', 'Business plan', 'Bank statement'],
    location: ['India'],
    deadline: null,
    link: 'https://www.mudracard.com',
    contactEmail: 'support@mudra.org.in',
    isFeatured: false,
    isActive: true,
    verifiedAt: new Date(),
    createdBy: 'admin',
  },
  {
    title: 'Digital India Fund',
    type: 'government',
    organization: 'Government of India, Ministry of Electronics and IT',
    description:
      'Grants for digital startup initiatives and technology innovation. Focus on software, IT services, digital platforms, and cyber security. Supports startups enhancing digital India ecosystem.',
    fundingAmount: '₹10 Lakhs - ₹50 Lakhs',
    stage: ['Idea', 'MVP', 'Early Revenue'],
    sector: ['Tech', 'SaaS', 'Cybersecurity', 'AI/ML'],
    eligibility:
      'Registered startup with DPIIT or MSME. Software/IT/Digital services focused. Indian incorporation required. Less than 10 years old.',
    requirements: ['DPIIT registration', 'Technical documentation', 'Team details', 'Financial plan'],
    location: ['India'],
    deadline: new Date('2026-04-15'),
    link: 'https://www.digitalindia.gov.in',
    contactEmail: 'startup@meity.gov.in',
    isFeatured: false,
    isActive: true,
    verifiedAt: new Date(),
    createdBy: 'admin',
  },
  {
    title: '100X.VC Early Stage Fund',
    type: 'private',
    organization: '100X.VC',
    description:
      'Early-stage venture capital focused on Indian tech startups. Provides pre-seed and seed funding with hands-on mentoring. Active investor in SaaS, EdTech, and FinTech space.',
    fundingAmount: '₹25 Lakhs - ₹1 Crore',
    stage: ['MVP', 'Early Revenue'],
    sector: ['Tech', 'SaaS', 'EdTech', 'FinTech'],
    eligibility:
      'Indian tech startup with clear problem statement and solution. Founding team with relevant experience. Product should have some market traction.',
    requirements: ['Pitch deck', 'Financial metrics', 'Customer feedback', 'Go-to-market plan'],
    location: ['India'],
    deadline: null,
    link: 'https://www.100x.vc',
    isFeatured: false,
    isActive: true,
    verifiedAt: new Date(),
    createdBy: 'admin',
  },
  {
    title: 'Women Startup Fund',
    type: 'government',
    organization: 'DPIIT & NITI Aayog',
    description:
      'Dedicated fund for startups founded by women entrepreneurs. Provides grants, subsidized mentoring, and networking opportunities. Part of empowerment initiative.',
    fundingAmount: '₹20 Lakhs - ₹1 Crore',
    stage: ['Idea', 'MVP', 'Early Revenue', 'Growth'],
    sector: ['Tech', 'EdTech', 'HealthTech', 'All sectors'],
    eligibility:
      'Startup with at least 50% ownership and leadership by women. Registered startup preferred. Any sector welcome. Less than 10 years in operation.',
    requirements: ['Founder credentials', 'Business plan', 'Proof of ownership', 'Impact metrics'],
    location: ['India'],
    deadline: new Date('2026-06-30'),
    link: 'https://www.startupindia.gov.in/women',
    contactEmail: 'women@dpiit.gov.in',
    isFeatured: false,
    isActive: true,
    verifiedAt: new Date(),
    createdBy: 'admin',
  },
];

const seedResources = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fondorax', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing resources
    await Resource.deleteMany({});

    // Insert new resources
    const inserted = await Resource.insertMany(resourcesData);

    console.log(`✓ Successfully seeded ${inserted.length} resources!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding resources:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedResources();
}

module.exports = { seedResources, resourcesData };
