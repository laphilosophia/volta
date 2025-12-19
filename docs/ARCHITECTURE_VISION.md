# Volta Architecture Vision

> **Status**: Approved
> **Version**: 1.0
> **Date**: 2025-12-20
> **Authors**: Volta Core Team + Multi-Model Review

---

## Executive Summary

Volta is a **comprehensive framework for Low-Code/No-Code platforms**. It started as a PoC but is evolving into a production-grade framework. This document captures the core architectural decisions that will guide all future development.

**Core Philosophy:**

> "Specification own, implementation leverage where possible"

---

## Fundamental Distinctions

### Entity-First, Not UI-First

```
Traditional (React/Solid/Vue):
  Component renders → State exists → Lifecycle tied to DOM

Volta:
  Entity exists → May or may not render → Lifecycle independent of UI
```

An entity in Volta:

- Can exist without being rendered
- Can be rendered in multiple places simultaneously
- Has its own lifecycle independent of any UI framework

### Ownership Model

```
Entity lifecycle ≠ Reactive lifecycle

Entity     → Logical owner (what owns this data?)
Scope      → Execution owner (when does this cleanup?)
```

These must not be conflated. An entity may have reactive nodes in different scopes.

---

## Core Layers

### 1. Reactive Primitives (Own 100%)

```typescript
// Foundation: Sthira-based, extended for LC/NC
signal() // Atomic state
computed() // Derived state
effect() // Side effects
```

**Key Decision:** Extend Sthira, don't replace. Add LC/NC-specific features:

- Entity-scoped signals
- Batch updates with scheduling
- Priority-based effect execution

### 2. Ownership & Scopes (Own 100%)

```typescript
interface Disposable {
  dispose(): void // Eager cleanup
}

interface Finalizable {
  onFinalize(): void // GC fallback
}

interface Scoped {
  onScopeDispose(): void // Automatic ownership
}

class VoltaScope {
  private ownedResources: Disposable[] = []

  own<T extends Disposable>(resource: T): T {
    this.ownedResources.push(resource)
    return resource
  }

  dispose() {
    // Reverse order - child before parent
    for (let i = this.ownedResources.length - 1; i >= 0; i--) {
      this.ownedResources[i].dispose()
    }
  }
}
```

**Critical Rule:** Never rely on GC for correctness. Scope disposal is deterministic. GC only catches leaks.

### 3. State Distribution (Own 100%)

**Problem:** React Context causes full tree re-renders.

**Solution:** Graph-based dependency tracking with selector subscriptions.

```
Dependency Graph (not O(n) subscriber scan)
┌─────────────────────────────────┐
│  entityAtom                     │
│  ├── fieldA                     │
│  │   └── ComponentX (subscriber)│
│  └── fieldB                     │
│       └── ComponentY (subscriber)│
└─────────────────────────────────┘

Update: entityAtom.fieldA changed
→ Graph lookup: fieldA → ComponentX
→ O(1) notification, not O(n) scan
```

**Approach:** Solid's runtime graph, not Recoil. But entity-based, not UI-based.

### 4. Sync Protocol (Own Spec 100%, Impl 50%)

```typescript
const syncManager = volta.sync({
  layers: {
    memory: {
      adapter: signalsAdapter,
      conflictResolution: 'none', // Source of truth
    },
    tabs: {
      adapter: broadcastAdapter,
      conflictResolution: 'last-write-wins',
    },
    storage: {
      adapter: indexedDBAdapter,
      conflictResolution: 'version-vector',
    },
    server: {
      adapter: websocketAdapter,
      conflictResolution: 'intent-based', // Not CRDT
    },
  },
})
```

**Key Decision:** Per-layer conflict resolution. One size does not fit all.

**Intent vs CRDT:**

- Intent-based preferred for LC/NC (domain semantics)
- Requires command log + undo/redo
- Patch = derived artifact from intent

### 5. Schema & Semantic Diff (Own 100%)

