'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { fadeInUp, staggerContainer, cardVariants } from '@/lib/animations';
import { useCountup } from '@/hooks/use-countup';
import { Section, SectionHeader } from '@/components/layout/section';

// ═══════════════════════════════════════════════════════════════════════════
// SCALE / INTEGRATION SECTION
// ═══════════════════════════════════════════════════════════════════════════

const metrics = [
  { value: 500, suffix: '+', label: 'Concurrent Sessions' },
  { value: 30, suffix: '', label: 'FPS Eye Tracking', unit: 'FPS' },
  { value: 8, suffix: '', label: 'Microservices' },
  { value: 50, suffix: '', label: 'Gaze Latency', prefix: '<', unit: 'ms' },
];

const integrations = [
  { name: 'Greenhouse', logo: 'G' },
  { name: 'Lever', logo: 'L' },
  { name: 'Workday', logo: 'W' },
  { name: 'Okta', logo: 'O' },
  { name: 'Azure AD', logo: 'A' },
];

function MetricCard({
  value,
  suffix,
  prefix,
  unit,
  label,
  decimals = 0,
}: {
  value: number;
  suffix: string;
  prefix?: string;
  unit?: string;
  label: string;
  decimals?: number;
}) {
  const { ref, count } = useCountup({
    end: value,
    duration: 1500,
    decimals,
  });

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      className="glass-panel p-6 text-center"
    >
      <p className="text-4xl md:text-5xl font-mono font-bold text-blockd-light tabular-nums">
        {prefix}
        {count}
        {suffix}
        {unit && <span className="text-xl ml-1 text-blockd-muted">{unit}</span>}
      </p>
      <p className="text-sm text-blockd-muted mt-2">{label}</p>
    </motion.div>
  );
}

function CodePreview() {
  const code = `const blockd = new BlockdClient({ apiKey: 'your-api-key' });

const session = await blockd.sessions.create({
  interviewee: 'candidate@example.com',
  questions: ['Explain TCP vs UDP...'],
  webhookUrl: 'https://your-app.com/webhook'
});

// Candidate joins via session.joinUrl
// Real-time events stream to your webhook`;

  return (
    <motion.div
      variants={fadeInUp}
      className="glass-panel--background rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-blockd-muted/10 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blockd-risk-critical/60" />
        <div className="w-3 h-3 rounded-full bg-blockd-risk-medium/60" />
        <div className="w-3 h-3 rounded-full bg-blockd-risk-low/60" />
        <span className="ml-3 text-xs text-blockd-muted font-mono">api-example.ts</span>
      </div>

      {/* Code content */}
      <pre className="p-4 text-sm font-mono overflow-x-auto">
        <code className="text-blockd-muted">
          {code.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="w-8 text-blockd-muted/40 select-none text-right pr-4">
                {i + 1}
              </span>
              <span
                dangerouslySetInnerHTML={{
                  __html: line
                    .replace(/(const|await|new)/g, '<span class="text-purple-400">$1</span>')
                    .replace(/('.*?')/g, '<span class="text-green-400">$1</span>')
                    .replace(/(BlockdClient|sessions|create)/g, '<span class="text-blue-400">$1</span>')
                    .replace(/(\/\/.*)/g, '<span class="text-blockd-muted/50">$1</span>'),
                }}
              />
            </div>
          ))}
        </code>
      </pre>
    </motion.div>
  );
}

export function ScaleSection() {
  return (
    <Section id="scale">
      <SectionHeader
        title="Built for Enterprise Scale"
        subtitle="8 specialized microservices powered by TimescaleDB, Redis cluster, and WebRTC via mediasoup SFU. Handle hundreds of concurrent interviews with sub-50ms gaze latency."
      />

      {/* Metrics Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
      >
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Integrations */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h3 className="font-display font-semibold text-xl text-blockd-light mb-6">
            Integrates with your stack
          </h3>

          <div className="flex flex-wrap gap-4">
            {integrations.map((integration) => (
              <motion.div
                key={integration.name}
                variants={cardVariants}
                whileHover={{ scale: 1.05 }}
                className="glass-panel glass-hover px-6 py-4 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded bg-blockd-accent/20 flex items-center justify-center text-blockd-accent font-display font-bold text-sm">
                  {integration.logo}
                </div>
                <span className="text-blockd-light font-medium">
                  {integration.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* API Preview */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h3 className="font-display font-semibold text-xl text-blockd-light mb-6">
            Simple API Integration
          </h3>
          <CodePreview />
        </motion.div>
      </div>
    </Section>
  );
}
