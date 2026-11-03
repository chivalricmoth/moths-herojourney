/* ============================================================
   north star — the world: accents, mantras, patrons, rites, cycle, quests' backbone, satchel
   The month-by-month quests now live in months.js (load it right after this file).
   Real-world facts (HUSKY, DMV, fees, 988) are unchanged. Only the framing is new.
   ============================================================ */
const HOUSES=[['winedark','Winedark',350,42],['clairmont','Moth Violet',270,34],['rosewood','Rosewater',330,34],['ashford','Gloaming',230,38],['witwick','Bog Green',150,32],['harelane','Tidewater',180,34],['commonwell','Candle Amber',30,38]];

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
 "A moth day is still a day I showed up.",
 "Small, then smaller, then started.",
 "Own your weird.",
 "I am a maker of meaning.",
 "PROCEED AND BE BOLD!"
];

/* [name, what she brings, the day's small task] */
const MUSES=[
 ["Joan of Arc","a girl who heard something and simply went","Make the call you've been dreading. Stand up while you do it. Saints are not known for taking calls sitting down."],
 ["Donna Tartt","curated, scholarly elegance","Choose one thing on purpose today: the desk, the outfit, the book. Take away one thing that's only clutter."],
 ["Alice Cullen","bright, uncanny warmth","Be warm first. Greet someone, send one kind text, compliment a stranger and leave before it gets awkward."],
 ["Baba Yaga / Circe","power made out of patience and tools","Treat one dull chore like a working. Slow, exact, finished. Wash the pot, clear one surface, say one boundary out loud."],
 ["Villanelle","audacity, appetite, no apologies","Do one bold, harmless thing that's out of pattern. Say a clean no, with no footnotes."],
 ["Henry Winter","the stillness of someone who has done the reading","Twenty real minutes on the manual or the résumé. Speak a little slower than feels natural."],
 ["Anthony Bourdain","hunger for the world as it actually is","Eat something you haven't tried. Ask someone a real question and listen to the answer. Say yes to one small adventure."],
 ["Charli XCX (post-brat)","dark, sweaty, unbothered","Play one song loud and walk like the pavement owes you rent. Make something raw and show nobody."],
 ["Alexa Chung","the one-minute outfit","Get dressed on purpose, even if the only appointment is your kitchen. Black base, one jewel tone, one warm metal."],
 ["Holly Black","faerie logic, sharp teeth","Write two hundred words with fairy-tale rules: never thank them, never eat there, always read the fine print."],
 ["Fiona Apple","unflinching honesty","Write the true sentence in the journal and leave it unsoftened. No one is grading it."],
 ["David Bowie","reinvention as a method","Change one visible thing: a parting, a playlist, a lipstick, the order of your morning."],
 ["Anaïs Nin","the diary as a second life","Ten honest lines tonight. No editing, no audience, no shame."],
 ["Eliot Waugh / Julia Wicker","wit over relentless study","Do the hard studying first. Then make one joke at your own expense, and make it a kind one."],
 ["Parisa Kamali","strategy with a smile","Plan three moves ahead on one task. Write them down where you'll find them."],
 ["Sarah Manning","scrappy reinvention, many selves, one stubborn spine","Pick the version of you today needs, commit to her bit, and improvise until it works."],
 ["Hecate / Persephone","crossroads, thresholds, the underworld as a second address","Stand at one crossroads on purpose. Write both paths down, then take the smaller step."],
 ["Guillermo del Toro","tender monsters, beautiful dread","Find the strange, tender thing in an ordinary task. Make the workspace a little more cathedral."],
 ["Patti Smith","poet-punk devotion","Make something unpolished and sincere before you look at your phone."],
 ["Kathleen Hanna","loud, collective, unembarrassed","Say one true thing out loud, kindly, once. Then send someone a message of solidarity."]
];

