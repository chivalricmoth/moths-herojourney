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
const FREEWRITE="Free write. Anything. Keep going until the thought is out of your head and on the page.";

const WEEK_REVIEW=[
 ["wins","Wins and proof","Name three things that went right, big or tiny, and the evidence (what exactly you did).","The brain keeps a thick file on what went wrong and a thin one on what went right. This is the thin one. Add to it, yea? [He nudges it with a wing.]"],
 ["energy","Energy and patterns","When were you most alive this week, and when did you crash? What did the best days have in common (sleep, food, people, tasks)?","Patterns run a life, not willpower. Check the numbers above against how the week felt. I’ll be here, doing nothing in particular."],
 ["avoid","The avoidance audit","What did you put off longer than three days? For each: what’s the fear or cost, and what’s the two-minute version?","Avoidance is protecting you from something. Name it, shrink it, and the three-day rule does the rest. I’ve seen it work on worse."],
 ["shadow","Shadow check-in","Where did shame, perfectionism or anxiety drive this week? What triggered it, what did it tell you, and what would you say to a friend in the same spot?","Take it slowly and stop if it’s too much. Shame is only information. I’ll take notes, and complain about the neighbours, so nothing gets too heavy."],
 ["align","Alignment with your north star self","Where did you live as 2030-you this week (style, food, rituals, boundaries)? Where did you drift? What is one thing to keep and one to adjust?","Identity changes through small, repeated proof. Collect some. [He squints at the week.] There’s some in there."],
 ["village","Village and connection","Who did you reach out to or show up for? Who showed up for you? Who would you like to invite in next week?","Friendship is built in small deposits. Replying within one to three days is your own rule, not mine, and I’d keep it."],
 ["lesson","Lesson and letting go","What is one lesson to keep and one thing (a habit, a thought, an expectation) to release?","Close the loop, so this week doesn’t leak into the next. I’ve had enough of leaks. The ceiling."]
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

/* monthly picks: fiction / nonfiction / film / listen, with a one-line why */
const RECS={
 "2026-11":{fic:"Babel — R.F. Kuang",non:"Bullshit Jobs — David Graeber",film:"Sorry to Bother You (2018)",listen:"Charli xcx — Brat",why:"Rage as research. Kuang for the teeth, Graeber for the case that half of office work is theatre. I’ve seen the theatre. Take notes."},
 "2026-12":{fic:"The Secret History — Donna Tartt",non:"Just Kids — Patti Smith",film:"Velvet Goldmine (1998)",listen:"David Bowie — Aladdin Sane",why:"Tartt for the elegance, Patti Smith for the New York you’ll walk through, Bowie for rearranging yourself on purpose."},
 "2027-01":{fic:"The Cruel Prince — Holly Black",non:"Four Thousand Weeks — Oliver Burkeman",film:"Frances Ha (2012)",listen:"The Strokes — Is This It",why:"A first week, not a new you. Faerie politics for nerve, Burkeman for pace, and a film about being a mess and still moving."},
 "2027-02":{fic:"Circe — Madeline Miller",non:"Complex PTSD: From Surviving to Thriving — Pete Walker",film:"Portrait of a Lady on Fire (2019)",listen:"Fiona Apple — Fetch the Bolt Cutters",why:"Witches who come through it, a book for the body’s old alarms (slowly, and stop if it stirs things up), and an album that refuses to be polite."},
 "2027-03":{fic:"Wuthering Heights — Emily Brontë",non:"Meet Me in the Bathroom — Lizzy Goodman",film:"Only Lovers Left Alive (2013)",listen:"Charli xcx and John Cale — the Wuthering Heights soundtrack songs",why:"Moors and mess, the oral history of New York indie sleaze, and the best-dressed vampires ever filmed."},
 "2027-04":{fic:"Piranesi — Susanna Clarke",non:"Capitalist Realism — Mark Fisher",film:"Ghost World (2001)",listen:"Yeah Yeah Yeahs — Fever to Tell",why:"A house of statues, the short book the dirtbag left keeps passing round, and the patron saint of the unimpressed."},
 "2027-05":{fic:"Rebecca — Daphne du Maurier",non:"The Courage to Be Disliked — Ichiro Kishimi and Fumitake Koga",film:"The Love Witch (2016)",listen:"Arctic Monkeys — Whatever People Say I Am, That’s What I’m Not",why:"Manderley for atmosphere, a book that’s useful about not over-explaining, and a technicolour femme fatale. Confidence music, road-tested."},
 "2027-06":{fic:"Stardust — Neil Gaiman",non:"Kitchen Confidential — Anthony Bourdain",film:"Almost Famous (2000)",listen:"LCD Soundsystem — Sound of Silver",why:"A fairy tale with the fear taken out, the cook’s guide to loving the world, and a first-solo-drive soundtrack."},
 "2027-07":{fic:"The Magicians — Lev Grossman",non:"Please Kill Me — Legs McNeil and Gillian McCain",film:"Paris, Texas (1984)",listen:"Fontaines D.C. — Dogrel",why:"Grad-school magic, the foul-mouthed oral history of punk, and the great wandering film."},
 "2027-08":{fic:"The Atlas Six — Olivie Blake",non:"Burnout — Emily and Amelia Nagoski",film:"Thelma and Louise (1991)",listen:"Florence + the Machine — Lungs",why:"Charming, dangerous geniuses, the book on finishing the stress cycle, and the original keys-and-freedom film."},
 "2027-09":{fic:"Frankenstein in Baghdad — Ahmed Saadawi",non:"The Simple Path to Wealth — JL Collins",film:"Phantom Thread (2017)",listen:"Yasmine Hamdan — Ya Nass",why:"Arab gothic with a sense of humour, boring index-fund calm, and a film about obsession and silk. Mashrek moods for ordinary mornings."},
 "2027-10":{fic:"Mexican Gothic — Silvia Moreno-Garcia",non:"The Mushroom at the End of the World — Anna Tsing",film:"The Craft (1996)",listen:"Kate Bush — Hounds of Love",why:"Haunted houses, fungi as philosophy (forage with experts only), and the teen coven that never ages."},
 "2027-11":{fic:"Fingersmith — Sarah Waters",non:"Wintering — Katherine May",film:"Black Narcissus (1947)",listen:"Mitski — Puberty 2",why:"Victorian con artists in love, permission to rest like a season, and a film where the colours do the screaming."},
 "2027-12":{fic:"Gideon the Ninth — Tamsyn Muir",non:"Braiding Sweetgrass — Robin Wall Kimmerer",film:"The Worst Person in the World (2021)",listen:"Nick Cave and the Bad Seeds — The Boatman’s Call",why:"Lesbian necromancers, gratitude as ecology, and a film about becoming someone on purpose. Close the year by candlelight."}
};
