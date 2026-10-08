export const SESSAO_KEY = "estudaai.sessao";

export type Sessao = {
  accessToken: string;
  perfil: "aluno" | "administrador";
  nome: string;
  email: string;
};

export function salvarSessao(sessao: Sessao) {
  sessionStorage.setItem(SESSAO_KEY, JSON.stringify(sessao));
}

export function lerSessao(): Sessao | null {
  const bruto = sessionStorage.getItem(SESSAO_KEY);
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as Sessao;
  } catch {
    return null;
  }
}

export function limparSessao() {
  sessionStorage.removeItem(SESSAO_KEY);
}
