
export const TaskPriority = {
  LOW: {
    label: "Low",
    value: "LOW",
  },
  MEDIUM: {
    label: "Medium",
    value: "MEDIUM",
  },
  HIGH: {
    label: "High",
    value: "HIGH",
  },
} as const;



export type TaskPriorityKeys = keyof typeof TaskPriority;
export const TaskPriorityKeysArray = ['LOW', 'MEDIUM', 'HIGH'] as const;