/* g = time of day; t = familiar tier (0 moth, 1 fox, 2 hare) */
const RIT=[
 {id:'water',g:'morning',t:0,l:"Something warm in a cup you love",s:"Matcha, coffee, tea. The first sip is a spell for focus."},
 {id:'wash',g:'morning',t:0,l:"Wash up",s:"Teeth and face, or a shower if you're feeling up to it."},
 {id:'stretch',g:'morning',t:0,l:"Five minutes of floor stretching or yoga",s:"Lying on the floor is a valid position. So is groaning."},
 {id:'tiny',g:'morning',t:0,l:"One work task",s:"Open the page, put on the music, get it done."},
 {id:'yoga',g:'morning',t:2,l:"Full yoga flow (15–20 minutes)",s:"It's free on youtube! Try a new creator every morning until you find one you like."},
 {id:'walk',g:'day',t:1,l:"A walk, any length",s:"Kitchen laps count on bad-weather days. The kitchen has seen worse."},
 {id:'eat',g:'day',t:1,l:"Produce + protein at your meals",s:"Add before you subtract. Aim for color and balance. Aim for an appropriate portion."},
 {id:'mover',g:'day',t:1,l:"One errand for the dear Lady (car, job, or health)",s:"Look at this month's three. Pick the least appealing one and do it first."},
 {id:'uncomf',g:'day',t:1,l:"One uncomfortable thing",s:"A call, an email, the thing you've been circling like a nervous cat."},
 {id:'lift',g:'day',t:2,l:"Strength session",s:"Two or three a week is plenty. Today, if it's a lifting day."},
 {id:'social',g:'day',t:2,l:"Reach out to one human",s:"A text counts. Relationships are built out of small, boring deposits. So is muscle memory."},
 {id:'read',g:'evening',t:1,l:"Read ten pages: fiction or nonfiction",s:"One of each is the long-term plan. Tonight either will do."},
 {id:'write',g:'evening',t:2,l:"Make something (15 minutes)",s:"Fiction, a thinkpiece, a video-essay outline, a play-by-post reply."},
 {id:'bed',g:'evening',t:0,l:"Lights down, phone away, skin ritual",s:"The night ritual is part of the work. It is not a prize for finishing the work."}
];
const GROUPS=[['morning','Morning','Start small. Warm cup first.'],['day','Daytime','This is where the errands live.'],['evening','Evening','Wind down on purpose.']];
/* keys stay candle/lantern/bonfire so saved days still load. Names are the familiars. */
const TIERS=[
 ["candle","Moth","The small one. Pale, rumpled, and grumpy, but she will sit on your shoulder all day and nag you through the five things that matter. Choose her on low-battery, high-fog days. Moth days still count as showing up."],
 ["lantern","Fox","The steady one. Quick, dry, and impossible to lose in a crowd. She'll keep you to the core rites and one real errand, and she won't let you wander off. She makes a fine regular companion."],
 ["bonfire","Hare","The fierce one. Long legs, wild eyes, no patience for dithering. She'll sprint beside you through the extras. Choose her on a particularly good-energy day, and don't let her borrow against tomorrow."]
];

const QUARTERS=[
 ["Q1","Jan – Mar","Unlock","Insurance active, permit passed, résumé out, therapy started, habits taking root. Target: −17 lbs."],
 ["Q2","Apr – Jun","Momentum","Road test passed, license in hand, job offer. Target: −38 lbs."],
 ["Q3","Jul – Sep","Wheels","Car bought, first paychecks turning into savings. Target: −59 lbs."],
 ["Q4","Oct – Dec","Harvest","Gather everything in and lay the foundation for 2028. Target: −80 lbs and a real runway."]
];

/* gentle daily step targets by month (editable in Settings) */
const STEP_GOALS={"2026-11":3000,"2026-12":4000,"2027-01":5000,"2027-02":5500,"2027-03":6500,"2027-04":7500,"2027-05":8000,"2027-06":9000,"2027-07":9000,"2027-08":10000,"2027-09":10000,"2027-10":10000,"2027-11":10000,"2027-12":10000};

/* ============================================================
   CYCLE PHASES + daily tips
   ============================================================ */
