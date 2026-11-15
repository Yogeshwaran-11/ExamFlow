import { useMemo } from 'react'
import studyPlan from '@/data/study_plan.json'
import { Subject, TopicProgress, TaskCompletion } from '@/models'

export interface SubjectReadiness {
  subjectId: string
  subjectName: string
  subjectColor: string
  examDate: string
  daysLeft: number
  totalTopics: number
  learnedTopics: number
  revisedTopics: number
  masteredTopics: number
  coveragePercent: number
  revisionPercent: number
  practicePercent: number
  weakTopicsCount: number
  weakTopics: string[]
  handwrittenPercent: number
  isHandwrittenRequired: boolean
  remainingActions: string[]
}

export function useSubjectProgress(userId = 'default_user') {
  // Read completions and topic progress from localStorage
  const { completions, progressMap, recalls } = useMemo(() => {
    try {
      const compRaw = localStorage.getItem(`examflow_${userId}_completions`) || localStorage.getItem('examflow_completions')
      const progRaw = localStorage.getItem(`examflow_${userId}_topics`) || localStorage.getItem('examflow_topics')
      const recallRaw = localStorage.getItem(`examflow_${userId}_recalls`) || localStorage.getItem('examflow_recalls')

      const compList: TaskCompletion[] = compRaw ? JSON.parse(compRaw) : []
      const progList: TopicProgress[] = progRaw ? JSON.parse(progRaw) : []
      const recallList: any[] = recallRaw ? JSON.parse(recallRaw) : []

      const pMap = new Map<string, TopicProgress>()
      progList.forEach((p) => pMap.set(`${p.subjectId}_${p.topicName}`, p))

      return { completions: compList, progressMap: pMap, recalls: recallList }
    } catch {
      return { completions: [], progressMap: new Map(), recalls: [] }
    }
  }, [userId])

  const readinessMap = useMemo(() => {
    const map = new Map<string, SubjectReadiness>()

    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)

    studyPlan.subjects.forEach((sub: any) => {
      const subjectBlocks: any[] = []
      studyPlan.dailySchedule.forEach((day: any) => {
        day.blocks.forEach((b: any) => {
          if (b.subjectId === sub.id) {
            subjectBlocks.push(b)
          }
        })
      })

      // Extract all unique topic names for this subject
      const allTopicNamesSet = new Set<string>()
      subjectBlocks.forEach((b) => {
        b.topics?.forEach((t: string) => allTopicNamesSet.add(t))
      })
      const allTopicNames = Array.from(allTopicNamesSet)
      const totalTopics = allTopicNames.length || 1

      let learnedCount = 0
      let revisedCount = 0
      let masteredCount = 0
      const weakTopics: string[] = []

      allTopicNames.forEach((topic) => {
        const key = `${sub.id}_${topic}`
        const prog = progressMap.get(key)
        const status = prog?.status || 'not_started'

        if (status === 'learned' || status === 'mastered' || (status as string) === 'revised') {
          learnedCount++
        }
        if (status === 'mastered' || (status as string) === 'revised') {
          revisedCount++
        }
        if (status === 'mastered') {
          masteredCount++
        }

        // Check if topic is weak from confidence or forgot in recalls
        const hasForgotRecall = recalls.some((r: any) => r.subjectId === sub.id && r.topicName === topic && r.result === 'forgot')
        if (hasForgotRecall || prog?.weakAreas?.length || (prog?.confidenceScore && prog.confidenceScore < 50)) {
          weakTopics.push(topic)
        }
      })

      // Practice tasks
      const practiceBlocks = subjectBlocks.filter((b) => b.taskType === 'practice' || b.taskType === 'numericals' || b.taskType === 'mock')
      const totalPractice = practiceBlocks.length || 1
      const completedPractice = practiceBlocks.filter((b) => {
        const c = completions.find((item) => item.blockId === b.id)
        return c?.status === 'complete' || c?.status === ('completed' as any)
      }).length

      // Handwritten practice
      const isHandwrittenRequired = !!sub.handwritingRequired
      const handwrittenBlocks = subjectBlocks.filter((b) => b.isHandwritten)
      const totalHandwritten = handwrittenBlocks.length || 1
      const completedHandwritten = handwrittenBlocks.filter((b) => {
        const c = completions.find((item) => item.blockId === b.id)
        return c?.status === 'complete' || c?.status === ('completed' as any)
      }).length

      // Days countdown
      const examDateObj = new Date(sub.examDate)
      examDateObj.setHours(0, 0, 0, 0)
      const diffTime = examDateObj.getTime() - todayDate.getTime()
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Coverage %
      const coveragePercent = Math.min(100, Math.round((learnedCount / totalTopics) * 100))
      const revisionPercent = Math.min(100, Math.round((revisedCount / totalTopics) * 100))
      const practicePercent = Math.min(100, Math.round((completedPractice / totalPractice) * 100))
      const handwrittenPercent = isHandwrittenRequired
        ? Math.min(100, Math.round((completedHandwritten / totalHandwritten) * 100))
        : 100

      // Remaining key actions
      const remainingActions: string[] = []
      if (coveragePercent < 80) remainingActions.push(`Learn remaining ${totalTopics - learnedCount} core topics`)
      if (weakTopics.length > 0) remainingActions.push(`Review ${weakTopics.length} weak topics`)
      if (practicePercent < 60) remainingActions.push(`Complete scheduled practice & mock problems`)
      if (isHandwrittenRequired && handwrittenPercent < 70) remainingActions.push(`Complete handwritten question traces on paper`)
      if (remainingActions.length === 0) remainingActions.push(`Maintain spaced recall & read formula sheet`)

      map.set(sub.id, {
        subjectId: sub.id,
        subjectName: sub.name,
        subjectColor: sub.color,
        examDate: sub.examDate,
        daysLeft,
        totalTopics,
        learnedTopics: learnedCount,
        revisedTopics: revisedCount,
        masteredTopics: masteredCount,
        coveragePercent,
        revisionPercent,
        practicePercent,
        weakTopicsCount: weakTopics.length,
        weakTopics,
        handwrittenPercent,
        isHandwrittenRequired,
        remainingActions,
      })
    })

    return map
  }, [completions, progressMap, recalls])

  const getSubjectReadiness = (subjectId: string): SubjectReadiness | undefined => {
    return readinessMap.get(subjectId)
  }

  const allReadiness = useMemo(() => Array.from(readinessMap.values()), [readinessMap])

  return {
    readinessMap,
    allReadiness,
    getSubjectReadiness,
  }
}
