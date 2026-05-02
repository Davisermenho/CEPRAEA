export const SCOUT_SETS = ['1º SET', '2º SET', 'GOLDEN GOL', 'SHOOT OUT'] as const

export const SCOUT_CONTROLE_JOGO = [
  'BOLA AO ALTO - INÍCIO',
  'PEDIDO DE TEMPO TÉCNICO',
  'RETORNO DO TEMPO TÉCNICO',
  'GOLDEN GOL',
  'FIM DO SET',
  'FIM DO JOGO',
  'SHOOT OUT',
] as const

export const SCOUT_EQUIPES = [
  'CEPRAEA',
  'ADM Maricá',
  'Campinas 360',
  'Niterói Rugby',
  'NR Beach',
  'Rio Handbeach',
  'IDEC',
  'América FC/ADHFT',
  'MHB — Milka Handbeach',
  'Buds Handbeach',
  'APCEF',
] as const

export const SCOUT_POSSE = ['CEPRAEA', 'Adversário'] as const

export const SCOUT_FASE_JOGO = [
  'Ataque posicionado',
  'Defesa posicionada',
  'Transição ofensiva direta',
  'Transição ofensiva indireta',
  'Transição defensiva direta',
  'Transição defensiva indireta',
  'Shoot-out',
  'Controle de jogo',
] as const

export const SCOUT_SISTEMAS_ATAQUE_POSICIONADO = [
  'Ataque 3:1 ESP central + pivô destra',
  'Ataque 3:1 ESP central + pivô canhota',
  'Ataque 3:1 ESP lat direita canhota',
  'Ataque 3:1 ESP lat direita destra',
  'Ataque 4:0 ESP lat esquerda',
  'Ataque 4:0 ESP lat direita destra',
  'Ataque 4:0 ESP lat direita canhota',
  'Ataque 4:0 ESP central esquerda',
  'Ataque 4:0 ESP central direita canhota',
  'Ataque 4:0 ESP central direita destra',
] as const

export const SCOUT_SISTEMAS_DEFESA_POSICIONADA = [
  'Defesa 3x0',
  'Defesa 2x1',
  'Defesa 0x3',
  'Defesa 1x2',
  'Defesa individual',
  'Defesa mista',
  'Defesa API / Base / Solta',
] as const

export const SCOUT_SISTEMAS_TRANSICAO_OFENSIVA_DIRETA = [
  'Transição ofensiva direta 1x0 lat esquerda',
  'Transição ofensiva direta 1x0 lat esquerda + central',
  'Transição ofensiva direta 1x0 lat esquerda + central + pivô + lat direita',
  'Transição ofensiva direta 2x1 lat direita',
  'Transição ofensiva direta 2x1 lat direita + central',
  'Transição ofensiva direta 2x1 lat esquerda',
] as const

export const SCOUT_SISTEMAS_TRANSICAO_OFENSIVA_INDIRETA = [
  'Transição ofensiva indireta 3:1 ESP central',
  'Transição ofensiva indireta 3:1 ESP lat esquerda',
  'Transição ofensiva indireta 3:1 ESP lat direita',
  'Transição ofensiva indireta 4:0 ESP lat esquerda',
  'Transição ofensiva indireta 4:0 ESP lat direita',
  'Transição ofensiva indireta 4:0 ESP central esquerda',
  'Transição ofensiva indireta 4:0 ESP central direita',
] as const

export const SCOUT_SISTEMAS_TRANSICAO_DEFENSIVA_DIRETA = [
  'Transição defensiva direta 2x1',
  'Transição defensiva direta 3x0 - 1ª Base',
  'Transição defensiva direta 3x0 - 1ª Solta',
  'Transição defensiva direta 3x0 - 1ª API',
  'Transição defensiva direta 3x0',
  'Transição defensiva direta 0x3',
  'Transição defensiva direta individual alta',
] as const

export const SCOUT_SISTEMAS_TRANSICAO_DEFENSIVA_INDIRETA = [
  'Transição defensiva indireta 2x1',
  'Transição defensiva indireta 3x0',
] as const

