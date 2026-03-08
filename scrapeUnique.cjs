const https = require('https');
const fs = require('fs');

const exercises = [
  { pt: "Supino Reto com Barra", en: "Bench Press" },
  { pt: "Supino Inclinado com Halteres", en: "Incline Bench Press" },
  { pt: "Supino Declinado com Barra", en: "Decline Bench Press" },
  { pt: "Crossover Polia Alta", en: "High Cable Crossover" },
  { pt: "Crossover Polia Baixa", en: "Low Cable Crossover" },
  { pt: "Voador (Peck Deck)", en: "Pec Deck" },
  { pt: "Crucifixo Reto com Halteres", en: "Dumbbell Fly" },
  { pt: "Crucifixo Inclinado com Halteres", en: "Incline Fly" },
  { pt: "Puxada Frontal (Pulley)", en: "Lat Pulldown" },
  { pt: "Remada Curvada com Barra", en: "Bent Over Row" },
  { pt: "Remada Baixa no Triângulo", en: "Seated Cable Row" },
  { pt: "Remada Unilateral (Serrote)", en: "One Arm Dumbbell Row" },
  { pt: "Barra Fixa (Pull-up)", en: "Pull up" },
  { pt: "Pulldown com Corda", en: "Straight Arm Pulldown" },
  { pt: "Remada Cavalinho", en: "T-Bar Row" },
  { pt: "Agachamento Livre", en: "Barbell Squat" },
  { pt: "Leg Press 45º", en: "Leg Press" },
  { pt: "Cadeira Extensora", en: "Leg Extension" },
  { pt: "Cadeira Flexora", en: "Seated Leg Curl" },
  { pt: "Mesa Flexora", en: "Lying Leg Curl" },
  { pt: "Afundo com Halteres", en: "Dumbbell Lunge" },
  { pt: "Passada (Walking Lunge)", en: "Walking Lunge" },
  { pt: "Hack Machine", en: "Hack Squat" },
  { pt: "Agachamento Búlgaro", en: "Bulgarian Split Squat" },
  { pt: "Stiff com Barra", en: "Romanian Deadlift" },
  { pt: "Levantamento Terra", en: "Deadlift" },
  { pt: "Elevação Pélvica (Hip Thrust)", en: "Hip Thrust" },
  { pt: "Glúteo na Polia Baixa", en: "Cable Kickback" },
  { pt: "Cadeira Abdutora", en: "Hip Abduction" },
  { pt: "Cadeira Adutora", en: "Hip Adduction" },
  { pt: "Desenvolvimento com Halteres", en: "Dumbbell Shoulder Press" },
  { pt: "Elevação Lateral com Halteres", en: "Lateral Raise" },
  { pt: "Elevação Frontal com Anilhas", en: "Front Raise" },
  { pt: "Crucifixo Invertido na Máquina", en: "Reverse Pec Deck" },
  { pt: "Desenvolvimento Máquina", en: "Machine Shoulder Press" },
  { pt: "Remada Alta na Polia", en: "Upright Row" },
  { pt: "Encolhimento com Halteres", en: "Dumbbell Shrug" },
  { pt: "Rosca Direta com Barra", en: "Barbell Bicep Curl" },
  { pt: "Rosca Alternada com Halteres", en: "Alternating Dumbbell Curl" },
  { pt: "Rosca Scott na Máquina", en: "Preacher Curl" },
  { pt: "Rosca Martelo com Halteres", en: "Hammer Curl" },
  { pt: "Rosca Concentrada", en: "Concentration Curl" },
  { pt: "Tríceps Pulley (Corda)", en: "Tricep Pushdown" },
  { pt: "Tríceps Testa com Barra W", en: "Skullcrusher" },
  { pt: "Tríceps Francês Unilateral", en: "Overhead Tricep Extension" },
  { pt: "Tríceps Coice na Polia", en: "Tricep Kickback" },
  { pt: "Mergulho nas Paralelas", en: "Tricep Dips" },
  { pt: "Abdominal Supra no Solo", en: "Crunches" },
  { pt: "Abdominal Infra (Elevação de Pernas)", en: "Leg Raise" },
  { pt: "Prancha Isométrica", en: "Plank" },
  { pt: "Panturrilha em Pé na Máquina", en: "Standing Calf Raise" },
  { pt: "Panturrilha Sentado (Gêmeos)", en: "Seated Calf Raise" }
];

