"use strict"; 
/* north star: all of the words and data (plan months, rituals, prompts, syllabus, Calbert's lines) */

/* ===== plan data ===== */
/* ============================================================
   north star — plan content (edit freely; the app code lives in app.js)
   ============================================================ */
const HOUSES=[['winedark','Winedark',350,42],['clairmont','Plum',270,34],['rosewood','Dusty rose',330,34],['ashford','Indigo',230,38],['witwick','Verdigris',150,32],['harelane','Deep teal',180,34],['commonwell','Amber',30,38]];

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
 "A Moth day is still a day I showed up.",
 "Small, then smaller, then started.",
 "Own your weird.",
 "I am a maker of meaning.",
"I move before I feel ready.",
"My peace is non-negotiable.",
"I leave room for things to go right.",
"I do not apologize for taking up space.",
"I honor my boundary even when it feels heavy.",
"Friction is data, not a stop sign.",
"I give myself permission to be a beginner.",
"Doubt is a passenger, not the driver.",
"Clear over comfortable.",
"I trade perfection for momentum.",
 "Proceed and be bold!"
];

const MUSES=[
 ["Joan of Arc","fierce, unembarrassed bravery","Make the call you’ve been dreading, and stand up while you do it. She did worse in armour."],
 ["Donna Tartt","curated, intellectual elegance","Make one thing deliberate today (desk, outfit, reading list) and remove one thing that’s only clutter."],
 ["Alice Cullen","vivacity and charm","Be warm first: greet someone, send one kind text, compliment a stranger."],
 ["Baba Yaga","strength and wisdom through craft","Treat one unglamorous task like a spell: slow, exact, done properly. Cook, clear one surface, set one boundary."],
 ["Villanelle","audacity and independence","Do one bold, harmless thing that’s out of pattern. Say a clean no, with no paragraph attached."],
 ["Henry Winter","intelligence and a respected presence","Twenty focused minutes of real study (the manual, the résumé). Speak a little slower today."],
 ["Anthony Bourdain","curiosity and hunger for the world","Try something new to eat. Ask a real question. Say yes to one small adventure."],
 ["Charli XCX (post-brat)","dark, sensual, unbothered","Play one song loud and walk like the pavement owes you rent. Make something raw and show nobody."],
 ["Alexa Chung","effortless it-person style","Get dressed on purpose for a task at home. One-minute outfit: black base, one jewel tone, one warm metal."],
 ["Holly Black","faerie logic and the craft of story","Write 200 words of anything with fairy-tale rules. Names matter, and nothing is free."],
 ["Fiona Apple","unflinching honesty","Write the true sentence in your journal and leave it alone."],
 ["David Bowie","reinvention","Change one visible thing: your parting, a playlist, a lipstick, the order of your morning."],
 ["Anaïs Nin","the diary as a life","Ten honest lines at night. No editing. I’ll be reading over your shoulder."],
 ["Eliot Waugh / Julia Wicker","wit plus relentless study","Do the hard study first. Make one joke at your own expense that is kind."],
 ["Kathleen Hanna", "rebellious noise and unapologetic joy", "Take up space in a room where you usually shrink. Make a loud noise or voice an opinion without asking permission."],
 ["Derek Jarman", "queer botanical beauty and radical romance", "Plant or tend to one small, beautiful thing today in defiance of a chaotic world."],
 ["Patti Smith", "raw, poetic dedication", "Dedicate one hour to pure creating—no phone, no audience, just you and the page."],
 ["Toni Morrison", "mastery and commanding grace", "Take command of your work space. Clean off that damn desk."],
 ["Parisa Kamali","strategic charisma","Plan three moves ahead on one task. Write them down."],
 ["Sarah Manning","scrappy reinvention, many selves, one stubborn spine","Pick the version of you the day needs and commit to her bit. Improvise, then follow through."],
 ["Hecate / Persephone","thresholds, crossroads, the underworld as a home","Stand at one crossroads on purpose: write the two paths, then take the smaller step."],
 ["Guillermo del Toro","tender monsters, beautiful dread","Find the strange, tender thing in an ordinary task. Make the workspace a little more cathedral."]
];

/* g = time of day group; t = tier (0 candle, 1 lantern, 2 bonfire) */
const RIT=[
 {id:'water',g:'morning',t:0,l:"Something warm in a cup you love",s:"Matcha, coffee, tea. The first sip counts."},
 {id:'wash',g:'morning',t:0,l:"Wash up",s:"Teeth + face, or a shower if you can."},
 {id:'stretch',g:'morning',t:0,l:"Five minutes of floor stretching or yoga",s:"On the floor counts. Lying down counts."},
 {id:'tiny',g:'morning',t:0,l:"One two-minute task",s:"Open the HUSKY page. Fill one line. Done is done."},
 {id:'yoga',g:'morning',t:2,l:"Full yoga flow (15–20 minutes)",s:"Free on YouTube."},
 {id:'walk',g:'day',t:1,l:"A walk, any length",s:"Hallway laps count on bad-weather days."},
 {id:'eat',g:'day',t:1,l:"Produce + protein at your meals",s:"Add before you subtract. Aim for balance and color."},
 {id:'mover',g:'day',t:1,l:"One errand for the Lady (car, job, or health)",s:"See this month’s three."},
 {id:'uncomf',g:'day',t:1,l:"One uncomfortable thing",s:"A call, an email, a stare at the thing you’ve been avoiding."},
 {id:'lift',g:'day',t:2,l:"Strength session",s:"2–3 times a week is plenty. Today if it’s a lift day."},
 {id:'social',g:'day',t:2,l:"Reach out to one human",s:"A text counts. Friendship is built in small deposits."},
 {id:'read',g:'evening',t:1,l:"Ten pages: fiction or nonfiction",s:"One of each is the long-term shape."},
 {id:'write',g:'evening',t:2,l:"Make something (15 minutes)",s:"Fiction, a thinkpiece, a video-essay outline, a play-by-post reply."},
 {id:'bed',g:'evening',t:0,l:"Lights down, phone away, skin ritual",s:"The night ritual is part of the plan, not a reward for it."}
];
const GROUPS=[['morning','Morning','Start small. Warm cup first.'],['day','Daytime','The errands live here.'],['evening','Evening','Wind down on purpose.']];
const TIERS=[["candle","Moth","My niece. Pale, rumpled, half asleep, and the best of the lot, not that she’s heard it from me. She sits on your shoulder all day as your body double and points you at the few things that matter. Pick her on the foggy days. A Moth day counts in full. I’ve checked with the Lady."],["lantern","Fox","Quick, clever, stingy with her energy, which I respect. She works beside you as your body double, keeps you to the core rituals and one real errand, and won’t let you wander off. Pick her for a normal day. She’s the one I’d send to the shops."],["bonfire","Hare","Long legs, wild eyes, no patience for dithering. She sprints beside you through the extras, a body double with a stopwatch. Pick her when you’ve got the energy, and don’t let her borrow against tomorrow. Last knight who did is still paying. Ask the hedgehog."]];

const QUARTERS=[
 ["Q1","Jan – Mar","Unlock","Insurance active, permit passed, résumé out, therapy started, habits taking root. Target: −17 lbs."],
 ["Q2","Apr – Jun","Momentum","Road test passed, license in hand, job offer. Target: −38 lbs."],
 ["Q3","Jul – Sep","Wheels","Car bought, first paychecks becoming savings. Target: −59 lbs."],
 ["Q4","Oct – Dec","Harvest","Consolidate everything; build 2028’s foundation. Target: −80 lbs and a real runway."]
];

/* daily step targets by month (editable in Settings) */
const STEP_GOALS={"2026-11":3000,"2026-12":4000,"2027-01":5000,"2027-02":5500,"2027-03":6500,"2027-04":7500,"2027-05":8000,"2027-06":9000,"2027-07":9000,"2027-08":10000,"2027-09":10000,"2027-10":10000,"2027-11":10000,"2027-12":10000};

/* ============================================================
   CYCLE PHASES + daily lifestyle tips
   ============================================================ */
const PHASES={
 menstrual:{name:"Menstrual",hue:350,blurb:"Rest and restore. Energy runs lower, and the moon business is no reason to skip the plan, only to shrink it.",
  tips:[
   "Shrink the plan to Moth size if you need to. A Moth day counts in full. I’ve checked.",
   "Warm, iron-friendly food helps: lentils, beans, dark leafy greens, red meat if you eat it, with something rich in vitamin C alongside.",
   "Heat helps: a warm bath, a heating pad, a hot tea. Move slowly: stretching, yoga, an easy walk.",
   "Put off the big decisions and the hard conversations if you can. Journal first, decide later.",
   "Drink water on purpose and protect tonight’s sleep window.",
   "Do the lowest-effort version of every ritual. Done small is done."]},
 follicular:{name:"Follicular",hue:150,blurb:"Energy climbs. A good window to start things, learn things and send things.",
  tips:[
   "Energy tends to climb. Put the hardest task of the week here: applications, the manual, the résumé.",
   "Good week to try a new workout, a new route, or a new recipe.",
   "Light, fresh food feels good: fruit, big salads, sprouts, eggs, fermented foods. Add produce before you subtract anything.",
   "Open the blank page. Brainstorming and starting projects come easier now.",
   "Make the call or send the networking message. Initiative is cheaper this week.",
   "Add a little progression to strength work: one more rep, or a slower tempo."]},
 ovulatory:{name:"Ovulatory",hue:40,blurb:"Peak social and verbal energy for many people. Use it to be seen.",
  tips:[
   "Many people feel most social and articulate now. Schedule the interviews, calls and conversations you’ve been dreading.",
   "Higher-intensity movement often feels good: a brisk walk, a lift day, a dance break.",
   "Eat a rainbow: raw veg, berries, quinoa, healthy fats. Plenty of water.",
   "Say yes to the invitation. Reach out to one human today.",
   "Pitch the idea, ask for the thing, speak first in the meeting.",
   "Record the video, read aloud, make a voice memo. Your voice carries."]},
 luteal:{name:"Luteal",hue:270,blurb:"Turning inward. Detail work and routine are strong; cravings and low mood can show up late in this phase.",
  tips:[
   "Good for detail work: editing, organising, admin, finishing what’s already started.",
   "Steady meals help: complex carbs, protein, magnesium-rich foods (pumpkin seeds, dark chocolate, leafy greens). Cravings are information, not failure. The 10% is allowed.",
   "Moderate movement tends to feel best: pilates, yoga, a long walk, lighter lifting.",
   "If anxiety or mood dips, shrink the day: Moth size, early bed, fewer commitments.",
   "Protect sleep: lights down earlier, caffeine earlier, phone away.",
   "Irritability late in the phase is real, and the world is annoying. Do one thing that soothes: a warm shower, a book, a candle, a good dinner.",
   "Tie off the week’s loose ends so the next phase starts clean."]}
};
const CYCLE_NOTE="Phases are estimated from the dates you log, using your usual cycle length. Bodies vary. If cycles are very irregular, very painful or heavy, bring your log to a doctor. This is a planner, not medical advice.";

