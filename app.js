/* =========================================================
   NYC GIRLS' TRIP — app.js
   Vanilla JS PWA. No build step. Data syncs via Firebase
   Firestore when configured (see firebase-config.js); falls
   back to on-device localStorage otherwise.
   ========================================================= */

const TRIP_CODE = window.TRIP_CODE || "nyc-oct-2026";
const CFG = window.FIREBASE_CONFIG || {};
const FIREBASE_READY = CFG.apiKey && CFG.apiKey !== "YOUR_API_KEY";

/* ---------------- Seed data ---------------- */

// Verified against live search results in Aug 2026 unless flagged verified:false.
const SEED_PLACES = [
  { id:"apollo-bagels", name:"Apollo Bagels (East Village)", category:"Breakfast", neighborhood:"East Village",
    address:"242 E 10th St, New York, NY 10003", hours:"Daily 7:00am–5:00pm", price:"$",
    lat:40.7291, lng:-73.9843,
    why:"Naturally fermented sourdough bagels — no seating, grab and go, but it's the one you already wanted. Go on a weekday or before 10am on weekends or the line gets long.",
    tags:["breakfast","coffee","quick"], verified:true, link:"https://apollobagels.com/" },
  { id:"enly-nikita", name:"ENLY Nikita (coffee)", category:"Breakfast", neighborhood:"check before visiting",
    address:"check before visiting — couldn't verify a current NYC location under this exact name",
    hours:"check before visiting", price:"$",
    lat:40.7295, lng:-73.9965,
    why:"You listed this one specifically — we couldn't confirm current address/hours for it, so double check the spelling and location before building a morning around it, then edit this entry with the real details.",
    tags:["breakfast","coffee"], verified:false, link:"" },
  { id:"lindustrie", name:"L'Industrie Pizzeria", category:"Lunch", neighborhood:"West Village",
    address:"104 Christopher St, New York, NY 10014", hours:"Daily 12:00pm–10:00pm", price:"$",
    lat:40.7331, lng:-74.0046,
    why:"Cult NYC slice — thin, blistered crust, burrata slice is the move. First-come-first-served line, no seating inside; there's often a wait.",
    tags:["lunch","pizza","quick"], verified:true, link:"https://www.lindustriebk.com/" },
  { id:"los-tacos", name:"Los Tacos No. 1 (Chelsea Market)", category:"Dinner", neighborhood:"Chelsea",
    address:"75 9th Ave, New York, NY 10011 (inside Chelsea Market)", hours:"Daily 11:00am–10:00pm", price:"$",
    lat:40.7423, lng:-74.0061,
    why:"The original stand-up taqueria — often called the best tacos in the city. No seating at the counter, but there's shared seating elsewhere in the Market. Order the adobada.",
    tags:["dinner","mexican","quick"], verified:true, link:"https://www.lostacos1.com/" },
  { id:"monkey-bar", name:"Monkey Bar", category:"Dinner", neighborhood:"Midtown East",
    address:"60 E 54th St, New York, NY 10022", hours:"Mon–Fri 11:30am–10pm · Sat 5:30–10pm · Closed Sunday", price:"$$$$",
    lat:40.7605, lng:-73.9723,
    why:"Old-school NYC glamour — red banquettes, classic American menu, seriously good cocktails. Your splurge night. Reservations open on Resy exactly 20–21 days ahead at 9am ET and go FAST — set an alarm.",
    tags:["dinner","cocktails","special"], verified:true, link:"https://www.nycmonkeybar.com/" },
  { id:"alidoro", name:"Alidoro (SoHo)", category:"Lunch", neighborhood:"SoHo",
    address:"105 Sullivan St, New York, NY 10012", hours:"Mon–Sat 11:30am–4:00pm · Closed Sunday", price:"$$",
    lat:40.7264, lng:-74.0028,
    why:"Cult Italian sandwich counter since 1986 — 40+ subs named after Italian icons (try the Sinatra). Cash-friendly, no seats, order confidently and don't ask for substitutions.",
    tags:["lunch","sandwiches","quick"], verified:true, link:"https://www.alidoronyc.com/" },
  { id:"raising-canes", name:"Raising Cane's (Times Square)", category:"Takeaway", neighborhood:"Midtown",
    address:"1560 Broadway, New York, NY 10036 — check nearest branch before going", hours:"check before visiting", price:"$",
    lat:40.7580, lng:-73.9855,
    why:"Your requested takeaway craving. Several NYC branches now — check the app for the one nearest wherever you end up that night.",
    tags:["takeaway","late-night"], verified:false, link:"" },
  { id:"ev-cinnamon", name:"East Village cinnamon rolls (Sunday)", category:"Dessert", neighborhood:"East Village",
    address:"check before visiting — confirm your specific bakery (e.g. a cult East Village bakery of your choice) and go early, cinnamon rolls sell out",
    hours:"check before visiting", price:"$",
    lat:40.7265, lng:-73.9815,
    why:"You flagged this as a Sunday-morning tradition — East Village has several beloved bakery cinnamon rolls. Pin your favourite here once you've picked one; they tend to sell out by late morning so go early.",
    tags:["dessert","breakfast","sunday"], verified:false, link:"" },
  { id:"dimes", name:"Dimes", category:"Brunch", neighborhood:"Lower East Side",
    address:"49 Canal St, New York, NY 10002", hours:"check before visiting", price:"$$",
    lat:40.7148, lng:-73.9930,
    why:"Bright, plant-filled LES brunch spot popular with the young-creative crowd — good grain bowls and natural wine.",
    tags:["brunch","lunch"], verified:false, link:"" },
  { id:"le-dive", name:"Le Dive", category:"Cocktails", neighborhood:"Lower East Side",
    address:"200 Chrystie St, New York, NY 10002", hours:"check before visiting", price:"$$",
    lat:40.7217, lng:-73.9928,
    why:"French-leaning wine/cocktail bar that's become an LES young-professional favourite — great for a pre-dinner drink.",
    tags:["cocktails","nightlife"], verified:false, link:"" },
  { id:"clandestino", name:"Clandestino", category:"Nightlife", neighborhood:"Chinatown/LES",
    address:"35 Canal St, New York, NY 10002", hours:"check before visiting", price:"$",
    lat:40.7148, lng:-73.9925,
    why:"Low-key, sceney dance bar that gets going late — DJ sets, no real dance floor rules, exactly the 'find the cool crowd' energy you wanted.",
    tags:["nightlife","dancing"], verified:false, link:"" },
  { id:"house-of-yes", name:"House of Yes", category:"Nightlife", neighborhood:"Bushwick, Brooklyn",
    address:"2 Wyckoff Ave, Brooklyn, NY 11237", hours:"check before visiting — check event calendar", price:"$$",
    lat:40.7050, lng:-73.9226,
    why:"Theatrical Brooklyn nightclub — costumes, circus performers, big dance floor. Worth the trip out for a proper dancing night; check what's on before booking tickets.",
    tags:["nightlife","dancing","special"], verified:false, link:"" },
  { id:"bar-pisellino", name:"Bar Pisellino", category:"Coffee", neighborhood:"West Village",
    address:"52 Grove St, New York, NY 10014", hours:"check before visiting", price:"$$",
    lat:40.7317, lng:-74.0028,
    why:"Tiny Italian-style cafe-bar, gorgeous green awning — great for an espresso or an aperitivo, very photogenic corner.",
    tags:["coffee","cocktails"], verified:false, link:"" },
  { id:"lucky-danger", name:"Lucky Danger", category:"Dinner", neighborhood:"NoHo",
    address:"46 Bond St, New York, NY 10012", hours:"check before visiting", price:"$$",
    lat:40.7269, lng:-73.9942,
    why:"Playful American-Chinese takeout-turned-sit-down spot, popular with a young downtown crowd.",
    tags:["dinner","asian"], verified:false, link:"" },
  { id:"dante", name:"Café Dante", category:"Cocktails", neighborhood:"West Village",
    address:"79-81 MacDougal St, New York, NY 10012", hours:"check before visiting", price:"$$$",
    lat:40.7297, lng:-74.0011,
    why:"Historic West Village cafe turned one of the best cocktail bars in the city — famous Garibaldi. Very SATC energy, worth booking ahead.",
    tags:["cocktails","dinner"], verified:false, link:"" },
  { id:"elsewhere", name:"Elsewhere", category:"Nightlife", neighborhood:"Bushwick, Brooklyn",
    address:"599 Johnson Ave, Brooklyn, NY 11237", hours:"check before visiting — check event calendar", price:"$$",
    lat:40.7107, lng:-73.9330,
    why:"Multi-room club/venue with a rooftop — good for a proper dancing night if there's a DJ you like on the calendar.",
    tags:["nightlife","dancing"], verified:false, link:"" },
  { id:"cervos", name:"Cervo's", category:"Dinner", neighborhood:"Lower East Side",
    address:"43 Canal St, New York, NY 10002", hours:"check before visiting", price:"$$$",
    lat:40.7147, lng:-73.9915,
    why:"Portuguese seafood spot from the Dimes team — natural wine, buzzy LES dinner, feels like where the cool crowd actually eats.",
    tags:["dinner","seafood"], verified:false, link:"" },
  { id:"washington-sq", name:"Washington Square Park", category:"Sightseeing", neighborhood:"Greenwich Village",
    address:"Washington Square Park, New York, NY 10012", hours:"6am–12am", price:"Free",
    lat:40.7308, lng:-73.9973,
    why:"The arch, the fountain, street performers — a quick 20-minute wander rather than a whole afternoon, exactly your 'iconic but brief' vibe.",
    tags:["sightseeing","free","outdoor"], verified:false, link:"" },
  { id:"highline", name:"The High Line", category:"Sightseeing", neighborhood:"Chelsea/Meatpacking",
    address:"Gansevoort St to 34th St (elevated park)", hours:"7am–10pm (seasonal, check before visiting)", price:"Free",
    lat:40.7480, lng:-74.0048,
    why:"Elevated park with skyline views — walk the southern stretch near Chelsea Market rather than the whole thing; pairs perfectly with Los Tacos.",
    tags:["sightseeing","free","outdoor"], verified:false, link:"" },
  { id:"domino-park", name:"Domino Park", category:"Sightseeing", neighborhood:"Williamsburg, Brooklyn",
    address:"15 River St, Brooklyn, NY 11249", hours:"6am–1am", price:"Free",
    lat:40.7178, lng:-73.9647,
    why:"Waterfront park with the best Manhattan skyline view — go for golden hour, then stay in Williamsburg for dinner.",
    tags:["sightseeing","free","outdoor"], verified:false, link:"" }
];