const PHASES={
 menstrual:{name:"Menstrual",hue:350,blurb:"The tide is out. Energy runs low. Be gentle with the day without disappearing from it.",
  tips:[
   "Run the day at moth size if you need to. Moth days count fully, and the Lady has never once asked for a refund.",
   "Warm, iron-friendly food is kind right now: lentils, beans, dark leafy greens, cacao, red meat if you can, with something vitamin-C-rich beside it.",
   "Heat is your friend: a bath, a heating pad, a tea you can hold with both hands. Move slowly: stretching, yoga, an easy walk.",
   "Postpone the big decisions and the hard conversations if you can. Journal first. Decide when the tide comes back.",
   "Drink water on purpose and protect your sleep window tonight.",
   "Do the lowest-effort version of every rite. Done small is still done."]},
 follicular:{name:"Follicular",hue:150,blurb:"The tide is coming in. Energy rises, and starting things gets easier. A good window for anything that needed courage.",
  tips:[
   "Energy tends to climb now. Put the hardest task of the week here: job applications, preparing for learnr's permit, the résumé.",
   "Try a new workout, a new mindset, the new recipe. Your body is more curious than usual.",
   "Fresh, light food feels right: fruit, big salads, sprouts, eggs, fermented things. Add produce before you subtract anything.",
   "Open the blank page. Beginnings are cheaper this week.",
   "Make the call or send the networking message. Initiative comes easier in this phase.",
   "Add a little to your strength work: one more rep, or a slower tempo."]},
 ovulatory:{name:"Ovulatory",hue:40,blurb:"High tide. For many people this is the loudest, most sociable stretch of the cycle. Spend it where people can see you.",
  tips:[
   "Many people feel most articulate and social now. Schedule the interview, the call, the conversation you've been rehearsing in the shower.",
   "Higher-intensity movement often feels good: a brisk walk, a lift day, a dance break in the kitchen.",
   "Eat a rainbow: raw veg, berries, quinoa, good fats. Plenty of water.",
   "Say yes to the invitation. Reach out to one human today.",
   "Pitch the idea, ask for the thing, speak first in the meeting.",
   "Record the video, read aloud, leave a voice memo. Your voice carries further than you think."]},
 luteal:{name:"Luteal",hue:270,blurb:"The tide turns and heads back out. Detail work and routine are strong; cravings and low mood can show up late in the phase.",
  tips:[
   "Good for detail work: editing, organizing, admin, finishing what's already half-done.",
   "Steady meals help: complex carbs, protein, magnesium-rich foods (pumpkin seeds, dark chocolate/cacao, leafy greens). Cravings are information, not a failing. The 10% is allowed.",
   "Moderate movement tends to feel best: pilates, yoga, a long walk, lighter lifting.",
   "If anxiety or mood dips, shrink the day: moth size, early bed, fewer commitments. It's okay.",
   "Protect your sleep: lights down earlier, caffeine earlier, phone in another room.",
   "Late-phase irritability is real and not a character flaw. Do one thing that soothes: a hot shower, a book, a candle, a decent dinner.",
   "Tie off the week's loose ends so the next phase starts clean."]}
};
const CYCLE_NOTE="Phases are estimated from the dates you log, using your usual cycle length. Bodies vary. If your cycles are very irregular, very painful, or heavy, bring your log to a doctor. This is a planner, not medical advice.";

/* the long road (full quests per month are in months.js) */
const YEARS=[
 {y:"2027",t:"Unlock",big:"I",items:[["Lose weight","−80 lbs by December, about a pound and a half a week on average. Your doctor's guidance outranks any number I give you."],["Get a car","Permit, then license, then insurance quotes, then buy. An honest budget and no shortcuts."],["Get a good job with benefits","Insurance, income, taxes, independence."]],
  why:{"Weight":["confidence","privilege","health","mobility","strength","ability","easier","quality of life"],"Car":["mobility","freedom","agency","security","easier","bumper stickers","normative","come and go without waiting on anyone's schedule"],"Job":["money","insurance","freedom","security","taxes","fund the lifestyle","independence","agency","normative"]}},
 {y:"2028",t:"Root",big:"II",items:[["Savings fund","The cushion that makes every other plan less frightening."],["Move into and furnish your own apartment","Persian rugs, velvet, and a door you control."],["Solo trip","The first of many."]]},
 {y:"2029",t:"Expand",big:"III",items:[["Move to Rochester, Buffalo, Chicago, or Boston","The research begins in November 2027."],["Start or build the YouTube channel","Thinkpieces through a sociological lens."],["Secure a date for New Year's","Let love be an invitation and leave it out of the project plan."]]},
 {y:"2030",t:"The north star",big:"IV",items:[["The north star self","A maker of meaning. Free, joyful, curse-breaking."]]}
];

