// lib/api.ts
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "/api").replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function isJsonResponse(response: Response) {
  const contentType = response.headers.get("content-type");
  return contentType ? contentType.includes("application/json") : false;
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    const payload = isJsonResponse(res)
      ? await res.json().catch(() => ({}))
      : {};

    if (!res.ok) {
      throw new ApiError(
        (payload as { message?: string }).message ?? `Erro ${res.status}`,
        res.status,
        payload,
      );
    }

    return payload;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      0,
    );
  }
}

export type UserRole = "admin" | "morador" | "limpeza";

export type User = {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  role: UserRole;
  cpf?: string | null;
  apartment?: string | null;
  parkingSpaces?: string[];
  active?: boolean;
};

export type AreaItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  category?: string;
};

export type CommonArea = {
  id: string;
  name: string;
  description?: string | null;
  capacity: number;
  pricePerHour: number;
  available: boolean;
  items: AreaItem[];
  reservations?: Reservation[];
};

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type CleaningStatus = "pending" | "cleaned";

export type Reservation = {
  id: string;
  userId: string;
  areaId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  guests: number;
  status: ReservationStatus;
  observations?: string | null;
  createdAt: string;
  updatedAt?: string;
  user: User;
  area: CommonArea;
  cleaningStatus: CleaningStatus;
  cleanedAt?: string | null;
  cleanedById?: string | null;
  cleanedBy?: Pick<User, "id" | "name" | "email" | "role" | "apartment"> | null;
  itemsVerified: boolean;
  cleaningNotes?: string | null;
};

export type AnnouncementType = "info" | "warning" | "urgent" | "event";

export type Announcement = {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  publishAt: string;
  author: User;
};

export type Payment = {
  id: string;
  userId: string;
  amount: number;
  dueDate: string;
  paidDate?: string | null;
  status: "pending" | "paid" | "overdue" | string;
  type: string;
  referenceMonth?: string | null;
  createdAt: string;
  user?: Pick<User, "id" | "name" | "email" | "apartment" | "parkingSpaces">;
};

export type Occurrence = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "cancelled";
  createdAt: string;
  reporter?: Pick<User, "id" | "name" | "email" | "apartment">;
  assignee?: Pick<User, "id" | "name" | "email"> | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  userId?: string | null;
  role: "user" | "assistant" | "system" | string;
  content: string;
  metadata?: unknown;
  createdAt: string;
};

export type AiConversation = {
  id: string;
  userId: string;
  title?: string | null;
  context?: unknown;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, "id" | "name" | "email" | "apartment">;
  messages: ChatMessage[];
};

export type NotificationKind = "info" | "success" | "warning" | "error";

export type Notification = {
  id: string;
  type: NotificationKind;
  title: string;
  description: string;
  module: string;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export type NotificationResponse = {
  notifications: Notification[];
  unreadCount: number;
};
