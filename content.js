/* ============================================================
   north star — words: journal prompts, weekly prompts, recs, lines
   (all editable; original writing, plus your own rules and statements)
   ============================================================ */
const JBLOCKS=[
 ["anchor","Anchor","ph-compass-tool","Pull yourself toward the version of you that already lives the life."],
 ["reflect","Reflect","ph-notebook","What actually happened, and what it taught you."],
 ["shadow","Shadow","ph-moon-stars","Gentle, honest. Stop if it’s too much; a candle day counts."],
 ["track","On track","ph-path","Turn the day into a plan, so tomorrow is easy to start."]
];
const PROMPTS={
 anchor:[
  ["Walk through your north star morning: the light, the sheets, the sound. Which 10% of it did you live today? What one small thing would make tomorrow’s morning 11%?","Rehearsing the scene teaches your nervous system it’s safe to become her."],
  ["What did you wear, eat, read or listen to today that felt like her? What was the old default?","Identity changes through repeated small proofs, not one big leap."],
  ["Pick a muse (Joan, Tartt, Bourdain, Villanelle, Alexa, Bowie…). What would they have done with your hardest hour today? What’s the smallest version you can do?","Borrowing a posture is easier than inventing a personality."],
  ["Finish the sentence “At my core, I am a person who…” using only evidence from today.","Evidence beats affirmations. Even tiny proof counts."],
  ["Your currency isn’t only money: creative output, novelty, laughs, reading and making time, rest, calm, safety. Which did you earn today? Which are overdrawn?","Measure the wealth you actually want."],
  ["Describe tomorrow’s workspace as your north star self sees it: what’s on the desk, what’s gone, what’s in the cup? What can you set up tonight?","Environment does the remembering for you."],
  ["Where did you widen the surface area of your life today so luck could find you?","A message, a new street, a ‘yes’ you almost skipped."],
  ["Body check as 2030-you: how did your body feel today, and how does she feel? What was one kindness you did for it?","Light, lean, loose is a feeling before it’s a number."],
  ["Aesthetic audit: one detail you added or want to add (kohl, velvet, a candle, a pomegranate, a rug, a scent). Where does it live?","Little rituals make a life feel authored."],
  ["What would dependable, kind, diligent look like in one thing you did today?","Your standard is character, not perfection."],
  ["Write a ‘no worries, I have a backup plan’ sentence for something that could go wrong tomorrow, then write the plan.","Thinking ahead is how you stay calm."],
  ["Which rule did you keep today (10 a.m., no over-explaining, the 3-day rule, one uncomfortable thing, no shame)? Which bent? Data, not a grade.","The rules are guardrails, not a courtroom."]],
 reflect:[
  ["What happened today in three sentences? Then: what surprised you?","Naming it turns the day into material."],
  ["What gave you energy, and what drained it? What’s the pattern?","Patterns, not willpower, run a life."],
  ["What are you proud of that nobody saw?","Private wins count the most."],
  ["What did you learn about how you work: focus, avoidance, time of day?","Design your day around the real you."],
  ["Which emotion was loudest today? Where did you feel it in your body? What did it need?","Feelings are messages, not verdicts."],
  ["Which conversation or message are you carrying? What’s the kindest honest version of what you’d say?","Nothing waits more than three days."],
  ["What did you do today that Past You wouldn’t believe?","Look how far the baseline moved."],
  ["What was the best 20 minutes of today, and what made it good?","Do more of the conditions."],
  ["What do you want to remember about today in a year?","Future you is the audience."],
  ["If today were a chapter, what’s its title? What’s the first line of tomorrow’s?","You’re the author, not the character it happens to."]],
 shadow:[
  ["What did you avoid today? Name it plainly. What are you afraid will happen if you do it? Is that fear a fact or an old voice?","Avoidance is protection, not laziness."],
  ["Whose voice does your inner critic use? What did they want from you? What would the adult you say back?","Giving the critic a face shrinks it."],
  ["Where did shame drive today? What was the exact moment it took the wheel, and what did you do next?","You can’t take back a wheel you haven’t noticed."],
  ["What are you pretending not to know? What would change if you admitted it?","Clarity first; action second."],
  ["Which story about yourself repeated today (‘I’m lazy’, ‘I’m behind’)? What evidence contradicts it?","Stories are hypotheses."],
  ["What would you do today if no one could be disappointed in you? Which part can you do anyway?","Expectation is a loud audience."],
  ["Which part of you is tired of the plan? What does it want? Can you give it 10%?","Resistance is information."],
  ["What are you resentful of? What boundary is hiding inside the resentment?","Resentment is a boundary asking to be said out loud."],
  ["Write to the younger you who learned this avoidance. What did they need to hear?","The old strategy once kept you safe. Thank it, then update it."],
  ["Where did you over-explain, appease or shrink today? What would the unshrunk version have said?","One clean sentence is enough."],
  ["What are you envious of right now? What is it pointing at that you actually want?","Envy is a compass in a bad mood."],
  ["What does staying stuck get you (safety, sympathy, no risk)? What would the author of your story ask of you tomorrow?","Compassion and accountability can share a room."]],
 track:[
  ["Weight, car, job: what is the next physical action for each? Which one is stuck, and why (time, fear, information, energy)?","Name the kind of stuck; each has a different fix."],
  ["What’s the 3-day-rule item? Shrink it to two minutes and write the first action.","Open the door; don’t do the mountain."],
  ["What did you move forward today? If nothing, what’s the smallest thing that still counts?","Never zero twice."],
  ["What is tomorrow’s one needle-mover, and exactly when and where will you do it?","A time and a place triple follow-through."],
  ["What got in the way today? How can you remove that friction tonight?","Fix the environment, not your character."],
  ["Backup plan check: what’s plan B for each priority this week?","‘I have resources for this.’"],
  ["Money check: what did you spend today, and did it fund the life you want? Any deposits to your buckets?","Information, not judgment."],
  ["What does ‘good enough’ look like tomorrow? Define a finish line you can actually cross.","Done beats perfect."]]
};
const FREEWRITE="Free write. Anything. Write until the thought is out of your head.";

