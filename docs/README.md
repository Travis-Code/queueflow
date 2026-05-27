# QueueFlow Documentation

This folder contains all product, technical, and setup documentation.

## Structure

- `guides/`
  - `USER_GUIDE.md` — End-user and admin usage instructions.
- `specs/`
  - `FUNCTIONAL_DOC.md` — Functional behavior and product capabilities.
  - `TECHNICAL_DOC.md` — Architecture, data flow, APIs, and system notes.
- `setup/`
  - `README_DB.md` — Postgres setup and migration instructions.
- `diagrams/`
  - `*.png` — Exported chart images for easy viewing.
  - `src/*.mmd` — Mermaid source files used to generate PNGs.

## Diagram Regeneration

Run this from the repo root to regenerate all PNG charts:

```bash
npx -y @mermaid-js/mermaid-cli -i docs/diagrams/src/booking-flow.mmd -o docs/diagrams/booking-flow.png
npx -y @mermaid-js/mermaid-cli -i docs/diagrams/src/admin-flow.mmd -o docs/diagrams/admin-flow.png
npx -y @mermaid-js/mermaid-cli -i docs/diagrams/src/waitlist-promotion-flow.mmd -o docs/diagrams/waitlist-promotion-flow.png
```
