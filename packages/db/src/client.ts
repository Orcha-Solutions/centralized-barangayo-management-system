import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as T from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TenantScope {
  level: "platform" | "region" | "province" | "city" | "barangay" | "self";
  barangayId?: string;
  cityId?: string;
  inhabitantId?: string;
  aggregatesOnly?: boolean;
}

export const store: Record<string, any[]> = {};

// Load seed data if it exists
try {
  const seedPath = path.join(__dirname, "seed.json");
  if (fs.existsSync(seedPath)) {
    const raw = fs.readFileSync(seedPath, "utf8");
    const parsed = JSON.parse(raw, (key, value) => {
      if (typeof value === "string" && /^-?\d+n$/.test(value)) {
        return BigInt(value.slice(0, -1));
      }
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
        return new Date(value);
      }
      return value;
    });
    Object.assign(store, parsed);
  }
} catch (e) {
  // ignore
}

const BARANGAY_SCOPED_MODELS = new Set<string>([
  "Household", "Inhabitant", "ConsentRecord", "CertificateType", "CertificateRequest",
  "BlotterEntry", "KpCase", "Property", "Material", "Hazard", "EvacuationCenter",
  "DisasterEvent", "GadPlan", "Legislation", "DevelopmentPlan", "Institution",
  "Budget", "LedgerEntry", "OfficialReceipt", "SitePage", "SitePost", "ReportRun",
  "Ticket", "FileObject", "Wallet", "WalletTransaction", "DisbursementBatch",
  "Merchant", "Agent", "BillPayment", "Concern", "SosAlert", "Announcement",
  "Appointment", "Feedback", "HealthCampaign", "JobPost", "BenefitApplication",
  "PbCycle", "Assembly", "AuditLog", "AiInteraction", "AiWorkflowRun", "BimsSyncRun"
]);

const SELF_OWNED_MODELS = new Set<string>([
  "CertificateRequest", "Concern", "SosAlert", "Appointment", "Feedback",
  "BenefitApplication", "Wallet"
]);

function findItem(modelName: string, id: string) {
  return (store[modelName] || []).find(item => item.id === id) || null;
}

function findItemByField(modelName: string, field: string, value: any) {
  return (store[modelName] || []).find(item => item[field] === value) || null;
}

function resolveRelations(modelName: string, item: any) {
  if (!item) return item;
  const resolved = { ...item };

  for (const [key, val] of Object.entries(resolved)) {
    if (key.endsWith('Id') && typeof val === 'string') {
      const relName = key.slice(0, -2);
      const targetModel = relName.charAt(0).toUpperCase() + relName.slice(1);
      if (store[targetModel]) {
        resolved[relName] = findItem(targetModel, val);
      }
    }
  }

  for (const [targetModel, items] of Object.entries(store)) {
    const fkKey = modelName.charAt(0).toLowerCase() + modelName.slice(1) + 'Id';
    const matching = items.filter(targetItem => targetItem[fkKey] === item.id);
    if (matching.length > 0) {
      const pluralKey = targetModel.charAt(0).toLowerCase() + targetModel.slice(1) + 's';
      resolved[pluralKey] = matching;
    }
  }

  if (modelName === 'Wallet') {
    resolved.merchant = findItemByField('Merchant', 'walletId', item.id);
    resolved.agent = findItemByField('Agent', 'walletId', item.id);
  }
  if (modelName === 'User') {
    resolved.inhabitant = findItem('Inhabitant', item.inhabitantId);
    const userRoles = store.UserRole || [];
    const matchingRoles = userRoles.filter(ur => ur.userId === item.id);
    resolved.roles = matchingRoles.map(ur => findItem('Role', ur.roleId)).filter(Boolean);
  }
  if (modelName === 'Inhabitant') {
    resolved.household = findItem('Household', item.householdId);
    resolved.wallet = findItemByField('Wallet', 'inhabitantId', item.id);
    resolved.digitalId = findItemByField('DigitalId', 'inhabitantId', item.id);
  }
  if (modelName === 'Household') {
    resolved.members = (store.Inhabitant || []).filter(i => i.householdId === item.id);
    resolved.consents = (store.ConsentRecord || []).filter(cr => cr.householdId === item.id);
  }

  return resolved;
}

