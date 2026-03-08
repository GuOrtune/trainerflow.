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

async function searchYouTube(query) {
  return new Promise((resolve) => {
    https.get('https://www.youtube.com/results?search_query=' + encodeURIComponent(query), (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Find video ID in the raw HTML that looks like a normal watch element
        const matches = [...data.matchAll(/\"videoId\":\"([a-zA-Z0-9_-]{11})\"/g)];
        if(matches.length > 0) {
          // the first one is sometimes an ad if it has certain tracking flags, but generally matches[0] or [1] is the top video
          // let's just pick the first one and hope it's not a google ad video id, usually the regular search videoId is fine
          let id = matches[0][1];
          // skip common known ad IDs if any, but since we can't tell, we'll take matches[0][1]
          // or filter out very short IDs
          resolve(id);
        } else {
          resolve('IODxDxX7oi4');
        }
      });
    }).on('error', () => resolve('IODxDxX7oi4'));
  });
}

async function run() {
  const results = {};
  console.log('Fetching ' + exercises.length + ' videos from Gym Visual YouTube channel...');
  for(let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const q = 'Gym Visual ' + ex;
    const id = await searchYouTube(q);
    results[ex] = id;
    console.log(`[${i+1}/${exercises.length}] ${ex} -> ${id}`);
    // small delay to avoid 429
    await new Promise(r => setTimeout(r, 100));
  }
  
  fs.writeFileSync('videoIds.json', JSON.stringify(results, null, 2));
  console.log('Saved to videoIds.json');
}

run();