const SEED_ITINERARY = [
  { date:"2026-10-08", weekday:"Thursday", title:"Touch down", jetlag:true,
    blocks:[
      { time:"15:55", name:"Land at JFK", category:"Travel", note:"Flight from Gatwick. Clear immigration/customs, then car or AirTrain+A train to Washington Heights (~1hr).", anchor:true, flex:false },
      { time:"18:00", name:"Check in — Radio Hotel", category:"Travel", note:"2420 Amsterdam Ave, Washington Heights.", anchor:true, flex:false },
      { time:"20:00", name:"Easy dinner near the hotel", category:"Dinner", note:"Keep it low-key tonight — you'll be running on no sleep. Stay in Washington Heights/Hudson Heights rather than trekking downtown.", anchor:false, flex:true }
    ]},
  { date:"2026-10-09", weekday:"Friday", title:"Downtown & Soho debut", jetlag:true,
    blocks:[
      { time:"09:30", name:"Apollo Bagels (East Village)", category:"Breakfast", placeId:"apollo-bagels", anchor:true, flex:false },
      { time:"11:00", name:"Wander Washington Square Park", category:"Sightseeing", placeId:"washington-sq", note:"Quick 20 min, not a whole stop.", anchor:false, flex:true },
      { time:"13:00", name:"Alidoro (SoHo) — sandwiches", category:"Lunch", placeId:"alidoro", note:"Closed Sundays, so this is the day for it.", anchor:true, flex:false },
      { time:"14:30", name:"Browse SoHo boutiques", category:"Shopping", note:"Mercer/Greene/Spring St.", anchor:false, flex:true },
      { time:"19:30", name:"Le Dive — pre-dinner drink", category:"Cocktails", placeId:"le-dive", anchor:false, flex:true },
      { time:"21:00", name:"Cervo's — LES dinner", category:"Dinner", placeId:"cervos", note:"Book ahead if you can.", anchor:false, flex:true }
    ]},
  { date:"2026-10-10", weekday:"Saturday", title:"West Village pizza + High Line", jetlag:false,
    blocks:[
      { time:"11:00", name:"Bar Pisellino — coffee", category:"Coffee", placeId:"bar-pisellino", anchor:false, flex:true },
      { time:"13:00", name:"L'Industrie Pizzeria", category:"Lunch", placeId:"lindustrie", note:"Expect a line — go hungry, it moves fast.", anchor:true, flex:false },
      { time:"15:00", name:"High Line (southern stretch)", category:"Sightseeing", placeId:"highline", anchor:false, flex:true },
      { time:"16:30", name:"Los Tacos No. 1 (Chelsea Market)", category:"Dinner", placeId:"los-tacos", note:"Early dinner/late lunch — grab it while walking through the Market.", anchor:true, flex:false },
      { time:"22:00", name:"Clandestino — dancing", category:"Nightlife", placeId:"clandestino", anchor:false, flex:true }
    ]},
  { date:"2026-10-11", weekday:"Sunday", title:"Cinnamon rolls & lazy East Village", jetlag:false,
    blocks:[
      { time:"10:00", name:"East Village cinnamon rolls", category:"Dessert", placeId:"ev-cinnamon", note:"Confirm your bakery and go early — these sell out.", anchor:true, flex:false },
      { time:"12:00", name:"Dimes — brunch", category:"Brunch", placeId:"dimes", anchor:false, flex:true },
      { time:"15:00", name:"Rest / pool or spa time back at the hotel", category:"Rest", note:"Buffer afternoon — no plans on purpose.", anchor:false, flex:true },
      { time:"19:00", name:"Lucky Danger — dinner", category:"Dinner", placeId:"lucky-danger", anchor:false, flex:true }
    ]},
  { date:"2026-10-12", weekday:"Monday", title:"Midtown glamour night", jetlag:false,
    blocks:[
      { time:"12:00", name:"Free morning / shopping", category:"Flex", anchor:false, flex:true },
      { time:"19:30", name:"Monkey Bar", category:"Dinner", placeId:"monkey-bar", note:"BOOK 20–21 days ahead on Resy at 9am ET sharp — closed Sundays, so this slot works.", anchor:true, flex:false }
    ]},
  { date:"2026-10-13", weekday:"Tuesday", title:"Brooklyn day", jetlag:false,
    blocks:[
      { time:"12:00", name:"Williamsburg wander", category:"Sightseeing", note:"Bedford Ave shops.", anchor:false, flex:true },
      { time:"17:30", name:"Domino Park — golden hour", category:"Sightseeing", placeId:"domino-park", anchor:false, flex:true },
      { time:"20:00", name:"Dinner in Williamsburg", category:"Dinner", note:"Pick something in the Places tab filtered to Brooklyn.", anchor:false, flex:true },
      { time:"23:00", name:"House of Yes", category:"Nightlife", placeId:"house-of-yes", note:"Check the event calendar and book tickets ahead.", anchor:false, flex:true }
    ]},
  { date:"2026-10-14", weekday:"Wednesday", title:"Flex day", jetlag:false,
    blocks:[
      { time:"11:00", name:"Open — swap in whatever's calling", category:"Flex", note:"Use the Now tab to find something nearby.", anchor:false, flex:true }
    ]},
  { date:"2026-10-15", weekday:"Thursday", title:"Flex day", jetlag:false,
    blocks:[
      { time:"11:00", name:"Open — swap in whatever's calling", category:"Flex", note:"Use the Now tab to find something nearby.", anchor:false, flex:true }
    ]},
  { date:"2026-10-16", weekday:"Friday", title:"Café Dante night", jetlag:false,
    blocks:[
      { time:"12:00", name:"Free day", category:"Flex", anchor:false, flex:true },
      { time:"20:00", name:"Café Dante — cocktails", category:"Cocktails", placeId:"dante", note:"Book ahead — it's popular.", anchor:true, flex:false },
      { time:"22:00", name:"Dinner nearby in West Village", category:"Dinner", anchor:false, flex:true }
    ]},
  { date:"2026-10-17", weekday:"Saturday", title:"Last big night", jetlag:false,
    blocks:[
      { time:"12:00", name:"Free day / last-minute shopping", category:"Flex", anchor:false, flex:true },
      { time:"21:00", name:"Big final dinner — pick your splurge", category:"Dinner", note:"Use the Places tab and swap something in.", anchor:false, flex:true },
      { time:"23:30", name:"Elsewhere or House of Yes — last dance", category:"Nightlife", placeId:"elsewhere", anchor:false, flex:true }
    ]},
  { date:"2026-10-18", weekday:"Sunday", title:"Pack up & fly home", jetlag:false,
    blocks:[
      { time:"09:30", name:"Raising Cane's or last favourite breakfast run", category:"Breakfast", note:"Grab a final favourite before packing.", anchor:false, flex:true },
      { time:"11:00", name:"Pack + hotel checkout", category:"Travel", anchor:true, flex:false },
      { time:"13:00", name:"Last wander near the hotel / Hudson Heights", category:"Flex", anchor:false, flex:true },
      { time:"14:30", name:"Head to JFK", category:"Travel", note:"Allow ~1hr from Washington Heights plus 3hrs before an international flight.", anchor:true, flex:false },
      { time:"18:20", name:"Depart JFK → Gatwick", category:"Travel", note:"Lands 06:20 the next morning.", anchor:true, flex:false }
    ]}
];

