/* ============================================================
   north star — plan content (edit freely; the app code lives in app.js)
   ============================================================ */
const HOUSES=[['winedark','Winedark',350,42],['clairmont','Clairmont',270,34],['rosewood','Rosewood',330,34],['ashford','Ashford',230,38],['witwick','Witwick',150,32],['harelane','Harelane',180,34],['commonwell','Commonwell',30,38]];

const MANTRAS=[
 "No worries, I have a back-up plan. I have resources for this.",
 "I do one uncomfortable thing today.",
 "I do not over-explain myself.",
 "Nothing waits more than three days.",
 "I am here to break curses.",
 "I let go of childhood fears. I am a secure, empowered adult in charge of my own life.",
 "I am here to be happy and joyful.",
 "Shame does not drive. I do.",
 "I widen the surface area of my life so luck can find me.",
 "A candle day is still a day I showed up.",
 "Small, then smaller, then started.",
 "Own your weird.",
 "I am a maker of meaning.",
 "Proceed and be bold."
];

const MUSES=[
 ["Joan of Arc","fierce, unembarrassed bravery","Make the call you’ve been dreading. Stand up while you do it."],
 ["Donna Tartt","curated, intellectual elegance","Make one thing deliberate today (your desk, your outfit, your reading list) and remove one thing that’s just noise."],
 ["Alice Cullen","vivacity and charm","Be warm first: greet someone, send one kind text, compliment a stranger."],
 ["Baba Yaga / Circe","strength and wisdom through craft","Treat one unglamorous task like a spell: slow, exact, done well. Cook, clean one surface, set one boundary."],
 ["Villanelle","audacity and independence","Do one bold, harmless thing that’s out of pattern. Say a clean no."],
 ["Henry Winter","intelligence and a respected presence","Twenty focused minutes of real study (the manual, the résumé). Speak a little slower today."],
 ["Anthony Bourdain","curiosity and hunger for the world","Try something new to eat. Ask a real question. Say yes to one small adventure."],
 ["Charli XCX (post-brat)","dark, sensual, unbothered","Play one song loud and walk like it’s yours. Make something raw and show nobody."],
 ["Alexa Chung","effortless it-person style","Get dressed on purpose for a task at home. One-minute outfit: black base, one jewel tone, one warm metal."],
 ["Holly Black","faerie logic and the craft of story","Write 200 words of anything with fairy-tale rules."],
 ["Fiona Apple","unflinching honesty","Write the true sentence in your journal. Don’t soften it."],
 ["David Bowie","reinvention","Change one visible thing: your part, a playlist, a lipstick, the order of your morning."],
 ["Anaïs Nin","the diary as a life","Ten honest lines at night. No editing."],
 ["Eliot Waugh / Julia Wicker","wit plus relentless study","Do the hard study first. Make one joke at your own expense that is kind."],
 ["Parisa Kamali","strategic charisma","Plan three moves ahead on one task. Write them down."]
];

/* g = time of day group; t = tier (0 candle, 1 lantern, 2 bonfire) */
const RIT=[
 {id:'water',g:'morning',t:0,l:"Something warm in a cup you love",s:"Matcha, coffee, tisane. The first sip counts."},
 {id:'wash',g:'morning',t:0,l:"Wash up",s:"Teeth + face, or a shower if you can."},
 {id:'stretch',g:'morning',t:0,l:"Five minutes of floor stretching or yoga",s:"On the floor counts. Lying down counts."},
 {id:'tiny',g:'morning',t:0,l:"One two-minute task",s:"Open the HUSKY page. Fill one line. Done is done."},
 {id:'yoga',g:'morning',t:2,l:"Full yoga flow (15–20 minutes)",s:"Free on YouTube."},
 {id:'walk',g:'day',t:1,l:"A walk, any length",s:"Hallway laps count on bad-weather days."},
 {id:'eat',g:'day',t:1,l:"Produce + protein at your meals",s:"Add before you subtract. Cheese and sushi stay."},
 {id:'mover',g:'day',t:1,l:"One needle-mover (car, job, or health)",s:"See this month’s three."},
 {id:'uncomf',g:'day',t:1,l:"One uncomfortable thing",s:"A call, an email, a stare at the thing you’ve been avoiding."},
 {id:'lift',g:'day',t:2,l:"Strength session",s:"2–3 times a week is plenty. Today if it’s a lift day."},
 {id:'social',g:'day',t:2,l:"Reach out to one human",s:"A text counts. Friendship is built in small deposits."},
 {id:'read',g:'evening',t:1,l:"Ten pages: fiction or nonfiction",s:"One of each is the long-term shape."},
 {id:'write',g:'evening',t:2,l:"Make something (15 minutes)",s:"Fiction, a thinkpiece, a video-essay outline, a play-by-post reply."},
 {id:'bed',g:'evening',t:0,l:"Lights down, phone away, skin ritual",s:"The night ritual is part of the plan, not a reward for it."}
];
const GROUPS=[['morning','Morning','Start small. Warm cup first.'],['day','Daytime','The needle-movers live here.'],['evening','Evening','Wind down on purpose.']];
const TIERS=[["candle","Candle","Floor day. Low battery, high pain, high fog. Five things. This counts fully."],["lantern","Lantern","A normal day. Core rituals plus one needle-mover."],["bonfire","Bonfire","Good-energy day. Do the extra, bank the momentum, don’t borrow from tomorrow."]];

const QUARTERS=[
 ["Q1","Jan – Mar","Unlock","Insurance active, permit passed, résumé out, therapy started, habits taking root. Target: −17 lbs."],
 ["Q2","Apr – Jun","Momentum","Road test passed, license in hand, job offer. Target: −38 lbs."],
 ["Q3","Jul – Sep","Wheels","Car bought, first paychecks becoming savings. Target: −59 lbs."],
 ["Q4","Oct – Dec","Harvest","Consolidate everything; build 2028’s foundation. Target: −80 lbs and a real runway."]
];

