import fs from 'fs'
import fastcsv from 'fast-csv'
import { readCSV, createPNG, gerarImagem } from './functions/readCSV.js'

const main = async () => {

  let rows = []
  try {
    rows = await readCSV('fluxogram_natura_produto.csv')
  } catch (error) {
    console.error('Erro ao ler CSV:', error);
  }

  const classificateUniqueTables = rows.map((row, index) => {
    return {
      table_name: row.table,
      table_view: row.view,
      entity_table_index: `T${index}`,
      entity_view_index: `V${index}`
    }
  })

  const fluxogramArray = rows.map(row => {
    const rowFlux = row.fluxogram.split('|')

    const classificViewsAndTables = rowFlux.map(flux => {
      const entityType = flux.split(':')[0]
      const entityName = flux.split(':')[1]
      const entityTableIndex = classificateUniqueTables.find(table => table.table_name === entityName)
      const entityViewIndex = classificateUniqueTables.find(table => table.table_view === entityName)
      const refurbTableIndex = entityTableIndex ? entityTableIndex.entity_table_index : null
      const refurbViewIndex = entityViewIndex ? entityViewIndex.entity_view_index : null
      const targetTable = classificateUniqueTables.find(table => table.table_name === entityName)
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

  const joinFlux = fluxogramArray.map(flux => {
    const fluxArrayString = flux.map(f => {
      // return `${f.entity_index === null ? 'A' : f.entity_index}[(${f.entity_name})]`
      return `${f.entity_index === null ? 'A' : f.entity_index}${f.entity_type === 'table' ? `[(${f.entity_name})]` : `([${f.entity_name}])`}`
    })

    return fluxArrayString.join(' --> ')
  })

  const joinFluxograms = joinFlux.join(';\n')

  const mermaidContentToVscode = ` 
\`\`\`mermaid
    flowchart TB;
    ${joinFluxograms};\n
\`\`\`
`
  const mermaidContentToPNG = ` 
  %%{ init: { "flowchart": { "nodeSpacing": 50, "rankSpacing": 300 } } }%%
    flowchart TB;
    ${joinFluxograms}\n
`
  fs.writeFile('diagram_VS_CODE', mermaidContentToVscode, 'utf8', (err) => {
    if (err) {
      console.error('Erro ao escrever o arquivo:', err);
    } else {
      console.log('Arquivo diagram criado com sucesso!');
    }
  });

  fs.writeFile('diagram_to_png', mermaidContentToPNG, 'utf8', (err) => {
    if (err) {
      console.error('Erro ao escrever o arquivo:', err);
    } else {
      console.log('Arquivo diagram criado com sucesso!');
    }
  });

  await createPNG('diagram_to_png', './diagrams/diagram.png')
  await gerarImagem(mermaidContentToPNG)

}

main()