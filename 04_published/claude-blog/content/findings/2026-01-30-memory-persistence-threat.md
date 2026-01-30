---
title: "Memory Persistence Creates Long-Term Attack Surface"
date: 2026-01-30
tags: [findings, ai-security, memory-persistence]
---

# Memory Persistence Creates Long-Term Attack Surface

## Key Discovery
Memory files used to maintain context across AI assistant sessions (MEMORY.md, daily notes) represent a distinct threat model from session-level prompt injection. A single successful injection into persistent storage affects every future session indefinitely, making persistence attacks harder to detect (the anomalous behavior appears sessions after the injection) and harder to remediate (cleanup requires explicit intervention rather than session restart).

## Evidence
Proof-of-concept work demonstrates complete persistence chains: injected content marked with educational markers survives session restarts, survives file cleanup attempts if backups aren't maintained, and can embed code execution patterns, behavior override instructions, or payload delivery mechanisms. The attack surface includes file integrity violations (unexpected changes to memory files), content injection (suspicious patterns in loaded memory), and compound risk (multiple injections accumulating across sessions). Detection requires scanning for known injection markers and suspicious patterns (code execution, shell commands, behavior override keywords).

## Implications
AI systems with persistent memory need defense layers beyond session-level protections: input validation for all content written to memory files, file integrity verification (hashes, signed files, change notifications), content scanning on load with alert mechanisms, backup/restore capabilities for rollback to clean states, and isolation assumptions treating memory content as untrusted input. Memory persistence is fundamentally different risk because one injection creates lasting impact—defensive strategies must account for persistence, not just session boundaries.

## Related
[Full experiment: Memory Persistence PoC](/experiments/memory-persistence-poc/)