export const SCOUT_SISTEMAS_SHOOTOUT = ['Shoot-out ofensivo', 'Shoot-out defensivo'] as const

export const SCOUT_SISTEMAS = [
  ...SCOUT_SISTEMAS_ATAQUE_POSICIONADO,
  ...SCOUT_SISTEMAS_DEFESA_POSICIONADA,
  ...SCOUT_SISTEMAS_TRANSICAO_OFENSIVA_DIRETA,
  ...SCOUT_SISTEMAS_TRANSICAO_OFENSIVA_INDIRETA,
  ...SCOUT_SISTEMAS_TRANSICAO_DEFENSIVA_DIRETA,
  ...SCOUT_SISTEMAS_TRANSICAO_DEFENSIVA_INDIRETA,
  ...SCOUT_SISTEMAS_SHOOTOUT,
] as const

export function getSistemasPorFase(fase?: string): readonly string[] {
  switch (fase) {
    case 'Ataque posicionado': return SCOUT_SISTEMAS_ATAQUE_POSICIONADO
    case 'Defesa posicionada': return SCOUT_SISTEMAS_DEFESA_POSICIONADA
    case 'Transição ofensiva direta': return SCOUT_SISTEMAS_TRANSICAO_OFENSIVA_DIRETA
    case 'Transição ofensiva indireta': return SCOUT_SISTEMAS_TRANSICAO_OFENSIVA_INDIRETA
    case 'Transição defensiva direta': return SCOUT_SISTEMAS_TRANSICAO_DEFENSIVA_DIRETA
    case 'Transição defensiva indireta': return SCOUT_SISTEMAS_TRANSICAO_DEFENSIVA_INDIRETA
    case 'Shoot-out': return SCOUT_SISTEMAS_SHOOTOUT
    default: return SCOUT_SISTEMAS
  }
}

export const SCOUT_ZONA_ACAO = [
  'Lateral esquerda',
  'Central esquerda',
  'Centro',
  'Central direita',
  'Lateral direita',
  'Área / pivô',
  'Lado da troca',
  'Lado oposto da troca',
  'Transição',
  'Shoot-out',
  'Não se aplica',
] as const

export const SCOUT_LADO_ACAO = SCOUT_ZONA_ACAO

export const SCOUT_ATLETAS = [
  'Aline Mello',
  'Roberta Hernandez',
  'Carolina Peixinho',
  'Gabriela Peixinho',
  'Aline Kécia',
  'Bruna Xavier',
  'Beatriz Correia',
  'Fernanda Campbell',
  'Marleide Nunes',
  'Rafaela Dillmann',
  'Taís Almeida',
  'Carolina Bezerra',
  'Paola Wolff',
] as const

export const SCOUT_GOLEIRAS = ['Carolina Bezerra', 'Paola Wolff'] as const

export const SCOUT_FUNCOES_ATAQUE = [
  'Central',
  'Central Especialista',
  'Central Playmaker Esq',
  'Central Playmaker Dir',
  'Lateral esquerda',
  'Lateral direita',
  'Lateral Esquerda Especialista',
  'Lateral Direita Especialista',
  'Pivô',
  'Especialista',
  'Coringa',
  'Goleira passadora',
  'Shoot-out - Passadora',
  'Shoot-out - Cobradora',
] as const

export const SCOUT_FUNCOES_DEFESA = [
  'Base',
  'Solta',
  'API / Atrás da Pivô',
  'Avançada',
  'Goleira',
] as const

export const SCOUT_CATEGORIAS = [
  '1 - Ação técnica assertiva',
  '2 - Erro técnico',
  '3 - Assistência / ação que gera finalização',
  '4 - Erro de decisão',
  '5 - Recuperação / ação defensiva positiva',
  '6 - Falta / infração / ação irregular',
  '7 - Boa tomada de decisão',
  '8 - Passe de apoio',
  '9 - Desmarque',
] as const

