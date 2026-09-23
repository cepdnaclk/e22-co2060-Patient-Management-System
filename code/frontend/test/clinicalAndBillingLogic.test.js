import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ── MAR Slot Matching Logic (extracted from MARCard.jsx) ──────────────────
const matchSlotsToAdmins = (slots, todayAdmins) => {
  const claimedAdminIds = new Set();
  const slotAdminMap = {};

  // Pass 1: Strict match by slot id or slot label in notes
  slots.forEach((slot) => {
    const matched = todayAdmins.find(
      (a) =>
        !claimedAdminIds.has(a.id) &&
        (
          (a.notes || "").toLowerCase().includes(slot.id.toLowerCase()) ||
          (a.notes || "").toLowerCase().includes(slot.label.toLowerCase())
        )
    );
    if (matched) {
      claimedAdminIds.add(matched.id);
      slotAdminMap[slot.id] = matched;
    }
  });

  // Pass 2: Match unassigned administrations that don't belong to any other specific slot
  const otherSlotKeywords = slots.flatMap((s) => [s.id.toLowerCase(), s.label.toLowerCase()]);
  const unclaimedAdmins = todayAdmins.filter((a) => !claimedAdminIds.has(a.id));

  slots.forEach((slot) => {
    if (!slotAdminMap[slot.id] && unclaimedAdmins.length > 0) {
      const otherNames = otherSlotKeywords.filter(
        (k) => k !== slot.id.toLowerCase() && k !== slot.label.toLowerCase()
      );
      const genericIdx = unclaimedAdmins.findIndex((a) => {
        const notes = (a.notes || "").toLowerCase();
        return !otherNames.some((name) => notes.includes(name));
      });

      if (genericIdx !== -1) {
        const admin = unclaimedAdmins.splice(genericIdx, 1)[0];
        claimedAdminIds.add(admin.id);
        slotAdminMap[slot.id] = admin;
      }
    }
  });

  return slotAdminMap;
};

// ── Lab Report Multi-Image Parser (extracted from Labreport.jsx) ───────────
const getImages = (attachmentUrl) => {
  if (!attachmentUrl) return [];
  if (attachmentUrl.startsWith("[")) {
    try {
      return JSON.parse(attachmentUrl);
    } catch {
      return [attachmentUrl];
    }
  }
  return [attachmentUrl];
};

// ── Pharmacy Auto-Item Regex Matcher (extracted from PharmacyBilling.jsx) ──
const matchPrescriptionToMedicines = (description, medicines) => {
  const items = [];
  if (description) {
    const descLower = description.toLowerCase();
    medicines.forEach((med) => {
      if (med.name && descLower.includes(med.name.toLowerCase())) {
        let qty = 1;
        const regex = new RegExp(`${med.name.toLowerCase()}[^0-9]*([0-9]+)`, "i");
        const match = descLower.match(regex);
        if (match && match[1]) {
          qty = parseInt(match[1], 10);
          if (qty > 100) qty = 1; // guard in code
        }
        items.push({
          id: med.id || med.name,
          name: med.name,
          unitPrice: med.unitPrice || 0,
          qty,
        });
      }
    });

    if (items.length === 0) {
      items.push({
        id: "generic",
        name: "Generic Dispensing / Custom Formula",
        unitPrice: 15.0,
        qty: 1,
      });
    }
  }
  return items;
};

