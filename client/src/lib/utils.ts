import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatDistance(distance: number | string): string {
  const num = typeof distance === "string" ? parseFloat(distance) : distance;
  return `${num.toFixed(1)} km`;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
    case "completed":
    case "verified":
      return "status-active";
    case "suspended":
    case "delivery":
    case "pickup":
      return "status-suspended";
    case "pending":
    case "assigned":
      return "status-pending";
    case "cancelled":
    case "blocked":
    case "rejected":
      return "status-cancelled";
    default:
      return "status-pending";
  }
}

export function getStatusText(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "Aktif";
    case "suspended":
      return "Ditangguhkan";
    case "pending":
      return "Menunggu";
    case "completed":
      return "Selesai";
    case "cancelled":
      return "Dibatalkan";
    case "blocked":
      return "Diblokir";
    case "verified":
      return "Terverifikasi";
    case "rejected":
      return "Ditolak";
    case "assigned":
      return "Ditugaskan";
    case "pickup":
      return "Menuju Pickup";
    case "delivery":
      return "Dalam Perjalanan";
    default:
      return status;
  }
}
