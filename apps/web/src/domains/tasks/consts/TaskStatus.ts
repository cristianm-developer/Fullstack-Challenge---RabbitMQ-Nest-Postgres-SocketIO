
export const TaskStatusObject = {
    TODO: {
        'label': 'To Do',
        'value': "TODO",
    },
    IN_PROGRESS: {
        'label': 'In Progress',
        'value': "IN_PROGRESS",
    },
    REVIEW: {
        'label': 'In Review',
        'value': "REVIEW",
    },
    DONE: {
        'label': 'Done',
        'value': "DONE",
    },
} as const;

export type TaskStatusKeys = keyof typeof TaskStatusObject;
export const TaskStatusKeysArray = [ 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;