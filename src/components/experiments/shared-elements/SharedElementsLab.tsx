/**
 * File: src/components/experiments/shared-elements/SharedElementsLab.tsx
 * Description: Shared-element transition experiment: a card morphs into its detail page.
 * Uses the Web View Transitions API with Framer Motion layoutId interpolation, alongside
 * Jetpack Compose SharedTransitionLayout code ready for Android handoff.
 */
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useMotion } from '@/components/display/DisplayProvider';

interface ProjectCard {
  id: string;
  number: string;
  title: string;
  category: string;
  summary: string;
  detailText: string;
  accent: string;
  stats: { label: string; value: string }[];
}

const CARDS: ProjectCard[] = [
  {
    id: 'nexus',
    number: '01',
    title: 'The Nexus',
    category: 'Spatial Knowledge Matrix',
    summary: 'A constellation of human thought rendered as an infinite starry tapestry with letter-coded anchors.',
    detailText: 'The Nexus organizes collective discourse into dimensional star clusters. Rather than flat chronological feeds, debates exist as orbital coordinates where truth resonance is weighted without explicit vanity badges.',
    accent: 'var(--t1)',
    stats: [
      { label: 'Nodes', value: '1,420' },
      { label: 'Resonance', value: '98.4%' },
      { label: 'Clusters', value: '6 Pillars' },
    ],
  },
  {
    id: 'chronolyst',
    number: '02',
    title: 'ChronoLyst',
    category: 'Relativistic Timeline',
    summary: 'Time parsed through letter lengths and author identities, establishing causal momentum across threads.',
    detailText: 'ChronoLyst introduces non-linear timeline navigation where events expand and contract based on participant consensus. Each milestone is letter-encoded with identity gradients that preserve conversational lineage.',
    accent: 'var(--t2)',
    stats: [
      { label: 'Cadence', value: 'Sub-second' },
      { label: 'Events', value: '3,892' },
      { label: 'Span', value: '12 Epochs' },
    ],
  },
  {
    id: 'sovereign',
    number: '03',
    title: 'Sovereign Protocol',
    category: 'Decentralized Trust',
    summary: 'Internal trust verification without public reputation badges or performative virtue signaling.',
    detailText: 'Sovereign Protocol anchors cryptographic trust inside the local device client. No public clout badges or reputation scores are ever painted on a human: all moderation signals remain strictly thread-scoped.',
    accent: 'var(--node-4)',
    stats: [
      { label: 'Privacy', value: 'Zero-Knowledge' },
      { label: 'Latency', value: '12ms' },
      { label: 'Audited', value: 'Complete' },
    ],
  },
];

