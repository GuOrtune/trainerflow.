const https = require('https');
const fs = require('fs');

const exercises = [
  "Supino Reto com Barra", "Supino Inclinado com Halteres", "Supino Declinado com Barra", 
  "Crossover Polia Alta", "Crossover Polia Baixa", "Voador (Peck Deck)", "Crucifixo Reto com Halteres", "Crucifixo Inclinado com Halteres",
  "Puxada Frontal (Pulley)", "Remada Curvada com Barra", "Remada Baixa no Triângulo", "Remada Unilateral (Serrote)", 
  "Barra Fixa (Pull-up)", "Pulldown com Corda", "Remada Cavalinho",
  "Agachamento Livre", "Leg Press 45º", "Cadeira Extensora", "Cadeira Flexora", "Mesa Flexora", 
  "Afundo com Halteres", "Passada (Walking Lunge)", "Hack Machine", "Agachamento Búlgaro", "Stiff com Barra", "Levantamento Terra",
  "Elevação Pélvica (Hip Thrust)", "Glúteo na Polia Baixa", "Cadeira Abdutora", "Cadeira Adutora",
  "Desenvolvimento com Halteres", "Elevação Lateral com Halteres", "Elevação Frontal com Anilhas", 
  "Crucifixo Invertido na Máquina", "Desenvolvimento Máquina", "Remada Alta na Polia", "Encolhimento com Halteres",
  "Rosca Direta com Barra", "Rosca Alternada com Halteres", "Rosca Scott na Máquina", "Rosca Martelo com Halteres", "Rosca Concentrada",
  "Tríceps Pulley (Corda)", "Tríceps Testa com Barra W", "Tríceps Francês Unilateral", "Tríceps Coice na Polia", "Mergulho nas Paralelas",
  "Abdominal Supra no Solo", "Abdominal Infra (Elevação de Pernas)", "Prancha Isométrica", 
  "Panturrilha em Pé na Máquina", "Panturrilha Sentado (Gêmeos)"
];

async function searchYT(query) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/results?search_query=' + encodeURIComponent('Gym Visual ' + query), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
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
                          if(item.videoRenderer && item.videoRenderer.lengthText) {
                             // ensure it's a short video (exercise demo), not a long compilation, but any is fine for now
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

async function run() {
  const codeMapping = [];
  console.log('Fetching 52 unique 3D dummy videos from YouTube...');
  for(let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    let id = await searchYT(ex);
    
    // fallbacks just in case
    if (!id) id = 'IODxDxX7oi4';
    
    codeMapping.push(`    case '${ex}': return 'https://www.youtube.com/embed/${id}';`);
    console.log(`[${i+1}/${exercises.length}] ${ex} -> ${id}`);
    await new Promise(r => setTimeout(r, 200)); 
  }
  
  fs.writeFileSync('videoIds.txt', codeMapping.join('\n'));
}

run();