function matches(item: any, where: any): boolean {
  if (!where) return true;
  for (const [key, value] of Object.entries(where)) {
    if (key === 'OR') {
      if (!Array.isArray(value)) continue;
      if (!value.some(subWhere => matches(item, subWhere))) return false;
      continue;
    }
    if (key === 'AND') {
      if (!Array.isArray(value)) continue;
      if (!value.every(subWhere => matches(item, subWhere))) return false;
      continue;
    }
    if (key === 'NOT') {
      if (Array.isArray(value)) {
        if (value.some(subWhere => matches(item, subWhere))) return false;
      } else {
        if (matches(item, value)) return false;
      }
      continue;
    }

    const itemVal = item[key];
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      const operators = Object.keys(value);
      const isOperator = operators.every(op => ['in', 'notIn', 'contains', 'mode', 'startsWith', 'endsWith', 'gte', 'lte', 'gt', 'lt', 'some', 'every', 'none', 'is', 'isNot', 'not'].includes(op));
      if (isOperator) {
        for (const [op, opVal] of Object.entries(value)) {
          if (op === 'mode') continue;
          if (op === 'in') {
            if (!Array.isArray(opVal)) return false;
            if (!opVal.map(String).includes(String(itemVal))) return false;
          }
          else if (op === 'notIn') {
            if (!Array.isArray(opVal)) return false;
            if (opVal.map(String).includes(String(itemVal))) return false;
          }
          else if (op === 'contains') {
            if (typeof itemVal !== 'string') return false;
            if (!itemVal.toLowerCase().includes(String(opVal).toLowerCase())) return false;
          }
          else if (op === 'startsWith') {
            if (typeof itemVal !== 'string') return false;
            if (!itemVal.toLowerCase().startsWith(String(opVal).toLowerCase())) return false;
          }
          else if (op === 'endsWith') {
            if (typeof itemVal !== 'string') return false;
            if (!itemVal.toLowerCase().endsWith(String(opVal).toLowerCase())) return false;
          }
          else if (op === 'gte') {
            if (itemVal === null || itemVal === undefined || itemVal < (opVal as any)) return false;
          }
          else if (op === 'lte') {
            if (itemVal === null || itemVal === undefined || itemVal > (opVal as any)) return false;
          }
          else if (op === 'gt') {
            if (itemVal === null || itemVal === undefined || itemVal <= (opVal as any)) return false;
          }
          else if (op === 'lt') {
            if (itemVal === null || itemVal === undefined || itemVal >= (opVal as any)) return false;
          }
          else if (op === 'not') {
            if (itemVal === opVal) return false;
          }
        }
      } else {
        if (!itemVal) return false;
        if (!matches(itemVal, value)) return false;
      }
    } else {
      if (itemVal !== value) {
        if (itemVal instanceof Date && value instanceof Date) {
          if (itemVal.getTime() !== value.getTime()) return false;
        } else if (String(itemVal) !== String(value)) {
          return false;
        }
      }
    }
  }
  return true;
}

function sortItems(items: any[], orderBy: any) {
  if (!orderBy) return items;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  return items.sort((a, b) => {
    for (const order of orders) {
      const [key, dir] = Object.entries(order)[0];
      const valA = a[key];
      const valB = b[key];
      if (valA === valB) continue;
      const factor = dir === 'desc' ? -1 : 1;
      if (valA === null || valA === undefined) return 1 * factor;
      if (valB === null || valB === undefined) return -1 * factor;
      return valA < valB ? -1 * factor : 1 * factor;
    }
    return 0;
  });
}

function projectFields(item: any, select: any) {
  if (!select) return item;
  const projected: any = {};
  for (const [key, value] of Object.entries(select)) {
    if (value) {
      if (typeof value === 'object' && item[key]) {
        projected[key] = Array.isArray(item[key])
          ? item[key].map((sub: any) => projectFields(sub, (value as any).select || value))
          : projectFields(item[key], (value as any).select || value);
      } else {
        projected[key] = item[key];
      }
    }
  }
  return projected;
}

export class MockTable<T = any> {
  constructor(private modelName: string, private scope?: TenantScope) {
    if (!store[this.modelName]) {
      store[this.modelName] = [];
    }
  }

