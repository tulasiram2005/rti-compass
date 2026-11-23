# PROJECT BRIEF 3: RTI COMPASS (working title, run a name-clash check first)

One line: a companion for citizens filing Right to Information requests in India. It helps draft a precise request in your language, tracks the legal deadlines, analyses the reply, builds the appeal when needed, and shows anonymised outcome statistics by authority.

## Why it exists
Most people never file, or file a vague request, miss the deadlines, or do not know what to do with a rejection that cites an exemption. The tools that exist are mostly filing portals or information pages. The gap is the guided companion layer between "I want to know" and "I won the appeal".

## Honest prior art (verify and document in PRIOR_ART.md)
Official RTI portals (such as the central government online portal) handle filing for some authorities, and several NGO and hobby sites explain the process. Do a real search for open-source RTI helpers and chatbots and record what exists. This project does NOT file requests and does not replace a lawyer. The difference to prove: structured drafting with citations, a deterministic deadline engine, reply classification with grounded appeal grounds, multilingual use, and opt-in anonymised outcome analytics with privacy thresholds.

## Legal and safety boundaries (build these into the product)
- Not legal advice, not affiliated with any government body. Say so on every page where it matters.
- Do NOT use the national emblem or imitate government branding (its use is legally restricted). Visual identity must be clearly independent.
- Do NOT hard-code legal rules from memory. Source the Act's section text (public) into a versioned corpus with section numbers and retrieval dates, and drive the deadline and exemption logic from a config file whose every rule cites the section it came from. Show "verify on the official text" links.
- Seed only a small authority directory (a few central and state examples) from public sources with source URLs and a "last verified" date, clearly marked unverified until a user confirms. Never invent officer names or addresses.
- Respect robots.txt and terms for any public data used; prefer manual, cited seeds over scraping.

## Users and jobs
- Citizen: turn a plain-language question into a valid, specific request; know exactly when to follow up; understand a rejection; file the first appeal.
- Volunteer or journalist: manage many requests and see which authorities respond fast.
- Reviewer: browse the public, anonymised request library for patterns.

