const https = require('https');
const fs = require('fs');

const exercises = [
  { pt: "Supino Reto com Barra", en: "Barbell Bench Press" },
  { pt: "Supino Inclinado com Halteres", en: "Incline Dumbbell Bench Press" },
  { pt: "Supino Declinado com Barra", en: "Decline Barbell Bench Press" },
  { pt: "Crossover Polia Alta", en: "Cable Crossover" },
  { pt: "Crossover Polia Baixa", en: "Low Cable Crossover" },
  { pt: "Voador (Peck Deck)", en: "Pec Deck Fly" },
  { pt: "Crucifixo Reto com Halteres", en: "Dumbbell Fly" },
  { pt: "Crucifixo Inclinado com Halteres", en: "Incline Dumbbell Fly" },
  { pt: "Puxada Frontal (Pulley)", en: "Lat Pulldown" },
  { pt: "Remada Curvada com Barra", en: "Barbell Bent Over Row" },
  { pt: "Remada Baixa no Triângulo", en: "Seated Cable Row" },
  { pt: "Remada Unilateral (Serrote)", en: "Dumbbell Row" },
  { pt: "Barra Fixa (Pull-up)", en: "Pull Up" },
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
  { pt: "Glúteo na Polia Baixa", en: "Cable Glute Kickback" },
  { pt: "Cadeira Abdutora", en: "Seated Hip Abduction" },
  { pt: "Cadeira Adutora", en: "Seated Hip Adduction" },
  { pt: "Desenvolvimento com Halteres", en: "Dumbbell Shoulder Press" },
  { pt: "Elevação Lateral com Halteres", en: "Dumbbell Lateral Raise" },
  { pt: "Elevação Frontal com Anilhas", en: "Front Raise" },
  { pt: "Crucifixo Invertido na Máquina", en: "Reverse Pec Deck" },
  { pt: "Desenvolvimento Máquina", en: "Machine Shoulder Press" },
  { pt: "Remada Alta na Polia", en: "Cable Upright Row" },
  { pt: "Encolhimento com Halteres", en: "Dumbbell Shrug" },
  { pt: "Rosca Direta com Barra", en: "Barbell Bicep Curl" },
  { pt: "Rosca Alternada com Halteres", en: "Alternating Dumbbell Curl" },
  { pt: "Rosca Scott na Máquina", en: "Machine Preacher Curl" },
  { pt: "Rosca Martelo com Halteres", en: "Dumbbell Hammer Curl" },
  { pt: "Rosca Concentrada", en: "Concentration Curl" },
  { pt: "Tríceps Pulley (Corda)", en: "Cable Tricep Pushdown Rope" },
  { pt: "Tríceps Testa com Barra W", en: "Skull Crusher" },
  { pt: "Tríceps Francês Unilateral", en: "Overhead Tricep Extension" },
  { pt: "Tríceps Coice na Polia", en: "Cable Tricep Kickback" },
  { pt: "Mergulho nas Paralelas", en: "Tricep Dips" },
  { pt: "Abdominal Supra no Solo", en: "Crunches" },
  { pt: "Abdominal Infra (Elevação de Pernas)", en: "Lying Leg Raise" },
  { pt: "Prancha Isométrica", en: "Plank" },
  { pt: "Panturrilha em Pé na Máquina", en: "Standing Calf Raise" },
  { pt: "Panturrilha Sentado (Gêmeos)", en: "Seated Calf Raise" }
];

const uas = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  'Mozilla/5.0 (X11; Linux x86_64)'
];

async function searchYT(query) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/results?search_query=' + encodeURIComponent('Gymworkout143 ' + query + ' shorts'), {
      headers: {
        'User-Agent': uas[Math.floor(Math.random() * uas.length)],
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
         const match = data.match(/var ytInitialData = (\{.*?\});<\/script>/);
         if(match) {
            try {
               const json = JSON.parse(match[1]);
               const contents = json.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
               if (contents) {
                 for(let s of contents) {
                    if(s.itemSectionRenderer?.contents) {
                       for(let item of s.itemSectionRenderer.contents) {
                          if(item.videoRenderer && item.videoRenderer.videoId) {
                             resolve(item.videoRenderer.videoId);
                             return;
                          }
                       }
                    }
                 }
               }
            } catch(e) {}
         }
         resolve(null);
      });
    }).on('error', () => resolve(null));
  });
}

const defaults = {
  'Peito': 'tOQ-kE1N7Xo',
  'Costas': '-_P5zXgZf-g',
  'Pernas': 'xK2pC84XJ6k',
  'Glúteos': 'i7p5G75yE3Q',
  'Ombros': 'b-Q4WlJ6F6c',
  'Trapézio': 'tN-cM-0X4yU',
  'Bíceps': 'Z0Hnd5G-oP8',
  'Tríceps': 'Y25Q-_wN9bY',
  'Abdômen': '3x-O5zH9w5E',
  'Panturrilhas': 'q1J8C6I4t2Y'
};

async function run() {
  const codeMapping = [];
  console.log('Fetching 52 unique shorts from Gymworkout143...');
  for(let i = 0; i < exercises.length; i++) {
    const { pt, en } = exercises[i];
    let id = await searchYT(en);
    
    // Fallback search without 'shorts'
    if (!id) {
       await new Promise(r => setTimeout(r, 2000));
       id = await searchYT(en.replace(' shorts', ''));
    }
    
    if (!id) id = 'IODxDxX7oi4';
    
    codeMapping.push(`  '${pt}': 'https://www.youtube.com/embed/${id}',`);
    console.log(`[${i+1}/${exercises.length}] ${pt} (${en}) -> ${id}`);
    
    await new Promise(r => setTimeout(r, 1500)); 
  }
  
  fs.writeFileSync('videoIdsGymworkout143.txt', codeMapping.join('\n'));
}

run();
