/* ─────────────────────────────────────────────
   NutraAI — app.js
   Powered by Claude (claude-sonnet-4-6)

   IMPORTANT: This app calls the Anthropic API directly
   from the browser for demo purposes. In production,
   proxy all API calls through your own backend server
   so your API key is never exposed to clients.
   See: https://docs.anthropic.com/en/api/getting-started
   ───────────────────────────────────────────── */

// ── Config ─────────────────────────────────────
// Replace with your Anthropic API key.
// In production, call YOUR backend instead.
const ANTHROPIC_API_KEY = 'YOUR_API_KEY_HERE';
const MODEL = 'claude-sonnet-4-6';

// ── App state ───────────────────────────────────
const state = {
  name: '', age: 25, gender: 'Male',
  height: 170, weight: 70,
  activityFactor: 1.55, goal: 'maintain',
  bmi: 0, bmr: 0, dailyCal: 0, calorieGoal: 2000,
  meals: [],
  totalCalToday: 0,
  waterGlasses: 0,
  nutrients: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
  lastScanResult: null,
};

const DOCTORS = [
  { name: 'Dr. Rabeya Sultana', spec: 'Nutritionist', rating: '4.9', fee: '$15', avail: 'Today 3 pm',  bg: '#E1F5EE', fg: '#085041' },
  { name: 'Dr. Karim Hossain',  spec: 'Physician',    rating: '4.7', fee: '$25', avail: 'Tomorrow 10 am', bg: '#E6F1FB', fg: '#0C447C' },
  { name: 'Dr. Nusrat Jahan',   spec: 'Dietitian',    rating: '4.8', fee: '$18', avail: 'Today 5 pm',  bg: '#FAEEDA', fg: '#633806' },
  { name: 'Dr. Farhan Islam',   spec: 'Physician',    rating: '4.6', fee: '$30', avail: 'Tomorrow 2 pm', bg: '#FCEBEB', fg: '#791F1F' },
  { name: 'Dr. Sonia Rahman',   spec: 'Nutritionist', rating: '5.0', fee: '$20', avail: 'Today 4 pm',  bg: '#E1F5EE', fg: '#085041' },
];

// ── Navigation ──────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'screen-health')  renderHealthScreen();
  if (id === 'screen-doctors') renderDoctors('All');
  if (id === 'screen-home')    renderHome();
}

function switchNav(btn, screenId) {
  // Update active nav button in THIS screen's nav bar
  btn.closest('.nav-bar').querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showScreen(screenId);
}

// ── Onboarding ──────────────────────────────────
function completeOnboard() {
  const name   = document.getElementById('ob-name').value.trim() || 'User';
  const age    = parseInt(document.getElementById('ob-age').value)    || 25;
  const height = parseFloat(document.getElementById('ob-height').value) || 170;
  const weight = parseFloat(document.getElementById('ob-weight').value) || 70;
  const act    = parseFloat(document.getElementById('ob-activity').value) || 1.55;
  const goal   = document.getElementById('ob-goal').value || 'maintain';
  const gender = document.getElementById('ob-gender').value;

  Object.assign(state, { name, age, height, weight, activityFactor: act, goal, gender });

  // Mifflin-St Jeor BMR
  const bmr = gender === 'Female'
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;
  state.bmr = Math.round(bmr);

  const tdee = Math.round(bmr * act);
  state.dailyCal = goal === 'loss' ? tdee - 500 : goal === 'gain' ? tdee + 300 : tdee;
  state.calorieGoal = state.dailyCal;
  state.bmi = parseFloat((weight / ((height / 100) ** 2)).toFixed(1));

  document.getElementById('home-name').textContent  = name;
  document.getElementById('home-avatar').textContent = name[0].toUpperCase();

  renderHome();
  renderStreaks();
  showScreen('screen-home');
}

// ── Home screen ─────────────────────────────────
function renderHome() {
  const left = Math.max(0, state.calorieGoal - state.totalCalToday);
  document.getElementById('h-cal').textContent   = left;
  document.getElementById('h-water').textContent = state.waterGlasses + '/8';

  const pct = state.calorieGoal
    ? Math.min(100, Math.round((state.totalCalToday / state.calorieGoal) * 100))
    : 0;
  document.getElementById('cal-bar').style.width  = pct + '%';
  document.getElementById('h-cal-pct').textContent = pct + '% of goal';
  document.getElementById('cal-consumed').textContent = state.totalCalToday + ' consumed';
  document.getElementById('cal-goal-lbl').textContent = 'Goal: ' + state.calorieGoal;

  const { cat } = getBMIInfo(state.bmi);
  document.getElementById('h-bmi-label').textContent =
    (state.bmi || '—') + ' · ' + (state.bmi ? cat : 'fill in your profile');

  renderMealsList();
  renderStreaks();
}

