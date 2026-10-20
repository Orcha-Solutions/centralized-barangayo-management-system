import {
  STATIC_APPOINTMENTS,
  STATIC_BARANGAY_ID,
  STATIC_CONCERNS,
  STATIC_TICKETS,
} from "../staticData";
import { saveStore } from "../store";
import type { MockContext } from "./types";

export function handleConcernsMock(ctx: MockContext): any {
  const { path, cleanPath, method, opts, store, currentUser } = ctx;

  // 1. GET requests
  if (method === "GET") {
    const concernSingleMatch = cleanPath.match(/^\/concerns\/([^/]+)$/);
    if (concernSingleMatch) {
      const id = concernSingleMatch[1];
      const list = store.Concern || STATIC_CONCERNS;
      const c = list.find((x: any) => x.id === id || x.referenceNo === id);
      if (!c) return null;
      const now = Date.now();
      const isOverdue =
        c.slaDueAt && new Date(c.slaDueAt).getTime() < now && c.status !== "resolved" && c.status !== "rejected";
      let inh = c.inhabitant;
      if (!inh && c.inhabitantId && store.Inhabitant) {
        const foundInh = store.Inhabitant.find((i: any) => i.id === c.inhabitantId);
        if (foundInh) {
          inh = {
            firstName: foundInh.firstName,
            lastName: foundInh.lastName,
            contactNo: foundInh.contactNumber || foundInh.contactNo,
          };
        }
      }
      return {
        ...c,
        slaBreached: Boolean(c.slaBreached || isOverdue),
        inhabitant: inh || null,
      };
    }

    if (cleanPath === "/concerns") {
      const queryString = path.includes("?") ? path.split("?")[1] : "";
      const queryParams = new URLSearchParams(queryString);
      const q = (queryParams.get("q") || "").toLowerCase().trim();
      const status = queryParams.get("status") || "all";
      const category = queryParams.get("category") || "all";
      const page = parseInt(queryParams.get("page") || "1", 10);
      const pageSize = parseInt(queryParams.get("pageSize") || "25", 10);

      let list = (store.Concern || STATIC_CONCERNS) as any[];
      if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
        const filteredByBrgy = list.filter(
          (x) =>
            !x.barangayId ||
            x.barangayId === currentUser.barangayId ||
            x.barangayId === STATIC_BARANGAY_ID,
        );
        if (filteredByBrgy.length > 0) list = filteredByBrgy;
      }

      const now = Date.now();
      list = list.map((c) => {
        const isOverdue =
          c.slaDueAt && new Date(c.slaDueAt).getTime() < now && c.status !== "resolved" && c.status !== "rejected";
        let inh = c.inhabitant;
        if (!inh && c.inhabitantId && store.Inhabitant) {
          const foundInh = store.Inhabitant.find((i: any) => i.id === c.inhabitantId);
          if (foundInh) {
            inh = {
              firstName: foundInh.firstName,
              lastName: foundInh.lastName,
              contactNo: foundInh.contactNumber || foundInh.contactNo,
            };
          }
        }
        return {
          ...c,
          slaBreached: Boolean(c.slaBreached || isOverdue),
          inhabitant: inh || null,
        };
      });

      if (status !== "all") {
        list = list.filter((x) => x.status === status);
      }
      if (category !== "all") {
        list = list.filter((x) => x.category === category);
      }
      if (q) {
        list = list.filter(
          (x) =>
            (x.referenceNo && x.referenceNo.toLowerCase().includes(q)) ||
            (x.description && x.description.toLowerCase().includes(q)) ||
            (x.purok && x.purok.toLowerCase().includes(q)) ||
            (x.inhabitant && `${x.inhabitant.firstName} ${x.inhabitant.lastName}`.toLowerCase().includes(q)),
        );
      }

      const total = list.length;
      const startIndex = (page - 1) * pageSize;
      const items = list.slice(startIndex, startIndex + pageSize);

      return {
        items,
        total,
        page,
        pageSize,
      };
    }

    if (cleanPath === "/tickets") {
      const queryString = path.includes("?") ? path.split("?")[1] : "";
      const queryParams = new URLSearchParams(queryString);
      const q = (queryParams.get("q") || "").toLowerCase().trim();
      const status = queryParams.get("status") || "all";
      const category = queryParams.get("category") || "all";
      const priority = queryParams.get("priority") || "all";
      const page = parseInt(queryParams.get("page") || "1", 10);
      const pageSize = parseInt(queryParams.get("pageSize") || "25", 10);

      let list = (store.Ticket || STATIC_TICKETS) as any[];

      if (status !== "all") {
        list = list.filter((t) => t.status === status);
      }
      if (category !== "all") {
        list = list.filter((t) => t.category === category);
      }
      if (priority !== "all") {
        list = list.filter((t) => t.priority === priority);
      }
      if (q) {
        list = list.filter(
          (t) =>
            t.subject?.toLowerCase().includes(q) ||
            t.body?.toLowerCase().includes(q) ||
            t.category?.toLowerCase().includes(q) ||
            t.priority?.toLowerCase().includes(q),
        );
      }

      list = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      const total = list.length;
      const start = (page - 1) * pageSize;
      const items = list.slice(start, start + pageSize);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      };
    }

    if (cleanPath === "/appointments") {
      const queryString = path.includes("?") ? path.split("?")[1] : "";
      const queryParams = new URLSearchParams(queryString);
      const q = (queryParams.get("q") || "").toLowerCase().trim();
      const status = queryParams.get("status") || "all";
      const service = queryParams.get("service") || "all";
      const inhabitantId = queryParams.get("inhabitantId") || "";
      const page = parseInt(queryParams.get("page") || "1", 10);
      const pageSize = parseInt(queryParams.get("pageSize") || "25", 10);

      let list = (store.Appointment || STATIC_APPOINTMENTS) as any[];

      if (currentUser.scope === "self" || currentUser.roles.includes("RESIDENT")) {
        if (currentUser.inhabitantId) {
          list = list.filter((a) => a.inhabitantId === currentUser.inhabitantId);
        }
      } else if (inhabitantId) {
        list = list.filter((a) => a.inhabitantId === inhabitantId);
      }

      if (status !== "all") {
        list = list.filter((a) => a.status === status);
      }
      if (service !== "all") {
        list = list.filter((a) => a.service === service);
      }
      if (q) {
        list = list.filter(
          (a) =>
            a.queueNumber?.toLowerCase().includes(q) ||
            a.notes?.toLowerCase().includes(q) ||
            a.inhabitant?.firstName?.toLowerCase().includes(q) ||
            a.inhabitant?.lastName?.toLowerCase().includes(q),
        );
      }

      list = list.map((a) => {
        if (a.inhabitant) return a;
        if (a.inhabitantId) {
          const inh = store.Inhabitant?.find((i: any) => i.id === a.inhabitantId);
          if (inh) {
            return {
              ...a,
              inhabitant: { firstName: inh.firstName, lastName: inh.lastName, philsysNo: inh.philsysNo },
            };
          }
        }
        return a;
      });

      list = [...list].sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );

      const total = list.length;
      const start = (page - 1) * pageSize;
      const items = list.slice(start, start + pageSize);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      };
    }

    const aptDetailMatch = cleanPath.match(/^\/appointments\/([^/]+)$/);
    if (aptDetailMatch) {
      const id = aptDetailMatch[1];
      const a = (store.Appointment || STATIC_APPOINTMENTS).find((x: any) => x.id === id);
      if (!a) return null;
      if (!a.inhabitant && a.inhabitantId) {
        const inh = store.Inhabitant?.find((i: any) => i.id === a.inhabitantId);
        if (inh) {
          return { ...a, inhabitant: { firstName: inh.firstName, lastName: inh.lastName, philsysNo: inh.philsysNo } };
        }
      }
      return a;
    }
  }

  // 2. POST requests
  if (method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};

    if (cleanPath === "/concerns") {
      const concerns = store.Concern || [];
      const nextNo = (concerns.length + 1).toString().padStart(5, "0");
      const slaClock = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const newConcern = {
        id: "cn-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        referenceNo: body.referenceNo || `CN-2026-${nextNo}`,
        category: body.category || "other",
        description: body.description || "",
        purok: body.purok || "Purok 1",
        status: body.status || "submitted",
        slaDueAt: slaClock,
        slaBreached: false,
        inhabitantId: body.inhabitantId || currentUser.inhabitantId || null,
        inhabitant:
          body.inhabitant ||
          (currentUser.fullName
            ? {
                firstName: currentUser.fullName.split(" ")[0],
                lastName: currentUser.fullName.split(" ").slice(1).join(" "),
              }
            : null),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.Concern) store.Concern = [];
      store.Concern.unshift(newConcern);
      saveStore(store);
      return newConcern;
    }

    if (cleanPath === "/feedback/csm") {
      const newFb = {
        id: "fb-" + Math.random().toString(36).substring(2, 9),
        rating: body.rating,
        comments: body.comments,
        service: body.service,
        barangayId: currentUser.barangayId || "barangka",
        createdAt: new Date().toISOString(),
      };
      if (!store.Feedback) store.Feedback = [];
      store.Feedback.push(newFb);
      saveStore(store);
      return newFb;
    }

    if (cleanPath === "/tickets") {
      const tickets = store.Ticket || [...STATIC_TICKETS];
      const nextNum = (tickets.length + 1).toString().padStart(3, "0");
      const newTicket = {
        id: `tkt-${nextNum}`,
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        subject: body.subject || "Untitled Support Ticket",
        body: body.body || "",
        category: body.category || "technical",
        priority: body.priority || "normal",
        status: body.status || "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [],
      };
      if (!store.Ticket) store.Ticket = [...STATIC_TICKETS];
      store.Ticket.unshift(newTicket);
      saveStore(store);
      return newTicket;
    }

    if (cleanPath === "/appointments") {
      const appointments = store.Appointment || [...STATIC_APPOINTMENTS];
      const sched = body.scheduledAt ? new Date(body.scheduledAt) : new Date();
      const now = new Date();
      const isTodaySched =
        sched.getFullYear() === now.getFullYear() &&
        sched.getMonth() === now.getMonth() &&
        sched.getDate() === now.getDate();

      let queueNumber: string | null = null;
      if (isTodaySched) {
        const todayCount = appointments.filter((a: any) => {
          const d = new Date(a.scheduledAt);
          return (
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate()
          );
        }).length;
        const prefix = body.service === "kp_hearing" ? "KP-" : body.service === "health" ? "H-" : "Q-";
        queueNumber = `${prefix}${String(todayCount + 1).padStart(3, "0")}`;
      }

      let inhabitant: any = null;
      const targetInhabitantId =
        body.inhabitantId || (currentUser.scope === "self" ? currentUser.inhabitantId : null);
      if (targetInhabitantId) {
        const inh = store.Inhabitant?.find((i: any) => i.id === targetInhabitantId);
        if (inh) {
          inhabitant = { firstName: inh.firstName, lastName: inh.lastName, philsysNo: inh.philsysNo };
        }
      }

      const newApt = {
        id: "apt-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        service: body.service || "general",
        scheduledAt: sched.toISOString(),
        queueNumber,
        status: "booked",
        notes: body.notes || (targetInhabitantId ? "Scheduled appointment via portal" : "Walk-in appointment"),
        inhabitantId: targetInhabitantId || null,
        inhabitant,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!store.Appointment) store.Appointment = [...STATIC_APPOINTMENTS];
      store.Appointment.unshift(newApt);
      saveStore(store);
      return newApt;
    }
  }

  // 3. PATCH requests
  if (method === "PATCH") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};

    const concernMatch = cleanPath.match(/\/concerns\/([^\/]+)/);
    if (concernMatch) {
      const id = concernMatch[1];
      const c = store.Concern?.find((x) => x.id === id || x.referenceNo === id);
      if (c) {
        Object.assign(c, body);
        if (body.status === "acknowledged" && !c.acknowledgedAt) {
          c.acknowledgedAt = new Date().toISOString();
        }
        if (body.status === "resolved") {
          c.resolvedAt = new Date().toISOString();
          if (body.resolutionNote) c.resolutionNote = body.resolutionNote;
        }
        c.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return c || {};
    }

    const ticketPatchMatch = cleanPath.match(/\/tickets\/([^/]+)/);
    if (ticketPatchMatch) {
      const id = ticketPatchMatch[1];
      if (!store.Ticket) store.Ticket = [...STATIC_TICKETS];
      const t = store.Ticket.find((x: any) => x.id === id);
      if (t) {
        Object.assign(t, body);
        if (body.response || body.comment) {
          if (!t.responses) t.responses = [];
          t.responses.push({
            id: "tr-" + Math.random().toString(36).substring(2, 9),
            body: body.response || body.comment,
            createdAt: new Date().toISOString(),
          });
        }
        t.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return t || {};
    }

    const aptPatchMatch = cleanPath.match(/\/appointments\/([^\/]+)/);
    if (aptPatchMatch) {
      const id = aptPatchMatch[1];
      if (!store.Appointment) store.Appointment = [...STATIC_APPOINTMENTS];
      const a = store.Appointment.find((x: any) => x.id === id);
      if (a) {
        Object.assign(a, body);
        if (body.status === "checked_in" && !a.checkedInAt) {
          a.checkedInAt = new Date().toISOString();
        }
        if (body.status === "serving" && !a.servedAt) {
          a.servedAt = new Date().toISOString();
        }
        if ((body.status === "completed" || body.status === "no_show") && !a.completedAt) {
          a.completedAt = new Date().toISOString();
        }
        a.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return a || {};
    }
  }

  // 4. DELETE requests
  if (method === "DELETE") {
    const concernDelMatch = cleanPath.match(/\/concerns\/([^\/]+)/);
    if (concernDelMatch) {
      const id = concernDelMatch[1];
      if (store.Concern) {
        store.Concern = store.Concern.filter((x) => x.id !== id && x.referenceNo !== id);
        saveStore(store);
      }
      return { success: true };
    }

    const ticketDelMatch = cleanPath.match(/\/tickets\/([^\/]+)/);
    if (ticketDelMatch) {
      const id = ticketDelMatch[1];
      if (store.Ticket) {
        store.Ticket = store.Ticket.filter((x) => x.id !== id);
        saveStore(store);
      }
      return { success: true };
    }

    const aptDelMatch = cleanPath.match(/\/appointments\/([^\/]+)/);
    if (aptDelMatch) {
      const id = aptDelMatch[1];
      if (store.Appointment) {
        store.Appointment = store.Appointment.filter((x) => x.id !== id);
        saveStore(store);
      }
      return { success: true };
    }
  }

  return undefined;
}
