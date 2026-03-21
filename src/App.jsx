import React, { useState } from 'react';
import {
    GitPullRequest, Server, ExternalLink, GitGraph,
    CheckCircle2, ArrowRight, Terminal, Activity,
    GitBranch, Info, ArrowDown,
    Layers, Zap, Rocket, UserCheck,
    ShieldCheck, Lock, GitMerge, Tag
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
// GitHub Dark Design System
// ─────────────────────────────────────────────────────────
const GH = {
    // Canvas
    bgDefault:   '#0d1117',
    bgOverlay:   '#161b22',
    bgSubtle:    '#21262d',
    bgInset:     '#010409',

    // Borders
    border:      '#30363d',
    borderMuted: '#21262d',

    // Text
    fg:          '#e6edf3',
    fgMuted:     '#8b949e',
    fgSubtle:    '#6e7681',
    fgOnEmphasis:'#ffffff',

    // Accent (blue)
    accent:      '#388bfd',
    accentMuted: 'rgba(56,139,253,0.15)',
    accentEmphasis: '#1f6feb',
    accentBorder:'rgba(56,139,253,0.4)',

    // Success (green)
    success:        '#3fb950',
    successMuted:   'rgba(63,185,80,0.15)',
    successEmphasis:'#238636',
    successBorder:  'rgba(63,185,80,0.4)',

    // Attention (amber)
    attention:        '#d29922',
    attentionMuted:   'rgba(210,153,34,0.15)',
    attentionEmphasis:'#9e6a03',
    attentionBorder:  'rgba(210,153,34,0.4)',

    // Danger (red)
    danger:        '#f85149',
    dangerMuted:   'rgba(248,81,73,0.15)',
    dangerEmphasis:'#da3633',
    dangerBorder:  'rgba(248,81,73,0.4)',

    // Done (purple)
    done:        '#bc8cff',
    doneMuted:   'rgba(188,140,255,0.15)',
    doneEmphasis:'#8957e5',
    doneBorder:  'rgba(188,140,255,0.4)',
};

// ─────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────

const Label = ({ color = 'default', children, size = 'sm' }) => {
    const palettes = {
        default:    { bg: GH.bgSubtle,         border: GH.border,          text: GH.fgMuted },
        blue:       { bg: GH.accentMuted,       border: GH.accentBorder,    text: GH.accent },
        green:      { bg: GH.successMuted,      border: GH.successBorder,   text: GH.success },
        amber:      { bg: GH.attentionMuted,    border: GH.attentionBorder, text: GH.attention },
        red:        { bg: GH.dangerMuted,       border: GH.dangerBorder,    text: GH.danger },
        purple:     { bg: GH.doneMuted,         border: GH.doneBorder,      text: GH.done },
    };
    const p = palettes[color] || palettes.default;
    return (
        <span className="inline-flex items-center gap-1 font-semibold rounded-full"
            style={{
                background: p.bg,
                border: `1px solid ${p.border}`,
                color: p.text,
                fontSize: size === 'xs' ? 10 : 11,
                padding: size === 'xs' ? '1px 6px' : '2px 8px',
            }}>
            {children}
        </span>
    );
};

const StatusDot = ({ status }) => {
    const cfg = {
        idle:       { color: GH.fgSubtle,    label: 'Aguardando' },
        deploying:  { color: GH.attention,   label: 'Provisionando', pulse: true },
        live:       { color: GH.success,     label: 'Online',        pulse: true },
    }[status] || { color: GH.fgSubtle, label: status };

    return (
        <span className="inline-flex items-center gap-1.5">
            <span className="relative inline-flex w-2 h-2">
                <span className="w-2 h-2 rounded-full"
                    style={{ background: cfg.color, boxShadow: cfg.pulse ? `0 0 6px ${cfg.color}` : 'none' }} />
                {cfg.pulse && (
                    <span className="absolute inset-0 rounded-full animate-status-ping"
                        style={{ background: cfg.color, opacity: 0.5 }} />
                )}
            </span>
            <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
        </span>
    );
};

const BranchTag = ({ branch, color = GH.done }) => (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-semibold"
        style={{ background: `${color}18`, border: `1px solid ${color}35`, color }}>
        <GitBranch size={10} />{branch}
    </span>
);

const StepProgress = ({ current }) => {
    const steps = ['Branch', 'Deploy', 'Validar', 'Merge'];
    return (
        <div className="flex items-center gap-0.5 mb-3">
            {steps.map((step, i) => {
                const done   = i < current;
                const active = i === current;
                return (
                    <React.Fragment key={step}>
                        <span className="inline-flex items-center gap-0.5 rounded-full font-semibold transition-all duration-300"
                            style={{
                                fontSize: 10,
                                padding: '2px 7px',
                                background: done   ? GH.successMuted    : active ? GH.doneMuted    : GH.bgSubtle,
                                border:    `1px solid ${done ? GH.successBorder : active ? GH.doneBorder : GH.border}`,
                                color:     done   ? GH.success          : active ? GH.done          : GH.fgSubtle,
                            }}>
                            {done && <CheckCircle2 size={8} />}
                            {step}
                        </span>
                        {i < steps.length - 1 && (
                            <div className="w-2 h-px transition-all duration-500"
                                style={{ background: done ? GH.successBorder : GH.border }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// Divider between pipeline nodes
const PipelineConnector = ({ onClick, disabled, label, sub, color }) => {
    const palettes = {
        blue:  { bg: GH.accentEmphasis,  border: GH.accentBorder,  glow: 'rgba(31,111,235,0.35)',  text: '#fff' },
        green: { bg: GH.successEmphasis, border: GH.successBorder, glow: 'rgba(35,134,54,0.35)',   text: '#fff' },
    };
    const p = palettes[color];
    return (
        <div className="flex flex-col md:flex-row items-center justify-center shrink-0">
            <ArrowDown size={16} className="md:hidden my-1" style={{ color: GH.fgSubtle }} />
            <button onClick={onClick} disabled={disabled}
                className="flex flex-col items-center justify-center w-full md:w-28 py-3 px-2 rounded-lg text-center transition-all duration-150 active:scale-95"
                style={disabled ? {
                    background: GH.bgSubtle,
                    border: `1px solid ${GH.border}`,
                    color: GH.fgSubtle,
                    cursor: 'not-allowed',
                } : {
                    background: p.bg,
                    border: `1px solid ${p.border}`,
                    boxShadow: `0 0 16px ${p.glow}`,
                    color: p.text,
                    cursor: 'pointer',
                }}>
                <span className="text-xs font-bold">{label}</span>
                <span className="text-[10px] opacity-70 mb-1">{sub}</span>
                <ArrowRight size={13} className={disabled ? 'opacity-30' : 'animate-flow'} />
            </button>
        </div>
    );
};

// Pipeline environment node
const EnvBox = ({ label, data, color, branchName }) => {
    const palettes = {
        amber: { badge: GH.attention, badgeBg: GH.attentionMuted, badgeBorder: GH.attentionBorder, badgeText: GH.attention },
        red:   { badge: GH.danger,    badgeBg: GH.dangerMuted,    badgeBorder: GH.dangerBorder,    badgeText: GH.danger   },
    };
    const p = palettes[color];
    const isUpdating = data.status === 'updating';

    return (
        <div className="h-full rounded-xl p-4 flex flex-col justify-between transition-all duration-500 relative overflow-hidden"
            style={{
                background: GH.bgOverlay,
                border: `1px solid ${isUpdating ? p.badge + '80' : GH.border}`,
                boxShadow: isUpdating ? `0 0 20px ${p.badge}25` : 'none',
            }}>
            {/* scan line when updating */}
            {isUpdating && (
                <div className="absolute inset-x-0 h-px animate-scan pointer-events-none"
                    style={{ background: `linear-gradient(90deg, transparent, ${p.badge}80, transparent)` }} />
            )}
            <div className="flex justify-between items-center mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: p.badgeBg, border: `1px solid ${p.badgeBorder}`, color: p.badgeText }}>
                    <Server size={11} />{label}
                </span>
                <span className="relative inline-flex w-2.5 h-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${isUpdating ? 'animate-pulse' : ''}`}
                        style={{
                            background: isUpdating ? GH.attention : GH.success,
                            boxShadow: `0 0 8px ${isUpdating ? GH.attention : GH.success}`,
                        }} />
                </span>
            </div>
            <div>
                <div className="text-xl font-mono font-bold mb-1 truncate" style={{ color: GH.fg }}>
                    {data.version}
                </div>
                <div className="text-xs font-semibold mb-1" style={{ color: GH.accent }}>{branchName}</div>
                <div className="text-xs leading-snug" style={{ color: GH.fgMuted }}>{data.desc}</div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────
const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [stories, setStories] = useState([
        { id: 101, title: 'Refatoração da API', branch: 'feat/api', status: 'live', url: 'api-pr101.dev.io', dev: 'Ana', poApproved: true, deployType: 'efimero' },
    ]);
    const [mainRepo, setMainRepo] = useState({ commit: 'main-sha-7f2a', pendingRelease: false });
    const [environments, setEnvironments] = useState({
        hml:  { version: 'v2.4.0-rc.1', status: 'stable', desc: 'Infraestrutura de Homologação (Pre-release)' },
        prod: { version: 'v2.3.9',       status: 'stable', desc: 'Infraestrutura de Produção' },
    });
    const [explanation, setExplanation] = useState({
        title: "Arquitetura Zero-Fixed-DEV",
        tech: "Não existe infraestrutura fixa de DEV. Cada PR sobe o seu próprio ambiente DEV efêmero. Fez o merge, a infra morre. Custo zero quando ocioso.",
        cmd: "# Nenhuma infra fixa de DEV\n# Selecione uma ação para iniciar a simulação.",
    });
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 8));
    };

    const setDeployType = (id, type) => {
        setStories(prev => prev.map(s => s.id === id ? { ...s, deployType: type } : s));
        if (type === 'efimero') {
            setExplanation({
                title: "Por que usar Infraestrutura Efêmera?",
                tech: "Ambientes efêmeros oferecem isolamento total. Cada PR ganha uma cópia limpa do sistema, evitando interferência de testes de outros desenvolvedores. Também elimina custos ociosos, pois tudo é desligado após o merge.",
                cmd: "# Estratégia selecionada: DEV Efêmero\n# Isolamento Total / Custo por Uso",
            });
        } else {
            setExplanation({
                title: "Por que usar Infraestrutura Fixa?",
                tech: "Ambientes fixos são o modelo tradicional (DEV compartilhado). Todos os desenvolvedores publicam e testam no mesmo ambiente, o que frequentemente causa dados sobrescritos, fila de aprovação e conflito entre testes.",
                cmd: "# Estratégia selecionada: DEV Compartilhado/Fixo\n# Atenção: Gargalo / Custo Contínuo (24/7)",
            });
        }
    };

    const generateSha = () => Math.random().toString(16).substring(2, 8);

    // ── Actions ──

    const createStory = () => {
        const id = Math.floor(Math.random() * 900) + 200;
        const newStory = { id, title: `Story #${id}: Nova Feature`, branch: `feat/ui-${id}`, status: 'idle', url: null, dev: 'Você', poApproved: false, deployType: 'efimero' };
        setStories(prev => [newStory, ...prev]);
        setExplanation({
            title: "Escolha: Infraestrutura Fixa ou Efêmera?",
            tech: "Com a branch criada, agora é preciso provisionar um ambiente para validar a funcionalidade. Você pode utilizar uma infraestrutura Efêmera (exclusiva para este PR) ou Tradicional/Fixa (uma máquina compartilhada para todo o time).",
            cmd: `git checkout -b ${newStory.branch} main\ngit push origin ${newStory.branch}\n# Branch criada! Selecione o tipo de Deploy desejado abaixo.`,
        });
        addLog(`Git: Branch ${newStory.branch} criada.`);
    };

    const deployPreview = (id) => {
        const story = stories.find(s => s.id === id);
        setStories(prev => prev.map(s => s.id === id ? { ...s, status: 'deploying' } : s));
        if (story.deployType === 'efimero') {
            setExplanation({
                title: "Ambiente Efêmero via GitHub Actions",
                tech: "Um workflow do GitHub Actions orquestra o provisionamento de uma infraestrutura temporária e exclusiva. A URL gerada é aleatória e o link direto fica automaticamente disponível no Summary da Action para fácil validação.",
                cmd: `gh workflow run deploy-ephemeral.yml -f pr=${id}\n# ... provisionando infraestrutura ...\nURL=$(generate-random-url)\necho "### 🚀 Ambiente de Teste Criado" >> $GITHUB_STEP_SUMMARY\necho "[Acessar Ambiente]($URL)" >> $GITHUB_STEP_SUMMARY`,
            });
        } else {
            setExplanation({
                title: "Deploy em Ambiente Tradicional (Compartilhado)",
                tech: "O código é enviado para uma infraestrutura de DEV fixa e compartilhada. Sem isolamento — múltiplos PRs competem pelo mesmo ambiente.",
                cmd: `kubectl set image deployment/shared-dev \\\n  app=registry/app:pr-${id}\n# Deploy no namespace de DEV compartilhado.`,
            });
        }
        setTimeout(() => {
            const randomHash = Math.random().toString(36).substring(2, 8);
            setStories(prev => prev.map(s => s.id === id ? {
                ...s, status: 'live',
                url: story.deployType === 'efimero' ? `pr-${id}-${randomHash}.dev.io` : 'dev-shared.coolapp.io'
            } : s));
            addLog(`Deploy ${story.deployType === 'efimero' ? 'efêmero (GHA)' : 'tradicional'} para PR #${id} concluído.`);
        }, 2000);
    };

    const approvePO = (id) => {
        setStories(prev => prev.map(s => s.id === id ? { ...s, poApproved: true } : s));
        setExplanation({
            title: "Validação Antecipada pelo PO",
            tech: "O PO valida a história diretamente no ambiente DEV efêmero. Evitamos contaminar a 'main' com código não aprovado pelo negócio.",
            cmd: "gh pr review --approve\n# Pull Request aprovado via GitHub CLI.",
        });
        addLog(`PO: História #${id} aprovada no ambiente DEV isolado.`);
    };

    const mergeToMain = (id) => {
        const s = stories.find(st => st.id === id);
        const newSha = generateSha();
        setStories(prev => prev.filter(st => st.id !== id));
        setMainRepo({ commit: `main-sha-${newSha}`, pendingRelease: true });
        setExplanation({
            title: s?.deployType === 'efimero' ? "Merge + Destruição Automática da Infra DEV" : "Merge (Infra Tradicional Mantida)",
            tech: s?.deployType === 'efimero'
                ? "O código entra na 'main'. O Argo CD detecta o merge e destrói o namespace efêmero. Zero custo ocioso. A main recebe um novo commit."
                : "O código entra na 'main'. A infra de DEV compartilhada permanece ativa e gerando custo contínuo.",
            cmd: `git checkout main && git merge --no-ff ${s?.branch}\n${s?.deployType === 'efimero'
                ? `kubectl delete ns dev-pr-${id}\n# Namespace efêmero destruído. Recursos liberados.`
                : '# Infra fixa mantida para próximo deploy.'}`,
        });
        addLog(`GitOps: PR #${id} mesclado. ${s?.deployType === 'efimero' ? 'Infra DEV destruída.' : 'Infra DEV mantida.'} main atualizada.`);
    };

    const createPreRelease = () => {
        const parts = environments.prod.version.replace('v', '').split('.').map(Number);
        parts[2] += 1;
        const nextVersion = `v${parts.join('.')}`;
        const rcVersion   = `${nextVersion}-rc.1`;
        setEnvironments(prev => ({ ...prev, hml: { ...prev.hml, status: 'updating' } }));
        setMainRepo(prev => ({ ...prev, pendingRelease: false }));
        setExplanation({
            title: "Tagueamento de Pre-release → HML",
            tech: `O commit consolidado na 'main' recebe a tag RC (${rcVersion}). O GitOps atualiza automaticamente a infraestrutura de Homologação.`,
            cmd: `git tag -a ${rcVersion} -m "Pre-release ${rcVersion}"\ngit push origin ${rcVersion}\n# Argo CD: Infra HML → ${rcVersion}`,
        });
        setTimeout(() => {
            setEnvironments(prev => ({ ...prev, hml: { ...prev.hml, version: rcVersion, status: 'stable' } }));
            addLog(`Argo CD: Infra HML provisionada com Pre-release ${rcVersion}.`);
        }, 1500);
    };

    const promoteToProd = () => {
        const finalVersion = environments.hml.version.split('-')[0];
        setEnvironments(prev => ({ ...prev, prod: { ...prev.prod, status: 'updating' } }));
        setExplanation({
            title: "Promoção para Produção",
            tech: `A pre-release validada em HML é promovida para PROD sem recompilação. O mesmo artefato testado vai a produção — GitOps puro.`,
            cmd: `git tag -a ${finalVersion} -m "Release ${finalVersion}"\ngit push origin ${finalVersion}\n# Argo CD: Infra PROD → ${finalVersion}`,
        });
        setTimeout(() => {
            setEnvironments(prev => ({ ...prev, prod: { ...prev.prod, version: finalVersion, status: 'stable' } }));
            addLog(`SUCCESS: Infra PROD atualizada para Release ${finalVersion}.`);
        }, 2000);
    };

    const getStepIndex = (story) => {
        if (story.status === 'idle')                               return 0;
        if (story.status === 'deploying')                          return 1;
        if (story.status === 'live' && !story.poApproved)          return 2;
        return 3;
    };

    const canPromote = environments.hml.version.split('-')[0] !== environments.prod.version
        && environments.hml.status === 'stable';

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center font-sans p-4" style={{ background: GH.bgDefault, color: GH.fg }}>
                <div className="w-full max-w-sm rounded-xl p-8 text-center animate-appear" style={{ background: GH.bgOverlay, border: `1px solid ${GH.border}` }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: GH.doneMuted, border: `1px solid ${GH.doneBorder}` }}>
                        <Lock size={22} style={{ color: GH.done }} />
                    </div>
                    <h1 className="font-bold text-lg mb-2" style={{ color: GH.fg }}>Acesso Restrito</h1>
                    <p className="text-xs mb-6" style={{ color: GH.fgMuted }}>Simulador DevOps. Insira a senha fornecida pela Aliant.</p>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (passwordInput === 'bealiant') setIsAuthenticated(true);
                        else alert('Senha incorreta!');
                    }}>
                        <input 
                            type="password" 
                            className="w-full px-4 py-2.5 rounded-lg text-sm font-mono mb-4 text-center transition-all focus:scale-105"
                            placeholder="••••••••"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            style={{ 
                                background: GH.bgInset, 
                                border: `1px solid ${GH.border}`, 
                                color: GH.fg,
                                outline: 'none',
                                boxShadow: passwordInput ? `0 0 10px ${GH.accent}30` : 'none'
                            }}
                            autoFocus
                        />
                        <button type="submit" 
                            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95 hover:brightness-110"
                            style={{ background: GH.accentEmphasis, border: `1px solid rgba(240,246,252,0.1)`, color: GH.fgOnEmphasis }}>
                            Acessar Simulador
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ── Render ──
    return (
        <div className="min-h-screen font-sans flex flex-col p-4 md:p-5 gap-5 text-sm"
            style={{ background: GH.bgDefault, color: GH.fg }}>

            {/* ══ HEADER ══ */}
            <header className="rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4"
                style={{
                    background: GH.bgOverlay,
                    border: `1px solid ${GH.border}`,
                    boxShadow: `0 1px 0 rgba(255,255,255,0.03)`,
                }}>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg"
                        style={{ background: GH.doneMuted, border: `1px solid ${GH.doneBorder}` }}>
                        <Layers size={22} style={{ color: GH.done }} />
                    </div>
                    <div>
                        <h1 className="font-bold text-base leading-none mb-1" style={{ color: GH.fg }}>
                            Arquitetura Zero-Fixed-DEV
                        </h1>
                        <p className="text-xs" style={{ color: GH.fgMuted }}>
                            DEV Efêmero → Merge → Pre-release (HML) → Release (PROD)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-2">
                        <Label color="blue"><Activity size={10} />{stories.length} PR{stories.length !== 1 ? 's' : ''}</Label>
                        <Label color="amber">HML {environments.hml.version}</Label>
                        <Label color="green"><ShieldCheck size={10} />PROD {environments.prod.version}</Label>
                    </div>
                    <button onClick={createStory}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-150 active:scale-95 hover:brightness-110"
                        style={{
                            background: GH.successEmphasis,
                            border: `1px solid rgba(240,246,252,0.1)`,
                            color: GH.fgOnEmphasis,
                            boxShadow: '0 1px 0 rgba(27,31,35,0.04)',
                        }}>
                        <GitPullRequest size={15} /> Iniciar História
                    </button>
                </div>
            </header>

            {/* ══ GRID ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">

                {/* ── LEFT: DEV Stories ── */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                    {/* Section header */}
                    <div className="flex items-center justify-between px-1 pb-1"
                        style={{ borderBottom: `1px solid ${GH.border}` }}>
                        <span className="text-xs font-semibold" style={{ color: GH.fgMuted }}>
                            Infra de DEV (Efêmera)
                        </span>
                        <Label color="red" size="xs">◆ Morre após o Merge</Label>
                    </div>

                    {/* Cards */}
                    <div className="space-y-3">
                        {stories.map(story => {
                            const stepIdx      = getStepIndex(story);
                            const isEfimero    = story.deployType === 'efimero';
                            const borderColor  = story.poApproved ? GH.success : isEfimero ? GH.done : GH.accent;

                            return (
                                <div key={story.id} className="rounded-xl p-4 transition-all duration-300 animate-appear"
                                    style={{
                                        background: GH.bgOverlay,
                                        border: `1px solid ${GH.border}`,
                                        borderLeft: `3px solid ${borderColor}`,
                                    }}>

                                    {/* Card header */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold" style={{ color: GH.fgSubtle }}>
                                                PR #{story.id}
                                            </span>
                                            {story.poApproved && (
                                                <Label color="green" size="xs">
                                                    <CheckCircle2 size={9} /> PO OK
                                                </Label>
                                            )}
                                        </div>
                                        <StatusDot status={story.status} />
                                    </div>

                                    <StepProgress current={stepIdx} />

                                    <h4 className="font-semibold mb-3 leading-snug" style={{ color: GH.fg }}>
                                        {story.title}
                                    </h4>

                                    {/* Branch flow */}
                                    <div className="flex items-center gap-2 rounded-lg p-2.5 mb-3"
                                        style={{ background: GH.bgInset, border: `1px solid ${GH.border}` }}>
                                        <BranchTag branch={story.branch} color={GH.done} />
                                        <ArrowRight size={11} style={{ color: GH.fgSubtle, flexShrink: 0 }} />
                                        <BranchTag branch="main" color={GH.success} />
                                    </div>

                                    {/* URL */}
                                    {story.url && (
                                        <div className="flex items-center justify-between rounded-lg px-3 py-2 mb-3"
                                            style={{
                                                background: GH.accentMuted,
                                                border: `1px solid ${GH.accentBorder}`,
                                                color: GH.accent,
                                            }}>
                                            <span className="font-mono text-xs">{story.url}</span>
                                            <ExternalLink size={11} />
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        {story.status === 'idle' && (
                                            <>
                                                {/* Deploy type toggle */}
                                                <div className="flex rounded-lg overflow-hidden"
                                                    style={{ border: `1px solid ${GH.border}` }}>
                                                    {[
                                                        { value: 'efimero',     label: 'Efêmero',  Icon: Zap },
                                                        { value: 'tradicional', label: 'Fixo',     Icon: Lock },
                                                    ].map(({ value, label, Icon }, idx) => (
                                                        <button key={value}
                                                            onClick={() => setDeployType(story.id, value)}
                                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-all"
                                                            style={{
                                                                background: story.deployType === value ? GH.bgSubtle : 'transparent',
                                                                color:      story.deployType === value ? GH.fg       : GH.fgMuted,
                                                                borderRight: idx === 0 ? `1px solid ${GH.border}` : 'none',
                                                            }}>
                                                            <Icon size={11} />{label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button onClick={() => deployPreview(story.id)}
                                                    className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-110"
                                                    style={{
                                                        background: GH.accentEmphasis,
                                                        border: `1px solid rgba(240,246,252,0.1)`,
                                                        color: GH.fgOnEmphasis,
                                                    }}>
                                                    <Rocket size={13} /> Subir Infra DEV
                                                </button>
                                            </>
                                        )}

                                        {story.status === 'deploying' && (
                                            <div className="w-full py-2 rounded-lg text-sm font-semibold text-center animate-shimmer"
                                                style={{
                                                    background: GH.attentionMuted,
                                                    border: `1px solid ${GH.attentionBorder}`,
                                                    color: GH.attention,
                                                }}>
                                                Provisionando ambiente...
                                            </div>
                                        )}

                                        {story.status === 'live' && !story.poApproved && (
                                            <button onClick={() => approvePO(story.id)}
                                                className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-110"
                                                style={{
                                                    background: GH.attentionEmphasis,
                                                    border: `1px solid rgba(240,246,252,0.1)`,
                                                    color: GH.fgOnEmphasis,
                                                }}>
                                                <UserCheck size={13} /> Validar em DEV (PO)
                                            </button>
                                        )}

                                        {story.status === 'live' && (
                                            <button
                                                onClick={() => story.poApproved && mergeToMain(story.id)}
                                                className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                                style={story.poApproved ? {
                                                    background: GH.dangerEmphasis,
                                                    border: `1px solid rgba(240,246,252,0.1)`,
                                                    color: GH.fgOnEmphasis,
                                                    cursor: 'pointer',
                                                } : {
                                                    background: GH.bgSubtle,
                                                    border: `1px solid ${GH.border}`,
                                                    color: GH.fgSubtle,
                                                    cursor: 'not-allowed',
                                                }}>
                                                <GitMerge size={13} /> Merge & Destruir Infra DEV
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {stories.length === 0 && (
                            <div className="rounded-xl p-8 text-center"
                                style={{ background: GH.bgOverlay, border: `1px dashed ${GH.border}` }}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                                    style={{ background: GH.successMuted, border: `1px solid ${GH.successBorder}` }}>
                                    <Activity size={18} style={{ color: GH.success }} />
                                </div>
                                <p className="font-semibold mb-1" style={{ color: GH.fgMuted }}>
                                    Nenhuma infra DEV ativa.
                                </p>
                                <p className="text-xs font-semibold" style={{ color: GH.success }}>
                                    Custos Otimizados ✓
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT ── */}
                <div className="lg:col-span-8 flex flex-col gap-5">

                    {/* GitOps Insight — GitHub alert style */}
                    <div className="rounded-xl overflow-hidden"
                        style={{
                            background: GH.bgOverlay,
                            border: `1px solid ${GH.border}`,
                        }}>
                        {/* Alert header */}
                        <div className="flex items-center gap-2 px-5 py-3"
                            style={{ background: GH.doneMuted, borderBottom: `1px solid ${GH.doneBorder}` }}>
                            <Info size={14} style={{ color: GH.done }} />
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: GH.done }}>
                                GitOps Insight
                            </span>
                        </div>

                        <div className="p-5 flex flex-col md:flex-row gap-5">
                            <div className="flex-1">
                                <h3 className="font-bold text-base mb-2" style={{ color: GH.fg }}>
                                    {explanation.title}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: GH.fgMuted }}>
                                    {explanation.tech}
                                </p>
                            </div>

                            {/* Terminal block */}
                            <div className="rounded-lg overflow-hidden md:min-w-[290px] flex flex-col"
                                style={{ background: GH.bgInset, border: `1px solid ${GH.border}` }}>
                                {/* Titlebar */}
                                <div className="flex items-center gap-2 px-3 py-2"
                                    style={{ borderBottom: `1px solid ${GH.border}` }}>
                                    {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                                        <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                                    ))}
                                    <span className="text-xs font-semibold ml-1" style={{ color: GH.fgSubtle }}>
                                        Pipeline / CLI
                                    </span>
                                </div>
                                <div className="p-4 flex-1">
                                    <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap"
                                        style={{ color: GH.success }}>
                                        {explanation.cmd}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Production Pipeline */}
                    <div className="rounded-xl overflow-x-auto"
                        style={{
                            background: GH.bgOverlay,
                            border: `1px solid ${GH.border}`,
                        }}>
                        {/* Pipeline header */}
                        <div className="flex items-center justify-between px-5 py-3 min-w-[680px]"
                            style={{ borderBottom: `1px solid ${GH.border}` }}>
                            <div className="flex items-center gap-2">
                                <Activity size={14} style={{ color: GH.accent }} />
                                <span className="font-semibold text-sm" style={{ color: GH.fg }}>
                                    A Linha de Produção
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="relative inline-flex w-2 h-2">
                                    <span className="w-2 h-2 rounded-full animate-pulse"
                                        style={{ background: GH.success, boxShadow: `0 0 6px ${GH.success}` }} />
                                </span>
                                <span className="text-xs font-semibold" style={{ color: GH.success }}>Fluxo Ativo</span>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex flex-col md:flex-row items-stretch gap-3 min-w-[680px]">
                                {/* Git Repo node */}
                                <div className="flex-1 rounded-xl p-4 flex flex-col justify-between transition-all duration-500"
                                    style={{
                                        background: GH.bgInset,
                                        border: `1px solid ${mainRepo.pendingRelease ? GH.accentBorder : GH.border}`,
                                        boxShadow: mainRepo.pendingRelease ? `0 0 16px rgba(56,139,253,0.15)` : 'none',
                                    }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <Label color="default">
                                            <GitGraph size={10} /> GIT REPO
                                        </Label>
                                        {mainRepo.pendingRelease && (
                                            <Label color="blue" size="xs">
                                                <Tag size={8} /> RC pronto
                                            </Label>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-mono font-bold text-lg mb-1 truncate" style={{ color: GH.fg }}>
                                            {mainRepo.commit}
                                        </div>
                                        <div className="text-xs font-semibold mb-0.5" style={{ color: GH.accent }}>
                                            Branch: main (Tronco)
                                        </div>
                                        <div className="text-xs" style={{ color: GH.fgSubtle }}>
                                            Recebeu merge. Sem infra fixa.
                                        </div>
                                    </div>
                                </div>

                                <PipelineConnector onClick={createPreRelease} disabled={!mainRepo.pendingRelease}
                                    label="Gerar RC" sub="Pre-release" color="blue" />

                                <div className="flex-1">
                                    <EnvBox label="INFRA: HML" data={environments.hml} color="amber"
                                        branchName="Branch: main (Tag RC)" />
                                </div>

                                <PipelineConnector onClick={promoteToProd} disabled={!canPromote}
                                    label="Aprovar" sub="Release PROD" color="green" />

                                <div className="flex-1">
                                    <EnvBox label="INFRA: PROD" data={environments.prod} color="red"
                                        branchName="Branch: main (Tag Release)" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Log Terminal */}
                    <div className="rounded-xl overflow-hidden"
                        style={{ background: GH.bgInset, border: `1px solid ${GH.border}` }}>
                        {/* Titlebar */}
                        <div className="flex items-center justify-between px-4 py-2.5"
                            style={{ borderBottom: `1px solid ${GH.border}`, background: GH.bgOverlay }}>
                            <div className="flex items-center gap-2">
                                <Terminal size={13} style={{ color: GH.success }} />
                                <span className="text-xs font-semibold" style={{ color: GH.fgMuted }}>
                                    Output do Sistema
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                                    style={{ background: GH.success, boxShadow: `0 0 4px ${GH.success}`, display: 'inline-block' }} />
                                <span className="text-xs font-semibold" style={{ color: GH.fgSubtle }}>LIVE</span>
                            </div>
                        </div>

                        <div className="p-4 h-36 overflow-y-auto terminal-scroll space-y-1.5 font-mono">
                            {logs.length === 0 && (
                                <div className="flex items-start gap-2 text-xs">
                                    <span style={{ color: GH.fgSubtle }}>$</span>
                                    <span style={{ color: GH.fgSubtle }}>
                                        Aguardando eventos do sistema
                                        <span className="animate-cursor ml-0.5" style={{ color: GH.success }}>▋</span>
                                    </span>
                                </div>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs leading-relaxed">
                                    <span className="shrink-0 font-bold select-none"
                                        style={{ color: i === 0 ? GH.success : GH.fgSubtle }}>$</span>
                                    <span style={{ color: i === 0 ? GH.fg : GH.fgSubtle }}>
                                        {log}
                                        {i === 0 && (
                                            <span className="animate-cursor ml-0.5" style={{ color: GH.success }}>▋</span>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default App;