function renderMealsList() {
  const el = document.getElementById('home-meals-list');
  if (!state.meals.length) {
    el.innerHTML = '<div class="empty-state">No meals logged yet. Scan your first meal!</div>';
    return;
  }
  const icons = { Breakfast: '🥣', Lunch: '🍱', Dinner: '🍽️', Snack: '🍎' };
  el.innerHTML = state.meals.map(m => `
    <div class="meal-item">
      <div class="meal-icon">${icons[m.type] || '🍽️'}</div>
      <div class="meal-info">
        <div class="name">${m.name}</div>
        <div class="sub">${m.type}</div>
      </div>
      <span class="kcal-badge">${m.cal} kcal</span>
    </div>`).join('');
}

function renderStreaks() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const done = [1, 1, 1, 1, 1, 0, 0];
  document.getElementById('streak-row').innerHTML = days
    .map((d, i) => `<div class="streak-day ${done[i] ? 'streak-done' : 'streak-miss'}">${d}</div>`)
    .join('');
}

// ── BMI helpers ─────────────────────────────────
function getBMIInfo(bmi) {
  if (!bmi) return { cat: '—', cls: 'pill-blue', recos: [] };
  if (bmi < 18.5) return { cat: 'Underweight', cls: 'pill-blue',  recos: ['Increase calorie intake by 300–500/day', 'Include protein-rich foods', 'Consider strength training', 'Consult a nutritionist'] };
  if (bmi < 25)   return { cat: 'Normal weight', cls: 'pill-green', recos: ['Maintain current diet', 'Stay active with 150 min/week', 'Keep monitoring regularly', 'Great work!'] };
  if (bmi < 30)   return { cat: 'Overweight', cls: 'pill-amber',  recos: ['Reduce intake by 300–500 cal/day', 'Walk 30 minutes daily', 'Limit sugary drinks', 'Track meals consistently'] };
  if (bmi < 35)   return { cat: 'Obese class I', cls: 'pill-red',  recos: ['Consult a physician soon', 'Reduce sugary and processed foods', 'Start low-impact exercise', 'Set a 5–10% weight-loss goal'] };
  return { cat: 'Obese class II+', cls: 'pill-red', recos: ['Consult a doctor urgently', 'Medical supervision recommended', 'Avoid high-impact exercise initially', 'Dietary changes are critical'] };
}

function calcBMI() {
  const h = parseFloat(document.getElementById('bmi-height').value);
  const w = parseFloat(document.getElementById('bmi-weight').value);
  if (!h || !w || h < 50 || w < 20) return;

  const bmi = parseFloat((w / ((h / 100) ** 2)).toFixed(1));
  state.bmi = bmi; state.height = h; state.weight = w;

  const { cat, cls, recos } = getBMIInfo(bmi);
  document.getElementById('bmi-result').style.display = 'block';
  document.getElementById('bmi-val').textContent = bmi;
  const catEl = document.getElementById('bmi-cat');
  catEl.textContent = cat;
  catEl.className   = 'pill ' + cls;
  document.getElementById('bmi-reco').innerHTML = recos.map(r => '• ' + r).join('<br>');
  document.getElementById('h-bmi-label').textContent = bmi + ' · ' + cat;
}