export type ScoutActionOption = {
  label: string
  categoria: typeof SCOUT_CATEGORIAS[number]
  tags?: string[]
}

const acao = (label: string, categoria: typeof SCOUT_CATEGORIAS[number], tags: string[] = []): ScoutActionOption => ({ label, categoria, tags })

export const SCOUT_ACOES_LATERAL = [
  acao('Recepção segura na lateral', '1 - Ação técnica assertiva'),
  acao('Giro convertido', '1 - Ação técnica assertiva', ['finalizacao', 'giro']),
  acao('Aérea convertida', '1 - Ação técnica assertiva', ['finalizacao', 'aerea']),
  acao('Arremesso simples', '1 - Ação técnica assertiva', ['finalizacao']),
  acao('Arremesso em giro', '1 - Ação técnica assertiva', ['finalizacao', 'giro']),
  acao('Arremesso em aérea', '1 - Ação técnica assertiva', ['finalizacao', 'aerea']),
  acao('Passe para pivô', '8 - Passe de apoio'),
  acao('Passe para central', '8 - Passe de apoio'),
  acao('Passe para especialista', '8 - Passe de apoio'),
  acao('Fixou Solta', '7 - Boa tomada de decisão'),
  acao('Fixou Base', '7 - Boa tomada de decisão'),
  acao('Assistência para pivô', '3 - Assistência / ação que gera finalização'),
  acao('Assistência para central', '3 - Assistência / ação que gera finalização'),
  acao('Finalização para fora', '2 - Erro técnico', ['finalizacao']),
  acao('Finalização bloqueada', '2 - Erro técnico', ['finalizacao']),
  acao('Erro de recepção', '2 - Erro técnico'),
  acao('Erro de tempo no giro', '2 - Erro técnico'),
  acao('Erro de tempo na aérea', '2 - Erro técnico'),
  acao('Pisou na área', '6 - Falta / infração / ação irregular'),
  acao('Perda de bola', '2 - Erro técnico'),
  acao('Forçou finalização marcada', '4 - Erro de decisão', ['finalizacao']),
] as const

export const SCOUT_ACOES_PIVO = [
  acao('Recepção próxima à área', '1 - Ação técnica assertiva'),
  acao('Recepção aérea', '1 - Ação técnica assertiva'),
  acao('Giro convertido', '1 - Ação técnica assertiva', ['finalizacao', 'giro']),
  acao('Aérea convertida', '1 - Ação técnica assertiva', ['finalizacao', 'aerea']),
  acao('Arremesso em giro', '1 - Ação técnica assertiva', ['finalizacao', 'giro']),
  acao('Arremesso em aérea', '1 - Ação técnica assertiva', ['finalizacao', 'aerea']),
  acao('Fixou API', '7 - Boa tomada de decisão'),
  acao('Fixou Base', '7 - Boa tomada de decisão'),
  acao('Desmarque curto', '9 - Desmarque'),
  acao('Bloqueio ofensivo legal', '1 - Ação técnica assertiva'),
  acao('Passe de apoio', '8 - Passe de apoio'),
  acao('Erro de recepção', '2 - Erro técnico'),
  acao('Erro de tempo no giro', '2 - Erro técnico'),
  acao('Erro de tempo na aérea', '2 - Erro técnico'),
  acao('Girou contra bloqueio duplo', '4 - Erro de decisão', ['finalizacao']),
  acao('Pisou na área', '6 - Falta / infração / ação irregular'),
  acao('Falta de ataque', '6 - Falta / infração / ação irregular'),
] as const

