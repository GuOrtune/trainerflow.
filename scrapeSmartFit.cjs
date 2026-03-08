const https = require('https');
const fs = require('fs');

const uas = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
];

const exercises = [
  "Supino Reto com Barra",
  "Supino Inclinado com Halteres",
  "Supino Declinado com Barra",
  "Crossover Polia Alta",
  "Crossover Polia Baixa",
  "Voador (Peck Deck)",
  "Crucifixo Reto com Halteres",
  "Crucifixo Inclinado com Halteres",
  "Puxada Frontal (Pulley)",
  "Remada Curvada com Barra",
  "Remada Baixa no Triângulo",
  "Remada Unilateral (Serrote)",
  "Barra Fixa (Pull-up)",
  "Pulldown com Corda",
  "Remada Cavalinho",
  "Agachamento Livre",
  "Leg Press 45º",
  "Cadeira Extensora",
  "Cadeira Flexora",
  "Mesa Flexora",
  "Afundo com Halteres",
  "Passada (Walking Lunge)",
  "Hack Machine",
  "Agachamento Búlgaro",
  "Stiff com Barra",
  "Levantamento Terra",
  "Elevação Pélvica (Hip Thrust)",
  "Glúteo na Polia Baixa",
  "Cadeira Abdutora",
  "Cadeira Adutora",
  "Desenvolvimento com Halteres",
  "Elevação Lateral com Halteres",
  "Elevação Frontal com Anilhas",
  "Crucifixo Invertido na Máquina",
  "Desenvolvimento Máquina",
  "Remada Alta na Polia",
  "Encolhimento com Halteres",
  "Rosca Direta com Barra",
  "Rosca Alternada com Halteres",
  "Rosca Scott na Máquina",
  "Rosca Martelo com Halteres",
  "Rosca Concentrada",
  "Tríceps Pulley (Corda)",
  "Tríceps Testa com Barra W",
  "Tríceps Francês Unilateral",
  "Tríceps Coice na Polia",
  "Mergulho nas Paralelas",
  "Abdominal Supra no Solo",
  "Abdominal Infra (Elevação de Pernas)",
  "Prancha Isométrica",
  "Panturrilha em Pé na Máquina",
  "Panturrilha Sentado (Gêmeos)"
];

async function searchSmartFit(ptName) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/results?search_query=' + encodeURIComponent('Smart Fit ' + ptName + ' execução animação'), {
      headers: {
        'User-Agent': uas[Math.floor(Math.random() * uas.length)],
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
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
                             // Let's grab the video
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

// Fallbacks are generic white 3D animation shorts from Muscle and Motion or similar if SmartFit specifically isn't found
const fallbacks = [
  'IODxDxX7oi4', 'Lddj6UA_1go', '6jBx5YwAb7E', 'ZaNyRjpoki8'
];

async function run() {
  console.log('Fetching Smart Fit authentic animations...');
  
  const codeMapping = [];
  
  for(let i = 0; i < exercises.length; i++) {
    const name = exercises[i];
    let id = await searchSmartFit(name);
    
    // Retry without 'animação'
    if (!id) {
        await new Promise(r => setTimeout(r, 1000));
        id = await searchSmartFit(name.replace(' animação', ''));
    }
    
    // Pick random fallback if absolute failure
    if (!id) id = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    
    codeMapping.push(`  '${name}': 'https://www.youtube.com/embed/${id}',`);
    console.log(`[${i+1}/${exercises.length}] ${name} -> ${id}`);
    
    await new Promise(r => setTimeout(r, 1000));
  }
  
  fs.writeFileSync('videoIdsSmartFit.txt', codeMapping.join('\n'));
}

run();