/* gentle daily step targets by month (editable in Settings) */
const STEP_GOALS={"2026-11":3000,"2026-12":4000,"2027-01":5000,"2027-02":5500,"2027-03":6500,"2027-04":7500,"2027-05":8000,"2027-06":9000,"2027-07":9000,"2027-08":10000,"2027-09":10000,"2027-10":10000,"2027-11":10000,"2027-12":10000};

/* ============================================================
   CYCLE PHASES + daily lifestyle tips
   ============================================================ */
const PHASES={
 menstrual:{name:"Menstrual",hue:350,blurb:"Rest and restore. Energy tends to run lower; be gentle, not absent.",
  tips:[
   "Keep the plan at candle size if you need to. A candle day still counts fully.",
   "Warm, iron-friendly foods are kind right now: lentils, beans, dark leafy greens, red meat if you eat it, with something vitamin-C-rich alongside.",
   "Heat helps: a warm bath, a heating pad, a hot tea. Choose slow movement: stretching, yoga, an easy walk.",
   "Go easy on big decisions and hard conversations if you can. Journal first, decide later.",
   "Hydrate on purpose and protect your sleep window tonight.",
   "Do the lowest-effort version of every ritual. Done small is done."]},
 follicular:{name:"Follicular",hue:150,blurb:"Rising energy. A great window to start things, learn, and apply.",
  tips:[
   "Energy tends to climb. Put the hardest task of the week here: applications, the manual, the résumé.",
   "Good week to try a new workout, a new route, or a new recipe.",
   "Fresh, light foods feel good: fruit, big salads, sprouts, eggs, fermented foods. Add produce before you subtract anything.",
   "Great time for brainstorming and starting projects. Open the blank page.",
   "Make the call or send the networking message. Initiative comes easier now.",
   "Add a little progression to strength work: one more rep or a slower tempo."]},
 ovulatory:{name:"Ovulatory",hue:40,blurb:"Peak social and verbal energy for many people. Use it to be seen.",
  tips:[
   "Many people feel most social and articulate now. Schedule interviews, calls, and conversations you’ve been dreading.",
   "Higher-intensity movement often feels good: a brisk walk, a lift day, a dance break.",
   "Eat a rainbow: raw veg, berries, quinoa, healthy fats. Plenty of water.",
   "Say yes to the invitation. Reach out to one human today.",
   "Pitch the idea, ask for the thing, speak first in the meeting.",
   "Record the video, read aloud, record a voice memo. Your voice carries."]},
 luteal:{name:"Luteal",hue:270,blurb:"Turning inward. Detail work and routines are strong; cravings and low mood can show up late in this phase.",
  tips:[
   "Good for detail work: editing, organizing, admin, finishing what’s already started.",
   "Steady meals help: complex carbs, protein, magnesium-rich foods (pumpkin seeds, dark chocolate, leafy greens). Cravings are information, not failure. The 10% is allowed.",
   "Moderate movement tends to feel best: pilates, yoga, a long walk, lighter lifting.",
   "If anxiety or mood dips, shrink the day: candle size, early bed, fewer commitments.",
   "Protect sleep: lights down earlier, caffeine earlier, phone away.",
   "Late-phase irritability is real. Do one thing that soothes: warm shower, a book, a candle, a good dinner.",
   "Wind down the week’s loose ends so the next phase starts clean."]}
};
const CYCLE_NOTE="Phases are estimated from the dates you log, using your usual cycle length. Bodies vary: if cycles are very irregular, very painful, or heavy, bring your log to a doctor. This is a planner, not medical advice.";

/* ============================================================
   MONTH-BY-MONTH PLAN
   ============================================================ */