/* ============================================================
   MONTH-BY-MONTH PLAN
   ============================================================ */
const M=[
{id:"2026-11",lbl:"November 2026",ph:"Runway",gh:"embers",lost:0,
 line:"Prologue, The Thaw. You’ve been told the doors are locked. I’ve checked, and most are only stuck. Start with the HUSKY one.",
 f:["Baseline only: one weigh-in, one 10-minute walk after a meal.","Read the CT Driver’s Manual (one chapter a week); start the free Work Zone Safety course.","Reapply to HUSKY and track down the tax paperwork behind the lapse."],
 sec:{
  "Body":["No dieting yet. Your only job is to collect a baseline: one weigh-in (write it down, no verdict) and, if it feels okay, one waist measurement.","Walk 10 minutes after your biggest meal. Tiny and repeatable. A hallway counts.","Swap one sugary drink a day for tea, matcha, or sparkling water. Cheese and sushi stay.","Pick your “fun drink” ritual: the thing you make every morning that feels like a small ceremony."],
  "Car":["Save the CT DMV Driver’s Manual (free PDF at ct.gov/dmv) on your phone. One chapter a week, ten minutes at a time.","Take the free online Connecticut Work Zone Safety Course. It’s required for the permit and costs nothing.","Take one practice permit test just to see the format. The score doesn’t matter yet."],
  "Job & benefits":["Reapply for HUSKY Health at accesshealthct.com or by phone at 1-855-805-4325. Applications are accepted year-round. Do this first, this week.","Find last year’s income forms from your gig company (tax documents / 1099). Missing tax paperwork is what caused the lapse, so this is the root fix.","Write your “what I actually do” list: every task in your AI gig, in plain verbs. It becomes the résumé in December."],
  "Money":["Write down every dollar in and out for 30 days (use the Plan → Tracks page). Information, not judgment.","Name your first bucket: Permit, $59 total. Every gig payment tops it up first.","Look up IRS VITA sites near you: free tax-filing help for lower incomes."],
  "Mind":["Use the three familiars on the Today page. Pick one honestly each morning, and nobody will argue.","Read your “why” statements on the Plan → Map page once a week.","Choose one kind sentence to say when shame shows up (the Toolkit has scripts)."],
  "Joy":["Weekly movie night, with no productivity attached.","Get a library card and install Libby: free books and audiobooks.","Adventure: walk somewhere you’ve never walked, with a tea in hand."]},
 rw:["$0: long bath, candle, a full album start to finish","~$5: a fancy matcha or loose-leaf tea you’ve been eyeing"],
 ms:["HUSKY application submitted","Tax / income documents located","Library card + Libby set up","Work Zone Safety course started","Baseline weigh-in logged","Used the Today page on 10+ days"],
 slip:"If November slides: do the HUSKY application and nothing else. The Lady has been informed, and she’ll wait."},

{id:"2026-12",lbl:"December 2026",ph:"Runway",gh:"candlelight",lost:0,
 line:"Build the floor you’ll stand on in January. I’d offer to help, but I’ve no hands worth the name.",
 f:["Walk 10–15 minutes most days; weigh in Dec 28 for your real baseline.","Finish the Work Zone course, pass practice tests, save the $59.","Résumé v1 and LinkedIn live; first quiet applications."],
 sec:{
  "Body":["Walk 10–15 minutes most days. If energy is low, split it into two 5s.","Add one produce serving to two meals a day (fruit, frozen veg, a salad kit).","Pick a lights-down time and protect it five nights a week. Low energy often starts with sleep.","Yoga: 5 minutes of floor stretching in the morning. YouTube is free."],
  "Car":["Finish the Work Zone Safety course and save the confirmation.","Take a practice permit test twice a week until you’re scoring 22+/25 (the real one needs 20 of 25).","Book the DMV hub appointment for mid-to-late January. Permit tests are by appointment only.","Gather: state ID, SS card, proof of residency (mail or a bank statement), and $59."],
  "Job & benefits":["Check the HUSKY decision; answer any document request within 48 hours.","Résumé v1, one page. Gig work counts: describe it accurately (for example “AI data evaluation, contract”) and quantify what you can.","Make or refresh your LinkedIn.","Build a target list: remote or hybrid roles in AI data quality, content operations, customer support, admin/ops, editorial support, plus CT state jobs."],
  "Money":["Permit bucket funded ($59).","Start the License bucket ($84).","Check one chapter of Your Money or Your Life out of the library."],
  "Mind":["Once HUSKY is active, book a primary care visit. Ask about sleep and energy, and what labs make sense (low energy has many causes).","Start looking for a trauma-informed therapist who takes HUSKY. The CT Behavioral Health Partnership (ctbhp.com) can help you find providers.","Winter solstice ritual: write what you’re leaving behind, then tear or burn it."],
  "Joy":["Adventure: a solstice night walk or a thrift browse (free).","Year-end ritual: list five tiny wins from 2026. There are more than five.","Movie night: something cozy-dark."]},
 rw:["$0: a guilt-free day off after the new-year planning","~$5–10: a book from the thrift store"],
 ms:["HUSKY active (or appeal / reapply in motion)","Résumé v1 + LinkedIn done","Permit appointment booked","$59 permit bucket funded","Baseline weight logged","PCP / therapy search started"],
 slip:"If December slides: protect three things. HUSKY, the $59, and the appointment. Everything else can sulk."},

{id:"2027-01",lbl:"January 2027",ph:"Unlock",gh:"begin",lost:5,
 line:"Book I begins. You don’t need a new you, you need a first week, and I’ll do the grumbling.",
 f:["Walk 20 minutes most days; strength twice a week (bodyweight).","Pass the permit test; log your first driving hours.","3 applications a week; first therapy intake."],
 sec:{
  "Body":["Walk 20 minutes most days. Consistency beats speed.","Strength twice a week, 15 minutes: sit-to-stands, counter push-ups, glute bridges, bird-dogs. Free beginner routines are plenty.","Add before you subtract: produce at every meal, a protein anchor at breakfast, fruit where you can see it. The 90/10 rule: 90% whole foods, 10% whatever you want.","Weigh in weekly (same day, same time, one number). The trend matters, not the day."],
  "Car":["Take the permit test at a DMV hub (by appointment). Vision test plus 25 questions; 20 correct to pass. Budget $59 total.","The permit must be held at least 90 days before the road test. Count forward on a calendar. Write your earliest road-test date on the Tracks page.","Practice with a qualified trainer: age 20+, licensed 4+ years with no suspensions. Start in an empty parking lot."],
  "Job & benefits":["Three tailored applications a week. Make a template so each takes ~15 minutes.","Set two job alerts (Indeed, LinkedIn, the CT state jobs portal).","Treat the AI gig as a bridge: log your hours, and ask whether longer contracts or full-time roles exist."],
  "Money":["License bucket: $84. The permit is paid; this is next.","If you’re owed a tax refund, file early (VITA is free)."],
  "Mind":["Book the first therapy intake. Telehealth counts.","Complete the primary care visit (bring the Toolkit’s question list).","Three-line journal on the Today page, daily."],
  "Joy":["Adventure: a free library event or a free-admission museum day.","Keep movie night sacred."]},
 rw:["$0: a full day of reading in bed, phone away","~$10: a thrift-store velvet or silk scarf in your palette"],
 ms:["Permit passed","First 5 driving practice hours logged","12 applications sent","Therapy intake booked or done","PCP visit done","Weekly weigh-ins logged 3+ times"],
 slip:"If January slides: restart next Monday. The permit test and three applications this week, nothing else."},

{id:"2027-02",lbl:"February 2027",ph:"Unlock",gh:"hearth",lost:10,
 line:"Keep the fire small and steady. The Fox approves, and the Fox approves of nothing.",
 f:["25–30 minute walks; add a second strength move each week.","Driving practice twice a week.","5 applications a week plus 2 networking messages."],
 sec:{
  "Body":["Walks to 25–30 minutes. Tack on one 10-minute walk after dinner if it’s feasible.","Strength twice a week with a little progression (one more rep, one slower tempo).","Meal anchor: a simple go-to breakfast and a go-to lunch so you’re not deciding at 2 p.m.","Dark-chocolate square after dinner is allowed. It’s part of the 10%."],
  "Car":["Drive with your trainer twice a week, 30 minutes. Quiet roads first, then busier ones.","Keep a driving log (date, minutes, what you practiced). It also builds confidence."],
  "Job & benefits":["Five applications a week.","Send two networking messages a week: a former coworker, a gig-platform contact, someone in a role you want.","Practice answers aloud to three questions: tell me about yourself; a time you solved a problem; why this role."],
  "Money":["Keep the License bucket going until $84.","Start tracking the Car Fund (set a placeholder goal on the Tracks page; you’ll refine it in June)."],
  "Mind":["Weekly therapy if you can. Start with whatever feels safest: the present-day plan, not the deepest wound.","Practice the Shame Loop Breaker from the Toolkit at least three times."],
  "Joy":["Adventure: a gallery, a bookstore wander, or a candlelit tea at home.","Reach out to one person you’d like in your village."]},
 rw:["$0: a living-room dance-and-shower night","~$8: a plant or a candle for your space"],
 ms:["Weight −10 lbs (or on trend)","10+ driving hours logged","20 applications total","First interview scheduled or two networking replies","Therapy ongoing (4 sessions)"],
 slip:"If February slides: ten-minute walks, and applications on Tuesday and Thursday only. Keep the trainer drives."},

{id:"2027-03",lbl:"March 2027",ph:"Unlock",gh:"thaw",lost:17,
 line:"Everything frozen starts to move. I can feel it in the lampshade.",
 f:["Build toward 6–7k steps most days.","Practice highways and parking with your trainer.","Interviews. Sign up with temp agencies as Plan B."],
 sec:{
  "Body":["Steps: build toward 6–7k most days. Park farther, pace on calls.","Strength twice a week, adding a hinge (hip-hinge with a backpack of books) and a row (a bag or band).","Cook one new plant-forward recipe a week. Salt, fat, acid, heat.","Yoga 10 minutes at least 4 mornings."],
  "Car":["Parking (parallel, angled), merging, left turns. Practice each three times.","Take a free CT practice test or two again. The road test also asks vehicle-handling questions."],
  "Job & benefits":["Chase interviews: follow up within 48 hours on every application that’s gone quiet.","Create profiles with 2–3 temp or staffing agencies so there’s a Plan B paycheck.","Ask for informational calls: 15 minutes with someone doing a job you want."],
  "Money":["If you’re filing taxes, do it now.","Open a savings account if you don’t have one (credit unions often have low-fee options)."],
  "Mind":["Spring equinox ritual: plant something. Seeds, a cutting, anything.","Check in with a doctor on whether energy has improved and what to adjust."],
  "Joy":["Adventure: a first forest walk of the year. Study foraging from books and photos only; never eat anything you haven’t verified with an expert.","Movie night plus a handwritten postcard to someone."]},
 rw:["$0: a bookstore afternoon without buying","~$15: something beautiful for your car-to-be (a mini air freshener, a cozy keychain)"],
 ms:["Weight −17 lbs (or on trend)","Parked and merged confidently","4+ interviews or screening calls","Temp agency profiles live","Taxes filed"],
 slip:"If March slides: the Q1 win condition is insurance, permit, résumé, therapy. Everything else is a bonus."},

{id:"2027-04",lbl:"April 2027",ph:"Momentum",gh:"motion",lost:24,
 line:"The permit clock runs out and the road opens. Don’t dither at the kerb.",
 f:["7–8k steps; strength twice a week with progression.","Book the road test the moment 90 days are up.","Go for an offer: interview prep, follow-ups, negotiation."],
 sec:{
  "Body":["Steps toward 7–8k. Longer walks on weekends.","Strength twice a week, adding weight or reps.","Try one new vegetable a week. Keep sushi night."],
  "Car":["Your earliest road-test date is permit date + 90 days. Book it through the DMV online appointment system.","Optional but wise: 1–2 lessons with a licensed driving school before the test. The vehicle must be registered, insured, and safe, which is hard to arrange without a car; ask your instructor whether theirs can be used.","Review the road-test checklist: mirrors, signals, full stops, parking."],
  "Job & benefits":["Interview prep: three stories using the “situation, action, result” frame.","Negotiate: ask about benefits start date, health insurance cost, remote flexibility, and PTO before accepting.","Keep applying until you have a signed offer."],
  "Money":["License bucket: $84 ready.","Once you have income, set up an automatic transfer to the Car Fund, even $10 a week."],
  "Mind":["Pick one muse of the month (see Plan → Atelier) and channel her once a week.","Anxiety plan for the test: write a pre-test routine."],
  "Joy":["Adventure: a hike or a long forest walk.","Farmers market or flea market trip when the season opens."]},
 rw:["$0: a night of your favorite dark-academia film marathon","~$10: a flower bundle for your table"],
 ms:["Weight −24 lbs (or on trend)","Road test booked","Final-round interview or offer","Benefits questions asked in writing","Car Fund auto-transfer started"],
 slip:"If April slides: book the road test and send three applications. Those two keep the machine running."},

{id:"2027-05",lbl:"May 2027",ph:"Momentum",gh:"bloom",lost:31,
 line:"Every door you knocked on starts to open. Try not to look surprised, it’s rude.",
 f:["8k steps; strength twice a week.","Pass the road test.","Sign an offer with benefits."],
 sec:{
  "Body":["Steps toward 8k. A weekend long walk of 45–60 minutes.","Strength twice a week; test a new move once a month.","Hydrate and eat before the road test. Stress plus an empty stomach is a recipe for jitters."],
  "Car":["Take the road test. If you fail, the retest fee is $40. It’s a data point, not a verdict.","License fee: $84. Bring everything the DMV lists.","Once licensed, get insurance quotes before shopping for a car: a family policy may be the cheapest path."],
  "Job & benefits":["Accept the offer in writing. Confirm start date, pay, schedule, benefits start.","Enroll in benefits on time (deadlines are short).","Quit nothing important yet: keep the gig until the new job’s first paycheck lands."],
  "Money":["Create the first real monthly budget with actual take-home pay.","Rule of thumb: pay buckets first (Car, Emergency), then spend."],
  "Mind":["Give yourself a day to feel proud. You did this.","Debrief with your therapist or journal about the wins and the fear."],
  "Joy":["Adventure: a day trip somewhere new (bus, train, or a friend).","Celebrate small: a candle dinner for one."]},
 rw:["$0: sunrise or sunset walk with a thermos","~$20: dinner out or sushi"],
 ms:["Weight −31 lbs (or on trend)","Road test passed (or retest booked)","License issued","Offer accepted","Benefits enrolled"],
 slip:"If May slides: the road test and a job offer are the only critical items. Reschedule, don’t abandon."},

{id:"2027-06",lbl:"June 2027",ph:"Momentum",gh:"keys",lost:38,
 line:"Keys, paychecks, and a knight who turns up. I’d have found you a goat for this.",
 f:["8–10k steps; strength 3× a week if energy allows.","First solo drive somewhere beautiful.","Start the job strong; automate savings."],
 sec:{
  "Body":["Steps toward 8–10k; strength 2–3 times a week.","Yoga 15 minutes most mornings. It’s now a habit, not a task.","Do a monthly measure check-in: waist, how clothes fit, how stairs feel."],
  "Car":["Drive solo to somewhere beautiful, with a playlist. Your first freedom drive.","Set a realistic Car Fund goal: car plus first-year insurance, registration, taxes, and a repair cushion. Update it on the Tracks page.","Buy yourself a bumper sticker for the future car. It’s a promise."],
  "Job & benefits":["Learn the job like you’re writing a field guide. Ask what “good” looks like at 30, 60, 90 days.","Do excellent work first. Efficiency comes from mastery, and then you can use your freed-up time well.","If the job isn’t landed by now, trigger Plan B: temp agency work, retail or warehouse with benefits, a CT state job application."],
  "Money":["Automate: 20% of take-home goes to savings the day you’re paid.","Pay any small debts first. Check your credit report free at annualcreditreport.com."],
  "Mind":["Re-read the “why” section on the Map page. Notice what changed.","Therapy or a skills group: keep the ground you’ve built."],
  "Joy":["Adventure: a solo day trip with a book and a tea.","Host a movie night with a friend or a family member."]},
 rw:["$0: a full day outside","~$15: a new tote or notebook in your palette"],
 ms:["Weight −38 lbs (or on trend)","First solo drive","Started job or in final-stage Plan B","Savings auto-transfer running","Car Fund goal set realistically"],
 slip:"If June slides: reread your why, take a Moth day, and restart with one tiny task."},

{id:"2027-07",lbl:"July 2027",ph:"Wheels",gh:"wander",lost:45,
 line:"Choose the car with your eyes open. Rush it and the hedgehog gets the sardines.",
 f:["Steps 8–10k; lifts 3×/week.","Shop cars with a pre-approved budget and a mechanic.","First 60 days at work: reliability."],
 sec:{
  "Body":["Keep steps 8–10k and lifts 2–3×/week.","Summer food: fruit, grilled veggies, big salads. Keep the cheese.","Hydrate and protect your sleep window."],
  "Car":["Set a firm max price. Get pre-approved at a credit union before you walk into a dealership.","Look for a Kia Soul (or equal) with a clean history report. Always pay an independent mechanic to inspect before buying, typically $100–200.","Get insurance quotes for specific cars. Insurance costs vary hugely by model and driver."],
  "Job & benefits":["Check in with your manager at 60 days: what’s going well, what to improve.","Look into 401(k) match, HSA/FSA, and other benefits. Free money."],
  "Money":["Emergency fund starter: aim for a first $500–1,000.","Review the budget: adjust buckets."],
  "Mind":["Summer reset: a half-day with nothing scheduled.","Therapy: bring the goals update."],
  "Joy":["Adventure: a road trip day (with a friend or alone) once you’re confident.","Beach or lake day. Bring a book."]},
 rw:["$0: stargazing with a blanket","~$10: an iced matcha outing"],
 ms:["Weight −45 lbs (or on trend)","Max car price and insurance quotes done","Two cars test-driven","Emergency fund $500+","60-day work check-in done"],
 slip:"If July slides: don’t buy a car under pressure. A rushed purchase costs more than waiting a month."},

{id:"2027-08",lbl:"August 2027",ph:"Wheels",gh:"gold",lost:52,
 line:"The car you chose, the stickers you earned. Put them on straight.",
 f:["Steps 10k; lifts 3×/week.","Buy the car (if the fund allows) and insure it.","Keep savings automatic."],
 sec:{
  "Body":["Reach 10k steps on at least half your days.","Strength 3×/week with real progress logged.","Celebrate non-scale wins: stairs, clothes, energy."],
  "Car":["Buy with cash or a small, sensible loan. Read every document. Don’t sign what you don’t understand.","Insure before you drive off the lot. Register at the DMV.","Bumper stickers + decor: this is the fun part. Pick three that are truly you."],
  "Job & benefits":["Aim for a measurable win at work (a process you improved, praise from a lead).","Update your résumé with the new accomplishments, even if you’re staying."],
  "Money":["Adjust the budget for car costs: gas, insurance, maintenance.","Keep the 20% auto-savings going."],
  "Mind":["Weekly review: what is the one thing that most reduced stress?","Therapy: celebrate agency."],
  "Joy":["Adventure: first drive-to destination (a day trip you’ve always wanted).","Playlist for the car."]},
 rw:["$0: a sunrise drive","~$20: bumper stickers or car decor"],
 ms:["Weight −52 lbs (or on trend)","Car purchased and insured (or plan B)","License + registration handled","Bumper stickers applied","First drive-to adventure"],
 slip:"If August slides: don’t skip insurance. A paused purchase is fine, an uninsured one isn’t."},

{id:"2027-09",lbl:"September 2027",ph:"Wheels",gh:"kohl",lost:59,
 line:"The ordinary mornings become yours. They take longer than you’d think.",
 f:["Steps 10k; lifts 3×/week.","Settle into the car and commute routine.","Lay down FIRE basics: automatic investing."],
 sec:{
  "Body":["Keep steps and strength steady. Pick a fall walking route you love.","Slow cooker or sheet-pan meals for busy weekdays.","Dress in the palette you love. Clothes fit differently now."],
  "Car":["Oil change schedule, tire pressure, a small emergency kit in the trunk.","Know your insurance policy and roadside coverage."],
  "Job & benefits":["Review your benefits and set contributions to get the full employer match if there is one.","Keep a “wins” document at work for performance reviews."],
  "Money":["Open a Roth IRA or equivalent if it fits your budget. A FIRE-style path starts with boring index funds. (Read The Simple Path to Wealth first.)","Savings fund for 2028 (apartment deposit + move + furnishings): set the number."],
  "Mind":["Autumn ritual: a cozy corner for reading and tea.","Therapy: update goals for 2028."],
  "Joy":["Adventure: a fall festival or small-town drive.","Dinner at home with someone you like."]},
 rw:["$0: a leaf-peeping walk","~$12: a good candle for fall"],
 ms:["Weight −59 lbs (or on trend)","Emergency kit and car maintenance plan","Investing account opened","2028 savings goal written down","One fall adventure done"],
 slip:"If September slides: keep auto-savings going and petrol in the tank. The rest is flexible."},

{id:"2027-10",lbl:"October 2027",ph:"Harvest",gh:"fig",lost:66,
 line:"Whimsigoth season. Make something, and make it in good boots.",
 f:["Maintain steps and strength.","Write and submit one piece to a lit mag.","Draft your first video-essay outline (for fun, no pressure)."],
 sec:{
  "Body":["Keep the routines; add a Sunday long walk to forests or neighborhoods you love.","Hot tea and soups: easy fall nutrition.","Check how your body feels now: strength, energy, back and neck pain."],
  "Car":["Prepare for winter: tires, wipers, scraper, blanket.","Get a roadside assistance plan if you don’t have one."],
  "Job & benefits":["Prep for mid-year or year-end review: collect wins, ask for a raise if appropriate.","Network inside and outside the company."],
  "Money":["Savings fund: aim to be on track for your 2028 number.","Pay off any high-interest debt aggressively."],
  "Mind":["Creative day once a week: write, record, sketch.","Submit one piece to a literary magazine (free-to-submit ones first). Rejection is part of the process; keep a “rejections” list like a trophy."],
  "Joy":["Adventure: a ren faire, a haunted walk, or a pumpkin patch.","Friendsgiving planning."]},
 rw:["$0: a spooky-movie marathon at home","~$15: a vintage find"],
 ms:["Weight −66 lbs (or on trend)","Winter car prep","One submission sent","One video-essay outline drafted","Savings on track"],
 slip:"If October slides: submit one piece and keep savings automatic. Creativity is a long game."},

{id:"2027-11",lbl:"November 2027",ph:"Harvest",gh:"pomegranate",lost:73,
 line:"Gather the harvest and plan the next door. I’ll be moaning about the packing.",
 f:["Keep habits steady through the holidays.","Research apartments for 2028 (cost, neighborhoods).","Build the savings fund."],
 sec:{
  "Body":["Holiday plan: eat the good thing slowly, then walk. No punishment, no guilt.","Keep steps and strength. Sleep first."],
  "Car":["Winter driving: slow down, increase following distance, check forecasts.","Save the receipts for a year-end review."],
  "Job & benefits":["Open enrollment: review your benefits and adjust.","Ask about remote flexibility and growth paths."],
  "Money":["Research rent in your area and in your 2029 target cities (Rochester, Buffalo, Chicago, Boston).","Check your credit; fix any errors."],
  "Mind":["Gratitude list: 10 things this year taught you.","Therapy: how do you want to feel in 2028?"],
  "Joy":["Friendsgiving or a quiet candlelit dinner.","Adventure: a day trip to a nearby city."]},
 rw:["$0: tea and a gratitude letter to yourself","~$15: a thrift velvet blazer"],
 ms:["Weight −73 lbs (or on trend)","Apartment research started","Benefits open enrollment done","Credit report checked","Gratitude list done"],
 slip:"If November slides: protect sleep and savings. Everything else bends."},

{id:"2027-12",lbl:"December 2027",ph:"Harvest",gh:"crown",lost:80,
 line:"End of Book I. You said you’d become someone else, and I watched you do it, which I’ll deny.",
 f:["Celebrate and measure.","Define maintenance mode.","Write the 2028 map."],
 sec:{
  "Body":["Measure, don’t judge: weight, waist, steps, strength, energy.","Define maintenance: a range you can live with, and the habits that hold it.","Photo recap: if it feels good, take one; if not, skip."],
  "Car":["Year-end car check: oil, tires, insurance renewal.","Update your bumper stickers if you want."],
  "Job & benefits":["Review the year: wins, raises, learning, what’s next.","Update the résumé even if you’re staying."],
  "Money":["Review the year: savings, debt, net worth.","Set the 2028 targets: savings fund, apartment deposit, solo trip."],
  "Mind":["“Burn and Bloom” ritual: write what you’re releasing, then what you’re planting.","Celebrate your village: thank-you notes."],
  "Joy":["Adventure: your biggest yet, even if small. A solo night in a nearby city?","New Year’s: plan how you’ll start 2028."]},
 rw:["$0: a letter from 2027-you to 2030-you","~$30: a nice dinner or something that marks the year"],
 ms:["Weight −80 lbs (or best honest number)","Year review written","2028 targets set","Thank-you notes sent","Celebrated on purpose"],
 slip:"If you didn’t hit every number: look at the machine you built. Insurance, license, job, car and habits are the real win."}
];