export default function SharedElementsLab() {
  const m = useMotion();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'interactive' | 'compose' | 'web'>('interactive');

  const selectedCard = CARDS.find((c) => c.id === selectedId);

  const handleSelect = (id: string) => {
    // Web View Transitions API integration
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        setSelectedId(id);
      });
    } else {
      setSelectedId(id);
    }
  };

  const handleBack = () => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
        setSelectedId(null);
      });
    } else {
      setSelectedId(null);
    }
  };

  const COMPOSE_SHARED_SNIPPET = `// Android Jetpack Compose Shared-Element Transitions (Compose 1.7+)
import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.SharedTransitionLayout
import androidx.compose.animation.SharedTransitionScope
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@OptIn(ExperimentalSharedTransitionApi::class)
@Composable
fun MainScreen() {
    SharedTransitionLayout {
        var selectedItem by remember { mutableStateOf<ProjectCard?>(null) }

        AnimatedContent(targetState = selectedItem, label = "card_morph") { target ->
            if (target == null) {
                CardGrid(
                    cards = cardList,
                    onCardClick = { card -> selectedItem = card },
                    animatedVisibilityScope = this
                )
            } else {
                CardDetail(
                    card = target,
                    onBack = { selectedItem = null },
                    animatedVisibilityScope = this
                )
            }
        }
    }
}

@Composable
fun SharedTransitionScope.CardItem(
    card: ProjectCard,
    onClick: () -> Unit,
    animatedVisibilityScope: AnimatedVisibilityScope
) {
    Column(
        modifier = Modifier
            .sharedBounds(
                rememberSharedContentState(key = "card_\${card.id}"),
                animatedVisibilityScope = animatedVisibilityScope
            )
            .clickable(onClick = onClick)
    ) {
        Text(
            text = card.title,
            modifier = Modifier.sharedElement(
                rememberSharedContentState(key = "title_\${card.id}"),
                animatedVisibilityScope = animatedVisibilityScope
            )
        )
    }
}`;

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-10">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink transition-colors">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">
          Shared Elements
        </h1>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">
          A card fluidly morphs into its full detail view with spring momentum.
        </p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Seamless spatial continuity between list states and detail states.
          On the web, powered by the View Transitions API and Framer Motion layoutId interpolation.
          In Android Compose, powered by SharedTransitionLayout and sharedBounds.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-[var(--rail)] pb-3">
        {(['interactive', 'compose', 'web'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="fw-kicker text-[12px] transition-colors min-h-[36px]"
            style={{
              color: activeTab === tab ? 'var(--t1)' : 'var(--ink-3)',
              borderBottom: activeTab === tab ? '2px solid var(--t1)' : 'none',
            }}
          >
            {tab === 'interactive' ? '01 · Interactive Morph' : tab === 'compose' ? '02 · Compose SharedTransitionLayout' : '03 · Web View Transitions API'}
          </button>
        ))}
      </div>

      {activeTab === 'interactive' && (
        <section className="relative min-h-[480px] pt-8">
          <AnimatePresence mode="wait">
            {!selectedCard ? (
              /* Card Grid View */
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: m.scale ? 0.3 : 0 }}
                className="grid gap-8 sm:grid-cols-3"
              >
                {CARDS.map((card) => (
                  <motion.div
                    key={card.id}
                    layoutId={`card-container-${card.id}`}
                    onClick={() => handleSelect(card.id)}
                    className="group relative flex flex-col items-start gap-4 p-6 border border-[var(--rail)] cursor-pointer hover:border-t1 transition-colors min-h-[280px]"
                    style={{
                      viewTransitionName: `card-${card.id}`,
                    }}
                  >
                    <div className="flex w-full items-baseline justify-between">
                      <motion.span
                        layoutId={`card-num-${card.id}`}
                        className="fw-kicker fw-tabular text-[12px] text-t1"
                      >
                        {card.number}
                      </motion.span>
                      <motion.span
                        layoutId={`card-cat-${card.id}`}
                        className="fw-kicker text-[10px] text-ink-3 uppercase tracking-[1.5px]"
                      >
                        {card.category}
                      </motion.span>
                    </div>

                    <motion.h2
                      layoutId={`card-title-${card.id}`}
                      className="fw-big text-[26px] font-light tracking-wide text-ink group-hover:text-t1 transition-colors"
                    >
                      {card.title}
                    </motion.h2>

                    <motion.p
                      layoutId={`card-sum-${card.id}`}
                      className="text-[14px] font-light leading-[1.5] text-ink-2"
                    >
                      {card.summary}
                    </motion.p>

                    <div className="mt-auto pt-4 flex items-center gap-2">
                      <span className="fw-kicker text-[11px] text-t1 group-hover:text-ink transition-colors">
                        Inspect Detail →
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* Expanded Detail View */
              <motion.div
                key="detail"
                layoutId={`card-container-${selectedCard.id}`}
                className="relative flex flex-col gap-8 p-8 border border-t1"
                style={{
                  viewTransitionName: `card-${selectedCard.id}`,
                }}
              >
                <div className="flex items-center justify-between border-b border-[var(--rail)] pb-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="fw-kicker text-t1 hover:text-ink transition-colors min-h-[36px] flex items-center"
                  >
                    ← Back to Cards
                  </button>
                  <motion.span
                    layoutId={`card-num-${selectedCard.id}`}
                    className="fw-kicker fw-tabular text-[13px] text-t1"
                  >
                    {selectedCard.number} / 03
                  </motion.span>
                </div>

                <div className="flex flex-col gap-2">
                  <motion.span
                    layoutId={`card-cat-${selectedCard.id}`}
                    className="fw-kicker text-[12px] text-t1 uppercase tracking-[2px]"
                  >
                    {selectedCard.category}
                  </motion.span>
                  <motion.h2
                    layoutId={`card-title-${selectedCard.id}`}
                    className="fw-vogue text-[clamp(32px,5vw,56px)] leading-[1.1] text-ink"
                  >
                    {selectedCard.title}
                  </motion.h2>
                </div>

                <motion.p
                  layoutId={`card-sum-${selectedCard.id}`}
                  className="fw-big text-[22px] font-light leading-[1.35] text-ink max-w-[40ch]"
                >
                  {selectedCard.summary}
                </motion.p>

                <p className="text-[16px] font-light leading-[1.65] text-ink-2 max-w-[54ch]">
                  {selectedCard.detailText}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[var(--rail)]/50">
                  {selectedCard.stats.map((s, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <span className="fw-kicker text-[10px] text-ink-3">{s.label}</span>
                      <span className="fw-tabular text-[20px] font-light text-t1">{s.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {activeTab === 'compose' && (
        <section className="flex flex-col gap-4 pt-8">
          <div className="flex items-baseline justify-between">
            <span className="fw-kicker text-t1">Jetpack Compose SharedTransitionLayout</span>
            <span className="fw-tabular text-[12px] text-ink-3">Compose 1.7+ &bull; sharedElement &bull; sharedBounds</span>
          </div>
          <pre className="overflow-x-auto p-5 text-[13px] font-mono leading-[1.6] text-ink-2 border border-[var(--rail)] bg-[var(--canvas)] select-all">
            {COMPOSE_SHARED_SNIPPET}
          </pre>
        </section>
      )}

      {activeTab === 'web' && (
        <section className="flex flex-col gap-4 pt-8">
          <div className="flex items-baseline justify-between">
            <span className="fw-kicker text-t1">Web View Transitions API</span>
            <span className="fw-tabular text-[12px] text-ink-3">document.startViewTransition</span>
          </div>
          <pre className="overflow-x-auto p-5 text-[13px] font-mono leading-[1.6] text-ink-2 border border-[var(--rail)] bg-[var(--canvas)] select-all">
{`// Native Browser View Transitions API
function navigateWithViewTransition(updateDOM: () => void) {
  if (!document.startViewTransition) {
    updateDOM();
    return;
  }
  document.startViewTransition(() => {
    updateDOM();
  });
}

// In CSS:
// .card { view-transition-name: card-item; }
// ::view-transition-old(card-item),
// ::view-transition-new(card-item) {
//   animation-duration: 0.35s;
//   animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
// }`}
          </pre>
        </section>
      )}
    </main>
  );
}
