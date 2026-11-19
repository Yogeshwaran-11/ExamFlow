// syllabusData.ts — Full syllabus data layer for ExamFlow
// Auto-generated: 6 subjects × 5 units each

export interface SyllabusTopic {
  id: string;
  name: string;
  unitNumber: number;
  subjectId: string;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  tags: string[];
}

export interface SyllabusUnit {
  number: number;
  /** Alias for number — added in ALL_SUBJECTS_SYLLABUS transform */
  unitNumber?: number;
  title: string;
  subjectId: string;
  topics: SyllabusTopic[];
}

export interface SubjectSyllabus {
  id: string;
  /** Alias for id — used by some components */
  subjectId: string;
  name: string;
  /** Alias for name — used by some components */
  subjectName: string;
  shortName: string;
  /** Alias for shortName — used by some components */
  shortCode: string;
  color: string;
  examDate: string;
  initialCompletion: number;
  units: SyllabusUnit[];
}

// ---------------------------------------------------------------------------
// Helper: generate topic ID from subject, unit, topic name
// ---------------------------------------------------------------------------
function makeId(subjectId: string, unitNumber: number, topicName: string): string {
  return `${subjectId}_u${unitNumber}_${topicName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')}`;
}

// ---------------------------------------------------------------------------
// Helper: build a SyllabusTopic array from a raw list
//   lastTwoLow — mark the final 2 topics as 'low' priority
// ---------------------------------------------------------------------------
function makeTopics(
  subjectId: string,
  unitNumber: number,
  names: string[],
  tags: string[],
  highPriorityNames: string[] = [],
): SyllabusTopic[] {
  return names.map((name, idx) => {
    const isHigh = highPriorityNames.includes(name);
    const isLow = idx >= names.length - 2 && !isHigh;
    return {
      id: makeId(subjectId, unitNumber, name),
      name,
      unitNumber,
      subjectId,
      priority: isHigh ? 'high' : isLow ? 'low' : 'medium',
      estimatedMinutes: 30,
      tags,
    };
  });
}

// ===========================================================================
// FSD — Full Stack Development
// ===========================================================================
const fsdUnits: SyllabusUnit[] = [
  {
    number: 1,
    title: 'UI Design',
    subjectId: 'fsd',
    topics: makeTopics('fsd', 1, [
      'HTML5',
      'Cascading Style Sheet',
      'Tables',
      'HTML Forms',
      'Responsive Web Design',
      'Bootstrap Grid',
      'Buttons',
      'Images',
      'Navigation Bar',
      'Forms and Input Groups',
      'Modal',
    ], ['ui', 'html', 'css', 'bootstrap'],
    ['HTML5', 'Cascading Style Sheet', 'Responsive Web Design', 'Bootstrap Grid']),
  },
  {
    number: 2,
    title: 'JavaScript ES6',
    subjectId: 'fsd',
    topics: makeTopics('fsd', 2, [
      'Introduction',
      'Variables',
      'Operators',
      'Control Structures',
      'Functions',
      'Arrow Functions',
      'Scope',
      'Objects',
      'Arrays',
      'Date',
      'Regular Expressions',
      'HTML DOM',
      'Collections',
      'Event Handling',
      'JSON Parsing',
    ], ['javascript', 'es6'],
    ['Arrow Functions', 'HTML DOM', 'Event Handling', 'JSON Parsing']),
  },
  {
    number: 3,
    title: 'Server-side JS Framework',
    subjectId: 'fsd',
    topics: makeTopics('fsd', 3, [
      'Node.js Introduction',
      'Architecture and Features',
      'Creating Web Servers with HTTP',
      'Request and Response',
      'Event Handling',
      'GET and POST Methods',
      'Connecting to NoSQL Database using Node.js',
      'CRUD Operations',
      'REST API',
    ], ['nodejs', 'server', 'backend'],
    ['Node.js Introduction', 'Creating Web Servers with HTTP', 'CRUD Operations', 'REST API']),
  },
  {
    number: 4,
    title: 'React JS Part I',
    subjectId: 'fsd',
    topics: makeTopics('fsd', 4, [
      'React Introduction',
      'Creating React App',
      'Elements',
      'React DOM',
      'Components',
      'Component Life Cycle',
      'JSX',
      'State',
      'Props',
      'Forms',
      'Controlled and Uncontrolled Components',
      'Events',
      'Conditional Rendering',
    ], ['react', 'frontend'],
    ['Components', 'Component Life Cycle', 'State', 'Props']),
  },
  {
    number: 5,
    title: 'React JS Part II',
    subjectId: 'fsd',
    topics: makeTopics('fsd', 5, [
      'Lists and Keys',
      'Refs',
      'Fragments',
      'Router',
      'Map',
      'Table',
      'Code Splitting',
      'Hooks: useState, useEffect and useContext',
    ], ['react', 'hooks', 'frontend'],
    ['Router', 'Hooks: useState, useEffect and useContext']),
  },
];