const YEARS=[
 {y:"2027",t:"Book I · The Trial",big:"I",items:[["The Iron and the Long Walk (weight)","−80 lbs by December, about 1.5 lbs a week on average. Strength, walking and mobility are the point. Your doctor’s guidance outranks any number, mine included."],["The Wheels (car)","Permit, license, insurance quotes, buy. Honest budget, no shortcuts."],["The Posting (a good job with benefits)","Insurance, income, taxes, independence."]],
  why:{"Weight":["confidence","privilege","health","mobility","strength","ability","easier","quality of life"],"Car":["mobility","freedom","agency","security","easier","bumper stickers","normative","come and go without waiting on anyone’s schedule"],"Job":["money","insurance","freedom","security","taxes","fund the lifestyle","independence","agency","normative"]}},
 {y:"2028",t:"Book II · The Road",big:"II",items:[["The Hoard (savings fund)","The cushion that makes everything else possible."],["The Keep (your own apartment)","Persian rugs, velvet, a door you control. Furnish it slowly, and pick the lampshade with care."],["The Far Shore (a solo trip)","The first of many. I’ll moan about the packing."]]},
 {y:"2029",t:"Book III · The Crossing",big:"III",items:[["The Border (move to Rochester, Buffalo, Chicago or Boston)","Research starts in November 2027. Calbert lays out the options and takes no side."],["The Scrying Glass (the YouTube channel)","Thinkpieces through a sociological lens."],["The Invitation (a date for New Year’s)","An invitation, not a project."]]},
 {y:"2030",t:"Book IV · The Coronation",big:"IV",items:[["The north star self","A maker of meaning. Free. Joyful. A curse-breaker. Calbert would like you to write this year’s three Great Quests yourself, and he’ll complain about whichever you choose."]]}
];

