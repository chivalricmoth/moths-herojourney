"use strict";
/* ============================================================
   north star — rough calorie estimator (offline, built-in food list)
   format:  names | aliases ; kcal per typical serving ; grams per serving ; grams per cup (optional)
   Estimates only. Edit this list freely.
   ============================================================ */
const FOOD_RAW=`
egg|eggs|boiled egg|fried egg|scrambled egg|poached egg;75;50
egg white|egg whites;17;33
omelette|omelet;190;120
bacon|bacon strip|bacon strips|bacon slice;45;12
sausage|breakfast sausage|sausage link;90;30
toast|bread|sourdough|slice of bread|rye;85;32
bagel;270;105
croissant;230;57
english muffin;130;57
pancake|pancakes;90;40
waffle|waffles;220;75
french toast;180;65
cereal;150;40;40
granola;220;50;100
oatmeal|porridge|oats|overnight oats;160;234;234
yogurt|greek yogurt|yoghurt;110;170;245
cottage cheese;110;113;226
milk|whole milk;150;244;244
skim milk|nonfat milk;85;245;245
oat milk;120;240;240
almond milk;40;240;240
soy milk;100;240;240
cream|heavy cream|half and half|creamer;50;30
butter;100;14
cream cheese;50;14
cheese|cheddar|mozzarella|swiss|gouda|brie|feta|goat cheese|parmesan;110;28
string cheese;80;28
apple;95;182
banana;105;118
orange;62;131
clementine|tangerine;35;74
grapes;100;150;151
strawberry|strawberries;50;150;152
blueberry|blueberries;85;148;148
raspberry|raspberries;65;123;123
blackberry|blackberries;62;144;144
pomegranate;230;282
pomegranate seeds|pomegranate arils|arils;140;174;174
fig|figs;37;50
dried fig|dried figs;21;8
mango;200;336
peach|nectarine;60;150
pear;100;178
plum;30;66
cherries|cherry;100;154;154
watermelon;45;150;152
pineapple;80;165;165
kiwi;42;69
avocado;240;150
lemon|lime;17;58
date|dates|medjool date;66;24
raisins;130;40;145
salad|green salad|side salad;45;100
caesar salad;190;150
spinach;7;30;30
kale;33;67;67
broccoli;31;91;91
carrot|carrots;25;61
cucumber;16;100
tomato|tomatoes;22;123
bell pepper|pepper;30;119
onion;44;110
mushroom|mushrooms;15;70;70
zucchini;33;196
cauliflower;27;107;107
sweet potato;115;130
potato|baked potato;160;173
mashed potatoes|mashed potato;210;210;210
french fries|fries;365;117
chips|potato chips|crisps;150;28
corn;130;90
peas;60;80;80
green beans;35;110
asparagus;20;90
brussels sprouts;38;88
cabbage;22;89
beets|beet;35;82
eggplant|aubergine;35;82
roasted vegetables|veggies|vegetables|veg;80;150
rice|white rice|brown rice|basmati;205;158;158
fried rice;330;200
pasta|spaghetti|noodles|penne|macaroni;220;140;140
mac and cheese|mac & cheese;350;200
ramen;380;350
quinoa;220;185;185
couscous;175;157;157
tortilla|wrap;140;45
pita;165;60
naan;260;90
cracker|crackers;70;16
pretzel|pretzels;110;28
popcorn;95;25
rice cake;35;9
chicken|chicken breast|grilled chicken|roast chicken;165;100
chicken thigh;210;100
fried chicken;320;120
chicken nuggets|nuggets|nugget;45;18
turkey;135;85
beef|steak|sirloin;250;100
ground beef|hamburger meat;250;100
burger|hamburger|cheeseburger;550;230
hot dog;290;100
pork|pork chop;230;100
ham;100;85
salmon;235;113
tuna|canned tuna;130;100
shrimp|prawns;85;85
fish|white fish|cod;105;100
sardines;190;92
tofu;90;120
tempeh;160;84
beans|black beans|chickpeas|lentils|kidney beans;225;172;172
hummus;70;30
falafel;57;17
peanut butter|almond butter|nut butter;95;16
peanut butter and jelly|pb and j|pbj;380;100
nuts|almonds|walnuts|cashews|peanuts|pistachios;165;28
trail mix;175;30
seeds|pumpkin seeds|sunflower seeds|chia seeds;150;28
protein bar|granola bar|bar;200;60
protein shake|protein powder;120;30
pizza|pizza slice;285;107
sandwich;400;200
grilled cheese;400;130
burrito;550;250
taco|tacos;180;80
quesadilla;470;150
nachos;550;200
sushi|sushi roll|maki|roll;45;30
nigiri;55;40
sashimi;40;30
miso soup;40;240
soup|stew|chili;220;250;250
curry;350;300
pad thai;550;300
pho;450;500
lasagna;380;250
shawarma|gyro;550;250
kebab;300;150
tabbouleh|tabouleh;120;120
baba ganoush;45;30
dumplings|dumpling;45;25
spring roll|spring rolls;100;60
grain bowl|salad bowl|bowl;500;400
smoothie;220;350
acai bowl;380;300
edamame;120;155;155
seaweed|nori;10;5
kimchi;15;100
olives|olive;40;30
pickles|pickle;5;35
dark chocolate|chocolate;170;28
chocolate bar;230;43
cookie|cookies;150;40
brownie;230;60
cake|cake slice;350;100
cupcake;300;80
ice cream|gelato;140;66
donut|doughnut;260;70
candy|gummies;100;30
muffin;380;113
pastry|danish;300;80
pie|pie slice;320;125
water|sparkling water|seltzer|herbal tea|tisane|green tea|black tea|tea|black coffee|coffee|iced coffee|espresso|americano;3;240;240
matcha latte|chai latte|latte|flat white;170;350
cappuccino;120;240
matcha;5;250
hot chocolate;190;240
juice|orange juice|apple juice;110;240;240
soda|coke|cola;150;355
kombucha;60;240
beer;150;355
wine|red wine|white wine;125;150
cocktail;200;150
whiskey|vodka|gin|tequila|shot;100;44
olive oil|oil;120;14
mayo|mayonnaise;95;14
ketchup;20;17
dressing|ranch|vinaigrette;75;30
salsa;10;30
guacamole;45;30
honey|jam|jelly|maple syrup|syrup|sugar;55;18
soy sauce;10;15
`;
const FOODS=[],FOOD_NAMES=[];
FOOD_RAW.trim().split("\n").forEach(l=>{
  const [n,k,g,c]=l.split(";"),f={names:n.split("|"),k:+k,g:+g,c:+c||0};
  FOODS.push(f);f.names.forEach(x=>FOOD_NAMES.push({name:x,f}));
});
FOOD_NAMES.sort((a,b)=>b.name.length-a.name.length);

