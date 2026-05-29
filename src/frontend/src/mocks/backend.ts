/**
 * Mock backend that delegates all calls to the REST API.
 * Loaded by config.ts when VITE_USE_MOCK=true.
 *
 * This lets us keep the ICP actor plumbing (useActor, useInternetIdentity)
 * exactly as-is while routing all actual data calls to the Express backend.
 */

import { api } from '../utils/api';
import type { backendInterface } from '../backend.d';

// ─── Converters: REST (number) → ICP actor shape (bigint) ──────────────────

function toActorUser(u: {
  id: number; name: string; skill: string; location: string;
  trustScore: number; endorsementCount: number; badgeLevel: string;
  distance: number; bio: string; videoURL: string; contact: string;
  verified?: boolean;
}) {
  return {
    ...u,
    id: BigInt(u.id),
    trustScore: BigInt(u.trustScore),
    endorsementCount: BigInt(u.endorsementCount),
    distance: BigInt(u.distance),
    verified: !!u.verified,
  };
}

function toActorCitizen(c: { id: number; name: string; address: string }) {
  return { ...c, id: BigInt(c.id) };
}

function toActorRequest(r: {
  id: number; requesterId: string; targetUserId: number; message: string; timestamp: number;
}) {
  return {
    ...r,
    id: BigInt(r.id),
    targetUserId: BigInt(r.targetUserId),
    // ICP uses nanoseconds
    timestamp: BigInt(r.timestamp) * BigInt(1_000_000),
  };
}

function toActorCert(c: {
  workerId: number; skill: string; level: string; passed: boolean;
  issuedDate: number; certificateId: string; mcqScore: number; practicalPassed: boolean;
  pendingReview?: boolean; workerName?: string;
}) {
  return {
    ...c,
    workerId: BigInt(c.workerId),
    issuedDate: BigInt(c.issuedDate),
    mcqScore: BigInt(c.mcqScore),
  };
}

function toActorPractical(s: {
  workerId: number; workerName: string; skill: string;
  videoDataURI: string; status: string; submittedAt: number;
}) {
  return {
    ...s,
    workerId: BigInt(s.workerId),
    submittedAt: BigInt(s.submittedAt) * BigInt(1_000_000),
  };
}

