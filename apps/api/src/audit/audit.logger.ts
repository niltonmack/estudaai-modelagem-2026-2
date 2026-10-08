export type EventoAudit =
  | 'auth.cadastro.ok'
  | 'auth.cadastro.email_duplicado'
  | 'auth.login.ok'
  | 'auth.login.falha'
  | 'auth.logout.ok'
  | 'auth.recuperacao.solicitada'
  | 'auth.autorizacao.recusada'
  | 'auth.seed.admin'
  | 'catalogo.categoria.criada'
  | 'catalogo.categoria.alterada'
  | 'catalogo.categoria.removida'
  | 'catalogo.categoria.remocao_recusada'
  | 'catalogo.seed.personalizada'
  | 'catalogo.trilha.criada'
  | 'catalogo.trilha.alterada'
  | 'catalogo.trilha.removida'
  | 'catalogo.trilha.publicada'
  | 'catalogo.trilha.publicacao_recusada'
  | 'catalogo.etapa.criada'
  | 'catalogo.etapa.alterada'
  | 'catalogo.etapa.removida'
  | 'catalogo.etapa.remocao_recusada'
  | 'catalogo.etapa.reordenada'
  | 'catalogo.indisponivel'
  | 'progresso.iniciado'
  | 'progresso.retomado'
  | 'progresso.conclusao.ok'
  | 'llm.interruptor.alterado'
  | 'llm.geracao.ok'
  | 'llm.geracao.recusada'
  | 'llm.geracao.timeout'
  | 'llm.geracao.json_invalido'
  | 'llm.geracao.persistencia_falhou'
  | 'llm.conversa.ok'
  | 'llm.conversa.recusada'
  | 'llm.conversa.timeout'
  | 'usuario.criado'
  | 'usuario.alterado'
  | 'usuario.removido'
  | 'usuario.remocao_recusada'
  | 'usuario.alteracao_recusada'
  | 'acompanhamento.consultado';

export type RegistroAudit = {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  event: EventoAudit;
  outcome: 'ok' | 'recusado' | 'falha';
  email?: string;
  perfil?: 'aluno' | 'administrador' | 'anonimo';
  message: string;
};

export class AuditLogger {
  readonly linhas: RegistroAudit[] = [];

  constructor(
    private readonly escrever: (linha: string) => void = (linha) => process.stdout.write(linha + '\n')
  ) {}

  registrar(parcial: Omit<RegistroAudit, 'timestamp'>): RegistroAudit {
    const registro: RegistroAudit = {
      ...parcial,
      timestamp: new Date().toISOString()
    };
    const serializado = JSON.stringify(registro);
    this.linhas.push(registro);
    this.escrever(serializado);
    return registro;
  }
}
