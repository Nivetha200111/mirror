import { Mentor } from "@/types";

// REAL people with REAL journeys - not generic archetypes
export const realMentors: Mentor[] = [
  {
    id: "jensen-huang",
    name: "Jensen Huang",
    title: "NVIDIA CEO · $3T Market Cap",
    image: "",
    bio: "Started at Denny's in 1993. Nearly bankrupt in 1995. Now runs the most valuable chip company. Works 7 days/week. 60 direct reports. No 1-on-1s.",
    traits: ["First Principles", "Bet Everything", "Learn from Failure"],
    dna: { risk: 10, network: 8, grind: 10, education: 8, resilience: 10 },
    keyQuotes: [
      "Our company is 30 days away from going out of business. Always.",
      "I think about work every waking moment. I work seven days a week.",
      "If you want to do something great, you have to be willing to live in the unknown for a very long time."
    ],
    resources: [
      { type: "video", title: "Stanford Commencement 2024", url: "https://www.youtube.com/watch?v=Ci-kGYORzLg", relevantFor: ["resilience", "risk"] },
      { type: "essay", title: "How Jensen Huang Built Nvidia", url: "https://quartr.com/insights/edge/the-story-of-jensen-huang-and-nvidia", relevantFor: ["grind", "resilience"] }
    ]
  },
  {
    id: "satya-nadella",
    name: "Satya Nadella",
    title: "Microsoft CEO · Transformed MSFT",
    image: "",
    bio: "From Hyderabad to Microsoft in 1992. Rose through ranks for 22 years. CEO in 2014. Stock up 860% since. Made Microsoft cool again through empathy + cloud.",
    traits: ["Growth Mindset", "Empathy-Driven", "Culture Transformer"],
    dna: { risk: 7, network: 9, grind: 8, education: 9, resilience: 9 },
    keyQuotes: [
      "Our industry does not respect tradition — it only respects innovation.",
      "Empathy is at the core of everything we do.",
      "Don't be a know-it-all, be a learn-it-all."
    ],
    resources: [
      { type: "book", title: "Hit Refresh", url: "https://www.amazon.com/Hit-Refresh-Rediscover-Microsofts-Everyone/dp/0062652508", relevantFor: ["resilience", "network"] },
      { type: "video", title: "Leadership Philosophy", url: "https://www.youtube.com/watch?v=8L3cK7FYfnQ", relevantFor: ["network", "education"] }
    ]
  },
  {
    id: "sundar-pichai",
    name: "Sundar Pichai",
    title: "Google/Alphabet CEO",
    image: "",
    bio: "Madurai → IIT Kharagpur → Stanford → Wharton. Joined Google 2004. Built Chrome. Ran Android. CEO 2015. Runs Alphabet 2019. Calm under chaos.",
    traits: ["Strategic Patience", "Product Intuition", "Cross-Cultural Navigator"],
    dna: { risk: 6, network: 8, grind: 7, education: 10, resilience: 8 },
    keyQuotes: [
      "Wear your failure as a badge of honor.",
      "As a leader, it is important to not just see your own success but focus on the success of others.",
      "Keep pushing your limits."
    ],
    resources: [
      { type: "video", title: "Journey to Google CEO", url: "https://www.youtube.com/watch?v=Ci-kGYORzLg", relevantFor: ["education", "network"] },
      { type: "essay", title: "Career Path Analysis", url: "https://www.globalindian.com/profiles/sundar-pichai/", relevantFor: ["resilience"] }
    ]
  },
  {
    id: "patrick-collison",
    name: "Patrick Collison",
    title: "Stripe CEO · $95B Valuation",
    image: "",
    bio: "Irish kid learned programming at 8. Started Stripe at 19 with brother. Rejected by YC first time. Built payments infrastructure for the internet. Reads constantly.",
    traits: ["Intellectual Rigor", "Long-term Thinking", "Infrastructure Mindset"],
    dna: { risk: 8, network: 7, grind: 8, education: 10, resilience: 8 },
    keyQuotes: [
      "Increase the GDP of the internet.",
      "We're trying to make it trivially easy to start an internet business.",
      "Read a lot. Not just tech stuff. Everything."
    ],
    resources: [
      { type: "video", title: "Patrick Collison Interview", url: "https://www.youtube.com/watch?v=Gw_a0g6OMTk", relevantFor: ["education", "risk"] },
      { type: "essay", title: "Fast Grants", url: "https://fastgrants.org/", relevantFor: ["network", "risk"] }
    ]
  },
  {
    id: "brian-chesky",
    name: "Brian Chesky",
    title: "Airbnb CEO · Rebuilt Travel",
    image: "",
    bio: "Art school grad. Couldn't pay rent in SF. Sold cereal boxes to fund startup. Built Airbnb. Lost 80% revenue in COVID. Rebuilt from scratch. IPO'd 2020.",
    traits: ["Design-First", "Resilient AF", "Founder Mode"],
    dna: { risk: 9, network: 8, grind: 9, education: 6, resilience: 10 },
    keyQuotes: [
      "Build something 100 people love, not something 1 million people kind of like.",
      "The stuff that matters is the stuff that lasts.",
      "In a crisis, you find out who you are."
    ],
    resources: [
      { type: "video", title: "How Airbnb Survived COVID", url: "https://www.youtube.com/watch?v=4ef0juAMqoA", relevantFor: ["resilience", "risk"] },
      { type: "essay", title: "Founder Mode", url: "http://www.paulgraham.com/foundermode.html", relevantFor: ["network", "grind"] }
    ]
  },
  {
    id: "demis-hassabis",
    name: "Demis Hassabis",
    title: "DeepMind CEO · Nobel Prize 2024",
    image: "",
    bio: "Chess prodigy at 13. Game designer at 17. Neuroscience PhD. Founded DeepMind. Sold to Google $500M. AlphaGo. AlphaFold. Nobel Prize in Chemistry 2024.",
    traits: ["Multidisciplinary Genius", "Patient Capital", "Science-Driven"],
    dna: { risk: 8, network: 7, grind: 9, education: 10, resilience: 8 },
    keyQuotes: [
      "Solve intelligence, then use it to solve everything else.",
      "Science is the ultimate startup.",
      "Patience and persistence in the face of extremely hard problems."
    ],
    resources: [
      { type: "video", title: "AlphaFold Story", url: "https://www.youtube.com/watch?v=gg7WjuFs8F4", relevantFor: ["education", "resilience"] },
      { type: "essay", title: "DeepMind Mission", url: "https://deepmind.google/", relevantFor: ["risk", "education"] }
    ]
  },
  {
    id: "tobi-lutke",
    name: "Tobi Lütke",
    title: "Shopify CEO · $100B+ Company",
    image: "",
    bio: "German immigrant to Canada. Dropped out of school at 16. Learned programming to build online snowboard shop. Built Shopify as side tool. Now powers millions of stores.",
    traits: ["Optimize Everything", "Builder Mentality", "Anti-MBA"],
    dna: { risk: 8, network: 6, grind: 9, education: 7, resilience: 9 },
    keyQuotes: [
      "I'm a builder. That's what I do.",
      "Entrepreneurship is an act of profound optimism.",
      "Bureaucracy grows at the rate of business growth squared."
    ],
    resources: [
      { type: "video", title: "How Shopify Works", url: "https://www.youtube.com/watch?v=tCfRkQ2V6VU", relevantFor: ["grind", "education"] },
      { type: "essay", title: "Trust Battery", url: "https://review.firstround.com/track-your-teams-energy-and-motivation-with-shopifys-trust-battery", relevantFor: ["network"] }
    ]
  },
  {
    id: "whitney-wolfe-herd",
    name: "Whitney Wolfe Herd",
    title: "Bumble Founder · Youngest Female CEO IPO",
    image: "",
    bio: "Co-founded Tinder. Left after harassment. Built Bumble while being sued. Women-first dating app. IPO at 31. Youngest woman to take company public in US.",
    traits: ["Mission-Driven", "Fight Back", "Community Builder"],
    dna: { risk: 9, network: 9, grind: 8, education: 6, resilience: 10 },
    keyQuotes: [
      "In a world where you can be anything, be kind.",
      "Don't let anyone dim your light.",
      "The most radical thing you can do is be yourself."
    ],
    resources: [
      { type: "video", title: "Building Bumble", url: "https://www.youtube.com/watch?v=Ci-kGYORzLg", relevantFor: ["resilience", "risk"] },
      { type: "essay", title: "Forbes Profile", url: "https://www.forbes.com/profile/whitney-wolfe-herd/", relevantFor: ["network"] }
    ]
  },
];
