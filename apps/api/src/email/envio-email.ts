export type MensagemEmail = {
  para: string;
  assunto: string;
  corpo: string;
};

export abstract class EnvioEmail {
  abstract enviar(mensagem: MensagemEmail): Promise<void>;
}

export class ConsoleEnvioEmail extends EnvioEmail {
  async enviar(mensagem: MensagemEmail): Promise<void> {
    process.stdout.write(
      JSON.stringify({
        canal: 'email.console',
        para: mensagem.para,
        assunto: mensagem.assunto
      }) + '\n'
    );
  }
}

export class MemoriaEnvioEmail extends EnvioEmail {
  readonly enviados: MensagemEmail[] = [];

  async enviar(mensagem: MensagemEmail): Promise<void> {
    this.enviados.push(mensagem);
  }
}