const CAR_STEPS=["Work Zone Safety course done","Practice tests scoring 22+/25","DMV hub appointment booked","Permit passed ($59)","90 days held (mark the date in Notes)","Road test booked","License issued ($84)","Insurance quotes gathered","Car Fund goal set","Car purchased","Bumper stickers applied"];
const JOB_STEPS=["HUSKY active","Résumé v1","LinkedIn live","Target list built","10 applications","First interview","Second-round interview","Offer","Accepted + benefits enrolled","Auto-savings started"];
const HEALTH_STEPS=["HUSKY application submitted","HUSKY active","Primary care visit","Labs discussed (energy, sleep, thyroid, vitamins)","Therapy intake","Dental checkup (ask what HUSKY covers)","Sleep window protected 5 nights a week","Strength routine 2× / week"];
const BUCKETS=[["permit","Permit",59],["license","License",84],["emergency","Emergency starter",1000],["car","Car fund",null],["future","2028 savings",null],["other","Other",null]];

const PALETTE=[["#0f0a09","black"],["#2b1a15","espresso"],["#3a2118","chocolate"],["#5a1520","oxblood"],["#722f37","wine"],["#6a1b3a","burgundy"],["#4b2a54","plum"],["#5b3a5a","fig"],["#173f45","deep teal"],["#43a59a","verdigris"],["#3e3f6b","indigo"],["#5a6030","olive"],["#c9ad7f","champagne"],["#ece0cc","cream"],["#b97a2b","amber"],["#a6491f","rust"],["#8d3a2a","brick"],["#c99a98","dusty rose"],["#e5b5aa","blush"],["#b8924a","gold"]];