const WEEK_REVIEW=[
 ["wins","Wins and proof","Name three things that went right, big or tiny, and the evidence (what exactly you did).","Your brain keeps a thick file on failures and a thin one on wins. This builds the second file, and it feeds your identity statement."],
 ["energy","Energy and patterns","When were you most alive this week, and when did you crash? What did the best days have in common (sleep, food, people, tasks)?","Patterns, not willpower, run a life. Check the numbers above against how it felt."],
 ["avoid","The avoidance audit","What did you put off longer than three days? For each: what’s the fear or cost, and what’s the two-minute version?","Avoidance protects you from something. Naming it shrinks it; the 3-day rule turns it into a tiny action."],
 ["shadow","Shadow check-in","Where did shame, perfectionism or anxiety drive this week? What triggered it, what did it tell you, and what would you say to a friend in the same spot?","You can’t take back the wheel from something you can’t see. Go gently; stop if it’s too much."],
 ["align","Alignment with your north star self","Where did you live as 2030-you this week (style, food, rituals, boundaries)? Where did you drift? What is one thing to keep and one to adjust?","Identity changes through repeated small proofs, not a big leap."],
 ["village","Village and connection","Who did you reach out to or show up for? Who showed up for you? Who would you like to invite in next week?","Friendship is built in small deposits. Replying within 1–3 days is one of your rules."],
 ["lesson","Lesson and letting go","What is one lesson to keep and one thing (a habit, a thought, an expectation) to release?","Closing the loop keeps this week from leaking into the next."]
];
const WEEK_PLAN=[
 ["intent","Intention for the week","A word or a sentence you can return to when it gets noisy.","e.g. “proceed and be bold”"],
 ["nw","Weight: one move","The smallest action that counts for your body.",""],
 ["nc","Car: one move","Permit, practice, savings, quotes. One thing.",""],
 ["nj","Job: one move","An application, a message, a call, a skill.",""],
 ["unc","One uncomfortable thing","Pick it now so it can’t hide. Do it early in the week.",""],
 ["appt","Appointments and deadlines","Anything with a date. Put it on a calendar too.",""],
 ["movie","Movie night","No productivity attached.",""],
 ["adv","Small adventure","One new place, street, shop, or trail.",""],
 ["rule","Rule I’m tightening","From your list: 10 a.m., no over-explaining, 3-day rule, no shame.",""],
 ["adj","One adjustment","Make it smaller, not harder.",""],
 ["rw","Reward for showing up","Effort is what gets celebrated, not numbers.",""]
];
const CURRENCIES=[["creative","Creative output"],["novelty","New experiences"],["laughs","Laughs shared"],["read","Reading and making"],["ideas","Inspiration and ideas"],["rest","Deep rest"],["calm","Calm and safety"]];
const FEELINGS=["calm","hopeful","proud","loved","energised","inspired","anxious","ashamed","angry","lonely","numb","overwhelmed","restless","grateful"];