const NUMW={a:1,an:1,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,twelve:12,dozen:12,half:.5,couple:2,few:3,some:1};
const FRAC={"½":.5,"¼":.25,"¾":.75,"⅓":.33,"⅔":.67};
const UNITS={cup:"cup",cups:"cup",c:"cup",tbsp:"tbsp",tablespoon:"tbsp",tablespoons:"tbsp",tsp:"tsp",teaspoon:"tsp",teaspoons:"tsp",oz:"oz",ounce:"oz",ounces:"oz",g:"g",gram:"g",grams:"g",ml:"ml",handful:"hand",handfuls:"hand",scoop:"scoop",scoops:"scoop",bowl:"bowl",bowls:"bowl",glass:"cup",glasses:"cup",can:"each",cans:"each",bottle:"each",slice:"each",slices:"each",piece:"each",pieces:"each",pcs:"each",pc:"each",serving:"each",servings:"each",roll:"each",rolls:"each",strip:"each",strips:"each",wedge:"each",wedges:"each",link:"each",links:"each",patty:"each",stick:"each",square:"each",squares:"each"};
const PROTECT=[["mac and cheese","mac_and_cheese"],["mac & cheese","mac_and_cheese"],["peanut butter and jelly","peanut_butter_and_jelly"],["pb and j","pbj"],["half and half","half_and_half"],["fish and chips","fish_chips"],["rice and beans","rice_beans"]];

