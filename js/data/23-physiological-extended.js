const PH=s=>s.trim().split('\n').forEach(l=>{const[a,n,sub,o,ov,sy,tx,ww,age]=l.split('|');D.push({id:a,n,alt:'',sys:'Physiological',org:o.split(',')[0],sens:'General',ov,et:[],rf:[],sy:sy.split(';'),sg:[],inv:[],dx:'',ddx:[],tx:tx.split(';'),cx:[],pg:'',rel:[],ev:{Overview:'Supported'},ref:[],lean:1,sub,ww,age:age?16:0});INV[a]=[o.split(','),[]];SV[a]=[0,'']});
PH(`erection|Penile Erection|Sexual Function|penis|Nerve and vessel driven engorgement of the penis during arousal and during REM sleep.|Penile firmness;Morning erections|No treatment needed|An erection lasting over 4 hours (priapism) is an emergency; persistent difficulty achieving erections (erectile dysfunction) is worth reviewing.|1
ejaculation|Ejaculation|Sexual Function|penis,testes|Reflex expulsion of semen at climax, mediated by sympathetic and somatic nerves.|Semen release;Pelvic muscle contractions|None needed|Blood in semen that persists, pain on ejaculation, or absent ejaculate should be reviewed.|1
wetdream|Nocturnal Emission (Wet Dreams)|Sexual Function|penis,testes|Involuntary ejaculation during sleep, common in adolescence.|Ejaculation in sleep;Often with dreams|Reassurance;Hygiene|Rarely concerning; see a doctor if there is pain, blood or burning.|1
femarousal|Female Sexual Arousal and Lubrication|Sexual Function|vagina|Increased pelvic blood flow causing vaginal lubrication, clitoral engorgement and uterine lift.|Lubrication;Genital swelling|None needed|Persistent pain, dryness or loss of arousal that affects life can be treated and should be reviewed.|1
orgasm|Orgasm|Sexual Function|brain|Peak of sexual response with rhythmic pelvic contractions and brain reward activation.|Pelvic muscle contractions;Pleasure|None needed|Inability to reach orgasm that causes distress is treatable; a sudden severe headache at orgasm needs urgent review.|1
puberty|Puberty|Puberty|pituitary,ovaries,testes|Hormonal maturation giving sexual development and growth, typically 8 to 13 years in girls and 9 to 14 in boys.|Breast or testicular enlargement;Pubic hair;Growth spurt|Reassurance;Nutrition and sleep|Signs before age 8 in girls or 9 in boys, or none by 13 in girls or 14 in boys, need assessment.|
thelarche|Thelarche (Breast Development)|Puberty|breast|Start of breast development in girls, usually the first pubertal sign.|Breast buds;Tenderness|Reassurance|Development before age 8, a hard lump or marked asymmetry, or none by 13 should be reviewed.|
pubarche|Pubarche (Pubic Hair)|Puberty|adrenal|Appearance of pubic hair from adrenal androgens.|Pubic and axillary hair;Body odour|Hygiene advice|Onset before age 8 (girls) or 9 (boys) should be assessed.|
voicebreak|Voice Change in Puberty|Puberty|throat|Laryngeal growth lowering the voice in boys.|Voice cracks;Deeper voice|None|Hoarseness lasting weeks, or voice change without other puberty signs, needs review.|
ovulation|Ovulation|Reproductive|ovaries|Release of an egg mid-cycle, about day 14 of a 28-day cycle.|Clear stretchy mucus;Mild one-sided ache|None|Absent ovulation (irregular cycles, infertility) or severe pain should be reviewed.|
implantbleed|Implantation Bleeding|Pregnancy|uterus|Light spotting about 6 to 12 days after conception.|Light spotting;Mild cramps|Reassurance|Heavy bleeding or pain in early pregnancy needs urgent assessment to exclude ectopic pregnancy or miscarriage.|
normalpreg|Normal Pregnancy|Pregnancy|uterus,breast|About 40 weeks of gestation with expected changes across many organs.|Missed period;Nausea;Breast tenderness|Antenatal care;Folic acid;Healthy lifestyle|Heavy bleeding, severe headache, visual change, reduced fetal movements, fluid leak or fever need same-day care.|
normallabour|Normal Labour|Pregnancy|uterus|Regular contractions with cervical dilatation, then birth of the baby and placenta.|Regular contractions;Show;Waters breaking|Pain relief;Skilled birth attendant|Heavy bleeding, green fluid, reduced movements, fever, or very long labour need medical review.|
colostrum|Colostrum|Pregnancy|breast|Antibody-rich first milk produced late in pregnancy and the first days after birth.|Yellow thick milk|Feed on demand|Breast redness, fever or severe pain suggests mastitis.|
mororeflex|Moro (Startle) Reflex|Newborn|brain|Newborn reflex of arm extension then flexion to sudden movement; fades by 4 to 6 months.|Arms flung out;Cry|None|Absent or asymmetric reflex in a newborn, or persistence beyond 6 months, should be assessed.|
micturition|Micturition (Urination)|Renal|bladder|Coordinated bladder emptying, typically 4 to 8 times a day.|Urge to void|Hydration|Pain, blood in urine, inability to pass urine, or sudden frequency change needs review.|
defecation|Defecation Reflex|Digestive|rectum|Rectal stretch relaxes the anal sphincter; normal frequency ranges from 3 times a day to 3 times a week.|Urge to defecate|Fibre and fluids|Blood, black stools, persistent habit change, or weight loss needs review.|
flatulence|Flatulence|Digestive|colon|Passage of gas, typically 10 to 20 times a day.|Wind;Bloating|Dietary adjustment|Persistent bloating with weight loss, bleeding or pain needs assessment.|
belching|Belching|Digestive|stomach|Release of swallowed air from the stomach.|Gas release|None|Persistent belching with pain, vomiting or weight loss needs review.|
swallowing|Swallowing Reflex|Digestive|esophagus,throat|Coordinated reflex moving food from mouth to stomach.|Normal swallowing|None|Choking, pain, food sticking or weight loss (dysphagia) needs assessment.|
coughreflex|Cough Reflex|Respiratory|trachea|Protective reflex that clears the airway.|Occasional cough|None|Cough over 3 weeks, coughing blood or breathlessness needs evaluation.|
vomitreflex|Vomiting Reflex|Digestive|stomach|Protective response expelling toxins, coordinated by the brainstem.|Nausea;Salivation|Fluids|Blood, persistent vomiting, severe pain or dehydration needs medical care.|
shivering|Shivering|Thermoregulation|muscle|Involuntary muscle contractions generating heat.|Shaking;Goosebumps|Warmth|Shivering with fever and confusion, or in someone drowsy and cold, needs urgent help.|
sweating|Sweating|Thermoregulation|skin|Eccrine sweat evaporation cools the body.|Moist skin|Hydration|Drenching night sweats, weight loss, or no sweating in heat (heatstroke) needs review.|
thirst|Thirst|Thermoregulation|brain|Drive to drink triggered by rising blood osmolality.|Dry mouth|Drink fluids|Extreme thirst with frequent urination may indicate diabetes.|
hunger|Hunger and Satiety|Digestive|stomach|Ghrelin and leptin signalling control meal timing.|Stomach growl|Regular meals|Constant hunger with weight loss, or loss of appetite, needs review.|
sleepcycle|Normal Sleep Cycle|Sleep|brain|About 90-minute cycles of NREM and REM sleep; adults need 7 to 9 hours.|Sleep|Sleep hygiene|Loud snoring with pauses, excessive daytime sleepiness, or insomnia over 3 weeks should be reviewed.|
dreaming|Dreaming|Sleep|brain|Vivid mental imagery mostly during REM sleep.|Dreams|None|Acting out dreams, frequent night terrors or distressing nightmares need assessment.|
snoringocc|Occasional Snoring|Sleep|throat|Vibration of relaxed throat tissue during sleep.|Snoring|Side sleeping|Loud snoring with witnessed apnoeas or daytime sleepiness suggests sleep apnoea.|
crying|Emotional Crying|Reflexes And Senses|eyes|Tear production linked to emotion.|Tears|None|Persistent uncontrollable crying or low mood may reflect depression.|
blushing|Blushing|Reflexes And Senses|skin|Facial vasodilation from emotion.|Facial flushing|None|Flushing with diarrhoea or wheeze, or distressing fear of blushing, merits assessment.|
laughter|Laughter|Reflexes And Senses|brain|Neural reflex with positive social effects.|Laughter|None|Uncontrolled laughing or crying without trigger (pseudobulbar affect) needs review.|
startle|Startle Reflex|Reflexes And Senses|brain|Rapid protective response to sudden stimuli.|Jump;Blink|None|Exaggerated startle after trauma may reflect post-traumatic stress disorder.|
headrush|Head Rush (Postural Light-headedness)|Cardiorespiratory|heart|Brief dizziness on standing from a transient blood pressure drop.|Dizzy on standing|Rise slowly;Hydrate|Fainting, falls, or a persistent drop over 20 mmHg systolic needs review.|
bodyodour|Body Odour|Reflexes And Senses|skin|Bacterial breakdown of apocrine sweat after puberty.|Odour|Hygiene|A sudden change, or a fruity or ammonia smell, can signal illness.|
pupillary|Pupillary Light Reflex|Reflexes And Senses|eyes|Pupil constriction to light protects the retina.|Constriction|None|Unequal or fixed pupils after head injury or with severe headache are emergencies.|`);
A16('erection','ejaculation','wetdream','femarousal','orgasm');
`dysmenorrhoea|Pain that stops normal activity, starts suddenly after years of painless periods, or comes with heavy bleeding may indicate endometriosis or adenomyosis.
pms|Severe mood symptoms, thoughts of self-harm or marked impairment suggest premenstrual dysphoric disorder.
mittelschmerz|Severe, persistent or one-sided pain with fever or bleeding should be assessed for cyst rupture, torsion or ectopic pregnancy.
menarche|No periods by age 15, or 3 years after breast development, needs review.
menstruation|Soaking a pad hourly, periods over 7 days, bleeding between periods or after sex, or no period for 3 months (not pregnant) need review.
menopause|Bleeding after menopause, severe symptoms, or menopause before age 40 needs assessment.
hotflush|Flushes before age 45, with weight loss, or with palpitations should be checked for other causes.
vagdischarge|Green or foul discharge, itching, pain or bleeding suggests infection.
lochia|Heavy bleeding, large clots, foul smell, fever or pain needs urgent review.
lactation|A hard, painful, red breast with fever suggests mastitis.
morningsick|Unable to keep fluids down, weight loss or dizziness suggests hyperemesis gravidarum.
braxton|Regular painful contractions before 37 weeks, fluid leak or bleeding needs urgent assessment.
anaemiapreg|Marked fatigue, breathlessness or haemoglobin below 110 g/L needs iron assessment.
pregback|Severe pain, fever, urinary symptoms or leg weakness needs review.
babyblues|Low mood beyond 2 weeks, thoughts of harming yourself or the baby, or inability to cope suggests postnatal depression or psychosis.
striae|Rarely concerning; see a doctor if widespread purple striae come with other signs of Cushing syndrome.
pregheartburn|Severe upper abdominal pain, headache or visual disturbance may indicate pre-eclampsia.
neonatalwt|Loss over 10% of birth weight, or no regain by 2 weeks, needs feeding assessment.
milia|A pustular, spreading or blistering rash with fever needs review.
mongolian|Spots that appear later, are extensive, or come with other findings may need evaluation.
teething|High fever, diarrhoea or severe distress is not explained by teething.
growingpains|Joint swelling, limp, fever, morning stiffness or daytime pain suggests another cause.
gynecoNB|Hard, rapidly growing, asymmetric or painful breast tissue needs assessment.
adrenarche|Marked signs before age 8, or rapid virilisation, need evaluation.
innocentmurmur|A murmur with breathlessness, fainting, chest pain or poor feeding needs echocardiography.
sinusarrhythmia|Palpitations with dizziness or fainting need an ECG.
athleteheart|Fainting or chest pain on exertion, or a family history of sudden death, needs cardiology screening.
s2split|Fixed splitting or associated murmurs suggest a heart defect.
hiccups|Hiccups lasting over 48 hours need review.
yawning|Excessive yawning with chest pain, or in someone with heart or brain disease, can be a warning sign.
sneezing|Sneezing with fever, facial pain or persistent blocked nose may signal infection or allergy.
goosebumps|Persistent goosebumps with tremor and fever suggest illness.
sleepparalysis|Frequent episodes with sudden daytime sleep attacks suggest narcolepsy.
hypnicjerk|Frequent jerks that disturb sleep, or occur with other movements, merit sleep review.
jetlag|Symptoms beyond 2 weeks or severe insomnia need review.
motionsick|Persistent dizziness without motion, hearing loss or neurological signs needs assessment.
sleepinertia|Prolonged confusion or dangerous automatic behaviour may indicate a sleep disorder.
postprandial|Overwhelming daytime sleepiness or sleep attacks suggest narcolepsy or sleep apnoea.
doms|Severe pain, swelling or dark urine after exertion suggests rhabdomyolysis.
physiotremor|Tremor at rest, worsening or asymmetric tremor suggests a neurological cause; sudden onset with heat intolerance suggests thyroid disease.
exleuk|Persistently raised white cells at rest need review.
altitudeacc|Severe headache, confusion, breathlessness at rest or cough with pink sputum requires immediate descent.
presbyopia|Sudden vision loss, flashes or floaters need urgent eye review.
presbycusis|Sudden or one-sided hearing loss needs urgent assessment.
greyhair|Very early greying with fatigue or other symptoms may reflect thyroid or B12 problems.
senileskin|New or changing lesions, non-healing ulcers or bleeding spots need skin cancer review.
fever|Fever over 40 C, in infants under 3 months, or with stiff neck, rash or confusion needs urgent care.
orthoprot|Persistent daytime proteinuria or swelling needs kidney evaluation.`.split('\n').forEach(l=>{const i=l.indexOf('|'),x=get(l.slice(0,i));if(x)x.ww=l.slice(i+1)});
