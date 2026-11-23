# RTI Compass
A local-first case desk for drafting and tracking Indian Right to Information requests.

[Open the public demo](https://tulasiram2005.github.io/rti-compass/)

Try a synthetic case or select **New case**. Enter the public authority, record descriptions and language. Edit the resulting application, record events and review replies. Import a reply photo or PDF and review the extracted text. Language models for optical character recognition load from this site only when needed. Print an application or appeal pack with the browser’s Save as PDF option. Use **Workspace files** to download an encrypted backup before leaving. Each visit starts a new temporary desk.

## Run and check
Use Node 22 and Python 3. Run `npm test` for the core suite and `npm start` for the local desk at http://127.0.0.1:4173. No runtime dependencies, service keys, payment details or plugins are required.

## Scope and limits
Drafts use editable English, Hindi, Tamil and Telugu templates. Input is preserved verbatim. Reply classification uses English keywords. The ordinary response estimate requires a confirmed receipt date and ordinary direct submission. Transfers, fee interruptions, life or liberty cases and third-party procedures require manual deadline review. Recheck the timing if circumstances change. Use the Act notes and confirm with the authority before filing.

The desk keeps case contents in tab memory and exports with AES-256-GCM and PBKDF2-SHA256. The downloaded file requires the original passphrase. Printed documents contain plaintext. There is no server-side case store or account recovery. Files on a shared or compromised device remain exposed to anyone who can access the unlocked tab or its printouts.

The [implementation notes](spec/DECISIONS.md) describe the architecture and prior art. [Outstanding work](spec/REMAINING_WORK.md) tracks the original full-stack brief. Built with Codex under human direction. The project owner specified the scope, cost constraint and publication choice.
