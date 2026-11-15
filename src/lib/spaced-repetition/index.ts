import { addDaysToISO, getTodayISODate } from '../date-utils'
import type { RecallTask, TopicProgress } from '../../models'

export const RECALL_INTERVALS: [1, 3, 7] = [1, 3, 7]

export function generateRecallTasks(
  userId: string,
  subjectId: string,
  blockId: string,
  topicName: string,
  learnedDate: string,
  existingRecalls: RecallTask[]
): RecallTask[] {
  const tasks: RecallTask[] = []

  for (let i = 0; i < RECALL_INTERVALS.length; i++) {
    const recallNumber = (i + 1) as 1 | 2 | 3
    const daysAfter = RECALL_INTERVALS[i]
    const scheduledDate = addDaysToISO(learnedDate, daysAfter)

    // Prevent duplicates — same block + topic + recallNumber
    const alreadyExists = existingRecalls.some(
      (r) =>
        r.blockId === blockId &&
        r.topicName === topicName &&
        r.recallNumber === recallNumber
    )
    if (alreadyExists) continue

    const id = `recall-${blockId}-${topicName
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()
      .slice(0, 40)}-${recallNumber}-${Date.now() + i}`

    tasks.push({
      id,
      userId,
      subjectId,
      blockId,
      topicName,
      recallNumber,
      scheduledDate,
      basedOnLearnedDate: learnedDate,
      status: 'not_started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'local',
    })
  }

  return tasks
}

export function getDueRecallTasks(
  recalls: RecallTask[],
  date: string = getTodayISODate()
): RecallTask[] {
  return recalls.filter(
    (r) => r.status === 'not_started' && r.scheduledDate <= date
  )
}

export function isTopicWeak(progress: TopicProgress): boolean {
  if (progress.isWeak) return true
  if (
    progress.recallCount > 0 &&
    progress.status === 'needs_practice'
  )
    return true
  if (
    progress.confidenceRating !== undefined &&
    progress.confidenceRating <= 2
  )
    return true
  return false
}