/* original lines, in the voice of the muses */
const LINES=[
 "dress like the person you’re about to become. she’s watching.",
 "a candle day is still a day. light it anyway.",
 "be unembarrassed, be early, be a little bit feral.",
 "you are not behind. you are mid-transformation.",
 "small, then smaller, then started.",
 "the plan is a spell: slow, exact, repeated.",
 "keep the receipts of your own bravery.",
 "make the call. the dread is the toll, not the road.",
 "be well-read, well-rested, and a little dangerous.",
 "shame is a driver you never hired.",
 "kohl, coffee, courage, in any order.",
 "poetry is just paying attention on purpose.",
 "write the sentence you’re afraid is true, then keep going.",
 "your future apartment already has a rug in it. go get the rug money.",
 "do one uncomfortable thing and let it become a story.",
 "be the person who answers within three days.",
 "the underground is just people who kept showing up in the dark.",
 "taste is a muscle. feed it good books and bad decisions in moderation.",
 "no one is coming to save the schedule. you are the schedule.",
 "borrow one muse a day. return her better.",
 "tired is information. quitting is a decision. rest is neither.",
 "dirtbag optimism: broke, curious, unembarrassed.",
 "solidarity starts at breakfast. eat, rest, then fight.",
 "write a bad draft in a good outfit.",
 "protect the evening. it’s where the day becomes yours.",
 "leave the door open for luck. stay home enough to hear it knock.",
 "curses end when someone does the boring healthy thing again tomorrow.",
 "every shy yes widens the surface area of your life.",
 "be soft where the world is hard and hard where it’s dishonest.",
 "make the thing nobody asked for.",
 "read in the bath, answer the text, drink the water.",
 "ritual is just a plan with candles.",
 "whatever you’re becoming, you’re allowed to become on purpose."
];

