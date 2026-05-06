import type { Course, Lesson, PurchasedCourse } from "./types"

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Real Estate Fundamentals",
    description:
      "Master the basics of real estate investing, from property valuation to market analysis. Learn how to identify profitable opportunities and build your portfolio.",
    price: 199,
    published: true,
    instructor: "Sarah Mitchell",
    duration: "8 hours",
    lessonCount: 12,
  },
  {
    id: "2",
    title: "Commercial Property Investment",
    description:
      "Deep dive into commercial real estate. Understand lease structures, cap rates, and how to evaluate office, retail, and industrial properties.",
    price: 349,
    published: true,
    instructor: "James Rodriguez",
    duration: "12 hours",
    lessonCount: 18,
  },
  {
    id: "3",
    title: "Property Negotiation Mastery",
    description:
      "Learn advanced negotiation techniques specifically designed for real estate transactions. Close more deals at better prices.",
    price: 149,
    published: true,
    instructor: "Emily Chen",
    duration: "5 hours",
    lessonCount: 8,
  },
  {
    id: "4",
    title: "Real Estate Marketing Strategies",
    description:
      "Modern marketing techniques for real estate professionals. Master digital advertising, social media, and lead generation.",
    price: 249,
    published: true,
    instructor: "Michael Torres",
    duration: "10 hours",
    lessonCount: 15,
  },
  {
    id: "5",
    title: "Rental Property Management",
    description:
      "Everything you need to know about managing rental properties. From tenant screening to maintenance scheduling and legal compliance.",
    price: 179,
    published: false,
    instructor: "Lisa Anderson",
    duration: "7 hours",
    lessonCount: 10,
  },
  {
    id: "6",
    title: "Real Estate Tax Strategies",
    description:
      "Maximize your returns with smart tax planning. Learn about 1031 exchanges, depreciation, and other tax benefits for real estate investors.",
    price: 299,
    published: true,
    instructor: "David Kim",
    duration: "6 hours",
    lessonCount: 9,
  },
]

export const mockLessons: Record<string, Lesson[]> = {
  "1": [
    {
      id: "1-1",
      courseId: "1",
      title: "Introduction to Real Estate",
      description:
        "An overview of the real estate industry and what you will learn in this course.",
      order: 1,
      duration: "15:30",
      isPreview: true,
      isLocked: false,
    },
    {
      id: "1-2",
      courseId: "1",
      title: "Understanding Property Types",
      description:
        "Learn about residential, commercial, industrial, and land properties.",
      order: 2,
      duration: "28:45",
      isPreview: false,
      isLocked: false,
    },
    {
      id: "1-3",
      courseId: "1",
      title: "Market Analysis Basics",
      description:
        "How to analyze local markets and identify trends.",
      order: 3,
      duration: "35:20",
      isPreview: false,
      isLocked: true,
    },
    {
      id: "1-4",
      courseId: "1",
      title: "Property Valuation Methods",
      description:
        "Comparative market analysis, income approach, and cost approach.",
      order: 4,
      duration: "42:15",
      isPreview: false,
      isLocked: true,
    },
    {
      id: "1-5",
      courseId: "1",
      title: "Financing Your First Property",
      description:
        "Understanding mortgages, down payments, and creative financing.",
      order: 5,
      duration: "38:00",
      isPreview: false,
      isLocked: true,
    },
    {
      id: "1-6",
      courseId: "1",
      title: "Due Diligence Process",
      description:
        "What to check before closing on a property.",
      order: 6,
      duration: "45:30",
      isPreview: false,
      isLocked: true,
    },
  ],
  "2": [
    {
      id: "2-1",
      courseId: "2",
      title: "Commercial Real Estate Overview",
      description: "Understanding the commercial property landscape.",
      order: 1,
      duration: "20:00",
      isPreview: true,
      isLocked: false,
    },
    {
      id: "2-2",
      courseId: "2",
      title: "Lease Structures Explained",
      description: "NNN, gross, modified gross, and percentage leases.",
      order: 2,
      duration: "35:00",
      isPreview: false,
      isLocked: true,
    },
    {
      id: "2-3",
      courseId: "2",
      title: "Cap Rate Calculations",
      description: "How to calculate and interpret capitalization rates.",
      order: 3,
      duration: "40:00",
      isPreview: false,
      isLocked: true,
    },
  ],
  "3": [
    {
      id: "3-1",
      courseId: "3",
      title: "Negotiation Psychology",
      description: "Understanding buyer and seller motivations.",
      order: 1,
      duration: "25:00",
      isPreview: true,
      isLocked: false,
    },
    {
      id: "3-2",
      courseId: "3",
      title: "Opening Offers Strategy",
      description: "How to make and respond to initial offers.",
      order: 2,
      duration: "30:00",
      isPreview: false,
      isLocked: true,
    },
  ],
}

export const mockPurchasedCourses: PurchasedCourse[] = [
  {
    id: "1",
    title: "Real Estate Fundamentals",
    description:
      "Master the basics of real estate investing, from property valuation to market analysis.",
    price: 199,
    published: true,
    instructor: "Sarah Mitchell",
    duration: "8 hours",
    lessonCount: 12,
    progress: 33,
    completedLessons: 2,
    totalLessons: 6,
    lastWatchedLessonId: "1-2",
  },
  {
    id: "3",
    title: "Property Negotiation Mastery",
    description:
      "Learn advanced negotiation techniques specifically designed for real estate transactions.",
    price: 149,
    published: true,
    instructor: "Emily Chen",
    duration: "5 hours",
    lessonCount: 8,
    progress: 100,
    completedLessons: 2,
    totalLessons: 2,
    lastWatchedLessonId: "3-2",
  },
]