const CAR_STEPS=["Work Zone Safety course done","Practice tests scoring 22+/25","DMV hub appointment booked","Permit passed ($59)","90 days held (mark the date in Notes)","Road test booked","License issued ($84)","Insurance quotes gathered","Car Fund goal set","Car purchased","Bumper stickers applied"];
const JOB_STEPS=["HUSKY active","Résumé v1","LinkedIn live","Target list built","10 applications","First interview","Second-round interview","Offer","Accepted + benefits enrolled","Auto-savings started"];
const HEALTH_STEPS=["HUSKY application submitted","HUSKY active","Primary care visit","Labs discussed (energy, sleep, thyroid, vitamins)","Therapy intake","Dental checkup (ask what HUSKY covers)","Sleep window protected 5 nights a week","Strength routine 2× / week"];
const BUCKETS=[["permit","Permit",59],["license","License",84],["emergency","Emergency starter",1000],["car","Car fund",null],["future","2028 savings",null],["other","Other",null]];


const AESTHETIC=[
 ["Aesthetic","Whimsigoth at the centre, with dark academia, granola goth, dark/zen goth, corporate goth and the dark feminine all leaning in."],
 ["Inspirations","Villanelle, Henry Winter, Parisa from The Atlas Six, Marya Morevna, Baba Yaga, Alexa Chung and Charli XCX for the look; Tartt, Gaiman, Bardugo, Schwab and Awad for the mood."],
 ["Texture","Silk, velvet, lace, leather, linen and cotton. Cool, breathable layers that drape, grounded by a heavy boot."],
 ["Sensory","Gauzy morning light filtered through colored curtains, candlelit quiet evenings, sheets that slip and whisper around the body, homemade jasmine matcha lattes and earl grey coffees, incense and records on the record player, little rituals, groomed hair and fingernails."]
];
const TOOLKIT={
 reset:[
  "<b>Missed a day:</b> do a Moth day tomorrow. Nothing to make up.",
  "<b>Missed three days:</b> pick ONE ritual (the warm cup, a stretch, or a walk) and one two-minute task. Do both before noon. Write the date in your journal and carry on. I’ve watched worse come back from further.",
  "<b>Missed a week:</b> skip the guilt scan. Open Today, pick the Moth, tick one box. Then book the next real appointment on your calendar.",
  "<b>Missed a month:</b> the plan paused. Nothing failed. Go back to the Prologue steps (HUSKY, $59, appointment, résumé), whichever isn’t done, and rebuild from there.",
  "<b>Ever-present rule:</b> never zero twice."],
 proc:[
  "<b>Two-minute door:</b> open the thing, don’t do the thing. The brain relaxes when it’s a door and not a mountain.",
  "<b>Body double:</b> work next to a person, or a “study with me” video on a laptop. Free and surprisingly strong. It’s what the familiar is for.",
  "<b>Timer sprints:</b> 10 minutes on, 5 off. Stop when the timer stops, even if you’re on a roll. The stopping is what makes tomorrow easier.",
  "<b>Make it physical:</b> stand up, put the phone in another room, set one object on the desk that belongs to the task.",
  "<b>Name the first micro-action:</b> not “do résumé” but “open the doc and type my name”.",
  "<b>Pair it:</b> tea + task, playlist + task, candle + task. Pairing builds the rails.",
  "<b>Reduce decisions:</b> pick tomorrow’s three errands tonight. Deciding is the hard part.",
  "<b>The three-day rule:</b> anything undone for 3 days gets cut to 2 minutes and done, or deleted on purpose. The dead pigeon is a case study."],
 candle:[
  "Drink water and something warm","Wash your face","Lie on the floor for 5 minutes with a podcast or music","Open one tab and close all the others","Put one thing back where it belongs","Text one person a heart","Walk to the mailbox or the end of the street","Eat a piece of fruit","Stretch your neck and shoulders","Open your HUSKY or DMV page, just look","Put on the comfortable thing","Do the night skincare ritual early, then rest"],
 shame:[
  "<b>Notice:</b> “There’s shame.” Name it. You’ve already stepped one inch back.",
  "<b>Check the story:</b> fact, or an old voice? Write one fact and one feeling.",
  "<b>Speak to yourself like a friend:</b> what would you say to someone you love in this exact spot?",
  "<b>One small repair:</b> not a punishment, a step. Wash a cup. Send the email.",
  "<b>Afterwards:</b> write one line about what helped. Future you will want it."],
 planb:[["Weight",["B: walking + produce only (drop strength for a month)","C: just the evening walk and the sleep window","Ask the doctor about nutrition support (a registered dietitian) under your coverage"]],["Car",["B: buy a cheaper, older car; or be added to a family policy","C: hold the permit, practice, and use transit/ride shares until the fund catches up","If the road test goes badly: the retest fee is $40; book a lesson, re-book"]],["Job",["B: temp agency, state job, or retail/warehouse with benefits","C: keep the AI gig plus a part-time benefit-eligible job","Anything that carries insurance counts as a stepping stone"]]],
 reward:["<b>$0:</b> a bath, a long walk with a playlist, a day with no inbox, a favorite chapter, calling a friend, sunrise at a window","<b>$5–10:</b> a fancy tea, a thrifted book or scarf, a candle, a flower, a café matcha","<b>$20+:</b> dinner out, sushi, a book haul, a new palette piece for your closet","<b>Rule:</b> reward showing up; never reward or punish with skipped meals or starving, and never reward yourself with something that undermines the goal."],
 resources:["<b>HUSKY / Access Health CT:</b> accesshealthct.com or 1-855-805-4325 (applications year-round)","<b>CT DMV:</b> ct.gov/dmv. Driver’s Manual PDF, Work Zone Safety course, appointment scheduling","<b>Your library:</b> a card gives you Libby, Hoopla, free events, and quiet places to work","<b>VITA:</b> free tax-filing help for lower incomes (IRS.gov)","<b>2-1-1 Connecticut:</b> dial 211 for food, utilities, and local benefit help","<b>YouTube:</b> yoga with Adriene, beginner strength, “study with me” rooms","<b>ctbhp.com:</b> finding behavioral-health providers under HUSKY","<b>Community health centers (FQHCs):</b> sliding-scale care and help with applications","<b>SNAP/food help:</b> check eligibility at connect.ct.gov if food budget is tight"],
 doctor:["My energy is low most days. What could be contributing (sleep, thyroid, vitamin D, iron, mood)?","I have trauma-related symptoms, depression, and anxiety. What therapy options fit (trauma-focused, EMDR, somatic)?","I’m wondering about ADHD / autism / OCD. How do I get evaluated?","I’d like to lose weight safely. What pace and strategies do you recommend for me?","Are there dietitian, dental, or vision benefits I should use?","What should I watch for as I start walking and strength training?","(If cycles are irregular or painful) Here’s my cycle log from the app. What should we look at?"],
 whimsi:["Light a candle before the first task","Matcha / tisane in your favorite cup","Pomegranate or fig as a snack","Kohl, tinted lip, or a single ring: a one-minute ritual","Velvet or silk robe while journaling","Play-by-post reply by lamplight","Tarot or tea-leaf pull as a journaling prompt (the meaning is the story you make)","Crystals or small protection spells as intention rituals","A thrift or flea-market trip as your monthly adventure","Persian rug dreaming: save a ‘2028 apartment’ board of images"],
};

