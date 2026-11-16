import { describe, it, expect } from 'vitest'
import { getTopicWeightage } from '@/data/examWeightage'

describe('examWeightage intelligence', () => {
  it('correctly identifies 16-Mark Sure-Shot topics for Full Stack', () => {
    const wForm = getTopicWeightage('fs', 'forms')
    expect(wForm).not.toBeNull()
    expect(wForm?.weightage).toBe('16M')
    expect(wForm?.frequency).toBe('sure_shot')
    expect(wForm?.label).toContain('16M Sure-Shot')

    const wCrud = getTopicWeightage('fs', 'CRUD')
    expect(wCrud?.weightage).toBe('16M')
  })

  it('correctly identifies 8-Mark Frequent topics', () => {
    const wScope = getTopicWeightage('fs', 'scope')
    expect(wScope).not.toBeNull()
    expect(wScope?.weightage).toBe('8M')
    expect(wScope?.frequency).toBe('frequent')
  })

  it('identifies 16-Mark topics in ADS, IT, CO, Java, and P&S', () => {
    // ADS AVL rotations
    const wAvl = getTopicWeightage('ads', 'AVL single and double rotations')
    expect(wAvl?.weightage).toBe('16M')

    // IT Entropy
    const wEntropy = getTopicWeightage('it', 'entropy')
    expect(wEntropy?.weightage).toBe('16M')

    // CO Booth multiplication
    const wBooth = getTopicWeightage('co', 'unsigned and signed Booth multiplication')
    expect(wBooth?.weightage).toBe('16M')

    // Java Threads
    const wThreads = getTopicWeightage('java', 'threads and synchronization')
    expect(wThreads?.weightage).toBe('16M')

    // Probability ANOVA
    const wAnova = getTopicWeightage('prob', 'ANOVA')
    expect(wAnova?.weightage).toBe('16M')
  })

  it('returns null for nonexistent topic or subject', () => {
    expect(getTopicWeightage('nonexistent', 'random')).toBeNull()
    expect(getTopicWeightage(null, 'forms')).toBeNull()
    expect(getTopicWeightage('fs', '')).toBeNull()
  })

  it('handles subject alias like ps -> prob', () => {
    const wAnovaPs = getTopicWeightage('ps', 'ANOVA')
    expect(wAnovaPs?.weightage).toBe('16M')
  })
})