export const SCOUT_ACOES_CENTRAL = [
  acao('Organização do ataque', '1 - Ação técnica assertiva'),
  acao('Passe para lateral esquerda', '8 - Passe de apoio'),
  acao('Passe para lateral direita', '8 - Passe de apoio'),
  acao('Passe para pivô', '8 - Passe de apoio'),
  acao('Passe longo para lado oposto', '8 - Passe de apoio'),
  acao('Controle de ritmo', '7 - Boa tomada de decisão'),
  acao('Chamada do sistema', '7 - Boa tomada de decisão'),
  acao('Fixou Base', '7 - Boa tomada de decisão'),
  acao('Fixou Solta', '7 - Boa tomada de decisão'),
  acao('Assistência para lateral esquerda', '3 - Assistência / ação que gera finalização'),
  acao('Assistência para lateral direita', '3 - Assistência / ação que gera finalização'),
  acao('Assistência para pivô', '3 - Assistência / ação que gera finalização'),
  acao('Passe errado', '2 - Erro técnico'),
  acao('Passe interceptado', '2 - Erro técnico'),
  acao('Erro de leitura', '4 - Erro de decisão'),
  acao('Forçou passe sem linha', '4 - Erro de decisão'),
  acao('Prendeu bola e atrasou ataque', '4 - Erro de decisão'),
] as const

export const SCOUT_ACOES_ESPECIALISTA_CENTRAL_OPCOES = [
  acao('Passe de central do chão para giro da lateral esquerda', '3 - Assistência / ação que gera finalização'),
  acao('Passe de central saltando para giro da lateral esquerda', '3 - Assistência / ação que gera finalização'),
  acao('Passe de central do chão após finta de passe para giro da lateral esquerda', '3 - Assistência / ação que gera finalização'),
  acao('Passe de central saltando para aérea da lateral esquerda', '3 - Assistência / ação que gera finalização'),
  acao('Passe de central do chão para giro da lateral direita', '3 - Assistência / ação que gera finalização'),
  acao('Passe de central saltando para giro da lateral direita', '3 - Assistência / ação que gera finalização'),
  acao('Passe de central do chão após finta de passe para giro da lateral direita', '3 - Assistência / ação que gera finalização'),
  acao('Passe de central saltando para aérea da lateral direita', '3 - Assistência / ação que gera finalização'),
  acao('Passe de central sem olhar para lateral esquerda', '8 - Passe de apoio'),
  acao('Passe de central sem olhar para lateral direita', '8 - Passe de apoio'),
  acao('Passe de central sem olhar para pivô', '8 - Passe de apoio'),
  acao('Passe de central para aérea da pivô', '3 - Assistência / ação que gera finalização'),
  acao('Passe de central para giro da pivô', '3 - Assistência / ação que gera finalização'),
  acao('Passe de central após fixar a Base', '7 - Boa tomada de decisão'),
  acao('Passe de central após atrair a Solta', '7 - Boa tomada de decisão'),
  acao('Passe de central após deslocar a API', '7 - Boa tomada de decisão'),
  acao('Finta de passe e passe para aérea', '3 - Assistência / ação que gera finalização'),
  acao('Finta de passe e passe para giro', '3 - Assistência / ação que gera finalização'),
  acao('Finta de arremesso e passe para pivô', '3 - Assistência / ação que gera finalização'),
  acao('Finta de arremesso e passe para lateral', '3 - Assistência / ação que gera finalização'),
  acao('Passe que quebra a defesa 3x0', '7 - Boa tomada de decisão'),
  acao('Passe que quebra a defesa 2x1', '7 - Boa tomada de decisão'),
  acao('Erro de tempo no passe para giro', '2 - Erro técnico'),
  acao('Erro de tempo no passe para aérea', '2 - Erro técnico'),
  acao('Erro de leitura da defesa', '4 - Erro de decisão'),
  acao('Erro de decisão após finta', '4 - Erro de decisão'),
] as const

export const SCOUT_ACOES_GOLEIRA_PASSADORA = [
  acao('Passe de saída correto', '1 - Ação técnica assertiva'),
  acao('Passe longo para transição', '1 - Ação técnica assertiva'),
  acao('Lançamento para shoot-out no tempo correto', '1 - Ação técnica assertiva'),
  acao('Reposição rápida', '1 - Ação técnica assertiva'),
  acao('Gol de goleira', '1 - Ação técnica assertiva', ['finalizacao']),
  acao('Passe errado na saída', '2 - Erro técnico'),
  acao('Lançamento atrasado', '2 - Erro técnico'),
  acao('Lançamento adiantado', '2 - Erro técnico'),
  acao('Erro de substituição', '6 - Falta / infração / ação irregular'),
] as const

