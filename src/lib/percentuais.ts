export type OpcaoComVotos = { opcaoId: number; texto: string; votos: number };
export type OpcaoPercentual<T extends OpcaoComVotos = OpcaoComVotos> = T & { percentual: number };

export function calcularPercentuais<T extends OpcaoComVotos>(opcoes: T[]): OpcaoPercentual<T>[] {
  const total = opcoes.reduce((soma, opcao) => soma + opcao.votos, 0);
  if (total === 0) return opcoes.map((opcao) => ({ ...opcao, percentual: 0 }));
  const partes = opcoes.map((opcao) => {
    const exato = (opcao.votos / total) * 100;
    return { opcao, base: Math.floor(exato), resto: exato - Math.floor(exato) };
  });
  let faltam = 100 - partes.reduce((soma, parte) => soma + parte.base, 0);
  const ordemResto = [...partes].sort((a, b) => b.resto - a.resto);
  const adicionais = new Map<number, number>();
  for (const parte of ordemResto) {
    if (faltam <= 0) break;
    adicionais.set(parte.opcao.opcaoId, 1);
    faltam -= 1;
  }
  return partes.map(({ opcao, base }) => ({ ...opcao, percentual: base + (adicionais.get(opcao.opcaoId) ?? 0) }));
}

export function obterVencedoras(opcoes: OpcaoPercentual[]): OpcaoPercentual[] {
  const maior = Math.max(0, ...opcoes.map((opcao) => opcao.percentual));
  return maior === 0 ? [] : opcoes.filter((opcao) => opcao.percentual === maior);
}
