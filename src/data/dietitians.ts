export interface Dietitian {
  id: number
  name: string
  title: string
  rating: number
  reviews: number
  experience: string
  location: string
  specializations: string[]
  languages: string[]
  nextAvailable: string
  availability: string
  availabilityClass: string
  gender: string
  image: string | null
  initials: string
  about: string
  education: string[]
  slots: string[]
  consultations: number
  fee: number
  reviewsList: { name: string; rating: number; comment: string; date: string }[]
}

export const DIETITIANS: Dietitian[] = [
  {
    id: 1,
    name: 'Dt. Neha Sharma',
    title: 'Clinical Dietitian, M.Sc (Food & Nutrition)',
    rating: 4.9,
    reviews: 125,
    experience: '6+ Years Experience',
    location: 'Mumbai, Maharashtra',
    specializations: ['Weight Loss', 'PCOS / PCOD', 'Diabetes'],
    languages: ['English', 'Hindi', 'Marathi'],
    nextAvailable: 'Today, 6:00 PM',
    availability: 'Available Now',
    availabilityClass: 'cd-avail--now',
    gender: 'female',
    image: null,
    initials: 'NS',
    consultations: 540,
    fee: 2499,
    about:
      'Dt. Neha Sharma is a certified Clinical Dietitian with over 6 years of experience helping clients achieve their health goals through evidence-based nutrition. She specialises in managing lifestyle disorders like PCOS, diabetes, and obesity with a holistic, compassionate approach. Her meal plans are practical, culturally appropriate, and tailored to each individual\'s lifestyle.',
    education: [
      'M.Sc in Food & Nutrition – Mumbai University',
      'B.Sc in Dietetics – SNDT Women\'s University',
      'Certified Diabetes Educator (CDE)',
    ],
    slots: ['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'],
    reviewsList: [
      { name: 'Priya M.', rating: 5, comment: 'Neha di is absolutely amazing! Lost 8 kg in 3 months with her plan.', date: 'May 2025' },
      { name: 'Ravi K.', rating: 5, comment: 'Very detailed consultation. My diabetes numbers improved significantly.', date: 'Apr 2025' },
      { name: 'Sunita R.', rating: 4, comment: 'Great guidance on PCOS diet. Felt comfortable sharing my concerns.', date: 'Mar 2025' },
    ],
  },
  {
    id: 2,
    name: 'Dt. Rahul Verma',
    title: 'Sports Nutritionist, M.Sc (Nutrition)',
    rating: 4.8,
    reviews: 98,
    experience: '5+ Years Experience',
    location: 'Bengaluru, Karnataka',
    specializations: ['Weight Gain', 'Sports Nutrition', 'Muscle Gain'],
    languages: ['English', 'Hindi', 'Kannada'],
    nextAvailable: 'Today, 7:30 PM',
    availability: 'Available Today',
    availabilityClass: 'cd-avail--today',
    gender: 'male',
    image: null,
    initials: 'RV',
    consultations: 390,
    fee: 2499,
    about:
      'Dt. Rahul Verma is a Sports Nutritionist with expertise in performance nutrition, muscle building, and athletic recovery. He has worked with competitive athletes, gym enthusiasts, and recreational fitness lovers. His science-backed approach focuses on optimising body composition while maintaining energy and performance.',
    education: [
      'M.Sc in Nutrition & Dietetics – Bangalore University',
      'Certified Sports Nutritionist – ISSN',
      'B.Sc in Life Sciences – Delhi University',
    ],
    slots: ['7:30 PM', '8:00 PM', '8:30 PM'],
    reviewsList: [
      { name: 'Amit S.', rating: 5, comment: 'Gained 5 kg of lean muscle in 4 months. The meal plan was spot on!', date: 'May 2025' },
      { name: 'Deepak N.', rating: 5, comment: 'Very knowledgeable about sports nutrition. Highly recommend!', date: 'Apr 2025' },
      { name: 'Kiran P.', rating: 4, comment: 'Good consultation. Clear and practical diet plan for gym goers.', date: 'Feb 2025' },
    ],
  },
  {
    id: 3,
    name: 'Dt. Anjali Mehta',
    title: 'Dietitian, M.Sc (Food & Nutrition)',
    rating: 4.9,
    reviews: 110,
    experience: '4+ Years Experience',
    location: 'Delhi, India',
    specializations: ['Thyroid', 'Weight Loss', 'Gut Health'],
    languages: ['English', 'Hindi', 'Punjabi'],
    nextAvailable: 'Tomorrow, 10:00 AM',
    availability: 'Available Tomorrow',
    availabilityClass: 'cd-avail--tomorrow',
    gender: 'female',
    image: null,
    initials: 'AM',
    consultations: 420,
    fee: 2499,
    about:
      'Dt. Anjali Mehta specialises in thyroid management and gut health nutrition. With a deep understanding of the gut-brain axis and hormonal health, she creates targeted meal plans that address the root cause rather than just symptoms. She is known for her warm, empathetic consulting style and practical Indian diet plans.',
    education: [
      'M.Sc in Food & Nutrition – Delhi University',
      'B.Sc in Home Science – Lady Irwin College',
      'Gut Health & Microbiome Nutrition – Certification',
    ],
    slots: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
    reviewsList: [
      { name: 'Meera T.', rating: 5, comment: 'My thyroid levels are finally under control thanks to Anjali ma\'am!', date: 'May 2025' },
      { name: 'Rohit B.', rating: 5, comment: 'Gut health improved a lot. Bloating is gone completely.', date: 'Apr 2025' },
      { name: 'Kavya S.', rating: 4, comment: 'Very thorough assessment. The plan was easy to follow.', date: 'Mar 2025' },
    ],
  },
  {
    id: 4,
    name: 'Dt. Priya Kapoor',
    title: 'Pediatric Dietitian, M.Sc (Nutrition)',
    rating: 4.7,
    reviews: 84,
    experience: '7+ Years Experience',
    location: 'Chennai, Tamil Nadu',
    specializations: ['Child Nutrition', 'Weight Loss', 'Diabetes'],
    languages: ['English', 'Hindi', 'Tamil'],
    nextAvailable: 'Today, 5:00 PM',
    availability: 'Available Now',
    availabilityClass: 'cd-avail--now',
    gender: 'female',
    image: null,
    initials: 'PK',
    consultations: 610,
    fee: 2499,
    about:
      'Dt. Priya Kapoor is one of Chennai\'s leading Pediatric Dietitians with 7+ years of experience in child and adolescent nutrition. She helps parents navigate fussy eating, growth concerns, and childhood obesity with fun, age-appropriate meal strategies. She also consults adults for diabetes and weight management.',
    education: [
      'M.Sc in Nutrition & Dietetics – University of Madras',
      'Pediatric Nutrition Specialist – IDA Certified',
      'B.Sc in Biochemistry – Stella Maris College',
    ],
    slots: ['5:00 PM', '5:30 PM', '6:00 PM'],
    reviewsList: [
      { name: 'Lakshmi V.', rating: 5, comment: 'My son started eating vegetables! Priya ma\'am is a miracle worker.', date: 'May 2025' },
      { name: 'Suresh K.', rating: 5, comment: 'Excellent guidance for managing my diabetes with Indian foods.', date: 'Apr 2025' },
      { name: 'Nirmala R.', rating: 4, comment: 'Very patient with kids. Gave practical tips that actually work.', date: 'Mar 2025' },
    ],
  },
  {
    id: 5,
    name: 'Dt. Arjun Singh',
    title: 'Sports & Clinical Dietitian, M.Sc',
    rating: 4.6,
    reviews: 67,
    experience: '3+ Years Experience',
    location: 'Pune, Maharashtra',
    specializations: ['Sports Nutrition', 'Muscle Gain', 'Weight Gain'],
    languages: ['English', 'Hindi', 'Marathi'],
    nextAvailable: 'Tomorrow, 9:00 AM',
    availability: 'Available Tomorrow',
    availabilityClass: 'cd-avail--tomorrow',
    gender: 'male',
    image: null,
    initials: 'AS',
    consultations: 210,
    fee: 2499,
    about:
      'Dt. Arjun Singh combines sports science with clinical nutrition to help athletes and fitness enthusiasts reach peak performance. Based in Pune\'s fitness hub, he works with marathon runners, bodybuilders, and recreational gym-goers. His plans focus on macronutrient timing, recovery nutrition, and sustainable lean mass gain.',
    education: [
      'M.Sc in Food & Nutrition – Pune University',
      'Sports Nutrition Certification – ACSM',
      'B.Sc in Physical Education – Shivaji University',
    ],
    slots: ['9:00 AM', '9:30 AM', '10:00 AM'],
    reviewsList: [
      { name: 'Varun M.', rating: 5, comment: 'Arjun\'s plan helped me finish my first marathon strong!', date: 'May 2025' },
      { name: 'Siddharth P.', rating: 4, comment: 'Good macros breakdown. Easy to track and follow.', date: 'Mar 2025' },
      { name: 'Nikhil D.', rating: 5, comment: 'Gained quality muscle. Very responsive on chat too.', date: 'Feb 2025' },
    ],
  },
  {
    id: 6,
    name: 'Dt. Sneha Joshi',
    title: 'Clinical Dietitian, M.Sc (Food Science)',
    rating: 4.8,
    reviews: 93,
    experience: '5+ Years Experience',
    location: 'Hyderabad, Telangana',
    specializations: ['PCOS / PCOD', 'Thyroid', 'Gut Health'],
    languages: ['English', 'Hindi', 'Telugu'],
    nextAvailable: 'Today, 8:00 PM',
    availability: 'Available Today',
    availabilityClass: 'cd-avail--today',
    gender: 'female',
    image: null,
    initials: 'SJ',
    consultations: 370,
    fee: 2499,
    about:
      'Dt. Sneha Joshi is a Clinical Dietitian specialising in hormonal health, gut disorders, and thyroid conditions. With 5 years of experience, she brings a functional nutrition approach to her practice — addressing nutritional deficiencies, inflammation, and lifestyle factors together. She is fluent in Telugu and creates region-specific Andhra and Telangana diet plans.',
    education: [
      'M.Sc in Food Science & Nutrition – Osmania University',
      'Functional Nutrition Practitioner – IFM',
      'B.Sc in Biochemistry – Nizam College',
    ],
    slots: ['8:00 PM', '8:30 PM', '9:00 PM'],
    reviewsList: [
      { name: 'Padma R.', rating: 5, comment: 'PCOS symptoms reduced in 2 months. The Telugu meal plan was so helpful!', date: 'May 2025' },
      { name: 'Ananya K.', rating: 5, comment: 'Sneha ma\'am is very thorough. My gut health has improved a lot.', date: 'Apr 2025' },
      { name: 'Divya T.', rating: 4, comment: 'Very knowledgeable and approachable. Great experience overall.', date: 'Mar 2025' },
    ],
  },
]
