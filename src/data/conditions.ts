export interface ConditionData {
  slug: string
  seoTitle: string
  seoDescription: string
  keywords: string
  heroTitle: string
  heroSubtitle: string
  stats: { val: string; label: string }[]
  about: { heading: string; paragraphs: string[] }
  dietTips: { icon: string; title: string; text: string }[]
  eat: string[]
  avoid: string[]
  faqs: { q: string; a: string }[]
  relatedSlugs: string[]
  schema: object
}

const CONDITIONS: ConditionData[] = [
  {
    slug: 'weight-loss',
    seoTitle: 'Weight Loss Diet Plan for Indians | Expert Nutrition Guide',
    seoDescription: 'Get a personalised Indian weight loss diet plan from verified dietitians. Science-backed advice on what to eat, what to avoid, and how to lose weight sustainably without giving up roti or rice.',
    keywords: 'weight loss diet plan India, Indian diet for weight loss, how to lose weight Indian diet, diet chart for weight loss India, weight loss food list India',
    heroTitle: 'Weight Loss Diet Plan for Indians',
    heroSubtitle: 'Lose weight sustainably with a personalised Indian diet plan — no crash diets, no giving up roti or rice.',
    stats: [
      { val: '135M+', label: 'Indians are overweight' },
      { val: '0.5kg/week', label: 'Safe fat loss rate' },
      { val: '₹999', label: 'Starting consultation fee' },
    ],
    about: {
      heading: 'Why Weight Loss Is Hard — and How Diet Fixes It',
      paragraphs: [
        'Weight gain in India is often driven by a combination of refined carbohydrates, excess oil in cooking, large portion sizes and increasingly sedentary lifestyles. The solution is not to eliminate Indian food — it is to understand how much you are eating relative to what your body burns.',
        'A calorie deficit — eating slightly less than your body uses each day — is the only proven mechanism for fat loss. A well-designed Indian diet plan creates this deficit while keeping you full, meeting your protein needs and fitting your food preferences and schedule.',
        'MeriDiet\'s registered dietitians design personalised weight loss plans built around foods you already eat — dal, roti, sabzi, dahi — adjusted in the right quantities and combinations to create sustainable, enjoyable fat loss.',
      ],
    },
    dietTips: [
      { icon: 'fa-fire-flame-curved', title: 'Create a Calorie Deficit', text: 'Eating 300–500 kcal below your TDEE creates a safe deficit that leads to 0.3–0.5 kg of fat loss per week without triggering metabolic adaptation.' },
      { icon: 'fa-drumstick-bite', title: 'Prioritise Protein', text: 'Aim for 1.2–1.5g of protein per kg of body weight. Dal, eggs, paneer, chicken and dahi help preserve muscle while you lose fat and keep hunger low.' },
      { icon: 'fa-seedling', title: 'Fill Half Your Plate with Vegetables', text: 'Non-starchy vegetables — lauki, palak, gobhi, tinda — are high in fibre and very low in calories. More volume, less hunger.' },
      { icon: 'fa-wheat-awn', title: 'Choose Complex Carbs', text: 'Whole wheat roti, brown rice, daliya and oats digest slowly and keep blood sugar stable. Limit maida, white bread and sugary foods.' },
      { icon: 'fa-droplet', title: 'Stay Hydrated', text: 'Drink 2–3 litres of water daily. Replace sweet chai, cold drinks and packaged juices with water, chaas or plain nimbu pani without sugar.' },
    ],
    eat: [
      'Dal and legumes — moong, masoor, chana, rajma',
      'Eggs and lean chicken (grilled or boiled)',
      'Low-fat dahi and chaas',
      'Whole wheat roti and millet rotis (bajra, jowar)',
      'Seasonal vegetables — lauki, gobhi, palak, bhindi',
      'Sprouts and roasted chana',
      'Fruits — apple, pear, guava, papaya',
      'Brown rice or small portions of plain rice',
    ],
    avoid: [
      'Deep-fried foods — samosa, puri, bhatura, pakoda',
      'Sugary drinks — cold drinks, sweet lassi, packaged juices',
      'Refined flour (maida) products — white bread, biscuits, naan',
      'Ultra-processed snacks — chips, namkeen, instant noodles',
      'Mithai and sweets in large quantities',
      'Restaurant curries made with cream or excess butter',
    ],
    faqs: [
      { q: 'How much weight can I lose in a month with an Indian diet?', a: 'A safe and sustainable rate is 1–2 kg per month. This equates to roughly 300–500 calories below your daily needs. Crash diets may show faster results initially but most of that is water weight, and the weight returns quickly.' },
      { q: 'Can I eat roti and rice and still lose weight?', a: 'Yes. Both roti and rice can be part of a weight loss diet when eaten in appropriate portions alongside protein and vegetables. The quantity and the rest of the meal matter more than eliminating these foods.' },
      { q: 'Do I need to exercise to lose weight?', a: 'Diet alone can create the calorie deficit needed for weight loss. Exercise makes it easier to maintain the deficit, preserves muscle mass and improves overall health. A combination of both gives the best long-term results.' },
      { q: 'How is a personalised plan different from a generic diet chart?', a: 'A personalised plan accounts for your weight, height, activity level, food preferences, health conditions and schedule. A generic chart does not. The result is a plan you can actually follow consistently, which is the single most important factor in weight loss success.' },
    ],
    relatedSlugs: [
      'best-indian-foods-for-weight-loss',
      'why-am-i-not-losing-weight',
      'what-is-a-calorie-deficit',
      'how-to-lose-belly-fat',
      'why-crash-diets-dont-work',
      'how-much-protein-do-you-need',
    ],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: 'Weight Loss Diet Plan for Indians',
      description: 'Expert-backed Indian diet advice for sustainable weight loss.',
      about: { '@type': 'MedicalCondition', name: 'Obesity' },
      audience: { '@type': 'Patient' },
    },
  },

  {
    slug: 'pcos',
    seoTitle: 'PCOS Diet Plan for Indian Women | Expert Nutrition Guide',
    seoDescription: 'Manage PCOS with a personalised Indian diet plan designed by registered dietitians. Learn what to eat, what to avoid, and how the right nutrition reduces PCOS symptoms.',
    keywords: 'PCOS diet plan India, diet for PCOS Indian women, PCOS diet chart India, what to eat in PCOS India, polycystic ovary diet plan Indian',
    heroTitle: 'PCOS Diet Plan for Indian Women',
    heroSubtitle: 'Manage PCOS symptoms with a personalised Indian diet — reduce insulin resistance, balance hormones and improve your quality of life.',
    stats: [
      { val: '1 in 5', label: 'Indian women have PCOS' },
      { val: '70%', label: 'Cases improve with diet changes' },
      { val: '₹999', label: 'Starting consultation fee' },
    ],
    about: {
      heading: 'How Diet Affects PCOS',
      paragraphs: [
        'Polycystic Ovary Syndrome (PCOS) is a hormonal condition affecting the ovaries. It is characterised by irregular periods, excess androgen levels, and multiple small cysts on the ovaries. In India, it is estimated to affect 1 in 5 women of reproductive age.',
        'Insulin resistance is at the root of most PCOS cases. When cells do not respond properly to insulin, the body produces more of it — and excess insulin signals the ovaries to produce more androgens (male hormones), disrupting the hormonal balance that regulates the menstrual cycle.',
        'A PCOS-specific diet targets this insulin resistance directly — through lower glycaemic carbohydrates, higher protein intake, anti-inflammatory foods and specific nutrients. Research consistently shows that even modest weight loss (5–10% of body weight) significantly improves PCOS symptoms in overweight women.',
      ],
    },
    dietTips: [
      { icon: 'fa-chart-line', title: 'Eat Low Glycaemic Index Foods', text: 'Low GI foods release glucose slowly and reduce the insulin spikes that worsen PCOS. Replace white rice and maida with whole wheat roti, daliya, oats and brown rice.' },
      { icon: 'fa-drumstick-bite', title: 'Increase Protein at Every Meal', text: 'Protein reduces hunger, stabilises blood sugar and supports weight management. Include dal, paneer, eggs, dahi or chicken at every meal.' },
      { icon: 'fa-leaf', title: 'Eat Anti-Inflammatory Foods', text: 'Turmeric, ginger, leafy greens, berries, walnuts and fatty fish reduce chronic inflammation associated with PCOS.' },
      { icon: 'fa-ban', title: 'Reduce Added Sugar Significantly', text: 'Sugar directly worsens insulin resistance. Remove sugary drinks, mithai, sweetened dahi and packaged foods with added sugar from your daily diet.' },
      { icon: 'fa-dumbbell', title: 'Combine Diet with Exercise', text: 'Regular exercise — even 30 minutes of walking daily — significantly improves insulin sensitivity in women with PCOS.' },
    ],
    eat: [
      'Moong dal, masoor dal, chana and rajma',
      'Eggs, paneer and low-fat dahi',
      'Whole wheat roti, bajra roti, oats and daliya',
      'Green leafy vegetables — palak, methi, sarson',
      'Berries, apple, pear and guava',
      'Walnuts, almonds and flaxseeds',
      'Turmeric and ginger in cooking',
      'Fatty fish (mackerel, sardines) for omega-3',
    ],
    avoid: [
      'White rice in large portions and maida products',
      'Sugary drinks — cold drinks, sweetened chai, packaged juices',
      'Mithai, chocolates and baked sweets',
      'Processed and packaged snacks',
      'Excess dairy (full-fat cream, butter) — moderate intake is fine',
      'Alcohol',
    ],
    faqs: [
      { q: 'Can PCOS be cured through diet?', a: 'PCOS cannot be fully cured, but its symptoms can be significantly managed through diet, exercise and lifestyle changes. Many women with PCOS see substantial improvement in period regularity, androgen levels and fertility markers through dietary intervention alone.' },
      { q: 'Should I avoid dairy completely with PCOS?', a: 'Not necessarily. The evidence on dairy and PCOS is mixed. Moderate amounts of low-fat dairy (plain dahi, paneer, milk) are generally fine. Large amounts of full-fat dairy or flavoured dairy products may be worth limiting. Your dietitian can advise based on your specific case.' },
      { q: 'Is intermittent fasting good for PCOS?', a: 'Some research suggests intermittent fasting can improve insulin sensitivity in women with PCOS. However, it is not suitable for everyone and should be approached carefully, especially in women with irregular eating patterns or hormonal sensitivity. Always discuss with a registered dietitian before trying IF with PCOS.' },
      { q: 'How long does it take to see results from a PCOS diet?', a: 'Most women notice improvements in energy levels and bloating within 4–6 weeks. Period regularity and hormonal markers typically improve over 3–6 months of consistent dietary changes. Weight loss, if applicable, helps accelerate these improvements.' },
    ],
    relatedSlugs: [
      'pcos-diet-plan-for-indian-women',
      'high-protein-indian-foods',
      'healthy-indian-breakfast-for-weight-loss',
      'best-indian-foods-for-weight-loss',
      'common-diet-myths-india',
    ],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: 'PCOS Diet Plan for Indian Women',
      description: 'Expert-backed Indian diet advice for managing PCOS symptoms through nutrition.',
      about: { '@type': 'MedicalCondition', name: 'Polycystic Ovary Syndrome' },
      audience: { '@type': 'Patient' },
    },
  },

  {
    slug: 'diabetes',
    seoTitle: 'Diabetes Diet Plan for Indians | Expert Nutrition Guide',
    seoDescription: 'Manage blood sugar with a personalised Indian diabetes diet plan from registered dietitians. Learn which Indian foods to eat, limit and avoid for Type 2 diabetes management.',
    keywords: 'diabetes diet plan India, diet for diabetic patients India, diabetic diet chart Indian, blood sugar diet plan India, Type 2 diabetes Indian food',
    heroTitle: 'Diabetes Diet Plan for Indians',
    heroSubtitle: 'Control blood sugar with an expert-designed Indian diet plan — practical, personalised and built around foods you already know.',
    stats: [
      { val: '101M', label: 'Indians have diabetes' },
      { val: '136M', label: 'Have prediabetes' },
      { val: '₹999', label: 'Starting consultation fee' },
    ],
    about: {
      heading: 'Why Diet Is Central to Diabetes Management',
      paragraphs: [
        'India has the second highest number of people with diabetes in the world. Type 2 diabetes — the most common form — is characterised by insulin resistance and elevated blood glucose levels. Left unmanaged, it significantly increases the risk of heart disease, kidney disease, nerve damage and vision problems.',
        'Diet is one of the most powerful tools available for managing Type 2 diabetes. The foods you eat directly determine how high and how quickly your blood glucose rises after a meal. Choosing the right carbohydrates, eating adequate protein and fibre, and controlling portions can help keep blood glucose within a healthy range.',
        'A diabetes diet does not mean eliminating Indian staples. It means making smarter choices about quantities and combinations — two small rotis with dal instead of four plain rotis, brown rice instead of white, or including a protein with each meal to slow glucose absorption.',
      ],
    },
    dietTips: [
      { icon: 'fa-chart-line', title: 'Focus on Low Glycaemic Index Foods', text: 'Low GI foods raise blood sugar slowly and steadily. Whole grains, legumes, most vegetables and unsweetened dairy are all low GI and form the foundation of a diabetes-friendly Indian diet.' },
      { icon: 'fa-utensils', title: 'Pair Carbs with Protein', text: 'Eating carbohydrates alongside protein (dal + roti, dahi + fruit) slows glucose absorption and reduces post-meal blood sugar spikes.' },
      { icon: 'fa-seedling', title: 'Eat More Non-Starchy Vegetables', text: 'Fill half your plate with vegetables like palak, methi, lauki, bhindi and gobhi. They are very low in carbohydrates and rich in fibre and micronutrients.' },
      { icon: 'fa-clock', title: 'Do Not Skip Meals', text: 'Skipping meals causes blood sugar to drop and then spike when you eat again. Eat 3 regular meals at consistent times, with small snacks if needed.' },
      { icon: 'fa-ruler', title: 'Control Portion Sizes', text: 'Even low GI foods raise blood sugar if eaten in large quantities. Use a katori as a guide — 1–2 katoris of dal, 1 small katori of rice, 2–3 medium chapatis per meal.' },
    ],
    eat: [
      'Dal and legumes — moong, chana, rajma, masoor',
      'Non-starchy vegetables — karela, lauki, palak, methi, bhindi',
      'Whole wheat and millet rotis (bajra, jowar)',
      'Small portions of brown rice or plain rice',
      'Eggs, lean chicken and fish',
      'Plain dahi and chaas (unsweetened)',
      'Most fruits in moderate portions — guava, apple, pear',
      'Nuts and seeds in small quantities',
    ],
    avoid: [
      'Sugary drinks — cold drinks, packaged juices, sweet lassi',
      'Mithai and Indian sweets',
      'White bread, maida and refined flour products',
      'Large portions of white rice (more than 1 katori)',
      'Deep-fried snacks — samosa, kachori, puri',
      'Sweetened yoghurt and flavoured milk drinks',
    ],
    faqs: [
      { q: 'Can a diabetic eat roti?', a: '2–3 small whole wheat chapatis at a meal are generally fine for people with well-managed Type 2 diabetes, especially when eaten with dal and vegetables. Millet rotis (bajra, jowar) are even better as they have a lower glycaemic impact.' },
      { q: 'Is fruit bad for diabetics?', a: 'Most fruits in appropriate portions are fine for diabetics. Good choices include guava, apple, pear, papaya and berries. Avoid fruit juice — even fresh juice removes fibre and delivers sugar rapidly. Manage portions of mango, grapes and banana.' },
      { q: 'How much rice can a diabetic eat?', a: 'A small katori (about 150g cooked) of plain rice once a day is manageable for many people with controlled Type 2 diabetes when paired with dal and vegetables. Use a glucometer to test your personal response 2 hours after eating.' },
      { q: 'Can diet alone control Type 2 diabetes without medication?', a: 'In mild or early-stage Type 2 diabetes, significant dietary changes and weight loss can sometimes normalise blood glucose without medication. For most people, diet works alongside medication to improve control. Never stop or reduce diabetes medication without your doctor\'s guidance.' },
    ],
    relatedSlugs: [
      'diabetes-diet-plan-for-indians',
      'what-is-a-calorie-deficit',
      'best-indian-foods-for-weight-loss',
      'is-rice-bad-for-weight-loss',
      'high-protein-indian-foods',
    ],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: 'Diabetes Diet Plan for Indians',
      description: 'Expert-backed Indian diet advice for managing Type 2 diabetes through nutrition.',
      about: { '@type': 'MedicalCondition', name: 'Type 2 Diabetes Mellitus' },
      audience: { '@type': 'Patient' },
    },
  },

  {
    slug: 'thyroid',
    seoTitle: 'Thyroid Diet Plan for Indians | Expert Nutrition Guide',
    seoDescription: 'Support thyroid health with a personalised Indian diet plan from registered dietitians. Learn the best foods for hypothyroidism, what to avoid, and how diet supports thyroid function.',
    keywords: 'thyroid diet plan India, hypothyroid diet Indian foods, diet for thyroid patients India, thyroid diet chart India, foods to avoid in thyroid India',
    heroTitle: 'Thyroid Diet Plan for Indians',
    heroSubtitle: 'Support your thyroid health with the right foods — a practical Indian diet plan for hypothyroidism and weight management.',
    stats: [
      { val: '42M', label: 'Indians have thyroid disorders' },
      { val: '1 in 8', label: 'Women affected in their lifetime' },
      { val: '₹999', label: 'Starting consultation fee' },
    ],
    about: {
      heading: 'How Diet Supports Thyroid Health',
      paragraphs: [
        'Thyroid disorders — particularly hypothyroidism (underactive thyroid) — are among the most common hormonal conditions in India, affecting an estimated 42 million people. Women are significantly more likely to be affected than men.',
        'An underactive thyroid produces insufficient thyroid hormones (T3 and T4), which slows metabolism. This leads to weight gain, fatigue, cold intolerance, constipation and difficulty concentrating. While thyroid medication (levothyroxine) is the primary treatment, the right diet plays an important supporting role.',
        'A thyroid-specific diet ensures adequate intake of key nutrients — iodine, selenium, zinc and vitamin D — that are essential for thyroid hormone production and function. It also supports weight management and reduces inflammation, both of which are affected by thyroid dysfunction.',
      ],
    },
    dietTips: [
      { icon: 'fa-salt-shaker', title: 'Ensure Adequate Iodine', text: 'Iodine is essential for thyroid hormone production. Use iodised salt in cooking. Seafood, eggs and dairy are also good iodine sources for non-vegetarians.' },
      { icon: 'fa-shield-halved', title: 'Get Enough Selenium', text: 'Selenium supports conversion of T4 to the active T3 hormone. Eggs, sunflower seeds, Brazil nuts and lean meats are good sources.' },
      { icon: 'fa-drumstick-bite', title: 'Eat Adequate Protein', text: 'Protein supports metabolism and helps manage weight, which is often a challenge with hypothyroidism. Include dal, eggs, dahi, paneer or lean chicken at every meal.' },
      { icon: 'fa-fire', title: 'Cook Goitrogenic Vegetables', text: 'Cruciferous vegetables (gobhi, broccoli, cabbage) contain goitrogens that can interfere with thyroid function in very large amounts. Cooking significantly reduces their effect — there is no need to eliminate them.' },
      { icon: 'fa-pills', title: 'Take Medication Correctly', text: 'Take levothyroxine on an empty stomach, 30–60 minutes before food. Avoid calcium-rich foods, coffee and certain supplements within 4 hours of your medication, as they reduce absorption.' },
    ],
    eat: [
      'Iodised salt in cooking',
      'Eggs — iodine and selenium',
      'Seafood and fish for non-vegetarians',
      'Plain dahi and low-fat milk',
      'Green leafy vegetables (cooked) — palak, methi',
      'Legumes and lentils — iron and zinc source',
      'Pumpkin seeds and sunflower seeds',
      'Whole grains — daliya, oats, whole wheat roti',
    ],
    avoid: [
      'Very large quantities of raw cruciferous vegetables — cook them instead',
      'Soy products in very large amounts close to medication time',
      'Calcium supplements within 4 hours of thyroid medication',
      'Coffee and tea immediately after taking medication',
      'Ultra-processed and packaged foods',
      'Excess sugar and refined carbohydrates',
    ],
    faqs: [
      { q: 'Can diet cure hypothyroidism?', a: 'No. Hypothyroidism is a medical condition requiring thyroid hormone replacement medication. Diet alone cannot treat it. However, the right diet ensures adequate nutrient intake, supports weight management and complements medication.' },
      { q: 'Should I avoid gobhi and broccoli with hypothyroidism?', a: 'No. The concern about cruciferous vegetables is overstated for most people. Eating moderate portions of cooked gobhi, broccoli or cabbage does not cause thyroid problems. Only very large amounts of raw cruciferous vegetables consumed daily could be an issue.' },
      { q: 'Why am I still gaining weight despite taking thyroid medication?', a: 'If your TSH levels are in the normal range with medication, the thyroid is being managed and the weight gain is likely due to other factors — calorie intake, activity level, sleep quality or stress. A dietitian can help identify the specific cause for your situation.' },
      { q: 'Is there a special thyroid diet for vegetarians?', a: 'Vegetarians can meet all thyroid-supportive nutrient needs with careful planning — iodised salt for iodine, sunflower and pumpkin seeds for selenium, lentils and whole grains for zinc, and plenty of dairy for additional iodine and protein.' },
    ],
    relatedSlugs: [
      'diet-for-thyroid-patients-india',
      'high-protein-indian-foods',
      'why-am-i-not-losing-weight',
      'how-much-protein-do-you-need',
    ],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: 'Thyroid Diet Plan for Indians',
      description: 'Expert-backed Indian diet advice for managing hypothyroidism through nutrition.',
      about: { '@type': 'MedicalCondition', name: 'Hypothyroidism' },
      audience: { '@type': 'Patient' },
    },
  },
]

export default CONDITIONS
