import { z } from "zod";
import { weekTopicSchema, type WeekTopic } from "./types";

const weeksSchema = z.array(weekTopicSchema).length(15);

const weekList: WeekTopic[] = [
  {
    id: 1,
    title: "Introduction to Distributed Ledger Technology and the Evolution of Money",
    shortTitle: "DLT and Money",
    highlight: "A distributed ledger lets many participants share one trusted record without a single central bookkeeper.",
    question: "Which idea best describes distributed ledger technology?",
    options: [
      { id: "a", label: "One shared record copied across many participants" },
      { id: "b", label: "A private spreadsheet owned by one bank" },
      { id: "c", label: "A password manager for online payments" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "The race starts with the shift from central records to shared ledgers."
  },
  {
    id: 2,
    title: "Cryptography Essentials for Financial Managers",
    shortTitle: "Cryptography",
    highlight: "Cryptography protects identity, transaction integrity, and proof that data has not been changed.",
    question: "What does a cryptographic hash help prove?",
    options: [
      { id: "a", label: "The data has stayed the same" },
      { id: "b", label: "The market price will rise" },
      { id: "c", label: "The bank branch is open" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "Week 2 adds the security layer behind blockchain trust."
  },
  {
    id: 3,
    title: "Consensus Mechanisms and Green Finance",
    shortTitle: "Consensus",
    highlight: "Consensus is how a network agrees on the next valid state of the ledger.",
    question: "What is the main job of a consensus mechanism?",
    options: [
      { id: "a", label: "Help the network agree on valid records" },
      { id: "b", label: "Design the user interface" },
      { id: "c", label: "Print physical money faster" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "This checkpoint asks how blockchains agree without one referee."
  },
  {
    id: 4,
    title: "Smart Contracts and Automation",
    shortTitle: "Smart Contracts",
    highlight: "Smart contracts run predefined rules automatically when conditions are met.",
    question: "What makes smart contracts useful in finance?",
    options: [
      { id: "a", label: "They can execute rules automatically" },
      { id: "b", label: "They replace all legal contracts" },
      { id: "c", label: "They make passwords unnecessary" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "Automation enters the race when rules can run on-chain."
  },
  {
    id: 5,
    title: "Stablecoins and the Future of Payments",
    shortTitle: "Stablecoins",
    highlight: "Stablecoins try to keep a steady value, often by tracking a fiat currency or reserve asset.",
    question: "Why are stablecoins discussed in payment systems?",
    options: [
      { id: "a", label: "They aim for stable value during transfer" },
      { id: "b", label: "They are always issued by central banks" },
      { id: "c", label: "They remove all transaction fees" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "Week 5 connects blockchain rails to everyday payment questions."
  },
  {
    id: 6,
    title: "Central Bank Digital Currencies",
    shortTitle: "CBDCs",
    highlight: "A CBDC is digital money issued by a central bank, not by a private company.",
    question: "Who issues a central bank digital currency?",
    options: [
      { id: "a", label: "A central bank" },
      { id: "b", label: "A game studio" },
      { id: "c", label: "Any anonymous wallet" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "CBDCs bring public money into the digital currency conversation."
  },
  {
    id: 7,
    title: "Decentralized Finance I, Lending and Borrowing",
    shortTitle: "DeFi Lending",
    highlight: "DeFi lending uses protocols to match capital and borrowers without a traditional branch workflow.",
    question: "What is the broad idea of DeFi lending?",
    options: [
      { id: "a", label: "Borrowing and lending through protocols" },
      { id: "b", label: "Loans only approved on paper" },
      { id: "c", label: "A credit card reward program" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "This lap shifts from infrastructure to financial products."
  },
  {
    id: 8,
    title: "Midterm Report",
    shortTitle: "Midterm",
    highlight: "The midterm checkpoint connects the first half of the course into one course map.",
    question: "What is the best role of the midterm checkpoint?",
    options: [
      { id: "a", label: "Connect the first seven weeks" },
      { id: "b", label: "Skip the blockchain basics" },
      { id: "c", label: "Replace every later topic" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "Halfway point: the class reviews the foundation before advanced applications."
  },
  {
    id: 9,
    title: "DeFi II, Decentralized Exchanges and AMMs",
    shortTitle: "DEXs and AMMs",
    highlight: "DEXs and AMMs let users trade through liquidity pools and protocol rules.",
    question: "What does an AMM help a decentralized exchange do?",
    options: [
      { id: "a", label: "Set trades through liquidity pool rules" },
      { id: "b", label: "Print new banknotes" },
      { id: "c", label: "Block all peer-to-peer trading" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "Week 9 turns DeFi into market structure."
  },
  {
    id: 10,
    title: "Tokenization of Real World Assets",
    shortTitle: "Tokenized Assets",
    highlight: "Tokenization represents rights or value from real-world assets in digital token form.",
    question: "What is tokenization of real-world assets?",
    options: [
      { id: "a", label: "Representing asset value or rights as tokens" },
      { id: "b", label: "Turning every asset into cash only" },
      { id: "c", label: "Deleting ownership records" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "Physical-world value meets digital ownership records."
  },
  {
    id: 11,
    title: "Enterprise Blockchain and Supply Chain Finance",
    shortTitle: "Enterprise Chains",
    highlight: "Enterprise blockchain can improve shared records across firms, suppliers, lenders, and auditors.",
    question: "Why might firms use blockchain in supply chain finance?",
    options: [
      { id: "a", label: "To share trusted records across participants" },
      { id: "b", label: "To hide all shipment information" },
      { id: "c", label: "To remove every supplier contract" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "The race moves into business networks and financing flows."
  },
  {
    id: 12,
    title: "Blockchain in Insurance",
    shortTitle: "InsurTech",
    highlight: "Blockchain can support insurance workflows such as claims, data sharing, and parametric triggers.",
    question: "Which insurance workflow can blockchain support?",
    options: [
      { id: "a", label: "Claims and shared data workflows" },
      { id: "b", label: "Guessing every customer's future" },
      { id: "c", label: "Removing risk from insurance" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "Insurance brings automation and shared trust into risk products."
  },
  {
    id: 13,
    title: "Digital Identity and Privacy, Zero-Knowledge Proofs",
    shortTitle: "Identity and ZK",
    highlight: "Zero-knowledge proofs can prove something is true without revealing all underlying information.",
    question: "What is the headline idea of a zero-knowledge proof?",
    options: [
      { id: "a", label: "Prove a claim without revealing everything" },
      { id: "b", label: "Publish every private detail" },
      { id: "c", label: "Make identity checks impossible" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "This checkpoint is about proving enough while protecting privacy."
  },
  {
    id: 14,
    title: "Financial Crime, Regulation and Compliance",
    shortTitle: "RegTech",
    highlight: "RegTech uses technology to support compliance, monitoring, reporting, and financial crime controls.",
    question: "What does RegTech focus on?",
    options: [
      { id: "a", label: "Compliance and monitoring workflows" },
      { id: "b", label: "Avoiding all regulation" },
      { id: "c", label: "Making ledgers unreadable" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "Regulation enters the course as blockchain meets real financial rules."
  },
  {
    id: 15,
    title: "Risk Management and Auditing in Blockchain",
    shortTitle: "Risk and Audit",
    highlight: "Blockchain systems still need risk controls, audits, monitoring, and governance.",
    question: "What is the big idea of the final week?",
    options: [
      { id: "a", label: "Blockchain needs risk controls and audits" },
      { id: "b", label: "Audits become unnecessary" },
      { id: "c", label: "All risks disappear on-chain" }
    ],
    correctAnswerId: "a",
    spectatorCallout: "The finish line is governance: fast systems still need checks."
  }
];

const parsedWeeks = weeksSchema.safeParse(weekList);

if (!parsedWeeks.success && process.env.NODE_ENV !== "production") {
  throw parsedWeeks.error;
}

export const courseDataIssue = parsedWeeks.success ? null : parsedWeeks.error;
export const weeks = parsedWeeks.success ? parsedWeeks.data : createFallbackWeeks();

export function getWeek(weekId: number) {
  return weeks.find((week) => week.id === weekId) ?? weeks[0];
}

function createFallbackWeeks(): WeekTopic[] {
  return Array.from({ length: 15 }, (_, index) => {
    const id = index + 1;
    return {
      id,
      title: `Financial Blockchain Week ${id}`,
      shortTitle: `Week ${id}`,
      highlight: "Course data is unavailable, but the race can continue with a safe placeholder topic.",
      question: `Which checkpoint is this placeholder for?`,
      options: [
        { id: "a", label: `Week ${id}` },
        { id: "b", label: "A random bonus round" },
        { id: "c", label: "The finish podium" }
      ],
      correctAnswerId: "a",
      spectatorCallout: "Placeholder course data is active until the configured week list is fixed."
    };
  });
}