/* ===== prompts, lines, journal blocks ===== */
/* ============================================================
   north star — words: journal prompts, weekly prompts, recs, lines
   (all editable; original writing, plus your own rules and statements)
   ============================================================ */
const JBLOCKS=[
 ["anchor","Anchor","ph-compass-tool","Pull yourself toward the version of you who already lives the life."],
 ["reflect","Reflect","ph-notebook","What actually happened, and what it taught you."],
 ["shadow","Shadow","ph-moon-stars","Honest, and you can stop whenever you like. A Moth day counts."],
 ["track","On track","ph-path","Turn the day into a plan, so tomorrow is easy to start."]
];
const PROMPTS={
 anchor:[
  ["Walk me through your north star morning: the light, the sheets, the first sound. Which ten percent of it did you actually live today? And what one small thing would make tomorrow’s morning eleven?","Take your time, I’m not going anywhere. [He glares up at the LED bulb.] Neither is that."],
  ["What did you wear, eat, read or listen to today that felt like the person you’re turning into? And what was the old default up to in the meantime?","Small proof counts. I’ve been fooled by smaller, and I’m very hard to fool."],
  ["Pick a muse. Joan, Tartt, Bourdain, Villanelle, Alexa, Bowie, whoever turns up. What would they have done with your worst hour today? Then shrink it to something you could do before the kettle goes cold.","I’d pick the Fox for this, but nobody asked me. Nobody ever asks me."],
  ["Finish the sentence “At my core, I am a person who…” and use only things that actually happened today. No wishes. I’ll know.","Wishes go in the drawer marked later. It’s a big drawer. Hmph."],
  ["Count your wealth by more than money: creative output, novelty, laughs, reading and making, rest, calm, safety. Which came in today, and which are overdrawn?","I’d bet sardines on the overdrawn one. [He mutters a figure, then thinks better of it.] Write it down anyway."],
  ["Describe tomorrow’s workspace the way your north star self would have it. What’s on the desk, what’s gone, what’s in the cup? Then set up one piece of it tonight.","Tomorrow’s you hates deciding things. I’m told that’s the whole trouble."],
  ["Where did you widen the surface area of your life today, so luck could find you? A message, a new street, a yes you nearly skipped.","Luck has terrible manners. It only comes in if the door’s open. [He taps his foot on the lampshade.] Open it."],
  ["Check in with the body, the way 2030-you would. How did it feel today, and how does it feel now? What’s one decent thing you did for it?","A glass of water counts. I’m not fussy, and I haven’t the mouth for one myself."],
  ["An aesthetic audit. One detail you added today or want to add: kohl, velvet, a candle, a pomegranate, a rug, a scent. And where does it live?","I’ve been asking for a rug for the lampshade for decades. [He goes quiet.] Nothing. Carry on."],
  ["What would dependable, kind and diligent look like in one thing you did today? One thing, mind.","One is plenty. I’ve watched people try for six and end up in a heap."],
  ["Write a “no worries, I have a backup plan” sentence for something that could go wrong tomorrow. Then write the plan, properly, with a time on it.","Problems hate a prepared household. I’m told this is true of hedgehogs as well."],
  ["Which rule did you keep today: ten a.m., no over-explaining, the three-day rule, one uncomfortable thing, no shame? Which one bent? Data, not a grade.","Nobody’s marking. The Lady doesn’t mark, she only remembers. [He coughs.] Forget I said that."]],
 reflect:[
  ["What happened today? Three sentences. Then tell me what surprised you.","I’ve read longer shopping lists, and the shopping was worse."],
  ["What gave you energy today, and what drained it? Is there a pattern, or is it the email again?","It’s usually sleep, or the email. Don’t look at me like that."],
  ["What are you proud of that nobody saw?","Private wins go in the drawer with the others. I count them. Grudgingly."],
  ["What did you learn today about how you work? Focus, avoidance, time of day, whether the phone was in the room.","Write down whatever turns out to matter. I’ll be over here being right."],
  ["Which feeling was loudest today? Where did it sit in your body, and what did it want?","Feelings turn up uninvited and stay for hours. Ask what it’s after. [He flutters sideways to give it room.]"],
  ["Which conversation or message are you carrying around? Write the kindest honest version of what you’d say.","Plain first, tone second. The three-day rule is watching, I can see it from here."],
  ["What did you do today that Past You wouldn’t have believed?","I barely believe it, and I was in the room."],
  ["What was the best twenty minutes of today? What made it good?","Work out the conditions and steal them for tomorrow. Thieving’s perfectly respectable when it’s your own time."],
  ["What do you want to remember about today in a year?","Boring detail, please. The weather, what the tea was. That’s what goes first."],
  ["If today were a chapter, what would you call it? And what’s the first line of tomorrow’s?","Take as long as you like. I’ve been up since three."]],
 shadow:[
  ["What did you avoid today? Name it plainly. What are you afraid will happen if you do it, and is that fear a fact or an old voice?","I’ve read worse, and I’ve lived with worse. Draughts, mainly. Write it down, then pick the two-minute version of the next step."],
  ["Whose voice does your inner critic use? What did they want from you, and what would the adult you say back?","Give the voice a face and it gets smaller. Most of them do. Then drink some water, someone should."],
  ["Where did shame drive today? Find the exact moment it took the wheel. What did you do next?","Details only. I’ve got all night, and the bulb’s too bright to sleep anyway."],
  ["What are you pretending not to know? What would change if you admitted it, even only here?","You know already. Put it on paper where it can’t loiter in the hallway."],
  ["Which story about yourself repeated today? “I’m lazy”, “I’m behind”, whichever it was. What evidence is there against it?","Treat it as a claim and cross-examine it. I’ll sit at the back."],
  ["What would you do today if nobody could be disappointed in you? Which part of that can you do anyway?","A small part. Not the mountain. The mountain’s got nowhere to be."],
  ["Which part of you is tired of the plan? What does it want, and can you give it ten percent?","Resistance is information that’s been shouted. Ask it nicely and see if it lowers its voice."],
  ["What are you resentful of? What boundary is hiding inside the resentment?","Resentment is usually a boundary nobody’s said out loud. Say it here first. The drawer keeps secrets, I’ve been keeping them for eight hundred years."],
  ["Write to the younger you who learned this avoidance. What did they need to hear, and who should have said it?","Write it properly, in full sentences. They needed it more than anyone let on. [He turns toward the lampshade for a moment.]"],
  ["Where did you over-explain, appease or shrink today? What would the unshrunk version have said?","One clean sentence. Cut the three paragraphs of apology, nobody ordered the paragraphs."],
  ["What are you envious of right now, and what is it pointing at that you actually want?","Envy is a compass in a bad mood. Follow the needle, ignore the sulk."],
  ["What does staying stuck get you? Safety, sympathy, no risk? And what would the author of your story ask of you tomorrow?","Write down what staying put gets you, then ask what tomorrow’s version of you would do about it. Small answer. Practical answer."]],
 track:[
  ["Weight, car, job: what’s the next physical action for each? Which one’s stuck, and why? Time, fear, information, or plain tiredness?","Name the kind of stuck. Each one wants a different fix, and I haven’t the patience to guess."],
  ["What’s the three-day-rule item, the thing that’s been waiting longest? Shrink it to two minutes and write down the first action.","Open the door. Leave the mountain out of it."],
  ["What did you move forward today? If nothing, what’s the smallest thing that still counts?","Never zero twice. I didn’t write that rule, but I’d have liked to."],
  ["What’s tomorrow’s one errand for the Lady, and exactly when and where are you doing it?","A time and a place, in writing. “Sometime” is how emails turn into dead pigeons."],
  ["What got in the way today? How can you remove that friction tonight, before you’re tired?","Fix the room, not the character. I’ve never once fixed a character. [He eyes the bulb.] Rooms, yes."],
  ["Backup plan check. What’s plan B for each priority this week?","One line each. I keep a spare lampshade up my sleeve. Metaphorically, I haven’t got sleeves."],
  ["Money check. What went out today, and did it fund the life you want? Any deposits to the buckets?","Numbers only. I’d say it’s none of my business, but I’ve been handed the sardine fund, so it is."],
  ["What does “good enough” look like tomorrow? Write a finish line you can actually cross.","By Thursday, ideally. Done beats perfect, and perfect never turned up anyway."]]
};


