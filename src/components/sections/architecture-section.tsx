'use client';

import { motion } from 'framer-motion';
import { Server, Database, Zap, Video, Eye, Brain, Lock, Wifi } from 'lucide-react';
import { fadeInUp, staggerContainer, cardVariants } from '@/lib/animations';
import { Section, SectionHeader } from '@/components/layout/section';

// ═══════════════════════════════════════════════════════════════════════════
// ARCHITECTURE SECTION - Showcase the 8 Microservices
// ═══════════════════════════════════════════════════════════════════════════

const microservices = [
  {
    icon: Server,
    name: 'API Gateway',
    description: 'Central routing with rate limiting and authentication',
    tech: 'Kong / Express',
  },
  {
    icon: Lock,
    name: 'Auth Service',
    description: 'OAuth 2.0 + JWT token management and SSO',
    tech: 'Passport.js',
  },
  {
    icon: Wifi,
    name: 'Session Manager',
    description: 'Interview state and participant coordination',
    tech: 'Redis Cluster',
  },
  {
    icon: Zap,
    name: 'WebSocket Hub',
    description: 'Real-time event streaming at 60 FPS',
    tech: 'Socket.io',
  },
  {
    icon: Brain,
    name: 'AI Detection',
    description: 'Multi-LLM comparison and XGBoost classification',
    tech: 'Python / FastAPI',
  },
  {
    icon: Eye,
    name: 'Eye Tracking',
    description: 'MediaPipe processing with Kalman filtering',
    tech: 'WASM / WebGL',
  },
  {
    icon: Database,
    name: 'Response Timing',
    description: 'Keystroke dynamics and timing analysis',
    tech: 'TimescaleDB',
  },
  {
    icon: Video,
    name: 'Video Pipeline',
    description: 'WebRTC via mediasoup SFU for 100+ streams',
    tech: 'mediasoup',
  },
];

const dataStack = [
  {
    name: 'PostgreSQL 18',
    description: 'Primary data store with JSONB for flexible schemas',
  },
  {
    name: 'TimescaleDB',
    description: 'Hypertables with 30-day retention for time-series metrics',
  },
  {
    name: 'pgvector',
    description: '384-dimensional embeddings for semantic similarity',
  },
  {
    name: 'Redis Cluster',
    description: '6-node cluster for session state and caching',
  },
  {
    name: 'RabbitMQ',
    description: '20 queues for async event processing',
  },
];

export function ArchitectureSection() {
  return (
    <Section id="architecture" background="surface">
      <SectionHeader
        title="Enterprise-Grade Architecture"
        subtitle="8 specialized microservices, purpose-built databases, and real-time video infrastructure designed for scale and reliability."
      />

      {/* Microservices Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
      >
        {microservices.map((service) => (
          <motion.div
            key={service.name}
            variants={cardVariants}
            className="glass-panel glass-hover p-5"
          >
            <div className="w-10 h-10 rounded-lg bg-blockd-accent/10 flex items-center justify-center mb-3">
              <service.icon className="w-5 h-5 text-blockd-accent" />
            </div>
            <h4 className="font-display font-semibold text-blockd-light text-sm mb-1">
              {service.name}
            </h4>
            <p className="text-xs text-blockd-muted mb-2">
              {service.description}
            </p>
            <span className="text-xs font-mono text-blockd-accent/70">
              {service.tech}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Data Stack */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="glass-panel p-8"
      >
        <h3 className="font-display font-semibold text-xl text-blockd-light mb-6 text-center">
          Purpose-Built Data Infrastructure
        </h3>
        <div className="grid md:grid-cols-5 gap-4">
          {dataStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blockd-accent/10 border border-blockd-accent/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-blockd-accent" />
              </div>
              <h4 className="font-mono text-sm font-semibold text-blockd-light mb-1">
                {tech.name}
              </h4>
              <p className="text-xs text-blockd-muted">
                {tech.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Section>
  );
}