// ===========================================================================
// ADS — Advanced Data Structures
// ===========================================================================
const adsUnits: SyllabusUnit[] = [
  {
    number: 1,
    title: 'Linear Data Structures',
    subjectId: 'ads',
    topics: makeTopics('ads', 1, [
      'Overview of Array List Stack and Queue',
      'Abstract Data Types',
      'Doubly Linked List',
      'Circular Linked List',
      'Polynomial ADT',
      'Radix Sort',
    ], ['linear', 'list', 'stack', 'queue'],
    ['Doubly Linked List', 'Circular Linked List']),
  },
  {
    number: 2,
    title: 'Sorting and Hashing',
    subjectId: 'ads',
    topics: makeTopics('ads', 2, [
      'Insertion Sort',
      'Shell Sort',
      'Merge Sort',
      'Quick Sort',
      'Hash Functions',
      'Separate Chaining',
      'Linear Probing',
      'Quadratic Probing',
      'Double Hashing',
      'Rehashing',
      'Extendible Hashing',
    ], ['sorting', 'hashing'],
    ['Merge Sort', 'Quick Sort', 'Hash Functions', 'Separate Chaining']),
  },
  {
    number: 3,
    title: 'Trees',
    subjectId: 'ads',
    topics: makeTopics('ads', 3, [
      'Implementation of Trees',
      'Tree Traversals',
      'Expression Trees',
      'Binary Search Trees',
      'MakeEmpty',
      'Find',
      'FindMin',
      'FindMax',
      'Insert',
      'Delete',
      'AVL Trees',
      'Single and Double Rotations',
      'Splay Trees',
      'B-Trees',
    ], ['trees', 'bst', 'avl'],
    ['Binary Search Trees', 'AVL Trees', 'B-Trees']),
  },
  {
    number: 4,
    title: 'Priority Queues',
    subjectId: 'ads',
    topics: makeTopics('ads', 4, [
      'Heaps',
      'Simple Implementations',
      'Binary Heap',
      'Applications of Priority Queues',
      'd-heaps',
      'Leftist Heaps',
      'Skew Heaps',
      'Binomial Queues',
    ], ['heap', 'priority-queue'],
    ['Binary Heap', 'Applications of Priority Queues']),
  },
  {
    number: 5,
    title: 'Graphs',
    subjectId: 'ads',
    topics: makeTopics('ads', 5, [
      'Graph Definitions',
      'Graph Representation',
      'Topological Sort',
      'Unweighted Shortest Paths',
      "Dijkstra's Algorithm",
      'Graphs with Negative Edge Costs',
      'DFS Applications',
      'Biconnectivity',
      'Euler Circuits',
      'Strong Components',
    ], ['graph', 'shortest-path', 'dfs'],
    ["Dijkstra's Algorithm", 'Topological Sort', 'DFS Applications']),
  },
];

