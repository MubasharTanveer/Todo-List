import React, { useState } from 'react';
import { useTodo } from '../context/TodoContext';
import { Terminal, ChevronDown, ChevronUp, Play, Copy, Check, Cpu } from 'lucide-react';

export const MCPInspector: React.FC = () => {
  const { mcpBridge } = useTodo();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState('get_todo_stats');
  const [paramsInput, setParamsInput] = useState('{}');
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  const tools = mcpBridge.getTools();
  const manifest = mcpBridge.getManifest();

  const handleSelectTool = (toolName: string) => {
    setSelectedTool(toolName);
    switch (toolName) {
      case 'create_todo':
        setParamsInput(
          JSON.stringify(
            {
              title: 'Automate verification pipeline',
              description: 'Generated via MCP Tool Inspector',
              priority: 'high',
              category: 'Automation'
            },
            null,
            2
          )
        );
        break;
      case 'list_todos':
        setParamsInput(JSON.stringify({ status: 'all', priority: 'all' }, null, 2));
        break;
      case 'get_todo':
      case 'toggle_todo':
      case 'delete_todo':
        setParamsInput(JSON.stringify({ id: 'seed_1_' }, null, 2));
        break;
      case 'update_todo':
        setParamsInput(JSON.stringify({ id: 'seed_1_', title: 'Updated Title via MCP' }, null, 2));
        break;
      case 'import_todos':
        setParamsInput(
          JSON.stringify(
            {
              jsonString: JSON.stringify([
                {
                  title: 'Imported task from MCP',
                  priority: 'medium',
                  category: 'Imported'
                }
              ])
            },
            null,
            2
          )
        );
        break;
      default:
        setParamsInput('{}');
        break;
    }
  };

  const handleRunTool = async () => {
    setIsExecuting(true);
    try {
      let parsed = {};
      if (paramsInput.trim()) {
        parsed = JSON.parse(paramsInput);
      }
      const response = await mcpBridge.executeTool(selectedTool, parsed);
      setConsoleOutput(JSON.stringify(response, null, 2));
    } catch (err: any) {
      setConsoleOutput(`[Execution Error]: ${err?.message || 'Invalid JSON input'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyManifest = () => {
    const fullMeta = {
      manifest,
      tools: mcpBridge.getTools()
    };
    navigator.clipboard.writeText(JSON.stringify(fullMeta, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="mcp-drawer" aria-label="Model Context Protocol Introspection Panel">
      <div
        className="mcp-header"
        onClick={() => setIsOpen(prev => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
      >
        <div className="mcp-header-title">
          <Terminal size={18} />
          <span>Model Context Protocol (MCP) Introspection Bridge</span>
          <span className="mcp-badge">Online</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {tools.length} Tools Ready
          </span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {isOpen && (
        <div className="mcp-content">
          <p className="mcp-intro">
            This application exposes an autonomous Model Context Protocol bridge at{' '}
            <code style={{ color: 'var(--accent-primary)' }}>window.__TODO_MCP_BRIDGE__</code>.
            External agents, scripts, and local MCP servers can discover tool schemas, introspect state,
            and perform CRUD executions programmatically.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={16} color="var(--accent-primary)" /> Registered MCP Tools
            </span>
            <button
              type="button"
              onClick={handleCopyManifest}
              className="btn-pill"
              title="Copy full MCP JSON Schema"
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied Schema' : 'Copy MCP Schema'}</span>
            </button>
          </div>

          <div className="mcp-tools-grid">
            {tools.map(tool => (
              <div
                key={tool.name}
                className="mcp-tool-card"
                style={{
                  borderColor: selectedTool === tool.name ? 'var(--accent-primary)' : undefined,
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectTool(tool.name)}
                role="button"
                tabIndex={0}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mcp-tool-name">{tool.name}</span>
                  {selectedTool === tool.name && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                      SELECTED
                    </span>
                  )}
                </div>
                <span className="mcp-tool-desc">{tool.description}</span>
              </div>
            ))}
          </div>

          <div className="mcp-live-tester">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Live Execution: <code style={{ color: 'var(--accent-primary)' }}>{selectedTool}</code>
              </span>
              <button
                type="button"
                onClick={handleRunTool}
                className="btn-create-submit"
                disabled={isExecuting}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
              >
                <Play size={14} />
                <span>{isExecuting ? 'Running...' : 'Execute Tool'}</span>
              </button>
            </div>

            <textarea
              className="description-textarea"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
              value={paramsInput}
              onChange={e => setParamsInput(e.target.value)}
              rows={3}
              placeholder="Arguments in JSON format..."
              aria-label="MCP Tool JSON parameters"
            />

            {consoleOutput && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  MCP Server Response:
                </span>
                <pre className="mcp-console-output">{consoleOutput}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
