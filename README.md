# ResQ

ResQ is a React/Vite emergency-response workflow demo with Guardian, Responder, and Member screens.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` creates a production bundle and `npm run lint` runs Oxlint.

## Demo flow

1. Sign in to a role with the demo account label and the demo OTP `123456` (any six-digit code is accepted).
2. On the Member screen, choose **Simulate Fall**. Use **3x Fast** to shorten the escalation timers.
3. Switch to the Responder screen, accept the dispatch, and confirm arrival to reveal the member profile, entry code, and tablet instructions.
4. Start **live video + voice** from the accepted Responder screen. The Guardian screen can receive the WebRTC stream when both roles are open in tabs on the same browser and origin.
5. Dispatch the ambulance. When it arrives, the Guardian screen displays the handover code for the Responder.

## Public demo limitations

- This is a simulation only. It does not contact emergency services, dispatch responders, place calls, or provide medical advice. Do not use it for a real emergency.
- Names, contact details, health information, access codes, locations, incidents, and route movement are sample data only. The map uses an approximate demo-area location, not a residence or live GPS position.
- The OTP and handover code are demo-only (`123456`); any six-digit login code is accepted. This is not production authentication.
- Live video signaling uses `BroadcastChannel`, so it only connects tabs on the same browser and origin. Separate phones need a backend signaling service and production identity/access controls.
- Phone links, payments, emergency call routing, and subscription prices are not functional.
- Satellite tiles are loaded from Esri and require an internet connection.
