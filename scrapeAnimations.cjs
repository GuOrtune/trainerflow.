const https = require('https');
const fs = require('fs');

const exercises = [
  { pt: "Supino Reto com Barra", en: "Bench Press" },
  { pt: "Supino Inclinado com Halteres", en: "Incline Dumbbell Press" },
  { pt: "Supino Declinado com Barra", en: "Decline Bench Press" },
  { pt: "Crossover Polia Alta", en: "High Cable Crossover" },
  { pt: "Crossover Polia Baixa", en: "Low Cable Crossover" },
  { pt: "Voador (Peck Deck)", en: "Pec Deck Machine" },
  { pt: "Crucifixo Reto com Halteres", en: "Dumbbell Fly" },
  { pt: "Crucifixo Inclinado com Halteres", en: "Incline Dumbbell Fly" },
  { pt: "Puxada Frontal (Pulley)", en: "Lat Pulldown" },
  { pt: "Remada Curvada com Barra", en: "Bent Over Row" },
  { pt: "Remada Baixa no Triângulo", en: "Seated Cable Row" },
  { pt: "Remada Unilateral (Serrote)", en: "One Arm Dumbbell Row" },
  { pt: "Barra Fixa (Pull-up)", en: "Pull up" },
  { pt: "Pulldown com Corda", en: "Straight Arm Pulldown" },
  { pt: "Remada Cavalinho", en: "T-Bar Row" },
  { pt: "Agachamento Livre", en: "Barbell Squat" },
  { pt: "Leg Press 45º", en: "Leg Press" },
  { pt: "Cadeira Extensora", en: "Leg Extension Machine" },
  { pt: "Cadeira Flexora", en: "Seated Leg Curl" },
  { pt: "Mesa Flexora", en: "Lying Leg Curl" },
  { pt: "Afundo com Halteres", en: "Dumbbell Lunge" },
  { pt: "Passada (Walking Lunge)", en: "Walking Lunge" },
  { pt: "Hack Machine", en: "Hack Squat" },
  { pt: "Agachamento Búlgaro", en: "Bulgarian Split Squat" },
  { pt: "Stiff com Barra", en: "Romanian Deadlift" },
  { pt: "Levantamento Terra", en: "Deadlift" },
  { pt: "Elevação Pélvica (Hip Thrust)", en: "Barbell Hip Thrust" },
  { pt: "Glúteo na Polia Baixa", en: "Cable Kickback" },
  { pt: "Cadeira Abdutora", en: "Hip Abduction Machine" },
  { pt: "Cadeira Adutora", en: "Hip Adduction Machine" },
  { pt: "Desenvolvimento com Halteres", en: "Dumbbell Shoulder Press" },
  { pt: "Elevação Lateral com Halteres", en: "Dumbbell Lateral Raise" },
  { pt: "Elevação Frontal com Anilhas", en: "Weight Plate Front Raise" },
  { pt: "Crucifixo Invertido na Máquina", en: "Reverse Pec Deck" },
  { pt: "Desenvolvimento Máquina", en: "Machine Shoulder Press" },
  { pt: "Remada Alta na Polia", en: "Cable Upright Row" },
  { pt: "Encolhimento com Halteres", en: "Dumbbell Shrug" },
  { pt: "Rosca Direta com Barra", en: "Barbell Curl" },
  { pt: "Rosca Alternada com Halteres", en: "Alternating Dumbbell Curl" },
  { pt: "Rosca Scott na Máquina", en: "Preacher Curl Machine" },
  { pt: "Rosca Martelo com Halteres", en: "Hammer Curl" },
  { pt: "Rosca Concentrada", en: "Concentration Curl" },
  { pt: "Tríceps Pulley (Corda)", en: "Cable Tricep Pushdown" },
  { pt: "Tríceps Testa com Barra W", en: "Skullcrusher" },
  { pt: "Tríceps Francês Unilateral", en: "Overhead Tricep Extension" },
  { pt: "Tríceps Coice na Polia", en: "Cable Tricep Kickback" },
  { pt: "Mergulho nas Paralelas", en: "Tricep Dips" },
  { pt: "Abdominal Supra no Solo", en: "Crunch" },
  { pt: "Abdominal Infra (Elevação de Pernas)", en: "Lying Leg Raise" },
  { pt: "Prancha Isométrica", en: "Plank" },
  { pt: "Panturrilha em Pé na Máquina", en: "Standing Calf Raise" },
  { pt: "Panturrilha Sentado (Gêmeos)", en: "Seated Calf Raise" }
];

const uas = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
];

async function searchAnimations(query) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/results?search_query=' + encodeURIComponent('3d exercise animation ' + query + ' shorts'), {
      headers: {
        'User-Agent': uas[Math.floor(Math.random() * uas.length)],
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
         const results = [];
         
         const regex = /"videoId":"([a-zA-Z0-9_-]{11})".*?"title":\{"runs":\[\{"text":"([^"]+)"\}\].*?"navigationEndpoint":\{"clickTrackingParams":".*?","commandMetadata":\{"webCommandMetadata":\{"url":"\/shorts\//g;
         let m;
         while ((m = regex.exec(data)) !== null) {
            results.push(m[1]);
         }
         
         if (results.length === 0) {
             const regex2 = /"reelItemRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"/g;
             while ((m = regex2.exec(data)) !== null) {
                 results.push(m[1]);
             }
         }
         
         resolve(results);
      });
    }).on('error', () => resolve([]));
  });
}

const defaultIds = [
  'UIrL3LWOPHc', 'nSMtlyIf7sY', '7vFYwIroHA4', 'Z4C_KUQc9iY', 
  'lioadtqD6x0', '5uC9YQt2pKY', 'pc_NKLZx3ks', 'FcCg90-3mBg',
  'YTynw_4pmv8', 'PC9yRrAXimc', 'FfUJlzI814w', 'NVRb-rNokgI',
  'xvi5mlqOF3E', 'Lddj6UA_1go', 'OZO3uAcAu64', 'pZsGhWC432c',
  'CItjeZCREOU', '3x-O5zH9w5E', 'd3FkU5pI1wY'
];

async function run() {
  console.log('Fetching 3D Exercise Animations (Smart Fit aesthetic)...');
  
  const codeMapping = [];
  
  for(let i = 0; i < exercises.length; i++) {
    const { pt, en } = exercises[i];
    let ids = await searchAnimations(en);
    
    let selectedId = ids[0];
    
    if (!selectedId) {
        await new Promise(r => setTimeout(r, 1000));
        ids = await searchAnimations(en.replace(' ', ''));
        selectedId = ids[0];
    }
    
    if (!selectedId) selectedId = defaultIds[Math.floor(Math.random() * defaultIds.length)];
    
    codeMapping.push(`  '${pt}': 'https://www.youtube.com/embed/${selectedId}',`);
    console.log(`[${i+1}/${exercises.length}] ${pt} (${en}) -> ${selectedId}`);
    
    await new Promise(r => setTimeout(r, 800));
  }
  
  fs.writeFileSync('videoIdsClean.txt', codeMapping.join('\n'));
}

run();
