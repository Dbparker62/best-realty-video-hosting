/**
 * Text for the Team-or-Broker quiz page (/questionnaire/leadership).
 * Broker requirements come from bestschoolofrealestate.biz (Requirements and Broker pages).
 */

export const LEADERSHIP_INTRO = [
  "Already licensed and thinking about your next move? Two of the most common paths for growing " +
    "agents are building a team inside an existing brokerage or becoming a broker of record and " +
    "running your own office.",
  "Both can grow your income and your influence, but they ask very different things of you: in " +
    "licensing, responsibility, risk, and how you spend your day. Our quiz helps you see which one " +
    "fits where you are now.",
]

export const LEADERSHIP_LEARN = [
  "Whether building a team or becoming a broker of record fits your goals",
  "How your experience, appetite for risk, and leadership style line up with each path",
  "What New Jersey requires before you can become a broker",
  "Your personalized next steps, emailed to you right away",
]

export const LEADERSHIP_COMPARISON: { label: string; team: string; broker: string }[] = [
  {
    label: "License",
    team: "Salesperson license; you work under a sponsoring broker",
    broker: "NJ broker license (experience + 150 hours of courses + broker exam)",
  },
  {
    label: "Your role",
    team: "Recruit, coach, and lead a group of agents",
    broker: "Run the brokerage and supervise its licensees",
  },
  {
    label: "Infrastructure",
    team: "The brokerage provides office, compliance, and systems",
    broker: "You build and pay for the office, systems, and support",
  },
  {
    label: "Risk & overhead",
    team: "Lower: shared with the brokerage",
    broker: "Higher: the business is yours",
  },
  {
    label: "Best for",
    team: "Top producers ready to multiply their business through others",
    broker: "Experienced agents ready to own a company and its brand",
  },
]

export const BROKER_REQUIREMENTS = [
  "Be continually licensed and employed full-time as a New Jersey real estate salesperson for the " +
    "three years immediately before applying (with no more than 25 hours per week in a non-real " +
    "estate job)",
  "Have a high school diploma or the equivalent",
  "Complete 150 hours of broker pre-licensing education: the 90-hour General Broker course, the " +
    "30-hour Ethics and Agency course, and the 30-hour Office Management course",
  "Submit your school certificate and Experience Report to the Real Estate Commission to receive " +
    "your Certificate of Examination Eligibility",
  "Pass the broker license exam and apply for your license within one year of finishing the courses",
]

export const LEADERSHIP_FAQ: { question: string; answer: string }[] = [
  {
    question: "Do I need a broker license to lead a real estate team?",
    answer:
      "Not necessarily. Teams operate under a sponsoring broker, so many team leaders hold a " +
      "salesperson license. Talk with your broker about how teams are set up and supervised at your " +
      "brokerage.",
  },
  {
    question: "How do I become a real estate broker in New Jersey?",
    answer:
      "You need three years as a full-time licensed New Jersey salesperson immediately before applying, " +
      "150 hours of broker pre-licensing education, and a passing score on the broker exam, and you " +
      "must apply for your license within one year of finishing the courses.",
  },
  {
    question: "Can I take the broker courses online?",
    answer:
      "Yes. The 150-hour broker package is available 100% online and self-paced. Call (732) 266-3366 " +
      "with any questions.",
  },
  {
    question: "Is the Team or Broker quiz free?",
    answer:
      "Yes. It takes about two minutes, your results and roadmap are emailed to you right away, and " +
      "there's no obligation.",
  },
]