// ─── The mock backend object ────────────────────────────────────────────────
export const mockBackend: backendInterface = {
  // Users
  getAllUsers: async () => {
    const users = await api.getAllUsers();
    return users.map(toActorUser);
  },

  getUser: async (id: bigint) => {
    const u = await api.getWorkerStats(Number(id));
    return toActorUser(u);
  },

  searchUsers: async (q: string) => {
    const users = await api.searchUsers(q);
    return users.map(toActorUser);
  },

  getUsersBySkill: async (skill: string) => {
    const users = await api.getUsersBySkill(skill);
    return users.map(toActorUser);
  },

  getUsersByDistance: async (maxKm: bigint) => {
    const users = await api.getUsersByDistance(Number(maxKm));
    return users.map(toActorUser);
  },

  registerWorker: async (
    username: string, passwordHash: string, name: string, skill: string,
    location: string, bio: string, videoURL: string, distance: bigint, contact: string,
  ) => {
    const res = await api.registerWorker({ username, passwordHash, name, skill, location, bio, videoURL, distance: Number(distance), contact });
    return BigInt(res.id);
  },

  loginWorker: async (username: string, passwordHash: string) => {
    const u = await api.loginWorker({ username, passwordHash });
    if (!u) return null;
    return toActorUser(u);
  },

  findWorkerByName: async (name: string) => {
    const u = await api.findWorkerByName(name);
    if (!u) return null;
    return toActorUser(u);
  },

  endorseUser: async (id: bigint) => {
    const localKey = `knot_worker_profile_${id.toString()}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const newCount = Number(parsed.endorsementCount ?? 0) + 1;
        const newTrust = Number(parsed.trustScore ?? 0) + 1;
        const newBadge =
          newCount >= 15
            ? "Gold"
            : newCount >= 7
              ? "Silver"
              : newCount >= 3
                ? "Bronze"
                : "None";
        localStorage.setItem(
          localKey,
          JSON.stringify({
            ...parsed,
            endorsementCount: newCount,
            trustScore: newTrust,
            badgeLevel: newBadge,
          }),
        );
      } catch {
        // ignore
      }
    }
  },

  getWorkerStats: async (id: bigint) => {
    const u = await api.getWorkerStats(Number(id));
    return toActorUser(u);
  },

  // Citizens
  registerCitizen: async (name: string, address: string, username: string, passwordHash: string) => {
    const res = await api.registerCitizen(name, address, username, passwordHash);
    return BigInt(res.id);
  },

  loginCitizen: async (username: string, passwordHash: string) => {
    const c = await api.loginCitizen(username, passwordHash);
    if (!c) return null;
    return toActorCitizen(c);
  },

  findCitizenByName: async (name: string) => {
    const c = await api.findCitizenByName(name);
    if (!c) return null;
    return toActorCitizen(c);
  },

  getAllCitizens: async () => {
    const citizens = await api.getAllCitizens();
    return citizens.map(toActorCitizen);
  },

  // Learning Requests
  getAllLearningRequests: async () => {
    const reqs = await api.getLearningRequests();
    return reqs.map(toActorRequest);
  },

  getLearningRequestsForWorker: async (workerId: bigint) => {
    const reqs = await api.getLearningRequestsForWorker(Number(workerId));
    return reqs.map(toActorRequest);
  },

  submitLearningRequest: async (requesterId: string, targetUserId: bigint, message: string) => {
    await api.createLearningRequest({ requesterId, targetUserId: Number(targetUserId), message });
  },

  // Certification
  submitTestResult: async (workerId: bigint, mcqScore: bigint, practicalPassed: boolean) => {
    const cert = {
      workerId: Number(workerId),
      mcqScore: Number(mcqScore),
      practicalPassed,
      passed: Number(mcqScore) >= 6 && practicalPassed,
      issuedDate: Date.now(),
      certificateId: `KNOT-${Date.now()}`,
      skill: "Plumbing",
      level: "Basic"
    };
    try {
      localStorage.setItem(`knot_cert_${workerId}`, JSON.stringify(cert));
      localStorage.setItem(`knot_cert_status_${workerId}`, cert.passed ? "approved" : "failed");
    } catch (e) {
      // ignore
    }
    return true;
  },

  getCertification: async (workerId: bigint) => {
    const c = await api.getCertification(Number(workerId));
    if (!c) return null;
    return toActorCert(c);
  },

  submitPracticalVideo: async (workerId: bigint, workerName: string, skill: string, videoDataURI: string) => {
    await api.submitPracticalVideo(Number(workerId), workerName, skill, videoDataURI);
  },

  getPracticalVideoStatus: async (workerId: bigint) => {
    return api.getPracticalVideoStatus(Number(workerId));
  },

  getPendingPracticalVideos: async () => {
    const subs = await api.getPendingPracticalVideos();
    return subs.map(toActorPractical);
  },

  approvePracticalVideo: async (workerId: bigint) => {
    return api.approvePracticalVideo(Number(workerId));
  },

  rejectPracticalVideo: async (workerId: bigint) => {
    return api.rejectPracticalVideo(Number(workerId));
  },

  // Videos
  saveWorkerVideo: async (workerId: bigint, dataURI: string) => {
    await api.saveWorkerVideo(Number(workerId), dataURI);
  },

  getWorkerVideo: async (workerId: bigint) => {
    return api.getWorkerVideo(Number(workerId));
  },

  // Admin
  getAdminStats: async () => {
    const s = await api.getAdminStats();
    return {
      totalWorkers: BigInt(s.totalWorkers),
      totalCitizens: BigInt(s.totalCitizens),
      totalCertified: BigInt(s.totalCertified),
      totalRequests: BigInt(s.totalRequests),
    };
  },

  loginAdmin: async (username: string, passwordHash: string) => {
    return api.loginAdmin(username, passwordHash);
  },

  clearAllData: async () => {
    await api.clearAllData();
  },

  // ICP-specific stubs (not used in REST mode)
  _initializeAccessControlWithSecret: async (_token: string) => {},
  assignCallerUserRole: async () => {},
  getCallerUserProfile: async () => null,
  getUserProfile: async () => null,
  saveCallerUserProfile: async () => {},
  getCallerUserRole: async () => 'user' as const,
  isCallerAdmin: async () => false,
} as unknown as backendInterface;