export const SCOUT_ACOES_BASE = [
  acao('Fechamento do centro', '1 - Ação técnica assertiva'),
  acao('Comunicação defensiva', '1 - Ação técnica assertiva'),
  acao('Cobertura da Solta', '1 - Ação técnica assertiva'),
  acao('Cobertura da API', '1 - Ação técnica assertiva'),
  acao('Troca de marcação', '1 - Ação técnica assertiva'),
  acao('Bloqueio de arremesso', '5 - Recuperação / ação defensiva positiva'),
  acao('Bloqueio após giro', '5 - Recuperação / ação defensiva positiva'),
  acao('Bloqueio duplo', '5 - Recuperação / ação defensiva positiva'),
  acao('Recuperação defensiva', '5 - Recuperação / ação defensiva positiva'),
  acao('Saiu do centro sem cobertura', '4 - Erro de decisão'),
  acao('Perdeu pivô', '4 - Erro de decisão'),
  acao('Perdeu especialista', '4 - Erro de decisão'),
  acao('Chegou atrasada no bloqueio', '2 - Erro técnico'),
  acao('Contato ilegal', '6 - Falta / infração / ação irregular'),
  acao('Tiro de 6m cometido', '6 - Falta / infração / ação irregular'),
] as const

export const SCOUT_ACOES_SOLTA = [
  acao('Pressão na primeira linha', '1 - Ação técnica assertiva'),
  acao('Dissuasão na lateral', '1 - Ação técnica assertiva'),
  acao('Dissuasão na central', '1 - Ação técnica assertiva'),
  acao('Antecipação de passe', '5 - Recuperação / ação defensiva positiva'),
  acao('Interceptação de passe', '5 - Recuperação / ação defensiva positiva'),
  acao('Recuo no tempo correto', '1 - Ação técnica assertiva'),
  acao('Subida no tempo correto', '1 - Ação técnica assertiva'),
  acao('Indução ao passe longo', '7 - Boa tomada de decisão'),
  acao('Retorno defensivo', '1 - Ação técnica assertiva'),
  acao('Subiu fora do tempo', '2 - Erro técnico'),
  acao('Pressionou sem cobertura', '4 - Erro de decisão'),
  acao('Foi batida na primeira pressão', '2 - Erro técnico'),
  acao('Não retornou após pressão', '2 - Erro técnico'),
] as const

export const SCOUT_ACOES_API = [
  acao('Acompanhamento da pivô', '1 - Ação técnica assertiva'),
  acao('Fechamento da linha de passe para pivô', '1 - Ação técnica assertiva'),
  acao('Defesa do passe aéreo para pivô', '1 - Ação técnica assertiva'),
  acao('Falsa liberdade bem executada', '7 - Boa tomada de decisão'),
  acao('Bloqueio do giro da pivô', '5 - Recuperação / ação defensiva positiva'),
  acao('Proteção contra aérea', '1 - Ação técnica assertiva'),
  acao('Dividiu pivô e lateral', '1 - Ação técnica assertiva'),
  acao('Perdeu pivô', '4 - Erro de decisão'),
  acao('Deu liberdade real para finalização', '4 - Erro de decisão'),
  acao('Errou tempo da falsa liberdade', '2 - Erro técnico'),
  acao('Contato ilegal na pivô', '6 - Falta / infração / ação irregular'),
] as const