## Features (priority order)
P0
1. Accounts with email verification; each request is private by default.
2. Guided request builder: the user describes the need in English, Hindi, Telugu or Tamil. The AI proposes the likely public authority (from the directory), splits the need into specific answerable questions (information held on record, not opinions or "why" questions), and drafts a formal application with a bilingual option. The user edits and approves. Retrieval grounds every suggestion in the Act text corpus and shows the section it relied on.
3. Case tracker as an explicit state machine, implemented with a tested library such as XState or a hand-written table: Drafted, Filed (user records date and mode), Acknowledged, Transferred, Reply received, Deemed non-reply (when the config's deadline passes), First appeal drafted, First appeal filed, Second appeal ready, Closed. Every transition is audited. Illegal transitions are impossible and tested.
4. Deadline engine: pure functions reading the cited rules config; outputs due dates and "days left" with an explicit "estimate, confirm yourself" label; email and in-app reminders sent by a cron-driven job (Cloudflare Worker cron to a signed endpoint).
5. Documents: upload a photo or PDF of the reply. Client-side OCR with tesseract.js (English, Hindi, Telugu, Tamil traineddata, lazy loaded) so the raw scan never has to leave the device unless the user opts in. The extracted text is shown and editable before any AI step.
P1
6. Reply analyser (AI, grounded): classify the reply (information provided, partial, refused with an exemption cited, transferred, fee demanded, no substantive answer), extract the cited section, and propose first-appeal grounds with citations to the Act corpus. A mandatory "check this yourself" panel lists the exact passages used.
7. Appeal pack: a PDF with cover note, timeline of events, the original request, the reply, grounds, and an enclosures index. Multilingual rendering with embedded fonts.
8. Public Request Library (opt-in per request): anonymised, PII stripped by a deterministic scrubber plus a review step; search and filters; outcome statistics per authority (median days to reply, share of partial or refused replies) shown ONLY when at least 5 consenting cases exist (k-anonymity threshold). Reporting and takedown flow for abuse.
P2 (stretch)
9. Volunteer workspace for tracking many requests with tags.
10. Printable one-page "what to do next" for each state.

## AI layer
Provider abstraction (Gemini free, Groq free, mock). Retrieval: chunk the Act corpus by section; embeddings precomputed in a GitHub Action and stored in Atlas Vector Search; only the query embedding is computed at runtime. Tools, read-only: `search_act(query)`, `get_section(id)`, `lookup_authority(name)`, `compute_deadlines(case_id)`. Drafting and analysis outputs are schema-validated, must cite section ids that exist in the corpus (a post-check rejects invented citations), and always show uncertainty. Golden set of 50 synthetic scenarios (labelled) for drafting quality checks and 40 synthetic replies for classification; report mock and real results separately. Injection cases include hostile text inside uploaded replies.

## Data model (Mongo collections)
users, cases, case_events (append-only), drafts, documents (encrypted fields, R2 pointers), authorities (with source url and verified flag), act_sections (versioned corpus plus embeddings), rule_config (versioned, cited), reminders, library_entries (scrubbed), library_consents, reports, audit_events (hash-chained), jobs. Provide indexes and reasons.

## Security and privacy focus specific to this project
Application text and uploaded replies are sensitive: field-level AES-256-GCM encryption, strict per-user isolation tests, delete-everything and export-everything endpoints, no raw PII in logs, OCR on device by default, a deterministic PII scrubber with tests (names, phones, emails, ids, addresses) before anything enters the public library, k-anonymity threshold tests, abuse reporting, rate limits on drafting, prompt-injection suite, no model-generated queries.

## Art direction (starting point)
"Government stationery without the government: a typed file with a red tape." Warm stamp-paper `#F3F1E8`, carbon-black ink `#161616`, folder-manila `#D9C9A3` for panels, file-tag green `#2F5D50`, red-tape `#B3261E` reserved for deadlines and urgency. Signature element: the case timeline drawn as a physical file with a red tape that shortens as the deadline approaches; overdue turns the tape into a clean cut. Type: Spectral for body, Barlow Condensed or Archivo Narrow for form labels and section tags, Courier Prime for typed application text and reference numbers; Noto Serif/Sans Devanagari, Telugu and Tamil for local scripts, tested for shaping and line height. Layout: left file-index of cases, centre "document sheet" that looks like a typed page with margin annotations for citations, right drawer for the Act passages used (so evidence is always beside the claim). Forms use underline fields like paper forms, not rounded inputs. Dark theme: "night desk lamp" warm charcoal with amber, not blue. What it refuses to be: a chatbot window, a tricolour patriotic template, or a purple legal-tech SaaS.

## Seed data and demo story
Synthetic citizen "Meera", 6 synthetic cases at different states (one drafted in Telugu, one nearing deadline, one deemed non-reply, one refused with an exemption cited, one with a first appeal drafted, one closed), a scanned-reply fixture, and a small public library with enough entries to show one authority's statistics above the threshold. Every seeded item is labelled synthetic. The demo: describe a need in Telugu, review the drafted request with cited sections, simulate the passage of time to show the red tape and reminders, upload a refusal and see the appeal grounds, download the appeal pack.

## Gap-bridging this project demonstrates
MongoDB with Atlas Vector Search over a legal corpus, RAG with citation verification, workflow state machines, scheduling and reminders on free infrastructure, multilingual UI, fonts and OCR, privacy engineering (field encryption, scrubbing, k-anonymity), PDF generation, responsible AI for a high-stakes domain.

## Measurements to record (real only)
Citation validity rate on the golden set (invented citations must be zero after the post-check, and report how many the post-check caught), drafting rubric scores, classification accuracy on synthetic replies, scrubber recall on a labelled synthetic PII set, OCR character error rate on fixture scans per language, deadline-engine test counts, test counts, Lighthouse scores.