const DEFAULT_BUDGET = {
  totalGBP: 1000,
  totalUSD: 0,
  categories: [
    { name:"Food & drink", planned:400 },
    { name:"Nightlife/tickets", planned:150 },
    { name:"Shopping", planned:150 },
    { name:"Transport", planned:100 },
    { name:"Misc", planned:200 }
  ],
  expenses: []
};

const DEFAULT_PACKING = [
  { section:"Documents", items:["Passport","Boarding passes / ESTA confirmation","Travel insurance details","Hotel confirmation","Card that works abroad (no FX fee)"] },
  { section:"Outfits", items:["Going-out outfits x4-5","Comfy walking outfits x4","Layer for cold evenings (Oct in NYC gets chilly)","Light rain jacket","Comfortable walking shoes","Heels/dressy shoes for nights out","Pyjamas","Underwear + socks"] },
  { section:"Beauty", items:["Makeup bag","Skincare","Hair tools/adapter (US is 120V — bring a converter, not just an adapter)","Perfume","Hair ties/accessories"] },
  { section:"Tech", items:["Phone charger","Portable battery pack","US plug adapter","Headphones","Camera if not just phone"] },
  { section:"Health", items:["Any regular medication","Painkillers","Plasters/blister care","Travel-size hand sanitiser"] },
  { section:"Extras", items:["Reusable water bottle","Tote bag for shopping days","Small crossbody bag for nights out","Portable phone charger for long nights out"] }
];

