'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, BarChart2, FileText, Layers } from 'lucide-react';
import { cn } from '@/lib/cn';
import { fadeInUp, staggerContainer, cardVariants } from '@/lib/animations';
import { Section, SectionHeader } from '@/components/layout/section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { SimilarityChart } from '@/components/visualizations/similarity-chart';
import { RiskGauge } from '@/components/visualizations/risk-gauge';

// ═══════════════════════════════════════════════════════════════════════════
// AI DETECTION SECTION
// ═══════════════════════════════════════════════════════════════════════════

const pipelineSteps = [
  { number: 1, title: 'Question Captured', description: 'Interview question extracted and processed in real-time', icon: FileText },
  { number: 2, title: 'Multi-LLM Generation', description: 'GPT-4, Claude 3.5 Sonnet, and Gemini 1.5 Pro generate comparative answers', icon: Brain },
  { number: 3, title: 'Embedding Comparison', description: 'pgvector computes 384-dimensional semantic similarity', icon: Layers },
  { number: 4, title: 'Linguistic Analysis', description: 'Perplexity scoring, n-gram overlap, and stylometric fingerprinting', icon: BarChart2 },
  { number: 5, title: 'XGBoost Ensemble', description: 'Ensemble classification produces final risk score: 0.00 to 1.00', icon: Zap },
];

function DetectionPipeline() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="space-y-4"
    >
      {pipelineSteps.map((step, index) => (
        <motion.div
          key={step.number}
          variants={cardVariants}
          className="flex items-start gap-4"
        >
          {/* Step number and line */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-10 h-10 rounded-full bg-blockd-accent/10 border border-blockd-accent/30 flex items-center justify-center text-blockd-accent font-mono font-medium">
              {step.number}
            </div>
            {index < pipelineSteps.length - 1 && (
              <div className="w-px h-8 bg-gradient-to-b from-blockd-accent/30 to-transparent mt-2" />
            )}
          </div>

          {/* Content */}
          <div className="pb-4">
            <div className="flex items-center gap-2">
              <step.icon className="w-4 h-4 text-blockd-accent" />
              <h4 className="font-display font-semibold text-blockd-light">
                {step.title}
              </h4>
            </div>
            <p className="text-sm text-blockd-muted mt-1">
              {step.description}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function InteractiveDemo() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    similarity: { gpt4: number; claude: number; gemini: number };
    riskScore: number;
  } | null>(null);

  const handleAnalyze = () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setResults(null);

    // Simulate analysis
    setTimeout(() => {
      // Generate realistic-looking results based on text length and patterns
      const textLength = text.length;
      const hasListPattern = text.includes('1.') || text.includes('•') || text.includes('-');
      const hasComplexStructure = text.split('\n').length > 3;

      // Longer, more structured text tends to look more AI-like
      const baseScore = Math.min(0.3 + (textLength / 2000) * 0.4, 0.7);
      const structureBonus = hasListPattern ? 0.15 : 0;
      const complexityBonus = hasComplexStructure ? 0.1 : 0;

      const similarity = {
        gpt4: Math.round((baseScore + structureBonus + Math.random() * 0.1) * 100),
        claude: Math.round((baseScore + complexityBonus + Math.random() * 0.1) * 100),
        gemini: Math.round((baseScore + Math.random() * 0.15) * 100),
      };

      const riskScore = Math.min(
        0.95,
        Math.max(0.1, (similarity.gpt4 + similarity.claude + similarity.gemini) / 300)
      );

      setResults({ similarity, riskScore });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <motion.div
      variants={fadeInUp}
      className="glass-panel p-6 mt-12"
    >
      <h3 className="font-display font-semibold text-xl text-blockd-light mb-4">
        Try It Yourself
      </h3>
      <p className="text-sm text-blockd-muted mb-4">
        Paste a sample answer to see a simulated AI analysis. <span className="text-blockd-muted/60">(Demo purposes only)</span>
      </p>

      <Textarea
        placeholder="Paste a sample answer to analyze..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mb-4"
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <Button
          variant="primary"
          onClick={handleAnalyze}
          disabled={!text.trim() || isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
        </Button>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 grid sm:grid-cols-2 gap-4"
          >
            <div className="glass-panel--background p-4">
              <p className="text-xs font-mono uppercase tracking-wider text-blockd-muted mb-3">
                Similarity Scores
              </p>
              <SimilarityChart data={results.similarity} />
            </div>
            <div className="glass-panel--background p-4 flex items-center justify-center">
              <RiskGauge value={results.riskScore} size={160} />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function AIDetectionSection() {
  return (
    <Section id="ai-detection" background="gradient">
      <SectionHeader
        title="AI Fighting AI"
        subtitle="The only way to reliably detect AI assistance is to understand how AI responds. We compare answers from all top models, including GPT 5.2, Gemini 3, and more, then classify with XGBoost ensemble ML."
      />

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left - Visualizations */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-8"
        >
          {/* Similarity Chart */}
          <motion.div variants={fadeInUp} className="glass-panel p-6">
            <h3 className="font-display font-semibold text-lg text-blockd-light mb-4">
              AI Similarity Analysis
            </h3>
            <p className="text-xs font-mono uppercase tracking-wider text-blockd-muted mb-4">
              Human-written answer
            </p>
            <SimilarityChart data={{ gpt4: 23, claude: 19, gemini: 21 }} />
          </motion.div>

          {/* Risk Gauge */}
          <motion.div variants={fadeInUp} className="glass-panel p-6">
            <h3 className="font-display font-semibold text-lg text-blockd-light mb-4 text-center">
              Overall Risk Score
            </h3>
            <div className="flex justify-center">
              <RiskGauge value={0.21} size={200} />
            </div>
          </motion.div>
        </motion.div>

        {/* Right - Detection Pipeline */}
        <div>
          <h3 className="font-display font-semibold text-xl text-blockd-light mb-6">
            Detection Pipeline
          </h3>
          <DetectionPipeline />
        </div>
      </div>

      {/* Interactive Demo */}
      <InteractiveDemo />
    </Section>
  );
}
