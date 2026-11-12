/**
 * Facts about the school and its director, used across the site.
 * Sources: bestschoolofrealestate.biz (About, Salesperson, FAQ) and
 * Bruce Parker's own bio (yournewjerseyhomesold.com). Update here only.
 */

export const DIRECTOR = {
  name: "Bruce Parker",
  title: "Director & Licensed NJ Real Estate Instructor",
  brokerage: "Best Realty",
  brokerageCity: "Highland Park",
}

/** Short proof points (homepage stats, quiz page, share images). */
export const PROOF_POINTS = [
  { value: "30+", label: "Years in real estate" },
  { value: "2,700+", label: "Transactions by our director" },
  { value: "Since 1999", label: "Circle of Excellence every year" },
  { value: "NJREC", label: "Licensed school" },
] as const

export const DIRECTOR_BIO = [
  "Best School of Real Estate is directed by Bruce Parker, a licensed New Jersey real estate " +
    "instructor and the broker/owner of Best Realty in Highland Park. Over a career spanning more " +
    "than three decades, Bruce has been part of more than 2,700 real estate transactions and has " +
    "received the NJ REALTORS® Circle of Excellence Sales Award® every year since 1999, including " +
    "the Platinum level in 2025.",
  "Our goal is to help students learn more than the material on the licensing exam. We want you " +
    "to understand the business you're preparing to enter, taught by people who work in it every day.",
]

export const SCHOOL_SUMMARY =
  "Best School of Real Estate is licensed by the New Jersey Real Estate Commission and offers " +
  "approved salesperson pre-licensing, broker, and continuing education courses: live on Zoom, " +
  "self-paced online, and in person."

/** NJ salesperson licensing steps (from the school's FAQ). */
export const LICENSE_STEPS = [
  {
    title: "Meet the basic requirements",
    body: "Be at least 18 years old and hold a high school diploma or the equivalent.",
  },
  {
    title: "Complete the 75-hour pre-licensing course",
    body:
      "Take an approved course, attend at least 80% of the class hours, and pass the school's " +
      "final exam to earn your certificate.",
  },
  {
    title: "Pass the New Jersey state exam",
    body: "Schedule and pass the PSI real estate salesperson licensing exam.",
  },
  {
    title: "Get fingerprinted and activate your license",
    body:
      "Complete the background check and activate your license with a sponsoring broker. You have " +
      "one year from finishing the course to pass the state exam and activate your license.",
  },
]