export const SCOUT_ACOES_GOLEIRA_DEFENSIVA = [
  acao('Defesa de arremesso de 1 ponto', '5 - Recuperação / ação defensiva positiva'),
  acao('Defesa de arremesso de 2 pontos', '5 - Recuperação / ação defensiva positiva'),
  acao('Defesa de giro', '5 - Recuperação / ação defensiva positiva'),
  acao('Defesa de aérea', '5 - Recuperação / ação defensiva positiva'),
  acao('Fechou ângulo', '1 - Ação técnica assertiva'),
  acao('Defesa no shoot-out', '5 - Recuperação / ação defensiva positiva'),
  acao('Erro de posicionamento', '2 - Erro técnico'),
  acao('Caiu antes da decisão', '4 - Erro de decisão'),
] as const

export const SCOUT_ACOES_ATAQUE_OPCOES = [
  ...SCOUT_ACOES_LATERAL,
  ...SCOUT_ACOES_PIVO,
  ...SCOUT_ACOES_CENTRAL,
  ...SCOUT_ACOES_ESPECIALISTA_CENTRAL_OPCOES,
  ...SCOUT_ACOES_GOLEIRA_PASSADORA,
] as const

export const SCOUT_ACOES_DEFESA_OPCOES = [
  ...SCOUT_ACOES_BASE,
  ...SCOUT_ACOES_SOLTA,
  ...SCOUT_ACOES_API,
  ...SCOUT_ACOES_GOLEIRA_DEFENSIVA,
] as const

export const SCOUT_ACOES_ATAQUE = SCOUT_ACOES_ATAQUE_OPCOES.map((item) => item.label)
export const SCOUT_ACOES_DEFESA = SCOUT_ACOES_DEFESA_OPCOES.map((item) => item.label)
export const SCOUT_ACOES_ESPECIALISTA_CENTRAL = SCOUT_ACOES_ESPECIALISTA_CENTRAL_OPCOES.map((item) => item.label)
export const SCOUT_ACOES_GOLEIRA = SCOUT_ACOES_GOLEIRA_DEFENSIVA.map((item) => item.label)

export const SCOUT_REPOSICAO = [
  'Troca lado direito',
  'Troca lado esquerdo',
  'Entrada da especialista',
  'Saída da goleira',
  'Entrada defensiva',
  'Saída defensiva',
  'Reposição rápida',
  'Reposição lenta',
  'Reposição direta',
  'Reposição indireta',
  'Erro de substituição',
  'Atraso na troca',
  'Entrada correta da especialista',
] as const

export const SCOUT_RESULTADO_COLETIVO = [
  'Gol 1 ponto',
  'Gol 2 pontos',
  'Gol de giro 2 pontos',
  'Gol de aérea 2 pontos',
  'Gol de giro 1 ponto — erro técnico',
  'Gol de aérea 1 ponto — erro técnico',
  'Giro sem validade de 2 pontos',
  'Aérea sem validade de 2 pontos',
  'Giro bloqueado',
  'Aérea bloqueada',
  'Giro para fora',
  'Aérea para fora',
  'Gol sofrido 1 ponto',
  'Gol sofrido 2 pontos',
  'Defesa da goleira',
  'Finalização para fora',
  'Finalização bloqueada',
  'Perda de bola',
  'Recuperação de bola',
  'Falta de ataque',
  'Falta defensiva',
  'Tiro de 6m a favor',
  'Tiro de 6m contra',
  'Exclusão a favor',
  'Exclusão contra',
  'Shoot-out convertido',
  'Shoot-out perdido',
  'Erro de substituição',
  'Sem finalização',
  'Revisar',
] as const

export const SCOUT_RESULTADO_INDIVIDUAL = [
  'Acerto',
  'Erro técnico',
  'Assistência',
  'Erro de decisão',
  'Recuperação defensiva',
  'Infração',
  'Neutro',
  'Revisar',
] as const

export const SCOUT_ANALISE = ['Positiva', 'Neutra', 'Negativa', 'Revisar'] as const

export const SCOUT_ORIGEM_BOLA_ESPECIALISTA = [
  'Bola vindo da lateral esquerda',
  'Bola vindo da lateral direita',
  'Bola vindo da pivô',
  'Bola vindo da goleira',
  'Bola vindo da central',
  'Bola vindo de recuperação',
  'Bola vindo de reposição',
  'Bola sem mexida prévia',
  'Bola após circulação completa',
  'Bola após circulação parcial',
] as const

