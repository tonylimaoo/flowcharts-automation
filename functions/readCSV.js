import fs from 'fs'
import fastcsv from 'fast-csv'
import { exec } from 'child_process'
import puppeteer from 'puppeteer'


export const readCSV = (filePath) => {

  return new Promise((resolve, reject) => {
    const dados = [];

    fs.createReadStream(filePath)
      .pipe(fastcsv.parse({ headers: true }))
      .on('data', (row) => {
        dados.push(row);
      })
      .on('end', () => {
        console.log('CSV carregado.');
        resolve(dados); // Retorna os dados quando a leitura terminar
      })
      .on('error', (error) => {
        reject(error); // Captura erros na leitura
      });
  });
}


export const createPNG = async (inputFile, outputFile) => {

  let status;
  // const inputFile = 'diagram_to_png'
  // const outputFile = 'diagram.png'
  const command = `mmdc -i ${inputFile} -o ${outputFile} -b transparent -q 2`

  await exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao gerar PNG: ${error.message}`);
      status = false
      return;
    }
    if (stderr) {
      console.error(`Aviso: ${stderr}`);
      // status = false
    }
    console.log(`PNG gerado com sucesso: ${outputFile}`);
    status = true
  })

  return await status
}

export const gerarImagem = async (mermaidCode) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 2400, height: 1600, deviceScaleFactor: 2 });

  await page.setContent(`
    <html>
    <head>
        <style>
            body {
                width: 100vw;
                height: 100vh;
                overflow: auto;
            }
        </style>
        <script type="module">
            import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs';
            mermaid.initialize({
                startOnLoad: true,
                flowchart: {
                    nodeSpacing: 100, // Ajusta o espaçamento horizontal
                    rankSpacing: 100, // Ajusta o espaçamento vertical
                    curve: 'linear' // Altera a curva dos links
                }
            });
        </script>
    </head>
    <body>
        <div class="mermaid">
            %%{ init : { "themeVariables": { "nodeSpacing": 100, "rankSpacing": 100 }}}%%
            ${mermaidCode}
        </div>
    </body>
    </html>
  `);

  await page.waitForSelector('.mermaid', { timeout: 10000 });
  await new Promise(resolve => setTimeout(resolve, 2000));

  await page.screenshot({ path: './diagrams/diagrama.png', fullPage: true });

  await browser.close();
  console.log('Imagem gerada: diagrama.png');
}

// export const gerarImagem = async (mermaidCode) => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.setViewport({ width: 2400, height: 1600, deviceScaleFactor: 2 });

//   await page.setContent(`
//     <html>
//     <head>
//         <style>
//             body {
//                 width: 100vw;
//                 height: 100vh;
//                 overflow: auto;
//             }
//             .mermaid {
//                 width: 4000px; /* Ajuste conforme necessário */
//                 height: auto; /* Permite a altura automática */
//             }
//         </style>
//         <script type="module">
//             import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs';
//             mermaid.initialize({ startOnLoad: true });
//         </script>
//     </head>
//     <body>
//         <div class="mermaid">${mermaidCode}</div>
//     </body>
//     </html>
//   `);

//   await page.waitForSelector('.mermaid', { timeout: 10000 }); // Aumenta o tempo de espera
//   await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2 segundos

//   // Captura a página inteira
//   await page.screenshot({ path: 'diagrama.png', fullPage: true });

//   await browser.close();
//   console.log('Imagem gerada: diagrama.png');
// }

// export const gerarImagem = async (mermaidCode) => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();

//   await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

//   await page.setContent(`
//         <html>
//         <head>
//             <script type="module">
//                 import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs';
//                 mermaid.initialize({ startOnLoad: true });
//             </script>
//         </head>
//         <body>
//             <div class="mermaid">${mermaidCode}</div>
//         </body>
//         </html>
//     `);

//   await page.waitForSelector('.mermaid'); // Aguarda a renderização

//   const elemento = await page.$('.mermaid'); // Captura o elemento renderizado
//   await elemento.screenshot({ path: 'diagrama.png' });

//   await browser.close();
//   console.log('Imagem gerada: diagrama.png');
// }

export const gerarImagem2 = async (mermaidCode) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(`
      <html>
      <head>
          <script type="module">
              import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs';
              mermaid.initialize({ startOnLoad: true });
          </script>
          <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; }
              .mermaid { font-size: 18px; }
          </style>
      </head>
      <body>
          <div class="mermaid">${mermaidCode}</div>
      </body>
      </html>
  `);

  // Aguarda o Mermaid renderizar o gráfico
  await page.waitForSelector('.mermaid');

  // Obtém o tamanho real do gráfico
  const elemento = await page.$('.mermaid');
  const box = await elemento.boundingBox(); // Pega largura e altura reais

  // Define viewport com tamanho ajustado ao conteúdo
  await page.setViewport({
    width: Math.ceil(box.width),
    height: Math.ceil(box.height),
    deviceScaleFactor: 2 // Aumenta a resolução para maior qualidade
  });

  // Captura apenas o diagrama no tamanho certo
  await elemento.screenshot({ path: 'diagrama.png' });

  await browser.close();
  console.log('Imagem gerada: diagrama.png');
}