// ── Health screen ───────────────────────────────
function renderHealthScreen() {
  if (state.height && state.weight) {
    document.getElementById('bmi-height').value = state.height;
    document.getElementById('bmi-weight').value = state.weight;
    calcBMI();
  }

  const score = calcHealthScore();
  document.getElementById('health-score-big').textContent = score;
  document.getElementById('h-score').textContent = score;

  const grade = score >= 85 ? { t: 'Excellent', c: 'pill-green' }
               : score >= 70 ? { t: 'Good', c: 'pill-green' }
               : score >= 55 ? { t: 'Fair', c: 'pill-amber' }
               :               { t: 'Needs work', c: 'pill-red' };
  document.getElementById('health-score-pills').innerHTML =
    `<span class="pill ${grade.c}">${grade.t}</span>`;

  // Daily targets
  document.getElementById('targets-list').innerHTML = [
    { n: 'Calories', v: state.totalCalToday, max: state.calorieGoal, color: '#1D9E75', unit: 'kcal' },
    { n: 'BMR',      v: state.bmr,           max: state.bmr,         color: '#85B7EB', unit: 'kcal' },
    { n: 'Goal',     v: state.calorieGoal,   max: state.calorieGoal, color: '#97C459', unit: 'kcal' },
  ].map(t => `
    <div class="nutr-row">
      <div class="nutr-label">${t.n}</div>
      <div class="nutr-bar"><div class="nutr-fill" style="width:${t.max ? Math.min(100, Math.round(t.v / t.max * 100)) : 100}%;background:${t.color}"></div></div>
      <div class="nutr-val">${t.v}</div>
    </div>`).join('');

  // Nutrient bars
  const nutrs = [
    { n: 'Protein', v: state.nutrients.protein, max: 150, color: '#378ADD' },
    { n: 'Carbs',   v: state.nutrients.carbs,   max: 300, color: '#EF9F27' },
    { n: 'Fat',     v: state.nutrients.fat,     max: 80,  color: '#D85A30' },
    { n: 'Fiber',   v: state.nutrients.fiber,   max: 30,  color: '#1D9E75' },
  ];
  document.getElementById('nutr-bars').innerHTML = nutrs.map(n => `
    <div class="nutr-row">
      <div class="nutr-label">${n.n}</div>
      <div class="nutr-bar"><div class="nutr-fill" style="width:${Math.min(100, Math.round(n.v / n.max * 100))}%;background:${n.color}"></div></div>
      <div class="nutr-val">${Math.round(n.v)}g</div>
    </div>`).join('');

  renderWaterGlasses();
  renderRisks();
}

function calcHealthScore() {
  let score = 50;
  if (state.totalCalToday > 0 && state.calorieGoal > 0) {
    const r = state.totalCalToday / state.calorieGoal;
    score += (r >= 0.8 && r <= 1.1) ? 20 : (r >= 0.6 && r <= 1.2) ? 10 : 0;
  }
  score += Math.min(10, state.waterGlasses * 1.25);
  const h = calcSleepHours();
  score += (h >= 7 && h <= 9) ? 15 : h >= 6 ? 8 : 0;
  if (state.meals.length >= 2) score += 5;
  return Math.min(100, Math.round(score));
}

function calcSleepHours() {
  const bed  = (document.getElementById('sleep-bed')?.value  || '22:30').split(':').map(Number);
  const wake = (document.getElementById('sleep-wake')?.value || '06:00').split(':').map(Number);
  let mins = (wake[0] * 60 + wake[1]) - (bed[0] * 60 + bed[1]);
  if (mins < 0) mins += 1440;
  return parseFloat((mins / 60).toFixed(1));
}

function updateSleep() {
  const h = calcSleepHours();
  const el = document.getElementById('sleep-hours');
  if (el) el.textContent = h;
  renderHealthScreen();
}

// ── Water tracker ───────────────────────────────
function renderWaterGlasses() {
  const el = document.getElementById('water-glasses');
  if (!el) return;
  el.innerHTML = Array.from({ length: 8 }, (_, i) => `
    <div class="water-glass ${i < state.waterGlasses ? 'filled' : ''}" onclick="setWater(${i + 1})">
      <i class="ti ti-droplet"></i>
    </div>`).join('');
}

function setWater(n) {
  state.waterGlasses = n;
  renderWaterGlasses();
  document.getElementById('h-water').textContent = n + '/8';
  renderHealthScreen();
}

function addWater() {
  if (state.waterGlasses < 8) setWater(state.waterGlasses + 1);
}

