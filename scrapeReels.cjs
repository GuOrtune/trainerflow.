const https = require('https');
const fs = require('fs');

const uas = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
];

const exercises = [
  { name: "Supino Reto com Barra", group: "Chest", terms: "Bench Press" },
  { name: "Supino Inclinado com Halteres", group: "Chest", terms: "Incline Bench Press" },
  { name: "Supino Declinado com Barra", group: "Chest", terms: "Decline Bench Press" },
  { name: "Crossover Polia Alta", group: "Chest", terms: "Cable Crossover" },
  { name: "Crossover Polia Baixa", group: "Chest", terms: "Low Cable Crossover" },
  { name: "Voador (Peck Deck)", group: "Chest", terms: "Pec Deck" },
  { name: "Crucifixo Reto com Halteres", group: "Chest", terms: "Dumbbell Fly" },
  { name: "Crucifixo Inclinado com Halteres", group: "Chest", terms: "Incline Fly" },
  { name: "Puxada Frontal (Pulley)", group: "Back", terms: "Lat Pulldown" },
  { name: "Remada Curvada com Barra", group: "Back", terms: "Bent Over Row" },
  { name: "Remada Baixa no Triângulo", group: "Back", terms: "Seated Cable Row" },
  { name: "Remada Unilateral (Serrote)", group: "Back", terms: "Dumbbell Row" },
  { name: "Barra Fixa (Pull-up)", group: "Back", terms: "Pull Up" },
  { name: "Pulldown com Corda", group: "Back", terms: "Straight Arm Pulldown" },
  { name: "Remada Cavalinho", group: "Back", terms: "T-Bar Row" },
  { name: "Agachamento Livre", group: "Legs", terms: "Squat" },
  { name: "Leg Press 45º", group: "Legs", terms: "Leg Press" },
  { name: "Cadeira Extensora", group: "Legs", terms: "Leg Extension" },
  { name: "Cadeira Flexora", group: "Legs", terms: "Leg Curl" },
  { name: "Mesa Flexora", group: "Legs", terms: "Lying Leg Curl" },
  { name: "Afundo com Halteres", group: "Legs", terms: "Lunge" },
  { name: "Passada (Walking Lunge)", group: "Legs", terms: "Walking Lunge" },
  { name: "Hack Machine", group: "Legs", terms: "Hack Squat" },
  { name: "Agachamento Búlgaro", group: "Legs", terms: "Bulgarian Split Squat" },
  { name: "Stiff com Barra", group: "Legs", terms: "Romanian Deadlift" },
  { name: "Levantamento Terra", group: "Legs", terms: "Deadlift" },
  { name: "Elevação Pélvica (Hip Thrust)", group: "Glutes", terms: "Hip Thrust" },
  { name: "Glúteo na Polia Baixa", group: "Glutes", terms: "Cable Kickback" },
  { name: "Cadeira Abdutora", group: "Glutes", terms: "Hip Abduction" },
  { name: "Cadeira Adutora", group: "Legs", terms: "Hip Adduction" },
  { name: "Desenvolvimento com Halteres", group: "Shoulder", terms: "Shoulder Press" },
  { name: "Elevação Lateral com Halteres", group: "Shoulder", terms: "Lateral Raise" },
  { name: "Elevação Frontal com Anilhas", group: "Shoulder", terms: "Front Raise" },
  { name: "Crucifixo Invertido na Máquina", group: "Shoulder", terms: "Reverse Pec Deck" },
  { name: "Desenvolvimento Máquina", group: "Shoulder", terms: "Machine Press" },
  { name: "Remada Alta na Polia", group: "Shoulder", terms: "Upright Row" },
  { name: "Encolhimento com Halteres", group: "Traps", terms: "Shrug" },
  { name: "Rosca Direta com Barra", group: "Biceps", terms: "Bicep Curl" },
  { name: "Rosca Alternada com Halteres", group: "Biceps", terms: "Dumbbell Curl" },
  { name: "Rosca Scott na Máquina", group: "Biceps", terms: "Preacher Curl" },
  { name: "Rosca Martelo com Halteres", group: "Biceps", terms: "Hammer Curl" },
  { name: "Rosca Concentrada", group: "Biceps", terms: "Concentration Curl" },
  { name: "Tríceps Pulley (Corda)", group: "Triceps", terms: "Tricep Pushdown" },
  { name: "Tríceps Testa com Barra W", group: "Triceps", terms: "Skull Crusher" },
  { name: "Tríceps Francês Unilateral", group: "Triceps", terms: "Overhead Extension" },
  { name: "Tríceps Coice na Polia", group: "Triceps", terms: "Tricep Kickback" },
  { name: "Mergulho nas Paralelas", group: "Triceps", terms: "Dips" },
  { name: "Abdominal Supra no Solo", group: "Abs", terms: "Crunches" },
  { name: "Abdominal Infra (Elevação de Pernas)", group: "Abs", terms: "Leg Raise" },
  { name: "Prancha Isométrica", group: "Abs", terms: "Plank" },
  { name: "Panturrilha em Pé na Máquina", group: "Calves", terms: "Standing Calf Raise" },
  { name: "Panturrilha Sentado (Gêmeos)", group: "Calves", terms: "Seated Calf Raise" }
];

