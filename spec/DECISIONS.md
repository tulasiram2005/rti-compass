# Design and architecture
The first release uses an indexed case ledger, an editable application sheet and adjacent statutory notes. Two alternatives were a guided interview and a calendar-first tracker. The ledger keeps supporting evidence visible while drafting and makes multiple cases accessible without stepping through an interview.

GitHub Pages serves static files from docs. Browsers run all drafting, classifications and timeline calculations locally. A passphrase-protected export provides persistence without a database or server credentials. This design deliberately defers the hosted account and multi-user architecture in the brief. The in-memory workspace closes with the tab. Download a backup before leaving.

## Prior art
[RTI Mitra](https://github.com/pradeep-onlinerti/rti-mitra-chatbot) describes a multilingual chatbot. [RTI Filing Assistance Agent](https://github.com/Adrija-verse/RTI-Filing-Assistance-Agent) describes retrieval-assisted drafting and deadline tracking. [RTI Online](https://rtionline.gov.in/) handles actual submissions for participating central authorities. This release focuses on local processing and portable encrypted case files. The name is provisional and has no trademark clearance.