const INFO = {
  transport: [
    { label:"Getting from JFK", detail:"AirTrain to Jamaica/Howard Beach then subway (~$10-13 total), a yellow cab (flat ~$70+tolls to Manhattan), or Uber/Lyft (~$60-90, surges at peak)." },
    { label:"Getting around", detail:"MetroCard is being phased out — use OMNY: tap your contactless card or phone directly at the turnstile, no app or card needed. $2.90/ride, capped at 12 rides/week." },
    { label:"From Washington Heights", detail:"A train is fastest into Downtown/Midtown (~25-35 min to most of your spots). 1 train also runs through Washington Heights." },
    { label:"Uber/Lyft at night", detail:"Reliable and normal to use late at night — often safer/easier than the subway after midnight." }
  ],
  money: [
    { label:"Tipping", detail:"15-20% at sit-down restaurants and bars (many receipts suggest 20-25% now — you can adjust down). ~$1-2/drink at bars if paying cash. Taxi/rideshare 15-20%. Not required for counter service." },
    { label:"Tax", detail:"NYC sales tax (~8.875%) is NOT included in menu prices — always add it mentally when budgeting." },
    { label:"Cards vs cash", detail:"Card is fine almost everywhere; a few old-school spots (like Alidoro) are cash-friendly/cash-only for smaller orders — carry some cash." }
  ],
  emergency: [
    { label:"Emergency (police/fire/ambulance)", detail:"911" },
    { label:"UK Consulate General, New York", detail:"845 Third Ave, New York — check current contact details before you go" },
    { label:"Non-emergency police", detail:"311 (NYC general city services line)" }
  ]
};

