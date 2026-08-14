export function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function signedClass(value) {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "";
}

export function formatApiError(error) {
  if (!error.details) return error.message;
  const { availablePackets, availableWeight } = error.details;
  return `${error.message}. Available: ${availablePackets} packets / ${availableWeight} KG.`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

export function balanceLabel(value) {
  if (value > 0) return "Party will pay you";
  if (value < 0) return "You will pay party";
  return "Settled";
}
