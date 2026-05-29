/**
 * @deprecated AuthGuard foi substituído por AppAccessGuard (CEPR-AUTH-01).
 * Este arquivo existe apenas como alias para não quebrar imports legados.
 * Não usar em novas rotas — usar AppAccessGuard diretamente.
 */
export { AppAccessGuard as AuthGuard } from './AppAccessGuard'