/* ---------------- State ---------------- */
let STATE = {
  itinerary: SEED_ITINERARY,
  places: SEED_PLACES,
  budget: DEFAULT_BUDGET,
  packing: DEFAULT_PACKING,
  ui: { tab:"now", placeFilter:"All", placeSearch:"", mapsApp:"google" }
};

let db = null;
let unsubItinerary=null, unsubPlaces=null, unsubBudget=null, unsubPacking=null;

/* ---------------- Sync layer ---------------- */
function initSync(){
  if (!FIREBASE_READY){
    setSyncPill(false);
    loadLocal();
    render();
    return;
  }
  try{
    firebase.initializeApp(CFG);
    db = firebase.firestore();
    setSyncPill(true);
    const tripRef = db.collection("trips").doc(TRIP_CODE);

    // Ensure doc exists with seed data on first run, then listen live.
    tripRef.get().then((doc)=>{
      if (!doc.exists){
        tripRef.set({
          itinerary: SEED_ITINERARY, places: SEED_PLACES,
          budget: DEFAULT_BUDGET, packing: DEFAULT_PACKING
        });
      }
      tripRef.onSnapshot((snap)=>{
        const d = snap.data();
        if (!d) return;
        if (d.itinerary) STATE.itinerary = d.itinerary;
        if (d.places) STATE.places = d.places;
        if (d.budget) STATE.budget = d.budget;
        if (d.packing) STATE.packing = d.packing;
        render();
      });
    });
  }catch(e){
    console.error("Firebase init failed, falling back to local mode", e);
    setSyncPill(false);
    loadLocal();
    render();
  }
}

function setSyncPill(live){
  const dot = document.getElementById("syncDot");
  const label = document.getElementById("syncLabel");
  if (!dot) return;
  dot.className = "sync-dot " + (live ? "live" : "off");
  label.textContent = live ? "Synced live" : "This device only";
}

function saveState(){
  if (FIREBASE_READY && db){
    db.collection("trips").doc(TRIP_CODE).set({
      itinerary: STATE.itinerary, places: STATE.places,
      budget: STATE.budget, packing: STATE.packing
    }, { merge:true }).catch((e)=>console.error("save failed", e));
  } else {
    saveLocal();
  }
  render();
}

function saveLocal(){
  try{
    localStorage.setItem("nyc-trip-"+TRIP_CODE, JSON.stringify({
      itinerary: STATE.itinerary, places: STATE.places,
      budget: STATE.budget, packing: STATE.packing
    }));
  }catch(e){ console.error(e); }
}
function loadLocal(){
  try{
    const raw = localStorage.getItem("nyc-trip-"+TRIP_CODE);
    if (raw){
      const d = JSON.parse(raw);
      if (d.itinerary) STATE.itinerary = d.itinerary;
      if (d.places) STATE.places = d.places;
      if (d.budget) STATE.budget = d.budget;
      if (d.packing) STATE.packing = d.packing;
    }
  }catch(e){ console.error(e); }
}