/* original lines, in the voice of the muses */
const LINES=[
 "Wear the good socks. Nobody checks, but you’ll know, and so will I.",
 "A Moth day counts. I’ve checked with the Lady.",
 "The tea’s gone cold again. I can smell it from the lampshade.",
 "Do the pigeon first.",
 "Small, then smaller, then started.",
 "The email isn’t getting shorter while you look at it.",
 "I’ve been up since three. You can at least open the document.",
 "Make the call. It’ll take less time than this sentence took you to read.",
 "Ten pages. I’d read twenty, but I’m busy holding a grudge.",
 "Dress like someone with somewhere to be, even if it’s only the kitchen.",
 "Shame doesn’t pay my wages. Leave it at the door with the sardines.",
 "Three days. That’s the rule. I didn’t write it, I just enforce it.",
 "A walk. The hallway counts. I’m not proud.",
 "Write the true sentence, then keep going. I’ll pretend I’m not reading.",
 "One uncomfortable thing, and let it turn into an anecdote.",
 "The Lady has been informed. She was unmoved, which is her way of being pleased.",
 "Water. Drink some. I’m told it’s good for the ones with mouths.",
 "Leave the door open for luck. It doesn’t knock, it shuffles.",
 "Kohl, coffee, courage, in any order. I’d add a cuppa, but I can’t.",
 "Tidy one surface. Not the flat, one surface.",
 "Nobody’s coming to rescue the schedule. The hedgehog is busy.",
 "Your future flat already has a rug in it. Go and get the rug money.",
 "Be in bed before it’s embarrassing. I won’t say what time that is.",
 "Reply to the message. Within three days is a perfectly civilised window.",
 "Borrow a muse for the day and return her in decent condition.",
 "Poetry is only paying attention on purpose. Pay some.",
 "I once stood on a windowsill for a decade for less. Get on with it.",
 "Whatever you’re turning into, I’d like it done by supper.",
 "Do the boring healthy thing again today. That’s what ends a curse, apparently.",
 "Say yes to the small adventure. The sofa will still be there."
];

/* ---------- Calbert: pools, stars and the Run ---------- */
const CAL_RUNS=[3,7,14,30,60,100,200,365],CAL_STARS=[10,25,50,100,250,500,1000];
const CAL_RUN={3:"Three in a row. Don’t get ideas. [He does a small lap of the lampshade.]",7:"Seven days. In my day that got you a goat. I haven’t got a goat. There’s a star by your name instead, and it’s glued on, so don’t pick at it.",14:"A fortnight. The hedgehog owes me sardines and I’m furious about it.",30:"Thirty days. I’ve started leaving the lamp on for you. Don’t tell the Lady about the electricity.",60:"Sixty. I’ve stopped keeping count, which means I’ve been keeping count.",100:"A hundred days. In my day that got you a village and a sheep. I’ve got neither. [He flutters in a tight circle, then pretends he didn’t.]",200:"Two hundred. I’d need a bigger jar to be dissolved in. Hmph.",365:"A full year. The Lady has been informed, and she asked me to say nothing. I’ve said it anyway."};
const CAL_STAR={10:"Ten stars. They’re glued on. Stop checking.",25:"Twenty-five. The drawer’s getting heavy.",50:"Fifty stars. I ran out of glue at forty and used jam.",100:"A hundred stars. I told the hedgehog and he wanted odds.",250:"Two hundred and fifty. I’d bet a tin of sardines you couldn’t count that high. You can. Hmph.",500:"Five hundred stars. The lampshade is getting crowded.",1000:"A thousand stars. I’m not crying, it’s the LED bulb."};
const CAL_BACK=["You’re back. I’ll say nothing about it, loudly.","Back again. The Lady has been informed, and she wasn’t surprised. She’s never surprised, it’s tiresome.","There you are. The road’s where you left it. Sit down, I’ll watch."];
const CAL_CLOSE=["Sealed. It’s in the drawer with the others.","Day closed. I’ll tell the Lady, and she’ll pretend not to be pleased.","That’s the day done. Go and put the kettle on, I’ll supervise.","Closed. The hedgehog just lost a bet, and I couldn’t be happier about it.","Done for today. Even the LED bulb looks impressed. Hmph.","Closed, and you did it without making a speech. I approve."];