const M=[
{id:"2026-11",lbl:"November 2026",ph:"Runway",gh:"embers",lost:0,
 line:"Open the doors you’ve been told are locked.",
 f:["Baseline only: one weigh-in, one 10-minute walk after a meal.","Read the CT Driver’s Manual (one chapter a week); start the free Work Zone Safety course.","Reapply to HUSKY and track down the tax paperwork behind the lapse."],
 sec:{
  "Body":["No dieting yet. Your only job is to collect a baseline: one weigh-in (write it down, no verdict) and, if it feels okay, one waist measurement.","Walk 10 minutes after your biggest meal. Tiny and repeatable. A hallway counts.","Swap one sugary drink a day for tea, matcha, or sparkling water. Cheese and sushi stay.","Pick your “fun drink” ritual: the thing you make every morning that feels like a small ceremony."],
  "Car":["Save the CT DMV Driver’s Manual (free PDF at ct.gov/dmv) on your phone. One chapter a week, ten minutes at a time.","Take the free online Connecticut Work Zone Safety Course. It’s required for the permit and costs nothing.","Take one practice permit test just to see the format. The score doesn’t matter yet."],
  "Job & benefits":["Reapply for HUSKY Health at accesshealthct.com or by phone at 1-855-805-4325. Applications are accepted year-round. Do this first, this week.","Find last year’s income forms from your gig company (tax documents / 1099). Missing tax paperwork is what caused the lapse, so this is the root fix.","Write your “what I actually do” list: every task in your AI gig, in plain verbs. It becomes the résumé in December."],
  "Money":["Write down every dollar in and out for 30 days (use the Plan → Tracks page). Information, not judgment.","Name your first bucket: Permit, $59 total. Every gig payment tops it up first.","Look up IRS VITA sites near you: free tax-filing help for lower incomes."],
  "Mind":["Use the three-light system on the Today page. Pick your light honestly each morning.","Read your “why” statements on the Plan → Map page once a week.","Choose one kind sentence to say when shame shows up (the Toolkit has scripts)."],
  "Joy":["Weekly movie night, with no productivity attached.","Get a library card and install Libby: free books and audiobooks.","Adventure: walk somewhere you’ve never walked, with a tea in hand."]},
 rw:["$0: long bath, candle, a full album start to finish","~$5: a fancy matcha or loose-leaf tea you’ve been eyeing"],
 fic:"The Night Circus — Erin Morgenstern",non:"Tiny Habits — BJ Fogg",film:"Practical Magic",
 ms:["HUSKY application submitted","Tax / income documents located","Library card + Libby set up","Work Zone Safety course started","Baseline weigh-in logged","Used the Today page on 10+ days"],
 slip:"If November slides: do only the HUSKY application. Nothing else matters this month."},

{id:"2026-12",lbl:"December 2026",ph:"Runway",gh:"candlelight",lost:0,
 line:"Build the floor you’ll stand on in January.",
 f:["Walk 10–15 minutes most days; weigh in Dec 28 for your real baseline.","Finish the Work Zone course, pass practice tests, save the $59.","Résumé v1 and LinkedIn live; first quiet applications."],
 sec:{
  "Body":["Walk 10–15 minutes most days. If energy is low, split it into two 5s.","Add one produce serving to two meals a day (fruit, frozen veg, a salad kit).","Pick a lights-down time and protect it five nights a week. Low energy often starts with sleep.","Yoga: 5 minutes of floor stretching in the morning. YouTube is free."],
  "Car":["Finish the Work Zone Safety course and save the confirmation.","Take a practice permit test twice a week until you’re scoring 22+/25 (the real one needs 20 of 25).","Book the DMV hub appointment for mid-to-late January. Permit tests are by appointment only.","Gather: state ID, SS card, proof of residency (mail or a bank statement), and $59."],
  "Job & benefits":["Check the HUSKY decision; answer any document request within 48 hours.","Résumé v1, one page. Gig work counts: describe it accurately (for example “AI data evaluation, contract”) and quantify what you can.","Make or refresh your LinkedIn.","Build a target list: remote or hybrid roles in AI data quality, content operations, customer support, admin/ops, editorial support, plus CT state jobs."],
  "Money":["Permit bucket funded ($59).","Start the License bucket ($84).","Check one chapter of Your Money or Your Life out of the library."],
  "Mind":["Once HUSKY is active, book a primary care visit. Ask about sleep and energy, and what labs make sense (low energy has many causes).","Start looking for a trauma-informed therapist who takes HUSKY. The CT Behavioral Health Partnership (ctbhp.com) can help you find providers.","Winter solstice ritual: write what you’re leaving behind, then tear or burn it."],
  "Joy":["Adventure: a solstice night walk or a thrift browse (free).","Year-end ritual: list five tiny wins from 2026. There are more than five.","Movie night: something cozy-dark."]},
 rw:["$0: a guilt-free day off after the new-year planning","~$5–10: a book from the thrift store"],
 fic:"Piranesi — Susanna Clarke",non:"The Gifts of Imperfection — Brené Brown",film:"Amélie",
 ms:["HUSKY active (or appeal / reapply in motion)","Résumé v1 + LinkedIn done","Permit appointment booked","$59 permit bucket funded","Baseline weight logged","PCP / therapy search started"],
 slip:"If December slides: protect three things only: HUSKY, the $59, and the appointment."},

{id:"2027-01",lbl:"January 2027",ph:"Unlock",gh:"begin",lost:5,
 line:"You don’t need a new you. You need a first week.",
 f:["Walk 20 minutes most days; strength twice a week (bodyweight).","Pass the permit test; log your first driving hours.","3 applications a week; first therapy intake."],
 sec:{
  "Body":["Walk 20 minutes most days. Consistency beats speed.","Strength twice a week, 15 minutes: sit-to-stands, counter push-ups, glute bridges, bird-dogs. Free beginner routines are plenty.","Add before you subtract: produce at every meal, a protein anchor at breakfast, fruit where you can see it. The 90/10 rule: 90% whole foods, 10% whatever you want.","Weigh in weekly (same day, same time, one number). The trend matters, not the day."],
  "Car":["Take the permit test at a DMV hub (by appointment). Vision test plus 25 questions; 20 correct to pass. Budget $59 total.","The permit must be held at least 90 days before the road test. Count forward on a calendar. Write your earliest road-test date on the Tracks page.","Practice with a qualified trainer: age 20+, licensed 4+ years with no suspensions. Start in an empty parking lot."],
  "Job & benefits":["Three tailored applications a week. Make a template so each takes ~15 minutes.","Set two job alerts (Indeed, LinkedIn, the CT state jobs portal).","Treat the AI gig as a bridge: log your hours, and ask whether longer contracts or full-time roles exist."],
  "Money":["License bucket: $84. The permit is paid; this is next.","If you’re owed a tax refund, file early (VITA is free)."],
  "Mind":["Book the first therapy intake. Telehealth counts.","Complete the primary care visit (bring the Toolkit’s question list).","Three-line journal on the Today page, daily."],
  "Joy":["Adventure: a free library event or a free-admission museum day.","Keep movie night sacred."]},
 rw:["$0: a full day of reading in bed, phone away","~$10: a thrift-store velvet or silk scarf in your palette"],
 fic:"The Cruel Prince — Holly Black",non:"Atomic Habits — James Clear",film:"The Holdovers",
 ms:["Permit passed","First 5 driving practice hours logged","12 applications sent","Therapy intake booked or done","PCP visit done","Weekly weigh-ins logged 3+ times"],
 slip:"If January slides: restart on the next Monday. Do the permit test and 3 applications this week, nothing else."},

{id:"2027-02",lbl:"February 2027",ph:"Unlock",gh:"hearth",lost:10,
 line:"Keep the fire small and steady.",
 f:["25–30 minute walks; add a second strength move each week.","Driving practice twice a week.","5 applications a week plus 2 networking messages."],
 sec:{
  "Body":["Walks to 25–30 minutes. Tack on one 10-minute walk after dinner if it’s feasible.","Strength twice a week with a little progression (one more rep, one slower tempo).","Meal anchor: a simple go-to breakfast and a go-to lunch so you’re not deciding at 2 p.m.","Dark-chocolate square after dinner is allowed. It’s part of the 10%."],
  "Car":["Drive with your trainer twice a week, 30 minutes. Quiet roads first, then busier ones.","Keep a driving log (date, minutes, what you practiced). It also builds confidence."],
  "Job & benefits":["Five applications a week.","Send two networking messages a week: a former coworker, a gig-platform contact, someone in a role you want.","Practice answers aloud to three questions: tell me about yourself; a time you solved a problem; why this role."],
  "Money":["Keep the License bucket going until $84.","Start tracking the Car Fund (set a placeholder goal on the Tracks page; you’ll refine it in June)."],
  "Mind":["Weekly therapy if you can. Start with whatever feels safest: the present-day plan, not the deepest wound.","Practice the Shame Loop Breaker from the Toolkit at least three times."],
  "Joy":["Adventure: a gallery, a bookstore wander, or a candlelit tea at home.","Reach out to one person you’d like in your village."]},
 rw:["$0: a living-room dance-and-shower night","~$8: a plant or a candle for your space"],
 fic:"Circe — Madeline Miller",non:"Complex PTSD: From Surviving to Thriving — Pete Walker (read slowly; pause if it stirs things up)",film:"Portrait of a Lady on Fire",
 ms:["Weight −10 lbs (or on trend)","10+ driving hours logged","20 applications total","First interview scheduled or two networking replies","Therapy ongoing (4 sessions)"],
 slip:"If February slides: do 10-minute walks and applications on Tue/Thu only. Keep the trainer drives."},

{id:"2027-03",lbl:"March 2027",ph:"Unlock",gh:"thaw",lost:17,
 line:"Everything frozen starts to move.",
 f:["Build toward 6–7k steps most days.","Practice highways and parking with your trainer.","Interviews. Sign up with temp agencies as Plan B."],
 sec:{
  "Body":["Steps: build toward 6–7k most days. Park farther, pace on calls.","Strength twice a week, adding a hinge (hip-hinge with a backpack of books) and a row (a bag or band).","Cook one new plant-forward recipe a week. Salt, fat, acid, heat.","Yoga 10 minutes at least 4 mornings."],
  "Car":["Parking (parallel, angled), merging, left turns. Practice each three times.","Take a free CT practice test or two again. The road test also asks vehicle-handling questions."],
  "Job & benefits":["Chase interviews: follow up within 48 hours on every application that’s gone quiet.","Create profiles with 2–3 temp or staffing agencies so there’s a Plan B paycheck.","Ask for informational calls: 15 minutes with someone doing a job you want."],
  "Money":["If you’re filing taxes, do it now.","Open a savings account if you don’t have one (credit unions often have low-fee options)."],
  "Mind":["Spring equinox ritual: plant something. Seeds, a cutting, anything.","Check in with a doctor on whether energy has improved and what to adjust."],
  "Joy":["Adventure: a first forest walk of the year. Study foraging from books and photos only; never eat anything you haven’t verified with an expert.","Movie night plus a handwritten postcard to someone."]},
 rw:["$0: a bookstore afternoon without buying","~$15: something beautiful for your car-to-be (a mini air freshener, a cozy keychain)"],
 fic:"Uprooted — Naomi Novik",non:"Four Thousand Weeks — Oliver Burkeman",film:"Spirited Away",
 ms:["Weight −17 lbs (or on trend)","Parked and merged confidently","4+ interviews or screening calls","Temp agency profiles live","Taxes filed"],
 slip:"If March slides: remember the Q1 win condition is insurance, permit, résumé, therapy. Everything else is a bonus."},

{id:"2027-04",lbl:"April 2027",ph:"Momentum",gh:"motion",lost:24,
 line:"The permit clock runs out. The road opens.",
 f:["7–8k steps; strength twice a week with progression.","Book the road test the moment 90 days are up.","Go for an offer: interview prep, follow-ups, negotiation."],
 sec:{
  "Body":["Steps toward 7–8k. Longer walks on weekends.","Strength twice a week, adding weight or reps.","Try one new vegetable a week. Keep sushi night."],
  "Car":["Your earliest road-test date is permit date + 90 days. Book it through the DMV online appointment system.","Optional but wise: 1–2 lessons with a licensed driving school before the test. The vehicle must be registered, insured, and safe, which is hard to arrange without a car; ask your instructor whether theirs can be used.","Review the road-test checklist: mirrors, signals, full stops, parking."],
  "Job & benefits":["Interview prep: three stories using the “situation, action, result” frame.","Negotiate: ask about benefits start date, health insurance cost, remote flexibility, and PTO before accepting.","Keep applying until you have a signed offer."],
  "Money":["License bucket: $84 ready.","Once you have income, set up an automatic transfer to the Car Fund, even $10 a week."],
  "Mind":["Pick one muse of the month (see Plan → Atelier) and channel her once a week.","Anxiety plan for the test: write a pre-test routine."],
  "Joy":["Adventure: a hike or a long forest walk.","Farmers market or flea market trip when the season opens."]},
 rw:["$0: a night of your favorite dark-academia film marathon","~$10: a flower bundle for your table"],
 fic:"The Secret History — Donna Tartt",non:"Designing Your Life — Bill Burnett & Dave Evans",film:"Crimson Peak",
 ms:["Weight −24 lbs (or on trend)","Road test booked","Final-round interview or offer","Benefits questions asked in writing","Car Fund auto-transfer started"],
 slip:"If April slides: book the road test and do three applications. Those two moves keep the machine running."},

{id:"2027-05",lbl:"May 2027",ph:"Momentum",gh:"bloom",lost:31,
 line:"Every door you knocked on starts to open.",
 f:["8k steps; strength twice a week.","Pass the road test.","Sign an offer with benefits."],
 sec:{
  "Body":["Steps toward 8k. A weekend long walk of 45–60 minutes.","Strength twice a week; test a new move once a month.","Hydrate and eat before the road test. Stress plus an empty stomach is a recipe for jitters."],
  "Car":["Take the road test. If you fail, the retest fee is $40. It’s a data point, not a verdict.","License fee: $84. Bring everything the DMV lists.","Once licensed, get insurance quotes before shopping for a car: a family policy may be the cheapest path."],
  "Job & benefits":["Accept the offer in writing. Confirm start date, pay, schedule, benefits start.","Enroll in benefits on time (deadlines are short).","Quit nothing important yet: keep the gig until the new job’s first paycheck lands."],
  "Money":["Create the first real monthly budget with actual take-home pay.","Rule of thumb: pay buckets first (Car, Emergency), then spend."],
  "Mind":["Give yourself a day to feel proud. You did this.","Debrief with your therapist or journal about the wins and the fear."],
  "Joy":["Adventure: a day trip somewhere new (bus, train, or a friend).","Celebrate small: a candle dinner for one."]},
 rw:["$0: sunrise or sunset walk with a thermos","~$20: dinner out or sushi"],
 fic:"Rebecca — Daphne du Maurier",non:"I Will Teach You to Be Rich — Ramit Sethi",film:"Past Lives",
 ms:["Weight −31 lbs (or on trend)","Road test passed (or retest booked)","License issued","Offer accepted","Benefits enrolled"],
 slip:"If May slides: the only critical items are the road test and a job offer. Reschedule, don’t abandon."},

{id:"2027-06",lbl:"June 2027",ph:"Momentum",gh:"keys",lost:38,
 line:"Keys, paychecks, and a version of you that shows up.",
 f:["8–10k steps; strength 3× a week if energy allows.","First solo drive somewhere beautiful.","Start the job strong; automate savings."],
 sec:{
  "Body":["Steps toward 8–10k; strength 2–3 times a week.","Yoga 15 minutes most mornings. It’s now a habit, not a task.","Do a monthly measure check-in: waist, how clothes fit, how stairs feel."],
  "Car":["Drive solo to somewhere beautiful, with a playlist. Your first freedom drive.","Set a realistic Car Fund goal: car plus first-year insurance, registration, taxes, and a repair cushion. Update it on the Tracks page.","Buy yourself a bumper sticker for the future car. It’s a promise."],
  "Job & benefits":["Learn the job like you’re writing a field guide. Ask what “good” looks like at 30, 60, 90 days.","Do excellent work first. Efficiency comes from mastery, and then you can use your freed-up time well.","If the job isn’t landed by now, trigger Plan B: temp agency work, retail or warehouse with benefits, a CT state job application."],
  "Money":["Automate: 20% of take-home goes to savings the day you’re paid.","Pay any small debts first. Check your credit report free at annualcreditreport.com."],
  "Mind":["Re-read the “why” section on the Map page. Notice what changed.","Therapy or a skills group: keep the ground you’ve built."],
  "Joy":["Adventure: a solo day trip with a book and a tea.","Host a movie night with a friend or a family member."]},
 rw:["$0: a full day outside","~$15: a new tote or notebook in your palette"],
 fic:"Stardust — Neil Gaiman",non:"How to ADHD — Jessica McCabe",film:"Lady Bird",
 ms:["Weight −38 lbs (or on trend)","First solo drive","Started job or in final-stage Plan B","Savings auto-transfer running","Car Fund goal set realistically"],
 slip:"If June slides: reread your why, take a candle day, and restart with one tiny task."},

{id:"2027-07",lbl:"July 2027",ph:"Wheels",gh:"wander",lost:45,
 line:"Get ready to choose your car with eyes open.",
 f:["Steps 8–10k; lifts 3×/week.","Shop cars with a pre-approved budget and a mechanic.","First 60 days at work: reliability."],
 sec:{
  "Body":["Keep steps 8–10k and lifts 2–3×/week.","Summer food: fruit, grilled veggies, big salads. Keep the cheese.","Hydrate and protect your sleep window."],
  "Car":["Set a firm max price. Get pre-approved at a credit union before you walk into a dealership.","Look for a Kia Soul (or equal) with a clean history report. Always pay an independent mechanic to inspect before buying, typically $100–200.","Get insurance quotes for specific cars. Insurance costs vary hugely by model and driver."],
  "Job & benefits":["Check in with your manager at 60 days: what’s going well, what to improve.","Look into 401(k) match, HSA/FSA, and other benefits. Free money."],
  "Money":["Emergency fund starter: aim for a first $500–1,000.","Review the budget: adjust buckets."],
  "Mind":["Summer reset: a half-day with nothing scheduled.","Therapy: bring the goals update."],
  "Joy":["Adventure: a road trip day (with a friend or alone) once you’re confident.","Beach or lake day. Bring a book."]},
 rw:["$0: stargazing with a blanket","~$10: an iced matcha outing"],
 fic:"The Magicians — Lev Grossman",non:"Kitchen Confidential — Anthony Bourdain",film:"Lost in Translation",
 ms:["Weight −45 lbs (or on trend)","Max car price and insurance quotes done","Two cars test-driven","Emergency fund $500+","60-day work check-in done"],
 slip:"If July slides: don’t buy a car under pressure. A rushed purchase costs more than waiting a month."},

{id:"2027-08",lbl:"August 2027",ph:"Wheels",gh:"gold",lost:52,
 line:"The car you chose, the stickers you earned.",
 f:["Steps 10k; lifts 3×/week.","Buy the car (if the fund allows) and insure it.","Keep savings automatic."],
 sec:{
  "Body":["Reach 10k steps on at least half your days.","Strength 3×/week with real progress logged.","Celebrate non-scale wins: stairs, clothes, energy."],
  "Car":["Buy with cash or a small, sensible loan. Read every document. Don’t sign what you don’t understand.","Insure before you drive off the lot. Register at the DMV.","Bumper stickers + decor: this is the fun part. Pick three that are truly you."],
  "Job & benefits":["Aim for a measurable win at work (a process you improved, praise from a lead).","Update your résumé with the new accomplishments, even if you’re staying."],
  "Money":["Adjust the budget for car costs: gas, insurance, maintenance.","Keep the 20% auto-savings going."],
  "Mind":["Weekly review: what is the one thing that most reduced stress?","Therapy: celebrate agency."],
  "Joy":["Adventure: first drive-to destination (a day trip you’ve always wanted).","Playlist for the car."]},
 rw:["$0: a sunrise drive","~$20: bumper stickers or car decor"],
 fic:"The Atlas Six — Olivie Blake",non:"Burnout — Emily & Amelia Nagoski",film:"Frida",
 ms:["Weight −52 lbs (or on trend)","Car purchased and insured (or plan B)","License + registration handled","Bumper stickers applied","First drive-to adventure"],
 slip:"If August slides: do not skip insurance. A paused purchase is fine; an uninsured one isn’t."},

{id:"2027-09",lbl:"September 2027",ph:"Wheels",gh:"kohl",lost:59,
 line:"The ordinary mornings become yours.",
 f:["Steps 10k; lifts 3×/week.","Settle into the car and commute routine.","Lay down FIRE basics: automatic investing."],
 sec:{
  "Body":["Keep steps and strength steady. Start a gentle fall plan: a walking route you love.","Slow cooker or sheet-pan meals for busy weekdays.","Dress in the palette you love. Clothes fit differently now."],
  "Car":["Oil change schedule, tire pressure, a small emergency kit in the trunk.","Know your insurance policy and roadside coverage."],
  "Job & benefits":["Review your benefits and set contributions to get the full employer match if there is one.","Keep a “wins” document at work for performance reviews."],
  "Money":["Open a Roth IRA or equivalent if it fits your budget. A FIRE-style path starts with boring index funds. (Read The Simple Path to Wealth first.)","Savings fund for 2028 (apartment deposit + move + furnishings): set the number."],
  "Mind":["Autumn ritual: a cozy corner for reading and tea.","Therapy: update goals for 2028."],
  "Joy":["Adventure: a fall festival or small-town drive.","Dinner at home with someone you like."]},
 rw:["$0: a leaf-peeping walk","~$12: a good candle for fall"],
 fic:"Mexican Gothic — Silvia Moreno-Garcia",non:"The Simple Path to Wealth — JL Collins",film:"Phantom Thread",
 ms:["Weight −59 lbs (or on trend)","Emergency kit and car maintenance plan","Investing account opened","2028 savings goal written down","One fall adventure done"],
 slip:"If September slides: keep auto-savings and gas in the tank. The rest is flexible."},

{id:"2027-10",lbl:"October 2027",ph:"Harvest",gh:"fig",lost:66,
 line:"Whimsigoth season. Make something.",
 f:["Maintain steps and strength.","Write and submit one piece to a lit mag.","Draft your first video-essay outline (for fun, no pressure)."],
 sec:{
  "Body":["Keep the routines; add a Sunday long walk to forests or neighborhoods you love.","Hot tea and soups: easy fall nutrition.","Check how your body feels now: strength, energy, back and neck pain."],
  "Car":["Prepare for winter: tires, wipers, scraper, blanket.","Get a roadside assistance plan if you don’t have one."],
  "Job & benefits":["Prep for mid-year or year-end review: collect wins, ask for a raise if appropriate.","Network inside and outside the company."],
  "Money":["Savings fund: aim to be on track for your 2028 number.","Pay off any high-interest debt aggressively."],
  "Mind":["Creative day once a week: write, record, sketch.","Submit one piece to a literary magazine (free-to-submit ones first). Rejection is part of the process; keep a “rejections” list like a trophy."],
  "Joy":["Adventure: a ren faire, a haunted walk, or a pumpkin patch.","Friendsgiving planning."]},
 rw:["$0: a spooky-movie marathon at home","~$15: a vintage find"],
 fic:"Babel — R.F. Kuang",non:"Bird by Bird — Anne Lamott",film:"Bram Stoker’s Dracula (1992)",
 ms:["Weight −66 lbs (or on trend)","Winter car prep","One submission sent","One video-essay outline drafted","Savings on track"],
 slip:"If October slides: submit one piece and keep savings automatic. Creativity is a long game."},

{id:"2027-11",lbl:"November 2027",ph:"Harvest",gh:"pomegranate",lost:73,
 line:"Gather the harvest. Plan the next door.",
 f:["Keep habits steady through the holidays.","Research apartments for 2028 (cost, neighborhoods).","Build the savings fund."],
 sec:{
  "Body":["Holiday plan: eat the good thing slowly, then walk. No punishment, no guilt.","Keep steps and strength. Sleep first."],
  "Car":["Winter driving: slow down, increase following distance, check forecasts.","Save the receipts for a year-end review."],
  "Job & benefits":["Open enrollment: review your benefits and adjust.","Ask about remote flexibility and growth paths."],
  "Money":["Research rent in your area and in your 2029 target cities (Rochester, Buffalo, Chicago, Boston).","Check your credit; fix any errors."],
  "Mind":["Gratitude list: 10 things this year taught you.","Therapy: how do you want to feel in 2028?"],
  "Joy":["Friendsgiving or a quiet candlelit dinner.","Adventure: a day trip to a nearby city."]},
 rw:["$0: tea and a gratitude letter to yourself","~$15: a thrift velvet blazer"],
 fic:"The Bear and the Nightingale — Katherine Arden",non:"Wintering — Katherine May",film:"Eternal Sunshine of the Spotless Mind",
 ms:["Weight −73 lbs (or on trend)","Apartment research started","Benefits open enrollment done","Credit report checked","Gratitude list done"],
 slip:"If November slides: protect sleep and savings. Everything else bends."},

{id:"2027-12",lbl:"December 2027",ph:"Harvest",gh:"crown",lost:80,
 line:"You said you’d become someone else. You did.",
 f:["Celebrate and measure.","Define maintenance mode.","Write the 2028 map."],
 sec:{
  "Body":["Measure, don’t judge: weight, waist, steps, strength, energy.","Define maintenance: a range you can live with, and the habits that hold it.","Photo recap: if it feels good, take one; if not, skip."],
  "Car":["Year-end car check: oil, tires, insurance renewal.","Update your bumper stickers if you want."],
  "Job & benefits":["Review the year: wins, raises, learning, what’s next.","Update the résumé even if you’re staying."],
  "Money":["Review the year: savings, debt, net worth.","Set the 2028 targets: savings fund, apartment deposit, solo trip."],
  "Mind":["“Burn and Bloom” ritual: write what you’re releasing, then what you’re planting.","Celebrate your village: thank-you notes."],
  "Joy":["Adventure: your biggest yet, even if small. A solo night in a nearby city?","New Year’s: plan how you’ll start 2028."]},
 rw:["$0: a letter from 2027-you to 2030-you","~$30: a nice dinner or something that marks the year"],
 fic:"Gideon the Ninth — Tamsyn Muir",non:"Braiding Sweetgrass — Robin Wall Kimmerer",film:"The Worst Person in the World",
 ms:["Weight −80 lbs (or best honest number)","Year review written","2028 targets set","Thank-you notes sent","Celebrated on purpose"],
 slip:"If you didn’t hit every number: look at the machine you built. Insurance, license, job, car, and habits are the real win."}
];

