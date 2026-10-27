import React, { useState } from 'react';
import { 
  Database, 
  Play, 
  Code2, 
  Table, 
  Terminal, 
  Layers, 
  Check, 
  Copy, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle,
  FileCode
} from 'lucide-react';
import { useCourier } from '../context/CourierContext';
import { QueryExecutionResult } from '../jdbc/JdbcEngine';

export const JdbcStudioView: React.FC = () => {
  const { 
    jdbcEngine, 
    lastJdbcResult, 
    executeJdbcQuery, 
    jdbcTables 
  } = useCourier();

  const [sqlInput, setSqlInput] = useState(
    "SELECT tracking_number, status, service_type, shipping_fee, booking_date FROM shipments WHERE status = ? ORDER BY booking_date DESC;"
  );
  const [paramInput, setParamInput] = useState("OUT_FOR_DELIVERY");
  const [outputTab, setOutputTab] = useState<'resultSet' | 'javaCode' | 'tables'>('resultSet');
  const [activeTableTab, setActiveTableTab] = useState<'shipments' | 'customers' | 'checkpoints' | 'courier_agents'>('shipments');
  const [copiedCode, setCopiedCode] = useState(false);
  const [autoCommit, setAutoCommit] = useState(jdbcEngine.getAutoCommit());

  const sampleQueries = [
    {
      name: '1. Shipments by Status (PreparedStatement)',
      sql: 'SELECT tracking_number, status, service_type, shipping_fee, booking_date FROM shipments WHERE status = ? ORDER BY booking_date DESC;',
      defaultParam: 'OUT_FOR_DELIVERY',
    },
    {
      name: '2. Checkpoint Audit Trail by Tracking ID',
      sql: 'SELECT checkpoint_id, status, facility, city, operator_id, timestamp, description FROM checkpoints WHERE tracking_number = ? ORDER BY timestamp ASC;',
      defaultParam: 'QT-8921-4091',
    },
    {
      name: '3. Cross-Table JOIN: Shipments with Senders',
      sql: 'SELECT s.tracking_number, s.status, s.shipping_fee, s.sender_city, s.receiver_city, s.booking_date FROM shipments s JOIN customers c ON s.sender_id = c.customer_id;',
      defaultParam: '',
    },
    {
      name: '4. High-Volume Customer Accounts',
      sql: 'SELECT customer_id, full_name, phone, city, total_bookings, total_spent, tier FROM customers ORDER BY total_spent DESC;',
      defaultParam: '',
    },
    {
      name: '5. Update Delivery Status (PreparedStatement)',
      sql: 'UPDATE shipments SET status = ? WHERE tracking_number = ?;',
      defaultParam: 'IN_TRANSIT, QT-8921-4091',
    },
  ];

  const handleSelectSample = (sample: typeof sampleQueries[0]) => {
    setSqlInput(sample.sql);
    setParamInput(sample.defaultParam);
  };

  const handleExecute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = paramInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    executeJdbcQuery(sqlInput, params);
  };

  const handleToggleAutoCommit = (val: boolean) => {
    setAutoCommit(val);
    jdbcEngine.setAutoCommit(val);
  };

  const handleCommit = () => {
    jdbcEngine.commit();
    alert('java.sql.Connection.commit(): Transaction changes committed permanently.');
  };

  const handleRollback = () => {
    jdbcEngine.rollback();
    alert('java.sql.Connection.rollback(): Uncommitted transaction state reverted.');
  };

  const handleCopyJavaCode = () => {
    if (lastJdbcResult?.javaSnippet) {
      navigator.clipboard.writeText(lastJdbcResult.javaSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const currentResult: QueryExecutionResult | null = lastJdbcResult;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-cyan-400" />
            <span>JDBC &amp; Relational SQL Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Execute SQL queries using java.sql interfaces: Connection, PreparedStatement, ResultSet, and ResultSetMetaData.
          </p>
        </div>

        {/* JDBC Connection Bar */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connection: OPEN</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">url: {jdbcEngine.getConnectionUrl().split('@')[0]}</span>
        </div>
      </div>

      {/* Transaction Control Bar */}
      <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-300">Transaction Management:</span>
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-mono">
            <input
              type="checkbox"
              checked={autoCommit}
              onChange={(e) => handleToggleAutoCommit(e.target.checked)}
              className="rounded border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>setAutoCommit({autoCommit ? 'true' : 'false'})</span>
          </label>
        </div>

        {!autoCommit && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCommit}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[11px] transition-colors"
            >
              conn.commit()
            </button>
            <button
              onClick={handleRollback}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[11px] transition-colors"
            >
              conn.rollback()
            </button>
          </div>
        )}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sample Query Library & Editor */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Query Templates */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Pre-built JDBC PreparedStatements
            </span>
            <div className="space-y-1.5">
              {sampleQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(q)}
                  className="w-full text-left p-2 rounded-lg text-xs bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:text-white text-slate-300 transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{q.name}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Load</span>
                </button>
              ))}
            </div>
          </div>

          {/* SQL Editor Area */}
          <form onSubmit={handleExecute} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>PreparedStatement SQL</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Parameter placeholder: '?'</span>
            </div>

            <textarea
              rows={4}
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
            />

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                Parameters (comma separated for pstmt.setString(1, ?), etc.)
              </label>
              <input
                type="text"
                placeholder="e.g. OUT_FOR_DELIVERY or leave empty"
                value={paramInput}
                onChange={(e) => setParamInput(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/10"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Statement (pstmt.execute)</span>
            </button>
          </form>
        </div>

        {/* Right Column: Execution Output & Java Code Generator */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4 shadow-xl">
            
            {/* Output Tabs Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOutputTab('resultSet')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    outputTab === 'resultSet'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>ResultSet Table</span>
                </button>

                <button
                  onClick={() => setOutputTab('javaCode')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    outputTab === 'javaCode'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Java JDBC Code</span>
                </button>

                <button
                  onClick={() => setOutputTab('tables')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    outputTab === 'tables'
                      ? 'bg-purple-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Database Tables</span>
                </button>
              </div>

              {currentResult && (
                <span className="text-[11px] font-mono text-slate-400">
                  {currentResult.executionTimeMs} ms
                </span>
              )}
            </div>

            {/* TAB A: RESULTSET VIEWER */}
            {outputTab === 'resultSet' && (
              <div className="space-y-3">
                {currentResult?.error ? (
                  <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">java.sql.SQLException:</span>
                      <p className="font-mono mt-0.5">{currentResult.error}</p>
                    </div>
                  </div>
                ) : currentResult?.rowsAffected !== undefined ? (
                  <div className="p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-lg text-xs text-emerald-300">
                    <span className="font-bold">Execution Successful:</span>
                    <p className="font-mono mt-1">
                      Rows affected: {currentResult.rowsAffected} &middot; Transaction status: {currentResult.transactionStatus}
                    </p>
                  </div>
                ) : currentResult?.resultSet ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{currentResult.resultSet.rows.length} rows fetched via ResultSet.next()</span>
                      <span>Metadata columns: {currentResult.resultSet.columns.length}</span>
                    </div>

                    <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-800 rounded-lg">
                      <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-cyan-400">
                          <tr>
                            {currentResult.resultSet.columns.map((col, i) => (
                              <th key={i} className="py-2.5 px-3 whitespace-nowrap text-[11px]">
                                {col.name}
                                <span className="block text-[9px] text-slate-500 font-normal">{col.type}</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                          {currentResult.resultSet.rows.length === 0 ? (
                            <tr>
                              <td colSpan={currentResult.resultSet.columns.length || 1} className="py-8 text-center text-slate-500">
                                0 rows returned for this query.
                              </td>
                            </tr>
                          ) : (
                            currentResult.resultSet.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-800/40">
                                {currentResult?.resultSet?.columns.map((col, cIdx) => (
                                  <td key={cIdx} className="py-2 px-3 whitespace-nowrap text-slate-300 text-[11px]">
                                    {String(row[col.name] ?? 'NULL')}
                                  </td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 text-xs font-mono">
                    Execute a query to see ResultSet rows.
                  </div>
                )}
              </div>
            )}

            {/* TAB B: JAVA JDBC CODE GENERATOR */}
            {outputTab === 'javaCode' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Equivalent Production Java JDBC Code:</span>
                  <button
                    onClick={handleCopyJavaCode}
                    className="flex items-center gap-1 px-2.5 py-1 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded text-xs transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Java'}</span>
                  </button>
                </div>

                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-amber-300/90 overflow-x-auto max-h-96 overflow-y-auto leading-relaxed">
                  {currentResult?.javaSnippet || '// Execute a query to generate Java code'}
                </pre>
              </div>
            )}

            {/* TAB C: RAW DATABASE TABLES */}
            {outputTab === 'tables' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  {(['shipments', 'customers', 'checkpoints', 'courier_agents'] as const).map(tbl => (
                    <button
                      key={tbl}
                      onClick={() => setActiveTableTab(tbl)}
                      className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                        activeTableTab === tbl
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tbl} ({jdbcTables[tbl].length})
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-purple-300">
                      <tr>
                        {Object.keys(jdbcTables[activeTableTab][0] || {}).map((col, idx) => (
                          <th key={idx} className="py-2 px-3 whitespace-nowrap text-[11px]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                      {jdbcTables[activeTableTab].map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/40">
                          {Object.values(row).map((val: any, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 whitespace-nowrap text-slate-300 text-[11px]">
                              {String(val ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