async function searchShorts(query) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/results?search_query=' + encodeURIComponent('Gymworkout143 ' + query + ' exercise shorts'), {
      headers: {
        'User-Agent': uas[Math.floor(Math.random() * uas.length)],
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const results = [];

        // Extract shorts from reelShelfRenderer OR search results with "shorts" in URL
        const regex = /"videoId":"([a-zA-Z0-9_-]{11})".*?"title":\{"runs":\[\{"text":"([^"]+)"\}\].*?"navigationEndpoint":\{"clickTrackingParams":".*?","commandMetadata":\{"webCommandMetadata":\{"url":"\/shorts\//g;
        let m;
        while ((m = regex.exec(data)) !== null) {
          results.push({ id: m[1], title: m[2] });
        }

        // If that fails, just fallback to any reelItemRenderer regex
        if (results.length === 0) {
          const regex2 = /"reelItemRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})".*?"headline":\{"simpleText":"([^"]+)"\}/g;
          while ((m = regex2.exec(data)) !== null) {
            results.push({ id: m[1], title: m[2] });
          }
        }

        resolve(results);
      });
    }).on('error', () => resolve([]));
  });
}

const fallbackShorts = {
  'Chest': 'UIrL3LWOPHc',
  'Back': 'nSMtlyIf7sY',
  'Legs': 'd3FkU5pI1wY',
  'Glutes': 'd3FkU5pI1wY',
  'Shoulder': 'nSMtlyIf7sY',
  'Traps': 'nSMtlyIf7sY',
  'Biceps': 'UIrL3LWOPHc',
  'Triceps': 'UIrL3LWOPHc',
  'Abs': '3x-O5zH9w5E',
  'Calves': 'd3FkU5pI1wY'
};

async function run() {
  const groups = [...new Set(exercises.map(e => e.group))];
  const groupVideos = {};

  console.log('Fetching STRICT SHORTS per muscle group from Gymworkout143...');

  for (let g of groups) {
    const items = await searchShorts(g);
    if (items.length > 0) {
      groupVideos[g] = items.map(i => i.id);
      console.log(`Found ${items.length} true shorts for ${g}`);
    } else {
      groupVideos[g] = [fallbackShorts[g]];
      console.log(`Fallback for ${g}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  const codeMapping = [];
  const usedIds = new Set();

  for (let i = 0; i < exercises.length; i++) {
    const { name, group } = exercises[i];

    let nextId = fallbackShorts[group];
    const available = groupVideos[group] || [];

    let found = false;
    for (let id of available) {
      if (!usedIds.has(id)) {
        nextId = id;
        usedIds.add(id);
        found = true;
        break;
      }
    }

    if (!found && available.length > 0) {
      nextId = available[Math.floor(Math.random() * available.length)];
    }

    // Crucial: Use the /embed/ URL correctly. Shorts can naturally be embedded as regular youtube video iframes using /embed/ID.
    codeMapping.push(`  '${name}': 'https://www.youtube.com/embed/${nextId}',`);
    console.log(`[${i + 1}/${exercises.length}] ${name} -> ${nextId}`);
  }

  fs.writeFileSync('videoIdsShorts.txt', codeMapping.join('\n'));
}

run();
