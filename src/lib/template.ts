import tierATemplate from "@/data/checklist-tier-a-universal.json";
import { ChecklistTemplate } from "@/types/checklist";

export function getTierATemplate(): ChecklistTemplate {
  return tierATemplate as ChecklistTemplate;
}

export function getAllItems(template: ChecklistTemplate) {
  return template.sections.flatMap((section) =>
    section.items.map((item) => ({ ...item, sectionTitle: section.title, sectionSeverity: section.severity }))
  );
}

export function getMajorItems(template: ChecklistTemplate) {
  return getAllItems(template).filter((item) => item.severity === "major");
}