// ===========================================================================
// ITC — Information Theory and Coding
// ===========================================================================
const itcUnits: SyllabusUnit[] = [
  {
    number: 1,
    title: 'Information Entropy Fundamentals',
    subjectId: 'itc',
    topics: makeTopics('itc', 1, [
      'Uncertainty',
      'Information and Entropy',
      'Source Coding Theorem',
      'Data Compaction',
      'Discrete Memoryless Channels',
      'Mutual Information',
      'Channel Capacity',
    ], ['entropy', 'information-theory'],
    ['Information and Entropy', 'Channel Capacity', 'Mutual Information']),
  },
  {
    number: 2,
    title: 'Error Control Coding',
    subjectId: 'itc',
    topics: makeTopics('itc', 2, [
      'Discrete Memoryless Channels',
      'Linear Block Codes',
      'Syndrome',
      'Minimum Distance Considerations',
      'Syndrome Decoding',
      'Cyclic Codes',
      'Generator Polynomial',
      'Parity Check Polynomial',
      'Generator and Parity Check Matrices',
      'Encoder for Cyclic Codes',
      'Calculation of Syndrome',
    ], ['error-control', 'coding'],
    ['Linear Block Codes', 'Cyclic Codes', 'Generator Polynomial']),
  },
  {
    number: 3,
    title: 'Convolutional Codes and Text Compression',
    subjectId: 'itc',
    topics: makeTopics('itc', 3, [
      'Convolutional Codes',
      'Code Tree',
      'Trellis and State Diagram',
      'Compression Principles',
      'Static Huffman Coding',
      'Dynamic Huffman Coding',
      'Arithmetic Coding',
      'LZW Coding',
    ], ['compression', 'convolutional'],
    ['Convolutional Codes', 'Static Huffman Coding', 'LZW Coding']),
  },
  {
    number: 4,
    title: 'Image and Audio Compression',
    subjectId: 'itc',
    topics: makeTopics('itc', 4, [
      'Graphics Interchange Format',
      'Tagged Image File Format',
      'Digitized Documents',
      'Digitized Pictures',
      'JPEG Standards',
      'Differential Pulse Code Modulation',
      'Adaptive Differential Pulse Code Modulation',
      'Adaptive Predictive Coding',
      'Linear Predictive Coding',
      'Code-Excited LPC',
      'Perceptual Coding',
      'MPEG Audio Coders',
    ], ['image', 'audio', 'compression'],
    ['JPEG Standards', 'Linear Predictive Coding', 'MPEG Audio Coders']),
  },
  {
    number: 5,
    title: 'Video Compression',
    subjectId: 'itc',
    topics: makeTopics('itc', 5, [
      'Frame Types',
      'Motion Estimation and Compensation',
      'Implementation Issues',
      'H.261',
      'H.263',
      'MPEG-1',
      'MPEG-2',
      'MPEG-4 Video Standards',
    ], ['video', 'compression', 'mpeg'],
    ['Motion Estimation and Compensation', 'MPEG-1', 'MPEG-4 Video Standards']),
  },
];

// ===========================================================================
// CO — Computer Organization
// ===========================================================================
const coUnits: SyllabusUnit[] = [
  {
    number: 1,
    title: 'Basic Structure of Computers',
    subjectId: 'co',
    topics: makeTopics('co', 1, [
      'Functional Units',
      'Basic Operational Concepts',
      'Number Representation and Arithmetic Operations',
      'Performance',
      'Memory Locations and Addresses',
      'Memory Operations',
      'Instruction and Instruction Sequencing',
      'Addressing Modes',
      'CISC Instruction Sets',
      'RISC and CISC Styles',
    ], ['computer-organization', 'basics'],
    ['Number Representation and Arithmetic Operations', 'Addressing Modes', 'RISC and CISC Styles']),
  },
  {
    number: 2,
    title: 'Arithmetic Unit',
    subjectId: 'co',
    topics: makeTopics('co', 2, [
      'Addition and Subtraction of Signed Numbers',
      'Design of Fast Adders',
      'Multiplication of Unsigned Numbers',
      'Multiplication of Signed Numbers',
      'Fast Multiplication',
      'Integer Division',
      'Floating Point Numbers and Operations',
    ], ['arithmetic', 'alu'],
    ['Design of Fast Adders', 'Floating Point Numbers and Operations']),
  },
  {
    number: 3,
    title: 'Basic Processing Unit and Pipelining',
    subjectId: 'co',
    topics: makeTopics('co', 3, [
      'Instruction Execution',
      'Hardware Components',
      'Instruction Fetch and Execution Steps',
      'Control Signals',
      'Hardwired Control',
      'CISC Style Processors',
      'Pipeline Organization',
      'Basic Concepts',
      'Pipeline Issues',
      'Data Dependencies',
      'Memory Delay',
      'Branch Delay',
    ], ['pipeline', 'cpu'],
    ['Pipeline Organization', 'Data Dependencies', 'Branch Delay']),
  },
  {
    number: 4,
    title: 'Memory System',
    subjectId: 'co',
    topics: makeTopics('co', 4, [
      'Semiconductor RAM Memories',
      'Read-Only Memories',
      'Direct Memory Access',
      'Memory Hierarchy',
      'Cache Memories',
      'Mapping Functions',
      'Performance Consideration',
    ], ['memory', 'cache'],
    ['Cache Memories', 'Mapping Functions', 'Memory Hierarchy']),
  },
  {
    number: 5,
    title: 'Virtual Memory and I/O',
    subjectId: 'co',
    topics: makeTopics('co', 5, [
      'Virtual Memory',
      'Secondary Storage',
      'Magnetic Hard Disks',
      'Interrupts',
      'Enabling and Disabling Interrupts',
      'Handling Multiple Devices',
    ], ['virtual-memory', 'io', 'interrupts'],
    ['Virtual Memory', 'Interrupts']),
  },
];