```typescript
const diff = volta.diff(oldLayout, newLayout, schema)
// Result: { type: 'component:moved', id, from, to }

// NOT: { path: 'components.0.props.x', value: 100 }
```

**Critical Rule:** Semantic diff must be **canonical**.
Same state change → Always produces same diff.

This enables:

- Collaboration
- Undo/redo
- Analytics
- AI integration

### 6. Rendering Abstraction (Own 30%, Leverage 70%)

```
┌────────────────────────────────────┐
│  Volta Render Abstraction          │  ← Own this
├────────────────────────────────────┤
│  React Adapter │ Vue Adapter │ ... │  ← Leverage these
└────────────────────────────────────┘
```

Core render pipeline must be React-free.
React adapter = reference implementation, not the core.

---

## What We Own vs Leverage

| Area                   | Own | Leverage | Rationale                  |
| ---------------------- | --- | -------- | -------------------------- |
| Reactive primitives    | ✅  | -        | Heart of the framework     |
| Ownership scopes       | ✅  | -        | Memory correctness         |
| State distribution     | ✅  | -        | O(1) performance           |
| Sync protocol spec     | ✅  | -        | LC/NC semantics            |
| Schema + semantic diff | ✅  | -        | Competitive advantage      |
| Rendering abstraction  | ✅  | -        | Control point              |
| Sync protocol impl     | ◐   | ◐        | Per-layer decision         |
| Rendering impl         | ○   | ✅       | React/Vue/Solid adapters   |
| Binary codec           | -   | ✅       | MessagePack/FlatBuffers    |
| Transport              | -   | ✅       | WebSocket/IndexedDB/WebRTC |

---

## Transport Design (Day 1 Readiness for WebRTC)

WebRTC is not Day 1, but transport interface must accommodate it:

```typescript
interface VoltaTransport {
  // Connection lifecycle (WebRTC needs this)
  connect(): Promise<void>
  disconnect(): Promise<void>
  onConnectionStateChange(cb: (state: ConnectionState) => void): void

  // Partial failure (P2P reality)
  onPeerDisconnect(cb: (peerId: string) => void): void

  // Peer identity (collaboration)
  getPeerId(): string
  getPeers(): string[]

  // Messaging
  send(message: VoltaMessage): void
  subscribe(cb: (message: VoltaMessage) => void): () => void
}
```

This interface works for:

- WebSocket (single "peer" = server)
- BroadcastChannel (same-origin tabs)
- WebRTC (true P2P)

---

## The 60% Trap

**Biggest Risk:** Producing a framework that is:

- Not as ergonomic as React
- Not as fast as Solid
- Not as correct as CRDT

**Prevention:**

1. Core stays **narrow, sharp, ruthless**
2. Every feature passes the gate: **"Is this core or adapter?"**
3. No shortcuts in core - ever
4. Adapters can be pragmatic, core cannot

---

## Decision Framework

For every new feature:

```
┌─────────────────────────────────────────┐
│  "Is this core or adapter?"             │
├─────────────────────────────────────────┤
│  Core criteria:                         │
│  - Required for correctness             │
│  - Cannot be done outside               │
│  - Affects all consumers                │
├─────────────────────────────────────────┤
│  Adapter criteria:                      │
│  - Framework-specific                   │
│  - Optional enhancement                 │
│  - Can be replaced/skipped              │
└─────────────────────────────────────────┘
```

If unclear → It's an adapter.

---

## Version Roadmap

| Version | Focus                      | Core Changes        |
| ------- | -------------------------- | ------------------- |
| v0.7    | Signal-powered React hooks | Bridge layer        |
| v0.8    | Ownership scopes           | Memory model        |
| v0.9    | Sync protocol v1           | Per-layer CR        |
| v1.0    | Schema + semantic diff     | Canonical diff      |
| v1.x    | WebRTC collaboration       | Transport expansion |

---

## Final Word

Volta can become a comprehensive LC/NC framework.
But this means **"control the control points"**, not **"write everything"**.

This document is the constitution. All future decisions reference it.

---

_Approved after multi-model architectural review, 2025-12-20_
