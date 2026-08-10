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
    tags:["breakfast","coffee","quick"], vibe:["foody", "chill"], cuisine:"Bagels", bestDay:"Best on weekdays or before 10am on weekends — the line gets long later", verified:true, link:"https://apollobagels.com/" },
  { id:"enly-nikita", name:"ENLY Nikita (coffee)", category:"Breakfast", neighborhood:"check before visiting",
    address:"check before visiting — couldn't verify a current NYC location under this exact name",
    hours:"check before visiting", price:"$",
    lat:40.7295, lng:-73.9965,
    why:"You listed this one specifically — we couldn't confirm current address/hours for it, so double check the spelling and location before building a morning around it, then edit this entry with the real details.",
    tags:["breakfast","coffee"], vibe:["chill"], cuisine:"Coffee", bestDay:"check before visiting", verified:false, link:"" },
  { id:"lindustrie", name:"L'Industrie Pizzeria", category:"Lunch", neighborhood:"West Village",
    address:"104 Christopher St, New York, NY 10014", hours:"Daily 12:00pm–10:00pm", price:"$",
    lat:40.7331, lng:-74.0046,
    why:"Cult NYC slice — thin, blistered crust, burrata slice is the move. First-come-first-served line, no seating inside; there's often a wait.",
    tags:["lunch","pizza","quick"], vibe:["foody", "chill"], cuisine:"Pizza", bestDay:"Go on a weekday or right at opening — weekend lines can hit 45+ min", verified:true, link:"https://www.lindustriebk.com/" },
  { id:"los-tacos", name:"Los Tacos No. 1 (Chelsea Market)", category:"Dinner", neighborhood:"Chelsea",
    address:"75 9th Ave, New York, NY 10011 (inside Chelsea Market)", hours:"Daily 11:00am–10:00pm", price:"$",
    lat:40.7423, lng:-74.0061,
    why:"The original stand-up taqueria — often called the best tacos in the city. No seating at the counter, but there's shared seating elsewhere in the Market. Order the adobada.",
    tags:["dinner","mexican","quick"], vibe:["foody", "chill"], cuisine:"Mexican", bestDay:"Good any day; Chelsea Market itself is calmer on a weekday afternoon", verified:true, link:"https://www.lostacos1.com/" },
  { id:"monkey-bar", name:"Monkey Bar", category:"Dinner", neighborhood:"Midtown East",
    address:"60 E 54th St, New York, NY 10022", hours:"Mon–Fri 11:30am–10pm · Sat 5:30–10pm · Closed Sunday", price:"$$$$",
    lat:40.7605, lng:-73.9723,
    why:"Old-school NYC glamour — red banquettes, classic American menu, seriously good cocktails. Your splurge night. Reservations open on Resy exactly 20–21 days ahead at 9am ET and go FAST — set an alarm.",
    tags:["dinner","cocktails","special"], vibe:["sociable", "foody"], cuisine:"American", bestDay:"Closed Sundays — book 20–21 days ahead on Resy at 9am ET", verified:true, link:"https://www.nycmonkeybar.com/" },
  { id:"alidoro", name:"Alidoro (SoHo)", category:"Lunch", neighborhood:"SoHo",
    address:"105 Sullivan St, New York, NY 10012", hours:"Mon–Sat 11:30am–4:00pm · Closed Sunday", price:"$$",
    lat:40.7264, lng:-74.0028,
    why:"Cult Italian sandwich counter since 1986 — 40+ subs named after Italian icons (try the Sinatra). Cash-friendly, no seats, order confidently and don't ask for substitutions.",
    tags:["lunch","sandwiches","quick"], vibe:["foody", "chill"], cuisine:"Sandwiches", bestDay:"Closed Sundays — go on a weekday lunchtime", verified:true, link:"https://www.alidoronyc.com/" },
  { id:"raising-canes", name:"Raising Cane's (Times Square)", category:"Takeaway", neighborhood:"Midtown",
    address:"1560 Broadway, New York, NY 10036 — check nearest branch before going", hours:"check before visiting", price:"$",
    lat:40.7580, lng:-73.9855,
    why:"Your requested takeaway craving. Several NYC branches now — check the app for the one nearest wherever you end up that night.",
    tags:["takeaway","late-night"], vibe:["foody", "chill"], cuisine:"Fried Chicken", bestDay:"check before visiting", verified:false, link:"" },
  { id:"ev-cinnamon", name:"East Village cinnamon rolls (Sunday)", category:"Dessert", neighborhood:"East Village",
    address:"check before visiting — confirm your specific bakery (e.g. a cult East Village bakery of your choice) and go early, cinnamon rolls sell out",
    hours:"check before visiting", price:"$",
    lat:40.7265, lng:-73.9815,
    why:"You flagged this as a Sunday-morning tradition — East Village has several beloved bakery cinnamon rolls. Pin your favourite here once you've picked one; they tend to sell out by late morning so go early.",
    tags:["dessert","breakfast","sunday"], vibe:["foody", "chill"], cuisine:"Bakery", bestDay:"Go early Sunday morning before they sell out", verified:false, link:"" },
  { id:"dimes", name:"Dimes", category:"Brunch", neighborhood:"Lower East Side",
    address:"49 Canal St, New York, NY 10002", hours:"check before visiting", price:"$$",
    lat:40.7148, lng:-73.9930,
    why:"Bright, plant-filled LES brunch spot popular with the young-creative crowd — good grain bowls and natural wine.",
    tags:["brunch","lunch"], vibe:["foody", "chill", "sociable"], cuisine:"Californian/Brunch", bestDay:"Weekend mornings are busiest — go before 11am or on a weekday", verified:false, link:"" },
  { id:"le-dive", name:"Le Dive", category:"Cocktails", neighborhood:"Lower East Side",
    address:"200 Chrystie St, New York, NY 10002", hours:"check before visiting", price:"$$",
    lat:40.7217, lng:-73.9928,
    why:"French-leaning wine/cocktail bar that's become an LES young-professional favourite — great for a pre-dinner drink.",
    tags:["cocktails","nightlife"], vibe:["sociable", "fun"], cuisine:"Cocktail Bar", bestDay:"Great any evening, livelier Thursday–Saturday", verified:false, link:"" },
  { id:"clandestino", name:"Clandestino", category:"Nightlife", neighborhood:"Chinatown/LES",
    address:"35 Canal St, New York, NY 10002", hours:"check before visiting", price:"$",
    lat:40.7148, lng:-73.9925,
    why:"Low-key, sceney dance bar that gets going late — DJ sets, no real dance floor rules, exactly the 'find the cool crowd' energy you wanted.",
    tags:["nightlife","dancing"], vibe:["fun", "sociable"], cuisine:"Nightlife", bestDay:"Best Friday–Saturday after 11pm", verified:false, link:"" },
  { id:"house-of-yes", name:"House of Yes", category:"Nightlife", neighborhood:"Bushwick, Brooklyn",
    address:"2 Wyckoff Ave, Brooklyn, NY 11237", hours:"check before visiting — check event calendar", price:"$$",
    lat:40.7050, lng:-73.9226,
    why:"Theatrical Brooklyn nightclub — costumes, circus performers, big dance floor. Worth the trip out for a proper dancing night; check what's on before booking tickets.",
    tags:["nightlife","dancing","special"], vibe:["fun", "sociable"], cuisine:"Nightclub", bestDay:"Check the event calendar first — quality varies a lot by night", verified:false, link:"" },
  { id:"bar-pisellino", name:"Bar Pisellino", category:"Coffee", neighborhood:"West Village",
    address:"52 Grove St, New York, NY 10014", hours:"check before visiting", price:"$$",
    lat:40.7317, lng:-74.0028,
    why:"Tiny Italian-style cafe-bar, gorgeous green awning — great for an espresso or an aperitivo, very photogenic corner.",
    tags:["coffee","cocktails"], vibe:["chill", "foody"], cuisine:"Coffee/Italian", bestDay:"Lovely any morning, quieter on weekdays", verified:false, link:"" },
  { id:"lucky-danger", name:"Lucky Danger", category:"Dinner", neighborhood:"NoHo",
    address:"46 Bond St, New York, NY 10012", hours:"check before visiting", price:"$$",
    lat:40.7269, lng:-73.9942,
    why:"Playful American-Chinese takeout-turned-sit-down spot, popular with a young downtown crowd.",
    tags:["dinner","asian"], vibe:["foody", "sociable"], cuisine:"American-Chinese", bestDay:"Good any night", verified:false, link:"" },
  { id:"dante", name:"Café Dante", category:"Cocktails", neighborhood:"West Village",
    address:"79-81 MacDougal St, New York, NY 10012", hours:"check before visiting", price:"$$$",
    lat:40.7297, lng:-74.0011,
    why:"Historic West Village cafe turned one of the best cocktail bars in the city — famous Garibaldi. Very SATC energy, worth booking ahead.",
    tags:["cocktails","dinner"], vibe:["sociable", "foody"], cuisine:"Cocktail Bar", bestDay:"Book ahead — busiest Thursday–Saturday", verified:false, link:"" },
  { id:"elsewhere", name:"Elsewhere", category:"Nightlife", neighborhood:"Bushwick, Brooklyn",
    address:"599 Johnson Ave, Brooklyn, NY 11237", hours:"check before visiting — check event calendar", price:"$$",
    lat:40.7107, lng:-73.9330,
    why:"Multi-room club/venue with a rooftop — good for a proper dancing night if there's a DJ you like on the calendar.",
    tags:["nightlife","dancing"], vibe:["fun", "sociable"], cuisine:"Nightclub", bestDay:"Check the calendar — Friday–Saturday for bigger lineups", verified:false, link:"" },
  { id:"cervos", name:"Cervo's", category:"Dinner", neighborhood:"Lower East Side",
    address:"43 Canal St, New York, NY 10002", hours:"check before visiting", price:"$$$",
    lat:40.7147, lng:-73.9915,
    why:"Portuguese seafood spot from the Dimes team — natural wine, buzzy LES dinner, feels like where the cool crowd actually eats.",
    tags:["dinner","seafood"], vibe:["foody", "sociable"], cuisine:"Portuguese/Seafood", bestDay:"Book ahead, especially weekends", verified:false, link:"" },
  { id:"washington-sq", name:"Washington Square Park", category:"Sightseeing", neighborhood:"Greenwich Village",
    address:"Washington Square Park, New York, NY 10012", hours:"6am–12am", price:"Free",
    lat:40.7308, lng:-73.9973,
    why:"The arch, the fountain, street performers — a quick 20-minute wander rather than a whole afternoon, exactly your 'iconic but brief' vibe.",
    tags:["sightseeing","free","outdoor"], vibe:["chill", "sociable"], cuisine:"Park", bestDay:"Nice any time, liveliest on a sunny afternoon", verified:false, link:"" },
  { id:"highline", name:"The High Line", category:"Sightseeing", neighborhood:"Chelsea/Meatpacking",
    address:"Gansevoort St to 34th St (elevated park)", hours:"7am–10pm (seasonal, check before visiting)", price:"Free",
    lat:40.7480, lng:-74.0048,
    why:"Elevated park with skyline views — walk the southern stretch near Chelsea Market rather than the whole thing; pairs perfectly with Los Tacos.",
    tags:["sightseeing","free","outdoor"], vibe:["chill", "sociable"], cuisine:"Park", bestDay:"Go at golden hour on a clear day, avoid midday weekend crowds", verified:false, link:"" },
  { id:"domino-park", name:"Domino Park", category:"Sightseeing", neighborhood:"Williamsburg, Brooklyn",
    address:"15 River St, Brooklyn, NY 11249", hours:"6am–1am", price:"Free",
    lat:40.7178, lng:-73.9647,
    why:"Waterfront park with the best Manhattan skyline view — go for golden hour, then stay in Williamsburg for dinner.",
    tags:["sightseeing","free","outdoor"], vibe:["chill", "sociable"], cuisine:"Park", bestDay:"Best at golden hour, any day", verified:false, link:"" },

  // ---- Extra recommendations (added to reach 50+) — mix of well-known real NYC spots.
  // Flagged verified:false where we haven't individually confirmed current hours/booking —
  // check before visiting / building a reservation around these.
  { id:"jacks-wife-freda", name:"Jack's Wife Freda", category:"Brunch", neighborhood:"SoHo/West Village",
    address:"224 Lafayette St, New York, NY 10012", hours:"check before visiting", price:"$$",
    lat:40.7233, lng:-73.9977, why:"Mediterranean-leaning all-day brunch spot, consistently packed with a young, stylish downtown crowd — the halloumi plate is the order.",
    tags:["brunch","lunch"], vibe:["foody","sociable"], cuisine:"Mediterranean", bestDay:"Weekend brunch has a wait — weekday is calmer", verified:false, link:"" },
  { id:"sadelles", name:"Sadelle's", category:"Brunch", neighborhood:"SoHo",
    address:"463 West Broadway, New York, NY 10012", hours:"check before visiting", price:"$$$",
    lat:40.7267, lng:-74.0021, why:"Famous tiered bagel-and-lox tower, glossy SoHo dining room — a proper 'main event' brunch rather than a quick one.",
    tags:["brunch","breakfast"], vibe:["foody","sociable"], cuisine:"Bagels/Brunch", bestDay:"Weekend mornings are very busy — go early or on a weekday", verified:false, link:"" },
  { id:"buvette", name:"Buvette", category:"Brunch", neighborhood:"West Village",
    address:"42 Grove St, New York, NY 10014", hours:"check before visiting", price:"$$",
    lat:40.7327, lng:-74.0027, why:"Tiny, romantic French 'gastrothèque' — tarte tatin and baked eggs in a room the size of a postage stamp. Very SATC.",
    tags:["brunch","dinner"], vibe:["chill","foody"], cuisine:"French", bestDay:"Tiny room — go early or off-peak, especially on weekends", verified:false, link:"" },
  { id:"clinton-st-baking", name:"Clinton St. Baking Company", category:"Brunch", neighborhood:"Lower East Side",
    address:"4 Clinton St, New York, NY 10002", hours:"check before visiting", price:"$$",
    lat:40.7178, lng:-73.9838, why:"Famous blueberry pancakes with warm maple butter — expect a wait on weekends, worth it for a lazy morning.",
    tags:["brunch","breakfast"], vibe:["chill","foody"], cuisine:"American/Brunch", bestDay:"Weekend wait can be long — weekday morning is calmer", verified:false, link:"" },
  { id:"court-street-grocers", name:"Court Street Grocers", category:"Lunch", neighborhood:"Multiple (LES + Brooklyn)",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$",
    lat:40.7180, lng:-73.9877, why:"Cult NYC sandwich shop, big on quality cold cuts — good quick lunch between stops.",
    tags:["lunch","sandwiches","quick"], vibe:["foody","chill"], cuisine:"Sandwiches", bestDay:"Good any day", verified:false, link:"" },
  { id:"wenwen", name:"Wenwen", category:"Lunch", neighborhood:"Lower East Side",
    address:"select address, check before visiting", hours:"check before visiting", price:"$$",
    lat:40.7185, lng:-73.9880, why:"Beloved Taiwanese noodle spot — comforting, unfussy, popular with a younger downtown crowd.",
    tags:["lunch","asian"], vibe:["foody","chill"], cuisine:"Taiwanese", bestDay:"Good any day", verified:false, link:"" },
  { id:"via-carota", name:"Via Carota", category:"Dinner", neighborhood:"West Village",
    address:"51 Grove St, New York, NY 10014", hours:"check before visiting — no reservations, expect a wait", price:"$$$",
    lat:40.7326, lng:-74.0026, why:"One of the most-loved Italian rooms in the city — famous insalata verde. No reservations, so go early or be ready to wait.",
    tags:["dinner","lunch"], vibe:["foody","sociable"], cuisine:"Italian", bestDay:"No reservations — arrive right at opening or expect a long wait, worse on weekends", verified:false, link:"" },
  { id:"carbone", name:"Carbone", category:"Dinner", neighborhood:"Greenwich Village",
    address:"181 Thompson St, New York, NY 10012", hours:"check before visiting — book weeks ahead", price:"$$$$",
    lat:40.7280, lng:-74.0002, why:"The Italian-American red-sauce night out that everyone talks about — book via Resy the moment your window opens, it's notoriously hard to get.",
    tags:["dinner","special"], vibe:["sociable","foody"], cuisine:"Italian-American", bestDay:"Book the moment your Resy window opens, weeks ahead", verified:false, link:"" },
  { id:"don-angie", name:"Don Angie", category:"Dinner", neighborhood:"West Village",
    address:"103 Greenwich Ave, New York, NY 10014", hours:"check before visiting", price:"$$$",
    lat:40.7378, lng:-74.0025, why:"Inventive Italian-American cooking (the lasagna for two is famous) — buzzy, book-ahead date-night energy.",
    tags:["dinner","special"], vibe:["foody","sociable"], cuisine:"Italian-American", bestDay:"Book ahead — busiest Thursday–Saturday", verified:false, link:"" },
  { id:"4charles", name:"4 Charles Prime Rib", category:"Dinner", neighborhood:"West Village",
    address:"4 Charles St, New York, NY 10014", hours:"check before visiting — book ahead", price:"$$$$",
    lat:40.7345, lng:-74.0009, why:"Dark, clubby steakhouse hidden behind an unmarked door — one of the hardest reservations in the Village. Worth planning around if you can snag it.",
    tags:["dinner","steak","special"], vibe:["sociable","foody"], cuisine:"Steakhouse", bestDay:"Book ahead — one of the hardest reservations in the Village", verified:false, link:"" },
  { id:"raouls", name:"Raoul's", category:"Dinner", neighborhood:"SoHo",
    address:"180 Prince St, New York, NY 10012", hours:"check before visiting", price:"$$$",
    lat:40.7262, lng:-74.0026, why:"Old-school SoHo French bistro, dark and clubby — a classic 'where the cool people actually eat' spot since the 70s.",
    tags:["dinner"], vibe:["foody","chill"], cuisine:"French", bestDay:"Good any night, book ahead on weekends", verified:false, link:"" },
  { id:"misi", name:"Misi", category:"Dinner", neighborhood:"Williamsburg, Brooklyn",
    address:"329 Kent Ave, Brooklyn, NY 11249", hours:"check before visiting", price:"$$$",
    lat:40.7107, lng:-73.9633, why:"Handmade pasta with a Brooklyn waterfront view — worth the trip out, pairs well with a Domino Park sunset.",
    tags:["dinner"], vibe:["foody","sociable"], cuisine:"Italian", bestDay:"Book ahead — lovely for a Brooklyn sunset dinner", verified:false, link:"" },
  { id:"lilia", name:"Lilia", category:"Dinner", neighborhood:"Williamsburg, Brooklyn",
    address:"567 Union Ave, Brooklyn, NY 11211", hours:"check before visiting — book weeks ahead", price:"$$$",
    lat:40.7169, lng:-73.9528, why:"One of the most in-demand Italian rooms in the city — reserve as early as your Resy window allows.",
    tags:["dinner","special"], vibe:["foody","sociable"], cuisine:"Italian", bestDay:"Book the second your Resy window opens", verified:false, link:"" },
  { id:"golden-diner", name:"Golden Diner", category:"Brunch", neighborhood:"Lower East Side/Chinatown",
    address:"56 Madison St, New York, NY 10038", hours:"check before visiting", price:"$$",
    lat:40.7127, lng:-73.9967, why:"Tiny Asian-American diner spin on classic comfort food — cheerful, colourful, great for an easy lunch.",
    tags:["brunch","lunch"], vibe:["foody","chill"], cuisine:"American/Asian-fusion", bestDay:"Weekend brunch gets a wait — weekday is easier", verified:false, link:"" },
  { id:"supermoon-bakehouse", name:"Supermoon Bakehouse", category:"Dessert", neighborhood:"Lower East Side",
    address:"120 Rivington St, New York, NY 10002", hours:"check before visiting — sells out early", price:"$",
    lat:40.7207, lng:-73.9866, why:"Inventive pastries (think croissant-meets-everything hybrids) that sell out fast — go first thing.",
    tags:["dessert"], vibe:["foody","chill"], cuisine:"Bakery", bestDay:"Go first thing — regularly sells out by midday", verified:false, link:"" },
  { id:"fan-fan-doughnuts", name:"Fan-Fan Doughnuts", category:"Dessert", neighborhood:"Bed-Stuy, Brooklyn",
    address:"448 Lewis Ave, Brooklyn, NY 11233", hours:"check before visiting", price:"$",
    lat:40.6889, lng:-73.9349, why:"Beautiful pastel French-technique doughnuts in a gorgeous little shop — worth a detour if you're already in Brooklyn.",
    tags:["dessert"], vibe:["chill","foody"], cuisine:"Doughnuts", bestDay:"Good any day, freshest in the morning", verified:false, link:"" },
  { id:"chinatown-ice-cream", name:"Chinatown Ice Cream Factory", category:"Dessert", neighborhood:"Chinatown",
    address:"65 Bayard St, New York, NY 10013", hours:"check before visiting", price:"$",
    lat:40.7156, lng:-73.9976, why:"NYC institution since the 70s — try the lychee or black sesame. Easy add-on after a Chinatown/LES wander.",
    tags:["dessert"], vibe:["chill"], cuisine:"Ice Cream", bestDay:"Good any day", verified:false, link:"" },
  { id:"attaboy", name:"Attaboy", category:"Cocktails", neighborhood:"Lower East Side",
    address:"134 Eldridge St, New York, NY 10002", hours:"check before visiting — no menu, no reservations, arrive and wait", price:"$$$",
    lat:40.7191, lng:-73.9930, why:"No-sign speakeasy, no menu — you just tell them what you're in the mood for. Arrive early, it fills up.",
    tags:["cocktails","nightlife"], vibe:["sociable","fun"], cuisine:"Cocktail Bar", bestDay:"Arrive before 9pm on weekends or expect a wait outside", verified:false, link:"" },
  { id:"employees-only", name:"Employees Only", category:"Cocktails", neighborhood:"West Village",
    address:"510 Hudson St, New York, NY 10014", hours:"check before visiting", price:"$$$",
    lat:40.7332, lng:-74.0058, why:"Prohibition-era-style speakeasy behind a psychic-shop front — great cocktails, open late, classic West Village night-out spot.",
    tags:["cocktails","nightlife"], vibe:["sociable","fun"], cuisine:"Cocktail Bar", bestDay:"Great any night, busiest Friday–Saturday", verified:false, link:"" },
  { id:"the-django", name:"The Django", category:"Cocktails", neighborhood:"Tribeca",
    address:"2 6th Ave, New York, NY 10013", hours:"check before visiting", price:"$$$",
    lat:40.7192, lng:-74.0057, why:"Basement jazz club and cocktail bar — live music most nights, great for a classy-but-fun evening.",
    tags:["cocktails","nightlife"], vibe:["sociable","fun"], cuisine:"Cocktail Bar/Jazz", bestDay:"Check the live music schedule before picking a night", verified:false, link:"" },
  { id:"pouring-ribbons", name:"Pouring Ribbons", category:"Cocktails", neighborhood:"East Village",
    address:"225 Avenue B, New York, NY 10009", hours:"check before visiting", price:"$$",
    lat:40.7259, lng:-73.9793, why:"Upstairs East Village cocktail den, seasonal inventive drinks menu — less scene-y, more about the craft.",
    tags:["cocktails"], vibe:["sociable","chill"], cuisine:"Cocktail Bar", bestDay:"Good any night, quieter midweek", verified:false, link:"" },
  { id:"le-bain", name:"Le Bain", category:"Nightlife", neighborhood:"Meatpacking",
    address:"The Standard High Line, 848 Washington St, New York, NY 10014", hours:"check before visiting — check event calendar", price:"$$$",
    lat:40.7406, lng:-74.0088, why:"Rooftop club at The Standard with a hot tub on the dance floor (yes, really) and skyline views — quintessential Meatpacking night out.",
    tags:["nightlife","dancing"], vibe:["fun","sociable"], cuisine:"Nightclub/Rooftop", bestDay:"Check the event calendar — Friday–Saturday busiest", verified:false, link:"" },
  { id:"westlight", name:"Westlight", category:"Nightlife", neighborhood:"Williamsburg, Brooklyn",
    address:"111 N 12th St, Brooklyn, NY 11249 (Wythe Hotel rooftop)", hours:"check before visiting", price:"$$$",
    lat:40.7217, lng:-73.9575, why:"Rooftop bar at the Wythe Hotel with one of the best Manhattan skyline views in Brooklyn — go for golden hour, stay for the night.",
    tags:["nightlife","cocktails"], vibe:["fun","sociable"], cuisine:"Rooftop Bar", bestDay:"Go for sunset — book ahead on weekends", verified:false, link:"" },
  { id:"jupiter-disco", name:"Jupiter Disco", category:"Nightlife", neighborhood:"Bushwick, Brooklyn",
    address:"1237 Flushing Ave, Brooklyn, NY 11237", hours:"check before visiting", price:"$",
    lat:40.7025, lng:-73.9268, why:"Low-key, cosmic-themed dance bar — good DJs, no cover most nights, easygoing dancing crowd.",
    tags:["nightlife","dancing"], vibe:["fun","sociable"], cuisine:"Nightclub", bestDay:"Best Friday–Saturday", verified:false, link:"" },
  { id:"devocion", name:"Devoción", category:"Coffee", neighborhood:"Williamsburg, Brooklyn",
    address:"69 Grand St, Brooklyn, NY 11249", hours:"check before visiting", price:"$$",
    lat:40.7118, lng:-73.9587, why:"Plant-filled greenhouse-style café, coffee roasted on-site daily — a proper sit-down coffee experience, not just a grab-and-go.",
    tags:["coffee"], vibe:["chill"], cuisine:"Coffee", bestDay:"Good any morning", verified:false, link:"" },
  { id:"blue-bottle", name:"Blue Bottle Coffee", category:"Coffee", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$",
    lat:40.7259, lng:-73.9964, why:"Reliable, well-made coffee with locations scattered across Manhattan and Brooklyn — good fallback when you just need a solid flat white nearby.",
    tags:["coffee"], vibe:["chill"], cuisine:"Coffee", bestDay:"Good any day", verified:false, link:"" },
  { id:"dumbo-brooklyn-bridge-park", name:"DUMBO / Brooklyn Bridge Park", category:"Sightseeing", neighborhood:"DUMBO, Brooklyn",
    address:"Brooklyn Bridge Park, Brooklyn, NY 11201", hours:"6am–1am", price:"Free",
    lat:40.7033, lng:-73.9967, why:"The Manhattan Bridge photo spot, carousel, and waterfront park with skyline views — worth an hour, especially near sunset.",
    tags:["sightseeing","free","outdoor"], vibe:["chill","sociable"], cuisine:"Park", bestDay:"Best at golden hour, any day", verified:false, link:"" },
  { id:"central-park", name:"Central Park (south end)", category:"Sightseeing", neighborhood:"Midtown/Upper West Side",
    address:"Central Park, New York, NY", hours:"6am–1am", price:"Free",
    lat:40.7679, lng:-73.9750, why:"Stick to the southern end (Bethesda Terrace, the Mall, the lake) rather than trying to cover the whole park — plenty for an hour or two.",
    tags:["sightseeing","free","outdoor"], vibe:["chill"], cuisine:"Park", bestDay:"Good any day, less crowded on weekdays", verified:false, link:"" },
  { id:"chelsea-market-wander", name:"Chelsea Market (browsing)", category:"Shopping", neighborhood:"Chelsea",
    address:"75 9th Ave, New York, NY 10011", hours:"check before visiting", price:"Free to browse",
    lat:40.7424, lng:-74.0060, why:"Indoor market with food stalls and small shops — easy to pair with Los Tacos and the High Line on the same afternoon.",
    tags:["shopping","lunch"], vibe:["shopping","foody","chill"], cuisine:"Market", bestDay:"Weekday afternoons are calmer than weekends", verified:false, link:"" },
  { id:"brooklyn-flea", name:"Brooklyn Flea", category:"Shopping", neighborhood:"Williamsburg/DUMBO, Brooklyn (seasonal)",
    address:"check current location and dates before visiting — weekends only, seasonal", hours:"check before visiting", price:"Free to browse",
    lat:40.7215, lng:-73.9605, why:"Vintage, vinyl, and food vendors — only runs certain weekends, so check the schedule before planning a day around it.",
    tags:["shopping"], vibe:["shopping","chill"], cuisine:"Market", bestDay:"Weekends only — check the current schedule", verified:false, link:"" },
  { id:"artists-and-fleas", name:"Artists & Fleas", category:"Shopping", neighborhood:"Williamsburg/SoHo",
    address:"70 N 7th St, Brooklyn, NY 11249 (also a SoHo location)", hours:"check before visiting", price:"Free to browse",
    lat:40.7186, lng:-73.9576, why:"Indie designers, vintage, jewellery, and art under one roof — good for an afternoon of browsing rather than mainstream shopping.",
    tags:["shopping"], vibe:["shopping"], cuisine:"Market", bestDay:"Weekends busiest — go for the full vendor spread", verified:false, link:"" },
  { id:"nolita-boutiques", name:"NoLita boutique streets", category:"Shopping", neighborhood:"NoLita",
    address:"Mott St / Elizabeth St / Mulberry St, New York, NY 10012", hours:"check before visiting", price:"Varies",
    lat:40.7223, lng:-73.9958, why:"Small independent boutiques rather than chains — a proper wander-and-browse afternoon, not a mall trip.",
    tags:["shopping"], vibe:["shopping","chill"], cuisine:"Shopping", bestDay:"Good any day, quieter on weekday mornings", verified:false, link:"" },
  { id:"canal-street-market", name:"Canal Street Market", category:"Shopping", neighborhood:"Chinatown",
    address:"265 Canal St, New York, NY 10013", hours:"check before visiting", price:"Free to browse",
    lat:40.7188, lng:-73.9998, why:"Indoor market mixing food vendors with small local brands — good rainy-day or midday option in Chinatown.",
    tags:["shopping","lunch"], vibe:["shopping","foody"], cuisine:"Market", bestDay:"Good any day", verified:false, link:"" },
  { id:"xian-famous-foods", name:"Xi'an Famous Foods", category:"Takeaway", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$",
    lat:40.7180, lng:-73.9970, why:"Cult hand-pulled noodles, spicy and cheap — great grab-and-go between other plans.",
    tags:["takeaway","lunch","asian","quick"], vibe:["foody","chill"], cuisine:"Chinese/Noodles", bestDay:"Good any day, quick any time", verified:false, link:"" },
  { id:"shake-shack", name:"Shake Shack (Madison Square Park)", category:"Takeaway", neighborhood:"Flatiron",
    address:"Madison Ave & E 23rd St, New York, NY 10010", hours:"check before visiting", price:"$",
    lat:40.7418, lng:-73.9878,
    why:"The original Shake Shack, in the park it was born in — great burger/shake combo to eat on a bench.",
    tags:["takeaway", "quick"], vibe:["foody", "chill"], cuisine:"American/Burgers", bestDay:"Good any day, quieter on weekday afternoons", verified:false, link:"" },
  { id:"joes-pizza", name:"Joe's Pizza (Greenwich Village)", category:"Takeaway", neighborhood:"Greenwich Village",
    address:"7 Carmine St, New York, NY 10014", hours:"check before visiting", price:"$",
    lat:40.7304, lng:-74.0027,
    why:"Classic NYC dollar-slice-adjacent institution — thin, foldable, no-frills, exactly what a 'real' NY slice should be.",
    tags:["takeaway", "quick", "pizza"], vibe:["foody", "chill"], cuisine:"Pizza", bestDay:"Good any time, day or night", verified:false, link:"" },
  { id:"prince-street-pizza", name:"Prince Street Pizza", category:"Takeaway", neighborhood:"Nolita",
    address:"27 Prince St, New York, NY 10012", hours:"check before visiting", price:"$",
    lat:40.7233, lng:-73.9948,
    why:"Famous pepperoni square slice with crispy cupped pepperoni — expect a line but it moves fast.",
    tags:["takeaway", "quick", "pizza"], vibe:["foody", "chill"], cuisine:"Pizza", bestDay:"Best on a weekday — weekend lines can be long", verified:false, link:"" },
  { id:"halal-guys", name:"The Halal Guys (Midtown cart)", category:"Takeaway", neighborhood:"Midtown",
    address:"W 53rd St & 6th Ave, New York, NY 10019", hours:"check before visiting", price:"$",
    lat:40.7636, lng:-73.9799,
    why:"The original halal cart that spawned a chain — chicken and rice with white sauce, a proper late-night NYC classic.",
    tags:["takeaway", "quick", "late-night"], vibe:["foody", "chill"], cuisine:"Middle Eastern", bestDay:"Good any time, especially post-nightlife", verified:false, link:"" },
  { id:"vanessas-dumpling-house", name:"Vanessa's Dumpling House", category:"Takeaway", neighborhood:"Lower East Side",
    address:"118 Eldridge St, New York, NY 10002", hours:"check before visiting", price:"$",
    lat:40.7181, lng:-73.9924,
    why:"Cheap, excellent handmade dumplings — a few dollars for a plate, perfect between other plans.",
    tags:["takeaway", "quick", "asian"], vibe:["foody", "chill"], cuisine:"Chinese", bestDay:"Good any day", verified:false, link:"" },
  { id:"baohaus", name:"Baohaus", category:"Takeaway", neighborhood:"East Village",
    address:"238 E 14th St, New York, NY 10003", hours:"check before visiting", price:"$",
    lat:40.7328, lng:-73.9848,
    why:"Taiwanese-style bao sandwiches — founded by chef Eddie Huang, quick and satisfying.",
    tags:["takeaway", "quick", "asian"], vibe:["foody", "chill"], cuisine:"Taiwanese", bestDay:"Good any day", verified:false, link:"" },
  { id:"levain-bakery", name:"Levain Bakery", category:"Takeaway", neighborhood:"Upper West Side",
    address:"167 W 74th St, New York, NY 10023", hours:"check before visiting", price:"$",
    lat:40.7803, lng:-73.9807,
    why:"The famously massive, gooey chocolate chip walnut cookie — worth the detour, best eaten warm.",
    tags:["takeaway", "dessert"], vibe:["foody", "chill"], cuisine:"Bakery", bestDay:"Go earlier in the day — they can sell out", verified:false, link:"" },
  { id:"doughnut-plant", name:"Doughnut Plant", category:"Takeaway", neighborhood:"Lower East Side",
    address:"379 Grand St, New York, NY 10002", hours:"check before visiting", price:"$",
    lat:40.7176, lng:-73.9877,
    why:"Handmade square doughnuts in inventive flavours (try the tres leches) — original LES location since 1994.",
    tags:["takeaway", "dessert"], vibe:["foody", "chill"], cuisine:"Doughnuts", bestDay:"Good any day, freshest in the morning", verified:false, link:"" },
  { id:"big-gay-ice-cream", name:"Big Gay Ice Cream", category:"Takeaway", neighborhood:"East Village",
    address:"125 St Marks Pl, New York, NY 10009", hours:"check before visiting", price:"$",
    lat:40.7278, lng:-73.9843,
    why:"Playful soft-serve with toppings like cayenne and dulce de leche — a fun, easy East Village stop.",
    tags:["takeaway", "dessert"], vibe:["fun", "chill"], cuisine:"Ice Cream", bestDay:"Good any warm evening", verified:false, link:"" },
  { id:"katzs-deli", name:"Katz's Delicatessen", category:"Takeaway", neighborhood:"Lower East Side",
    address:"205 E Houston St, New York, NY 10002", hours:"check before visiting", price:"$$",
    lat:40.7223, lng:-73.9874,
    why:"The pastrami sandwich institution — touristy but genuinely the real deal; get it to go rather than fighting for a table.",
    tags:["takeaway", "quick"], vibe:["foody", "chill"], cuisine:"Deli", bestDay:"Best on a weekday — weekends are packed", verified:false, link:"" },
  { id:"wo-hop", name:"Wo Hop", category:"Takeaway", neighborhood:"Chinatown",
    address:"17 Mott St, New York, NY 10013", hours:"check before visiting", price:"$",
    lat:40.7147, lng:-73.9989,
    why:"Old-school Chinatown Cantonese-American spot, open late — good chow fun and lo mein to grab and go.",
    tags:["takeaway", "quick", "asian"], vibe:["foody", "chill"], cuisine:"Chinese", bestDay:"Good late at night, any day", verified:false, link:"" },
  { id:"ess-a-bagel", name:"Ess-a-Bagel", category:"Takeaway", neighborhood:"Midtown",
    address:"831 3rd Ave, New York, NY 10022", hours:"check before visiting", price:"$",
    lat:40.7561, lng:-73.9683,
    why:"Enormous, chewy bagels piled high with the fillings of your choice — a good breakfast-on-the-move option away from the Apollo queue.",
    tags:["takeaway", "breakfast", "quick"], vibe:["foody", "chill"], cuisine:"Bagels", bestDay:"Good any morning", verified:false, link:"" },
  { id:"meatball-shop", name:"The Meatball Shop", category:"Takeaway", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$",
    lat:40.7223, lng:-73.9877,
    why:"Build-your-own meatball sliders/subs — casual, filling, easy to grab between plans.",
    tags:["takeaway", "quick"], vibe:["foody", "chill"], cuisine:"American", bestDay:"Good any day", verified:false, link:"" },
  { id:"num-pang", name:"Num Pang", category:"Takeaway", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$",
    lat:40.735, lng:-73.991,
    why:"Cambodian-style sandwiches on baguette — bold flavours, quick, great value lunch on the go.",
    tags:["takeaway", "lunch", "quick"], vibe:["foody", "chill"], cuisine:"Cambodian", bestDay:"Good any day", verified:false, link:"" },
  { id:"bibble-and-sip", name:"Bibble & Sip", category:"Takeaway", neighborhood:"Hell's Kitchen",
    address:"440 W 51st St, New York, NY 10019", hours:"check before visiting", price:"$",
    lat:40.7649, lng:-73.9895,
    why:"Quirky bakery known for craspberry puffs (cream puff x croissant) and Taiwanese-style teas — a fun grab-and-go treat.",
    tags:["takeaway", "dessert", "coffee"], vibe:["foody", "fun"], cuisine:"Bakery/Cafe", bestDay:"Go before mid-afternoon — popular items sell out", verified:false, link:"" },
  { id:"cafe-integral", name:"Café Integral", category:"Coffee", neighborhood:"Nolita",
    address:"149 Elizabeth St, New York, NY 10012", hours:"check before visiting", price:"$",
    lat:40.7217, lng:-73.9959,
    why:"Tiny, minimalist Nolita espresso bar — standing room only, serious coffee, very photogenic.",
    tags:["coffee"], vibe:["chill"], cuisine:"Coffee", bestDay:"Good any morning, small space so avoid peak weekend brunch hours", verified:false, link:"" },
  { id:"everyman-espresso", name:"Everyman Espresso", category:"Coffee", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$",
    lat:40.7295, lng:-73.988,
    why:"Long-running specialty coffee spot — consistently good espresso, no-nonsense vibe.",
    tags:["coffee"], vibe:["chill"], cuisine:"Coffee", bestDay:"Good any day", verified:false, link:"" },
  { id:"partners-coffee", name:"Partners Coffee", category:"Coffee", neighborhood:"Williamsburg/Cobble Hill",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$",
    lat:40.7143, lng:-73.9583,
    why:"Brooklyn-roasted specialty coffee — reliably good, several relaxed sit-down locations.",
    tags:["coffee"], vibe:["chill"], cuisine:"Coffee", bestDay:"Good any morning", verified:false, link:"" },
  { id:"sey-coffee", name:"Sey Coffee", category:"Coffee", neighborhood:"Bushwick, Brooklyn",
    address:"18 Grattan St, Brooklyn, NY 11206", hours:"check before visiting", price:"$",
    lat:40.7051, lng:-73.9331,
    why:"Serious third-wave roaster in industrial Bushwick — a destination for actual coffee nerds.",
    tags:["coffee"], vibe:["chill"], cuisine:"Coffee", bestDay:"Good any weekday morning", verified:false, link:"" },
  { id:"abraco", name:"Abraço", category:"Coffee", neighborhood:"East Village",
    address:"81 E 7th St, New York, NY 10003", hours:"check before visiting", price:"$",
    lat:40.7263, lng:-73.9846,
    why:"Tiny East Village espresso counter with excellent olive oil cake — cult favourite, minimal seating.",
    tags:["coffee", "dessert"], vibe:["chill"], cuisine:"Coffee", bestDay:"Good any morning, arrive early for a seat", verified:false, link:"" },
  { id:"la-colombe", name:"La Colombe", category:"Coffee", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$",
    lat:40.7256, lng:-74.0034,
    why:"Reliable specialty coffee chain — good draft latte, easy fallback wherever you are.",
    tags:["coffee"], vibe:["chill"], cuisine:"Coffee", bestDay:"Good any day", verified:false, link:"" },
  { id:"ninth-street-espresso", name:"Ninth Street Espresso", category:"Coffee", neighborhood:"East Village/Chelsea Market",
    address:"700 E 9th St, New York, NY 10009", hours:"check before visiting", price:"$",
    lat:40.7266, lng:-73.9797,
    why:"No-frills, excellent straight-up espresso — a NYC third-wave coffee pioneer.",
    tags:["coffee"], vibe:["chill"], cuisine:"Coffee", bestDay:"Good any day", verified:false, link:"" },
  { id:"birch-coffee", name:"Birch Coffee", category:"Coffee", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$",
    lat:40.742, lng:-73.988,
    why:"Cosy, homey coffee shop chain — good for sitting and lingering rather than grab-and-go.",
    tags:["coffee"], vibe:["chill"], cuisine:"Coffee", bestDay:"Good any day", verified:false, link:"" },
  { id:"cafe-grumpy", name:"Café Grumpy", category:"Coffee", neighborhood:"Multiple locations (Greenpoint origin)",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$",
    lat:40.7304, lng:-73.9548,
    why:"Brooklyn coffee institution — the original Greenpoint shop has real neighbourhood charm.",
    tags:["coffee"], vibe:["chill"], cuisine:"Coffee", bestDay:"Good any morning", verified:false, link:"" },
  { id:"dominique-ansel", name:"Dominique Ansel Bakery", category:"Dessert", neighborhood:"SoHo",
    address:"189 Spring St, New York, NY 10012", hours:"check before visiting", price:"$$",
    lat:40.7254, lng:-74.0027,
    why:"Birthplace of the Cronut — go early, they sell out and the line builds fast.",
    tags:["dessert"], vibe:["foody", "chill"], cuisine:"Bakery", bestDay:"Go right at opening, especially for the Cronut", verified:false, link:"" },
  { id:"milk-bar", name:"Milk Bar", category:"Dessert", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$",
    lat:40.7328, lng:-73.9908,
    why:"Momofuku's playful dessert offshoot — cereal milk soft serve, compost cookies, birthday cake.",
    tags:["dessert"], vibe:["foody", "fun"], cuisine:"Bakery", bestDay:"Good any day", verified:false, link:"" },
  { id:"van-leeuwen", name:"Van Leeuwen Ice Cream", category:"Dessert", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$",
    lat:40.7223, lng:-73.9927,
    why:"Beloved Brooklyn-born ice cream — honeycomb and vegan flavours are standouts.",
    tags:["dessert"], vibe:["foody", "chill"], cuisine:"Ice Cream", bestDay:"Good any day", verified:false, link:"" },
  { id:"ferrara-bakery", name:"Ferrara Bakery & Café", category:"Dessert", neighborhood:"Little Italy",
    address:"195 Grand St, New York, NY 10013", hours:"check before visiting", price:"$$",
    lat:40.7191, lng:-73.9973,
    why:"NYC's oldest Italian pastry shop, since 1892 — cannoli and espresso in a Little Italy institution.",
    tags:["dessert", "coffee"], vibe:["foody", "chill"], cuisine:"Bakery", bestDay:"Good any day", verified:false, link:"" },
  { id:"venieros", name:"Veniero's", category:"Dessert", neighborhood:"East Village",
    address:"342 E 11th St, New York, NY 10003", hours:"check before visiting", price:"$",
    lat:40.7296, lng:-73.9843,
    why:"Italian pastry shop since 1894 — classic cannoli and tiramisu, old-school East Village charm.",
    tags:["dessert", "coffee"], vibe:["foody", "chill"], cuisine:"Bakery", bestDay:"Good any day", verified:false, link:"" },
  { id:"lady-m", name:"Lady M", category:"Dessert", neighborhood:"Midtown",
    address:"41 E 78th St, New York, NY 10075", hours:"check before visiting", price:"$$$",
    lat:40.7745, lng:-73.9614,
    why:"Elegant mille crêpe cake — twenty paper-thin layers, an Instagram favourite for good reason.",
    tags:["dessert"], vibe:["foody"], cuisine:"Patisserie", bestDay:"Good any afternoon", verified:false, link:"" },
  { id:"odd-fellows", name:"Odd Fellows Ice Cream Co.", category:"Dessert", neighborhood:"Williamsburg, Brooklyn",
    address:"175 Kent Ave, Brooklyn, NY 11249", hours:"check before visiting", price:"$",
    lat:40.7157, lng:-73.9646,
    why:"Playful, inventive Brooklyn ice cream flavours — worth the stop while you're in Williamsburg.",
    tags:["dessert"], vibe:["foody", "fun"], cuisine:"Ice Cream", bestDay:"Good any warm afternoon", verified:false, link:"" },
  { id:"russ-and-daughters-cafe", name:"Russ & Daughters Café", category:"Breakfast", neighborhood:"Lower East Side",
    address:"127 Orchard St, New York, NY 10002", hours:"check before visiting", price:"$$",
    lat:40.7184, lng:-73.9903,
    why:"Sit-down café from the century-old appetizing shop — the ultimate NYC bagel-and-lox experience, done properly.",
    tags:["breakfast", "brunch"], vibe:["foody", "sociable"], cuisine:"Jewish Deli/Brunch", bestDay:"Weekend mornings get a wait — go early or on a weekday", verified:false, link:"" },
  { id:"egg-shop", name:"Egg Shop", category:"Breakfast", neighborhood:"Nolita",
    address:"151 Elizabeth St, New York, NY 10012", hours:"check before visiting", price:"$$",
    lat:40.7222, lng:-73.9958,
    why:"Egg-centric all-day breakfast menu in a bright Nolita room — good for a proper sit-down morning.",
    tags:["breakfast", "brunch"], vibe:["foody", "chill"], cuisine:"American", bestDay:"Weekend brunch has a wait — weekday is calmer", verified:false, link:"" },
  { id:"bluestone-lane", name:"Bluestone Lane", category:"Breakfast", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$",
    lat:40.7362, lng:-73.9976,
    why:"Australian-style café chain — good flat whites and healthy breakfast bowls.",
    tags:["breakfast", "coffee"], vibe:["chill"], cuisine:"Cafe", bestDay:"Good any morning", verified:false, link:"" },
  { id:"the-smith", name:"The Smith", category:"Breakfast", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$$",
    lat:40.7328, lng:-73.9903,
    why:"Reliable all-day American brasserie — good for a group breakfast when everyone wants something different.",
    tags:["breakfast", "brunch", "dinner"], vibe:["sociable", "chill"], cuisine:"American", bestDay:"Good any day", verified:false, link:"" },
  { id:"balthazar", name:"Balthazar", category:"Breakfast", neighborhood:"SoHo",
    address:"80 Spring St, New York, NY 10012", hours:"check before visiting", price:"$$$",
    lat:40.7233, lng:-73.9977,
    why:"Iconic French brasserie — classic croissants and eggs in a beautiful, buzzy room. Also does dinner.",
    tags:["breakfast", "brunch", "dinner"], vibe:["sociable", "foody"], cuisine:"French", bestDay:"Good any day, book ahead for weekend brunch", verified:false, link:"" },
  { id:"sarabeths", name:"Sarabeth's", category:"Breakfast", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$$",
    lat:40.7736, lng:-73.9773,
    why:"Classic NYC brunch spot, known for jams and baked eggs — a bit more traditional, good for a relaxed morning.",
    tags:["breakfast", "brunch"], vibe:["chill", "foody"], cuisine:"American", bestDay:"Weekend mornings busiest", verified:false, link:"" },
  { id:"maman", name:"Maman", category:"Breakfast", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$$",
    lat:40.7217, lng:-74.0027,
    why:"Charming French-inspired café chain — good pastries and a pretty, plant-filled interior.",
    tags:["breakfast", "coffee"], vibe:["chill", "foody"], cuisine:"Cafe", bestDay:"Good any morning", verified:false, link:"" },
  { id:"cafe-mogador", name:"Café Mogador", category:"Breakfast", neighborhood:"East Village",
    address:"101 St Marks Pl, New York, NY 10009", hours:"check before visiting", price:"$$",
    lat:40.7274, lng:-73.9847,
    why:"Moroccan brunch spot — merguez and eggs, laid-back East Village patio in warm weather.",
    tags:["breakfast", "brunch"], vibe:["chill", "foody"], cuisine:"Moroccan", bestDay:"Weekend brunch has a wait — weekday is easier", verified:false, link:"" },
  { id:"century-21", name:"Century 21", category:"Shopping", neighborhood:"Financial District",
    address:"22 Cortlandt St, New York, NY 10007", hours:"check before visiting", price:"Varies",
    lat:40.7106, lng:-74.0099,
    why:"Discount designer department store — good for a proper bargain-hunting afternoon.",
    tags:["shopping"], vibe:["shopping"], cuisine:"Department Store", bestDay:"Good any day, quieter on weekday mornings", verified:false, link:"" },
  { id:"rag-and-bone", name:"Rag & Bone", category:"Shopping", neighborhood:"SoHo",
    address:"119 Mercer St, New York, NY 10012", hours:"check before visiting", price:"$$$",
    lat:40.7245, lng:-73.9997,
    why:"Downtown-cool NYC label — SoHo flagship, good for elevated basics.",
    tags:["shopping"], vibe:["shopping"], cuisine:"Fashion", bestDay:"Good any day", verified:false, link:"" },
  { id:"reformation", name:"Reformation", category:"Shopping", neighborhood:"SoHo",
    address:"23 Howard St, New York, NY 10013", hours:"check before visiting", price:"$$",
    lat:40.7195, lng:-74.0009,
    why:"Sustainable-leaning fashion label, very of-the-moment — a solid SoHo shopping stop.",
    tags:["shopping"], vibe:["shopping"], cuisine:"Fashion", bestDay:"Good any day, weekends busiest", verified:false, link:"" },
  { id:"aesop", name:"Aesop", category:"Shopping", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$$",
    lat:40.7238, lng:-73.9973,
    why:"Beautifully designed skincare boutiques — worth popping into even just to see the store design.",
    tags:["shopping"], vibe:["shopping", "chill"], cuisine:"Beauty", bestDay:"Good any day", verified:false, link:"" },
  { id:"housing-works-bookstore", name:"Housing Works Bookstore Café", category:"Shopping", neighborhood:"SoHo",
    address:"126 Crosby St, New York, NY 10012", hours:"check before visiting", price:"$",
    lat:40.7239, lng:-73.9963,
    why:"Beautiful charity bookstore and café with a spiral staircase and reading nooks — all proceeds support HIV/AIDS services.",
    tags:["shopping", "coffee"], vibe:["shopping", "chill"], cuisine:"Bookstore", bestDay:"Good any day", verified:false, link:"" },
  { id:"moma-design-store", name:"MoMA Design Store", category:"Shopping", neighborhood:"Multiple locations (MoMA/SoHo)",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$$",
    lat:40.7614, lng:-73.9776,
    why:"Well-curated design and gift shop — good for a browse and for actually-good souvenirs.",
    tags:["shopping"], vibe:["shopping", "chill"], cuisine:"Design/Gifts", bestDay:"Good any day", verified:false, link:"" },
  { id:"brooklyn-bridge-walk", name:"Brooklyn Bridge walk", category:"Sightseeing", neighborhood:"Brooklyn Bridge",
    address:"Brooklyn Bridge, New York, NY", hours:"24 hours", price:"Free",
    lat:40.7061, lng:-73.9969,
    why:"Walk it at golden hour from the Manhattan side into DUMBO — iconic views, best done outside midday crowds.",
    tags:["sightseeing", "free", "outdoor"], vibe:["chill", "sociable"], cuisine:"Landmark", bestDay:"Best early morning or golden hour — very crowded midday, especially weekends", verified:false, link:"" },
  { id:"little-island", name:"Little Island", category:"Sightseeing", neighborhood:"Hudson River Park",
    address:"Pier 55, New York, NY 10014", hours:"check before visiting", price:"Free",
    lat:40.7412, lng:-74.0125,
    why:"Striking sculptural park on stilts over the Hudson — small but photogenic, easy to combine with the High Line.",
    tags:["sightseeing", "free", "outdoor"], vibe:["chill"], cuisine:"Park", bestDay:"Good any day, best in good weather", verified:false, link:"" },
  { id:"governors-island", name:"Governors Island", category:"Sightseeing", neighborhood:"New York Harbor",
    address:"Ferry from Battery Maritime Building, New York, NY 10004", hours:"check before visiting — seasonal ferry", price:"Free entry, ferry fee",
    lat:40.6895, lng:-74.0165,
    why:"Car-free island with skyline views, hammocks, and a real 'day trip' feel — check the seasonal ferry schedule first.",
    tags:["sightseeing", "free", "outdoor"], vibe:["chill", "sociable"], cuisine:"Island/Park", bestDay:"Best on a clear weekend day, check ferry times", verified:false, link:"" },
  { id:"bryant-park", name:"Bryant Park", category:"Sightseeing", neighborhood:"Midtown",
    address:"New York, NY 10018", hours:"6am–11pm", price:"Free",
    lat:40.7536, lng:-73.9832,
    why:"Green pocket behind the Public Library — good for a quick sit-down between Midtown errands.",
    tags:["sightseeing", "free", "outdoor"], vibe:["chill"], cuisine:"Park", bestDay:"Good any day", verified:false, link:"" },
  { id:"top-of-the-rock", name:"Top of the Rock", category:"Sightseeing", neighborhood:"Rockefeller Center",
    address:"30 Rockefeller Plaza, New York, NY 10112", hours:"check before visiting — book timed entry", price:"$$$",
    lat:40.759, lng:-73.9787,
    why:"Observation deck with a genuinely great skyline view (including the Empire State Building itself). Book a timed slot ahead.",
    tags:["sightseeing"], vibe:["chill", "sociable"], cuisine:"Landmark", bestDay:"Book sunset slots ahead — they sell out", verified:false, link:"" },
  { id:"dia-beacon-alt-chinatown-galleries", name:"Lower East Side gallery walk", category:"Sightseeing", neighborhood:"Lower East Side",
    address:"Orchard/Ludlow St galleries, New York, NY", hours:"check before visiting", price:"Free",
    lat:40.7191, lng:-73.9905,
    why:"Small independent art galleries clustered around Orchard and Ludlow — good low-key browsing between food stops.",
    tags:["sightseeing", "free"], vibe:["chill"], cuisine:"Galleries", bestDay:"Good any weekday afternoon, many closed Sundays/Mondays — check before visiting", verified:false, link:"" },
  { id:"pdt", name:"Please Don't Tell (PDT)", category:"Cocktails", neighborhood:"East Village",
    address:"113 St Marks Pl, New York, NY 10009", hours:"check before visiting — enter through the phone booth in Crif Dogs", price:"$$$",
    lat:40.7278, lng:-73.9843,
    why:"Enter through a phone booth inside a hot dog shop — one of NYC's original modern speakeasies.",
    tags:["cocktails", "nightlife"], vibe:["sociable", "fun"], cuisine:"Cocktail Bar", bestDay:"Reservations recommended, especially Friday–Saturday", verified:false, link:"" },
  { id:"katana-kitten", name:"Katana Kitten", category:"Cocktails", neighborhood:"West Village",
    address:"531 Hudson St, New York, NY 10014", hours:"check before visiting", price:"$$$",
    lat:40.7331, lng:-74.0061,
    why:"Japanese-inspired cocktail bar, playful and a little chaotic in the best way — great for a group.",
    tags:["cocktails", "nightlife"], vibe:["sociable", "fun"], cuisine:"Cocktail Bar", bestDay:"Great any night, busiest Friday–Saturday", verified:false, link:"" },
  { id:"mother-of-pearl", name:"Mother of Pearl", category:"Cocktails", neighborhood:"East Village",
    address:"95 Ave A, New York, NY 10009", hours:"check before visiting", price:"$$$",
    lat:40.7268, lng:-73.9821,
    why:"Tropical tiki-leaning cocktail den — colourful, fun, good for starting a night out.",
    tags:["cocktails", "nightlife"], vibe:["fun", "sociable"], cuisine:"Tiki Bar", bestDay:"Good any night", verified:false, link:"" },
  { id:"rays-bar", name:"Ray's Bar", category:"Cocktails", neighborhood:"Lower East Side",
    address:"9 Essex St, New York, NY 10002", hours:"check before visiting", price:"$$",
    lat:40.7168, lng:-73.9887,
    why:"Casual, unpretentious natural wine and cocktail bar — good low-key pre-dinner stop.",
    tags:["cocktails"], vibe:["chill", "sociable"], cuisine:"Wine/Cocktail Bar", bestDay:"Good any evening", verified:false, link:"" },
  { id:"existing-conditions", name:"Existing Conditions", category:"Cocktails", neighborhood:"West Village",
    address:"35 W 8th St, New York, NY 10011", hours:"check before visiting", price:"$$$",
    lat:40.7325, lng:-73.9977,
    why:"From one of the bartenders behind Death & Co — technically inventive cocktails, sleek room.",
    tags:["cocktails"], vibe:["sociable"], cuisine:"Cocktail Bar", bestDay:"Book ahead, busiest Thursday–Saturday", verified:false, link:"" },
  { id:"bar-goto", name:"Bar Goto", category:"Cocktails", neighborhood:"Lower East Side",
    address:"245 Eldridge St, New York, NY 10002", hours:"check before visiting", price:"$$$",
    lat:40.7212, lng:-73.9915,
    why:"Japanese-style cocktail bar from a Pegu Club alum — refined but still relaxed.",
    tags:["cocktails"], vibe:["chill", "sociable"], cuisine:"Cocktail Bar", bestDay:"Good any evening", verified:false, link:"" },
  { id:"good-room", name:"Good Room", category:"Nightlife", neighborhood:"Greenpoint, Brooklyn",
    address:"98 Meserole Ave, Brooklyn, NY 11222", hours:"check before visiting — check event calendar", price:"$$",
    lat:40.729, lng:-73.954,
    why:"Solid Brooklyn dance club with a great sound system — check who's DJing before committing to a night.",
    tags:["nightlife", "dancing"], vibe:["fun", "sociable"], cuisine:"Nightclub", bestDay:"Check the calendar — Friday–Saturday for bigger nights", verified:false, link:"" },
  { id:"nowadays", name:"Nowadays", category:"Nightlife", neighborhood:"Ridgewood, Queens",
    address:"56-06 Cooper Ave, Ridgewood, NY 11385", hours:"check before visiting — seasonal, outdoor space", price:"$$",
    lat:40.7043, lng:-73.9026,
    why:"Outdoor/indoor dance space with a laid-back, no-attitude crowd — check if it's running as it's partly seasonal.",
    tags:["nightlife", "dancing"], vibe:["fun", "sociable"], cuisine:"Nightclub", bestDay:"Best in warm weather, check the calendar", verified:false, link:"" },
  { id:"mood-ring", name:"Mood Ring", category:"Nightlife", neighborhood:"Bushwick, Brooklyn",
    address:"1260 Myrtle Ave, Brooklyn, NY 11221", hours:"check before visiting", price:"$$",
    lat:40.6958, lng:-73.9204,
    why:"Astrology-themed bar with a small dance floor — quirky, fun, less full-on club energy.",
    tags:["nightlife", "dancing", "cocktails"], vibe:["fun", "sociable"], cuisine:"Bar/Nightlife", bestDay:"Good Thursday–Saturday nights", verified:false, link:"" },
  { id:"public-records", name:"Public Records", category:"Nightlife", neighborhood:"Gowanus, Brooklyn",
    address:"233 Butler St, Brooklyn, NY 11217", hours:"check before visiting — check event calendar", price:"$$",
    lat:40.6802, lng:-73.9891,
    why:"Listening bar and event space with excellent sound design — check the calendar for what's on.",
    tags:["nightlife", "dancing"], vibe:["chill", "fun"], cuisine:"Listening Bar", bestDay:"Check the calendar before planning a night around it", verified:false, link:"" },
  { id:"babys-all-right", name:"Baby's All Right", category:"Nightlife", neighborhood:"Williamsburg, Brooklyn",
    address:"146 Broadway, Brooklyn, NY 11211", hours:"check before visiting — check event calendar", price:"$$",
    lat:40.7101, lng:-73.9633,
    why:"Music venue/bar/dance floor combo — good if there's a show or DJ set that fits your night.",
    tags:["nightlife", "dancing"], vibe:["fun", "sociable"], cuisine:"Music Venue", bestDay:"Check the calendar first", verified:false, link:"" },
  { id:"3-dollar-bill", name:"3 Dollar Bill", category:"Nightlife", neighborhood:"East Williamsburg, Brooklyn",
    address:"260 Meserole St, Brooklyn, NY 11206", hours:"check before visiting — check event calendar", price:"$$",
    lat:40.7141, lng:-73.9407,
    why:"Queer-friendly outdoor/indoor dance space — fun, inclusive energy, good sound.",
    tags:["nightlife", "dancing"], vibe:["fun", "sociable"], cuisine:"Nightclub", bestDay:"Check the calendar — weekends busiest", verified:false, link:"" },
  { id:"sweetgreen", name:"Sweetgreen", category:"Lunch", neighborhood:"Multiple locations",
    address:"check nearest branch before visiting", hours:"check before visiting", price:"$",
    lat:40.7368, lng:-73.9908,
    why:"Healthy fast-casual salad chain — good reliable lunch option between activities, everywhere in Manhattan.",
    tags:["lunch", "quick"], vibe:["chill", "foody"], cuisine:"Salads/Healthy", bestDay:"Good any day", verified:false, link:"" },
  { id:"cafe-habana", name:"Café Habana", category:"Lunch", neighborhood:"Nolita",
    address:"17 Prince St, New York, NY 10012", hours:"check before visiting", price:"$$",
    lat:40.7233, lng:-73.9958,
    why:"Cuban-Mexican spot famous for its grilled corn with cotija and lime — small, lively, great casual lunch.",
    tags:["lunch", "dinner"], vibe:["foody", "sociable"], cuisine:"Cuban/Mexican", bestDay:"Good any day, can get a wait at peak lunch", verified:false, link:"" },
  { id:"frenchette", name:"Frenchette", category:"Lunch", neighborhood:"Tribeca",
    address:"241 W Broadway, New York, NY 10013", hours:"check before visiting", price:"$$$",
    lat:40.7196, lng:-74.0068,
    why:"Buzzy modern French bistro from ex-Balthazar chefs — book ahead, worth it for a proper lunch out.",
    tags:["lunch", "dinner"], vibe:["foody", "sociable"], cuisine:"French", bestDay:"Book ahead, busiest weekday lunch service", verified:false, link:"" },
  { id:"estela", name:"Estela", category:"Lunch", neighborhood:"Nolita",
    address:"47 E Houston St, New York, NY 10012", hours:"check before visiting", price:"$$$",
    lat:40.7239, lng:-73.9948,
    why:"Small plates from a tiny open kitchen above a Nolita storefront — inventive, well-loved by locals.",
    tags:["lunch", "dinner"], vibe:["foody", "sociable"], cuisine:"Small Plates", bestDay:"Book ahead where possible", verified:false, link:"" },
  { id:"grand-central-oyster-bar", name:"Grand Central Oyster Bar", category:"Lunch", neighborhood:"Midtown",
    address:"89 E 42nd St, New York, NY 10017", hours:"check before visiting", price:"$$$",
    lat:40.7527, lng:-73.9772,
    why:"Century-old oyster bar in the belly of Grand Central Terminal — a proper NYC classic lunch experience.",
    tags:["lunch", "seafood"], vibe:["foody", "sociable"], cuisine:"Seafood", bestDay:"Good any weekday, quieter outside classic lunch rush", verified:false, link:"" },
  { id:"rubirosa", name:"Rubirosa", category:"Dinner", neighborhood:"Nolita",
    address:"235 Mulberry St, New York, NY 10012", hours:"check before visiting", price:"$$",
    lat:40.7233, lng:-73.9955,
    why:"Thin-crust Italian-American pizza and pasta in a warm, family-run room — a genuine downtown favourite.",
    tags:["dinner"], vibe:["foody", "sociable"], cuisine:"Italian-American", bestDay:"Book ahead, or go right at opening", verified:false, link:"" },
  { id:"momofuku-noodle-bar", name:"Momofuku Noodle Bar", category:"Dinner", neighborhood:"East Village",
    address:"171 1st Ave, New York, NY 10003", hours:"check before visiting", price:"$$",
    lat:40.7276, lng:-73.984,
    why:"David Chang's original ramen spot — the pork buns are the move, casual counter-style seating.",
    tags:["dinner", "asian"], vibe:["foody", "sociable"], cuisine:"Asian/Noodles", bestDay:"Good any night, can be a wait at peak times", verified:false, link:"" },
  { id:"peasant", name:"Peasant", category:"Dinner", neighborhood:"Nolita",
    address:"194 Elizabeth St, New York, NY 10012", hours:"check before visiting", price:"$$$",
    lat:40.7222, lng:-73.9963,
    why:"Rustic Italian in a converted 19th-century building with a wood-fired oven — romantic, low-lit room.",
    tags:["dinner"], vibe:["foody", "sociable"], cuisine:"Italian", bestDay:"Book ahead for weekends", verified:false, link:"" },
  { id:"le-coucou", name:"Le Coucou", category:"Dinner", neighborhood:"SoHo",
    address:"138 Lafayette St, New York, NY 10013", hours:"check before visiting — book ahead", price:"$$$$",
    lat:40.7195, lng:-73.9993,
    why:"Elegant, classic French fine dining — a proper splurge night option in a beautiful room.",
    tags:["dinner", "special"], vibe:["foody", "sociable"], cuisine:"French", bestDay:"Book weeks ahead for weekends", verified:false, link:"" },
  { id:"wildair", name:"Wildair", category:"Dinner", neighborhood:"Lower East Side",
    address:"142 Orchard St, New York, NY 10002", hours:"check before visiting", price:"$$$",
    lat:40.7188, lng:-73.9899,
    why:"Small-plates natural wine spot from the Contra team — inventive, casual-but-serious LES dinner.",
    tags:["dinner"], vibe:["foody", "sociable"], cuisine:"Small Plates", bestDay:"Book ahead, busiest Thursday–Saturday", verified:false, link:"" },
  { id:"cafe-cluny", name:"Café Cluny", category:"Brunch", neighborhood:"West Village",
    address:"284 W 12th St, New York, NY 10014", hours:"check before visiting", price:"$$",
    lat:40.7379, lng:-74.0064,
    why:"Charming West Village bistro brunch spot — French-leaning menu, lovely corner room.",
    tags:["brunch"], vibe:["chill", "foody"], cuisine:"French/American", bestDay:"Weekend brunch has a wait — weekday is calmer", verified:false, link:"" },
  { id:"butchers-daughter", name:"The Butcher's Daughter", category:"Brunch", neighborhood:"Nolita",
    address:"19 Kenmare St, New York, NY 10012", hours:"check before visiting", price:"$$",
    lat:40.722, lng:-73.995,
    why:"Bright, plant-filled all-day vegetarian café — good juices and a light, photogenic brunch.",
    tags:["brunch"], vibe:["chill", "foody"], cuisine:"Vegetarian", bestDay:"Weekend mornings busiest", verified:false, link:"" },
  { id:"bubbys", name:"Bubby's", category:"Brunch", neighborhood:"Tribeca/DUMBO",
    address:"120 Hudson St, New York, NY 10013", hours:"check before visiting", price:"$$",
    lat:40.7186, lng:-74.0093,
    why:"Classic all-American comfort-food brunch — pancakes and pie, relaxed and family-friendly feeling.",
    tags:["brunch"], vibe:["chill", "foody"], cuisine:"American", bestDay:"Weekend mornings get a wait", verified:false, link:"" },
  { id:"sant-ambroeus", name:"Sant Ambroeus", category:"Brunch", neighborhood:"West Village",
    address:"259 W 4th St, New York, NY 10014", hours:"check before visiting", price:"$$$",
    lat:40.7337, lng:-74.0033,
    why:"Elegant Italian café — good cappuccino and a proper sit-down brunch with old-world charm.",
    tags:["brunch"], vibe:["chill", "sociable"], cuisine:"Italian", bestDay:"Good any day, book ahead for weekends", verified:false, link:"" }
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
const VIBES = [
  { key:"All", label:"Any vibe", emoji:"✨" },
  { key:"chill", label:"Chill", emoji:"😌" },
  { key:"fun", label:"Fun", emoji:"🎉" },
  { key:"sociable", label:"Sociable", emoji:"🥂" },
  { key:"foody", label:"Foody", emoji:"🍽️" },
  { key:"shopping", label:"Shopping", emoji:"🛍️" }
];
function allCuisines(){
  const set = new Set(STATE.places.map(p=>p.cuisine).filter(Boolean));
  return ["All", ...Array.from(set).sort()];
}
function renderPlaces(){
  const chipsEl = document.getElementById("placeChips");
  if (!chipsEl.dataset.built){
    chipsEl.innerHTML = CATEGORIES.map(c=>`<button class="chip ${c==='All'?'active':''}" data-cat="${c}" onclick="setPlaceFilter('${c}')">${c}</button>`).join("");
    chipsEl.dataset.built = "1";
  }
  const vibeEl = document.getElementById("vibeChips");
  if (!vibeEl.dataset.built){
    vibeEl.innerHTML = VIBES.map(v=>`<button class="chip ${v.key==='All'?'active':''}" data-vibe="${v.key}" onclick="setVibeFilter('${v.key}')">${v.emoji} ${v.label}</button>`).join("");
    vibeEl.dataset.built = "1";
  }
  const cuisineEl = document.getElementById("cuisineChips");
  if (cuisineEl && !cuisineEl.dataset.built){
    cuisineEl.innerHTML = allCuisines().map(c=>`<button class="chip ${c==='All'?'active':''}" data-cuisine="${c}" onclick="setCuisineFilter('${c.replace(/'/g,"\\'")}')">${c}</button>`).join("");
    cuisineEl.dataset.built = "1";
  }
  const q = STATE.ui.placeSearch.toLowerCase();
  const vibeFilter = STATE.ui.vibeFilter || "All";
  const cuisineFilter = STATE.ui.cuisineFilter || "All";
  const filtered = STATE.places.filter(p=>{
    const catOk = STATE.ui.placeFilter==="All" || p.category===STATE.ui.placeFilter;
    const vibeOk = vibeFilter==="All" || (p.vibe && p.vibe.includes(vibeFilter));
    const cuisineOk = cuisineFilter==="All" || p.cuisine===cuisineFilter;
    const searchOk = !q || p.name.toLowerCase().includes(q) || p.neighborhood.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.cuisine||"").toLowerCase().includes(q);
    return catOk && vibeOk && cuisineOk && searchOk;
  });
  document.getElementById("placesCount").textContent = `${filtered.length} of ${STATE.places.length} spots`;
  document.getElementById("placesList").innerHTML = filtered.map(p=>placeCardHTML(p,{})).join("") ||
    `<div class="empty">Nothing matches — try a different filter, or add your own place below.</div>`;
}
function setPlaceFilter(c){
  STATE.ui.placeFilter = c;
  document.querySelectorAll("#placeChips .chip").forEach(el=>el.classList.toggle("active", el.dataset.cat===c));
  renderPlaces();
}
function setVibeFilter(v){
  STATE.ui.vibeFilter = v;
  document.querySelectorAll("#vibeChips .chip").forEach(el=>el.classList.toggle("active", el.dataset.vibe===v));
  renderPlaces();
}
function setCuisineFilter(c){
  STATE.ui.cuisineFilter = c;
  document.querySelectorAll("#cuisineChips .chip").forEach(el=>el.classList.toggle("active", el.dataset.cuisine===c));
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
    ${p.bestDay ? `<div class="muted" style="margin-top:6px"><strong>Best time:</strong> ${p.bestDay}</div>` : ""}
    <div class="place-meta-row">
      <span class="pill">${p.hours}</span>
      ${p.cuisine ? `<span class="pill" style="background:#FDE9E6">${p.cuisine}</span>` : ""}
      ${p.verified===false ? `<span class="pill" style="background:#FFF3D6">check before visiting</span>` : `<span class="pill" style="background:#E6F7F0">verified</span>`}
      ${(p.vibe||[]).map(v=>`<span class="pill" style="background:#F0E9FF">${v}</span>`).join("")}
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
