// ============================================================
// ExamFlow — Anna University Exam Weightage & PYQ Intelligence
// ============================================================

export type WeightageType = '16M' | '8M' | '2M'
export type FrequencyType = 'sure_shot' | 'frequent' | 'standard'

export interface TopicExamWeightage {
  weightage: WeightageType
  frequency: FrequencyType
  label: string
  examTip: string
  yearOccurrences?: string
}

// Subject-wise Topic Weightage Map
// Keys are matched case-insensitively or by substring against topic strings
export const EXAM_WEIGHTAGE_REGISTRY: Record<string, Record<string, TopicExamWeightage>> = {
  // ── 1. Full Stack Development (fs) ──────────────────────────
  fs: {
    'html5': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8-Mark Frequent',
      examTip: 'Focus on semantic elements (article, section, nav) and audio/video embedding.',
      yearOccurrences: 'Nov 2023, Apr 2024',
    },
    'forms': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Write full HTML5 form code on paper with email, pattern, date inputs and required validation.',
      yearOccurrences: 'Repeated in 4 of last 5 papers',
    },
    'bootstrap grid and components': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Explain 12-column grid layout, container vs container-fluid, and draw cards/navbar with classes.',
      yearOccurrences: 'Nov 2022, Nov 2023',
    },
    'js variables': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Compare var, let, and const with hoisting, temporal dead zone, and scope examples.',
    },
    'functions': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Normal functions vs Arrow functions (this binding, arguments object, syntax).',
    },
    'scope': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Global, function, and block scope with lexical closures diagram.',
    },
    'dom': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'DOM tree manipulation methods (getElementById, querySelector, createElement, appendChild).',
      yearOccurrences: 'Nov 2021, Apr 2023',
    },
    'event handling': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Event bubbling vs capturing, stopPropagation, and addEventListener code example.',
      yearOccurrences: 'Nov 2023, Apr 2024',
    },
    'json parsing': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'JSON.stringify() and JSON.parse() syntax, error handling with try-catch.',
    },
    'node introduction': {
      weightage: '8M',
      frequency: 'standard',
      label: '8M Concept',
      examTip: 'Node.js event-driven non-blocking I/O model and libuv event loop diagram.',
    },
    'architecture': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Draw complete Node.js Single-Threaded Event Loop architecture with Worker Threads pool.',
      yearOccurrences: 'Apr 2022, Nov 2023',
    },
    'http server': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Handwritten http.createServer() code serving HTML/JSON responses with status codes.',
    },
    'get and post': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Handling query parameters in GET vs req.body in POST with Express middleware.',
    },
    'database connection': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Connecting Node/Express to MongoDB via Mongoose (mongoose.connect, Schema, Model).',
      yearOccurrences: 'Nov 2022, Apr 2024',
    },
    'crud': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Full CRUD operations: Create (POST), Read (GET), Update (PUT), Delete (DELETE) endpoints.',
      yearOccurrences: 'Compulsory in almost every paper',
    },
    'rest api': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Principles of RESTful services, HTTP verbs, statelessness, and JSON response structuring.',
      yearOccurrences: 'Nov 2023',
    },
    'components': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Functional components vs Class components comparison with JSX return syntax.',
    },
    'state': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'State vs Props difference table and useState hook interactive counter example.',
    },
    'props': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Passing props, defaultProps, prop-types validation, and unidirectional data flow.',
    },
    'component life cycle': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Mounting, Updating, Unmounting phases diagram and useEffect equivalents.',
      yearOccurrences: 'Apr 2023, Nov 2023',
    },
    'controlled and uncontrolled forms': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Contrast form inputs controlled via state vs uncontrolled via useRef.',
    },
    'router': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'React Router DOM: BrowserRouter, Routes, Route, Link, and useNavigate hooks.',
    },
    'hooks: usestate': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Explain React Hooks rules, useState and useEffect with dependency array mechanics.',
      yearOccurrences: 'Nov 2023, Apr 2024',
    },
    'useeffect': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Data fetching, subscription cleanup, and dependency array behavior.',
    },
  },

  // ── 2. Advanced Data Structures (ads) ───────────────────────
  ads: {
    'doubly and circular lists': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Insertion & deletion at head/middle/tail with pointer reassignment diagrams & C/Java code.',
      yearOccurrences: 'Nov 2022, Apr 2023',
    },
    'polynomial adt': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Node structure (coeff, exp, next) and full polynomial addition algorithm on paper.',
      yearOccurrences: 'Nov 2021, Nov 2023',
    },
    'radix sort': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Step-by-step trace of bucket distribution and collection with an 8-number example.',
    },
    'tree basics': {
      weightage: '8M',
      frequency: 'standard',
      label: '8M Concept',
      examTip: 'Height, depth, degree of node, binary tree properties and array representation.',
    },
    'traversals': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Inorder, Preorder, Postorder recursive code and tree reconstruction from In+Pre orders.',
      yearOccurrences: 'Repeated every single year',
    },
    'expression trees': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Stack-based construction from postfix expression with step-by-step tree drawings.',
    },
    'bst insert and delete': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: '3 deletion cases (leaf, single child, two children via inorder predecessor/successor).',
      yearOccurrences: 'Nov 2022, Apr 2024',
    },
    'avl single and double rotations': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'All 4 cases: LL (single right), RR (single left), LR (double left-right), RL (double right-left).',
      yearOccurrences: 'Compulsory 16M in 90% of papers',
    },
    'splay trees': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Zig, Zig-Zig, and Zig-Zag operations to bring accessed node to root.',
    },
    'b-trees': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'B-tree properties of order m, step-by-step insertion with node splits, and key deletion.',
      yearOccurrences: 'Nov 2022, Nov 2023',
    },
    'binary heap': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Min-heap and Max-heap insert (percolate up) and deleteMin (percolate down) with array representation.',
    },
    'priority queue applications': {
      weightage: '8M',
      frequency: 'standard',
      label: '8M Frequent',
      examTip: 'Huffman coding, CPU scheduling, and selection problem using heaps.',
    },
    'leftist heaps': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Null path length (NPL) property and recursive merge operation.',
    },
    'binomial queues': {
      weightage: '16M',
      frequency: 'frequent',
      label: '16M High Yield',
      examTip: 'Binomial tree properties B_k and step-by-step queue merging (binary addition analogy).',
    },
    'insertion sort': {
      weightage: '8M',
      frequency: 'standard',
      label: '8M Algorithm',
      examTip: 'Algorithm steps, best/worst case O(n) vs O(n^2), stability.',
    },
    'merge sort': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Divide & Conquer recurrence relation T(n) = 2T(n/2) + O(n), merge algorithm code on paper.',
      yearOccurrences: 'Apr 2023, Nov 2023',
    },
    'quick sort': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Partition algorithm (Lomuto/Hoare), pivot selection, worst-case prevention, O(n log n).',
      yearOccurrences: 'Nov 2021, Apr 2024',
    },
    'hashing': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Hash functions (division, folding, mid-square) and load factor alpha calculation.',
    },
    'chaining': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Separate chaining collision resolution with linked lists and time complexity.',
    },
    'open addressing': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Linear probing vs Quadratic probing vs Double hashing formulas with clustering comparison.',
      yearOccurrences: 'Nov 2022, Nov 2023',
    },
    'rehashing': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Rehashing condition when alpha > 0.5, table doubling to next prime number.',
    },
    'topological sort': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Indegree array method using Queue on Directed Acyclic Graph (DAG) with step trace.',
    },
    'dijkstra': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Single source shortest path table trace (known, dv, pv) on a 6-vertex weighted graph.',
      yearOccurrences: 'Compulsory 16M in almost every session',
    },
    'strong components': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Kosaraju or Tarjan algorithm two DFS passes with graph reversal.',
    },
  },

  // ── 3. Information Theory and Coding (it) ───────────────────
  it: {
    'uncertainty': {
      weightage: '2M',
      frequency: 'standard',
      label: '2M Definition',
      examTip: 'I(x_i) = log_2(1/p_i) definition and units (bits, nats, Hartley).',
    },
    'entropy': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'H(X) calculation for given probabilities, maximum entropy proof H_max = log_2(M).',
      yearOccurrences: 'Nov 2022, Apr 2023, Nov 2023',
    },
    'source coding theorem': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Theorem',
      examTip: 'Shannon first theorem statement, code efficiency eta = H(X)/L_avg, and redundancy R.',
    },
    'discrete memoryless channels': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Model',
      examTip: 'Channel transition matrix P(Y|X), conditional entropy, and noise characteristics.',
    },
    'mutual information': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'I(X;Y) = H(X) - H(X|Y) Venn diagram, non-negativity proof, and numerical problems.',
      yearOccurrences: 'Apr 2023, Nov 2023',
    },
    'channel capacity': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Capacity of Binary Symmetric Channel C = 1 - H(p) and Binary Erasure Channel C = 1 - alpha.',
      yearOccurrences: 'Nov 2021, Apr 2024',
    },
    'linear block codes': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Generator matrix G = [I_k | P], Parity check matrix H = [P^T | I_(n-k)], and codeword generation.',
      yearOccurrences: 'Compulsory Part B in 95% of exams',
    },
    'syndrome and syndrome decoding': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'S = r * H^T calculation, error lookup table, and single-bit error correction.',
      yearOccurrences: 'Nov 2022, Nov 2023',
    },
    'minimum distance': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Theorem',
      examTip: 'd_min relations: error detection e <= d_min - 1, error correction t <= floor((d_min-1)/2).',
    },
    'cyclic codes': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Polynomial division c(x) = m(x) * g(x), generator polynomial properties, systematic encoding.',
      yearOccurrences: 'Apr 2023, Nov 2023',
    },
    'cyclic encoder and syndrome calculation': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Draw hardware shift register circuit with feedback taps corresponding to g(x).',
      yearOccurrences: 'Nov 2022, Apr 2024',
    },
    'static huffman coding': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Step-by-step binary tree construction, code assignment, average length L, and efficiency eta.',
      yearOccurrences: 'Compulsory numerical in every paper',
    },
    'arithmetic coding': {
      weightage: '16M',
      frequency: 'frequent',
      label: '16M Frequent',
      examTip: 'Sub-interval partitioning [0, 1) and tag calculation for given character sequence.',
    },
    'lzw compression': {
      weightage: '16M',
      frequency: 'frequent',
      label: '16M Frequent',
      examTip: 'Dictionary initialization (1–256) and encoding table steps (current, next, entry).',
    },
    'convolutional codes': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Impulse response, generator polynomials, state diagram, and code tree for (2,1,3) encoder.',
      yearOccurrences: 'Nov 2023, Apr 2024',
    },
    'trellis and state diagram': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Draw complete 4-state Trellis diagram and trace Viterbi minimum path metric decoding.',
      yearOccurrences: 'Nov 2022, Nov 2023',
    },
    'jpeg': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Block Diagram',
      examTip: 'JPEG compression pipeline: DCT, Quantization table, Zig-zag ordering, Run-length + Huffman.',
    },
  },

  // ── 4. Computer Organization (co) ───────────────────────────
  co: {
    'addressing modes': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Explain 8 modes (Immediate, Direct, Indirect, Register, Indexed, Relative, Autoincrement) with diagrams.',
      yearOccurrences: 'Nov 2022, Nov 2023',
    },
    'risc vs cisc': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Comparison',
      examTip: 'Tabulate 8 distinct differences: instruction length, cycles, registers, addressing, hardware.',
    },
    'unsigned and signed booth multiplication': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Booth multiplication algorithm flow chart and full table trace for (-7 x +3) with Q_0 and Q_-1.',
      yearOccurrences: 'Compulsory in 80% of exams',
    },
    'ieee 754': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Single-precision (32-bit: 1-8-23) & Double-precision (64-bit) conversions with bias +127.',
      yearOccurrences: 'Nov 2021, Apr 2024',
    },
    'cache mapping and performance numericals': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Direct, Associative, and Set-Associative mapping address breakdown (Tag, Set/Block, Offset) and hit ratio.',
      yearOccurrences: 'Repeated every session',
    },
    'dma': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'DMA controller architecture, bus arbitration (Daisy chain), and Burst vs Cycle Stealing modes.',
      yearOccurrences: 'Nov 2022, Apr 2023',
    },
    'interrupts': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Vectored vs Non-vectored interrupts, interrupt nesting, and ISR execution sequence.',
    },
    'hardwired control': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Hardwired control unit vs Microprogrammed control unit comprehensive comparison and architecture.',
      yearOccurrences: 'Apr 2023, Nov 2023',
    },
    'pipeline hazards and timing diagrams': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Structural, Data (RAW, WAR, WAW with forwarding), and Control hazards (branch prediction).',
      yearOccurrences: 'Compulsory 16M in 90% of papers',
    },
  },

  // ── 5. Java Programming (java) ──────────────────────────────
  java: {
    'oop principles': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Concept',
      examTip: 'Define 4 pillars: Abstraction, Encapsulation, Inheritance, Polymorphism with mini code snippets.',
    },
    'classes and objects': {
      weightage: '8M',
      frequency: 'standard',
      label: '8M Basic',
      examTip: 'Class declaration, new operator heap memory allocation, and reference variables.',
    },
    'inheritance': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Single, Multilevel, Hierarchical inheritance with super keyword usage in constructors & methods.',
      yearOccurrences: 'Nov 2022, Nov 2023',
    },
    'dynamic dispatch': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Runtime polymorphism via method overriding and parent class reference holding child instance.',
      yearOccurrences: 'Apr 2022, Apr 2024',
    },
    'abstract classes': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Abstract methods vs concrete methods, abstract class vs interface comparison table.',
    },
    'interfaces': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Multiple inheritance in Java using interfaces, default and static methods in interfaces.',
      yearOccurrences: 'Nov 2021, Nov 2023',
    },
    'packages': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Package creation, CLASSPATH setting, import statement, and 4 access specifiers matrix.',
    },
    'exceptions: built-in': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Frequent',
      examTip: 'Checked vs Unchecked exceptions hierarchy, try, catch, finally block execution order.',
    },
    'user-defined exceptions': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Creating custom exception class extending Exception, throw vs throws with banking example.',
      yearOccurrences: 'Nov 2022, Apr 2024',
    },
    'threads and synchronization': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Thread creation (Thread class vs Runnable), synchronized methods/blocks, wait() and notify().',
      yearOccurrences: 'Compulsory in every paper',
    },
    'collections': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Collection hierarchy diagram: List (ArrayList vs LinkedList), Set (HashSet), Map (HashMap).',
      yearOccurrences: 'Apr 2023, Nov 2023',
    },
  },

  // ── 6. Probability and Statistics (prob) ─────────────────────
  prob: {
    'binomial distribution': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Distribution',
      examTip: 'P(X=k) formula, Mean = np, Variance = npq, and MGF derivation.',
    },
    'poisson distribution': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Distribution',
      examTip: 'P(X=k) = (e^-lambda * lambda^k)/k! and Mean = Variance = lambda property.',
    },
    'normal distribution': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Standard normal Z = (X - mu)/sigma and bell curve area calculations using Z-table.',
      yearOccurrences: 'Nov 2022, Nov 2023',
    },
    'z-test': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Single mean and difference of two means for large samples (n >= 30) with critical values 1.96 / 2.58.',
      yearOccurrences: 'Nov 2022, Apr 2023',
    },
    't-test': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Small sample test (n < 30) for single mean and paired t-test for before/after comparison.',
      yearOccurrences: 'Compulsory in 90% of papers',
    },
    'f-test': {
      weightage: '8M',
      frequency: 'frequent',
      label: '8M Test',
      examTip: 'Equality of two population variances F = S_1^2 / S_2^2 with degrees of freedom.',
    },
    'chi-square': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'Goodness of fit sum((O - E)^2 / E) and 2x2 contingency table independence test.',
      yearOccurrences: 'Nov 2021, Nov 2023',
    },
    'anova': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'One-Way & Two-Way ANOVA table with Sum of Squares, degrees of freedom, Mean Squares, and F-ratio.',
      yearOccurrences: 'Compulsory 16M in 100% of papers',
    },
    'completely randomized design': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'CRD statistical model, ANOVA table layout, and critical difference (CD) calculation.',
    },
    'randomized block design': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'RBD model with treatments and blocks, ANOVA table with two F-calculated values.',
      yearOccurrences: 'Repeated regularly in Part C',
    },
    'latin square design': {
      weightage: '16M',
      frequency: 'sure_shot',
      label: '16M Sure-Shot',
      examTip: 'LSD m x m layout eliminating variations in two orthogonal directions (Rows & Columns).',
      yearOccurrences: 'Nov 2022, Apr 2024',
    },
  },
}

/**
 * Look up exam weightage for a specific topic within a subject.
 * Matches exact, lowercase, or substring keywords.
 */
export function getTopicWeightage(
  subjectId?: string | null,
  topicName?: string
): TopicExamWeightage | null {
  if (!subjectId || !topicName) return null

  // Normalize subject alias (e.g. ps -> prob, it -> it, fs -> fs)
  const normSub = subjectId.toLowerCase() === 'ps' ? 'prob' : subjectId.toLowerCase()
  const registry = EXAM_WEIGHTAGE_REGISTRY[normSub]
  if (!registry) return null

  const cleanName = topicName.trim().toLowerCase()

  // 1. Direct match
  if (registry[cleanName]) {
    return registry[cleanName]
  }

  // 2. Substring match (either topic contains key or key contains topic)
  for (const [key, value] of Object.entries(registry)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return value
    }
  }

  return null
}
