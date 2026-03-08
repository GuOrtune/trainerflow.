const https = require('https');
const fs = require('fs');

const uas = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  'Mozilla/5.0 (X11; Linux x86_64)'
];

const exercises = [
  { name: "Supino Reto com Barra", group: "Chest" },
  { name: "Supino Inclinado com Halteres", group: "Chest" },
  { name: "Supino Declinado com Barra", group: "Chest" },
  { name: "Crossover Polia Alta", group: "Chest" },
  { name: "Crossover Polia Baixa", group: "Chest" },
  { name: "Voador (Peck Deck)", group: "Chest" },
  { name: "Crucifixo Reto com Halteres", group: "Chest" },
  { name: "Crucifixo Inclinado com Halteres", group: "Chest" },
  { name: "Puxada Frontal (Pulley)", group: "Back" },
  { name: "Remada Curvada com Barra", group: "Back" },
  { name: "Remada Baixa no Triângulo", group: "Back" },
  { name: "Remada Unilateral (Serrote)", group: "Back" },
  { name: "Barra Fixa (Pull-up)", group: "Back" },
  { name: "Pulldown com Corda", group: "Back" },
  { name: "Remada Cavalinho", group: "Back" },
  { name: "Agachamento Livre", group: "Legs" },
  { name: "Leg Press 45º", group: "Legs" },
  { name: "Cadeira Extensora", group: "Legs" },
  { name: "Cadeira Flexora", group: "Legs" },
  { name: "Mesa Flexora", group: "Legs" },
  { name: "Afundo com Halteres", group: "Legs" },
  { name: "Passada (Walking Lunge)", group: "Legs" },
  { name: "Hack Machine", group: "Legs" },
  { name: "Agachamento Búlgaro", group: "Legs" },
  { name: "Stiff com Barra", group: "Legs" },
  { name: "Levantamento Terra", group: "Legs" },
  { name: "Elevação Pélvica (Hip Thrust)", group: "Glutes" },
  { name: "Glúteo na Polia Baixa", group: "Glutes" },
  { name: "Cadeira Abdutora", group: "Glutes" },
  { name: "Cadeira Adutora", group: "Legs" },
  { name: "Desenvolvimento com Halteres", group: "Shoulder" },
  { name: "Elevação Lateral com Halteres", group: "Shoulder" },
  { name: "Elevação Frontal com Anilhas", group: "Shoulder" },
  { name: "Crucifixo Invertido na Máquina", group: "Shoulder" },
  { name: "Desenvolvimento Máquina", group: "Shoulder" },
  { name: "Remada Alta na Polia", group: "Shoulder" },
  { name: "Encolhimento com Halteres", group: "Traps" },
  { name: "Rosca Direta com Barra", group: "Biceps" },
  { name: "Rosca Alternada com Halteres", group: "Biceps" },
  { name: "Rosca Scott na Máquina", group: "Biceps" },
  { name: "Rosca Martelo com Halteres", group: "Biceps" },
  { name: "Rosca Concentrada", group: "Biceps" },
  { name: "Tríceps Pulley (Corda)", group: "Triceps" },
  { name: "Tríceps Testa com Barra W", group: "Triceps" },
  { name: "Tríceps Francês Unilateral", group: "Triceps" },
  { name: "Tríceps Coice na Polia", group: "Triceps" },
  { name: "Mergulho nas Paralelas", group: "Triceps" },
  { name: "Abdominal Supra no Solo", group: "Abs" },
  { name: "Abdominal Infra (Elevação de Pernas)", group: "Abs" },
  { name: "Prancha Isométrica", group: "Abs" },
  { name: "Panturrilha em Pé na Máquina", group: "Calves" },
  { name: "Panturrilha Sentado (Gêmeos)", group: "Calves" }
];

async function searchChannel(query) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/results?search_query=' + encodeURIComponent('Gymworkout143 ' + query + ' exercise'), {
      headers: {
        'User-Agent': uas[Math.floor(Math.random() * uas.length)],
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
         const results = [];
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
                             results.push(item.videoRenderer.videoId);
                          }
                       }
                    }
                 }
               }
            } catch(e) {}
         }
         resolve(results);
      });
    }).on('error', () => resolve([]));
  });
}

const fallbacks = {
  'Chest': 'UIrL3LWOPHc', 
  'Back': 'nSMtlyIf7sY', 
  'Legs': 'd3FkU5pI1wY',
  'Glutes': 'd3FkU5pI1wY',
  'Shoulder': 'nSMtlyIf7sY',
  'Traps': 'nSMtlyIf7sY',
  'Biceps': 'UIrL3LWOPHc',
  'Triceps': 'UIrL3LWOPHc',
  'Abs': 'd3FkU5pI1wY',
  'Calves': 'd3FkU5pI1wY'
};

async function run() {
  const groups = [...new Set(exercises.map(e => e.group))];
  const groupVideos = {};
  
  console.log('Fetching videos per muscle group from Gymworkout143...');
  
  for(let g of groups) {
     const ids = await searchChannel(g);
     if (ids.length > 0) {
        groupVideos[g] = ids;
        console.log(`Found ${ids.length} videos for ${g}`);
     } else {
        groupVideos[g] = [fallbacks[g]];
        console.log(`Fallback for ${g}`);
     }
     await new Promise(r => setTimeout(r, 1000));
  }
  
  const codeMapping = [];
  
  // Assign a unique video per exercise if possible (pop from group arrays)
  const usedIds = new Set();
  
  for(let i = 0; i < exercises.length; i++) {
    const { name, group } = exercises[i];
    
    let nextId = fallbacks[group]; // default
    const available = groupVideos[group] || [];
    
    // Find an unused video in this group if any
    let found = false;
    for(let id of available) {
      if (!usedIds.has(id)) {
        nextId = id;
        usedIds.add(id);
        found = true;
        break;
      }
    }
    
    // If all used, just pick a random one from the group to at least match muscle
    if (!found && available.length > 0) {
       nextId = available[Math.floor(Math.random() * available.length)];
    }
    
    codeMapping.push(`  '${name}': 'https://www.youtube.com/embed/${nextId}',`);
    console.log(`[${i+1}/${exercises.length}] ${name} -> ${nextId}`);
  }
  
  fs.writeFileSync('videoIdsGroups.txt', codeMapping.join('\n'));
}

run();
