import { Mentor } from "@/types";

export const mentors: Mentor[] = [
  {
    id: "elon-musk",
    name: "Elon Musk",
    level: 5,
    title: "SYSTEM BUILDER",
    image: "",
    bio: "Overclocked operator shipping rockets, cars, and code on brutal timelines.",
    traits: ["First principles", "Ship or die", "Public pressure"],
    dna: { risk: 10, network: 8, grind: 10, education: 7, resilience: 10 },
    keyQuotes: [
      "If something is important enough, even if the odds are against you, you should still do it.",
      "Work like hell. Put in 80-100 hour weeks every week.",
      "Failure is an option here. If things are not failing, you are not innovating enough."
    ],
    resources: [
      { type: "book", title: "Elon Musk Biography by Walter Isaacson", url: "https://www.amazon.com/Elon-Musk-Walter-Isaacson/dp/1982181281", relevantFor: ["risk", "grind", "resilience"] },
      { type: "video", title: "First Principles Thinking", url: "https://www.youtube.com/watch?v=NV3sBlRgzTI", relevantFor: ["education"] },
      { type: "essay", title: "Master Plan", url: "https://www.tesla.com/blog/secret-tesla-motors-master-plan-just-between-you-and-me", relevantFor: ["risk"] }
    ]
  },
  {
    id: "paul-graham",
    name: "Paul Graham",
    level: 4,
    title: "PROTOCOL WRITER",
    image: "",
    bio: "Hacker-essayist wiring founders to think in clear loops and ship fast.",
    traits: ["Essays as code", "Founder radar", "Brutal clarity"],
    dna: { risk: 7, network: 8, grind: 7, education: 9, resilience: 8 },
    keyQuotes: [
      "Make something people want.",
      "Startups are very counterintuitive. I'm not sure why. Perhaps it's simply that knowledge about them hasn't permeated our culture yet.",
      "The way to get startup ideas is not to try to think of startup ideas. It's to look for problems."
    ],
    resources: [
      { type: "essay", title: "How to Start a Startup", url: "http://www.paulgraham.com/start.html", relevantFor: ["risk", "education"] },
      { type: "essay", title: "Do Things That Don't Scale", url: "http://www.paulgraham.com/ds.html", relevantFor: ["grind"] },
      { type: "essay", title: "Founder Mode", url: "http://www.paulgraham.com/foundermode.html", relevantFor: ["network", "resilience"] }
    ]
  },
  {
    id: "linus-torvalds",
    name: "Linus Torvalds",
    level: 4,
    title: "KERNEL ARCHITECT",
    image: "",
    bio: "Shipped Linux as a hobby patch; now runs the kernel playbook for the planet.",
    traits: ["Open source gravity", "Code as law", "Direct feedback"],
    dna: { risk: 6, network: 7, grind: 8, education: 8, resilience: 9 },
    keyQuotes: [
      "Talk is cheap. Show me the code.",
      "I'm a huge proponent of designing your code around the data, rather than the other way around.",
      "Bad programmers worry about the code. Good programmers worry about data structures."
    ],
    resources: [
      { type: "book", title: "Just for Fun: The Story of an Accidental Revolutionary", url: "https://www.amazon.com/Just-Fun-Story-Accidental-Revolutionary/dp/0066620732", relevantFor: ["grind", "resilience"] },
      { type: "video", title: "Linus Torvalds on Git", url: "https://www.youtube.com/watch?v=4XpnKHJAok8", relevantFor: ["education"] }
    ]
  },
  {
    id: "grace-hopper",
    name: "Grace Hopper",
    level: 5,
    title: "COMPILER GENERAL",
    image: "",
    bio: "Pioneer who treated computers like ships and invented the COBOL highway.",
    traits: ["Debugging legend", "Plain English code", "Naval grit"],
    dna: { risk: 8, network: 7, grind: 9, education: 10, resilience: 10 },
    keyQuotes: [
      "The most dangerous phrase in the language is: 'We've always done it this way.'",
      "A ship in port is safe, but that's not what ships are built for.",
      "If it's a good idea, go ahead and do it. It's much easier to apologize than it is to get permission."
    ],
    resources: [
      { type: "video", title: "Grace Hopper on Letterman", url: "https://www.youtube.com/watch?v=1-vcErOPofQ", relevantFor: ["education", "resilience"] },
      { type: "book", title: "Grace Hopper: Admiral of the Cyber Sea", url: "https://www.amazon.com/Grace-Hopper-Admiral-Cyber-Sea/dp/1557093520", relevantFor: ["risk", "grind"] }
    ]
  },
  {
    id: "ada-lovelace",
    name: "Ada Lovelace",
    level: 4,
    title: "ALGORITHM ORACLE",
    image: "",
    bio: "Mapped poetry to numbers; imagined computing long before silicon.",
    traits: ["Vision loop", "Math as art", "Spec before build"],
    dna: { risk: 7, network: 6, grind: 7, education: 10, resilience: 8 },
    keyQuotes: [
      "The Analytical Engine weaves algebraic patterns, just as the Jacquard loom weaves flowers and leaves.",
      "Imagination is the Discovering Faculty, pre-eminently. It is that which penetrates into the unseen worlds around us.",
      "That brain of mine is something more than merely mortal; as time will show."
    ],
    resources: [
      { type: "book", title: "The Thrilling Adventures of Lovelace and Babbage", url: "https://www.amazon.com/Thrilling-Adventures-Lovelace-Babbage-Computer/dp/0307908275", relevantFor: ["education"] },
      { type: "essay", title: "Ada's Algorithm", url: "https://twobithistory.org/2018/08/18/ada-lovelace-note-g.html", relevantFor: ["education", "risk"] }
    ]
  },
  {
    id: "steve-wozniak",
    name: "Steve Wozniak",
    level: 4,
    title: "HARDWARE HACKER",
    image: "",
    bio: "Garage engineer who turned schematics into machines people could touch.",
    traits: ["Builder first", "Low-level wizard", "Playful electronics"],
    dna: { risk: 7, network: 6, grind: 8, education: 8, resilience: 8 },
    keyQuotes: [
      "Never trust a computer you can't throw out a window.",
      "My goal wasn't to make a ton of money. It was to build good computers.",
      "Don't worry about the market. Build something you love and the market will find you."
    ],
    resources: [
      { type: "book", title: "iWoz: Computer Geek to Cult Icon", url: "https://www.amazon.com/iWoz-Computer-Invented-Personal-Co-Founded/dp/0393330435", relevantFor: ["grind", "education"] },
      { type: "video", title: "Wozniak on Building Apple I", url: "https://www.youtube.com/watch?v=3cxMr3XAJK0", relevantFor: ["risk"] }
    ]
  },
];
