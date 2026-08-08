# Pencil AI — Current Architecture & Status

_Snapshot as of this session. Legend: 🟢 real & working · 🟡 built but needs a live key/auth · 🔴 not built / still mocked or fake._

## 1. Status Legend

| Status | Meaning |
|---|---|
| 🟢 | Fully working today, verified live |
| 🟡 | Code exists, needs a credential or manual step you haven't done yet |
| 🔴 | Not built, or currently fake/hardcoded |

---

## 2. System Architecture

```mermaid
flowchart TB
    classDef done fill:#1e3a2f,stroke:#4ade80,stroke-width:1.5px,color:#e5ffe9;
    classDef pending fill:#3a3520,stroke:#facc15,stroke-width:1.5px,color:#fff8e0;
    classDef missing fill:#3a1f1f,stroke:#f87171,stroke-width:1.5px,color:#ffecec;
    classDef neutral fill:#1e1e24,stroke:#3b3f46,stroke-width:1px,color:#d4d4d8;

    User(["User"]) --> FE

    subgraph FE["Frontend (React + Vite)"]
        Chat["ClaudeChatInterface\n🟢 real SSE streaming"]:::done
        Comp["CompetitorAdInput +\nCompetitorComparison\n🟢 working"]:::done
        Customizer["CustomizerDrawer\n🟢 working"]:::done
        Inspector["RightInspectorPanel\n🔴 hardcoded, ignores real run data"]:::missing
        Publish["Publish to Meta button\n🔴 only flips local UI state"]:::missing
    end

    Chat -- "POST /orchestrate" --> API
    Chat -- "GET /campaigns/stream/{id} (SSE)" --> API
    Chat -- "GET /campaigns/status/{id}" --> API

    subgraph BE["Backend (FastAPI)"]
        API["API Layer\n🟢 REST + SSE"]:::done
        Orchestrator["AgentOrchestrator\n🟢 reflexion loop, DB persist"]:::done
        DAG["12-node DAG Engine\n🟢 see pipeline diagram below"]:::done
        DB[("SQLite\n🟢 working\n(dev/test now isolated)")]:::done
    end

    API --> Orchestrator --> DAG
    Orchestrator --> DB

    subgraph Providers["Provider Waterfall (per call type)"]
        LLM["Copy Generation\nOpenAI -> Vertex -> Groq 🟢 -> Gemini(legacy) -> Mock"]:::done
        Vision["Image Generation\nOpenAI -> Vertex Imagen 🟡 -> Mock 🔴 (no live key yet)"]:::missing
        Audio["Voiceover\nElevenLabs 🟡 -> Mock 🔴 (no live key yet)"]:::missing
        Meta["Meta Staging\nGraph API (hand-rolled) 🟡 untested with real token"]:::pending
        VertexAuth["Vertex AI\n🟡 code ready, gcloud auth not run yet"]:::pending
    end

    DAG --> LLM
    DAG --> Vision
    DAG --> Audio
    DAG --> Meta
    LLM -.-> VertexAuth
    Vision -.-> VertexAuth
```

---

## 3. DAG Pipeline Topology (backend/app/graph/builder.py)