const TOOLKIT={
 reset:["<b>Missed a day:</b> tomorrow is a moth day. There is nothing to make up. Nobody is keeping a ledger of what you owe.","<b>Missed three days:</b> pick ONE rite (the warm cup, a stretch, or a walk) and one two-minute task. Do both before noon. Write the date in the journal and keep going.","<b>Missed a week:</b> skip the guilt inventory. Open Today, choose the Moth, tick one box. Then put the next real appointment on your calendar.","<b>Missed a month:</b> you didn't fail the plan. The plan was paused, the way a road is paused for repairs. Go back to the first steps (HUSKY, the $59, the appointment, the résumé), whichever aren't done, and rebuild from there.","<b>The rule that doesn't bend:</b> never zero twice."],
 proc:["<b>The two-minute door:</b> open the thing without doing the thing. The brain relaxes when it's a door and not a mountain.","<b>Body double:</b> work next to a person, or a \"study with me\" video on a laptop. It's free and works better than it should. That is half of what the moth is for.","<b>Timer sprints:</b> ten minutes on, five off. Stop when the timer stops, even if you're on a roll. The stopping is what makes tomorrow easier.","<b>Make it physical:</b> stand up, put the phone in another room, set one object that belongs to the task on the desk.","<b>Name the first micro-action:</b> not \"do résumé,\" but \"open the doc and type my name.\"","<b>Pair it:</b> tea with the task, a playlist with the task, a candle with the task. Pairing lays the rails for the habit.","<b>Cut the decisions:</b> pick tomorrow's three errands tonight. Deciding is the hard part.","<b>The three-day rule:</b> anything undone for three days gets shrunk to two minutes and done, or deleted on purpose."],
 candle:["Drink water and something warm","Wash your face","Lie on the floor for five minutes with a podcast or music","Open one tab and close all the others","Put one thing back where it belongs","Text one person a heart","Walk to the mailbox or the end of the street","Eat a piece of fruit","Stretch your neck and shoulders","Open your HUSKY or DMV page and just look at it","Wear the soft thing","Do the night skincare ritual early, then rest"],
 shame:["<b>Notice:</b> \"There's shame.\" Name it. You've just stepped one inch back from the wheel.","<b>Check the story:</b> is this a fact or an old voice? Write one fact and one feeling.","<b>Speak like a friend:</b> what would you say to someone you love, standing exactly where you're standing?","<b>One small repair:</b> not a punishment, a step. Wash a cup. Send the email.","<b>Afterwards:</b> write one line about what helped. Future you will want it."],
 planb:[["Weight",["B: walking and produce only (drop strength for a month)","C: just the evening walk and the sleep window","Ask the doctor about nutrition support (a registered dietitian) under your coverage"]],["Car",["B: buy a cheaper, older car, or be added to a family policy","C: hold the permit, keep practicing, and use transit or ride shares until the fund catches up","If the road test goes badly: the retest fee is $40. Book a lesson and re-book."]],["Job",["B: temp agency, state job, or retail/warehouse with benefits","C: keep the AI gig and add a part-time job that carries benefits","Anything that carries insurance counts as a stepping stone"]]],
 reward:["<b>$0:</b> a bath, a long walk with a playlist, a day without the inbox, a favorite chapter, calling a friend, sunrise at a window","<b>$5–10:</b> a fancy tea, a thrifted book or scarf, a candle, a flower, a café matcha","<b>$20+:</b> dinner out, sushi, a book haul, a new piece for the closet palette","<b>Rule:</b> reward showing up. Never reward or punish with skipped meals or starving, and never reward yourself with something that undermines the goal."],
 resources:["<b>HUSKY / Access Health CT:</b> accesshealthct.com or 1-855-805-4325 (applications year-round)","<b>CT DMV:</b> ct.gov/dmv. Driver's Manual PDF, Work Zone Safety course, appointment scheduling","<b>Your library:</b> a card gives you Libby, Hoopla, free events, and quiet places to work","<b>VITA:</b> free tax-filing help for lower incomes (IRS.gov)","<b>2-1-1 Connecticut:</b> dial 211 for food, utilities, and local benefit help","<b>YouTube:</b> yoga with Adriene, beginner strength, \"study with me\" rooms","<b>ctbhp.com:</b> finding behavioral-health providers under HUSKY","<b>Community health centers (FQHCs):</b> sliding-scale care and help with applications","<b>SNAP/food help:</b> check eligibility at connect.ct.gov if the food budget is tight"],
 doctor:["My energy is low most days. What could be contributing (sleep, thyroid, vitamin D, iron, mood)?","I have trauma-related symptoms, depression, and anxiety. What therapy options fit (trauma-focused, EMDR, somatic)?","I'm wondering about ADHD / autism / OCD. How do I get evaluated?","I'd like to lose weight safely. What pace and strategies do you recommend for me?","Are there dietitian, dental, or vision benefits I should be using?","What should I watch for as I start walking and strength training?","(If cycles are irregular or painful) Here's my cycle log from the app. What should we look at?"],
 whimsi:["Light a candle before the first task","Matcha or tisane in your favorite cup","A pomegranate or a fig as a snack","Kohl, tinted lip, or a single ring: a one-minute ritual","Velvet or silk robe while journaling","Play-by-post reply by lamplight","A tarot or tea-leaf pull as a journaling prompt (the meaning is the story you make)","Crystals or small protection spells as intention rituals","A thrift or flea-market trip as the monthly adventure","Persian rug dreaming: keep a '2028 apartment' board of images"],
 rules:["No staying in bed past 10 a.m. unless ill or on vacation.","I don't over-explain.","I don't put anything off more than three days.","One uncomfortable thing a day.","No living in shame, and no tolerating shame from others or from myself.","I control my life. Shame, guilt, humiliation, and other people do not drive."]
};
