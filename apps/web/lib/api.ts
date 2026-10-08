export type ErroApi = { message?: string | string[]; codigo?: string; catalogoIndisponivel?: boolean };

export async function chamarApi<T>(
  caminho: string,
  opcoes: RequestInit & { token?: string } = {}
): Promise<{ ok: boolean; status: number; dados: T }> {
  const { token, headers, ...rest } = opcoes;
  const resposta = await fetch(`/api${caminho}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  });
  const texto = await resposta.text();
  let dados = {} as T;
  if (texto) {
    try {
      dados = JSON.parse(texto) as T;
    } catch {
      dados = { message: texto } as T;
    }
  }
  return { ok: resposta.ok, status: resposta.status, dados };
}

export function mensagemErro(dados: ErroApi, fallback: string) {
  if (Array.isArray(dados.message)) return dados.message.join(" ");
  return dados.message ?? fallback;
}
