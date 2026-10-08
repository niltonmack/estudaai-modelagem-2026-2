export type ConteudoEtapa = {
  corpo: string;
  exercicio: string | null;
  resposta: string | null;
};

function aposTitulo(trecho: string) {
  return trecho.replace(/^##\s+[^\n]+\n+/, "").trim();
}

export function partirConteudo(texto: string): ConteudoEtapa {
  const normal = texto.replace(/\r\n/g, "\n").trim();
  const exercicio = normal.match(/(^|\n)## Exercício\b/);
  if (!exercicio || exercicio.index === undefined) {
    return { corpo: normal, exercicio: null, resposta: null };
  }
  const inicioExercicio = exercicio.index + (exercicio[1] ? exercicio[1].length : 0);
  const antes = normal.slice(0, inicioExercicio).trim();
  const resto = normal.slice(inicioExercicio);
  const resposta = resto.match(/\n## Resposta\b/);
  if (!resposta || resposta.index === undefined) {
    return { corpo: antes, exercicio: aposTitulo(resto), resposta: null };
  }
  return {
    corpo: antes,
    exercicio: aposTitulo(resto.slice(0, resposta.index)),
    resposta: aposTitulo(resto.slice(resposta.index + 1))
  };
}
