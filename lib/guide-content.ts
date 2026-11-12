/**
 * "How to Get Your Real Estate License in New Jersey" guide.
 * Facts come from bestschoolofrealestate.biz (Requirements, FAQ, Salesperson, Broker pages)
 * and the NJ Real Estate Commission. Review before changing numbers.
 */

export const GUIDE_PATH = "/how-to-get-a-real-estate-license-in-nj"
export const GUIDE_TITLE = "How to Get Your Real Estate License in New Jersey"
export const GUIDE_DESCRIPTION =
  "Step-by-step guide to getting a New Jersey real estate salesperson license: requirements, the " +
  "75-hour course, the state exam, fingerprinting, sponsoring brokers, timelines, and costs."
/** Shown on the page and in structured data; update when the content changes. */
export const GUIDE_UPDATED = "2026-11-12"

export const NJREC_URL = "https://www.nj.gov/dobi/division_rec/"
export const NJREC_CE_URL = "https://www.nj.gov/dobi/division_rec/licensing/online_Instructions/ce.html"

export const GUIDE_INTRO =
  "Becoming a licensed real estate salesperson in New Jersey comes down to five steps: meet the " +
  "basic requirements, complete a 75-hour pre-licensing course, pass the state exam, get " +
  "fingerprinted, and activate your license through a sponsoring broker. This guide walks through " +
  "each step, how long it takes, what it costs, and how to pick the path that fits your life."

export const QUICK_FACTS: { label: string; value: string }[] = [
  { label: "Minimum age", value: "18" },
  { label: "Education", value: "High school diploma or equivalent" },
  { label: "Pre-licensing course", value: "75 hours at a licensed school" },
  { label: "Course format", value: "Self-paced online, study 24/7" },
  { label: "State exam", value: "PSI real estate salesperson exam" },
  { label: "Deadline", value: "1 year from finishing the course" },
  { label: "Reciprocity", value: "None. NJ requires its own course and exam" },
]

export type GuideSection = {
  id: string
  heading: string
  paragraphs?: string[]
  bullets?: string[]
  after?: string[]
}

export const GUIDE_STEPS: GuideSection[] = [
  {
    id: "requirements",
    heading: "Step 1: Make sure you meet the basic requirements",
    paragraphs: [
      "To qualify for a New Jersey real estate salesperson license you must:",
    ],
    bullets: [
      "Be 18 years of age or older",
      "Have a high school diploma or the equivalent",
      "Satisfy the New Jersey Real Estate Commission as to your honesty, trustworthiness, character, and integrity",
    ],
    after: [
      "If you have ever been convicted of a crime, or are currently on parole or probation, contact the " +
        "Real Estate Commission before you enroll so you know where you stand. Veterans may be able to " +
        "get waivers of some education and experience requirements.",
    ],
  },
  {
    id: "course",
    heading: "Step 2: Complete the 75-hour pre-licensing course",
    paragraphs: [
      "Every new salesperson in New Jersey must complete a 75-hour pre-licensing course at a school " +
        "licensed by the Real Estate Commission and pass the school's final exam. When you finish, you " +
        "receive the certificate you need to sit for the state exam.",
      "Best School of Real Estate's course is 100% online and self-paced, so you can study anytime, " +
        "24/7, around your job and family. It includes:",
    ],
    bullets: [
      "All required New Jersey pre-licensing instruction",
      "Course assessments and class tests to track your progress",
      "A final course exam",
      "A certificate of completion to apply for the state exam",
    ],
  },
  {
    id: "exam",
    heading: "Step 3: Pass the New Jersey salesperson exam",
    paragraphs: [
      "After you pass the school final, the school signs you out of the course and into the PSI exam " +
        "portal so you can schedule the state licensing exam. The exam covers both national real estate " +
        "principles and New Jersey law and practice.",
      "Most students prepare with practice tests and a review of the course notes and glossary. Focus " +
        "on the topics you found hardest in class; the school's tests show you where you need work.",
    ],
  },
  {
    id: "fingerprinting",
    heading: "Step 4: Get fingerprinted for the background check",
    paragraphs: [
      "Once you pass the state exam, follow the PSI and Real Estate Commission instructions to complete " +
        "your fingerprinting and criminal history background check.",
    ],
  },
  {
    id: "broker",
    heading: "Step 5: Choose a sponsoring broker and activate your license",
    paragraphs: [
      "In New Jersey you apply for your license through a sponsoring real estate broker. You don't need " +
        "a broker before you start the course, but you will need one to activate your license.",
      "When you compare brokerages, ask about training and mentorship for new agents, how leads are " +
        "handled, commission splits and fees, and whether you can start part-time.",
    ],
  },
]

export const GUIDE_EXTRA: GuideSection[] = [
  {
    id: "deadline",
    heading: "Don't miss the one-year deadline",
    paragraphs: [
      "You have one year from the day you complete the pre-licensing course to pass the state exam, " +
        "get fingerprinted, and activate your license. If you miss that window, you must retake the " +
        "full 75-hour course. Plan your exam date as soon as you finish class.",
    ],
  },
  {
    id: "how-long",
    heading: "How long does it take?",
    paragraphs: [
      "The course itself is 75 hours. Depending on the format and your schedule, most students finish in " +
        "a few weeks to a couple of months. With focused study, many people go from day one of class to " +
        "an active license in about one to three months.",
    ],
  },
  {
    id: "cost",
    heading: "How much does it cost?",
    paragraphs: [
      "Plan for four main costs: course tuition, the PSI exam fee, the fingerprinting fee, and the " +
        "license fee. Fees change, so check current amounts with PSI and the Real Estate Commission. " +
        "For tuition, see our online course page.",
    ],
  },
  {
    id: "paths",
    heading: "Full-time, part-time, or referral agent?",
    paragraphs: [
      "The licensing steps are the same no matter how you plan to work. Some new agents go all-in " +
        "full-time, many start part-time while keeping their current job, and others focus on referrals " +
        "to friends and family. Not sure which fits you? Our free 2-minute career quiz gives you a " +
        "personalized roadmap.",
    ],
  },
  {
    id: "after",
    heading: "After you're licensed",
    paragraphs: [
      "New Jersey licensees must complete continuing education to renew their license each license " +
        "term; the Real Estate Commission publishes the current hour and topic requirements. Later, " +
        "if you want to lead a team or open your own office, you can work toward a broker license, " +
        "which requires three years as a full-time licensed salesperson and 150 hours of broker courses.",
    ],
  },
]

export const GUIDE_FAQ: { question: string; answer: string }[] = [
  {
    question: "Can I take the New Jersey real estate course online?",
    answer:
      "Yes. Our 75-hour course is 100% online and self-paced, so you can study anytime. The state " +
      "exam itself is scheduled through PSI.",
  },
  {
    question: "Does New Jersey have real estate license reciprocity with other states?",
    answer:
      "No. New Jersey does not currently have reciprocity with any state, so you need to complete the " +
      "New Jersey course and exam even if you're licensed elsewhere.",
  },
  {
    question: "What happens if I don't pass the exam within a year?",
    answer:
      "You have one year after finishing the course to pass the state exam, get fingerprinted, and " +
      "activate your license. If you miss that window, you must retake the full course.",
  },
  {
    question: "Do I need a sponsoring broker before I start?",
    answer:
      "No. You can complete the course and pass the exam first. You need a sponsoring broker when you " +
      "apply to activate your license.",
  },
  {
    question: "Can I get my license while working full time?",
    answer:
      "Yes. The self-paced online course lets you study evenings, weekends, or whenever it suits " +
      "you, so it works around a job and family.",
  },
]