// ===========================================================================
// JAVA — Java Programming
// ===========================================================================
const javaUnits: SyllabusUnit[] = [
  {
    number: 1,
    title: 'Classes and Objects',
    subjectId: 'java',
    topics: makeTopics('java', 1, [
      'Overview of OOP',
      'Data Types',
      'Variables and Arrays',
      'Operators',
      'Control Statements',
      'Classes',
      'Class Fundamentals',
      'Objects',
      'Assigning Object Reference Variables',
      'Introducing Methods',
    ], ['java', 'oop', 'classes'],
    ['Classes', 'Objects', 'Overview of OOP']),
  },
  {
    number: 2,
    title: 'Nested Classes',
    subjectId: 'java',
    topics: makeTopics('java', 2, [
      'Constructors',
      'this Keyword',
      'Garbage Collection',
      'Stack Class',
      'Method Overloading',
      'Objects as Parameters',
      'Argument Passing',
      'Returning Objects',
      'Recursion',
      'Access Control',
      'Static, Nested and Inner Classes',
      'Command-Line Arguments',
      'Variable Length Arguments',
    ], ['java', 'constructors', 'overloading'],
    ['Method Overloading', 'Static, Nested and Inner Classes', 'Constructors']),
  },
  {
    number: 3,
    title: 'Inheritance Packages and Interfaces',
    subjectId: 'java',
    topics: makeTopics('java', 3, [
      'Inheritance Basics',
      'super Keyword',
      'Multilevel Inheritance',
      'Hierarchy',
      'Method Overriding',
      'Dynamic Method Dispatch',
      'Abstract Classes',
      'final Keyword',
      'Packages',
      'Member Access',
      'Importing Packages',
      'Interfaces',
    ], ['java', 'inheritance', 'interfaces'],
    ['Method Overriding', 'Dynamic Method Dispatch', 'Interfaces', 'Abstract Classes']),
  },
  {
    number: 4,
    title: 'Exception Handling Multithreading and IO',
    subjectId: 'java',
    topics: makeTopics('java', 4, [
      'Exception Handling Basics',
      'Multiple Catch Clauses',
      'Nested Try Statements',
      'Built-in Exceptions',
      'User-defined Exceptions',
      'Java Thread Model',
      'Creating Threads',
      'Multiple Threads',
      'Priorities',
      'Synchronization',
      'Multithreading',
      'I/O Basics',
      'Reading and Writing Console I/O',
      'Reading and Writing Files',
    ], ['java', 'exceptions', 'threads', 'io'],
    ['Exception Handling Basics', 'Java Thread Model', 'Synchronization']),
  },
  {
    number: 5,
    title: 'String Handling Generics and Collections',
    subjectId: 'java',
    topics: makeTopics('java', 5, [
      'Basic String Class',
      'String Methods',
      'StringBuffer Class',
      'Generics',
      'Generic Classes',
      'Generic Methods',
      'Generic Constructors and Interfaces',
      'Collection Framework Overview',
      'Collection Classes',
      'Collection Interfaces',
    ], ['java', 'strings', 'generics', 'collections'],
    ['Generics', 'Collection Framework Overview', 'Collection Classes']),
  },
];

// ===========================================================================
// PROB — Probability and Statistics
// ===========================================================================
const probUnits: SyllabusUnit[] = [
  {
    number: 1,
    title: 'Random Variables',
    subjectId: 'prob',
    topics: makeTopics('prob', 1, [
      'Discrete and Continuous Random Variables',
      'Probability Mass Function',
      'Probability Density Function',
      'Mathematical Expectation',
      'Variance',
      'Moments',
      'Moment Generating Function',
    ], ['probability', 'random-variables'],
    ['Probability Mass Function', 'Probability Density Function', 'Mathematical Expectation']),
  },
  {
    number: 2,
    title: 'Standard Probability Distributions',
    subjectId: 'prob',
    topics: makeTopics('prob', 2, [
      'Binomial Distribution',
      'Poisson Distribution',
      'Geometric Distribution',
      'Uniform Distribution',
      'Exponential Distribution',
      'Normal Distribution',
    ], ['distributions', 'probability'],
    ['Binomial Distribution', 'Normal Distribution', 'Poisson Distribution']),
  },
  {
    number: 3,
    title: 'Two Dimensional Random Variables',
    subjectId: 'prob',
    topics: makeTopics('prob', 3, [
      'Joint Probability Distributions',
      'Marginal Distributions',
      'Conditional Distributions',
      'Covariance',
      'Correlation',
      'Regression',
    ], ['joint-distribution', 'correlation'],
    ['Joint Probability Distributions', 'Correlation', 'Regression']),
  },
  {
    number: 4,
    title: 'Testing of Hypothesis',
    subjectId: 'prob',
    topics: makeTopics('prob', 4, [
      'Critical Region',
      'Level of Significance',
      'Types of Errors',
      'Large Sample Tests',
      'Z-test for Single Mean',
      'Z-test for Difference of Means',
      'Small Sample Tests',
      "Student's t-test",
      'F-test',
      'Chi-square Test for Independence of Attributes',
    ], ['hypothesis', 'statistics'],
    ["Student's t-test", 'Z-test for Single Mean', 'Chi-square Test for Independence of Attributes']),
  },
  {
    number: 5,
    title: 'Design of Experiments',
    subjectId: 'prob',
    topics: makeTopics('prob', 5, [
      'Analysis of Variance',
      'One-way Classification',
      'Completely Randomized Design',
      'Two-way Classification',
      'Randomized Block Design',
      'Latin Square Design',
    ], ['anova', 'experimental-design'],
    ['Analysis of Variance', 'Completely Randomized Design']),
  },
];