const YEARS=[
 {y:"2027",t:"Unlock",big:"I",items:[["Lose weight","−80 lbs by Dec, ~1.5 lbs a week on average. Your doctor’s guidance outranks any number I give you."],["Get a car","Permit → license → insurance quotes → buy. Honest budget, no shortcuts."],["Get a good job with benefits","Insurance, income, taxes, independence."]],
  why:{"Weight":["confidence","privilege","health","mobility","strength","ability","easier","quality of life"],"Car":["mobility","freedom","agency","security","easier","bumper stickers","normative","come and go without waiting on anyone’s schedule"],"Job":["money","insurance","freedom","security","taxes","fund the lifestyle","independence","agency","normative"]}},
 {y:"2028",t:"Root",big:"II",items:[["Savings fund","The cushion that makes everything else possible."],["Move into and furnish your own apartment","Persian rugs, velvet, a door you control."],["Solo trip","The first of many."]]},
 {y:"2029",t:"Expand",big:"III",items:[["Move to Rochester, Buffalo, Chicago, or Boston","Researching starts in Nov 2027."],["Start / progress the YouTube channel","Thinkpiece-through-a-sociological-lens era."],["Secure a date for New Year’s","Let love be an invitation, not a project."]]},
 {y:"2030",t:"The north star",big:"IV",items:[["The north star self","A maker of meaning. Free. Joyful. Curse-breaker."]]}
];