/* ---------------- Helpers ---------------- */
function placeById(id){ return STATE.places.find(p=>p.id===id); }
function fmtDate(iso){
  const d = new Date(iso+"T12:00:00");
  return d.toLocaleDateString("en-GB",{day:"numeric", month:"short"});
}
function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window._toastT);
  window._toastT = setTimeout(()=>t.classList.remove("show"), 1800);
}
function uid(){ return Math.random().toString(36).slice(2,10); }
function haversine(lat1,lng1,lat2,lng2){
  const R=6371, toRad=x=>x*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLng=toRad(lng2-lng1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function openDirections(place){
  const app = STATE.ui.mapsApp;
  const dest = encodeURIComponent(place.address || place.name);
  let url;
  if (app==="apple") url = `https://maps.apple.com/?daddr=${place.lat},${place.lng}&q=${dest}`;
  else if (app==="citymapper") url = `https://citymapper.com/directions?endcoord=${place.lat}%2C${place.lng}&endname=${dest}`;
  else url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
  window.open(url, "_blank");
}

/* ---------------- Render root ---------------- */
function render(){
  renderNow();
  renderItinerary();
  renderPlaces();
  renderBudget();
  renderPacking();
  renderInfo();
}

function switchTab(tab){
  STATE.ui.tab = tab;
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById("view-"+tab).classList.add("active");
  document.querySelectorAll(".tab-btn").forEach(b=>b.classList.toggle("active", b.dataset.tab===tab));
}

/* ---------------- NOW tab ---------------- */
let userCoords = null;
function renderNow(){
  const el = document.getElementById("nowList");
  const today = new Date().toISOString().slice(0,10);
  const todayPlan = STATE.itinerary.find(d=>d.date===today);
  const heroNote = document.getElementById("nowHeroNote");
  if (todayPlan){
    heroNote.textContent = `Today: ${todayPlan.title}`;
  } else {
    heroNote.textContent = "Tap a mood below to see what's close and open.";
  }
  const mood = STATE.ui.nowMood || "All";
  let list = STATE.places.filter(p => mood==="All" || p.tags.includes(mood.toLowerCase()));
  if (userCoords){
    list = list.map(p=>({...p, dist: haversine(userCoords.lat,userCoords.lng,p.lat,p.lng)}))
               .sort((a,b)=>a.dist-b.dist);
  }
  list = list.slice(0,8);
  el.innerHTML = list.map(p => placeCardHTML(p, {showDist:!!userCoords})).join("") ||
    `<div class="empty">No spots match that mood yet — try another one.</div>`;
}
function setMood(m){
  STATE.ui.nowMood = m;
  document.querySelectorAll("#moodChips .chip").forEach(c=>c.classList.toggle("active", c.dataset.mood===m));
  renderNow();
}
function locateMe(){
  if (!navigator.geolocation){ toast("Location not supported on this device"); return; }
  navigator.geolocation.getCurrentPosition((pos)=>{
    userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    toast("Location found — sorting by distance");
    renderNow();
  }, ()=>{ toast("Couldn't get location — check permissions"); });
}

/* ---------------- ITINERARY tab ---------------- */
function renderItinerary(){
  const el = document.getElementById("itineraryList");
  el.innerHTML = STATE.itinerary.map((day, di) => {
    const blocks = day.blocks.map((b, bi) => blockHTML(day, di, b, bi)).join("");
    return `
      <div class="postcard">
        <div class="postcard-perf"></div>
        <div class="postcard-head">
          <div>
            <div class="postcard-date">${fmtDate(day.date)}</div>
            <div class="postcard-weekday">${day.weekday} · ${day.title}</div>
            ${day.jetlag ? `<span class="day-jetlag-flag">✈ jet-lag pace</span>` : ""}
          </div>
          <div class="stamp">Day ${di+1}</div>
        </div>
        <div class="postcard-body">
          ${blocks}
          <button class="icon-btn" style="margin-top:10px" onclick="openAddBlock(${di})">+ Add to this day</button>
        </div>
      </div>`;
  }).join("");
}
function blockHTML(day, di, b, bi){
  const place = b.placeId ? placeById(b.placeId) : null;
  const verifyTag = place && place.verified===false ? `<span class="tag verify">verify</span>` : "";
  return `
    <div class="block ${b.done?'done':''}">
      <div class="block-time">${b.time}</div>
      <div class="block-main">
        <div class="block-name">${b.name} ${b.anchor?'<span class="tag anchor">anchor</span>':'<span class="tag flex">flexible</span>'} ${verifyTag}</div>
        <div class="block-meta">${place ? place.address : (b.note||"")}</div>
        ${place && b.note ? `<div class="block-meta">${b.note}</div>` : ""}
        <div class="block-actions">
          <button class="icon-btn" onclick="toggleDone(${di},${bi})">${b.done?'↺ Undo':'✓ Done'}</button>
          ${place ? `<button class="icon-btn" onclick='directionsFor(${JSON.stringify(place.id)})'>📍 Directions</button>` : ""}
          ${place ? `<button class="icon-btn" onclick="openSwap(${di},${bi})">⇄ Swap</button>` : ""}
          <button class="icon-btn" onclick="openMoveBlock(${di},${bi})">↕ Move day</button>
          <button class="icon-btn" onclick="removeBlock(${di},${bi})">✕ Remove</button>
        </div>
      </div>
    </div>`;
}
function toggleDone(di,bi){
  STATE.itinerary[di].blocks[bi].done = !STATE.itinerary[di].blocks[bi].done;
  saveState();
}
function removeBlock(di,bi){
  STATE.itinerary[di].blocks.splice(bi,1);
  saveState();
  toast("Removed");
}
function directionsFor(placeId){
  const p = placeById(placeId);
  if (p) openDirections(p);
}

let swapTarget=null;
function openSwap(di,bi){
  swapTarget = {di,bi};
  const current = placeById(STATE.itinerary[di].blocks[bi].placeId);
  const cat = current ? current.category : "Dinner";
  const options = STATE.places.filter(p=>p.category===cat);
  document.getElementById("swapOptions").innerHTML = options.map(p=>`
    <div class="place-card" onclick="doSwap('${p.id}')" style="cursor:pointer">
      <div class="place-top"><div><div class="place-name">${p.name}</div><div class="place-cat">${p.neighborhood}</div></div><div class="pill">${p.price}</div></div>
    </div>`).join("");
  showModal("swapModal");
}
function doSwap(placeId){
  const {di,bi} = swapTarget;
  const p = placeById(placeId);
  STATE.itinerary[di].blocks[bi].placeId = p.id;
  STATE.itinerary[di].blocks[bi].name = p.name;
  saveState();
  closeModal("swapModal");
  toast("Swapped to "+p.name);
}

let moveTarget=null;
function openMoveBlock(di,bi){
  moveTarget = {di,bi};
  document.getElementById("moveOptions").innerHTML = STATE.itinerary.map((d,idx)=>`
    <button class="btn secondary btn-sm" style="width:100%; margin-bottom:6px; text-align:left" onclick="doMove(${idx})">${fmtDate(d.date)} — ${d.title}</button>
  `).join("");
  showModal("moveModal");
}
function doMove(targetDi){
  const {di,bi} = moveTarget;
  const block = STATE.itinerary[di].blocks.splice(bi,1)[0];
  STATE.itinerary[targetDi].blocks.push(block);
  STATE.itinerary[targetDi].blocks.sort((a,b)=>a.time.localeCompare(b.time));
  saveState();
  closeModal("moveModal");
  toast("Moved to "+fmtDate(STATE.itinerary[targetDi].date));
}

let addBlockDay=null;
function openAddBlock(di){
  addBlockDay = di;
  document.getElementById("addBlockForm").reset();
  showModal("addBlockModal");
}
function submitAddBlock(ev){
  ev.preventDefault();
  const f = ev.target;
  STATE.itinerary[addBlockDay].blocks.push({
    time: f.time.value || "12:00",
    name: f.name.value || "New plan",
    category: f.category.value || "Flex",
    note: f.note.value || "",
    anchor:false, flex:true
  });
  STATE.itinerary[addBlockDay].blocks.sort((a,b)=>a.time.localeCompare(b.time));
  saveState();
  closeModal("addBlockModal");
  toast("Added");
}

/* ---------------- PLACES tab ---------------- */
const CATEGORIES = ["All","Breakfast","Brunch","Lunch","Dinner","Dessert","Cocktails","Nightlife","Coffee","Sightseeing","Shopping","Takeaway"];
function renderPlaces(){
  const chipsEl = document.getElementById("placeChips");
  if (!chipsEl.dataset.built){
    chipsEl.innerHTML = CATEGORIES.map(c=>`<button class="chip ${c==='All'?'active':''}" data-cat="${c}" onclick="setPlaceFilter('${c}')">${c}</button>`).join("");
    chipsEl.dataset.built = "1";
  }
  const q = STATE.ui.placeSearch.toLowerCase();
  const filtered = STATE.places.filter(p=>{
    const catOk = STATE.ui.placeFilter==="All" || p.category===STATE.ui.placeFilter;
    const searchOk = !q || p.name.toLowerCase().includes(q) || p.neighborhood.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return catOk && searchOk;
  });
  document.getElementById("placesList").innerHTML = filtered.map(p=>placeCardHTML(p,{})).join("") ||
    `<div class="empty">Nothing matches — try a different filter, or add your own place below.</div>`;
}
function setPlaceFilter(c){
  STATE.ui.placeFilter = c;
  document.querySelectorAll("#placeChips .chip").forEach(el=>el.classList.toggle("active", el.dataset.cat===c));
  renderPlaces();
}
function onPlaceSearch(v){ STATE.ui.placeSearch = v; renderPlaces(); }

function placeCardHTML(p, opts){
  const catColor = {Breakfast:"var(--sun)",Brunch:"var(--sun)",Lunch:"var(--coral)",Dinner:"var(--coral)",Dessert:"var(--sun)",Cocktails:"var(--sky)",Nightlife:"var(--sky)",Coffee:"var(--sun)",Sightseeing:"var(--mint)",Shopping:"var(--mint)",Takeaway:"var(--coral)"}[p.category] || "var(--ink-soft)";
  return `
  <div class="place-card">
    <div class="place-top">
      <div>
        <div class="place-name">${p.name}</div>
        <div class="place-cat"><span class="dot" style="background:${catColor}"></span>${p.category} · ${p.neighborhood}${opts.showDist && p.dist!=null ? ` · ${p.dist.toFixed(1)}km away` : ""}</div>
      </div>
      <div class="pill">${p.price}</div>
    </div>
    <div class="place-why">${p.why}</div>
    <div class="place-meta-row">
      <span class="pill">${p.hours}</span>
      ${p.verified===false ? `<span class="pill" style="background:#FFF3D6">check before visiting</span>` : `<span class="pill" style="background:#E6F7F0">verified</span>`}
    </div>
    <div class="place-actions">
      <button class="btn secondary btn-sm" onclick='directionsFor(${JSON.stringify(p.id)})'>📍 Directions</button>
      <button class="btn secondary btn-sm" onclick="markSkipped('${p.id}')">Mark skipped</button>
    </div>
  </div>`;
}
function markSkipped(id){
  const p = placeById(id);
  p.skipped = !p.skipped;
  saveState();
  toast(p.skipped ? "Marked skipped" : "Unmarked");
}

function openAddPlace(){
  document.getElementById("addPlaceForm").reset();
  showModal("addPlaceModal");
}
function submitAddPlace(ev){
  ev.preventDefault();
  const f = ev.target;
  STATE.places.push({
    id:"custom-"+uid(), name:f.name.value, category:f.category.value || "Dinner",
    neighborhood:f.neighborhood.value || "", address:f.address.value || "",
    hours:"check before visiting", price:f.price.value || "$$",
    lat:40.7580, lng:-73.9855, why:f.why.value || "Added by the group.",
    tags:[(f.category.value||"dinner").toLowerCase()], verified:false, custom:true
  });
  saveState();
  closeModal("addPlaceModal");
  toast("Added to your places");
}

/* ---------------- BUDGET tab ---------------- */
function renderBudget(){
  const b = STATE.budget;
  const spent = b.expenses.reduce((s,e)=>s+Number(e.amount||0),0);
  const pct = Math.min(100, Math.round((spent/(b.totalGBP||1))*100));
  document.getElementById("budgetTotalDisplay").textContent = "£"+b.totalGBP;
  document.getElementById("budgetSpentDisplay").textContent = `£${spent.toFixed(0)} logged so far (${pct}%)`;
  document.getElementById("budgetProgressFill").style.width = pct+"%";

  document.getElementById("budgetCats").innerHTML = b.categories.map(c=>{
    const catSpent = b.expenses.filter(e=>e.category===c.name).reduce((s,e)=>s+Number(e.amount||0),0);
    return `<div class="budget-cat-row"><span>${c.name}</span><span class="muted">£${catSpent.toFixed(0)} / £${c.planned}</span></div>`;
  }).join("");

  document.getElementById("expenseList").innerHTML = b.expenses.slice().reverse().map(e=>`
    <div class="expense-item">
      <div>
        <div><strong>${e.label}</strong></div>
        <div class="muted">${e.category} · ${e.currency==='USD'?'$':'£'}${e.amount}</div>
      </div>
      <div style="text-align:right">
        <span class="status-badge ${e.status}">${e.status}</span><br/>
        <button class="icon-btn" style="margin-top:4px" onclick="removeExpense('${e.id}')">✕</button>
      </div>
    </div>`).join("") || `<div class="empty">No expenses logged yet.</div>`;
}
function updateBudgetTotal(v){
  STATE.budget.totalGBP = Number(v)||0;
  saveState();
}
function openAddExpense(){
  document.getElementById("addExpenseForm").reset();
  const sel = document.querySelector("#addExpenseForm select[name=category]");
  sel.innerHTML = STATE.budget.categories.map(c=>`<option value="${c.name}">${c.name}</option>`).join("");
  showModal("addExpenseModal");
}
function submitAddExpense(ev){
  ev.preventDefault();
  const f = ev.target;
  STATE.budget.expenses.push({
    id:uid(), label:f.label.value, amount:Number(f.amount.value)||0,
    currency:f.currency.value, category:f.category.value, status:f.status.value
  });
  saveState();
  closeModal("addExpenseModal");
  toast("Expense logged");
}
function removeExpense(id){
  STATE.budget.expenses = STATE.budget.expenses.filter(e=>e.id!==id);
  saveState();
}

/* ---------------- PACKING tab ---------------- */
function renderPacking(){
  const el = document.getElementById("packingList");
  el.innerHTML = STATE.packing.map((section, si) => `
    <div class="card">
      <h3 style="margin-bottom:6px">${section.section}</h3>
      ${section.items.map((item, ii) => {
        const key = si+"-"+ii;
        const checked = (STATE.packingChecked||{})[key];
        return `<label class="check-row ${checked?'checked':''}">
          <input type="checkbox" ${checked?'checked':''} onchange="togglePack('${key}')" />
          <span>${item}</span>
        </label>`;
      }).join("")}
    </div>
  `).join("");
}
function togglePack(key){
  STATE.packingChecked = STATE.packingChecked || {};
  STATE.packingChecked[key] = !STATE.packingChecked[key];
  // Packing state piggybacks on the budget doc-less path; store on STATE.packing meta via a side key.
  STATE.packing._checked = STATE.packingChecked;
  saveState();
}

/* ---------------- INFO tab ---------------- */
function renderInfo(){
  document.getElementById("infoTransport").innerHTML = INFO.transport.map(i=>`<div class="info-line"><span>${i.label}</span></div><div class="muted" style="margin:-4px 0 8px">${i.detail}</div>`).join("");
  document.getElementById("infoMoney").innerHTML = INFO.money.map(i=>`<div class="info-line"><span>${i.label}</span></div><div class="muted" style="margin:-4px 0 8px">${i.detail}</div>`).join("");
  document.getElementById("infoEmergency").innerHTML = INFO.emergency.map(i=>`<div class="info-line"><span>${i.label}</span></div><div class="muted" style="margin:-4px 0 8px">${i.detail}</div>`).join("");
}

/* ---------------- Modals ---------------- */
function showModal(id){ document.getElementById(id).style.display="flex"; }
function closeModal(id){ document.getElementById(id).style.display="none"; }

/* ---------------- Maps app preference ---------------- */
function setMapsApp(app){
  STATE.ui.mapsApp = app;
  document.querySelectorAll("#mapsAppChips .chip").forEach(c=>c.classList.toggle("active", c.dataset.app===app));
  toast("Directions will open in "+app);
}

/* ---------------- Init ---------------- */
window.addEventListener("DOMContentLoaded", ()=>{
  initSync();
  document.getElementById("tripCodeLabel").textContent = TRIP_CODE;
  if ("serviceWorker" in navigator){
    navigator.serviceWorker.register("./sw.js").catch(()=>{});
  }
});
