# Phase progress

## Phase 1 — Shared incident state and data
- Kept incident state and timeline synchronized through the shared demo store, with the Member view already reading the same state.
- Replaced contact placeholders with the explicit non-dialable `00000 00000` value in shared demo data and contact cards.
- Generated a handover code at ambulance dispatch and enforced an exact six-digit, current-code check before resolving the incident.

## Phase 2 — Simulated sensors and CSI
- Added shared monitoring state with Member controls to start or pause the clearly simulated monitoring flow.
- Gated fall simulation on monitoring being enabled and an idle incident, with monitoring changes recorded in the shared timeline.
- Added sample-only Member vitals and a CSI illustration; Guardian sensor status reflects the same shared monitoring state.
