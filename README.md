# ResQ

ResQ is a React/Vite emergency-response simulation with Guardian, Responder, and Member screens.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` creates a production bundle and `npm run lint` runs Oxlint.

## Try the simulation

1. Sign in to a role with the sample account label and any six-digit access code.
2. On the Member screen, choose **Simulate Fall**. Use **3x Fast** to shorten the escalation timers.
3. Switch to the Responder screen, accept the dispatch, and confirm arrival to reveal the member profile, entry code, and tablet instructions.
4. Start **live video + voice** from the accepted Responder screen. The Guardian screen can receive the WebRTC stream when both roles are open in tabs on the same browser and origin.
5. Dispatch the ambulance. When it arrives, the Guardian screen displays a generated six-digit handover code. The Responder must enter that exact code to complete the simulated handover.

## Public simulation notes

- This is a simulation only. It does not contact emergency services, dispatch responders, place calls, or provide medical advice. Do not use it for a real emergency.
- Names, contact details, health information, access codes, locations, incidents, and route movement are sample data only. Displayed contact numbers use `00000 00000`, a non-dialable placeholder. The map uses an approximate simulated area, not a residence or live GPS position.
- Any six-digit login code is accepted. The simulated handover code is generated for each dispatch and must match the code shown to the Guardian; neither code is production authentication.
- Map routes and responder direction cues are illustrative straight-line simulations, not live GPS or turn-by-turn road navigation.
- Live video signaling uses `BroadcastChannel`, so it only connects tabs on the same browser and origin. Separate phones need a backend signaling service and production identity/access controls.
- The ResQ Safe + Health plan, revenue split, check-up bookings, partner network, rider earnings, phone links, payment flow, and emergency call routing are illustrative only and are not functional.
- Open `/business-model` to view the sample annual plan and estimated revenue split. Guardian and Member check-up bookings and NRI profile settings are mock data shared between same-origin tabs.
- Satellite tiles are loaded from Esri and require an internet connection.
