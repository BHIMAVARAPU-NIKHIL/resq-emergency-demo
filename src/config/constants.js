// ResQ public demo configuration and sample data

export const TIMINGS = {
  loudAlarm: 15,
  memberWait: 15,
  guardianCall: 15,
  liveCall: 15
};

export const DEMO_NON_DIALABLE_PHONE = "00000 00000";

// Approximate city-center coordinates for the fictional demo route.
export const COORDINATES = {
  member: [17.3850, 78.4867],
  responderStart: [17.3920, 78.4950],
  ambulanceStart: [17.3760, 78.4780]
};

export const MEMBER_DATA = {
  name: "Bavitha",
  age: 51,
  address: "Demo Residence, Hyderabad (simulated location)",
  phone: DEMO_NON_DIALABLE_PHONE,
  healthProblems: ["Demo health condition"],
  medicines: ["Demo medication"],
  tabletLocation: "Demo medicine storage location (sample data only).",
  entryAccessCode: "0000",
  vitals: {
    bloodPressure: "Sample reading",
    heartRate: "Sample reading",
    oxygenSat: "Sample reading",
    deviceConnected: true,
    deviceName: "Sample health sensor (demo)"
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
      relation: "Primary Guardian (demo)",
      phone: DEMO_NON_DIALABLE_PHONE
    },
    riskSaver: {
      name: "ResQ Demo Support",
      role: "Sample support contact (demo)",
      phone: DEMO_NON_DIALABLE_PHONE
    }
  },
  systemStats: {
    network: "Demo network (simulated)",
    avgResponseTime: "Sample only",
    totalDistanceCovered: "Sample only",
    deviceBattery: "Sample only",
    fallDetectionsCount: "Sample only"
  }
};

export const RESPONDER_DATA = {
  name: "Akashy",
  vehicle: "Demo Bike Unit",
  rating: "Demo rating",
  rescuesCount: 0,
  phone: DEMO_NON_DIALABLE_PHONE,
  baseLocation: "Demo response hub",
  certifications: "First aid profile (demo)"
};

export const AMBULANCE_DATA = {
  service: "Demo Ambulance",
  vehicleId: "DEMO-AMB-01",
  type: "Emergency transport (demo)",
  base: "Demo response hub",
  phone: DEMO_NON_DIALABLE_PHONE
};
