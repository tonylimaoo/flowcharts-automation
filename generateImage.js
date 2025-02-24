import { exec } from 'child_process'

const inputFile = 'diagram'
const outputFile = 'diagram.png'
const command = `mmdc -i ${inputFile} -o ${outputFile}`

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao gerar PNG: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Aviso: ${stderr}`);
  }
  console.log(`PNG gerado com sucesso: ${outputFile}`);
});