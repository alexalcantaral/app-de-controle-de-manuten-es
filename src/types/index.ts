export type Cargo = "COORDENADOR" | "PROFESSOR" | "TECNICO";
export type StatusManutencao = "SOLICITADA" | "CANCELADA" | "CONCLUIDA";
export type TipoManutencao = "PREVENTIVA" | "CORRETIVA";

export interface Usuario {
  id: string;
  nome: string;
  cargo: Cargo;
  email: string;
  instituicaoId: number | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Laboratorio {
  id: number;
  nome: string;
  descricao: string | null;
  responsavelId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstituicaoEnsino {
  id: number;
  nome: string;
  cnpj: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface UsuarioResumo {
  id: string;
  nome: string;
}

export interface LaboratorioResumo {
  id: number;
  nome: string;
}

export interface Manutencao {
  id: number;
  prazo: string;
  status: StatusManutencao;
  tipo: TipoManutencao;
  descricaoSolicitada: string;
  descricaoAposFinalizada: string | null;
  dataSolicitada: string;
  updatedAt: string;
  // presentes quando complemento=false
  usuarioSolicitacaoId?: string;
  tecnicoResponsavelId?: string;
  laboratorioId?: number;
  // presentes quando complemento=true
  UsuarioSolicitou?: UsuarioResumo;
  TecnicoResponsavel?: UsuarioResumo;
  LaboratorioManutencao?: LaboratorioResumo;
}

export interface ImagemManutencao {
  id: number;
  manutencaoId: number;
  nome: string;
  mimetype: string;
  url: string;
}

export interface TokensAutenticacao {
  access: string;
  refresh: string;
}

export interface DashboardContadoresGerais {
  totalUsuarios: number;
  totalUsuariosAtivos: number;
  totalLaboratorios: number;
  totalInstituicoesEnsino: number;
  totalManutencoes: number;
}

export interface DashboardManutencoesPorStatus {
  SOLICITADA: number;
  CONCLUIDA: number;
  CANCELADA: number;
}

export interface DashboardManutencoesPorTipo {
  PREVENTIVA: number;
  CORRETIVA: number;
}

export interface DashboardManutencaoUrgente {
  id: number;
  laboratorio: string;
  prazo: string;
  diasEmAtraso: number;
}

export interface DashboardManutencoesEmAtraso {
  quantidade: number;
  maisUrgentes: DashboardManutencaoUrgente[];
}

export interface DashboardCargaTecnico {
  id: string;
  nome: string;
  manutencoesConcluidas: number;
  manutencoesPendentes: number;
}

export interface DashboardEvolucaoMensal {
  mes: string;
  quantidade: number;
}

export interface DashboardRankingLaboratorio {
  id: number;
  nome: string;
  quantidadeManutencoes: number;
}

export interface Dashboard {
  contadoresGerais: DashboardContadoresGerais;
  manutencoesPorStatus: DashboardManutencoesPorStatus;
  manutencoesPorTipo: DashboardManutencoesPorTipo;
  manutencoesEmAtraso: DashboardManutencoesEmAtraso;
  cargaPorTecnico: DashboardCargaTecnico[];
  evolucaoMensal: DashboardEvolucaoMensal[];
  rankingLaboratorios: DashboardRankingLaboratorio[];
}
