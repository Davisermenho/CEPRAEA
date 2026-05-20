-- Scout live entries codebook extension
-- Objetivo: expandir o codebook para cobrir a COLETA_AO_VIVO e o
-- vocabulário sugerido de ACAO_PRINCIPAL por fase, sem transformar
-- essas sugestões em enum rígido de banco.

alter table public.scout_code_values
  add column if not exists description text,
  add column if not exists when_to_use text,
  add column if not exists when_not_to_use text;

with list_seed(list_key, label, contract_scope, source_version) as (
  values
    ('LISTA_FASE_EQUIPE', 'Fases da equipe analisada', 'scout_live_entries', 'manual-v1.0.1'),
    ('LISTA_TIPO_FINALIZACAO', 'Tipos de finalizacao', 'scout_live_entries', 'manual-v1.0.1'),
    ('LISTA_STATUS_VALIDACAO', 'Status de validacao', 'scout_live_entries', 'manual-v1.0.1'),
    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'Acoes principais - ataque posicionado', 'scout_live_entries', 'manual-v1.0.1'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'Acoes principais - defesa posicionada', 'scout_live_entries', 'manual-v1.0.1'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'Acoes principais - transicao ofensiva', 'scout_live_entries', 'manual-v1.0.1'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'Acoes principais - transicao defensiva', 'scout_live_entries', 'manual-v1.0.1')
)
insert into public.scout_code_lists (
  list_key,
  label,
  contract_scope,
  active,
  source_version
)
select
  list_key,
  label,
  contract_scope,
  true,
  source_version
from list_seed
on conflict (list_key) do update
set label = excluded.label,
    contract_scope = excluded.contract_scope,
    active = excluded.active,
    source_version = excluded.source_version;