const CAR_STEPS=["Work Zone Safety course done","Practice tests scoring 22+/25","DMV hub appointment booked","Permit passed ($59)","90 days held (mark the date in Notes)","Road test booked","License issued ($84)","Insurance quotes gathered","Car Fund goal set","Car purchased","Bumper stickers applied"];
const JOB_STEPS=["HUSKY active","Résumé v1","LinkedIn live","Target list built","10 applications","First interview","Second-round interview","Offer","Accepted + benefits enrolled","Auto-savings started"];
const HEALTH_STEPS=["HUSKY application submitted","HUSKY active","Primary care visit","Labs discussed (energy, sleep, thyroid, vitamins)","Therapy intake","Dental checkup (ask what HUSKY covers)","Sleep window protected 5 nights a week","Strength routine 2× / week"];
const BUCKETS=[["permit","Permit",59],["license","License",84],["emergency","Emergency starter",1000],["car","Car fund",null],["future","2028 savings",null],["other","Other",null]];

const PALETTE=[["#0f0a09","black"],["#2b1a15","espresso"],["#3a2118","chocolate"],["#5a1520","oxblood"],["#722f37","wine"],["#6a1b3a","burgundy"],["#4b2a54","plum"],["#5b3a5a","fig"],["#173f45","deep teal"],["#43a59a","verdigris"],["#3e3f6b","indigo"],["#5a6030","olive"],["#c9ad7f","champagne"],["#ece0cc","cream"],["#b97a2b","amber"],["#a6491f","rust"],["#8d3a2a","brick"],["#c99a98","dusty rose"],["#e5b5aa","blush"],["#b8924a","gold"]];

