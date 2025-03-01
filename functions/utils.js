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

export const buildFluxogramArray = (rows, indexedUniqueTables, indexedUniqueViews) => {
  return rows.map(row => {
    const rowFlux = row.fluxogram.split('|')

    const classificViewsAndTables = rowFlux.map(flux => {
      const entityType = flux.split(':')[0]
      const entityName = flux.split(':')[1]

      const entityTableIndex = indexedUniqueTables.find(table => table.table_name === (entityType === 'table' ? entityName : null))
      const entityViewIndex = indexedUniqueViews.find(view => view.view_name === (entityType === 'view' ? entityName : null))

      const refurbTableIndex = entityTableIndex ? entityTableIndex.entity_index : null
      const refurbViewIndex = entityViewIndex ? entityViewIndex.entity_index : null

      const targetTable = indexedUniqueTables.find(table => table.table_name === entityName)
      const refurbTargetTable = targetTable ? targetTable.table_name : null

      return {
        entity_name: entityName,
        entity_type: entityType,
        entity_index: entityType === 'table' ? refurbTableIndex : refurbViewIndex,
        target_table: refurbTargetTable
      }
    })

    return classificViewsAndTables
  })
}

export const fluxogramToString = (fluxogramArray) => {
  return fluxogramArray.map(flux => {
    const fluxArrayString = flux.map(f => {
      // return `${f.entity_index === null ? 'A' : f.entity_index}[(${f.entity_name})]`
      return `${f.entity_index === null ? 'A' : f.entity_index}${f.entity_type === 'table' ? `[(${f.entity_name})]` : `([${f.entity_name}])`}`
    })
    return fluxArrayString.join(' --> ')
  })
}

export const writeFluxogramFile = (filePath, content) => {
  fs.writeFile(filePath, content, 'utf8', (err) => {
    if (err) {
      console.error('Erro ao escrever o arquivo:', err);
    } else {
      console.log('Arquivo diagram criado com sucesso!');
    }
  });
}