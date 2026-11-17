export const supportContact = {
  label: "SMA Hope UK support",
  phone: "447881194138",
  displayPhone: "+44 7881 194138",
  message: "Hello, I have a question about SMA Hope Foundation.",
} as const;

export const supportWhatsAppUrl = `https://wa.me/${supportContact.phone}?text=${encodeURIComponent(supportContact.message)}`;