// ===========================================================================
// ALL_SUBJECTS_SYLLABUS — the main exported array
// ===========================================================================
// Internal raw list — alias fields added below
// ===========================================================================
const RAW_SUBJECTS: Omit<SubjectSyllabus, 'subjectId'|'subjectName'|'shortCode'>[] = [
  {
    id: 'fsd',
    name: 'Full Stack Development',
    shortName: 'FSD',
    color: '#6366f1',
    examDate: '2026-11-27',
    initialCompletion: 20,
    units: fsdUnits,
  },
  {
    id: 'ads',
    name: 'Advanced Data Structures',
    shortName: 'ADS',
    color: '#10b981',
    examDate: '2026-11-30',
    initialCompletion: 0,
    units: adsUnits,
  },
  {
    id: 'itc',
    name: 'Information Theory and Coding',
    shortName: 'ITC',
    color: '#f59e0b',
    examDate: '2026-12-02',
    initialCompletion: 20,
    units: itcUnits,
  },
  {
    id: 'co',
    name: 'Computer Organization',
    shortName: 'CO',
    color: '#ef4444',
    examDate: '2026-12-04',
    initialCompletion: 0,
    units: coUnits,
  },
  {
    id: 'java',
    name: 'Java Programming',
    shortName: 'JAVA',
    color: '#8b5cf6',
    examDate: '2026-12-07',
    initialCompletion: 0,
    units: javaUnits,
  },
  {
    id: 'prob',
    name: 'Probability and Statistics',
    shortName: 'PROB',
    color: '#06b6d4',
    examDate: '2026-12-09',
    initialCompletion: 0,
    units: probUnits,
  },
];

export const ALL_SUBJECTS_SYLLABUS: SubjectSyllabus[] = RAW_SUBJECTS.map((s) => ({
  ...s,
  subjectId: s.id,
  subjectName: s.name,
  shortCode: s.shortName,
  units: s.units.map((u) => ({
    ...u,
    unitNumber: u.number,
  })),
}));

// ===========================================================================
// SUBJECT_EXAM_DATES — convenience record
// ===========================================================================
export const SUBJECT_EXAM_DATES: Record<string, string> = {
  fsd:  '2026-11-27',
  ads:  '2026-11-30',
  itc:  '2026-12-02',
  co:   '2026-12-04',
  java: '2026-12-07',
  prob: '2026-12-09',
};

// ===========================================================================
// INITIAL_COMPLETION_PERCENTAGES — fsd & itc start at 20%, rest at 0
// ===========================================================================
export const INITIAL_COMPLETION_PERCENTAGES: Record<string, number> = {
  fsd:  20,
  ads:  0,
  itc:  20,
  co:   0,
  java: 0,
  prob: 0,
};

// ===========================================================================
// getSyllabusTopic — look up a specific topic by subject, unit and name
// ===========================================================================
export function getSyllabusTopic(
  subjectId: string,
  unitNumber: number,
  topicName: string,
): SyllabusTopic | undefined {
  const subject = ALL_SUBJECTS_SYLLABUS.find((s) => s.id === subjectId);
  if (!subject) return undefined;
  const unit = subject.units.find((u) => u.number === unitNumber);
  if (!unit) return undefined;
  return unit.topics.find(
    (t) => t.name.toLowerCase() === topicName.toLowerCase(),
  );
}