/* ===== the four-year syllabus (canon for monthly picks) ===== */
/* north star — the four-year cultural syllabus (Nov 2026 – Dec 2029). id | fiction | nonfiction | films ; | albums ; */
const SYL_YEARS={"2026":["The Thaw & Foundation","Breaking the freeze state, dismantling shame, and establishing the baseline aesthetic."],"2027":["Weight / Car / Job","Physical autonomy, financial baseline, reclaiming mobility, and corporate survival."],"2028":["Savings / Apt / Trip","Nesting in dark opulence, FIRE method hoarding, global exploration, and expanding the surface area of your life."],"2029":["Move / YT / NY date","The NYC leap, launching the video essay channel, and embodying the fully realized, secure themme fatale in romance."]};
const SYL_RAW=`2026-11|Babel by R.F. Kuang|Laziness Does Not Exist by Devon Price|Only Lovers Left Alive;A Girl Walks Home Alone at Night;The Handmaiden;Frances Ha|The Idler Wheel... (Fiona Apple);Heaven To A Tortured Mind (Yves Tumor)
2026-12|The Secret History by Donna Tartt|How to Keep House While Drowning by KC Davis|The Dreamers;Saltburn;Girl, Interrupted;The Duke of Burgundy|Brat (Charli XCX);Fetch the Bolt Cutters (Fiona Apple)
2027-01|My Year of Rest and Relaxation by Ottessa Moshfegh|The Body Is Not an Apology by Sonya Renee Taylor|Raw;Fight Club;Bottoms;Jennifer's Body|Live Through This (Hole);The Rise and Fall of Ziggy Stardust (David Bowie)
2027-02|The Atlas Six by Olivie Blake|I Will Teach You to Be Rich by Ramit Sethi|Drive;Nightcrawler;Titane;Taxi Driver|Homogenic (Björk);Puberty 2 (Mitski)
2027-03|Eileen by Ottessa Moshfegh|Unmasking Autism by Devon Price|Black Swan;Suspiria (1977);The Witch;Stoker|Norman Fucking Rockwell! (Lana Del Rey);Hounds of Love (Kate Bush)
2027-04|The Magicians by Lev Grossman|Bad with Money by Gaby Dunn|Party Monster;The Doom Generation;Thirteen;Kids|Is This It (The Strokes);Fever to Tell (Yeah Yeah Yeahs)
2027-05|Boy Parts by Eliza Clark|Burnout by Emily & Amelia Nagoski|American Psycho;The Wolf of Wall Street;High Fidelity;Ghost World|Post (Björk);Dirty (Sonic Youth)
2027-06|Ninth House by Leigh Bardugo|The Bullet Journal Method by Ryder Carroll|The Craft;Practical Magic;The Love Witch;Heathers|Rumours (Fleetwood Mac);Lungs (Florence + The Machine)
2027-07|Bunny by Mona Awad|Financial Feminist by Tori Dunlap|Marie Antoinette;The Virgin Suicides;Pearl;X|Art Angels (Grimes);Electra Heart (MARINA)
2027-08|Wuthering Heights by Emily Brontë|Atomic Habits by James Clear|Portrait of a Lady on Fire;The Favourite;Carol;Ammonite|The Velvet Underground & Nico;Chelsea Girl (Nico)
2027-09|The Picture of Dorian Gray by Oscar Wilde|Drive by Daniel Pink|Dead Poets Society;Kill Your Darlings;Cruel Intentions;Rushmore|the record (boygenius);Punisher (Phoebe Bridgers)
2027-10|The Vegetarian by Han Kang|Witchcraft by Judika Illes|Thirst;Let the Right One In;Bram Stoker's Dracula;Interview with the Vampire|Turn On The Bright Lights (Interpol);Unknown Pleasures (Joy Division)
2027-11|Circe by Madeline Miller|The 4-Hour Workweek by Timothy Ferriss|Mad Max: Fury Road;Thelma & Louise;Baby Driver;Locke|MAGDALENE (FKA twigs);RENAISSANCE (Beyoncé)
2027-12|In the Dream House by Carmen Maria Machado|Quiet by Susan Cain|Edward Scissorhands;The Nightmare Before Christmas;Eyes Wide Shut;Phantom Thread|Vespertine (Björk);When the Pawn... (Fiona Apple)
2028-01|A Certain Hunger by Chelsea G. Summers|The Simple Path to Wealth by J.L. Collins|Lost in Translation;Spirited Away;In the Mood for Love;Chungking Express|Dummy (Portishead);Mezzanine (Massive Attack)
2028-02|Severance by Ling Ma|The Psychology of Money by Morgan Housel|Parasite;High-Rise;The Grand Budapest Hotel;Snowpiercer|AM (Arctic Monkeys);Room on Fire (The Strokes)
2028-03|The Goldfinch by Donna Tartt|Kitchen Confidential by Anthony Bourdain|The Menu;Pig;Boiling Point;Tampopo|Blue (Joni Mitchell);Either/Or (Elliott Smith)
2028-04|Convenience Store Woman by Sayaka Murata|The Gentle Art of Swedish Death Cleaning by M. Magnusson|Amélie;Before Sunrise;Paterson;Y Tu Mamá También|Rid of Me (PJ Harvey);To Bring You My Love (PJ Harvey)
2028-05|Out by Natsuo Kirino|Vagabonding by Rolf Potts|The Darjeeling Limited;The Motorcycle Diaries;Wild;Call Me By Your Name|Horses (Patti Smith);Marquee Moon (Television)
2028-06|The Song of Achilles by Madeline Miller|Die With Zero by Bill Perkins|The Talented Mr. Ripley;A Bigger Splash;Stealing Beauty;Midsommar|Ctrl (SZA);Melodrama (Lorde)
2028-07|The Guest by Emma Cline|A Field Guide to Getting Lost by Rebecca Solnit|The Wicker Man (1973);A Field in England;The Green Knight;The Bling Ring|Hozier (Hozier);Ceremonials (Florence + The Machine)
2028-08|My Dark Vanessa by Kate Elizabeth Russell|Radical Acceptance by Tara Brach|Spring Breakers;Zola;American Honey;Good Will Hunting|Arular (M.I.A.);Kala (M.I.A.)
2028-09|If We Were Villains by M.L. Rio|The Life-Changing Magic of Tidying Up by Marie Kondo|A Beautiful Mind;The Social Network;Steve Jobs;Suspiria (2018)|The Queen Is Dead (The Smiths);Disintegration (The Cure)
2028-10|The Rules of Magic by Alice Hoffman|The Year of Less by Cait Flanders|Hocus Pocus;Sleepy Hollow;The Addams Family;Crimson Peak|Bella Donna (Stevie Nicks);Tidal (Fiona Apple)
2028-11|Perfume: The Story of a Murderer by Patrick Süskind|Big Magic by Elizabeth Gilbert|Pan's Labyrinth;The Shape of Water;Little Women (2019);You've Got Mail|Ray of Light (Madonna);In Rainbows (Radiohead)
2028-12|The City We Became by N.K. Jemisin|Rest Is Resistance by Tricia Hersey|When Harry Met Sally...;The Apartment;Manhattan;Annie Hall|Kid A (Radiohead);Station to Station (David Bowie)
2029-01|City of Girls by Elizabeth Gilbert|Trick Mirror by Jia Tolentino|Mistress America;Paris Is Burning;Style Wars;Do the Right Thing|Illmatic (Nas);Enter the Wu-Tang (36 Chambers)
2029-02|The Bell Jar by Sylvia Plath|On Photography by Susan Sontag|Network;Eighth Grade;The Truman Show;Past Lives|Pure Heroine (Lorde);The Family Jewels (MARINA)
2029-03|Luster by Raven Leilani|Steal Like an Artist by Austin Kleon|Before Sunset;Brief Encounter;Almost Famous;Empire Records|Titanic Rising (Weyes Blood);Historian (Lucy Dacus)
2029-04|Normal People by Sally Rooney|Attached by Amir Levine & Rachel Heller|Dazed and Confused;The Matrix;Videodrome;Blade Runner|Blonde (Frank Ocean);channel ORANGE (Frank Ocean)
2029-05|Tomorrow, and Tomorrow, and Tomorrow by Gabrielle Zevin|Amusing Ourselves to Death by Neil Postman|Her;Reality Bites;Singles;Slacker|KiCk i (Arca);OIL OF EVERY PEARL'S UN-INSIDES (SOPHIE)
2029-06|The Idiot by Elif Batuman|All About Love by bell hooks|Clerks;Symbiopsychotaxiplasm;F for Fake;Medium Cool|Loveless (My Bloody Valentine);Souvlaki (Slowdive)
2029-07|Conversations with Friends by Sally Rooney|The Medium is the Massage by Marshall McLuhan|Blow-Up;Lady Bird;20th Century Women;The Florida Project|The Velvet Rope (Janet Jackson);Blackout (Britney Spears)
2029-08|Play It As It Lays by Joan Didion|Getting Things Done by David Allen|Red Rocket;The Hunger;Nosferatu (1922);Mean Streets|how i'm feeling now (Charli XCX);Pop 2 (Charli XCX)
2029-09|My Brilliant Friend by Elena Ferrante|Trickster Makes This World by Lewis Hyde|Goodfellas;The King of Comedy;Breakfast at Tiffany's;Uncut Gems|The Downward Spiral (Nine Inch Nails);Pretty Hate Machine (Nine Inch Nails)
2029-10|Dracula by Bram Stoker|The Art of Cruelty by Maggie Nelson|Good Time;Climax;Enter the Void;Vampire's Kiss|LP1 (FKA twigs);Third (Portishead)
2029-11|The Master and Margarita by Mikhail Bulgakov|The Creative Habit by Twyla Tharp|Inside Llewyn Davis;The French Dispatch;Moonrise Kingdom;Amadeus|Low (David Bowie);Heroes (David Bowie)
2029-12|The Great Gatsby by F. Scott Fitzgerald|Just Kids by Patti Smith|Metropolitan;Kicking and Screaming (1995);After Hours;New York, I Love You|The Idler Wheel... (Fiona Apple - Rewatch);Crash (Charli XCX)`;
const SYL=SYL_RAW.split("\n").map(l=>{const p=l.split("|");return{id:p[0],f:p[1],nf:p[2],films:p[3].split(";"),albums:p[4].split(";")}});
/* the one source of monthly picks: month page, week R.E.P.O.R.T. and Echoes all read RECS */
const SYL_WHY={"2026-11": "Rage as research. Kuang for the teeth; take notes.", "2026-12": "Tartt for the elegance: beautiful, slightly doomed people, by candlelight.", "2027-02": "Charming, dangerous geniuses.", "2027-04": "Grad-school magic, and the start of the strange spring.", "2027-05": "The book on finishing the stress cycle.", "2027-08": "Moors and mess.", "2027-11": "Witches who come through it.", "2028-01": "Boring index-fund calm.", "2028-03": "The cook’s guide to loving the world.", "2029-12": "Patti Smith for the New York you’ll walk through."};
const RECS={};
SYL.forEach(s=>{RECS[s.id]={fic:s.f,non:s.nf,film:s.films,listen:s.albums,why:SYL_WHY[s.id]||""}});

