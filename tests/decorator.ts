// full DTO + tests — copy/paste into your project (where decorators and JsonObject/DTO exist)

import { DTO, Required, StringLength, Email, Password, Regex, CustomFn, JsonObject, ValidationFailedError } from "../src";

@DTO
class User extends JsonObject<User> {
  constructor(
    // @ts-ignore
    @Required()
    @StringLength(5)
    public name?: string,
    
    // @ts-ignore
    @Required()
    @Email()
    public email?: string,
    
    // @ts-ignore
    @Password()
    public password?: string,
    
    // More realistic Austrian phone validation:
    // +43 followed by 6-12 digits, optional single spaces or dashes between digit groups
    // @ts-ignore
    @Regex(/^\+43(?:[ -]?\d){6,12}$/)
    public phone?: string,
    
    // @ts-ignore
    @CustomFn((value: unknown) => {
      // Robust dd/mm/yyyy validator
      if (typeof value !== "string") {
        return "Invalid data type for date.";
      }

      const parts = value.trim().split("/");
      if (parts.length !== 3) {
        return "Invalid date format";
      }

      const [ddStr, mmStr, yyyyStr] = parts.map(p => p.trim());
      const dd = Number(ddStr);
      const mm = Number(mmStr);
      const yyyy = Number(yyyyStr);

      // Ensure numeric integer values
      if (!Number.isInteger(dd) || !Number.isInteger(mm) || !Number.isInteger(yyyy)) {
        return "Invalid date format";
      }

      const currentYear = new Date().getFullYear();

      // Year basic range
      if (yyyy < 1900 || yyyy > currentYear) {
        return "Invalid date.";
      }

      // Month range
      if (mm < 1 || mm > 12) {
        return "Invalid date.";
      }

      // Day range depends on month/year (handles leap years)
      const daysInMonth = new Date(yyyy, mm, 0).getDate(); // mm is 1-based here
      if (dd < 1 || dd > daysInMonth) {
        return "Invalid date.";
      }

      return true;
    })
    public birthDate?: string
  ) {
    super();
  }
}

/**
 * runDtoDecoratorTests()
 * - Plain TypeScript tests (no test framework).
 * - Exercises each decorator with edge cases.
 */
