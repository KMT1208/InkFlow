import { describe, expect, it } from "vitest";
import { computeDepositCents, formatEur } from "@/lib/money";

describe("computeDepositCents", () => {
  it("pourcentage simple (30 % de 300 €)", () => {
    expect(computeDepositCents(30000, "percent", 30)).toBe(9000);
  });

  it("pourcentage arrondi au centime", () => {
    // 33 % de 99,99 € = 32,9967 € → 33,00 €
    expect(computeDepositCents(9999, "percent", 33)).toBe(3300);
  });

  it("pourcentage borné à 100", () => {
    expect(computeDepositCents(30000, "percent", 150)).toBe(30000);
  });

  it("pourcentage négatif ramené à 0", () => {
    expect(computeDepositCents(30000, "percent", -10)).toBe(0);
  });

  it("montant fixe", () => {
    expect(computeDepositCents(30000, "fixed", 5000)).toBe(5000);
  });

  it("montant fixe plafonné au total", () => {
    expect(computeDepositCents(30000, "fixed", 50000)).toBe(30000);
  });

  it("montant fixe négatif ramené à 0", () => {
    expect(computeDepositCents(30000, "fixed", -100)).toBe(0);
  });

  it("total invalide ou nul → 0", () => {
    expect(computeDepositCents(0, "percent", 30)).toBe(0);
    expect(computeDepositCents(-1, "fixed", 5000)).toBe(0);
    expect(computeDepositCents(Number.NaN, "percent", 30)).toBe(0);
  });
});

describe("formatEur", () => {
  it("formate des centimes en euros", () => {
    expect(formatEur(9000)).toContain("90,00");
    expect(formatEur(9000)).toContain("€");
  });

  it("gère zéro et les entrées invalides", () => {
    expect(formatEur(0)).toContain("0,00");
    expect(formatEur(Number.NaN)).toContain("0,00");
  });
});