  private applyScope(where: any) {
    if (!this.scope || this.scope.level === 'platform') return where;
    if (!BARANGAY_SCOPED_MODELS.has(this.modelName)) return where;

    const base = { ...(where || {}) };
    switch (this.scope.level) {
      case 'barangay':
        base.barangayId = this.scope.barangayId;
        break;
      case 'self':
        if (this.scope.barangayId) base.barangayId = this.scope.barangayId;
        if (SELF_OWNED_MODELS.has(this.modelName)) {
          base.inhabitantId = this.scope.inhabitantId;
        }
        break;
      case 'city':
        base.barangay = { ...(base.barangay || {}), cityId: this.scope.cityId };
        break;
    }
    return base;
  }

  async create(args: any): Promise<T> {
    const data = args.data;
    const item = {
      id: data.id || Math.random().toString(36).slice(2, 9),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store[this.modelName].push(item);
    return resolveRelations(this.modelName, item) as any;
  }

  async createMany(args: any): Promise<{ count: number }> {
    const data = Array.isArray(args.data) ? args.data : [args.data];
    const created = data.map((d: any) => ({
      id: d.id || Math.random().toString(36).slice(2, 9),
      ...d,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    store[this.modelName].push(...created);
    return { count: created.length };
  }

  async findMany(args?: any): Promise<T[]> {
    let items = store[this.modelName] || [];
    const where = this.applyScope(args?.where);
    if (where) {
      items = items.filter(item => matches(item, where));
    }
    items = sortItems(items, args?.orderBy);
    if (args?.skip !== undefined) {
      items = items.slice(args.skip);
    }
    if (args?.take !== undefined) {
      items = items.slice(0, args.take);
    }
    const resolved = items.map(item => resolveRelations(this.modelName, item));
    if (args?.select || args?.include) {
      return resolved.map(item => projectFields(item, args.select || args.include)) as any;
    }
    return resolved as any;
  }

  async findFirst(args?: any): Promise<T | null> {
    const items = await this.findMany(args);
    return items[0] || null;
  }

  async findFirstOrThrow(args?: any): Promise<T> {
    const item = await this.findFirst(args);
    if (!item) throw new Error(`${this.modelName} not found.`);
    return item;
  }

  async findUnique(args?: any): Promise<T | null> {
    return this.findFirst(args);
  }

  async findUniqueOrThrow(args?: any): Promise<T> {
    return this.findFirstOrThrow(args);
  }

  async count(args?: any): Promise<number> {
    let items = store[this.modelName] || [];
    const where = this.applyScope(args?.where);
    if (where) {
      items = items.filter(item => matches(item, where));
    }
    return items.length;
  }

  async update(args: any): Promise<T> {
    const { where, data } = args;
    const items = store[this.modelName] || [];
    const index = items.findIndex(item => matches(item, this.applyScope(where)));
    if (index === -1) throw new Error(`${this.modelName} not found for update.`);
    const existing = items[index];
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    items[index] = updated;
    return resolveRelations(this.modelName, updated) as any;
  }

  async updateMany(args: any): Promise<{ count: number }> {
    const { where, data } = args;
    let count = 0;
    const scopedWhere = this.applyScope(where);
    store[this.modelName] = (store[this.modelName] || []).map(item => {
      if (matches(item, scopedWhere)) {
        count++;
        return {
          ...item,
          ...data,
          updatedAt: new Date(),
        };
      }
      return item;
    });
    return { count };
  }

  async delete(args: any): Promise<T> {
    const { where } = args;
    const items = store[this.modelName] || [];
    const index = items.findIndex(item => matches(item, this.applyScope(where)));
    if (index === -1) throw new Error(`${this.modelName} not found for delete.`);
    const deleted = items[index];
    items.splice(index, 1);
    return resolveRelations(this.modelName, deleted) as any;
  }

  async deleteMany(args: any): Promise<{ count: number }> {
    const { where } = args;
    const scopedWhere = this.applyScope(where);
    const beforeCount = (store[this.modelName] || []).length;
    store[this.modelName] = (store[this.modelName] || []).filter(item => !matches(item, scopedWhere));
    return { count: beforeCount - store[this.modelName].length };
  }

  async upsert(args: any): Promise<T> {
    const { where, create, update } = args;
    const existing = await this.findFirst({ where });
    if (existing) {
      return this.update({ where, data: update });
    } else {
      return this.create({ data: create });
    }
  }

  async groupBy(args: any): Promise<any[]> {
    const items = await this.findMany({ where: args.where });
    const byFields = args.by;
    const groups = new Map<string, any[]>();
    for (const item of items) {
      const key = byFields.map((f: string) => String((item as any)[f])).join('|');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    const result: any[] = [];
    for (const [key, groupItems] of groups.entries()) {
      const keys = key.split('|');
      const item: any = {};
      byFields.forEach((f: string, i: number) => {
        item[f] = keys[i];
      });
      if (args._avg) {
        item._avg = {};
        for (const f of Object.keys(args._avg)) {
          const sum = groupItems.reduce((s, x) => s + Number((x as any)[f] || 0), 0);
          item._avg[f] = groupItems.length ? sum / groupItems.length : 0;
        }
      }
      if (args._count) {
        if (typeof args._count === 'boolean') {
          item._count = groupItems.length;
        } else {
          item._count = {};
          for (const f of Object.keys(args._count)) {
            item._count[f] = groupItems.filter(x => x[f] !== null && x[f] !== undefined).length;
          }
        }
      }
      result.push(item);
    }
    return result;
  }

  async aggregate(args: any): Promise<any> {
    const items = await this.findMany({ where: args.where });
    const result: any = {};
    if (args._sum) {
      result._sum = {};
      for (const f of Object.keys(args._sum)) {
        result._sum[f] = items.reduce((s, x) => s + Number((x as any)[f] || 0), 0);
      }
    }
    if (args._avg) {
      result._avg = {};
      for (const f of Object.keys(args._avg)) {
        const sum = items.reduce((s, x) => s + Number((x as any)[f] || 0), 0);
        result._avg[f] = items.length ? sum / items.length : 0;
      }
    }
    if (args._count) {
      result._count = items.length;
    }
    return result;
  }
}

export interface PrismaClientMock {
  region: MockTable<T.Region>;
  province: MockTable<T.Province>;
  city: MockTable<T.City>;
  barangay: MockTable<T.Barangay>;
  role: MockTable<T.Role>;
  permission: MockTable<T.Permission>;
  rolePermission: MockTable<T.RolePermission>;
  user: MockTable<T.User>;
  userRole: MockTable<T.UserRole>;
  session: MockTable<T.Session>;
  auditLog: MockTable<T.AuditLog>;
  consentRecord: MockTable<T.ConsentRecord>;
  household: MockTable<T.Household>;
  inhabitant: MockTable<T.Inhabitant>;
  residencyHistory: MockTable<T.ResidencyHistory>;
  certificateType: MockTable<T.CertificateType>;
  certificateRequest: MockTable<T.CertificateRequest>;
  blotterEntry: MockTable<T.BlotterEntry>;
  kpCase: MockTable<T.KpCase>;
  kpParty: MockTable<T.KpParty>;
  kpHearing: MockTable<T.KpHearing>;
  kpDocument: MockTable<T.KpDocument>;
  property: MockTable<T.Property>;
  maintenanceRecord: MockTable<T.MaintenanceRecord>;
  material: MockTable<T.Material>;
  hazard: MockTable<T.Hazard>;
  evacuationCenter: MockTable<T.EvacuationCenter>;
  disasterEvent: MockTable<T.DisasterEvent>;
  evacuationRecord: MockTable<T.EvacuationRecord>;
  reliefDistribution: MockTable<T.ReliefDistribution>;
  gadPlan: MockTable<T.GadPlan>;
  gadActivity: MockTable<T.GadActivity>;
  legislation: MockTable<T.Legislation>;
  developmentPlan: MockTable<T.DevelopmentPlan>;
  devProject: MockTable<T.DevProject>;
  institution: MockTable<T.Institution>;
  institutionMember: MockTable<T.InstitutionMember>;
  institutionMinutes: MockTable<T.InstitutionMinutes>;
  budget: MockTable<T.Budget>;
  budgetLine: MockTable<T.BudgetLine>;
  ledgerEntry: MockTable<T.LedgerEntry>;
  officialReceipt: MockTable<T.OfficialReceipt>;
  sitePage: MockTable<T.SitePage>;
  sitePost: MockTable<T.SitePost>;
  reportRun: MockTable<T.ReportRun>;
  ticket: MockTable<T.Ticket>;
  ticketResponse: MockTable<T.TicketResponse>;
  fileObject: MockTable<T.FileObject>;
  featureFlag: MockTable<T.FeatureFlag>;
  bimsSyncRun: MockTable<T.BimsSyncRun>;
  wallet: MockTable<T.Wallet>;
  walletTransaction: MockTable<T.WalletTransaction>;
  disbursementBatch: MockTable<T.DisbursementBatch>;
  disbursementBatchItem: MockTable<T.DisbursementBatchItem>;
  merchant: MockTable<T.Merchant>;
  agent: MockTable<T.Agent>;
  agentFloatLog: MockTable<T.AgentFloatLog>;
  biller: MockTable<T.Biller>;
  billPayment: MockTable<T.BillPayment>;
  dispute: MockTable<T.Dispute>;
  aiInteraction: MockTable<T.AiInteraction>;
  aiWorkflowRun: MockTable<T.AiWorkflowRun>;
  aiWorkflowStep: MockTable<T.AiWorkflowStep>;
  concern: MockTable<T.Concern>;
  sosAlert: MockTable<T.SosAlert>;
  announcement: MockTable<T.Announcement>;
  announcementReply: MockTable<T.AnnouncementReply>;
  appointment: MockTable<T.Appointment>;
  feedback: MockTable<T.Feedback>;
  digitalId: MockTable<T.DigitalId>;
  healthCampaign: MockTable<T.HealthCampaign>;
  healthRecord: MockTable<T.HealthRecord>;
  jobPost: MockTable<T.JobPost>;
  jobApplication: MockTable<T.JobApplication>;
  benefitApplication: MockTable<T.BenefitApplication>;
  pbCycle: MockTable<T.PbCycle>;
  pbOption: MockTable<T.PbOption>;
  pbVote: MockTable<T.PbVote>;
  assembly: MockTable<T.Assembly>;
  $executeRawUnsafe(query: string, ...values: any[]): Promise<any>;
  $executeRaw(query: any, ...values: any[]): Promise<any>;
  $queryRaw(query: any, ...values: any[]): Promise<any[]>;
  $queryRawUnsafe(query: string, ...values: any[]): Promise<any[]>;
  $transaction(fn: (tx: PrismaClientMock) => Promise<any>): Promise<any>;
  $disconnect(): Promise<void>;
  $connect(): Promise<void>;
}

export const prisma = new Proxy({} as any, {
  get(target, prop) {
    if (prop === '$executeRawUnsafe' || prop === '$executeRaw') {
      return async () => {};
    }
    if (prop === '$queryRaw' || prop === '$queryRawUnsafe') {
      return async () => [];
    }
    if (prop === '$connect' || prop === '$disconnect') {
      return async () => {};
    }
    if (prop === '$transaction') {
      return async (fn: any) => {
        if (typeof fn === 'function') {
          return fn(prisma);
        }
        return fn;
      };
    }
    const propStr = String(prop);
    const modelName = propStr.charAt(0).toUpperCase() + propStr.slice(1);
    return new MockTable(modelName);
  }
}) as unknown as PrismaClientMock;

export function createScopedClient(scope: TenantScope): PrismaClientMock {
  return new Proxy({} as any, {
    get(target, prop) {
      if (prop === '$executeRawUnsafe' || prop === '$executeRaw') {
        return async () => {};
      }
      if (prop === '$queryRaw' || prop === '$queryRawUnsafe') {
        return async () => [];
      }
      if (prop === '$connect' || prop === '$disconnect') {
        return async () => {};
      }
      if (prop === '$transaction') {
        return async (fn: any) => {
          if (typeof fn === 'function') {
            return fn(createScopedClient(scope));
          }
          return fn;
        };
      }
      const propStr = String(prop);
      const modelName = propStr.charAt(0).toUpperCase() + propStr.slice(1);
      return new MockTable(modelName, scope);
    }
  }) as unknown as PrismaClientMock;
}
