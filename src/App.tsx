import { useState } from "react";
import {
  Activity, BarChart3, Boxes, Building2, Calculator, ChevronDown,
  CircleHelp, CreditCard, FileText, LayoutDashboard, Menu, Package,
  Search, Settings, ShieldCheck, ShoppingCart, Truck, Users, Wallet, X
} from "lucide-react";

type ModuleId =
  | "overview" | "pos" | "products" | "inventory" | "customers"
  | "suppliers" | "finance" | "reports" | "team" | "fiscal" | "settings";

const navigation: { id: ModuleId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "pos", label: "Vendas e PDV", icon: ShoppingCart },
  { id: "products", label: "Produtos", icon: Package },
  { id: "inventory", label: "Estoque", icon: Boxes },
  { id: "customers", label: "Clientes", icon: Users },
  { id: "suppliers", label: "Fornecedores", icon: Truck },
  { id: "finance", label: "Financeiro", icon: Wallet },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "team", label: "Equipe e acessos", icon: ShieldCheck },
  { id: "fiscal", label: "Fiscal", icon: FileText },
  { id: "settings", label: "Configurações", icon: Settings },
];

const quickLinks: { label: string; id: ModuleId; icon: typeof ShoppingCart }[] = [
  { label: "Nova venda", id: "pos", icon: ShoppingCart },
  { label: "Cadastrar produto", id: "products", icon: Package },
  { label: "Consultar estoque", id: "inventory", icon: Boxes },
  { label: "Ver financeiro", id: "finance", icon: Wallet },
];

const descriptions: Record<ModuleId, string> = {
  overview: "Acompanhe a operação da loja em um só lugar.",
  pos: "Frente de caixa, carrinho, pagamentos e registro de vendas.",
  products: "Cadastro de roupas com tamanhos, cores, códigos e preços.",
  inventory: "Estoque por produto e por variação de tamanho e cor.",
  customers: "Cadastro e histórico de relacionamento com clientes.",
  suppliers: "Cadastro e acompanhamento de fornecedores.",
  finance: "Contas, despesas, recebimentos e fluxo de caixa.",
  reports: "Indicadores e relatórios operacionais e financeiros.",
  team: "Usuários, funções e permissões de acesso.",
  fiscal: "Configurações e documentos fiscais, conforme credenciamento.",
  settings: "Dados da empresa, filiais, dispositivos e preferências.",
};

function App() {
  const [active, setActive] = useState<ModuleId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const current = navigation.find((item) => item.id === active)!;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">DB</div>
          <div><strong>DB CARDOSO</strong><span>GESTÃO COMERCIAL</span></div>
          <button className="icon-button mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu"><X size={19} /></button>
        </div>
        <div className="store-switch">
          <div className="store-icon"><Building2 size={18} /></div>
          <div><span>EMPRESA</span><strong>Loja principal</strong></div>
          <ChevronDown size={16} className="muted-icon" />
        </div>
        <p className="nav-caption">MENU PRINCIPAL</p>
        <nav className="nav-list">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${active === id ? "active" : ""}`} onClick={() => { setActive(id); setSidebarOpen(false); }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><CircleHelp size={18} /><div><strong>Central de ajuda</strong><span>Suporte ao sistema</span></div></div>
          <div className="user-row"><div className="avatar">AD</div><div><strong>Administrador</strong><span>Perfil proprietário</span></div><Settings size={17} /></div>
        </div>
      </aside>

      {sidebarOpen && <button className="backdrop" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu" />}
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu"><Menu size={21} /></button>
            <div className="breadcrumb">DB CARDOSO <span>/</span> {current.label}</div>
          </div>
          <div className="topbar-actions">
            <div className="connection"><span className="status-dot" /> Ambiente inicial</div>
            <button className="icon-button" aria-label="Pesquisar"><Search size={19} /></button>
            <div className="top-avatar">AD</div>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div><p className="eyebrow">PAINEL DE CONTROLE</p><h1>{current.label}</h1><p className="page-description">{descriptions[active]}</p></div>
            {active === "pos" && <button className="primary-button" onClick={() => alert("O módulo de PDV ainda será implementado.")}><ShoppingCart size={17} /> Iniciar venda</button>}
          </div>

          {active === "overview" ? (
            <>
              <div className="notice"><Activity size={19} /><div><strong>Estrutura inicial do DB CARDOSO</strong><p>O ambiente visual está preparado. Os módulos operacionais serão implementados e conectados ao banco de dados nas próximas etapas.</p></div></div>
              <div className="section-title"><div><h2>Resumo da operação</h2><p>Os indicadores aparecerão quando houver dados reais.</p></div><span className="period-label">SEM DADOS REGISTRADOS</span></div>
              <div className="metrics-grid">
                {[
                  { label: "Vendas hoje", value: "—", icon: ShoppingCart, note: "Aguardando integração do PDV" },
                  { label: "Faturamento", value: "—", icon: CreditCard, note: "Aguardando registros financeiros" },
                  { label: "Produtos cadastrados", value: "—", icon: Package, note: "Aguardando cadastro de produtos" },
                  { label: "Estoque baixo", value: "—", icon: Boxes, note: "Aguardando controle de estoque" },
                ].map(({ label, value, icon: Icon, note }) => (
                  <article className="metric-card" key={label}><div className="metric-top"><span>{label}</span><div className="metric-icon"><Icon size={18} /></div></div><strong className="metric-value">{value}</strong><p>{note}</p></article>
                ))}
              </div>
              <div className="lower-grid">
                <section className="panel"><div className="panel-heading"><div><h2>Atividade recente</h2><p>Movimentações registradas no sistema</p></div></div><div className="empty-state"><div className="empty-icon"><Activity size={22} /></div><strong>Nenhuma atividade registrada</strong><span>As movimentações aparecerão aqui após a implementação dos módulos.</span></div></section>
                <section className="panel"><div className="panel-heading"><div><h2>Acesso rápido</h2><p>Navegue pelos módulos principais</p></div></div><div className="quick-links">{quickLinks.map(({ label, id, icon: Icon }) => <button key={id} onClick={() => setActive(id)}><Icon size={17}/><span>{label}</span><span className="quick-arrow">→</span></button>)}</div></section>
              </div>
            </>
          ) : (
            <section className="module-placeholder">
              <div className="placeholder-icon"><Calculator size={26} /></div>
              <span className="planned-tag">MÓDULO EM DESENVOLVIMENTO</span>
              <h2>{current.label}</h2>
              <p>{descriptions[active]}</p>
              <p className="placeholder-note">Esta tela é apenas a estrutura inicial. Nenhuma operação, venda ou movimentação é simulada ou gravada ainda.</p>
              <button className="secondary-button" onClick={() => setActive("overview")}>Voltar à visão geral</button>
            </section>
          )}
          <footer className="footer"><span>DB CARDOSO · Gestão Comercial</span><span>Versão inicial 0.1.0</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