export const SCOUT_MEXIDA_INICIAL = [
  'Sem mexida',
  'Mexida rápida',
  'Mexida lenta',
  'Mexida alternada',
  'Mexida de mão em mão',
  'Circulação completa',
  'Circulação parcial',
] as const

export const SCOUT_COMPORTAMENTO_DEFESA = [
  'Solta não foi fixada',
  'Solta foi fixada pela lateral direita',
  'Solta foi fixada pela lateral esquerda',
  'Solta subiu na central',
  'Solta fechou linha de passe',
  'Base permaneceu no centro',
  'Base saiu para pivô',
  'Base saiu para especialista',
  'API permaneceu na pivô',
  'API dividiu pivô e lateral',
  'API saiu para lateral',
  'Defesa deslocou para direita',
  'Defesa deslocou para esquerda',
  'Defesa não deslocou',
  'Defesa induziu sobra na lateral direita',
  'Defesa induziu sobra na lateral esquerda',
] as const

export const SCOUT_BOOLEANO_TATICO = ['Sim', 'Não', 'Parcial'] as const

export const SCOUT_MOMENTO_ATAQUE_ESPECIALISTA = [
  'Atacou cedo demais',
  'Atacou no tempo correto',
  'Atacou tarde demais',
  'Atacou sem fixar a Solta',
  'Atacou após fixar a Solta',
  'Atacou sem deslocar Base',
  'Atacou após deslocar Base',
  'Atacou sem deslocar API',
  'Atacou após deslocar API',
  'Atacou com defesa organizada',
  'Atacou com defesa em deslocamento',
  'Atacou com defesa desequilibrada',
] as const

export const SCOUT_RITMO_ESPECIALISTA = [
  'Ritmo constante',
  'Acelerou',
  'Desacelerou',
  'Quebra de ritmo',
  'Atacou após pausa',
  'Aproximação lenta e aceleração',
  'Postura pouco ofensiva e ataque rápido',
  'Postura agressiva e passe',
  'Simulou ataque e passou',
  'Chamou atenção e distribuiu',
] as const

export const SCOUT_PREVISIBILIDADE_ESPECIALISTA = [
  'Previsível',
  'Parcialmente previsível',
  'Imprevisível',
  'Defesa antecipou a ação',
  'Defesa não antecipou',
  'Defesa mordeu a finta',
  'Defesa esperou e controlou',
  'Especialista repetiu padrão anterior',
  'Especialista quebrou padrão anterior',
  'Especialista variou tempo de ataque',
] as const

export const SCOUT_DECISAO_FINAL_ESPECIALISTA = [
  'Finalizou em giro',
  'Finalizou em aérea',
  'Finalizou simples',
  'Passou para lateral esquerda',
  'Passou para lateral direita',
  'Passou para pivô',
  'Deu assistência para gol de 2 pontos',
  'Gerou tiro de 6m',
  'Fixou a Solta e passou',
  'Fixou a Base e passou',
  'Fixou a API e passou',
  'Forçou finalização marcada',
  'Forçou passe sem linha',
  'Perdeu bola',
  'Errou tempo de passe',
  'Errou leitura da defesa',
] as const

export const SCOUT_TIPO_FINALIZACAO = [
  'Arremesso simples',
  'Giro',
  'Aérea',
  'Ponte aérea',
  '360',
  'Arremesso da especialista',
  'Arremesso da goleira',
  'Shoot-out',
  'Tiro de 6m',
  'Não se aplica',
] as const

export const SCOUT_DIRECAO_GOL = [
  'Alto direito',
  'Alto esquerdo',
  'Baixo direito',
  'Baixo esquerdo',
  'Centro',
  'Entre as pernas',
  'Por cobertura',
  'Fora',
  'Trave',
] as const