with value_seed(
  list_key,
  code,
  label,
  sort_order,
  is_nao_aplica,
  is_nao_observado,
  description,
  when_to_use,
  when_not_to_use
) as (
  values
    ('LISTA_FASE_EQUIPE', 'ATAQUE', 'Ataque', 1, false, false, 'Equipe analisada em ataque.', 'Quando a equipe observada esta atacando.', 'Nao usar quando a equipe estiver defendendo ou em transicao.'),
    ('LISTA_FASE_EQUIPE', 'DEFESA', 'Defesa', 2, false, false, 'Equipe analisada em defesa.', 'Quando a equipe observada esta defendendo.', 'Nao usar quando a equipe estiver atacando ou em transicao.'),
    ('LISTA_FASE_EQUIPE', 'TRANS_OF', 'Transicao ofensiva', 3, false, false, 'Equipe analisada saindo para atacar.', 'Quando a equipe recupera a posse e acelera antes da estabilizacao.', 'Nao usar quando o ataque ja esta posicionado.'),
    ('LISTA_FASE_EQUIPE', 'TRANS_DEF', 'Transicao defensiva', 4, false, false, 'Equipe analisada retornando para defender.', 'Quando a equipe perde a posse e recompõe defensivamente.', 'Nao usar quando a defesa ja esta posicionada.'),
    ('LISTA_FASE_EQUIPE', 'TROCA', 'Troca', 5, false, false, 'Equipe analisada em troca/substituicao funcional.', 'Quando a acao principal da sequencia envolve troca clara.', 'Nao usar para simples reposicionamento.'),
    ('LISTA_FASE_EQUIPE', 'NAO_OBSERVADO', 'Nao observado', 6, false, true, 'Fase da equipe nao observada com seguranca.', 'Quando a coleta rapida nao permite classificar a fase da equipe.', 'Nao usar para ausencia logica do campo.'),

    ('LISTA_TIPO_FINALIZACAO', 'SIMPLES', 'Arremesso simples', 1, false, false, 'Finalizacao comum de 1 ponto.', 'Quando o desfecho e um arremesso simples.', 'Nao usar para giro, aerea, 6m ou shootout.'),
    ('LISTA_TIPO_FINALIZACAO', 'GIRO', 'Giro', 2, false, false, 'Finalizacao de 2 pontos com giro.', 'Quando a finalizacao principal e um giro.', 'Nao usar para arremesso simples.'),
    ('LISTA_TIPO_FINALIZACAO', 'AEREA', 'Aerea', 3, false, false, 'Finalizacao no ar / in-flight.', 'Quando a jogada termina em aerea.', 'Nao usar para passe alto sem finalizacao no ar.'),
    ('LISTA_TIPO_FINALIZACAO', 'ESPECIALISTA', 'Especialista', 4, false, false, 'Finalizacao executada por especialista.', 'Quando a finalizacao e caracterizada pela entrada da especialista.', 'Nao usar para jogadora comum.'),
    ('LISTA_TIPO_FINALIZACAO', 'GOLEIRA', 'Goleira', 5, false, false, 'Finalizacao da goleira.', 'Quando a goleira conclui a jogada.', 'Nao usar para defesa da goleira.'),
    ('LISTA_TIPO_FINALIZACAO', '6M', '6 metros', 6, false, false, 'Finalizacao de 6 metros.', 'Quando a sequencia termina em 6m.', 'Nao usar para arremesso corrido.'),
    ('LISTA_TIPO_FINALIZACAO', 'SHOOTOUT', 'Shootout', 7, false, false, 'Finalizacao de shootout.', 'Quando a jogada e um shootout.', 'Nao usar para contra-ataque comum.'),
    ('LISTA_TIPO_FINALIZACAO', 'NAO_OBSERVADO', 'Nao observado', 8, false, true, 'Tipo de finalizacao nao observado com seguranca.', 'Quando houve finalizacao, mas o tipo nao foi identificado.', 'Nao usar se nao houve finalizacao.'),

    ('LISTA_STATUS_VALIDACAO', 'PENDENTE', 'Pendente', 1, false, false, 'Entrada ainda nao revisada.', 'Status inicial da coleta ao vivo.', 'Nao usar para dado ja conferido.'),
    ('LISTA_STATUS_VALIDACAO', 'REVISADO', 'Revisado', 2, false, false, 'Entrada revisada, ainda sujeita a ajuste.', 'Quando houve revisao sem validacao final.', 'Nao usar na criacao inicial automatica.'),
    ('LISTA_STATUS_VALIDACAO', 'CORRIGIDO', 'Corrigido', 3, false, false, 'Entrada corrigida apos revisao.', 'Quando a revisao alterou o dado original.', 'Nao usar para entrada intacta.'),
    ('LISTA_STATUS_VALIDACAO', 'VALIDADO', 'Validado', 4, false, false, 'Entrada confirmada como definitiva.', 'Quando a linha passou por validacao final.', 'Nao usar na captura inicial.'),
    ('LISTA_STATUS_VALIDACAO', 'DUVIDA', 'Duvida', 5, false, false, 'Entrada mantida sob incerteza controlada.', 'Quando a revisao nao conseguiu concluir o caso.', 'Nao usar como default da captura.'),

    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'GIRO', 'Giro', 1, false, false, 'Finalizacao de 2 pontos com rotacao corporal.', 'Quando a acao principal for o arremesso de giro.', 'Nao usar para arremesso simples ou aerea.'),
    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'AEREA', 'Aerea / in-flight', 2, false, false, 'Finalizacao recebida e executada no ar.', 'Quando a definicao da jogada for a aerea.', 'Nao usar para passe alto sem finalizacao.'),
    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'ARREM_SIMP', 'Arremesso simples', 3, false, false, 'Finalizacao comum de 1 ponto.', 'Quando a acao principal for um arremesso simples.', 'Nao usar para giro, aerea ou 6m.'),
    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'PASSE_GIRO', 'Passe para giro', 4, false, false, 'Passe que gera a finalizacao de giro.', 'Quando o passe for a acao central da jogada.', 'Nao usar se o proprio arremesso for a acao central.'),
    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'PASSE_AEREA', 'Passe para aerea', 5, false, false, 'Passe que cria a finalizacao aerea.', 'Quando a criacao da aerea vier do passe.', 'Nao usar para passe comum.'),
    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'BOLA_RETORNO', 'Bola de retorno', 6, false, false, 'Devolucao apos atracao defensiva ou inicio de arremesso.', 'Quando a vantagem surge da bola de retorno.', 'Nao usar para passe direto sem retorno.'),
    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'FIXACAO_DEF', 'Fixacao defensiva', 7, false, false, 'Acao ofensiva que prende a defensora.', 'Quando a vantagem nasce da fixacao.', 'Nao usar se a atleta apenas ocupou espaco sem impacto.'),
    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'OCUPA_PIVO_TEMP', 'Ocupacao temporaria de pivo', 8, false, false, 'Jogadora do 4x0 ocupa zona interna de forma temporaria.', 'Quando a queda para a zona interna define a jogada.', 'Nao usar no 3x1 com pivo fixa.'),
    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'QUEBRA_LINHA', 'Quebra / deslocamento', 9, false, false, 'Deslocamento que rompe a organizacao defensiva.', 'Quando o deslocamento cria vantagem clara.', 'Nao usar para movimento sem impacto na jogada.'),
    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'ERRO_PASSE', 'Erro de passe', 10, false, false, 'Passe ofensivo errado.', 'Quando a sequencia termina em erro de passe.', 'Nao usar para erro de recepcao.'),
    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'ERRO_RECEPCAO', 'Erro de recepcao', 11, false, false, 'Falha no dominio ou recepcao da bola.', 'Quando a perda vem da recepcao.', 'Nao usar para passe claramente errado.'),
    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'PERDA_OFENSIVA', 'Perda ofensiva', 12, false, false, 'Perda de posse sem finalizacao.', 'Quando a jogada termina em perda ofensiva.', 'Nao usar quando houve arremesso.'),
    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'PASSIVO_DECISAO', 'Decisao sob passivo', 13, false, false, 'Acao principal tomada sob restricao de passivo.', 'Quando a definicao da jogada vem do passivo.', 'Nao usar se o passivo nao influenciou a decisao.'),
    ('LISTA_ACAO_PRINCIPAL_AT_POS', 'JOGADA_COMBINADA', 'Jogada combinada', 14, false, false, 'Acao ofensiva previamente organizada.', 'Quando a sequencia executa um padrao combinado.', 'Nao usar para acao improvisada.'),

    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'BLOQ_GIRO', 'Bloqueio de giro', 1, false, false, 'Bloqueio contra finalizacao de giro.', 'Quando a defensora contesta o giro.', 'Nao usar para arremesso simples.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'BLOQ_SIMPLES', 'Bloqueio de arremesso simples', 2, false, false, 'Bloqueio contra arremesso comum.', 'Quando a acao principal for bloquear arremesso simples.', 'Nao usar para giro ou aerea.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'COB_AEREA', 'Cobertura de aerea', 3, false, false, 'Acao defensiva para impedir passe ou finalizacao aerea.', 'Quando a defesa reage a ameaca de aerea.', 'Nao usar para marcacao comum.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'COB_PIVO', 'Cobertura da pivo', 4, false, false, 'Cobertura sobre pivo fixa ou zona interna.', 'Quando a acao principal protege a zona de pivo.', 'Nao usar para atacante externa.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'MARC_ESP', 'Marcacao da especialista', 5, false, false, 'Controle direto da especialista adversaria.', 'Quando a acao principal nega a especialista.', 'Nao usar para atleta sem papel de especialista.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'MARC_LAT', 'Marcacao da lateral', 6, false, false, 'Controle da lateral adversaria.', 'Quando a acao principal recai sobre a lateral.', 'Nao usar para pivo ou central.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'DISSUADIR', 'Dissuasao', 7, false, false, 'Acao que retira a melhor opcao da atacante.', 'Quando a defensora impede passe ou arremesso pela presenca ativa.', 'Nao usar quando houve apenas presenca passiva.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'INDIVIDUALIZAR', 'Individualizacao', 8, false, false, 'Marcacao direta para impedir recepcao ou acao.', 'Quando a defensora isola uma atacante.', 'Nao usar para defesa zonal sem referencia individual.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'FECHAR_SETOR', 'Fechamento de setor', 9, false, false, 'Defesa fecha espaco critico do setor.', 'Quando a acao principal e impedir entrada, giro ou aerea por setor.', 'Nao usar para bloqueio pontual.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'PRESS_BOLA', 'Pressao na bola', 10, false, false, 'Pressao direta sobre a portadora da bola.', 'Quando a defensora pressiona a atleta com bola.', 'Nao usar para cobertura sem pressao.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'INTERC', 'Interceptacao', 11, false, false, 'Corte de passe adversario.', 'Quando a defensora intercepta ou quase intercepta um passe.', 'Nao usar para roubo em bola dominada.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'ROUBO', 'Roubo de bola', 12, false, false, 'Recuperacao direta da posse.', 'Quando a defensora retira a bola controlada da adversaria.', 'Nao usar para passe errado sem acao defensiva.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'PROVOCA_FALTA_ATAQUE', 'Provoca falta de ataque', 13, false, false, 'Defesa induz falta ofensiva.', 'Quando a principal acao e provocar falta de ataque.', 'Nao usar para contato defensivo irregular.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'DESLIZA_RECOMPOR', 'Deslize / recomposicao', 14, false, false, 'Ajuste de posicao para recompor o sistema.', 'Quando a acao central e reorganizar a defesa.', 'Nao usar se a defesa ja estava estabilizada.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'DEF_GOLEIRA', 'Defesa da goleira', 15, false, false, 'Goleira faz a acao defensiva principal.', 'Quando a goleira define a defesa da sequencia.', 'Nao usar para bloqueio de defensora.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'FALHA_COBERTURA', 'Falha de cobertura', 16, false, false, 'Cobertura nao acontece ou chega tarde.', 'Quando a sequencia e definida por ausencia/atraso de cobertura.', 'Nao usar se o fator principal for merito adversario.'),
    ('LISTA_ACAO_PRINCIPAL_DEF_POS', 'FALHA_COMUNICACAO', 'Falha de comunicacao', 17, false, false, 'Desalinhamento verbal ou tatico da defesa.', 'Quando duas ou mais defensoras se desorganizam por comunicacao.', 'Nao usar para erro individual isolado.'),

    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'SAIDA_RAPIDA', 'Saida rapida', 1, false, false, 'Inicio rapido da transicao apos recuperar a posse.', 'Quando a equipe acelera antes da defesa estabilizar.', 'Nao usar em ataque posicionado.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'PASSE_LONGO', 'Passe longo', 2, false, false, 'Passe direto para ganhar profundidade.', 'Quando a acao principal e um passe longo de transicao.', 'Nao usar para passe curto de seguranca.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'PASSE_CURTO_SEG', 'Passe curto de seguranca', 3, false, false, 'Passe curto para preservar a posse.', 'Quando a prioridade e manter a posse na transicao.', 'Nao usar se a intencao e profundidade imediata.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'AEREA_TRANS', 'Aerea na transicao', 4, false, false, 'Tentativa de aerea durante a transicao.', 'Quando a equipe tenta aerea antes da defesa estabilizar.', 'Nao usar para aerea em ataque posicionado.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'GOL_VAZIO', 'Ataque ao gol vazio', 5, false, false, 'Tentativa de finalizar sem goleira adversaria posicionada.', 'Quando a transicao busca gol sem goleira.', 'Nao usar quando a goleira ja esta posicionada.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'ACIONA_ESP_RAPIDO', 'Aciona especialista rapido', 6, false, false, 'Bola chega rapido a especialista.', 'Quando a transicao busca a especialista antes da defesa arrumar.', 'Nao usar se a recepcao ocorrer com ataque estabilizado.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'FINALIZA_TRANS', 'Finalizacao em transicao', 7, false, false, 'Finalizacao antes da defesa estabilizar.', 'Quando a jogada termina em arremesso de transicao.', 'Nao usar se o ataque ja entrou em sistema.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'ENTRA_AT_POS', 'Entra no ataque posicionado', 8, false, false, 'Transicao termina sem finalizar e vira ataque posicionado.', 'Quando a equipe perde a vantagem rapida e organiza o sistema.', 'Nao usar quando houve finalizacao na transicao.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'PERDA_TRANS_OF', 'Perda na transicao ofensiva', 9, false, false, 'Perda de posse durante a transicao.', 'Quando a transicao termina por erro ou perda.', 'Nao usar se houve arremesso.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'ERRO_TROCA_OF', 'Erro de troca ofensiva', 10, false, false, 'Troca ofensiva prejudica a chegada ao ataque.', 'Quando a transicao falha por entrada/saida errada.', 'Nao usar para erro tecnico de passe.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'LENTA_TRANS_OF', 'Transicao lenta', 11, false, false, 'Equipe demora e perde vantagem temporal.', 'Quando a defesa adversaria estabiliza por lentidao ofensiva.', 'Nao usar quando a lentidao foi estrategia intencional.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'MANTEM_POSSE', 'Mantem posse', 12, false, false, 'Transicao nao gera finalizacao, mas preserva a bola.', 'Quando a acao principal e conservar a posse.', 'Nao usar para perda ou finalizacao.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'VANTAGEM_SUP', 'Gera superioridade', 13, false, false, 'Transicao cria vantagem numerica ou espacial.', 'Quando a equipe ataca com vantagem clara.', 'Nao usar se a defesa ja estava equilibrada.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_OF', 'QUEBRA_DEF_TRANS', 'Quebra defesa em transicao', 14, false, false, 'Acao rompe a defesa desorganizada.', 'Quando deslocamento ou passe quebra o ajuste defensivo.', 'Nao usar contra defesa ja estabilizada.'),

    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'NEUTRALIZA_DIRETA', 'Neutraliza transicao direta', 1, false, false, 'Primeira entrada defensiva impede o ataque rapido adversario.', 'Quando a entrada defensiva evita a finalizacao rapida.', 'Nao usar se a defesa ja estava posicionada.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'ATRASA_ATAQUE', 'Atrasa ataque adversario', 2, false, false, 'Defesa ganha tempo para reorganizar.', 'Quando a acao principal e retardar a transicao adversaria.', 'Nao usar para bloqueio com defesa estabilizada.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'SOBE_PRESSAO', 'Sobe pressao', 3, false, false, 'Pressao inicial para forcar passe ou erro.', 'Quando a pressao defensiva quebra o ritmo adversario.', 'Nao usar para marcacao recuada.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'OBRIGA_PASSE_LATERAL', 'Obriga passe lateral', 4, false, false, 'Defesa força passe sem progressao.', 'Quando a acao da tempo para recompor.', 'Nao usar para passe lateral sem impacto.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'PROTEGE_CENTRO_TRANS', 'Protege centro na transicao', 5, false, false, 'Defesa fecha a zona central critica.', 'Quando a prioridade e proteger o espaco de maior risco.', 'Nao usar para marcacao lateral isolada.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'CORTA_LINHA_PASSE', 'Corta linha de passe', 6, false, false, 'Defensora nega passe de transicao.', 'Quando a acao principal impede o passe direto.', 'Nao usar para pressao sem fechar linha.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'DESLIZA_REORGANIZA', 'Desliza e reorganiza', 7, false, false, 'Defensora muda de zona ate a posicao final.', 'Quando a defesa transita para estrutura estabilizada.', 'Nao usar se nao houve reorganizacao observavel.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'TROCA_REFERENCIA', 'Troca referencia', 8, false, false, 'Defesa troca marcacao ou referencia durante a transicao.', 'Quando a reorganizacao exige troca de atletas ou setores.', 'Nao usar para marcacao fixa.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'COMUNICA_AJUSTE', 'Comunica ajuste', 9, false, false, 'Comunicacao organiza a recomposicao defensiva.', 'Quando a comunicacao e a acao principal da transicao.', 'Nao usar para fala sem efeito pratico.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'BLOQUEIA_TRANS', 'Bloqueia em transicao', 10, false, false, 'Bloqueio antes da defesa estar estabilizada.', 'Quando a finalizacao adversaria ocorre na transicao.', 'Nao usar para bloqueio em defesa posicionada.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'INTERC_TRANS', 'Intercepta na transicao', 11, false, false, 'Interceptacao durante o retorno defensivo.', 'Quando a defesa corta o passe na transicao.', 'Nao usar para interceptacao em defesa ja posicionada.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'ROUBO_TRANS', 'Roubo na transicao', 12, false, false, 'Roubo de bola durante o retorno defensivo.', 'Quando a defensora recupera a posse na transicao.', 'Nao usar para erro adversario sem acao defensiva.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'FALHA_TROCA_DEF', 'Falha de troca defensiva', 13, false, false, 'Troca defensiva gera atraso ou espaco livre.', 'Quando a entrada/saida deixa adversaria livre.', 'Nao usar para erro tecnico isolado.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'NAO_RECOMPOE', 'Nao recompõe', 14, false, false, 'Atleta nao retorna ou chega tarde.', 'Quando a falha principal e a ausencia/atraso de recomposicao.', 'Nao usar se a atleta cumpria outra funcao taticamente prevista.'),
    ('LISTA_ACAO_PRINCIPAL_TRANS_DEF', 'DEF_ESTABILIZA', 'Defesa estabiliza', 15, false, false, 'Transicao termina com a defesa organizada.', 'Quando a equipe consegue entrar no sistema defensivo.', 'Nao usar se houve finalizacao antes da estabilizacao.')
)
insert into public.scout_code_values (
  list_id,
  code,
  label,
  sort_order,
  is_nao_aplica,
  is_nao_observado,
  notes,
  description,
  when_to_use,
  when_not_to_use,
  active
)
select
  l.id,
  v.code,
  v.label,
  v.sort_order,
  v.is_nao_aplica,
  v.is_nao_observado,
  null,
  v.description,
  v.when_to_use,
  v.when_not_to_use,
  true