/* Calbert reads the room: line pools for calLine() in app.js, keyed by trigger */
const CAL_CTX={
 sleep:["Under six hours. You look like something the tide left behind. Drink water, eat something with a crust, and attempt nothing grand until you've stopped squinting.",
"Short night, then. I could tell from the way you came in, all elbows and sighing. The Lady asks nothing of the exhausted except that they stay upright. I'd call that a generous contract.",
"Barely a night's sleep to your name. Dreadful. I've seen candles with more sense. Do the smallest quest on the board and let the rest gather dust where it belongs.",
"You've been robbed of a night, knight, and no one will hang for it. Go easy on the day. Be gentle with it and it may be gentle back. Or it won't, and we'll both be cross.", "Under six hours. Hmph. Nothing is asked of you today but the warm cup, and I’ll hold the lampshade steady.","You slept like a moth in a draught. Go gently. Water, a walk, bed early. That’s the whole sermon.","Short night, I can tell. [dims himself a little] Today’s only job is not making it worse."],
 steps:["Your feet were idle yesterday. The step count sits there accusing no one, though I've half a mind to. Take a walk. Round the block will do. Pretend there's a mystery at the end of it.",
"Short of your steps. A pity. I flap about this lamp all night and still cover a respectable distance. Out of the door, knight. The pavement's been lonely.",
"Yesterday your legs did the bare minimum. Give them an errand today: a lap of the park, the long way to the shop. They'll thank you in their own sullen fashion.",
"Your boots sat by the door all day yesterday, and they're getting ideas about their own importance. Put them on. Remind them who's in charge."
,"Yesterday fell short of the step goal. Don’t fret. Put your shoes by the door and let the door do the persuading.","Few steps yesterday. A lap round the block today and we’ll call it even, the Lady and I.","The step count was low. Hmph. Not a crime. Even the hedgehog manages a loop at dusk."],
 hare:["The Hare, is it? Quick feet and a wild eye. Go on, then. I'll sit here with the stopwatch and my low expectations, and we'll see which of us is proved wrong.",
"A Hare day. All that velocity, and for what? Fine. Sharpen your pencils, knight, and run the course. Mind the ditches.",
"You've chosen the Hare. I can feel the draught from here. Loud, fast, a little ridiculous. Go and make a spectacle of yourself. I'll bring the bandages.",
"The Hare. Of course. You couldn't pick the tortoise like a person with sense. Off you go, then, ears flat, and try to finish more than you start."
,"A Hare day. Fine. I’ll have the sardines ready for after.","You picked the Hare. Bold. Sharp pencils, short sprints, and drink something in between.","The Hare’s out of the box today. Run if you must, but I’ll be watching the clock."],
 period:["First day, and the blood has arrived. Hot water bottle, thick socks, the dullest film you own. The quests will keep. They've kept for centuries.",
"Ah. The moon's taken her tithe again. Today the only thing on the schedule is staying warm. I'll hold the fort and grumble about it so you needn't.",
"Day one, morning star. Heat, tea, something with iron in it. You owe the world nothing until tomorrow, and I'll swear to that before the Lady if I have to.",
"I've no womb and no great gift for sympathy, but I've a fine view of how it goes. Blanket. Bottle. Quiet. Take the day off from being formidable."
,"First day. Blanket, hot water bottle, low expectations. The Moth would approve.","Day one. The drawer’s open if you need it. Everything else can wait.","Here we go again, then. [tucks a blanket round the lamp] Be kind to her today."],
 errand:["One of the Lady's errands, crossed off. She'll hear of it. She won't say a word, she never does, but the candles will burn a shade brighter, and I intend to take that as praise.",
"An errand done. The ledger's been updated in my appalling handwriting. One more thing that was going to fester, and didn't.",
"She asked, you went, and it's finished. I've watched knights take whole seasons to manage that. Don't let it swell your head. Have a biscuit and sit down.",
"Another errand off the list. The Lady's been told, possibly with some embellishment on my part. I'm a messenger. Embellishing is most of the job."
,"An errand for the Lady, ticked off. She’ll pretend not to be pleased. I’ll tell you she is.","One errand down. That’s a step closer to the Lady’s good books.","Ticked off an errand, did you? Hmph. Competence. Carry on."],
 nojournal:["The journal's been shut for days. I looked in on it earlier. Cobwebs, one confused spider. Give it a line, knight. Complaints are traditional.",
"Not a word on the page in days. The ink's drying in the well and I'm too old to watch it happen. Write anything. Tell it what the day tasted like.",
"Your journal's gone very quiet. I only mention it because the silence is giving me a headache. One line. It needn't be good. Most of mine aren't, and I've had centuries.",
"It's been days since you confided in the book, and it's started to sulk. Put it out of its misery. Two words will do, and one of them can be rude."
,"Three days without a word in the journal. The pages are getting dusty. One line will do.","No journal for a few days. I’m not nagging. [nags slightly] One line. A sentence. A word.","The journal’s been quiet. Tell it anything. It keeps secrets better than I do."],
 weighin:["The scale, after all this time. Brave, or bored. It's a number, and the Lady has never once asked to see it. Log it and walk away.",
"You've stood on the thing at last. Write the figure down and let it be the dull fact it is. It can't tell a story. That's my department.",
"First weigh-in in an age. The scale is a tin liar with a good memory, and neither quality makes it your master. Log it. Go and be interesting at something else.",
"A number's been recorded after a long and sullen silence. Good. The ledger likes data the way a dragon likes gold, without discrimination. Don't read into it. Come along."
,"First weigh-in in a good while. A number is only a number, and the Lady doesn’t grade it.","You stepped on the scale after all that time away. Brave. Noted, filed, not judged.","The scale again, after a long gap. It’s data, not a verdict. Hmph."],
 comeback:["Oh, you're back. I kept the lamp lit. I didn't count the days, and I'd thank you not to ask what number I landed on. No lecture. Pick the nearest quest.",
"Well, look what the cat declined to drag in. The lamp's still warm and nobody has mentioned your absence, least of all me. Start small. Smaller than that.",
"There you are. I've spent the interval talking to the wallpaper, which is a poor conversationalist. Sit. Don't explain. Begin anywhere you like.",
"The knight returns, a little rusty, a bit dented. A shiny knight never won anything. The road's where you left it. So am I."
,"Look who’s back. I kept the bulb warm. No questions, no lectures.","You’re back. I didn’t count the days. [counted the days] Start small.","Well. There you are. The lamp stayed lit. Begin anywhere."],
 rituals:["Every ritual done. I went through the list twice, hunting for a loose thread, and found none. Deeply irritating. I had planned to be disappointed in you today.",
"A clean sweep of the rituals. The Lady's been told. She smiled, I think. Hard to say in this light, and I wasn't looking.",
"All of them ticked, morning star. I've nothing to complain about, and I find I don't care for the sensation. Go and sit in a patch of sun before I get used to it.",
"The rituals are finished, every one. A lesser moth would say something sentimental. I'll nod once, curtly, and look away."
,"Every ritual done. I’d say something clever but I’m too busy being proud. Hmph.","All the rituals, ticked. The Lady will hear of this.","A clean sweep of the rituals. Sit down. Have a sardine."],
 morning:["Morning. The sun's up, the light is offensive, and the kettle's the only honest thing in the house. Drink something warm before you start on the world.",
"You're awake. Fine. I've been up since the moths in the walls started their gossip. Water first, then breakfast, then quests. In that order, knight.",
"Good morning, morning star. The name's a bit of a joke at this hour, you'll admit. Tea. Then we'll see what the day has in its pockets.",
"Dawn's gone and made an effort again. Show it some courtesy. Open a window, let the cold in, and tell me what you mean to do with the next twelve hours."
,"Morning. The bulb’s warming up and so am I. Something warm in a cup first.","Good morning. Nothing is urgent before the first sip.","Up, are we? Hmph. Good. Gently now."],
 afternoon:["Afternoon. The slump hour, when the light goes the color of weak tea and everything feels like wading. Eat something. Look out of a window. The quests can wait ten minutes.",
"Middle of the day and the list is half eaten. Good sign or bad, depending on who you ask, and I won't be asked. One more thing, knight, then you may collapse.",
"The sun's tipped over the top and started down the far side. Drink some water. Stretch like a cat that's been insulted. Pick the smallest task left and finish it.",
"It's afternoon, the hour when sensible people have a biscuit and a sit. Do that. Then get back to it."
,"Afternoon. The slump hour. Water, a window, five minutes of nothing.","Middle of the day. Check in with your body before you check anything else.","Afternoon light. A good time to do one small thing and call it plenty."],
 evening:["Evening. The light's thinning and the lamp's coming into its own. Close the loops you can, leave the rest in the drawer. I'm told the dark is for resting. As a moth, I've never managed it.",
"The day's going out like a tide. Tell me how it went. Honestly, now. I'll have my say after, and I'll try not to enjoy it.",
"Evening, knight. Put the armor somewhere it won't clatter. One true line in the journal before the night starts nibbling at it.",
"The windows have gone blue. Wind down, wash up, put something soft on. I'll sit on the shade and watch the dark arrive like a bad relative."
,"Evening. Close the loops you can, leave the rest for the drawer.","The light’s going. Soft lamps, soft thoughts. How was it, really?","Evening, then. Write one true line before the screen eats the night."],
 witching:["Past midnight. Nothing sensible has ever happened at this hour, and I'd know, I've been up for most of it. Bed, knight. The Lady will keep until breakfast.",
"Still up, and I'm the nocturnal one. Even I find that alarming. Whatever it is will look smaller in daylight. Everything does, apart from the bills.",
"The witching hour, and you're hunched over a screen like a gargoyle with a tax return. Go to sleep. The quests aren't going anywhere. They're old and patient, unlike me.",
"It's the small hours, morning star, and nothing you decide now will be right. Put the lamp out. I'll keep watch, grumbling, as is my custom."
,"The witching hour. Nothing good is written at this time. Go to bed; the Lady will be here at breakfast.","Past midnight. Even the hedgehog’s asleep. Off you go.","Still up? Hmph. I’ll keep the lamp low. Go to sleep soon."]
};