function matchFood(txt){
  const t=" "+txt.replace(/_/g," ")+" ";
  for(const {name,f} of FOOD_NAMES){
    const re=new RegExp("(^|[^a-z])"+name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(e?s)?([^a-z]|$)");
    if(re.test(t))return f;
  }
  return null;
}
function parseQty(words){
  let q=null,i=0;
  const w=words[0];if(w===undefined)return{q:null,i:0};
  const m=w.match(/^(\d+(?:\.\d+)?)(?:x)?(?:\/(\d+))?$/);
  if(/^x\d+$/.test(w)){return{q:+w.slice(1),i:1}}
  if(m){q=m[2]?(+m[1])/(+m[2]):+m[1];i=1;
    if(words[1]&&/^\d+\/\d+$/.test(words[1])&&!m[2]){const [a,b]=words[1].split("/");q+=(+a)/(+b);i=2}
    return{q,i}}
  if(FRAC[w]!==undefined)return{q:FRAC[w],i:1};
  const mix=w.match(/^(\d+)([½¼¾⅓⅔])$/);if(mix)return{q:+mix[1]+FRAC[mix[2]],i:1};
  if(NUMW[w]!==undefined)return{q:NUMW[w],i:1};
  return{q:null,i:0};
}
function estimateItem(raw,isWith){
  let s=raw.toLowerCase().replace(/\(.*?\)/g," ").replace(/[^a-z0-9½¼¾⅓⅔.\/&\s-]/g," ").replace(/\s+/g," ").trim();
  if(!s)return null;
  s=s.replace(/^(of|a bit of|some)\s+/,"");
  let words=s.split(" "),size=1;
  const {q,i}=parseQty(words);let qty=q;words=words.slice(i);
  if(["small","mini"].includes(words[0])){size=.8;words.shift()}else if(["large","big","huge"].includes(words[0])){size=1.3;words.shift()}else if(words[0]==="medium"){words.shift()}
  let unit=null;
  if(words[0]&&UNITS[words[0]]){unit=UNITS[words[0]];words.shift()}
  if(words[0]==="of")words.shift();
  const food=matchFood(words.join(" "))||matchFood(s);
  if(!food)return{text:raw.trim(),k:0,unknown:true};
  const cupG=food.c||(food.g>=100?food.g:150),perG=food.k/food.g;
  let n=qty==null?1:qty,k;
  switch(unit){
   case"g":k=perG*n;break;
   case"oz":k=perG*n*28.35;break;
   case"ml":k=perG*n*(cupG/240);break;
   case"cup":k=perG*cupG*n;break;
   case"tbsp":k=perG*cupG*n/16;break;
   case"tsp":k=perG*cupG*n/48;break;
   case"hand":k=perG*30*n;break;
   case"scoop":k=food.c?perG*cupG*n/2:food.k*n;break;
   case"bowl":k=food.c?perG*cupG*1.25*n:food.k*n*1.3;break;
   default:k=food.k*n;
  }
  k*=size;
  if(isWith&&qty==null&&!unit&&food.c)k=perG*cupG/8;  /* a splash, not a cup */
  return{text:raw.trim(),k:Math.round(k),food:food.names[0]};
}
const _estCache=new Map();
function estimateMeal(text){
  text=(text||"").trim();
  if(!text)return{total:0,items:[],unknown:[]};
  if(_estCache.has(text))return _estCache.get(text);
  let t=text.toLowerCase();PROTECT.forEach(([a,b])=>{t=t.split(a).join(b)});
  const parts=t.split(/[,;\n+&]|\band\b|\bplus\b/);
  const items=[],unknown=[];
  parts.forEach(p=>{
    const sub=p.split(/\bwith\b/);
    sub.forEach((x,idx)=>{const r=estimateItem(x,idx>0);if(!r)return;if(r.unknown)unknown.push(r.text);else items.push(r)});
  });
  const total=Math.round(items.reduce((a,b)=>a+b.k,0)/5)*5;
  const out={total,items,unknown};
  _estCache.set(text,out);return out;
}
