import type { AdminAuditAction, ClickAuditAction } from "@/lib/admin-audit-log";

const LABELS: Record<ClickAuditAction, { fr: { short: string; mine: string }; ar: { short: string; mine: string } }> = {
  CLICK_NAV_DASHBOARD: {
    fr: { short: "Clic · Menu dashboard", mine: "Navigation · Dashboard" },
    ar: { short: "نقر · لوحة التحكم", mine: "تنقّل · لوحة التحكم" },
  },
  CLICK_NAV_PRODUCTS: {
    fr: { short: "Clic · Menu produits", mine: "Navigation · Produits" },
    ar: { short: "نقر · المنتجات", mine: "تنقّل · المنتجات" },
  },
  CLICK_NAV_CATEGORIES: {
    fr: { short: "Clic · Menu catégories", mine: "Navigation · Catégories" },
    ar: { short: "نقر · الفئات", mine: "تنقّل · الفئات" },
  },
  CLICK_NAV_ORDERS: {
    fr: { short: "Clic · Menu commandes", mine: "Navigation · Commandes" },
    ar: { short: "نقر · الطلبات", mine: "تنقّل · الطلبات" },
  },
  CLICK_NAV_CLIENTS: {
    fr: { short: "Clic · Menu clients", mine: "Navigation · Clients" },
    ar: { short: "نقر · العملاء", mine: "تنقّل · العملاء" },
  },
  CLICK_NAV_USERS: {
    fr: { short: "Clic · Menu utilisateurs", mine: "Navigation · Utilisateurs" },
    ar: { short: "نقر · المستخدمون", mine: "تنقّل · المستخدمون" },
  },
  CLICK_NAV_ROLES: {
    fr: { short: "Clic · Menu rôles", mine: "Navigation · Rôles" },
    ar: { short: "نقر · الأدوار", mine: "تنقّل · الأدوار" },
  },
  CLICK_NAV_LOGS: {
    fr: { short: "Clic · Menu journaux", mine: "Navigation · Journaux" },
    ar: { short: "نقر · السجلات", mine: "تنقّل · السجلات" },
  },
  CLICK_NAV_SHOP: {
    fr: { short: "Clic · Voir la boutique", mine: "Lien · Boutique" },
    ar: { short: "نقر · المتجر", mine: "رابط · المتجر" },
  },
  CLICK_UI_MOBILE_MENU_OPEN: {
    fr: { short: "Clic · Ouvrir menu mobile", mine: "Interface · Menu mobile ouvert" },
    ar: { short: "نقر · فتح القائمة", mine: "واجهة · فتح القائمة" },
  },
  CLICK_UI_MOBILE_MENU_CLOSE: {
    fr: { short: "Clic · Fermer menu mobile", mine: "Interface · Menu mobile fermé" },
    ar: { short: "نقر · إغلاق القائمة", mine: "واجهة · إغلاق القائمة" },
  },
  CLICK_UI_THEME_TOGGLE: {
    fr: { short: "Clic · Thème clair/sombre", mine: "Interface · Changement de thème" },
    ar: { short: "نقر · المظهر", mine: "واجهة · تغيير المظهر" },
  },
  CLICK_DASH_ORDERS_CARD: {
    fr: { short: "Clic · Carte commandes", mine: "Dashboard · Carte commandes" },
    ar: { short: "نقر · بطاقة الطلبات", mine: "لوحة · بطاقة الطلبات" },
  },
  CLICK_DASH_SEE_ALL_PRODUCTS: {
    fr: { short: "Clic · Voir tous les produits", mine: "Dashboard · Lien tous produits" },
    ar: { short: "نقر · كل المنتجات", mine: "لوحة · كل المنتجات" },
  },
  CLICK_DASH_PRODUCT_SALES_TAB: {
    fr: { short: "Clic · Onglet ventes produits", mine: "Dashboard · Filtre ventes" },
    ar: { short: "نقر · تبويب المبيعات", mine: "لوحة · تصفية المبيعات" },
  },
  CLICK_PRODUCT_ADD_OPEN: {
    fr: { short: "Clic · Ajouter produit", mine: "Produits · Ouvrir formulaire création" },
    ar: { short: "نقر · إضافة منتج", mine: "منتجات · إنشاء" },
  },
  CLICK_PRODUCT_EDIT_OPEN: {
    fr: { short: "Clic · Modifier produit", mine: "Produits · Édition" },
    ar: { short: "نقر · تعديل منتج", mine: "منتجات · تعديل" },
  },
  CLICK_PRODUCT_DELETE_OPEN: {
    fr: { short: "Clic · Supprimer produit (dialog)", mine: "Produits · Suppression" },
    ar: { short: "نقر · حذف منتج", mine: "منتجات · حذف" },
  },
  CLICK_PRODUCT_VIEW_SHOP: {
    fr: { short: "Clic · Voir fiche boutique", mine: "Produits · Aperçu boutique" },
    ar: { short: "نقر · عرض في المتجر", mine: "منتجات · معاينة" },
  },
  CLICK_PRODUCT_PAGE_PREV: {
    fr: { short: "Clic · Pagination produits préc.", mine: "Produits · Page précédente" },
    ar: { short: "نقر · صفحة سابقة", mine: "منتجات · السابق" },
  },
  CLICK_PRODUCT_PAGE_NEXT: {
    fr: { short: "Clic · Pagination produits suiv.", mine: "Produits · Page suivante" },
    ar: { short: "نقر · صفحة تالية", mine: "منتجات · التالي" },
  },
  CLICK_PRODUCT_FORM_SUBMIT: {
    fr: { short: "Clic · Envoi formulaire produit", mine: "Produit · Enregistrer" },
    ar: { short: "نقر · حفظ المنتج", mine: "منتج · حفظ" },
  },
  CLICK_PRODUCT_FORM_CANCEL: {
    fr: { short: "Clic · Annuler formulaire produit", mine: "Produit · Annuler" },
    ar: { short: "نقر · إلغاء", mine: "منتج · إلغاء" },
  },
  CLICK_PRODUCT_IMAGE_ADD_URL: {
    fr: { short: "Clic · Ajouter image URL", mine: "Produit · Image URL" },
    ar: { short: "نقر · صورة من رابط", mine: "منتج · رابط صورة" },
  },
  CLICK_PRODUCT_IMAGE_IMPORT_BATCH: {
    fr: { short: "Clic · Importer URLs images", mine: "Produit · Import URLs" },
    ar: { short: "نقر · استيراد روابط", mine: "منتج · استيراد" },
  },
  CLICK_PRODUCT_IMAGE_MOVE_UP: {
    fr: { short: "Clic · Image vers le haut", mine: "Produit · Réordonner image" },
    ar: { short: "نقر · نقل صورة لأعلى", mine: "منتج · ترتيب" },
  },
  CLICK_PRODUCT_IMAGE_MOVE_DOWN: {
    fr: { short: "Clic · Image vers le bas", mine: "Produit · Réordonner image" },
    ar: { short: "نقر · نقل صورة لأسفل", mine: "منتج · ترتيب" },
  },
  CLICK_PRODUCT_IMAGE_REMOVE: {
    fr: { short: "Clic · Retirer une image", mine: "Produit · Supprimer image" },
    ar: { short: "نقر · حذف صورة", mine: "منتج · حذف صورة" },
  },
  CLICK_PRODUCT_PACK_ADD_ROW: {
    fr: { short: "Clic · Pack · ligne perso", mine: "Pack · Ajouter ligne" },
    ar: { short: "نقر · حزمة · سطر", mine: "حزمة · إضافة" },
  },
  CLICK_PRODUCT_PACK_REMOVE_ITEM: {
    fr: { short: "Clic · Pack · retirer article", mine: "Pack · Retirer" },
    ar: { short: "نقر · حزمة · إزالة", mine: "حزمة · إزالة" },
  },
  CLICK_CATEGORY_ADD_OPEN: {
    fr: { short: "Clic · Nouvelle catégorie", mine: "Catégories · Création" },
    ar: { short: "نقر · فئة جديدة", mine: "فئات · إنشاء" },
  },
  CLICK_CATEGORY_EDIT_OPEN: {
    fr: { short: "Clic · Modifier catégorie", mine: "Catégories · Édition" },
    ar: { short: "نقر · تعديل فئة", mine: "فئات · تعديل" },
  },
  CLICK_CATEGORY_DELETE_OPEN: {
    fr: { short: "Clic · Supprimer catégorie", mine: "Catégories · Suppression" },
    ar: { short: "نقر · حذف فئة", mine: "فئات · حذف" },
  },
  CLICK_CATEGORY_SUBMIT: {
    fr: { short: "Clic · Enregistrer catégorie", mine: "Catégorie · Enregistrer" },
    ar: { short: "نقر · حفظ الفئة", mine: "فئة · حفظ" },
  },
  CLICK_CATEGORY_CANCEL: {
    fr: { short: "Clic · Annuler catégorie", mine: "Catégorie · Annuler" },
    ar: { short: "نقر · إلغاء", mine: "فئة · إلغاء" },
  },
  CLICK_CATEGORY_MOVE_UP: {
    fr: { short: "Clic · Catégorie monter", mine: "Catégorie · Ordre ↑" },
    ar: { short: "نقر · نقل لأعلى", mine: "فئة · ترتيب" },
  },
  CLICK_CATEGORY_MOVE_DOWN: {
    fr: { short: "Clic · Catégorie descendre", mine: "Catégorie · Ordre ↓" },
    ar: { short: "نقر · نقل لأسفل", mine: "فئة · ترتيب" },
  },
  CLICK_CATEGORY_APPLY_IMAGE_URL: {
    fr: { short: "Clic · Image catégorie URL", mine: "Catégorie · Image URL" },
    ar: { short: "نقر · صورة من رابط", mine: "فئة · صورة" },
  },
  CLICK_CATEGORY_CLEAR_IMAGE: {
    fr: { short: "Clic · Retirer image catégorie", mine: "Catégorie · Sans image" },
    ar: { short: "نقر · إزالة الصورة", mine: "فئة · إزالة صورة" },
  },
  CLICK_ORDER_TAB_ALL: {
    fr: { short: "Clic · Commandes · Tous", mine: "Commandes · Onglet tous" },
    ar: { short: "نقر · الطلبات · الكل", mine: "طلبات · الكل" },
  },
  CLICK_ORDER_TAB_PENDING: {
    fr: { short: "Clic · Commandes · En attente", mine: "Commandes · En attente" },
    ar: { short: "نقر · قيد الانتظار", mine: "طلبات · معلقة" },
  },
  CLICK_ORDER_TAB_CONFIRMED: {
    fr: { short: "Clic · Commandes · Confirmées", mine: "Commandes · Confirmées" },
    ar: { short: "نقر · مؤكدة", mine: "طلبات · مؤكدة" },
  },
  CLICK_ORDER_OPEN_DETAIL: {
    fr: { short: "Clic · Détail commande", mine: "Commande · Détails" },
    ar: { short: "نقر · تفاصيل الطلب", mine: "طلب · تفاصيل" },
  },
  CLICK_ORDER_EXPORT_EXCEL: {
    fr: { short: "Clic · Export Excel commandes", mine: "Commandes · Export Excel" },
    ar: { short: "نقر · تصدير Excel", mine: "طلبات · Excel" },
  },
  CLICK_ORDER_ROW_CONFIRM: {
    fr: { short: "Clic · Confirmer (liste)", mine: "Commande · Confirmer (liste)" },
    ar: { short: "نقر · تأكيد من القائمة", mine: "طلب · تأكيد" },
  },
  CLICK_ORDER_MODAL_PDF: {
    fr: { short: "Clic · PDF commande", mine: "Commande · PDF" },
    ar: { short: "نقر · PDF", mine: "طلب · PDF" },
  },
  CLICK_ORDER_MODAL_CONFIRM: {
    fr: { short: "Clic · Confirmer (modal)", mine: "Commande · Confirmer (fenêtre)" },
    ar: { short: "نقر · تأكيد من النافذة", mine: "طلب · تأكيد" },
  },
  CLICK_ORDER_MODAL_CLOSE: {
    fr: { short: "Clic · Fermer modal commande", mine: "Commande · Fermer" },
    ar: { short: "نقر · إغلاق", mine: "طلب · إغلاق" },
  },
  CLICK_ORDER_MODAL_BACKDROP: {
    fr: { short: "Clic · Fond modal commande", mine: "Commande · Fond fermé" },
    ar: { short: "نقر · خلفية الإغلاق", mine: "طلب · خلفية" },
  },
  CLICK_ORDER_CHECKOUT_TEST_LINK: {
    fr: { short: "Clic · Lien tester checkout", mine: "Commandes · Tester checkout" },
    ar: { short: "نقر · تجربة الدفع", mine: "طلبات · تجربة" },
  },
  CLICK_CLIENT_OPEN_DETAIL: {
    fr: { short: "Clic · Détail client", mine: "Client · Détails" },
    ar: { short: "نقر · تفاصيل عميل", mine: "عميل · تفاصيل" },
  },
  CLICK_CLIENT_DELETE_OPEN: {
    fr: { short: "Clic · Supprimer client", mine: "Client · Suppression" },
    ar: { short: "نقر · حذف عميل", mine: "عميل · حذف" },
  },
  CLICK_CLIENT_MODAL_SAVE: {
    fr: { short: "Clic · Enregistrer client", mine: "Client · Enregistrer" },
    ar: { short: "نقر · حفظ العميل", mine: "عميل · حفظ" },
  },
  CLICK_CLIENT_MODAL_CLOSE: {
    fr: { short: "Clic · Fermer fiche client", mine: "Client · Fermer" },
    ar: { short: "نقر · إغلاق", mine: "عميل · إغلاق" },
  },
  CLICK_CLIENT_MODAL_BACKDROP: {
    fr: { short: "Clic · Fond fiche client", mine: "Client · Fond fermé" },
    ar: { short: "نقر · خلفية الإغلاق", mine: "عميل · خلفية" },
  },
  CLICK_CLIENT_SEE_ORDERS_LINK: {
    fr: { short: "Clic · Voir commandes (client)", mine: "Client · Lien commandes" },
    ar: { short: "نقر · الطلبات", mine: "عميل · طلبات" },
  },
  CLICK_USER_ADD_OPEN: {
    fr: { short: "Clic · Nouvel utilisateur", mine: "Utilisateurs · Création" },
    ar: { short: "نقر · مستخدم جديد", mine: "مستخدمون · إنشاء" },
  },
  CLICK_USER_EDIT_OPEN: {
    fr: { short: "Clic · Modifier utilisateur", mine: "Utilisateurs · Édition" },
    ar: { short: "نقر · تعديل مستخدم", mine: "مستخدمون · تعديل" },
  },
  CLICK_USER_DELETE_OPEN: {
    fr: { short: "Clic · Supprimer utilisateur", mine: "Utilisateurs · Suppression" },
    ar: { short: "نقر · حذف مستخدم", mine: "مستخدمون · حذف" },
  },
  CLICK_USER_FORM_SUBMIT: {
    fr: { short: "Clic · Envoi formulaire user", mine: "Utilisateur · Enregistrer" },
    ar: { short: "نقر · حفظ المستخدم", mine: "مستخدم · حفظ" },
  },
  CLICK_USER_FORM_CANCEL: {
    fr: { short: "Clic · Annuler formulaire user", mine: "Utilisateur · Annuler" },
    ar: { short: "نقر · إلغاء", mine: "مستخدم · إلغاء" },
  },
  CLICK_USER_VIEW_LOGS: {
    fr: { short: "Clic · Journaux utilisateur", mine: "Utilisateurs · Logs" },
    ar: { short: "نقر · سجلات المستخدم", mine: "مستخدمون · سجلات" },
  },
  CLICK_ROLE_ADD_OPEN: {
    fr: { short: "Clic · Nouveau rôle", mine: "Rôles · Création" },
    ar: { short: "نقر · دور جديد", mine: "أدوار · إنشاء" },
  },
  CLICK_ROLE_EDIT_OPEN: {
    fr: { short: "Clic · Modifier rôle", mine: "Rôles · Édition" },
    ar: { short: "نقر · تعديل دور", mine: "أدوار · تعديل" },
  },
  CLICK_ROLE_DELETE_OPEN: {
    fr: { short: "Clic · Supprimer rôle", mine: "Rôles · Suppression" },
    ar: { short: "نقر · حذف دور", mine: "أدوار · حذف" },
  },
  CLICK_ROLE_FORM_SUBMIT: {
    fr: { short: "Clic · Enregistrer rôle", mine: "Rôle · Enregistrer" },
    ar: { short: "نقر · حفظ الدور", mine: "دور · حفظ" },
  },
  CLICK_ROLE_FORM_CANCEL: {
    fr: { short: "Clic · Annuler rôle", mine: "Rôle · Annuler" },
    ar: { short: "نقر · إلغاء", mine: "دور · إلغاء" },
  },
  CLICK_LOGS_TAB_MINE: {
    fr: { short: "Clic · Journaux · Mes actions", mine: "Journaux · Mes actions" },
    ar: { short: "نقر · سجلاتي", mine: "سجلات · لي" },
  },
  CLICK_LOGS_TAB_TEAM: {
    fr: { short: "Clic · Journaux · Équipe", mine: "Journaux · Équipe" },
    ar: { short: "نقر · فريق", mine: "سجلات · الفريق" },
  },
  CLICK_LOGS_PAGE_PREV: {
    fr: { short: "Clic · Journaux page préc.", mine: "Journaux · Page préc." },
    ar: { short: "نقر · سجلات سابق", mine: "سجلات · سابق" },
  },
  CLICK_LOGS_PAGE_NEXT: {
    fr: { short: "Clic · Journaux page suiv.", mine: "Journaux · Page suiv." },
    ar: { short: "نقر · سجلات تالي", mine: "سجلات · تالي" },
  },
  CLICK_SESSION_LOGOUT: {
    fr: { short: "Clic · Déconnexion", mine: "Session · Déconnexion" },
    ar: { short: "نقر · تسجيل الخروج", mine: "جلسة · خروج" },
  },
  CLICK_AUTH_LOGIN_SUBMIT: {
    fr: { short: "Clic · Connexion admin", mine: "Auth · Connexion" },
    ar: { short: "نقر · تسجيل الدخول", mine: "دخول · مسؤول" },
  },
  CLICK_DIALOG_CONFIRM: {
    fr: { short: "Clic · Dialogue confirmer", mine: "Dialogue · Confirmer" },
    ar: { short: "نقر · تأكيد الحوار", mine: "حوار · تأكيد" },
  },
  CLICK_DIALOG_CANCEL: {
    fr: { short: "Clic · Dialogue annuler", mine: "Dialogue · Annuler" },
    ar: { short: "نقر · إلغاء الحوار", mine: "حوار · إلغاء" },
  },
  CLICK_DIALOG_BACKDROP: {
    fr: { short: "Clic · Dialogue fond", mine: "Dialogue · Fond" },
    ar: { short: "نقر · خلفية الحوار", mine: "حوار · خلفية" },
  },
};

function localeKey(loc: string): "fr" | "ar" {
  return loc === "ar" ? "ar" : "fr";
}

export function clickAuditShortLabel(action: ClickAuditAction, locale: string): string {
  return LABELS[action][localeKey(locale)].short;
}

export function clickAuditHumanMine(action: ClickAuditAction, locale: string): string {
  return LABELS[action][localeKey(locale)].mine;
}

export function auditActionShortLabel(
  action: AdminAuditAction,
  locale: string,
  legacyLabel: string
): string {
  if (action.startsWith("CLICK_")) {
    return clickAuditShortLabel(action as ClickAuditAction, locale);
  }
  return legacyLabel;
}

export function auditActionHumanMine(
  action: AdminAuditAction,
  locale: string,
  legacyHuman: string
): string {
  if (action.startsWith("CLICK_")) {
    return clickAuditHumanMine(action as ClickAuditAction, locale);
  }
  return legacyHuman;
}