/* monthly picks: fiction / nonfiction / film / listen, with a one-line why */
const RECS={
 "2026-11":{fic:"Babel — R.F. Kuang",non:"Bullshit Jobs — David Graeber",film:"Sorry to Bother You (2018)",listen:"Charli xcx — Brat",why:"Dark academia with its teeth out, plus the case that most office work is theater. Rage as research for your own corporate-goth exit plan."},
 "2026-12":{fic:"The Secret History — Donna Tartt",non:"Just Kids — Patti Smith",film:"Velvet Goldmine (1998)",listen:"David Bowie — Aladdin Sane",why:"Tartt for the elegance, Patti for the New York you’re going to walk through, Bowie for reinvention as a method."},
 "2027-01":{fic:"The Cruel Prince — Holly Black",non:"Four Thousand Weeks — Oliver Burkeman",film:"Frances Ha (2012)",listen:"The Strokes — Is This It",why:"A first week, not a new you: faerie politics for courage, an anti-productivity book for pace, and a movie about being a mess and still moving."},
 "2027-02":{fic:"Circe — Madeline Miller",non:"Complex PTSD: From Surviving to Thriving — Pete Walker",film:"Portrait of a Lady on Fire (2019)",listen:"Fiona Apple — Fetch the Bolt Cutters",why:"Witches who survive, a book for the body’s old alarms (read slowly), and an album that refuses to be polite about it."},
 "2027-03":{fic:"Wuthering Heights — Emily Brontë",non:"Meet Me in the Bathroom — Lizzy Goodman",film:"Only Lovers Left Alive (2013)",listen:"Charli xcx and John Cale — the Wuthering Heights soundtrack songs",why:"Moors and mess, the indie sleaze oral history of New York 2001 to 2011, and the coolest vampires ever filmed."},
 "2027-04":{fic:"Piranesi — Susanna Clarke",non:"Capitalist Realism — Mark Fisher",film:"Ghost World (2001)",listen:"Yeah Yeah Yeahs — Fever to Tell",why:"A mind-bending house of statues, the short book dirtbag-left readers keep passing around, and the patron saint of unimpressed girls."},
 "2027-05":{fic:"Rebecca — Daphne du Maurier",non:"The Courage to Be Disliked — Ichiro Kishimi and Fumitake Koga",film:"The Love Witch (2016)",listen:"Arctic Monkeys — Whatever People Say I Am, That’s What I’m Not",why:"Manderley for atmosphere, an unexpectedly useful book about not over-explaining, and a technicolor femme fatale. Road-test confidence music."},
 "2027-06":{fic:"Stardust — Neil Gaiman",non:"Kitchen Confidential — Anthony Bourdain",film:"Almost Famous (2000)",listen:"LCD Soundsystem — Sound of Silver",why:"Fairy-tale fearlessness, the cook’s guide to loving the world, and a first-solo-drive soundtrack."},
 "2027-07":{fic:"The Magicians — Lev Grossman",non:"Please Kill Me — Legs McNeil and Gillian McCain",film:"Paris, Texas (1984)",listen:"Fontaines D.C. — Dogrel",why:"Study hard, run wild: grad-school magic, the foul-mouthed oral history of punk, and the great wandering movie."},
 "2027-08":{fic:"The Atlas Six — Olivie Blake",non:"Burnout — Emily and Amelia Nagoski",film:"Thelma and Louise (1991)",listen:"Florence + the Machine — Lungs",why:"Charming dangerous geniuses, the book on finishing the stress cycle, and the original keys-and-freedom movie."},
 "2027-09":{fic:"Frankenstein in Baghdad — Ahmed Saadawi",non:"The Simple Path to Wealth — JL Collins",film:"Phantom Thread (2017)",listen:"Yasmine Hamdan — Ya Nass",why:"Arab gothic with dark humor, boring index-fund calm, and a film about obsession and silk. Mashrek moods for your ordinary mornings."},
 "2027-10":{fic:"Mexican Gothic — Silvia Moreno-Garcia",non:"The Mushroom at the End of the World — Anna Tsing",film:"The Craft (1996)",listen:"Kate Bush — Hounds of Love",why:"Haunted houses, fungi as philosophy (forage with experts only), and the teen coven that never gets old."},
 "2027-11":{fic:"Fingersmith — Sarah Waters",non:"Wintering — Katherine May",film:"Black Narcissus (1947)",listen:"Mitski — Puberty 2",why:"Victorian con artists in love, permission to rest like a season, and a film where the colors do the screaming."},
 "2027-12":{fic:"Gideon the Ninth — Tamsyn Muir",non:"Braiding Sweetgrass — Robin Wall Kimmerer",film:"The Worst Person in the World (2021)",listen:"Nick Cave and the Bad Seeds — The Boatman’s Call",why:"Lesbian necromancers for fun, gratitude as ecology, and a film about becoming someone on purpose. Close the year in candlelight."}
};