```mermaid
flowchart TD
    classDef done fill:#1e3a2f,stroke:#4ade80,stroke-width:1.5px,color:#e5ffe9;
    classDef pending fill:#3a3520,stroke:#facc15,stroke-width:1.5px,color:#fff8e0;
    classDef levelStyle fill:#18181b,stroke:#27272a,color:#a1a1aa;

    subgraph L1["Level 1"]
        N1["parse_brief\nIngest brief & brand DNA"]:::done
    end

    subgraph L2["Level 2 (parallel)"]
        N2["trend_rag\n(hardcoded trend data, not real Ad Library)"]:::pending
        N3["winner_rag\n(in-memory vector similarity)"]:::done
        N4["visual\nstock photo unless real key"]:::pending
        N5["competitor_analysis\nreal AI analysis of pasted ad"]:::done
    end

    subgraph L3["Level 3"]
        N6["copy_matrix\nreal AI copy, differentiated\nvs competitor"]:::done
    end

    subgraph L4["Level 4"]
        N7["scoring\nheuristic predictive score\n(not real ML)"]:::pending
    end

    subgraph L5["Level 5 (parallel)"]
        N8["audio\nmock unless ElevenLabs key"]:::pending
        N9["compliance\nreal regex brand-safety check"]:::done
        N10["clip_alignment\nsimulated cosine similarity"]:::pending
    end

    subgraph L6["Level 6"]
        N11["reflection_loop\nreal self-correction,\nloops back to L3"]:::done
    end

    subgraph L7["Level 7"]
        N12["meta_staging\nhand-rolled Graph API call,\nmock unless real token"]:::pending
    end

    N1 --> N2 & N3 & N4 & N5
    N2 --> N6
    N3 --> N6
    N5 --> N6
    N6 --> N7
    N7 --> N8 & N9 & N10
    N4 --> N10
    N8 --> N11
    N9 --> N11
    N10 --> N11
    N11 -->|"score/compliance OK"| N12
    N11 -.->|"reflexion triggered:\ncritique injected, loops back"| N6

    style L1 fill:#18181b,stroke:#27272a,color:#a1a1aa
    style L2 fill:#18181b,stroke:#27272a,color:#a1a1aa
    style L3 fill:#18181b,stroke:#27272a,color:#a1a1aa
    style L4 fill:#18181b,stroke:#27272a,color:#a1a1aa
    style L5 fill:#18181b,stroke:#27272a,color:#a1a1aa
    style L6 fill:#18181b,stroke:#27272a,color:#a1a1aa
    style L7 fill:#18181b,stroke:#27272a,color:#a1a1aa
```

---

## 4. Provider Fallback Chain (LLM + Competitor Analysis)

```mermaid
flowchart LR
    classDef done fill:#1e3a2f,stroke:#4ade80,stroke-width:1.5px,color:#e5ffe9;
    classDef pending fill:#3a3520,stroke:#facc15,stroke-width:1.5px,color:#fff8e0;
    classDef neutral fill:#1e1e24,stroke:#3b3f46,stroke-width:1px,color:#d4d4d8;

    Start(["Copy or competitor\nanalysis requested"]) --> A{"OPENAI_API_KEY set?"}
    A -- yes --> OpenAI["OpenAI GPT-4o 🔴\n(no key configured)"]:::pending
    A -- no --> B{"GOOGLE_CLOUD_PROJECT set?"}
    B -- yes --> Vertex["Vertex AI Gemini 🟡\n(needs gcloud auth)"]:::pending
    B -- no --> C{"GROQ_API_KEY_1/2/3 set?"}
    C -- yes --> Groq["Groq openai/gpt-oss-120b 🟢\nWORKING NOW"]:::done
    C -- no --> D{"GEMINI_API_KEY set?"}
    D -- yes --> Legacy["Gemini 1.5 Pro (AI Studio) 🟡"]:::pending
    D -- no --> Mock["Mock provider 🔴\ndeterministic fake copy"]:::pending

    OpenAI -.->|"fails / no key"| Vertex
    Vertex -.->|"fails / no auth"| Groq
    Groq -.->|"fails"| Legacy
    Legacy -.->|"fails / no key"| Mock
```

---

## 5. Quick Reference: What's Real vs Fake Right Now

| Component | Status | Note |
|---|---|---|
| Chat UI live progress | 🟢 | Real SSE, was 100% fake before this session |
| Competitor ad comparison | 🟢 | Real AI analysis, shapes generated copy |
| Ad copy generation | 🟢 | Real, via Groq |
| Image generation | 🔴 | Stock photos only — no live image key |
| Voiceover audio | 🔴 | Mock only — no ElevenLabs key |
| Predictive score | 🔴 | Keyword heuristic, not ML |
| Trend/competitor RAG | 🔴 | Hardcoded sample data |
| Brand compliance check | 🟢 | Real regex-based rule engine |
| Reflexion self-correction | 🟢 | Real, loops back and retries on failure |
| Meta Ads staging | 🟡 | Real API call shape, untested with live token |
| "Publish to Meta" button | 🔴 | Cosmetic only |
| Right inspector panel | 🔴 | Hardcoded, ignores real data |
| Vertex AI | 🟡 | Code ready, auth step pending |
| Test coverage | 🟢 | 25 tests passing, verified live multiple times |
