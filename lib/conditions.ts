// The skin conditions the VGG19 model can classify (22 classes in total).
// `modelClass` must match fyp/backend/class_names.json exactly.
// The 22nd class, "Unknown_Normal", is not a disease — see NORMAL_CLASS below.

export type Severity = 'low' | 'medium' | 'high';

export interface SkinCondition {
  slug: string;
  name: string;
  modelClass: string;
  alsoKnownAs?: string[];
  severity: Severity;
  isCancerous: boolean;
  summary: string;
  description: string;
  signs: string[];
  riskFactors: string[];
  nextSteps: string[];
}

// Facts about the trained model, shown on reports and info pages
export const MODEL_INFO = {
  architecture: 'VGG19',
  totalClasses: 22,
  trainingImages: 15444,
  testAccuracy: 0.38,
};

// The model class meaning "healthy skin / nothing recognised"
export const NORMAL_CLASS = 'Unknown_Normal';

export const SEVERITY_INFO: Record<
  Severity,
  { label: string; badge: string; text: string; bar: string; card: string; advice: string }
> = {
  low: {
    label: 'Low Risk',
    badge: 'bg-green-100 text-green-800',
    text: 'text-green-700',
    bar: 'bg-green-500',
    card: 'border-green-300 bg-green-50',
    advice: 'Usually not serious. Monitor it, and see a doctor if it spreads, worsens or does not improve.',
  },
  medium: {
    label: 'See a Doctor',
    badge: 'bg-yellow-100 text-yellow-800',
    text: 'text-yellow-700',
    bar: 'bg-yellow-500',
    card: 'border-yellow-300 bg-yellow-50',
    advice: 'Usually treatable. See a doctor or dermatologist to confirm it and get the right treatment.',
  },
  high: {
    label: 'See a Dermatologist Soon',
    badge: 'bg-red-100 text-red-800',
    text: 'text-red-700',
    bar: 'bg-red-500',
    card: 'border-red-300 bg-red-50',
    advice: 'This can be serious. Book an appointment with a dermatologist as soon as possible.',
  },
};

