import { describe, expect, it } from "vitest";
import { signUpSchema, slugSchema } from "@/lib/validation";

describe("slugSchema", () => {
  it("accepte un slug valide", () => {
    expect(slugSchema.parse("alex-ink")).toBe("alex-ink");
  });

  it("normalise (trim + minuscules)", () => {
    expect(slugSchema.parse("  Alex-Ink  ")).toBe("alex-ink");
  });

  it("refuse les caractères interdits", () => {
    expect(slugSchema.safeParse("alex ink!").success).toBe(false);
  });

  it("refuse un slug trop court", () => {
    expect(slugSchema.safeParse("ab").success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("valide une inscription correcte", () => {
    const result = signUpSchema.safeParse({
      displayName: "Alex",
      slug: "alex-ink",
      email: "alex@example.com",
      password: "supersecret",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un email invalide", () => {
    const result = signUpSchema.safeParse({
      displayName: "Alex",
      slug: "alex-ink",
      email: "pas-un-email",
      password: "supersecret",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un mot de passe trop court", () => {
    const result = signUpSchema.safeParse({
      displayName: "Alex",
      slug: "alex-ink",
      email: "alex@example.com",
      password: "court",
    });
    expect(result.success).toBe(false);
  });
});