const TOOLKIT={
 reset:["<b>Missed a day:</b> do a candle day tomorrow. Nothing to make up.","<b>Missed three days:</b> pick ONE ritual (the warm cup, a stretch, or a walk) and one two-minute task. Do both before noon. Write the date in your journal and keep going.","<b>Missed a week:</b> skip the guilt scan. Open Today, pick candle, tick one box. Then book the next real appointment on your calendar.","<b>Missed a month:</b> you didn’t fail the plan; the plan just paused. Return to the Runway steps (HUSKY, $59, appointment, résumé), whichever isn’t done. Rebuild from there.","<b>Ever-present rule:</b> never zero twice."],
 proc:["<b>Two-minute door:</b> open the thing, don’t do the thing. The brain relaxes when it’s a door, not a mountain.","<b>Body double:</b> work next to a person, or a “study with me” video on a laptop. Free and surprisingly strong.","<b>Timer sprints:</b> 10 minutes on, 5 off. Stop when the timer stops, even if you’re on a roll (the stopping is what makes tomorrow easier).","<b>Make it physical:</b> stand up, put the phone in another room, set one object on your desk that belongs to the task.","<b>Name the first micro-action:</b> not “do résumé” but “open the doc and type my name”.","<b>Pair it:</b> tea + task, playlist + task, candle + task. Pairing builds the habit rails.","<b>Reduce decisions:</b> pre-pick tomorrow’s three needle-movers at night. Decision-making is the hard part.","<b>The three-day rule:</b> anything undone for 3 days gets reduced to 2 minutes and done, or deleted on purpose."],
 candle:["Drink water and something warm","Wash your face","Lie on the floor for 5 minutes with a podcast or music","Open one tab and close all the others","Put one thing back where it belongs","Text one person a heart","Walk to the mailbox or the end of the street","Eat a piece of fruit","Stretch your neck and shoulders","Open your HUSKY or DMV page, just look","Wear the soft thing","Do the night skincare ritual early, then rest"],
 shame:["<b>Notice:</b> “There’s shame.” Name it. You’ve already stepped one inch back.","<b>Check the story:</b> is this fact, or an old voice? Write one fact and one feeling.","<b>Speak to yourself like a friend:</b> what would you say to someone you love in this exact spot?","<b>One tiny act of repair:</b> not a punishment; a step. Wash a cup. Send the email.","<b>Afterwards:</b> write one line about what helped. Your future self will want it."],
 planb:[["Weight",["B: walking + produce only (drop strength for a month)","C: just the evening walk and the sleep window","Ask the doctor about nutrition support (a registered dietitian) under your coverage"]],["Car",["B: buy a cheaper, older car; or be added to a family policy","C: hold the permit, practice, and use transit/ride shares until the fund catches up","If the road test goes badly: the retest fee is $40; book a lesson, re-book"]],["Job",["B: temp agency, state job, or retail/warehouse with benefits","C: keep the AI gig plus a part-time benefit-eligible job","Anything that carries insurance counts as a stepping stone"]]],
 reward:["<b>$0:</b> a bath, a long walk with a playlist, a day with no inbox, a favorite chapter, calling a friend, sunrise at a window","<b>$5–10:</b> a fancy tea, a thrifted book or scarf, a candle, a flower, a café matcha","<b>$20+:</b> dinner out, sushi, a book haul, a new palette piece for your closet","<b>Rule:</b> reward showing up; never reward or punish with skipped meals or starving, and never reward yourself with something that undermines the goal."],
 resources:["<b>HUSKY / Access Health CT:</b> accesshealthct.com or 1-855-805-4325 (applications year-round)","<b>CT DMV:</b> ct.gov/dmv. Driver’s Manual PDF, Work Zone Safety course, appointment scheduling","<b>Your library:</b> a card gives you Libby, Hoopla, free events, and quiet places to work","<b>VITA:</b> free tax-filing help for lower incomes (IRS.gov)","<b>2-1-1 Connecticut:</b> dial 211 for food, utilities, and local benefit help","<b>YouTube:</b> yoga with Adriene, beginner strength, “study with me” rooms","<b>ctbhp.com:</b> finding behavioral-health providers under HUSKY","<b>Community health centers (FQHCs):</b> sliding-scale care and help with applications","<b>SNAP/food help:</b> check eligibility at connect.ct.gov if food budget is tight"],
 doctor:["My energy is low most days. What could be contributing (sleep, thyroid, vitamin D, iron, mood)?","I have trauma-related symptoms, depression, and anxiety. What therapy options fit (trauma-focused, EMDR, somatic)?","I’m wondering about ADHD / autism / OCD. How do I get evaluated?","I’d like to lose weight safely. What pace and strategies do you recommend for me?","Are there dietitian, dental, or vision benefits I should use?","What should I watch for as I start walking and strength training?","(If cycles are irregular or painful) Here’s my cycle log from the app. What should we look at?"],
 whimsi:["Light a candle before the first task","Matcha / tisane in your favorite cup","Pomegranate or fig as a snack","Kohl, tinted lip, or a single ring: a one-minute ritual","Velvet or silk robe while journaling","Play-by-post reply by lamplight","Tarot or tea-leaf pull as a journaling prompt (the meaning is the story you make)","Crystals or small protection spells as intention rituals","A thrift or flea-market trip as your monthly adventure","Persian rug dreaming: save a ‘2028 apartment’ board of images"],
 rules:["No staying in bed past 10 a.m. unless ill or on vacation.","I don’t over-explain.","I don’t put anything off more than three days.","One uncomfortable thing a day.","No living in shame; no tolerating shame from others or myself.","I control my life. Shame, guilt, humiliation, and other people don’t drive."]
};
