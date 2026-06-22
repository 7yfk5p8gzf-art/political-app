# Political App Project Map

## Current MVP Flow

AI Search
→ Select Sources
→ Analyze Selected Sources
→ AI Contradiction Candidates
→ AI Analysis
→ Create Draft
→ Supabase contradictions
→ Admin Contradictions
→ Review / Publish

Status: working MVP flow.

---

## Main Admin Pages

### AI Search Workspace
File:
- app/admin/ai-search/page.tsx

Purpose:
- Runs AI search
- Shows results
- Allows source selection
- Runs contradiction finder
- Shows candidate review cards
- Creates contradiction drafts

Do not add more large logic here.
Future goal: move helper logic into smaller files.

---

### Admin Contradictions List
File:
- app/admin/contradictions/page.tsx

Purpose:
- Shows contradiction records from Supabase
- Displays draft/review/published status
- Allows status changes
- Shows old/new statements

---

### Admin Contradiction Detail
File:
- app/admin/contradictions/[id]/page.tsx

Purpose:
- Detail/edit page for one contradiction.

---

### Admin Review Page
File:
- app/admin/contradictions/review/page.tsx

Purpose:
- Review queue for draft/review items.

---

## API Routes

### AI Search
File:
- app/api/ai-search/route.ts

Purpose:
- Runs search
- Returns articles/videos/results
- Adds ranking, source metadata, contradiction signals

Do not rebuild unless search breaks.

---

### AI Contradiction Finder
File:
- app/api/admin/ai-contradiction-finder/route.ts

Purpose:
- Takes selected sources
- Builds source pairs
- Returns contradiction candidates

Current status:
- Working
- Has fallback/manual review candidates
- Needs better scoring later

---

### AI Contradiction Analysis
File:
- app/api/ai-contradiction-analysis/route.ts

Purpose:
- Uses OpenAI to analyze old vs new statement
- Returns analysis, confidence, severity, review status

---

## AI Logic Files

### Semantic Comparison
File:
- lib/ai/semanticComparison.ts

Purpose:
- Compares old/new statements
- Currently keyword/simple logic

Later:
- Improve with richer logic or OpenAI-assisted scoring.

---

### Stance Analysis
File:
- lib/ai/stanceAnalysis.ts

Purpose:
- Detects support/oppose/neutral signals.

---

### Contradiction Candidate
File:
- lib/ai/contradictionCandidate.ts

Purpose:
- Builds candidate strength from signals.

---

### Timeline Reasoning
File:
- lib/ai/timelineReasoning.ts

Purpose:
- Estimates timeline strength and years between.

---

### Political Evolution
File:
- lib/ai/politicalEvolution.ts

Purpose:
- Classifies whether a change is strategic/ideological/crisis/rhetorical/unclear.

---

### Old Statement Search
File:
- lib/ai/oldStatementSearch.ts

Purpose:
- Builds older statement search queries.

---

## Supabase Tables

### contradictions

Important fields:
- id
- slug
- politician
- topic
- old_statement
- new_statement
- old_source
- new_source
- ai_summary
- status
- review_status
- confidence_score
- severity_score
- created_at
- old_date
- new_date

Current status:
- Create Draft works
- status=draft works
- created_at works
- old_date/new_date currently often unknown

---

### sources

Purpose:
- Stores saved article/video sources.

---

## What Works Now

- AI Search
- Country/source search
- Video detection
- Source selection
- AI contradiction finder
- Candidate cards
- AI analysis
- Create Draft
- Supabase insert
- status=draft
- Admin contradictions list
- Review/Publish buttons exist

---

## Known Problems

### High priority
- HTML tags appear in statements: <strong>, &quot;
- Slugs are ugly
- AI summary can contain messy text
- Candidate score is too basic
- Too many manual review candidates sometimes

### Medium priority
- old_date/new_date are often unknown
- Duplicate draft protection missing
- Review page needs cleanup
- Public contradiction page needs final polish

### Later
- Donate
- Comments
- AI comment moderation
- Animations/images
- Advanced timeline reasoning
- Advanced multilingual display

---

## MVP Rule

Do not open 10 features at once.

First beta needs only:

1. Clean Draft Creation
2. Review / Publish workflow
3. Public page display
4. Source links
5. Voting

Everything else goes later.