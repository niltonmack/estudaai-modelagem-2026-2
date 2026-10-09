import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogger } from '../audit/audit.logger';
import { Trilha } from '../catalogo/trilha.entity';
import { Progresso } from '../progresso/progresso.entity';
import { Perfil } from '../usuario/perfil';
import { IndiceIndisponivelError, PORTA_INDICE, PortaIndice } from './porta-indice';

type Ator = { userId: string; email?: string; perfil?: Perfil };

export type ResultadoBusca = {
  trilhaId: string;
  etapaId: string;
  tituloTrilha: string;
  tituloEtapa: string;
  tipo: 'pré-definida' | 'personalizada';
  autorNome: string | null;
  progressoId: string | null;
  trecho: string;
};

@Injectable()
export class BuscaService {
  constructor(
    @Inject(PORTA_INDICE) private readonly porta: PortaIndice,
    @InjectRepository(Trilha) private readonly trilhas: Repository<Trilha>,
    @InjectRepository(Progresso) private readonly progressos: Repository<Progresso>,
    private readonly audit: AuditLogger
  ) {}

  async buscar(texto: string, ator: Ator): Promise<{ resultados: ResultadoBusca[] }> {
    const pergunta = texto.trim();
    if (!pergunta) {
      throw new BadRequestException('Escreva o que você quer estudar.');
    }
    let acertos;
    try {
      if (!this.porta.configurado()) throw new IndiceIndisponivelError();
      acertos = await this.porta.buscar(pergunta, ator.userId);
    } catch {
      this.audit.registrar({
        level: 'error',
        event: 'busca.falha',
        outcome: 'falha',
        email: ator.email,
        perfil: 'aluno',
        message: 'Busca indisponível'
      });
      throw new HttpException(
        {
          message: 'A busca não respondeu. Tente de novo. Suas trilhas não foram alteradas.',
          codigo: 'busca_indisponivel'
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    const resultados: ResultadoBusca[] = [];
    for (const acerto of acertos) {
      const trilha = await this.trilhas.findOne({
        where: { id: acerto.trilha },
        relations: ['etapas', 'autor']
      });
      const etapa = trilha?.etapas?.find((item) => item.id === acerto.aula);
      if (!trilha || !etapa || !this.visivel(trilha, ator.userId)) continue;
      const progresso = await this.progressos.findOne({
        where: { alunoId: ator.userId, trilhaId: trilha.id }
      });
      resultados.push({
        trilhaId: trilha.id,
        etapaId: etapa.id,
        tituloTrilha: trilha.titulo,
        tituloEtapa: etapa.titulo,
        tipo: trilha.tipo,
        autorNome: trilha.autor?.nome ?? null,
        progressoId: progresso?.id ?? null,
        trecho: trechoDe(etapa.conteudo)
      });
      if (resultados.length === 5) break;
    }

    this.audit.registrar({
      level: 'info',
      event: 'busca.ok',
      outcome: 'ok',
      email: ator.email,
      perfil: 'aluno',
      message: `Busca devolveu ${resultados.length} resultados`
    });
    return { resultados };
  }

  private visivel(trilha: Trilha, alunoId: string) {
    if (trilha.disponivel) return true;
    return trilha.tipo === 'personalizada' && trilha.autorId === alunoId;
  }
}

function trechoDe(conteudo: string) {
  const limpo = conteudo.replace(/\s+/g, ' ').trim();
  return limpo.length <= 240 ? limpo : limpo.slice(0, 240);
}
