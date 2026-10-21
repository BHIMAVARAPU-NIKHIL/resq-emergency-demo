// ResQ public simulation configuration and sample data

export const TIMINGS = {
  loudAlarm: 15,
  memberWait: 15,
  guardianCall: 15,
  liveCall: 15
};

export const NON_DIALABLE_PHONE_PLACEHOLDER = "00000 00000";

// Approximate city-center coordinates for the fictional simulation route.
export const COORDINATES = {
  member: [17.3850, 78.4867],
  responderStart: [17.3920, 78.4950],
  ambulanceStart: [17.3760, 78.4780]
};

export const MEMBER_DATA = {
  name: "Bavitha",
  age: 51,
  address: "Sample Residence, Hyderabad (simulated location)",
  phone: NON_DIALABLE_PHONE_PLACEHOLDER,
  healthProblems: ["Sample health condition"],
  medicines: ["Sample medication"],
  tabletLocation: "Sample medicine storage location (sample data only).",
  entryAccessCode: "0000",
  vitals: {
    bloodPressure: "120/80 mmHg (sample)",
    heartRate: "72 bpm (sample)",
    oxygenSat: "98% (sample)",
    deviceConnected: true,
    deviceName: "Sample health sensor"
  },
  homeRooms: [
    { name: "Living room", lastMotion: "Sample only", door: "Simulated", status: "clear" },
    { name: "Kitchen", lastMotion: "Sample only", door: "Simulated", status: "clear" },
    { name: "Bedroom", lastMotion: "Sample impact event", door: "Simulated", status: "alert" },
    { name: "Entrance", lastMotion: "Sample only", door: "Simulated", status: "clear" }
  ],
  contacts: {
    guardian: {
      name: "Nikhil",
      relation: "Primary Guardian",
      phone: NON_DIALABLE_PHONE_PLACEHOLDER
    },
    riskSaver: {
      name: "ResQ Support",
      role: "Sample support contact",
      phone: NON_DIALABLE_PHONE_PLACEHOLDER
    }
  },
  systemStats: {
    network: "Simulated network",
    avgResponseTime: "Sample only",
    totalDistanceCovered: "Sample only",
    deviceBattery: "Sample only",
    fallDetectionsCount: "Sample only"
  }
};

export const RESPONDER_DATA = {
  name: "Akashy",
  vehicle: "Response Bike Unit",
  rating: "Sample responder rating",
  rescuesCount: 0,
  phone: NON_DIALABLE_PHONE_PLACEHOLDER,
  baseLocation: "Response hub",
  certifications: "First aid profile (sample)"
};

export const AMBULANCE_DATA = {
  service: "Emergency transport",
  vehicleId: "RESQ-AMB-01",
  type: "Emergency transport (simulated)",
  base: "Response hub",
  phone: NON_DIALABLE_PHONE_PLACEHOLDER
};