export const CONDITIONS: SkinCondition[] = [
  {
    slug: 'skin-cancer',
    name: 'Skin Cancer',
    modelClass: 'SkinCancer',
    alsoKnownAs: ['Melanoma', 'Basal cell carcinoma', 'Squamous cell carcinoma'],
    severity: 'high',
    isCancerous: true,
    summary:
      'Abnormal, uncontrolled growth of skin cells — including melanoma, basal cell carcinoma and squamous cell carcinoma. Most skin cancers are curable when found early.',
    description:
      'Skin cancer usually develops on skin exposed to the sun, but it can appear anywhere. Basal cell and squamous cell carcinomas are the most common types and grow slowly. Melanoma is less common but more dangerous because it can spread to other organs. Any new, changing, bleeding or non-healing spot should be checked by a dermatologist promptly.',
    signs: [
      'A new spot, or a mole that changes in size, shape or colour',
      'Asymmetric mole with irregular border or several colours (ABCDE rule)',
      'Shiny, pearly bump or a flat scar-like patch',
      'Firm red nodule or a scaly, crusted sore',
      'A sore that bleeds, heals and then comes back',
    ],
    riskFactors: [
      'Sunburn and long-term sun exposure',
      'Fair skin, light hair or many moles',
      'Family or personal history of skin cancer',
      'Use of tanning beds',
      'Weakened immune system',
    ],
    nextSteps: [
      'Book a dermatologist appointment promptly — do not wait',
      'Do not scratch, pick or try to remove the spot',
      'Take dated photos so changes can be tracked',
      'Protect the area from the sun',
    ],
  },
  {
    slug: 'acne',
    name: 'Acne',
    modelClass: 'Acne',
    alsoKnownAs: ['Acne vulgaris', 'Pimples'],
    severity: 'low',
    isCancerous: false,
    summary:
      'A very common skin condition where hair follicles become clogged with oil and dead skin, causing pimples, blackheads and whiteheads.',
    description:
      'Acne mostly affects the face, forehead, chest, shoulders and upper back. It is most common in teenagers but can occur at any age. Mild acne often improves with over-the-counter treatments, while moderate or severe acne — especially painful cysts that can scar — should be treated by a doctor.',
    signs: [
      'Whiteheads and blackheads',
      'Red, tender bumps (papules) and pus-filled pimples',
      'Painful lumps under the skin (nodules or cysts)',
      'Dark marks or scars after spots heal',
    ],
    riskFactors: ['Hormonal changes (puberty, periods, pregnancy)', 'Family history of acne', 'Oily or heavy skin products', 'Some medicines, such as steroids'],
    nextSteps: [
      'Wash gently twice a day with a mild cleanser',
      'Try products with benzoyl peroxide or salicylic acid',
      'Do not squeeze or pick spots — it causes scarring',
      'See a doctor if acne is painful, cystic or not improving after 2–3 months',
    ],
  },
  {
    slug: 'eczema',
    name: 'Eczema',
    modelClass: 'Eczema',
    alsoKnownAs: ['Atopic dermatitis', 'Dermatitis'],
    severity: 'medium',
    isCancerous: false,
    summary:
      'A long-term condition that makes skin dry, itchy, red and inflamed. It tends to flare up and calm down over time.',
    description:
      'Eczema is not contagious. It often starts in childhood and is linked to asthma and hay fever. Flares can be triggered by soaps, fabrics, heat, sweat, stress or allergens. Moisturisers and prescribed creams usually keep it under control.',
    signs: [
      'Dry, itchy skin that may be very itchy at night',
      'Red or darker patches, often in skin creases (elbows, knees, neck)',
      'Rough, thickened or scaly skin',
      'Small bumps that may leak fluid and crust over',
    ],
    riskFactors: ['Personal or family history of eczema, asthma or hay fever', 'Irritating soaps or detergents', 'Dry climate', 'Stress'],
    nextSteps: [
      'Moisturise several times a day with a fragrance-free emollient',
      'Avoid harsh soaps and known triggers',
      'See a doctor for a prescription cream if it is widespread or not improving',
      'Seek care if skin looks infected (weeping, crusting, pain or fever)',
    ],
  },
  {
    slug: 'psoriasis',
    name: 'Psoriasis',
    modelClass: 'Psoriasis',
    alsoKnownAs: ['Plaque psoriasis'],
    severity: 'medium',
    isCancerous: false,
    summary:
      'A long-term immune condition that causes skin cells to build up quickly, forming thick, scaly patches.',
    description:
      'Psoriasis commonly appears on the elbows, knees, scalp and lower back. It is not contagious. It can come and go in flares and is sometimes linked to joint pain (psoriatic arthritis). Many effective treatments are available from a doctor.',
    signs: [
      'Raised red or darker patches covered with silvery-white scales',
      'Dry, cracked skin that may bleed',
      'Itching, burning or soreness',
      'Pitted or thickened nails',
    ],
    riskFactors: ['Family history', 'Stress', 'Infections such as strep throat', 'Smoking and heavy alcohol use'],
    nextSteps: [
      'See a doctor or dermatologist to confirm the diagnosis',
      'Keep skin moisturised',
      'Mention any joint pain to your doctor',
    ],
  },
  {
    slug: 'moles',
    name: 'Moles',
    modelClass: 'Moles',
    alsoKnownAs: ['Nevus', 'Melanocytic nevus'],
    severity: 'low',
    isCancerous: false,
    summary:
      'Common, usually harmless clusters of pigment cells. Most adults have between 10 and 40 moles.',
    description:
      'Moles (nevi) can be flat or raised and range from pink to dark brown. Nearly all are harmless, but a mole that changes can be an early sign of melanoma, so it is worth checking your moles regularly using the ABCDE rule.',
    signs: [
      'Round or oval with a smooth, even border',
      'Single, even colour',
      'Usually smaller than 6 mm',
      'Stays the same over time',
    ],
    riskFactors: ['Genetics', 'Sun exposure in childhood', 'Fair skin'],
    nextSteps: [
      'Check your moles monthly using the ABCDE rule',
      'See a dermatologist if a mole changes, itches or bleeds',
      'Use sunscreen to reduce the chance of new moles',
    ],
  },
  {
    slug: 'tinea-ringworm',
    name: 'Tinea (Ringworm)',
    modelClass: 'Tinea',
    alsoKnownAs: ['Ringworm', 'Athlete\'s foot', 'Jock itch', 'Fungal skin infection'],
    severity: 'medium',
    isCancerous: false,
    summary:
      'A common, contagious fungal skin infection that often forms a red, itchy, ring-shaped rash. It is not caused by a worm.',
    description:
      'Tinea can affect the body, scalp, groin (jock itch) or feet (athlete\'s foot). It spreads through skin contact, shared towels, pets and damp floors. Most cases clear with antifungal creams; scalp and nail infections need medicine from a doctor.',
    signs: [
      'Ring-shaped rash with a raised, scaly edge and clearer centre',
      'Itching',
      'Cracked, peeling skin between the toes',
      'Patchy hair loss on the scalp',
    ],
    riskFactors: ['Warm, damp skin and sweating', 'Sharing towels or clothes', 'Contact with infected people or pets', 'Weakened immune system'],
    nextSteps: [
      'Use an over-the-counter antifungal cream for 2–4 weeks',
      'Keep the area clean and dry; do not share towels',
      'See a doctor if it is on the scalp or nails, or does not clear',
      'Avoid steroid creams unless a doctor prescribes them',
    ],
  },
  {
    slug: 'warts',
    name: 'Warts',
    modelClass: 'Warts',
    alsoKnownAs: ['Verruca', 'Common warts', 'Plantar warts'],
    severity: 'low',
    isCancerous: false,
    summary:
      'Small, rough, harmless growths caused by the human papillomavirus (HPV). They are mildly contagious.',
    description:
      'Warts commonly appear on the hands, fingers and feet (verrucas). Many disappear on their own within months to a couple of years. Over-the-counter treatments or freezing by a doctor can speed this up.',
    signs: [
      'Small, rough, raised bump',
      'Tiny black dots (clotted blood vessels) inside',
      'Flat, painful spots on the soles of the feet',
    ],
    riskFactors: ['Cuts or broken skin', 'Walking barefoot in public showers', 'Weakened immune system', 'Biting nails'],
    nextSteps: [
      'Try salicylic acid wart treatment from a pharmacy',
      'Do not pick or shave over warts — they can spread',
      'See a doctor for warts on the face or genitals, or ones that bleed or change',
    ],
  },
  {
    slug: 'rosacea',
    name: 'Rosacea',
    modelClass: 'Rosacea',
    alsoKnownAs: ['Acne rosacea'],
    severity: 'low',
    isCancerous: false,
    summary:
      'A long-term condition that causes facial redness, flushing and sometimes small pimples, mostly on the cheeks and nose.',
    description:
      'Rosacea usually starts after age 30 and comes in flares. Triggers include sun, heat, spicy food, alcohol and stress. It cannot be cured but treatments control redness and spots well.',
    signs: [
      'Persistent redness on cheeks, nose, chin or forehead',
      'Easy flushing or blushing',
      'Small visible blood vessels',
      'Red bumps or pus-filled spots (without blackheads)',
    ],
    riskFactors: ['Fair skin', 'Age over 30', 'Family history', 'Sun exposure'],
    nextSteps: [
      'Use daily sunscreen and gentle skin care',
      'Track and avoid your triggers',
      'See a doctor for prescription creams or tablets if it bothers you',
    ],
  },
  {
    slug: 'vitiligo',
    name: 'Vitiligo',
    modelClass: 'Vitiligo',
    severity: 'low',
    isCancerous: false,
    summary:
      'A condition where the skin loses its pigment in patches, leaving smooth white areas. It is not contagious or harmful.',
    description:
      'Vitiligo happens when the cells that make skin colour stop working, usually due to the immune system. It can affect any part of the body and is more visible on darker skin. Treatments can help restore colour in some people.',
    signs: [
      'Smooth, milky-white patches of skin',
      'Often symmetrical, on hands, face, or around body openings',
      'Early whitening of hair, eyelashes or eyebrows',
    ],
    riskFactors: ['Family history', 'Other autoimmune conditions (e.g. thyroid disease)', 'Skin injury or severe sunburn'],
    nextSteps: [
      'See a dermatologist to confirm and discuss treatment options',
      'Protect white patches from the sun — they burn easily',
      'Ask your doctor about thyroid testing',
    ],
  },
  {
    slug: 'actinic-keratosis',
    name: 'Actinic Keratosis',
    modelClass: 'Actinic_Keratosis',
    alsoKnownAs: ['Solar keratosis', 'AK'],
    severity: 'high',
    isCancerous: false,
    summary:
      'A rough, scaly patch caused by years of sun exposure. It is precancerous and can sometimes develop into squamous cell carcinoma.',
    description:
      'Actinic keratoses appear on sun-damaged skin, most often on the face, scalp, ears, forearms and backs of the hands. They are not cancer themselves, but because a small share can progress to skin cancer, dermatologists usually recommend treating them.',
    signs: [
      'Rough, dry or scaly patch, often under 2.5 cm',
      'Flat or slightly raised, pink, red or brown',
      'Itching, burning or tenderness',
      'Feels like sandpaper before it is easy to see',
    ],
    riskFactors: ['Many years of sun exposure', 'Fair skin, light eyes, red or blond hair', 'Age over 40', 'Weakened immune system'],
    nextSteps: [
      'See a dermatologist — simple treatments (freezing, creams) are available',
      'Use sunscreen and protective clothing daily',
      'Check your skin regularly for new rough patches',
    ],
  },
  {
    slug: 'sun-damage',
    name: 'Sun Damage',
    modelClass: 'Sun_Sunlight_Damage',
    alsoKnownAs: ['Photoaging', 'Sun spots', 'Solar lentigines'],
    severity: 'medium',
    isCancerous: false,
    summary:
      'Skin changes caused by ultraviolet (UV) light, such as sun spots, wrinkles, uneven colour and rough texture. It raises the risk of skin cancer.',
    description:
      'Repeated sun exposure damages skin cells and collagen over time. Signs build up on the face, neck, chest, arms and hands. Some sun-related spots are harmless, but sun-damaged skin should be checked regularly for precancerous and cancerous changes.',
    signs: [
      'Brown or tan "sun spots" (solar lentigines)',
      'Wrinkles, leathery or thin skin',
      'Uneven skin tone and redness',
      'Rough, scaly patches',
    ],
    riskFactors: ['Frequent sun exposure without protection', 'Sunburns', 'Fair skin', 'Outdoor work'],
    nextSteps: [
      'Use broad-spectrum SPF 30+ sunscreen every day',
      'Wear hats and protective clothing',
      'Have a dermatologist check rough or changing spots',
    ],
  },
  {
    slug: 'seborrheic-keratosis',
    name: 'Seborrheic Keratosis',
    modelClass: 'Seborrh_Keratoses',
    alsoKnownAs: ['SK', 'Senile wart'],
    severity: 'low',
    isCancerous: false,
    summary:
      'A very common, non-cancerous growth with a waxy, "stuck-on" look. It becomes more common with age.',
    description:
      'Seborrheic keratoses are benign growths that can be light tan to black. They often look like they have been pasted onto the skin and may appear on the chest, back, face or scalp. They are harmless, but can be removed if they become irritated.',
    signs: [
      'Waxy, scaly, slightly raised growth',
      'Looks "stuck on" to the skin surface',
      'Tan, brown or black colour',
      'Can itch or become irritated by clothing',
    ],
    riskFactors: ['Age over 50', 'Family history', 'Sun exposure'],
    nextSteps: [
      'Usually no treatment needed',
      'See a dermatologist if it bleeds, itches badly or changes quickly',
      'Removal is possible for comfort or cosmetic reasons',
    ],
  },
  {
    slug: 'benign-skin-tumors',
    name: 'Benign Skin Tumours',
    modelClass: 'Benign_tumors',
    alsoKnownAs: ['Lipoma', 'Dermatofibroma', 'Skin cyst', 'Skin tag', 'Keloid'],
    severity: 'low',
    isCancerous: false,
    summary:
      'Non-cancerous lumps and growths in or under the skin, such as cysts, lipomas, dermatofibromas, skin tags and keloids.',
    description:
      'Benign skin tumours do not spread to other parts of the body and are usually harmless. They are often removed only if they are painful, infected or bothersome. A doctor should check any lump that grows quickly, is hard and fixed, or looks unusual.',
    signs: [
      'Soft, movable lump under the skin (lipoma or cyst)',
      'Small firm bump that dimples when pinched (dermatofibroma)',
      'Small flap of skin on a stalk (skin tag)',
      'Raised, shiny scar that grows beyond the wound (keloid)',
    ],
    riskFactors: ['Genetics', 'Age', 'Skin injury or friction', 'Hormonal changes'],
    nextSteps: [
      'Usually no treatment needed',
      'See a doctor if it grows quickly, hurts, bleeds or becomes red and hot',
      'Removal is possible for comfort or appearance',
    ],
  },
  {
    slug: 'vascular-tumors',
    name: 'Vascular Tumours',
    modelClass: 'Vascular_Tumors',
    alsoKnownAs: ['Haemangioma', 'Cherry angioma', 'Pyogenic granuloma'],
    severity: 'medium',
    isCancerous: false,
    summary:
      'Growths made of blood vessels, such as haemangiomas, cherry angiomas and pyogenic granulomas. Most are benign.',
    description:
      'Vascular tumours appear as red, purple or blue spots or bumps. Infant haemangiomas often shrink by themselves, and cherry angiomas are harmless. Pyogenic granulomas bleed easily and are usually removed. Rarely, a vascular growth can be more serious, so new or fast-growing ones should be checked.',
    signs: [
      'Bright red, purple or bluish spot or bump',
      'May bleed easily when bumped',
      'May grow quickly over weeks',
    ],
    riskFactors: ['Infancy (haemangiomas)', 'Age (cherry angiomas)', 'Pregnancy or minor injury (pyogenic granuloma)'],
    nextSteps: [
      'Have a doctor confirm the type of growth',
      'Apply firm pressure if it bleeds and seek care if bleeding repeats',
      'See a doctor promptly for fast-growing lesions or ones near the eye, nose or mouth in babies',
    ],
  },
  {
    slug: 'candidiasis',
    name: 'Candidiasis',
    modelClass: 'Candidiasis',
    alsoKnownAs: ['Skin yeast infection', 'Cutaneous candidiasis', 'Intertrigo'],
    severity: 'medium',
    isCancerous: false,
    summary:
      'A skin infection caused by Candida yeast, usually in warm, moist skin folds such as the groin, armpits or under the breasts.',
    description:
      'Candida normally lives on the skin but can overgrow when skin stays warm and damp. It causes a red, itchy rash that often has small "satellite" spots around the edge. It usually responds well to antifungal creams.',
    signs: [
      'Bright red, moist rash in skin folds',
      'Small red spots or pustules around the main rash',
      'Itching, burning or soreness',
    ],
    riskFactors: ['Diabetes', 'Obesity and skin folds', 'Recent antibiotics', 'Hot, humid weather and tight clothing'],
    nextSteps: [
      'Keep the area clean and fully dry',
      'Use an antifungal cream from a pharmacy',
      'See a doctor if it does not improve in 1–2 weeks or keeps coming back (check for diabetes)',
    ],
  },
  {
    slug: 'infestations-and-bites',
    name: 'Infestations & Bites',
    modelClass: 'Infestations_Bites',
    alsoKnownAs: ['Scabies', 'Lice', 'Bed bug bites', 'Insect bites'],
    severity: 'medium',
    isCancerous: false,
    summary:
      'Skin reactions caused by tiny parasites (such as scabies mites and lice) or by bites from insects like mosquitoes, fleas and bed bugs.',
    description:
      'Insect bites usually cause small, itchy bumps that settle within days. Infestations such as scabies cause intense itching, especially at night, and spread easily through close contact — they need prescription treatment for everyone in the household.',
    signs: [
      'Small, very itchy red bumps, often in groups or lines',
      'Itching that is worse at night',
      'Tiny burrow lines between fingers or on wrists (scabies)',
      'Visible lice or eggs in hair',
    ],
    riskFactors: ['Close contact with an infested person', 'Crowded living conditions', 'Pets with fleas', 'Travel and shared bedding'],
    nextSteps: [
      'See a doctor if you suspect scabies or lice — prescription treatment is needed',
      'Wash bedding and clothes in hot water',
      'Avoid scratching to prevent infection',
      'Seek urgent care for swelling of the face or trouble breathing after a bite',
    ],
  },
  {
    slug: 'lichen-planus',
    name: 'Lichen Planus',
    modelClass: 'Lichen',
    alsoKnownAs: ['Lichenoid eruption'],
    severity: 'medium',
    isCancerous: false,
    summary:
      'An inflammatory condition that causes itchy, flat-topped, purplish bumps on the skin and sometimes white patches in the mouth.',
    description:
      'Lichen planus is not contagious. It often appears on the wrists, ankles and lower back, and can also affect the mouth, nails and scalp. Skin lichen planus often clears within one to two years; treatments help control itching.',
    signs: [
      'Shiny, flat-topped, purple or reddish bumps',
      'Fine white lines on the surface of the bumps',
      'Itching',
      'Lacy white patches inside the mouth',
    ],
    riskFactors: ['Middle age', 'Hepatitis C infection', 'Some medicines', 'Dental metals or allergens'],
    nextSteps: [
      'See a doctor or dermatologist to confirm the diagnosis',
      'Ask about creams to reduce itching and inflammation',
      'Have mouth sores checked regularly by a dentist or doctor',
    ],
  },
  {
    slug: 'lupus',
    name: 'Lupus (Skin)',
    modelClass: 'Lupus',
    alsoKnownAs: ['Cutaneous lupus', 'Discoid lupus', 'Butterfly rash'],
    severity: 'high',
    isCancerous: false,
    summary:
      'An autoimmune disease that can cause skin rashes — such as a "butterfly" rash across the cheeks — and may also affect joints and internal organs.',
    description:
      'In lupus, the immune system attacks healthy tissue. Skin lupus can appear as a butterfly rash, scaly coin-shaped patches (discoid lupus) or rashes that worsen in sunlight. Because lupus can also affect the kidneys, heart and joints, it needs assessment by a doctor.',
    signs: [
      'Red "butterfly" rash across the cheeks and nose',
      'Scaly, coin-shaped patches that can scar',
      'Rash that flares after sun exposure',
      'Tiredness, joint pain or fever alongside the rash',
    ],
    riskFactors: ['Women aged 15–45', 'Family history of autoimmune disease', 'Sunlight', 'Certain medicines'],
    nextSteps: [
      'See a doctor soon — blood tests can check for lupus',
      'Protect your skin from the sun',
      'Seek care quickly for chest pain, swelling or very dark urine',
    ],
  },
  {
    slug: 'bullous-disease',
    name: 'Bullous Disease',
    modelClass: 'Bullous',
    alsoKnownAs: ['Bullous pemphigoid', 'Pemphigus', 'Blistering skin disease'],
    severity: 'high',
    isCancerous: false,
    summary:
      'A group of conditions that cause large, fluid-filled blisters on the skin, often due to the immune system attacking the skin.',
    description:
      'Bullous diseases include bullous pemphigoid (more common in older adults) and pemphigus (which can also affect the mouth). Blisters can break and become infected. These conditions need diagnosis and treatment by a dermatologist.',
    signs: [
      'Large, tense or fragile fluid-filled blisters',
      'Itchy red patches before blisters appear',
      'Raw, painful areas where blisters burst',
      'Blisters or sores in the mouth',
    ],
    riskFactors: ['Age over 60', 'Some medicines', 'Other autoimmune conditions'],
    nextSteps: [
      'See a dermatologist promptly',
      'Do not pop blisters; keep them clean and covered',
      'Seek urgent care for widespread blistering, fever or mouth sores that stop you eating',
    ],
  },
  {
    slug: 'drug-eruption',
    name: 'Drug Eruption',
    modelClass: 'DrugEruption',
    alsoKnownAs: ['Drug rash', 'Drug reaction'],
    severity: 'high',
    isCancerous: false,
    summary:
      'A skin rash caused by a reaction to a medicine. Most are mild, but some drug reactions can be serious emergencies.',
    description:
      'Drug eruptions usually start days to weeks after beginning a new medicine, such as antibiotics, anti-seizure drugs or painkillers. Most are widespread red, blotchy rashes that fade after stopping the medicine. Rare severe reactions cause blistering, peeling skin and mouth sores and need emergency care.',
    signs: [
      'Widespread red, blotchy or bumpy rash',
      'Itching or hives',
      'Rash starting after a new medicine',
      'Warning signs: blisters, peeling skin, mouth or eye sores, fever',
    ],
    riskFactors: ['Starting a new medicine', 'Previous drug allergies', 'Taking several medicines', 'Viral infections'],
    nextSteps: [
      'Contact the doctor who prescribed your medicine before stopping it',
      'Go to emergency care immediately for blisters, peeling skin, mouth sores, fever or swelling',
      'Keep a record of the medicine so you can avoid it in future',
    ],
  },
  {
    slug: 'vasculitis',
    name: 'Vasculitis',
    modelClass: 'Vasculitis',
    alsoKnownAs: ['Cutaneous vasculitis', 'Palpable purpura'],
    severity: 'high',
    isCancerous: false,
    summary:
      'Inflammation of blood vessels that can cause red or purple spots on the skin, most often on the lower legs, and sometimes affects internal organs.',
    description:
      'Vasculitis happens when the immune system inflames blood vessel walls. On the skin it often appears as raised purple spots that do not fade when pressed. It can be triggered by infections or medicines, or be part of a wider illness, so it should be assessed by a doctor.',
    signs: [
      'Raised red or purple spots that do not fade when pressed',
      'Mostly on the lower legs',
      'Hives, ulcers or painful lumps',
      'Fever, joint pain or tummy pain alongside the rash',
    ],
    riskFactors: ['Recent infections', 'Certain medicines', 'Autoimmune diseases'],
    nextSteps: [
      'See a doctor soon — tests may be needed',
      'Rest and raise the legs if they are affected',
      'Seek urgent care for blood in urine, tummy pain, or a rash with fever',
    ],
  },
];

export function getConditionBySlug(slug: string) {
  return CONDITIONS.find((c) => c.slug === slug);
}

// Maps a class name returned by the AI model to a condition
export function getConditionByModelClass(modelClass: string) {
  return CONDITIONS.find((c) => c.modelClass === modelClass);
}

// Human-friendly label for any model class, including the "normal" class
export function modelClassLabel(modelClass: string) {
  if (modelClass === NORMAL_CLASS) return 'Healthy skin / not recognised';
  return getConditionByModelClass(modelClass)?.name ?? modelClass.replace(/_/g, ' ');
}
