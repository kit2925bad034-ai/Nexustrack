import React, { useState } from 'react';
import { 
  Binary, 
  Layers, 
  Search, 
  Hash, 
  GitBranch, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Zap, 
  Check, 
  Info,
  Calendar
} from 'lucide-react';
import { useCourier } from '../context/CourierContext';
import { Checkpoint, Shipment } from '../types';

export const DsaInspectorView: React.FC = () => {
  const { 
    shipments, 
    selectedShipment, 
    setSelectedShipment, 
    getDoublyLinkedListForShipment,
    getHashMapDiagnostics,
    probeTrackingNumberInHashMap,
    getTreeMapVisualNodes,
    rollbackLastCheckpoint
  } = useCourier();

  const [activeDsaTab, setActiveDsaTab] = useState<'linkedList' | 'hashMap' | 'treeMap'>('linkedList');

  // Selected shipment for LinkedList inspection
  const [inspectTracking, setInspectTracking] = useState(
    selectedShipment?.trackingNumber || shipments[0]?.trackingNumber || ''
  );
  const currentInspectShipment = shipments.find(s => s.trackingNumber === inspectTracking) || shipments[0];
  const dlist = currentInspectShipment ? getDoublyLinkedListForShipment(currentInspectShipment.trackingNumber) : undefined;
  const visualNodes = dlist ? dlist.getVisualNodes() : [];
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0);

  // HashMap inspection
  const diagnostics = getHashMapDiagnostics();
  const [probeInput, setProbeInput] = useState(currentInspectShipment?.trackingNumber || 'QT-8921-4091');
  const [probeResult, setProbeResult] = useState<any>(null);

  // TreeMap range query state
  const visualTreeNodes = getTreeMapVisualNodes();

  const handleRunProbe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!probeInput.trim()) return;
    const res = probeTrackingNumberInHashMap(probeInput.trim().toUpperCase());
    setProbeResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Binary className="w-6 h-6 text-amber-500" />
            <span>Data Structure Engineering Visualizer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live internal state of the 3 foundational algorithms powering QuickTrack: Doubly LinkedList, HashMap, and Red-Black TreeMap.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveDsaTab('linkedList')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeDsaTab === 'linkedList'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Doubly LinkedList</span>
          </button>

          <button
            onClick={() => setActiveDsaTab('hashMap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeDsaTab === 'hashMap'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>HashMap O(1)</span>
          </button>

          <button
            onClick={() => setActiveDsaTab('treeMap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeDsaTab === 'treeMap'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>TreeMap (Red-Black)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DOUBLY LINKED LIST */}
      {activeDsaTab === 'linkedList' && (
        <div className="space-y-6">
          {/* Explanation Card */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-300">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white">Why Doubly LinkedList for Checkpoints?</span>
              <p className="text-slate-400">
                A courier shipment's journey is an ordered sequential chain of milestone events. With a <strong>Doubly Linked List</strong>, new checkpoint scans append at $O(1)$ time to the <code>tail</code>. Operators can step forward and backward through milestones, and last-scan rollbacks simply sever the tail node in $O(1)$ time without reindexing an array.
              </p>
            </div>
          </div>

          {/* Shipment selector for linked list */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Select Shipment:</span>
              <select
                value={inspectTracking}
                onChange={(e) => {
                  setInspectTracking(e.target.value);
                  setActiveNodeIndex(0);
                }}
                className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded text-amber-400 font-mono focus:outline-none"
              >
                {shipments.map(s => (
                  <option key={s.trackingNumber} value={s.trackingNumber}>
                    {s.trackingNumber} ({s.checkpoints.length} nodes)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => rollbackLastCheckpoint(currentInspectShipment.trackingNumber)}
                disabled={currentInspectShipment.checkpoints.length <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 rounded disabled:opacity-40 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rollback Tail Node</span>
              </button>
            </div>
          </div>

          {/* Visual Doubly LinkedList Chain */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-6 overflow-x-auto">
            <div className="flex items-center gap-4 min-w-max pb-4">
              {visualNodes.map((node, idx) => {
                const isSelected = idx === activeNodeIndex;
                return (
                  <React.Fragment key={node.id}>
                    {/* Node Box */}
                    <div
                      onClick={() => setActiveNodeIndex(idx)}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer w-64 ${
                        isSelected
                          ? 'bg-slate-900 border-amber-500 shadow-lg ring-2 ring-amber-500/20'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Node Header Badges */}
                      <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          Index: {node.index}
                        </span>
                        <div className="flex items-center gap-1">
                          {node.isHead && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40">
                              HEAD
                            </span>
                          )}
                          {node.isTail && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                              TAIL
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Memory & Data Body */}
                      <div className="space-y-1 text-xs">
                        <p className="font-mono text-amber-400 font-bold">{node.id}</p>
                        <p className="font-bold text-white text-sm">{node.data.status}</p>
                        <p className="text-[11px] text-slate-400 truncate">{node.data.facility}</p>
                        <p className="text-[10px] text-slate-500">{node.data.city}</p>
                      </div>

                      {/* Pointers Section */}
                      <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono space-y-0.5">
                        <div className="flex justify-between text-slate-400">
                          <span>prev:</span>
                          <span className={node.prevId ? 'text-cyan-400' : 'text-slate-600'}>
                            {node.prevId || 'NULL'}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>next:</span>
                          <span className={node.nextId ? 'text-cyan-400' : 'text-slate-600'}>
                            {node.nextId || 'NULL'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dual Bi-directional Connector Arrows */}
                    {idx < visualNodes.length - 1 && (
                      <div className="flex flex-col items-center justify-center gap-1 text-slate-500 px-1 select-none">
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-mono font-bold">
                          <span>&rarr; next</span>
                        </div>
                        <div className="flex items-center gap-1 text-cyan-400 text-xs font-mono font-bold">
                          <span>&larr; prev</span>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Stepper controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <button
                onClick={() => setActiveNodeIndex(Math.max(0, activeNodeIndex - 1))}
                disabled={activeNodeIndex === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-40 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Traverse Prev (node.prev)</span>
              </button>

              <span className="font-mono text-slate-400">
                Inspecting Node {activeNodeIndex + 1} of {visualNodes.length}
              </span>

              <button
                onClick={() => setActiveNodeIndex(Math.min(visualNodes.length - 1, activeNodeIndex + 1))}
                disabled={activeNodeIndex === visualNodes.length - 1}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-40 transition-colors"
              >
                <span>Traverse Next (node.next)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HASH MAP */}
      {activeDsaTab === 'hashMap' && (
        <div className="space-y-6">
          {/* Explanation Card */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-300">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white">Why HashMap for Shipment Lookups?</span>
              <p className="text-slate-400">
                When customers or barcode scanners query a package via tracking number, scanning through an array is $O(N)$ slow. A <strong>HashMap</strong> computes a 31-multiplier polynomial hash code of the string, maps it to a bucket index modulo table capacity, yielding instant <strong>$O(1)$ constant time lookup</strong>. Collisions are resolved via linked bucket chains.
              </p>
            </div>
          </div>

          {/* HashMap Health Gauges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
              <span className="text-slate-500 block">Bucket Array Capacity</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {diagnostics.shipmentMap.capacity}
              </span>
              <span className="text-[10px] text-slate-400">Default 16 buckets</span>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
              <span className="text-slate-500 block">Elements Stored (Size)</span>
              <span className="text-2xl font-black text-cyan-400 font-mono mt-1 block">
                {diagnostics.shipmentMap.size}
              </span>
              <span className="text-[10px] text-slate-400">Active shipment keys</span>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
              <span className="text-slate-500 block">Load Factor (n / capacity)</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                {diagnostics.shipmentMap.loadFactor}
              </span>
              <span className="text-[10px] text-slate-400">Threshold: 0.75 (rehash at {diagnostics.shipmentMap.threshold})</span>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
              <span className="text-slate-500 block">Collision Chains</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
                {diagnostics.shipmentMap.collisionCount}
              </span>
              <span className="text-[10px] text-slate-400">Max bucket depth: {diagnostics.shipmentMap.maxBucketDepth}</span>
            </div>
          </div>

          {/* Interactive Hash Probe Simulator */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Interactive O(1) Hash Probe Calculator</span>
            </h3>

            <form onSubmit={handleRunProbe} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter key to hash (e.g. QT-8921-4091)..."
                value={probeInput}
                onChange={(e) => setProbeInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-md text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-md transition-colors"
              >
                Compute Hash &amp; Probe
              </button>
            </form>

            {probeResult && (
              <div className="p-4 bg-slate-950 border border-cyan-500/40 rounded-lg text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Key: "{probeInput}"</span>
                  <span className={`font-bold ${probeResult.found ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {probeResult.found ? 'KEY FOUND (HIT)' : 'KEY NOT FOUND (MISS)'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 block">31-Bit Polynomial Hash:</span>
                    <span className="text-amber-400 font-bold">{probeResult.hash}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bucket Index (hash % 16):</span>
                    <span className="text-cyan-400 font-bold">Bucket [{probeResult.bucketIndex}]</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Search Traversal Steps:</span>
                    <span className="text-emerald-400 font-bold">{probeResult.steps} comparison(s) ($O(1)$)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bucket Array Visualizer */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Internal Bucket Array [0 .. {diagnostics.shipmentMap.capacity - 1}]</span>
              <span className="text-xs text-slate-400 font-mono font-normal">Chained Linked List Buckets</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {diagnostics.shipmentMap.buckets.map((b) => (
                <div
                  key={b.bucketIndex}
                  className={`p-3 rounded-lg border text-xs ${
                    b.entriesCount > 0
                      ? 'bg-slate-900 border-cyan-500/40 text-slate-200'
                      : 'bg-slate-900/30 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono mb-1.5">
                    <span className="font-bold text-cyan-400">Bucket [{b.bucketIndex}]</span>
                    <span className="text-[10px] text-slate-400">
                      {b.entriesCount} {b.entriesCount === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>

                  {b.entriesCount === 0 ? (
                    <span className="text-[11px] text-slate-600 font-mono">NULL</span>
                  ) : (
                    <div className="space-y-1 font-mono text-[11px]">
                      {b.keys.map((k, idx) => (
                        <div key={k} className="flex items-center gap-1 text-slate-300">
                          <span className="text-slate-600">&rarr;</span>
                          <span className="truncate">{k}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TREE MAP */}
      {activeDsaTab === 'treeMap' && (
        <div className="space-y-6">
          {/* Explanation Card */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-300">
            <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white">Why Red-Black TreeMap for Scheduled Delivery Dates?</span>
              <p className="text-slate-400">
                Logistics dispatchers must schedule, prioritize, and query shipments based on their <strong>Estimated Delivery Dates (ETA)</strong>. A <strong>TreeMap</strong> uses a self-balancing Red-Black binary search tree to guarantee $O(\log N)$ insertions, logarithmic lookups, and in-order sorted traversal. It enables fast range queries like <code>subMap(today, tomorrow)</code> to identify all packages due in the current dispatch window.
              </p>
            </div>
          </div>

          {/* Tree In-Order Traversal & Schedule Timeline */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Chronological In-Order Traversal (Sorted by Scheduled ETA)</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400">
                Total BST Nodes: {visualTreeNodes.length}
              </span>
            </div>

            <div className="space-y-3 font-sans">
              {shipments
                .slice()
                .sort((a, b) => a.estimatedDeliveryDate.localeCompare(b.estimatedDeliveryDate))
                .map((s, idx) => (
                  <div
                    key={s.trackingNumber}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-mono font-bold text-amber-400">{s.trackingNumber}</span>
                        <p className="text-slate-300">
                          {s.senderCity} &rarr; {s.receiverCity} ({s.serviceType.replace(/_/g, ' ')})
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono">
                      <span className="text-emerald-400 font-bold block">
                        ETA: {new Date(s.estimatedDeliveryDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Status: {s.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Visual Red-Black Tree Hierarchy Representation */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Red-Black Tree Visual Nodes</span>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> RED Node
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" /> BLACK Node
                </span>
              </div>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {visualTreeNodes.map((node) => {
                const isRed = node.color === 'RED';
                return (
                  <div
                    key={String(node.key)}
                    className={`p-3.5 rounded-lg border text-xs font-mono space-y-1.5 transition-all ${
                      isRed
                        ? 'bg-rose-950/20 border-rose-600/50 text-rose-200'
                        : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isRed ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {node.color} NODE
                      </span>
                      <span className="text-[10px] text-slate-400">Depth: {node.depth}</span>
                    </div>

                    <p className="font-bold text-white text-[11px] truncate">
                      Key: {String(node.key).split('#')[0]}
                    </p>
                    <p className="text-[11px] text-amber-400">
                      Tracking: {node.value.trackingNumber}
                    </p>

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 space-y-0.5">
                      <div>Left Child: <span className="text-slate-300">{node.leftKey ? String(node.leftKey).split('#')[1] : 'NULL'}</span></div>
                      <div>Right Child: <span className="text-slate-300">{node.rightKey ? String(node.rightKey).split('#')[1] : 'NULL'}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