from value_seed v
join public.scout_code_lists l on l.list_key = v.list_key
on conflict (list_id, code) do update
set label = excluded.label,
    sort_order = excluded.sort_order,
    is_nao_aplica = excluded.is_nao_aplica,
    is_nao_observado = excluded.is_nao_observado,
    description = excluded.description,
    when_to_use = excluded.when_to_use,
    when_not_to_use = excluded.when_not_to_use,
    active = excluded.active;

with map_seed(contract_name, field_name, selector_key, selector_value, list_key, allow_nao_aplica, allow_nao_observado) as (
  values
    ('scout_live_entries', 'fase_da_bola_code', '*', '*', 'LISTA_FASES', false, false),
    ('scout_live_entries', 'fase_equipe_analisada_code', '*', '*', 'LISTA_FASE_EQUIPE', false, true),
    ('scout_live_entries', 'sistema_ofensivo_code', '*', '*', 'LISTA_SISTEMA_OFENSIVO', true, true),
    ('scout_live_entries', 'sistema_defensivo_code', '*', '*', 'LISTA_SISTEMA_DEFENSIVO', false, true),
    ('scout_live_entries', 'tipo_finalizacao_code', '*', '*', 'LISTA_TIPO_FINALIZACAO', false, true),
    ('scout_live_entries', 'resultado_factual_code', '*', '*', 'LISTA_RESULTADO_FACTUAL', false, true),
    ('scout_live_entries', 'causa_provavel_code', '*', '*', 'LISTA_CAUSA_PRINCIPAL', false, true),
    ('scout_live_entries', 'prioridade_treino_code', '*', '*', 'LISTA_PRIORIDADE_TREINO', false, false),
    ('scout_live_entries', 'status_validacao_code', '*', '*', 'LISTA_STATUS_VALIDACAO', false, false),
    ('scout_live_entries', 'acao_principal_suggestion_code', 'fase_da_bola_code', 'AT_POS', 'LISTA_ACAO_PRINCIPAL_AT_POS', false, false),
    ('scout_live_entries', 'acao_principal_suggestion_code', 'fase_da_bola_code', 'DEF_POS', 'LISTA_ACAO_PRINCIPAL_DEF_POS', false, false),
    ('scout_live_entries', 'acao_principal_suggestion_code', 'fase_da_bola_code', 'TRANS_OF', 'LISTA_ACAO_PRINCIPAL_TRANS_OF', false, false),
    ('scout_live_entries', 'acao_principal_suggestion_code', 'fase_da_bola_code', 'TRANS_DEF', 'LISTA_ACAO_PRINCIPAL_TRANS_DEF', false, false)
)
insert into public.scout_field_codebook_map (
  contract_name,
  field_name,
  selector_key,
  selector_value,
  list_key,
  allow_nao_aplica,
  allow_nao_observado,
  active
)
select
  contract_name,
  field_name,
  selector_key,
  selector_value,
  list_key,
  allow_nao_aplica,
  allow_nao_observado,
  true
from map_seed
on conflict (contract_name, field_name, selector_key, selector_value) do update
set list_key = excluded.list_key,
    allow_nao_aplica = excluded.allow_nao_aplica,
    allow_nao_observado = excluded.allow_nao_observado,
    active = excluded.active;