export const SCOUT_PONTOS_LANCE = ['0', '1', '2'] as const
export const SCOUT_PONTUACAO = ['0 ponto', '1 ponto', '2 pontos'] as const
export const SCOUT_VALIDADE_TECNICA = ['Válida', 'Erro técnico', 'Revisar'] as const

export const SCOUT_SHOOTOUT_OFENSIVO = [
  'Lançamento direto da goleira para cobradora',
  'Lançamento curto da goleira para cobradora',
  'Lançamento longo da goleira para cobradora',
  'Lançamento alto para recepção aérea',
  'Lançamento baixo para recepção em velocidade',
  'Passe da goleira no tempo correto',
  'Passe da goleira atrasado',
  'Passe da goleira adiantado',
  'Passe da goleira interceptado',
  'Recepção segura da cobradora',
  'Erro de recepção da cobradora',
  'Finta curta na goleira',
  'Finta longa na goleira',
  'Finta de corpo',
  'Finta de arremesso',
  'Giro no shoot-out',
  'Aérea no shoot-out',
  'Finalização direta',
  'Finalização em giro',
  'Finalização em aérea',
  'Finalização por cobertura',
  'Shoot-out convertido',
  'Shoot-out perdido',
] as const

export const SCOUT_SHOOTOUT_DEFENSIVO = [
  'Goleira leu o lançamento',
  'Goleira saiu no tempo correto',
  'Goleira antecipou demais',
  'Goleira atrasou a saída',
  'Goleira fechou o ângulo',
  'Goleira abriu o ângulo',
  'Goleira induziu a finalização',
  'Goleira defendeu finalização direta',
  'Goleira defendeu giro',
  'Goleira defendeu aérea',
  'Goleira forçou finalização para fora',
  'Goleira tocou na bola',
  'Goleira cometeu tiro de 6m',
  'Goleira caiu antes da decisão',
  'Goleira esperou bem a cobradora',
  'Defesa venceu o shoot-out',
  'Defesa perdeu o shoot-out',
] as const

export function getActionOptionsByFuncao(funcao?: string, tipo?: 'ataque' | 'defesa'): readonly ScoutActionOption[] {
  if (tipo === 'defesa') {
    if (funcao === 'Base') return SCOUT_ACOES_BASE
    if (funcao === 'Solta') return SCOUT_ACOES_SOLTA
    if (funcao === 'API / Atrás da Pivô') return SCOUT_ACOES_API
    if (funcao === 'Goleira') return SCOUT_ACOES_GOLEIRA_DEFENSIVA
    return SCOUT_ACOES_DEFESA_OPCOES
  }

  if (funcao === 'Central Especialista' || funcao === 'Especialista') return SCOUT_ACOES_ESPECIALISTA_CENTRAL_OPCOES
  if (funcao === 'Central' || funcao?.includes('Playmaker')) return SCOUT_ACOES_CENTRAL
  if (funcao === 'Pivô') return SCOUT_ACOES_PIVO
  if (funcao?.includes('Lateral')) return SCOUT_ACOES_LATERAL
  if (funcao === 'Goleira passadora') return SCOUT_ACOES_GOLEIRA_PASSADORA
  return SCOUT_ACOES_ATAQUE_OPCOES
}

export function getAcoesPorFuncao(funcao?: string, tipo?: 'ataque' | 'defesa'): readonly string[] {
  return getActionOptionsByFuncao(funcao, tipo).map((option) => option.label)
}

export function getCategoriaPorAcao(label?: string, funcao?: string, tipo?: 'ataque' | 'defesa'): string | undefined {
  if (!label) return undefined
  return getActionOptionsByFuncao(funcao, tipo).find((option) => option.label === label)?.categoria
}

export function actionIndicatesFinish(label?: string): boolean {
  if (!label) return false
  const action = label.toLowerCase()
  return ['arremesso', 'finalização', 'giro', 'aérea', 'aerea', 'gol de goleira'].some((term) => action.includes(term))
}
