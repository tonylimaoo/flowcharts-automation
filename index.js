import { readCSV, gerarImagem, buildFluxogramArray, fluxogramToString, writeFluxogramFile } from './functions/utils.js'

const main = async () => {

  let rows = []
  try {
    rows = await readCSV('fluxogram.csv') // put the csv file on the root folder and change the file path here
  } catch (error) {
    console.error('Erro ao ler CSV:', error);
  }

  const uniqueTables = Array.from(new Set(rows.map(row => row.table)))
  const uniqueViews = Array.from(new Set(rows.map(row => row.view)))
  // const indexedUniqueTables = rows.map((row, index) => {
  const indexedUniqueTables = uniqueTables.map((table_name, index) => {
    return {
      table_name: table_name,
      entity_index: `T${index}`,
    }
  })

  const indexedUniqueViews = uniqueViews.map((view_name, index) => {
    return {
      view_name: view_name,
      entity_index: `V${index}`,
    }
  })

  const fluxogramArray = buildFluxogramArray(rows, indexedUniqueTables, indexedUniqueViews)

  const joinFlux = fluxogramToString(fluxogramArray)

  const joinFluxograms = joinFlux.join(';\n')

  const mermaidContentToVscode = ` 
  \`\`\`mermaid
  %%{ init: { "flowchart": { "nodeSpacing": 50, "rankSpacing": 300 } } }%%
    flowchart TB;
    ${joinFluxograms};\n
  \`\`\`
  ` 
  const mermaidContentToPNG = ` 
  %%{ init: { "flowchart": { "nodeSpacing": 50, "rankSpacing": 300 } } }%%
    flowchart TB;
    ${joinFluxograms}\n
  `

  writeFluxogramFile('diagrams_md/diagram_VS_CODE.md', mermaidContentToVscode)
  writeFluxogramFile('diagrams_md/diagram_to_png', mermaidContentToPNG)

  await gerarImagem(mermaidContentToPNG)

}

main()