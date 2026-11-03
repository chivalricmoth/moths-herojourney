/* ============================================================
   north star — words: journal prompts, lines
   The moth speaks. Prompts are his; the small italic line under each is his aside.
   ============================================================ */
const JBLOCKS=[
 ["anchor","Anchor","ph-compass-tool","Pull yourself toward the version of you who already lives the life."],
 ["reflect","Reflect","ph-notebook","What actually happened today, and what it taught you."],
 ["shadow","Shadow","ph-moon-stars","Gentle and honest. Stop if it gets to be too much. A moth day counts."],
 ["track","On track","ph-path","Turn the day into a plan, so tomorrow is easy to start."]
];
const PROMPTS={
 anchor:[
  ["Walk through the north star morning: the light, the sheets, the sound. How much of it did you live today? Ten percent? What one thing would make tomorrow's version eleven?","Rehearse the scene often enough and your nervous system stops treating it like a rumor."],
  ["What did you wear, eat, read or listen to today that felt like them? What was the old default?","Identity is built from small receipts. Collect them."],
  ["Pick a muse (Joan, Tartt, Bourdain, Villanelle, Alexa, Bowie). What would they have done with your worst hour today? What's the smallest version you can manage?","It's easier to borrow a posture than to invent a personality from scratch."],
  ["Finish the sentence: \"At my core, I am a person who...\" Use only evidence from today.","Affirmations are cheap. Evidence is not. Even tiny evidence will do."],
  ["Your currency isn't only money: creative output, novelty, laughs, reading and making time, rest, calm, safety. Which did you earn today? Which are overdrawn?","Count the wealth you actually want."],
  ["Describe tomorrow's workspace the way she sees it: what's on the desk, what's gone, what's in the cup? What can you set up tonight?","A room remembers things for you."],
  ["Where did you widen the surface area of your life today so luck could find you?","A message, a new street, a yes you nearly swallowed."],
  ["Body check, 2030 edition: how did your body feel today, and how does it feel now? What one kindness did you do for it?","Light, lean and loose is a feeling long before it's a number."],
  ["Aesthetic audit: one detail you added or want to add (kohl, velvet, a candle, a pomegranate, a rug, a scent). Where does it live?","Small rituals are what make a life look written on purpose."],
  ["What would dependable, kind and diligent have looked like in one thing you did today?","The standard is character. Perfection is a different customer."],
  ["Write a \"no worries, I have a back-up plan\" sentence for something that could go wrong tomorrow. Then write the plan.","Thinking ahead is how you stay calm when everyone else is not."],
  ["Which rule did you keep today (10 a.m., no over-explaining, the three-day rule, one uncomfortable thing, no shame)? Which one bent? Treat it as data.","The rules are guardrails. This isn't a courtroom, and I'm not the bailiff."]],
 reflect:[
  ["What happened today, in three sentences? Then: what surprised you?","Naming it turns the day into material. Material can be used."],
  ["What gave you energy, and what drained it? Is there a pattern?","Patterns run a life. Willpower mostly shows up for the photographs."],
  ["What are you proud of that nobody saw?","Private wins count double. Nobody can take a cut."],
  ["What did you learn about how you work today: focus, avoidance, time of day?","Build the day around the person who actually lives in it."],
  ["Which feeling was loudest today? Where did it sit in your body? What did it need?","Feelings are messages. Some are rude, but they are messages."],
  ["Which conversation or message are you carrying around? What's the kindest honest version of what you'd say?","Nothing waits more than three days. Nothing."],
  ["What did you do today that Past You wouldn't believe?","Look at how far the floor has moved."],
  ["What was the best twenty minutes of today, and what made it good?","Then make more of those conditions."],
  ["What do you want to remember about today a year from now?","Your future self is the audience. Be considerate."],
  ["If today were a chapter, what would it be called? What's the first line of tomorrow's?","You are the author. The day is only what happened to the character."]],
 shadow:[
  ["What did you avoid today? Name it plainly. What do you fear would happen if you did it? Is that fear a fact or an old voice?","Avoidance is protection wearing a lazy person's coat."],
  ["Whose voice does your inner critic borrow? What did they want from you? What would the adult you say back?","Give the critic a face and it gets smaller. Slightly."],
  ["Where did shame drive today? Find the exact moment it took the wheel, and write what you did next.","You can't take the wheel back from something you haven't noticed in the car."],
  ["What are you pretending not to know? What would change if you admitted it?","Clarity first. Action second. The order matters."],
  ["Which story about yourself played on repeat today (\"I'm lazy,\" \"I'm behind\")? What evidence contradicts it?","Stories are hypotheses. Treat them like a scientist treats a rumor."],
  ["What would you do today if no one could be disappointed in you? Which part could you do anyway?","Expectation is a loud audience, and mostly imaginary."],
  ["Which part of you is tired of the plan? What does she want? Can you give her ten percent?","Resistance is information, even when it arrives sulking."],
  ["What are you resentful of? What boundary is hiding inside the resentment?","Resentment is a boundary that hasn't been given a voice yet."],
  ["Write to the younger you who learned this avoidance. What did she need to hear?","The old strategy kept you alive once. Thank it, then update it."],
  ["Where did you over-explain, appease or shrink today? What would the unshrunk version have said?","One clean sentence is plenty."],
  ["What are you envious of right now? What is it pointing at that you actually want?","Envy is a compass in a bad mood."],
  ["What does staying stuck get you (safety, sympathy, no risk)? What would the author of your story ask of you tomorrow?","Compassion and accountability can share a room. They don't have to share a bed."]],
 track:[
  ["Weight, car, job. What is the next physical action for each? Which one is stuck, and why (time, fear, information, energy)?","Name the kind of stuck. Each one has a different fix."],
  ["What's your three-day-rule item? Shrink it to two minutes and write the first action.","Open the door. You don't have to climb the mountain today."],
  ["What did you move forward today? If nothing, what's the smallest thing that still counts?","Never zero twice."],
  ["What is tomorrow's one needle-mover, and exactly when and where will you do it?","A time and a place triple your odds. I don't make the rules."],
  ["What got in the way today? How can you remove that friction tonight?","Fix the environment. Leave your character alone."],
  ["Backup check: what's plan B for each priority this week?","\"I have resources for this.\" Say it as if you believe it."],
  ["Money check: what did you spend today, and did it fund the life you want? Any deposits to your buckets?","Information, not judgment."],
  ["What does \"good enough\" look like tomorrow? Define a finish line you can actually cross.","Done beats perfect, and it beats it by a wide margin."]]
};