// ── Disease risk ─────────────────────────────────
function renderRisks() {
  const bmi = state.bmi || 22;
  const t2d   = Math.min(90, Math.round((bmi > 30 ? 55 : bmi > 25 ? 30 : 10) + (state.nutrients.carbs > 200 ? 15 : 0)));
  const htn   = Math.min(90, Math.round((bmi > 30 ? 45 : bmi > 25 ? 25 : 8)  + (state.nutrients.fat   > 60  ? 10 : 0)));
  const heart = Math.min(90, Math.round((bmi > 30 ? 40 : bmi > 25 ? 20 : 6)  + (state.waterGlasses    < 4   ? 8  : 0)));

  document.getElementById('risk-rows').innerHTML = [
    { n: 'Type 2 diabetes', v: t2d },
    { n: 'Hypertension',    v: htn },
    { n: 'Heart disease',   v: heart },
  ].map(r => `
    <div class="risk-row">
      <div class="risk-label">${r.n}</div>
      <div class="risk-bar"><div class="risk-fill" style="width:${r.v}%;background:${r.v > 50 ? '#E24B4A' : r.v > 25 ? '#EF9F27' : '#1D9E75'}"></div></div>
      <div class="risk-pct" style="color:${r.v > 50 ? '#791F1F' : r.v > 25 ? '#633806' : '#085041'}">${r.v}%</div>
    </div>`).join('');
}

// ── Food scan (AI) ──────────────────────────────
async function runFoodScan() {
  const food    = document.getElementById('food-input').value.trim();
  const portion = parseFloat(document.getElementById('portion-select').value);
  if (!food) { alert('Please describe your meal first.'); return; }

  document.getElementById('scan-input-area').style.display = 'none';
  document.getElementById('scan-result').style.display     = 'none';
  document.getElementById('scan-loading').style.display    = 'block';
  document.getElementById('scan-loading-msg').textContent  = 'Analyzing "' + food + '"…';

  const prompt = `You are a nutrition analysis AI. The user described their meal as: "${food}". Portion multiplier: ${portion}x.

Respond with ONLY a raw JSON object — no markdown fences, no explanation:
{
  "foodName": "proper food name",
  "confidence": 92,
  "calories": 520,
  "protein": 28,
  "carbs": 62,
  "fat": 14,
  "fiber": 4,
  "sugar": 6,
  "sodium": 480,
  "vitamins": ["Vitamin B12", "Vitamin D"],
  "healthRating": 7,
  "aiTip": "One concise health tip about this meal for a person with goal: ${state.goal || 'maintain weight'}"
}`;

  try {
    const res  = await callClaude([{ role: 'user', content: prompt }]);
    const text = res.replace(/```json|```/g, '').trim();
    const r    = JSON.parse(text);

    state.lastScanResult = { ...r, type: document.getElementById('meal-type-select').value };

    document.getElementById('res-food-name').textContent = r.foodName;
    document.getElementById('res-conf').textContent      =
      'AI confidence: ' + r.confidence + '% · Health rating: ' + r.healthRating + '/10';
    document.getElementById('res-cal').textContent   = r.calories;
    document.getElementById('res-prot').textContent  = r.protein  + 'g';
    document.getElementById('res-carbs').textContent = r.carbs    + 'g';
    document.getElementById('res-fat').textContent   = r.fat      + 'g';

    document.getElementById('res-nutrients').innerHTML = `
      <div class="nutr-row"><div class="nutr-label">Fiber</div><div class="nutr-bar"><div class="nutr-fill" style="width:${Math.min(100, Math.round(r.fiber / 30 * 100))}%;background:#1D9E75"></div></div><div class="nutr-val">${r.fiber}g</div></div>
      <div class="nutr-row"><div class="nutr-label">Sugar</div><div class="nutr-bar"><div class="nutr-fill" style="width:${Math.min(100, Math.round(r.sugar / 50 * 100))}%;background:#E24B4A"></div></div><div class="nutr-val">${r.sugar}g</div></div>
      <div class="nutr-row"><div class="nutr-label">Sodium</div><div class="nutr-bar"><div class="nutr-fill" style="width:${Math.min(100, Math.round(r.sodium / 2300 * 100))}%;background:#EF9F27"></div></div><div class="nutr-val">${r.sodium}mg</div></div>
      <div style="margin-top:8px">${(r.vitamins || []).map(v => `<span class="tag">${v}</span>`).join('')}</div>`;

    document.getElementById('res-ai-tip').innerHTML = `
      <div class="tip-title"><i class="ti ti-bulb"></i> AI insight</div>
      <div class="tip-body">${r.aiTip || ''}</div>`;

    document.getElementById('scan-loading').style.display = 'none';
    document.getElementById('scan-result').style.display  = 'block';

  } catch (e) {
    document.getElementById('scan-loading').style.display    = 'none';
    document.getElementById('scan-input-area').style.display = 'block';
    alert('Could not analyze meal. Check your API key and try again.\n\nError: ' + e.message);
  }
}

