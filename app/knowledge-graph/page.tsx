'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { NetworkBackground } from '@/components/NetworkBackground';
import { ConnectionCard } from '@/components/ConnectionCard';
import { ModeToggle } from '@/components/ModeToggle';
import { ViewMode } from '@/types';
import { track } from '@vercel/analytics';
import * as d3 from 'd3';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};
import { 
  Network, 
  Brain, 
  Loader2, 
  X, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Maximize2 
} from 'lucide-react';

interface SavedConnection {
  id: string;
  field: string;
  analogy: string;
  explanation: string;
  fun_fact: string;
  emoji: string;
}

interface SavedTopic {
  id: string;
  title: string;
  created_at: string;
  connections: SavedConnection[];
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'topic' | 'field';
  fieldColor?: string;
  emoji?: string;
  topicRef?: SavedTopic;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const FIELD_COLORS: Record<string, string> = {
  Science: '#10b981',      // Emerald
  Mathematics: '#3b82f6',  // Blue
  Psychology: '#a855f7',   // Purple
  Philosophy: '#f59e0b',   // Amber
  History: '#f97316',      // Orange
  Art: '#ec4899',          // Pink
  Economics: '#14b8a6',    // Teal
  Design: '#8b5cf6',       // Violet
  Biology: '#84cc16',      // Lime
  Music: '#6366f1',        // Indigo
  Architecture: '#78716c', // Stone
  'Game Theory': '#06b6d4', // Cyan
  Sociology: '#f43f5e',    // Rose
  Engineering: '#0ea5e9',  // Sky
  Literature: '#d946ef',   // Fuchsia
  Ecology: '#059669',      // Dark Emerald
};

export default function KnowledgeGraphPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [topics, setTopics] = useState<SavedTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<SavedTopic | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mode, setMode] = useState<ViewMode>('serious');

  // Mobile View Fallback state
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'graph' | 'list'>('graph');

  const handleModeToggle = (newMode: ViewMode) => {
    setMode(newMode);
    track('mode_toggled', { page: 'knowledge-graph', mode: newMode });
  };

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Screen size detection for mobile fallback
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch saved topics
  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/topics');
      if (!res.ok) throw new Error('Failed to load topics.');
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (err) {
      console.error('Error fetching topics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTopics();
      track('knowledge_graph_viewed');
    }
  }, [status]);

  // Build and render graph
  useEffect(() => {
    if (isLoading || topics.length === 0 || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. Construct nodes and links
    const nodesMap = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    // First add unique fields present in saved connections
    topics.forEach((topic) => {
      topic.connections.forEach((conn) => {
        if (!nodesMap.has(`field-${conn.field}`)) {
          nodesMap.set(`field-${conn.field}`, {
            id: `field-${conn.field}`,
            label: conn.field,
            type: 'field',
            fieldColor: FIELD_COLORS[conn.field] || '#64748b',
          });
        }
      });
    });

    // Add topic nodes
    topics.forEach((topic) => {
      const topicNodeId = `topic-${topic.id}`;
      nodesMap.set(topicNodeId, {
        id: topicNodeId,
        label: topic.title,
        type: 'topic',
        emoji: topic.connections[0]?.emoji || '💡',
        topicRef: topic,
      });

      // Add links between topic node and its field nodes
      topic.connections.forEach((conn) => {
        links.push({
          source: topicNodeId,
          target: `field-${conn.field}`,
        });
      });
    });

    const nodes = Array.from(nodesMap.values());

    // 2. Select SVG and set dimensions
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Clear previous SVG content
    svg.selectAll('*').remove();

    // Add zoom container group
    const gContainer = svg.append('g').attr('class', 'graph-container');

    // Setup zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        gContainer.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);

    // Initial centering transform
    const initialScale = 0.85;
    const initialX = (width * (1 - initialScale)) / 2;
    const initialY = (height * (1 - initialScale)) / 2;
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(initialX, initialY).scale(initialScale));

    // 3. Create force simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(45));

    simulationRef.current = simulation;

    // 4. Render links
    const link = gContainer.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
      .style('stroke-dasharray', (d: any) => d.target.type === 'field' ? '4 4' : 'none');

    // 5. Render nodes groups
    const node = gContainer.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // 6. Draw node shapes
    // Topic nodes: larger indigo circles with inner icons/emoji
    // Field nodes: colored circles
    node.filter(d => d.type === 'topic')
      .append('circle')
      .attr('r', 24)
      .attr('fill', '#ffffff')
      .attr('stroke', '#6366f1')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0px 4px 10px rgba(99, 102, 241, 0.25))');

    node.filter(d => d.type === 'topic')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('font-size', '16px')
      .text(d => d.emoji || '💡');

    node.filter(d => d.type === 'field')
      .append('circle')
      .attr('r', 12)
      .attr('fill', d => d.fieldColor || '#64748b')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0px 2px 5px rgba(0, 0, 0, 0.15))');

    // 7. Labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.type === 'topic' ? 40 : 26)
      .attr('font-size', (d) => d.type === 'topic' ? '12px' : '10px')
      .attr('font-weight', (d) => d.type === 'topic' ? '700' : '600')
      .attr('fill', (d) => d.type === 'topic' ? '#0f172a' : '#475569')
      .attr('font-family', 'var(--font-outfit), sans-serif')
      .text(d => d.label);

    // 8. Hover highlighters
    node.on('mouseover', function (event, d) {
      // Highlight direct neighbors
      const neighbors = new Set<string>();
      neighbors.add(d.id);
      
      links.forEach((l: any) => {
        if (l.source.id === d.id) neighbors.add(l.target.id);
        if (l.target.id === d.id) neighbors.add(l.source.id);
      });

      node.style('opacity', (n) => neighbors.has(n.id) ? 1.0 : 0.2);
      link.style('stroke-opacity', (l: any) => (l.source.id === d.id || l.target.id === d.id) ? 1.0 : 0.1)
          .style('stroke', (l: any) => (l.source.id === d.id || l.target.id === d.id) ? '#6366f1' : '#e2e8f0');
    });

    node.on('mouseout', function () {
      node.style('opacity', 1.0);
      link.style('stroke-opacity', 0.6)
          .style('stroke', '#e2e8f0');
    });

    // 9. Click interaction
    node.on('click', function (event, d) {
      if (d.type === 'topic' && d.topicRef) {
        setSelectedTopic(d.topicRef);
      }
    });

    // 10. Simulation tick updates
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    });

    // Drag helper functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Zoom buttons listeners helper
    const handleZoomIn = () => svg.transition().call(zoomBehavior.scaleBy, 1.3);
    const handleZoomOut = () => svg.transition().call(zoomBehavior.scaleBy, 0.7);
    const handleReset = () => svg.transition().call(zoomBehavior.transform, d3.zoomIdentity.translate(initialX, initialY).scale(initialScale));

    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetBtn = document.getElementById('zoom-reset');

    zoomInBtn?.addEventListener('click', handleZoomIn);
    zoomOutBtn?.addEventListener('click', handleZoomOut);
    resetBtn?.addEventListener('click', handleReset);

    return () => {
      zoomInBtn?.removeEventListener('click', handleZoomIn);
      zoomOutBtn?.removeEventListener('click', handleZoomOut);
      resetBtn?.removeEventListener('click', handleReset);
      simulation.stop();
    };

  }, [isLoading, topics]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex flex-col text-slate-900 font-sans relative overflow-hidden">
        <NetworkBackground />
        <main className="w-full max-w-7xl mx-auto px-4 pb-20 relative z-10 flex-grow flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-widest font-heading">
                Mapping Knowledge Network...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-900 font-sans relative overflow-hidden">
      <NetworkBackground />

      <main className="w-full max-w-7xl mx-auto px-4 pb-20 relative z-10 flex-grow flex flex-col">
        <Navbar />

        {/* Header */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display flex items-center justify-center sm:justify-start gap-2">
              <Network className="w-8 h-8 text-indigo-600" />
              Knowledge Graph
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Visualize connections and clusters linking your saved topics. Drag to organize, hover to trace connections.
            </p>
          </div>
        </div>

        {topics.length === 0 ? (
          /* Empty State */
          <div className="flex-grow flex items-center justify-center py-12">
            <div className="w-full max-w-md text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-inner">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">
                Nothing saved yet
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Try exploring a topic in the Explorer first to populate your knowledge graph nodes.
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                Try exploring a topic
              </button>
            </div>
          </div>
        ) : (
          /* Active Graph / List State */
          <div className="flex-grow flex flex-col">
            {/* Mobile View Toggle Tabs */}
            {isMobile && (
              <div className="flex justify-center mb-6 z-20">
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-3xs">
                  <button
                    onClick={() => setActiveView('graph')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeView === 'graph'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Graph View
                  </button>
                  <button
                    onClick={() => setActiveView('list')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeView === 'list'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    List View
                  </button>
                </div>
              </div>
            )}

            {isMobile && activeView === 'list' ? (
              /* MOBILE ACCORDION LIST FALLBACK */
              <div className="space-y-4 max-w-2xl mx-auto w-full">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Topics</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                    {topics.length} total
                  </span>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {topics.map((item) => {
                    const isExpanded = selectedTopic?.id === item.id;
                    return (
                      <motion.div 
                        key={item.id}
                        variants={itemVariants}
                        className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs transition-all duration-200"
                      >
                        <button
                          onClick={() => setSelectedTopic(isExpanded ? null : item)}
                          className="w-full text-left p-5 flex items-center justify-between font-display font-extrabold text-base capitalize hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-xl shrink-0">{item.connections[0]?.emoji || '💡'}</span>
                            <span className="text-slate-900">{item.title}</span>
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">
                            {item.connections.length} fields
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50/20 p-5 space-y-6">
                            <div className="flex justify-end">
                              <ModeToggle mode={mode} onToggle={handleModeToggle} />
                            </div>
                            {item.connections.map((c, idx) => {
                              const formattedConn = {
                                id: c.id,
                                field: c.field as any,
                                analogy: c.analogy,
                                explanation: c.explanation,
                                funFact: c.fun_fact,
                                emoji: c.emoji,
                              };
                              return (
                                <ConnectionCard
                                  key={c.id}
                                  connection={formattedConn}
                                  mode={mode}
                                  index={idx}
                                  isSaved={true}
                                />
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            ) : (
              /* D3 GRAPH VIEW */
              <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative min-h-[500px]">
                {/* Graph Visual Canvas (8 cols or 12 if side panel is closed) */}
                <div className={`lg:col-span-12 rounded-3xl bg-white border border-slate-200 shadow-xs relative flex flex-col overflow-hidden min-h-[500px] transition-all`}>
                  
                  {/* Zoom Buttons Controls Overlay */}
                  <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 p-1 rounded-xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-xs">
                    <button
                      id="zoom-in"
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      id="zoom-out"
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      id="zoom-reset"
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      title="Reset View"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Instructions Tip */}
                  <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-[11px] font-medium tracking-wide flex items-center gap-1.5 shadow-sm border border-slate-800">
                    <Compass className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>Tip: Click any white central node to review saved connections.</span>
                  </div>

                  {/* SVGs Container */}
                  <div ref={containerRef} className="flex-grow w-full h-full min-h-[500px] z-10 bg-slate-50/20">
                    <svg ref={svgRef} className="w-full h-full block" />
                  </div>
                </div>

                {/* Slide-out Topic Connections Panel (Sidebar Overlay) */}
                <AnimatePresence>
                  {selectedTopic && !isMobile && (
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                      className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-lg bg-white/90 backdrop-blur-lg shadow-2xl border-l border-slate-200/80 flex flex-col"
                    >
                      {/* Panel Header */}
                      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 block mb-0.5">
                            Saved Connection Map
                          </span>
                          <h2 className="text-2xl font-bold text-slate-950 font-display capitalize">
                            {selectedTopic.title}
                          </h2>
                        </div>

                        <div className="flex items-center gap-3">
                          <ModeToggle mode={mode} onToggle={handleModeToggle} />
                          <button
                            onClick={() => setSelectedTopic(null)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Close drawer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Connection Cards Scroll view */}
                      <div className="flex-grow overflow-y-auto p-6 space-y-6">
                        {selectedTopic.connections.map((c, idx) => {
                          const formattedConn = {
                            id: c.id,
                            field: c.field as any,
                            analogy: c.analogy,
                            explanation: c.explanation,
                            funFact: c.fun_fact,
                            emoji: c.emoji,
                          };

                          return (
                            <ConnectionCard
                              key={c.id}
                              connection={formattedConn}
                              mode={mode}
                              index={idx}
                              isSaved={true}
                            />
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