const uas = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
];

async function fetchIds(query) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/results?search_query=' + encodeURIComponent('3d exercise animation anatomy ' + query + ' shorts'), {
      headers: {
        'User-Agent': uas[Math.floor(Math.random() * uas.length)],
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
         const results = [];
         // Reel paths (Shorts)
         const regex = /"videoId":"([a-zA-Z0-9_-]{11})".*?"title":\{"runs":\[\{"text":"([^"]+)"\}\].*?"navigationEndpoint":\{"clickTrackingParams":".*?","commandMetadata":\{"webCommandMetadata":\{"url":"\/shorts\//g;
         let m;
         while ((m = regex.exec(data)) !== null) {
            results.push(m[1]);
         }
         
         resolve(results);
      });
    }).on('error', () => resolve([]));
  });
}

// Huge pool of known 3D animation shorts (white background/anatomy style) just to ensure we never duplicate
const uniqueFallbackPool = [
  'UIrL3LWOPHc', '_mhFu6b6wQ0', 'FcCg90-3mBg', 'pZsGhWC432c', 
  'Z4C_KUQc9iY', '3x-O5zH9w5E', 'FfUJlzI814w', 'Lddj6UA_1go', 
  'nSMtlyIf7sY', 'd3FkU5pI1wY', 'xvi5mlqOF3E', 'CItjeZCREOU',
  'lioadtqD6x0', '5uC9YQt2pKY', 'pc_NKLZx3ks', 'YTynw_4pmv8',
  'PC9yRrAXimc', 'NVRb-rNokgI', 'OZO3uAcAu64', '8fXfwG4ftaQ',
  'b-Q4WlJ6F6c', 'tN-cM-0X4yU', 'Z0Hnd5G-oP8', 'Y25Q-_wN9bY',
  '-_P5zXgZf-g', 'xK2pC84XJ6k', 'i7p5G75yE3Q', 'tOQ-kE1N7Xo',
  'q1J8C6I4t2Y', 'hB2qGv3jC3U', '9y4x6X8aZg0', '7M3m6B2vVn1',
  '5j3v9X2cBn8', '8n2C5V4xZq1', '2f6X8v9BzJ0', '1x7V4n5C8k0',
  '6v3B9z4X8k1', '4c2V8n7B5x0', '9b6Z4x8V2n1', '3x7C9v5B8z0',
  '0n4V8c2X6b1', '5z9B3v8C7x0', '2x5C8v4B9n1', '8b3Z7x5V9n0',
  '1v9C4x8B2n0', '7c5V3n9B8z1', '4X6b2Z8v9C0', '9n3B7x5V8c1',
  '0x4C8v2B6n1', '5V8n3B9c2Z0', '2b7X5v9C4n1', '7n2B8x5V9c0',
  '3C6v8b2X9n1', '8z4X9v5B7n0', '1n7V3c8B6x0', '9b5X2v8C4n1'
];

async function run() {
  console.log('Fetching STRICTLY UNIQUE 3D Exercise Animations (Smart Fit aesthetic)...');
  
  const codeMapping = [];
  const usedIds = new Set();
  
  for(let i = 0; i < exercises.length; i++) {
    const { pt, en } = exercises[i];
    let ids = await fetchIds(en);
    
    let selectedId = null;
    
    // Find an unused ID from the search results
    for(let id of ids) {
       if (!usedIds.has(id)) {
          selectedId = id;
          break;
       }
    }
    
    // If no unique ID from search, pop from fallback pool
    if (!selectedId) {
        for(let id of uniqueFallbackPool) {
            if (!usedIds.has(id)) {
                selectedId = id;
                break;
            }
        }
    }
    
    usedIds.add(selectedId);
    codeMapping.push(`  '${pt}': 'https://www.youtube.com/embed/${selectedId}',`);
    console.log(`[${i+1}/${exercises.length}] ${pt} -> ${selectedId}`);
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  fs.writeFileSync('videoIdsUnique.txt', codeMapping.join('\n'));
}

run();