function runDtoDecoratorTests() {
  const baseline = {
    name: "ABCDE", // 5 chars (assumed valid)
    email: "valid@example.com",
    password: "Aa1!aaaa",
    phone: "+431234567",
    birthDate: "01/01/1990",
  };

  function tryInstantiate(params: {
    name?: string;
    email?: string;
    password?: string;
    phone?: any;
    birthDate?: any;
  }) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - runtime symbol User expected to exist
      const instance = new (User as any)(
        params.name,
        params.email,
        params.password,
        params.phone,
        params.birthDate
      );
      return { ok: true, instance, error: null as null };
    } catch (err) {
      const e: any = err;
      const looksLikeValidationFailed =
        e && typeof e === "object" && "field" in e && typeof e.field === "string";

      if (looksLikeValidationFailed && e instanceof ValidationFailedError) {
        return {
          ok: false,
          instance: null,
          error: {
            kind: "ValidationFailedError" as const,
            field: e.field,
            message: e.message,
            raw: e,
          },
        };
      }

      if (err instanceof Error) {
        return {
          ok: false,
          instance: null,
          error: {
            kind: "Error" as const,
            message: err.message,
            raw: err,
          },
        };
      }

      return {
        ok: false,
        instance: null,
        error: {
          kind: "Unknown" as const,
          raw: err,
        },
      };
    }
  }

  const tests: Array<{
    id: string;
    overrides: Partial<typeof baseline>;
    expectError: boolean;
    expectedKind?: "ValidationFailedError" | "Error" | "Unknown" | "none";
    expectedField?: string | RegExp;
    note?: string;
  }> = [
    // NAME
    { id: "name-missing", overrides: { name: undefined }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "name", note: "Required should fail when missing." },
    { id: "name-empty-string", overrides: { name: "" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "name", note: "Empty string invalid." },
    { id: "name-too-short", overrides: { name: "Abc" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "name" },
    { id: "name-exact-5", overrides: { name: "Hello" }, expectError: false },
    { id: "name-long", overrides: { name: "HelloWorld" }, expectError: false },

    // EMAIL
    { id: "email-missing", overrides: { email: undefined }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "email" },
    { id: "email-invalid-no-at", overrides: { email: "invalid.example.com" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "email" },
    { id: "email-invalid-no-domain", overrides: { email: "user@" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "email" },
    { id: "email-valid", overrides: { email: "valid@example.com" }, expectError: false },

    // PASSWORD
    { id: "password-undefined-allowed", overrides: { password: undefined }, expectError: false, note: "Password decorator but not required." },
    { id: "password-too-short", overrides: { password: "short" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "password" },
    { id: "password-no-digit", overrides: { password: "NoDigits!!" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "password" },
    { id: "password-strong", overrides: { password: "Secur3!Pwd" }, expectError: false },

    // PHONE (using the new, realistic regex)
    { id: "phone-valid", overrides: { phone: "+4312345678" }, expectError: false },
    { id: "phone-valid-spaces", overrides: { phone: "+43 1 234 567" }, expectError: false, note: "Spaces allowed." },
    { id: "phone-valid-dashes", overrides: { phone: "+43-1234-5678" }, expectError: false, note: "Dashes allowed." },
    { id: "phone-missing-plus", overrides: { phone: "4312345678" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "phone" },
    { id: "phone-wrong-country", overrides: { phone: "+4412345678" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "phone" },
    { id: "phone-too-short", overrides: { phone: "+43123" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "phone" },
    { id: "phone-too-long", overrides: { phone: "+43 123456789012345" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "phone" },

    // BIRTHDATE
    { id: "birthDate-valid", overrides: { birthDate: "01/01/1990" }, expectError: false },
    { id: "birthDate-invalid-format", overrides: { birthDate: "1990-01-01" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "birthDate" },
    { id: "birthDate-day-out-of-range", overrides: { birthDate: "32/01/2000" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "birthDate" },
    { id: "birthDate-month-out-of-range", overrides: { birthDate: "01/13/2000" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "birthDate" },
    { id: "birthDate-future-year", overrides: { birthDate: `01/01/${new Date().getFullYear() + 5}` }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "birthDate" },
    { id: "birthDate-non-string", overrides: { birthDate: (Date.now() as any) }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "birthDate" },

    // Extra edge checks for days-in-month & leap-year handling
    { id: "birthDate-invalid-31-apr", overrides: { birthDate: "31/04/2000" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "birthDate" },
    { id: "birthDate-non-leap-feb29", overrides: { birthDate: "29/02/2001" }, expectError: true, expectedKind: "ValidationFailedError", expectedField: "birthDate" },
  ];

  const results: Array<{ id: string; passed: boolean; details: any }> = [];

  for (const t of tests) {
    const params = { ...baseline, ...t.overrides };
    const res = tryInstantiate(params);

    let passed = false;
    const details: any = { params, res };

    if (!t.expectError) {
      if (res.ok) {
        passed = true;
      } else {
        passed = false;
        details.reason = `Expected no error, but got ${res.error?.kind}`;
      }
    } else {
      if (!res.ok) {
        const err = res.error;
        if (t.expectedKind && t.expectedKind !== "none") {
          // @ts-ignore
          if (t.expectedKind === "ValidationFailedError" && err.kind === "ValidationFailedError") {
            if (t.expectedField) {
              const matches =
                typeof t.expectedField === "string"
                // @ts-ignore
                  ? err.field === t.expectedField
                  // @ts-ignore
                  : t.expectedField.test(err.field);
              if (matches) {
                passed = true;
              } else {
                passed = false;
                // @ts-ignore
                details.reason = `Expected error field ${String(t.expectedField)}, got ${String(err.field)}`;
              }
            } else {
              passed = true;
            }
            // @ts-ignore
          } else if (t.expectedKind === err.kind) {
            passed = true;
          } else {
            passed = false;
            // @ts-ignore
            details.reason = `Expected error kind ${t.expectedKind}, got ${err.kind}`;
          }
        } else {
          passed = true;
        }
      } else {
        passed = false;
        details.reason = "Expected an error but instantiation succeeded.";
      }
    }

    results.push({ id: t.id, passed, details });
    console.log(`[${passed ? "PASS" : "FAIL"}] ${t.id} - ${t.note ? t.note + " - " : ""}${passed ? "as expected" : details.reason || "unexpected result"}`);
    if (!passed) {
      console.debug("  details:", details);
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`\nTest summary: ${passedCount}/${total} passed.`);
  if (passedCount !== total) {
    console.log("Failed tests:");
    for (const r of results.filter(x => !x.passed)) {
      console.log(` - ${r.id}:`, r.details.reason || r.details.res?.error || r.details);
    }
  } else {
    console.log("All tests passed (given the assumptions).");
  }

  return { results, summary: { passed: passedCount, total } };
}

// Example run (uncomment to execute in your environment):
// const report = runDtoDecoratorTests();
// console.log(report);
runDtoDecoratorTests();