const LINES=[
 "dress like the person you're about to become. they're watching from a stained glass window.",
 "a moth day is still a day. make our dear Lady proud.",
 "be unembarrassed, be early, be a little bit feral.",
 "you are not behind. you are mid-transformation, which looks exactly like this.",
 "small, then smaller, then started.",
 "the plan is a spell: slow, exact, repeated until it stops being embarrassing.",
 "keep the receipts of your own bravery.",
 "make the call. the dread is the toll, not the road.",
 "be well-read, well-rested, and a little dangerous.",
 "shame is a driver you never hired. take the keys.",
 "kohl, coffee, courage, in any order.",
 "poetry is just paying attention on purpose.",
 "write the sentence you're afraid is true, then keep going.",
 "your future apartment already has a persian rug in it. go find the rug money.",
 "do one uncomfortable thing and let it become a story.",
 "be the person who answers within three days.",
 "the underground is just people who kept turning up in the dark.",
 "taste is a muscle. feed it good books and the occasional bad decision.",
 "no one is coming to rescue the schedule. you are the schedule.",
 "borrow one patron a day. return her better than you found her.",
 "tired is information. quitting is a decision. rest is neither.",
 "dirtbag optimism: broke, curious, unembarrassed.",
 "eat, rest, then fight. in that order.",
 "write a bad draft in a good outfit.",
 "protect the evening. it's where the day becomes yours.",
 "leave the door open for luck. stay home enough to hear it knock.",
 "curses end when someone does the boring healthy thing again tomorrow.",
 "every shy yes widens the surface area of your life.",
 "be soft where the world is hard and hard where it's dishonest.",
 "make the thing nobody asked for.",
 "read in the bath, answer the text, drink the water.",
 "ritual is just a plan with candles.",
 "whatever you're becoming, you're allowed to become on purpose.",
 "the moth says: stop admiring the lamp and go sit near it.",
 "the lady does not accept 'tomorrow' as an excuse for postponement."
];
/* RECS now comes entirely from syllabus.js. JT/WEEK_* constants removed (unused). */