function logMeal() {
  const r = state.lastScanResult;
  if (!r) return;
  state.meals.push({ name: r.foodName, cal: r.calories, type: r.type });
  state.totalCalToday          += r.calories;
  state.nutrients.protein += (r.protein || 0);
  state.nutrients.carbs   += (r.carbs   || 0);
  state.nutrients.fat     += (r.fat     || 0);
  state.nutrients.fiber   += (r.fiber   || 0);
  resetScan();
  renderHome();
  showScreen('screen-home');
}

function resetScan() {
  document.getElementById('food-input').value               = '';
  document.getElementById('scan-result').style.display      = 'none';
  document.getElementById('scan-input-area').style.display  = 'block';
  state.lastScanResult = null;
}

// ── AI Coach ────────────────────────────────────
async function sendCoachMsg() {
  const inp = document.getElementById('coach-input');
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = '';

  const chat = document.getElementById('chat-messages');
  chat.innerHTML += `<div class="chat-msg user"><div class="bubble">${escHtml(msg)}</div></div>`;

  const thinkId = 'think-' + Date.now();
  chat.innerHTML += `<div class="chat-msg ai" id="${thinkId}"><div class="bubble"><div class="dot-anim"><span></span><span></span><span></span></div></div></div>`;
  chat.scrollTop = chat.scrollHeight;

  const system = `You are a friendly, concise AI health coach. The user's profile:
Name: ${state.name}, Age: ${state.age}, Gender: ${state.gender}
Height: ${state.height}cm, Weight: ${state.weight}kg, BMI: ${state.bmi}
Health goal: ${state.goal}, Daily calorie target: ${state.calorieGoal} kcal

Today's stats:
Calories consumed: ${state.totalCalToday} kcal
Water glasses: ${state.waterGlasses}/8
Meals logged: ${state.meals.map(m => m.name).join(', ') || 'none'}
Nutrients — protein: ${Math.round(state.nutrients.protein)}g, carbs: ${Math.round(state.nutrients.carbs)}g, fat: ${Math.round(state.nutrients.fat)}g

Keep responses under 3 sentences. Be specific and reference the user's actual data when helpful.`;

  try {
    const reply = await callClaude([{ role: 'user', content: msg }], system);
    document.getElementById(thinkId).innerHTML = `<div class="bubble">${escHtml(reply)}</div>`;
  } catch (e) {
    document.getElementById(thinkId).innerHTML =
      `<div class="bubble">Sorry, I had a connection issue. Please check your API key and try again.</div>`;
  }
  chat.scrollTop = chat.scrollHeight;
}

// ── Doctors ─────────────────────────────────────
function renderDoctors(filter) {
  const docs = filter === 'All' ? DOCTORS : DOCTORS.filter(d => d.spec === filter);
  document.getElementById('doctors-list').innerHTML = docs.map(d => `
    <div class="doctor-card">
      <div class="doc-av" style="background:${d.bg};color:${d.fg}">${d.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
      <div class="doc-info">
        <div class="doc-name">${d.name}</div>
        <div class="doc-sub">${d.spec} · ⭐ ${d.rating} · ${d.fee}/session</div>
        <div class="doc-avail"><i class="ti ti-clock" style="font-size:13px"></i> Next: ${d.avail}</div>
        <div class="doc-btns">
          <button class="btn-sm" onclick="alert('Video call — premium plan required')">Video</button>
          <button class="btn-sm" style="background:#1D9E75;color:#fff;border-color:#1D9E75"
            onclick="alert('Booking confirmed with ${d.name}! You will receive a confirmation shortly.')">Book now</button>
        </div>
      </div>
    </div>`).join('');
}

function filterDocs(type, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.className = 'pill pill-muted filter-btn';
  });
  btn.className = 'pill pill-green filter-btn active';
  renderDoctors(type);
}

// ── Anthropic API wrapper ────────────────────────
async function callClaude(messages, system) {
  const body = { model: MODEL, max_tokens: 1000, messages };
  if (system) body.system = system;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':         'application/json',
      'x-api-key':            ANTHROPIC_API_KEY,
      'anthropic-version':    '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'API request failed (' + res.status + ')');
  }
  const data = await res.json();
  return data.content?.map(c => c.text || '').join('') || '';
}

// ── Utilities ────────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Init ─────────────────────────────────────────
renderStreaks();