describe("MAR Slot-to-Administration Matching Suite", () => {
  const standardSlots = [
    { id: "morning", label: "Morning (08:00)" },
    { id: "noon", label: "Noon (12:00)" },
    { id: "evening", label: "Evening (18:00)" },
    { id: "night", label: "Night (22:00)" },
  ];

  it("should match administration to slot when slot ID is in notes", () => {
    const admins = [{ id: 101, notes: "Given in morning shift", status: "GIVEN" }];
    const mapping = matchSlotsToAdmins(standardSlots, admins);
    assert.equal(mapping.morning?.id, 101);
    assert.equal(mapping.evening, undefined);
  });

  it("should match administration to slot when slot Label is in notes", () => {
    const admins = [{ id: 102, notes: "Dose administered in Evening (18:00)", status: "GIVEN" }];
    const mapping = matchSlotsToAdmins(standardSlots, admins);
    assert.equal(mapping.evening?.id, 102);
  });

  it("should map generic notes to available slot via Pass 2", () => {
    const admins = [{ id: 103, notes: "Regular dose tolerated well", status: "GIVEN" }];
    const mapping = matchSlotsToAdmins(standardSlots, admins);
    assert.equal(mapping.morning?.id, 103);
  });

  it("demonstrates conflict when nurse notes contain multiple slot keywords", () => {
    // If a nurse writes "Morning dose delayed, given in evening"
    const admins = [{ id: 104, notes: "Morning dose delayed, given in evening", status: "GIVEN" }];
    const mapping = matchSlotsToAdmins(standardSlots, admins);
    // Because 'morning' is checked first in Pass 1, it claims it for morning
    assert.equal(mapping.morning?.id, 104);
  });
});

describe("Lab Report Multi-Image Parser Suite", () => {
  it("should return empty array for empty attachment", () => {
    assert.deepEqual(getImages(null), []);
    assert.deepEqual(getImages(""), []);
  });

  it("should return single item array for plain URL or single base64 string", () => {
    const singleUrl = "https://hospital.local/files/report-123.jpg";
    assert.deepEqual(getImages(singleUrl), [singleUrl]);
  });

  it("should parse valid JSON array containing multiple base64 image strings", () => {
    const images = ["data:image/png;base64,img1", "data:image/png;base64,img2", "data:image/png;base64,img3"];
    const jsonStr = JSON.stringify(images);
    assert.deepEqual(getImages(jsonStr), images);
  });

  it("should degrade gracefully on malformed JSON without throwing or crashing", () => {
    const malformed = "[broken-json-array-data";
    const result = getImages(malformed);
    assert.deepEqual(result, [malformed]);
  });
});

describe("Pharmacy Auto-Item Billing Suite", () => {
  const catalog = [
    { id: 1, name: "Amoxicillin", unitPrice: 10.0 },
    { id: 2, name: "Amoxicillin Clavulanate", unitPrice: 25.0 },
    { id: 3, name: "Paracetamol", unitPrice: 5.0 },
  ];

  it("should fall back to Generic Dispensing when prescription matches zero known medicines", () => {
    const items = matchPrescriptionToMedicines("Herbal Ayurvedic Mixture 100ml", catalog);
    assert.equal(items.length, 1);
    assert.equal(items[0].id, "generic");
    assert.equal(items[0].unitPrice, 15.0);
  });

  it("should detect quantity when present after medicine name", () => {
    const items = matchPrescriptionToMedicines("Paracetamol tabs 20", catalog);
    assert.equal(items.length, 1);
    assert.equal(items[0].name, "Paracetamol");
    assert.equal(items[0].qty, 20);
  });

  it("demonstrates dosage confusion where 500mg resets qty to 1 due to >100 guard", () => {
    // "Paracetamol 500mg 30 tabs": regex matches 500 first, triggers qty > 100, sets qty to 1
    const items = matchPrescriptionToMedicines("Paracetamol 500mg 30 tabs", catalog);
    assert.equal(items.length, 1);
    assert.equal(items[0].qty, 1); // Documenting the defect
  });

  it("demonstrates substring collision matching both parent and compound drug", () => {
    // "Amoxicillin Clavulanate" matches both Amoxicillin and Amoxicillin Clavulanate
    const items = matchPrescriptionToMedicines("Amoxicillin Clavulanate 625mg 14 tabs", catalog);
    assert.equal(items.length, 2); // Documenting the collision defect
  });
});
