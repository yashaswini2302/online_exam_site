/**
 * Expanded Question Bank for Q65 Online Exam
 *
 * Provides structured question pools categorized by exact exam slugs
 * and difficulty tiers (Beginner, Intermediate, Advanced).
 *
 * Each question conforms to the schema:
 * - prompt: string
 * - options: [string, string, string, string] (exactly 4 distinct choices)
 * - correctOption: number (integer 0, 1, 2, or 3)
 * - explanation: string (concise rationale)
 * - difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
 */

export const question = (prompt, options, correctOption, explanation, difficulty) => {
  if (!prompt || typeof prompt !== 'string') throw new Error('Question must have a non-empty prompt')
  if (!Array.isArray(options) || options.length !== 4) throw new Error('Question must have exactly 4 options')
  if (!Number.isInteger(correctOption) || correctOption < 0 || correctOption > 3) {
    throw new Error('correctOption must be an integer between 0 and 3')
  }
  if (!explanation || typeof explanation !== 'string') throw new Error('Question must have an explanation')
  if (!['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) {
    throw new Error(`Invalid difficulty "${difficulty}"; must be Beginner, Intermediate, or Advanced`)
  }
  return {
    prompt,
    options,
    correctOption,
    explanation,
    difficulty,
  }
}

export const expandedExamQuestions = {
  'math-foundations': [
    // Beginner
    question(
      'What is the value of 15% of 180?',
      ['24', '27', '30', '32'],
      1,
      '10% of 180 is 18 and 5% is 9; 18 + 9 = 27 (or 0.15 × 180 = 27).',
      'Beginner',
    ),
    question(
      'Solve for y: 5y - 8 = 22.',
      ['4', '5', '6', '7'],
      2,
      'Add 8 to both sides: 5y = 30. Divide by 5: y = 6.',
      'Beginner',
    ),
    question(
      'A rectangular rug has a length of 8 meters and a width of 5 meters. What is its area?',
      ['26 m²', '35 m²', '40 m²', '48 m²'],
      2,
      'Area of a rectangle is length × width: 8 m × 5 m = 40 m².',
      'Beginner',
    ),
    question(
      'What is the greatest common factor (GCF) of 24 and 36?',
      ['6', '8', '12', '18'],
      2,
      'Factors of 24 include 1, 2, 3, 4, 6, 8, 12, 24; factors of 36 include 1, 2, 3, 4, 6, 9, 12, 18, 36. The greatest shared factor is 12.',
      'Beginner',
    ),
    question(
      'Which fraction represents 0.625 in simplest form?',
      ['5/8', '3/5', '7/12', '9/16'],
      0,
      '0.625 = 625/1000 = 5/8 after dividing numerator and denominator by 125.',
      'Beginner',
    ),
    question(
      'If a store marks up an item from $40 to $50, what is the dollar markup?',
      ['$5', '$10', '$15', '$20'],
      1,
      'Markup = selling price - cost = $50 - $40 = $10.',
      'Beginner',
    ),

    // Intermediate
    question(
      'A store applies a 25% discount to a $160 coat, then adds 5% sales tax on the discounted price. What is the final total?',
      ['$120', '$125', '$126', '$132'],
      2,
      '25% discount leaves 75%: 0.75 × 160 = $120. 5% tax on $120 is 0.05 × 120 = $6. Total = $126.',
      'Intermediate',
    ),
    question(
      'Train A leaves a station at 60 km/h. Two hours later, Train B leaves the same station in the same direction at 90 km/h. How many hours after Train B departs will it overtake Train A?',
      ['3 hours', '4 hours', '5 hours', '6 hours'],
      1,
      'Train A has a 120 km head start (60 × 2). Relative closing speed is 90 - 60 = 30 km/h. Time to overtake = 120 / 30 = 4 hours.',
      'Intermediate',
    ),
    question(
      'The average score of 8 students is 75. When two new students join, the average becomes 78. What is the sum of the scores of the two new students?',
      ['160', '170', '180', '190'],
      2,
      'Initial sum = 8 × 75 = 600. New sum for 10 students = 10 × 78 = 780. Sum of new scores = 780 - 600 = 180.',
      'Intermediate',
    ),
    question(
      'Two dice are rolled together. What is the probability that the sum of their faces is 9?',
      ['1/12', '1/9', '5/36', '1/6'],
      1,
      'Combinations summing to 9 are (3,6), (4,5), (5,4), and (6,3), which is 4 outcomes out of 36 total. 4/36 = 1/9.',
      'Intermediate',
    ),
    question(
      'If log₁₀(x) + log₁₀(5) = 2, what is the value of x?',
      ['10', '20', '50', '100'],
      1,
      'log₁₀(5x) = 2 => 5x = 10² = 100 => x = 20.',
      'Intermediate',
    ),

    // Advanced
    question(
      'In how many distinct ways can the letters of the word "PARALLEL" be arranged?',
      ['1,680', '3,360', '6,720', '40,320'],
      1,
      'PARALLEL has 8 letters with 3 Ls and 2 As: 8! / (3! × 2!) = 40,320 / (6 × 2) = 3,360.',
      'Advanced',
    ),
    question(
      'Pipe X fills a tank in 12 hours while Pipe Y empties it in 18 hours. If both pipes are opened simultaneously when the tank is empty, how long will it take to fill the tank completely?',
      ['24 hours', '30 hours', '36 hours', '42 hours'],
      2,
      'Net filling rate per hour is 1/12 - 1/18 = (3 - 2)/36 = 1/36. Thus, the tank fills in 36 hours.',
      'Advanced',
    ),
    question(
      'What is the remainder when 3²⁰²⁴ is divided by 5?',
      ['1', '2', '3', '4'],
      0,
      'Powers of 3 modulo 5 cycle with period 4: 3¹≡3, 3²≡4, 3³≡2, 3⁴≡1. Since 2024 is divisible by 4, 3²⁰²⁴ ≡ 1 (mod 5).',
      'Advanced',
    ),
    question(
      'A circle is inscribed in a square of side length 14 cm. What is the area of the region inside the square but outside the circle? (Use π ≈ 22/7)',
      ['42 cm²', '44 cm²', '49 cm²', '56 cm²'],
      0,
      'Square area = 14² = 196 cm². Inscribed circle radius = 7 cm, area = πr² = (22/7) × 49 = 154 cm². Area difference = 196 - 154 = 42 cm².',
      'Advanced',
    ),
    question(
      'A committee of 4 is to be chosen from 6 men and 5 women. What is the probability that the committee consists of exactly 2 men and 2 women?',
      ['10/33', '15/33', '16/33', '18/33'],
      1,
      'Total combinations = C(11, 4) = 330. Favorable combinations = C(6, 2) × C(5, 2) = 15 × 10 = 150. Probability = 150/330 = 15/33.',
      'Advanced',
    ),
  ],

  'verbal-reasoning': [
    // Beginner
    question(
      'Which word is closest in meaning to "candid"?',
      ['Deceptive', 'Frank', 'Secretive', 'Timid'],
      1,
      '"Candid" means truthful, straightforward, and frank.',
      'Beginner',
    ),
    question(
      'Identify the antonym of the word "obscure".',
      ['Concealed', 'Vague', 'Distinct', 'Doubtful'],
      2,
      '"Obscure" means unclear or hidden; "distinct" means clear, unmistakable, or easily noticeable.',
      'Beginner',
    ),
    question(
      'Choose the option that correctly spells the word for making a formal recommendation or authorization:',
      ['Endorse', 'Endorce', 'Indorce', 'Indorse'],
      0,
      'The standard spelling is "endorse".',
      'Beginner',
    ),
    question(
      'Select the sentence that is grammatically correct:',
      ['Neither of the proposals are viable.', 'Neither of the proposals were viable.', 'Neither of the proposals is viable.', 'Neither of the proposal is viable.'],
      2,
      '"Neither" is a singular pronoun and takes the singular verb "is".',
      'Beginner',
    ),
    question(
      'Complete the analogy: Canvas is to Painter as Clay is to ___.',
      ['Statue', 'Sculptor', 'Kiln', 'Pottery'],
      1,
      'Canvas is the medium worked on by a painter; clay is the medium worked on by a sculptor.',
      'Beginner',
    ),

    // Intermediate
    question(
      'Choose the word that best completes the sentence: "The speaker\'s ___ remarks defused an escalating conflict among delegates."',
      ['belligerent', 'conciliatory', 'dogmatic', 'inflammatory'],
      1,
      '"Conciliatory" means intended to placate or pacify, which explains how the remarks defused the conflict.',
      'Intermediate',
    ),
    question(
      'Identify the logical fallacy: "Nobody has proven that ghosts do not exist, so they must be real."',
      ['Straw man', 'Ad hominem', 'Argument from ignorance', 'Post hoc ergo propter hoc'],
      2,
      'An argument from ignorance (argumentum ad ignorantiam) asserts a proposition is true simply because it has not been proven false.',
      'Intermediate',
    ),
    question(
      'What is the function of the italicized clause in: "Although it rained heavily, the marathon continued as scheduled."?',
      ['Noun clause acting as subject', 'Adverbial clause of concession', 'Relative clause modifying marathon', 'Independent clause'],
      1,
      '"Although it rained heavily" is a subordinate adverbial clause showing concession/contrast.',
      'Intermediate',
    ),
    question(
      'Which transition best joins these sentences? "The initial clinical trial showed modest efficacy. ___, subsequent multicenter trials confirmed robust therapeutic benefits."',
      ['Therefore', 'Furthermore', 'Conversely', 'Similarly'],
      1,
      '"Furthermore" adds progressive confirming evidence building on the initial finding.',
      'Intermediate',
    ),
    question(
      'What can be inferred from: "Despite strict embargo policies, regional markets reported a sudden influx of unbranded consumer microprocessors."?',
      ['Embargo policies prevented all cross-border commerce.', 'The microprocessors were domestic prototypes.', 'Illicit or alternative supply channels bypassed the embargo.', 'The microprocessors were defective.'],
      2,
      'The availability of embargoed goods in quantity implies that enforcement was circumvented via unregulated trade routes.',
      'Intermediate',
    ),

    // Advanced
    question(
      'Which word best characterizes an argument whose premises, even if accepted, do not provide logical grounds for its conclusion?',
      ['Inductive', 'Non sequitur', 'Tautology', 'Enthymeme'],
      1,
      'A "non sequitur" is a conclusion or statement that does not logically follow from the previous argument or premise.',
      'Advanced',
    ),
    question(
      'Analyze the sentence: "Had the committee been apprised of the discrepancy earlier, the sanction would have been averted." What conditional structure is used?',
      ['First conditional (real future)', 'Second conditional (unreal present)', 'Third conditional (inverted unreal past)', 'Zero conditional (universal truth)'],
      2,
      'The sentence uses an inverted past hypothetical structure ("Had the committee been...") expressing an unreal past condition and consequence.',
      'Advanced',
    ),
    question(
      'Which rhetorical device is exemplified by: "He was concise in speech, resolute in purpose, and unyielding in conviction."?',
      ['Chiasmus', 'Tricolon with parallelism', 'Zeugma', 'Litotes'],
      1,
      'A tricolon consists of three parallel clauses or phrases of similar length and syntactic structure.',
      'Advanced',
    ),
    question(
      'In textual analysis, what distinguishes an enthymeme from a standard syllogism?',
      ['An enthymeme contains four premises instead of two.', 'An enthymeme leaves one premise or the conclusion unstated.', 'An enthymeme is strictly inductive rather than deductive.', 'An enthymeme uses only symbolic notation.'],
      1,
      'An enthymeme is a rhetorical syllogism in which one of the premises (or conclusion) is implied or presumed rather than explicitly asserted.',
      'Advanced',
    ),
  ],

  'science-principles': [
    // Beginner
    question(
      'What is the fundamental unit of life in all known living organisms?',
      ['Organ', 'Tissue', 'Cell', 'Organelle'],
      2,
      'The cell is the basic structural, functional, and biological unit of all recognized living organisms.',
      'Beginner',
    ),
    question(
      'Which planet in our solar system is known as the "Red Planet"?',
      ['Venus', 'Mars', 'Jupiter', 'Mercury'],
      1,
      'Mars appears red due to the prevalence of iron oxide (rust) on its surface.',
      'Beginner',
    ),
    question(
      'What gas is primarily exhaled by humans as a byproduct of cellular respiration?',
      ['Nitrogen', 'Oxygen', 'Carbon dioxide', 'Methane'],
      2,
      'Carbon dioxide (CO₂) is produced in the Krebs cycle and cellular respiration and eliminated via the lungs.',
      'Beginner',
    ),
    question(
      'What is the standard unit of electrical resistance in the International System of Units (SI)?',
      ['Ampere', 'Ohm', 'Volt', 'Siemens'],
      1,
      'The ohm (symbol: Ω) is the SI unit of electrical resistance.',
      'Beginner',
    ),

    // Intermediate
    question(
      'During which phase of mitosis do sister chromatids separate and move toward opposite spindle poles?',
      ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
      2,
      'During anaphase, cohesin proteins are cleaved, allowing sister chromatids to be pulled to opposite poles of the cell.',
      'Intermediate',
    ),
    question(
      'According to Le Chatelier’s principle, what occurs if pressure is increased on the equilibrium system: N₂(g) + 3H₂(g) ⇌ 2NH₃(g)?',
      ['The reaction shifts toward the left (reactants).', 'The reaction shifts toward the right (products).', 'The equilibrium constant increases.', 'No shift occurs.'],
      1,
      'Increasing pressure favors the side with fewer gas molecules (4 moles of reactant gas vs. 2 moles of product gas), shifting equilibrium to the right.',
      'Intermediate',
    ),
    question(
      'A 1,000 kg car traveling at 20 m/s brakes to a complete stop over a distance of 40 meters. What was the magnitude of the average braking force?',
      ['2,500 N', '5,000 N', '7,500 N', '10,000 N'],
      1,
      'Work done by braking equals initial kinetic energy: W = F × d = 0.5 × m × v² => F × 40 = 0.5 × 1,000 × 400 = 200,000 => F = 5,000 N.',
      'Intermediate',
    ),
    question(
      'Which organelle contains hydrolytic enzymes responsible for intracellular digestion and autophagy?',
      ['Peroxisome', 'Lysosome', 'Centrosome', 'Endoplasmic reticulum'],
      1,
      'Lysosomes are membrane-bound organelles containing acid hydrolases for degrading cellular debris and biomolecules.',
      'Intermediate',
    ),

    // Advanced
    question(
      'What phenomenon explains why the observed frequency of light from distant galaxies is shifted toward longer wavelengths?',
      ['Cosmological redshift due to metric expansion of space', 'Gravitational lensing around dark matter halos', 'Rayleigh scattering in the interstellar medium', 'Compton scattering of high-energy photons'],
      0,
      'Cosmological redshift occurs because photons stretch as space itself expands between emission and observation.',
      'Advanced',
    ),
    question(
      'In thermodynamics, what does the Gibbs free energy change (ΔG < 0) indicate for a reaction occurring at constant temperature and pressure?',
      ['The reaction is endothermic.', 'The reaction is at dynamic equilibrium.', 'The reaction is thermodynamically spontaneous.', 'The reaction requires an external catalyst to proceed.'],
      2,
      'A negative Gibbs free energy change (ΔG < 0) indicates a thermodynamically exergonic, spontaneous process.',
      'Advanced',
    ),
    question(
      'In quantum mechanics, what does the Heisenberg uncertainty principle state regarding position (x) and momentum (p)?',
      ['Δx · Δp ≥ ℏ / 2', 'Δx · Δp = 0', 'Δx / Δp ≥ h', 'Δx + Δp ≥ c'],
      0,
      'The canonical commutation relation yields the Robertson-Schrödinger inequality Δx · Δp ≥ ℏ / 2.',
      'Advanced',
    ),
    question(
      'Which enzyme in DNA replication unwinds the double helix at the replication fork by breaking hydrogen bonds?',
      ['DNA polymerase III', 'Topoisomerase', 'DNA helicase', 'DNA ligase'],
      2,
      'DNA helicase separates the complementary strands of the double helix ahead of the replication fork.',
      'Advanced',
    ),
  ],

  'python-programming': [
    // Beginner (40 in expanded bank + 10 in catalogue = 50 total)
    question(
    'Which built-in function returns the number of elements in a Python list or string?',
    ['count()', 'size()', 'len()', 'length()'],
    2,
    '`len()` is the standard built-in function to query container length.',
    'Beginner'
  ),
  question(
    'What is the output of `type(3.14)` in Python 3?',
    ['<class \'double\'>', '<class \'float\'>', '<class \'decimal\'>', '<class \'number\'>'],
    1,
    'Python represents floating-point numbers using the built-in `<class \'float\'>`.',
    'Beginner'
  ),
  question(
    'How do you start a single-line comment in Python?',
    ['// comment', '/* comment */', '# comment', '-- comment'],
    2,
    'The `#` character indicates that the remainder of the line is a comment in Python.',
    'Beginner'
  ),
  question(
    'What will `bool([])` evaluate to in Python?',
    ['True', 'False', 'None', 'TypeError'],
    1,
    'Empty collections (lists, tuples, dicts, sets) evaluate to `False` in boolean contexts.',
    'Beginner'
  ),
  question(
    'Which operator is used for exponentiation (power) in Python?',
    ['^', '**', '^^', 'pow'],
    1,
    'The `**` operator raises a number to the power of another in Python.',
    'Beginner'
  ),
  question(
    'What does the `str.upper()` method return?',
    ['A copy of the string in uppercase', 'The string converted in place', 'The count of uppercase letters', 'A boolean'],
    0,
    '`str.upper()` returns a new copy of the string with all cased characters converted to uppercase.',
    'Beginner'
  ),
  question(
    'How do you convert the string "42" to an integer in Python?',
    ['toInt("42")', 'int("42")', 'Integer.parseInt("42")', 'Number("42")'],
    1,
    'The built-in `int()` constructor converts a valid numeric string to an integer.',
    'Beginner'
  ),
  question(
    'What is the index of the first element in a Python list?',
    ['0', '1', '-1', 'None'],
    0,
    'Python lists use zero-based indexing, so the first element is at index 0.',
    'Beginner'
  ),
  question(
    'What does a negative index like `items[-1]` access in a Python list?',
    ['The first element', 'The last element', 'An error', 'A sublist of one element'],
    1,
    'Negative index -1 accesses the final element of a sequence in Python.',
    'Beginner'
  ),
  question(
    'Which keyword is used to define a function in Python?',
    ['function', 'fun', 'def', 'define'],
    2,
    'Functions in Python are declared with the `def` keyword.',
    'Beginner'
  ),
  question(
    'What does `10 // 3` evaluate to in Python?',
    ['3.333', '3', '1', '3.0'],
    1,
    'The `//` operator performs floor division, discarding fractional parts.',
    'Beginner'
  ),
  question(
    'What is the result of `10 % 3` in Python?',
    ['1', '3', '0', '3.33'],
    0,
    'The `%` operator computes the remainder of division; 10 divided by 3 leaves remainder 1.',
    'Beginner'
  ),
  question(
    'Which built-in type represents boolean values in Python?',
    ['bool', 'boolean', 'Bit', 'flag'],
    0,
    'Python provides the `bool` type, which has two singleton instances: `True` and `False`.',
    'Beginner'
  ),
  question(
    'Which of the following creates an empty set in Python?',
    ['{}', 'set()', '[]', '()'],
    1,
    '`set()` creates an empty set; `{}` creates an empty dictionary.',
    'Beginner'
  ),
  question(
    'What method adds an element to the end of a list?',
    ['add()', 'push()', 'append()', 'insert_last()'],
    2,
    '`list.append(x)` appends object x to the end of the list.',
    'Beginner'
  ),
  question(
    'How do you check if the key "name" exists in dictionary `d`?',
    ['d.contains("name")', '"name" in d', 'd.hasKey("name")', 'exists("name", d)'],
    1,
    'The `in` keyword checks membership of keys in dictionaries.',
    'Beginner'
  ),
  question(
    'What does `str.strip()` do by default on a string?',
    ['Removes all vowels', 'Removes leading and trailing whitespace', 'Converts to lowercase', 'Splits the string into words'],
    1,
    '`str.strip()` removes whitespace from both the beginning and the end of the string.',
    'Beginner'
  ),
  question(
    'Which keyword is used to exit prematurely from a `for` or `while` loop?',
    ['stop', 'exit', 'break', 'return'],
    2,
    '`break` terminates the nearest enclosing loop.',
    'Beginner'
  ),
  question(
    'Which keyword skips the rest of the current loop iteration and moves to the next?',
    ['pass', 'continue', 'skip', 'next'],
    1,
    '`continue` immediately jumps to the next iteration of the enclosing loop.',
    'Beginner'
  ),
  question(
    'What does the `pass` statement do in Python?',
    ['Terminates execution', 'Does nothing (null operation placeholder)', 'Passes arguments to another function', 'Skips the next line'],
    1,
    '`pass` is a null statement used when syntax requires a statement but no action is needed.',
    'Beginner'
  ),
  question(
    'What is the output of `"Py" + "thon"` in Python?',
    ['"Python"', '"Py thon"', '["Py", "thon"]', 'TypeError'],
    0,
    'The `+` operator concatenates strings.',
    'Beginner'
  ),
  question(
    'What is the result of `"ha" * 3` in Python?',
    ['"hahaha"', '"ha 3"', 'TypeError', '["ha", "ha", "ha"]'],
    0,
    'Multiplying a string by an integer repeats the string that many times.',
    'Beginner'
  ),
  question(
    'Which function reads a line of input from standard input as a string?',
    ['read()', 'scan()', 'input()', 'get_line()'],
    2,
    '`input()` prompts the user and returns the entered text as a string.',
    'Beginner'
  ),
  question(
    'What does `range(5)` generate when iterated?',
    ['0, 1, 2, 3, 4', '1, 2, 3, 4, 5', '0, 1, 2, 3, 4, 5', '5, 4, 3, 2, 1'],
    0,
    '`range(5)` yields integers starting at 0 up to, but not including, 5.',
    'Beginner'
  ),
  question(
    'Which statement correctly opens a file for writing in text mode?',
    ['open("data.txt", "w")', 'open("data.txt", "r")', 'open("data.txt", "read")', 'open("data.txt", "b")'],
    0,
    'The mode `"w"` opens a file for writing text, truncating any existing content.',
    'Beginner'
  ),
  question(
    'What is the result of `min([8, 3, 11, 2])` in Python?',
    ['2', '3', '8', '11'],
    0,
    '`min()` returns the smallest item in an iterable or between two or more arguments.',
    'Beginner'
  ),
  question(
    'What is the result of `max([8, 3, 11, 2])` in Python?',
    ['2', '3', '8', '11'],
    3,
    '`max()` returns the largest item in an iterable.',
    'Beginner'
  ),
  question(
    'What does `sum([1, 2, 3, 4])` return?',
    ['10', '24', '4', 'None'],
    0,
    '`sum()` sums all numbers in an iterable from left to right; 1 + 2 + 3 + 4 = 10.',
    'Beginner'
  ),
  question(
    'Which collection is mutable in Python?',
    ['tuple', 'str', 'list', 'frozenset'],
    2,
    'Lists are mutable sequences that support in-place modification, insertion, and deletion.',
    'Beginner'
  ),
  question(
    'What is the result of `round(3.7)` in Python 3?',
    ['3', '4', '3.7', '3.0'],
    1,
    '`round(3.7)` rounds to the nearest integer, which is 4.',
    'Beginner'
  ),
  question(
    'Which keyword is used to import code from another module in Python?',
    ['include', 'require', 'import', 'using'],
    2,
    'Python uses the `import` keyword to load modules and packages.',
    'Beginner'
  ),
  question(
    'How do you delete a variable or a list element in Python?',
    ['remove(x)', 'delete x', 'del x', 'drop x'],
    2,
    'The `del` statement removes bindings or sequence elements.',
    'Beginner'
  ),
  question(
    'What does `abs(-15)` evaluate to in Python?',
    ['-15', '15', '0', 'None'],
    1,
    '`abs()` returns the absolute (non-negative) value of a number.',
    'Beginner'
  ),
  question(
    'What is the result of `"banana".count("a")`?',
    ['1', '2', '3', '4'],
    2,
    '`str.count(sub)` counts non-overlapping occurrences of the substring; "a" appears 3 times.',
    'Beginner'
  ),
  question(
    'Which data structure stores unique keys mapped to values in Python?',
    ['list', 'tuple', 'dict', 'array'],
    2,
    'A dictionary (`dict`) maps unique keys to values.',
    'Beginner'
  ),
  question(
    'What is the return value of a Python function that does not contain a `return` statement?',
    ['0', 'False', 'None', 'undefined'],
    2,
    'In Python, functions without an explicit return statement return `None` when falling off the end.',
    'Beginner'
  ),
  question(
    'How do you write an `if-else` condition chain in Python?',
    ['if / else if / else', 'if / elif / else', 'if / elseif / else', 'switch / case'],
    1,
    'Python uses `elif` (short for "else if") to chain conditional branches.',
    'Beginner'
  ),
  question(
    'What does `"apple,banana,cherry".split(",")` return?',
    ['("apple", "banana", "cherry")', '["apple", "banana", "cherry"]', '{"apple", "banana", "cherry"}', '"apple banana cherry"'],
    1,
    '`str.split(sep)` returns a list of substrings separated by the specified delimiter.',
    'Beginner'
  ),
  question(
    'What is the result of `", ".join(["a", "b", "c"])`?',
    ['"a, b, c"', '["a", "b", "c"]', '"abc"', '", a, b, c"'],
    0,
    '`str.join(iterable)` concatenates sequence strings using the calling string as separator.',
    'Beginner'
  ),
  question(
    'Which comparison operator checks if two values are not equal in Python?',
    ['!=', '<>', '!==', '~='],
    0,
    '`!=` tests for inequality of values in Python.',
    'Beginner'
  ),

    // Intermediate (42 in expanded bank + 8 in catalogue = 50 total)
    question(
    'What is the result of `"hello".find("x")`?',
    ['-1', 'None', 'Raises ValueError', 'False'],
    0,
    '`str.find()` returns -1 when the substring is not found, unlike `str.index()` which raises ValueError.',
    'Intermediate'
  ),
  question(
    'In Python, how can you merge two dictionaries `a` and `b` in Python 3.9+ without modifying either?',
    ['a.update(b)', 'a + b', 'a | b', 'merge(a, b)'],
    2,
    'PEP 584 introduced the union operator `|` for dictionaries in Python 3.9.',
    'Intermediate'
  ),
  question(
    'What does the `@property` decorator do when applied to a class method?',
    ['Makes the method static', 'Allows the method to be accessed like an attribute without parentheses', 'Caches the return value of the method indefinitely', 'Prevents subclasses from overriding the method'],
    1,
    'The `@property` decorator converts a zero-argument method into a getter attribute on class instances.',
    'Intermediate'
  ),
  question(
    'What is the output of `[i for i in range(5) if i % 2 != 0]`?',
    ['[0, 2, 4]', '[1, 3]', '[1, 3, 5]', '[2, 4]'],
    1,
    '`range(5)` yields 0, 1, 2, 3, 4. Filtering for odd numbers yields `[1, 3]`.',
    'Intermediate'
  ),
  question(
    'What does the `*args` syntax in a function parameter list allow?',
    ['Keyword-only parameters', 'Accepting an arbitrary number of positional arguments as a tuple', 'Unpacking a dictionary of keyword arguments', 'Specifying pointer types'],
    1,
    '`*args` packs positional arguments beyond the formal parameters into a tuple.',
    'Intermediate'
  ),
  question(
    'What does `**kwargs` in a function signature collect?',
    ['All positional arguments', 'Keyword arguments not matched by other parameters into a dictionary', 'Default arguments', 'A generator of keyword tuples'],
    1,
    '`**kwargs` captures unmatched keyword arguments as a standard dictionary.',
    'Intermediate'
  ),
  question(
    'What does the built-in `any([False, 0, "", 5])` return?',
    ['True', 'False', 'None', '5'],
    0,
    '`any()` returns True if at least one element in the iterable is truthy; 5 is truthy.',
    'Intermediate'
  ),
  question(
    'What does the built-in `all([True, 1, "text", []])` return?',
    ['True', 'False', 'None', 'TypeError'],
    1,
    '`all()` returns False if any element in the iterable is falsy; empty list `[]` is falsy.',
    'Intermediate'
  ),
  question(
    'What is the difference between `list.sort()` and `sorted(list)` in Python?',
    ['`list.sort()` modifies the list in place and returns None; `sorted()` returns a new sorted list', '`sorted()` modifies in place; `list.sort()` returns a new list', 'They are exact synonyms', '`list.sort()` only works on numbers'],
    0,
    '`list.sort()` sorts the list in place, whereas the `sorted()` built-in returns a new sorted list.',
    'Intermediate'
  ),
  question(
    'What exception is raised when trying to access a non-existent dictionary key via `d[k]`?',
    ['IndexError', 'KeyError', 'ValueError', 'LookupError'],
    1,
    'Accessing a missing key via square brackets raises `KeyError`.',
    'Intermediate'
  ),
  question(
    'What does the `zip()` function return when given two iterables of equal length?',
    ['A list of combined strings', 'An iterator of tuples pairing corresponding elements from each iterable', 'A nested dictionary', 'The Cartesian product'],
    1,
    '`zip()` aggregates elements from each iterable into tuples.',
    'Intermediate'
  ),
  question(
    'What does `dict.setdefault(key, default)` do if the key is already present in the dictionary?',
    ['Overwrites the key with the default value', 'Returns the existing value and leaves the dictionary unchanged', 'Raises a KeyError', 'Deletes the key'],
    1,
    'If the key exists, `setdefault` simply returns its current value without modifying it.',
    'Intermediate'
  ),
  question(
    'What is a lambda function in Python?',
    ['A recursive function only', 'An anonymous inline function defined with the `lambda` keyword', 'A function that cannot take arguments', 'A method bound to a class'],
    1,
    'Lambda functions are small, anonymous single-expression functions.',
    'Intermediate'
  ),
  question(
    'What does the `isinstance(obj, classinfo)` function do?',
    ['Returns True if obj is an instance or subclass of classinfo', 'Checks memory address equality', 'Compares the class names as strings', 'Returns the object type'],
    0,
    '`isinstance()` checks if an object is an instance of a class or a tuple of classes, including subclasses.',
    'Intermediate'
  ),
  question(
    'What does `copy.deepcopy()` do that `copy.copy()` does not?',
    ['Recursively copies nested compound objects rather than just copying references', 'Runs faster than shallow copy', 'Creates immutable instances', 'Converts lists to tuples'],
    0,
    'Deep copy constructs a new compound object and recursively copies all child objects.',
    'Intermediate'
  ),
  question(
    'What is the purpose of the `collections.defaultdict` class?',
    ['Prevents adding new keys', 'Provides a default factory function to supply values for missing keys', 'Sorts keys automatically upon insertion', 'Limits dictionary size'],
    1,
    '`defaultdict` calls its factory function to produce default values whenever a queried key is missing.',
    'Intermediate'
  ),
  question(
    'What does `collections.Counter("abracadabra")` compute?',
    ['The string length', 'A multiset dictionary mapping each character to its frequency count', 'An anagram generator', 'The reverse string'],
    1,
    '`Counter` tallies elements, mapping each distinct element to its integer frequency count.',
    'Intermediate'
  ),
  question(
    'How do you unpack the first item and the remaining items of a list `[1, 2, 3, 4]` in Python 3?',
    ['first, rest = items', 'first, *rest = items', 'first, ...rest = items', '*first, rest = items'],
    1,
    'Extended iterable unpacking uses `*rest` to capture remaining elements into a list.',
    'Intermediate'
  ),
  question(
    'What does a `try-except-else` block do when the `else` clause is included?',
    ['Executes only if an exception was raised and caught', 'Executes only if the try block succeeded without raising an exception', 'Always executes after finally', 'Executes if the except block fails'],
    1,
    'The `else` block runs if and only if the `try` block executes without raising any exceptions.',
    'Intermediate'
  ),
  question(
    'What does `string.startswith(("http://", "https://"))` accept as an argument?',
    ['Only a single string', 'A string or a tuple of prefixes to test against', 'A regular expression pattern only', 'A list or set'],
    1,
    '`str.startswith()` can accept a tuple of candidate prefixes, returning True if any match.',
    'Intermediate'
  ),
  question(
    'What happens when a list is passed as an argument to a function and modified inside via `.append()`?',
    ['A copy is modified; the caller\'s list is unchanged', 'The original list in the caller is modified in place', 'A TypeError is raised', 'Python creates a shadow tuple'],
    1,
    'Python passes object references; mutating a mutable object in place affects the caller\'s object.',
    'Intermediate'
  ),
  question(
    'What does `set.intersection()` or the `&` operator compute for two sets?',
    ['All elements from both sets', 'Only the elements present in both sets', 'Elements present in the first set but not the second', 'Symmetric differences'],
    1,
    'The intersection of two sets contains only the members common to both.',
    'Intermediate'
  ),
  question(
    'What does `set.difference()` or the `-` operator compute for sets A and B (A - B)?',
    ['Elements in A that are not in B', 'Elements in B that are not in A', 'Elements in both A and B', 'All unique elements across A and B'],
    0,
    'A - B produces the set difference: elements belonging to A but not to B.',
    'Intermediate'
  ),
  question(
    'What is the purpose of the `__init__` method in a Python class?',
    ['To allocate memory for the object', 'To initialize the newly created instance\'s attributes', 'To destroy the instance on garbage collection', 'To define static class variables'],
    1,
    '`__init__` is the initializer called immediately after `__new__` creates the instance.',
    'Intermediate'
  ),
  question(
    'What does `str(obj)` vs `repr(obj)` typically aim to produce?',
    ['`str` for human-readable display; `repr` for unambiguous developer inspection', '`str` for developer debugging; `repr` for end users', 'They are strictly identical in all classes', '`repr` encrypts the object state'],
    0,
    '`str()` yields an informal, user-friendly string; `repr()` yields an unambiguous representation, often valid Python code.',
    'Intermediate'
  ),
  question(
    "What is the result of ' '.join(reversed(['one', 'two', 'three']))?",
    ['"one two three"', '"three two one"', '"three, two, one"', '"three one two"'],
    1,
    '`reversed()` yields items from end to start, producing "three", "two", "one".',
    'Intermediate'
  ),
  question(
    'What does the `itertools.chain([1, 2], [3, 4])` function do?',
    ['Creates pairs of elements', 'Combines multiple iterables sequentially into a single continuous iterator', 'Multiplies corresponding elements', 'Computes permutations'],
    1,
    '`itertools.chain` chains several iterables together into one unbroken stream.',
    'Intermediate'
  ),
  question(
    'What is the result of `{x: x**2 for x in (1, 2, 3)}`?',
    ['{1: 1, 2: 4, 3: 9}', '[1, 4, 9]', '{1, 4, 9}', '(1, 4, 9)'],
    0,
    'This is a dictionary comprehension mapping each number to its square.',
    'Intermediate'
  ),
  question(
    'What is a generator expression in Python?',
    ['A list comprehension enclosed in brackets', 'An expression enclosed in parentheses that produces values lazily on demand', 'A lambda inside a loop', 'A function with a return statement'],
    1,
    'Generator expressions use parentheses and yield items lazily without creating the full list in memory.',
    'Intermediate'
  ),
  question(
    'What does `sys.argv[0]` represent in a running Python script?',
    ['The first command-line argument passed by the user', 'The script name or path invoked', 'The Python version string', 'The operating system platform identifier'],
    1,
    '`sys.argv[0]` is the name or path of the script itself as called from the shell.',
    'Intermediate'
  ),
  question(
    'What does `os.path.join("folder", "sub", "file.txt")` accomplish?',
    ['Concatenates strings without slashes', 'Combines path components using the operating-system-specific directory separator', 'Creates the directory on disk', 'Checks if the file exists'],
    1,
    '`os.path.join()` joins path components with the correct platform delimiter (`/` or `\\`).',
    'Intermediate'
  ),
  question(
    'How do you check if a file exists using the standard library `pathlib` module?',
    ['Path("file.txt").exists()', 'Path("file.txt").isFile()', 'pathlib.check("file.txt")', 'Path("file.txt").has()'],
    0,
    '`Path.exists()` returns True if the path points to an existing file or directory.',
    'Intermediate'
  ),
  question(
    'What is the purpose of the `enumerate()` function with its optional `start` parameter?',
    ['Filters odd indices', 'Yields index-value pairs starting from the given integer index', 'Reverses the sequence numbering', 'Counts total elements only'],
    1,
    '`enumerate(iterable, start=n)` generates pairs `(index, item)` starting index counting from `start`.',
    'Intermediate'
  ),
  question(
    'What does the `map(func, iterable)` function return in Python 3?',
    ['A list of transformed elements', 'A map iterator that yields transformed elements on demand', 'A dictionary of results', 'A tuple of transformed elements'],
    1,
    'In Python 3, `map()` returns an iterator rather than a list.',
    'Intermediate'
  ),
  question(
    'What does `filter(func, iterable)` do when `func` is `None`?',
    ['Raises a TypeError', 'Removes all truthy elements', 'Filters out all falsy elements from the iterable', 'Returns the iterable unchanged'],
    2,
    'If `function` is None, `filter()` uses the identity function, removing all falsy elements.',
    'Intermediate'
  ),
  question(
    'What is the result of `list(range(10))[2:8:2]`?',
    ['[2, 4, 6]', '[2, 4, 6, 8]', '[2, 3, 4]', '[0, 2, 4]'],
    0,
    'The slice `[2:8:2]` extracts indices 2, 4, and 6, which have values 2, 4, and 6.',
    'Intermediate'
  ),
  question(
    'What does the `callable(obj)` built-in function check?',
    ['Whether an object can be called like a function', 'Whether an object is a string', 'Whether an object is defined in the global scope', 'Whether an object has a docstring'],
    0,
    '`callable()` returns True if the argument appears callable (such as functions, methods, or classes with `__call__`).',
    'Intermediate'
  ),
  question(
    'What does the `getattr(obj, name, default)` function do?',
    ['Sets an attribute value', 'Fetches the named attribute from an object, returning `default` if it does not exist', 'Deletes the attribute', 'Checks if the attribute is private'],
    1,
    '`getattr()` dynamically retrieves an attribute, with an optional fallback default if absent.',
    'Intermediate'
  ),
  question(
    'What is the difference between class attributes and instance attributes in Python?',
    ['Class attributes are shared by all instances of the class; instance attributes belong to a specific instance', 'Instance attributes are immutable; class attributes are mutable', 'Class attributes can only be integers', 'There is no difference in scoping'],
    0,
    'Class attributes are defined on the class body and shared; instance attributes are bound to individual `self` objects.',
    'Intermediate'
  ),
  question(
    'How do you define a static method in a Python class?',
    ['Using the `@classmethod` decorator', 'Using the `@staticmethod` decorator', 'Declaring the method without `self`', 'Prefixing the method name with `static_`'],
    1,
    '`@staticmethod` defines a method that does not receive an implicit first argument (`self` or `cls`).',
    'Intermediate'
  ),
  question(
    'What is the first argument conventionally passed to a `@classmethod` method?',
    ['`self` (the instance)', '`cls` (the class object itself)', '`super` (the parent class)', '`None`'],
    1,
    'Class methods receive the class object as their first positional argument, conventionally named `cls`.',
    'Intermediate'
  ),
  question(
    'What does `is` check compared to `==` for two variables `x` and `y`?',
    ['`is` checks memory identity (same object); `==` checks equality of values', '`is` checks equality of values; `==` checks type', '`is` is deprecated in Python 3', 'They are strictly synonymous in all cases'],
    0,
    '`is` checks whether two references point to the exact same object in memory; `==` evaluates equality.',
    'Intermediate'
  ),

    // Advanced (48 in expanded bank + 2 in catalogue = 50 total)
    question(
    'What distinguishes a generator function containing `yield` from an ordinary function returning an iterator?',
    ['Generators cannot accept parameters.', 'Generators suspend their execution state, preserving local variables between iterations.', 'Generators load all elements into RAM upon invocation.', 'Generators cannot be used in a `for` loop.'],
    1,
    '`yield` suspends stack frame state and local variables, resuming execution upon `next()`.',
    'Advanced'
  ),
  question(
    'What does `__slots__` accomplish when defined on a Python class?',
    ['Forces all attributes to be private.', 'Replaces instance `__dict__` with a fixed-size array, reducing memory footprint and preventing arbitrary attribute assignment.', 'Enables multi-threading safety across all instances.', 'Automatically serializes class instances to JSON.'],
    1,
    '`__slots__` eliminates per-instance `__dict__`, reducing memory per instance and preventing setting undeclared attributes.',
    'Advanced'
  ),
  question(
    'How does Python handle the Global Interpreter Lock (GIL) in standard CPython during CPU-bound multithreading?',
    ['It parallelizes threads across all available physical cores.', 'It allows only one thread to execute Python bytecode at a time, preventing true CPU parallelism.', 'It compiles Python code into native lock-free assembly.', 'It spawns independent sub-processes for each thread.'],
    1,
    'CPython\'s GIL ensures thread-safe memory management by allowing only one native thread to execute bytecode at any instant.',
    'Advanced'
  ),
  question(
    'In Python descriptors, what distinguishes a "data descriptor" from a "non-data descriptor"?',
    ['A data descriptor defines `__get__` and either `__set__` or `__delete__`; a non-data descriptor defines only `__get__`.', 'A data descriptor can only store integers.', 'A non-data descriptor overrides instance dictionary lookups.', 'There is no semantic difference in attribute resolution order.'],
    0,
    'Data descriptors implement `__set__` or `__delete__` in addition to `__get__`, taking precedence over instance `__dict__` entries.',
    'Advanced'
  ),
  question(
    'What is the Method Resolution Order (MRO) algorithm used in Python 3 for multiple inheritance?',
    ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'C3 Superconcurrency Linearization', 'Dijkstra\'s shortest path'],
    2,
    'Python uses the C3 Linearization algorithm to determine a consistent MRO in multiple inheritance hierarchies.',
    'Advanced'
  ),
  question(
    'What does the `__new__` method do compared to `__init__` in a Python class?',
    ['`__new__` initializes attributes; `__init__` allocates the memory', '`__new__` is the static constructor that creates and returns the new instance; `__init__` initializes it', '`__new__` is only used for exceptions', '`__new__` destroys an object before re-creating it'],
    1,
    '`__new__` is responsible for creating and returning the instance object, whereas `__init__` configures that instance.',
    'Advanced'
  ),
  question(
    'In a Python metaclass, which method is called to create the class object itself?',
    ['`__call__`', '`__new__`', '`__class__`', '`__instancecheck__`'],
    1,
    'A metaclass\'s `__new__` method is called to instantiate the class object itself.',
    'Advanced'
  ),
  question(
    'What does the `functools.wraps` decorator do when writing custom decorators?',
    ['Caches return values', 'Copies docstring, name, module, and annotations from the wrapped function to the wrapper', 'Converts synchronous functions into async coroutines', 'Enforces strict type validation on arguments'],
    1,
    '`functools.wraps` updates the wrapper function to reflect the original function\'s name, docstring, and metadata.',
    'Advanced'
  ),
  question(
    'What does `sys.intern(string)` do in Python?',
    ['Encrypts the string in memory', 'Enters the string into a global table of interned strings, ensuring identical strings share the same memory address', 'Converts unicode to ASCII', 'Freezes the string from modification'],
    1,
    '`sys.intern()` returns an interned string, allowing fast pointer comparison with `is`.',
    'Advanced'
  ),
  question(
    'What does the `weakref` module in Python provide?',
    ['References to objects that do not prevent them from being garbage-collected', 'A weak hash table with cryptographic security', 'Low-precision floating point numbers', 'Pointers to C variables'],
    0,
    'Weak references allow referencing an object without incrementing its reference count, preventing cyclic memory leaks.',
    'Advanced'
  ),
  question(
    'What is the purpose of `__prepare__` in a Python metaclass?',
    ['Initializes global class variables', 'Returns a mapping (such as an OrderedDict) to be used as the local namespace during class definition', 'Compiles bytecode ahead of time', 'Validates class inheritance syntax'],
    1,
    'Metaclass `__prepare__` returns a dictionary-like object used to store class body attributes while the class body executes.',
    'Advanced'
  ),
  question(
    'In Python 3.8+, what does the walrus operator `:=` do?',
    ['Bitwise left shift and assign', 'Assigns values to variables as part of a larger expression', 'Compares values strictly by identity and type', 'Defines a generator comprehension'],
    1,
    'The assignment expression operator `:=` (walrus) allows assigning a value to a variable within an expression.',
    'Advanced'
  ),
  question(
    'What is the effect of setting `sys.setrecursionlimit(n)` in Python?',
    ['Limits the maximum number of threads', 'Alters the maximum interpreter call stack depth before a `RecursionError` is raised', 'Limits loop iterations across all for-loops', 'Restricts memory allocation per process'],
    1,
    '`sys.setrecursionlimit` sets the maximum depth of the Python interpreter call stack.',
    'Advanced'
  ),
  question(
    'How does Python\'s garbage collector detect and reclaim cyclic references?',
    ['It cannot detect cyclic references', 'By using a generational garbage collection algorithm that tracks container objects and identifies unreachable reference cycles', 'By crashing with MemoryError', 'By running every 5 seconds on a separate OS thread'],
    1,
    'CPython combines reference counting with a cyclic, generational garbage collector to detect and break isolated reference cycles.',
    'Advanced'
  ),
  question(
    'What is the purpose of the `__missing__` method in Python dict subclasses?',
    ['Deletes absent keys', 'Called by `__getitem__` when a requested key is not found in the dictionary', 'Validates key types on insertion', 'Returns the total count of missing lookups'],
    1,
    'When `dict.__getitem__` cannot find a key, it invokes `__missing__(key)` on subclasses (used by `defaultdict`).',
    'Advanced'
  ),
  question(
    'What does `contextlib.contextmanager` use to split setup and teardown code in a generator?',
    ['`return`', '`yield`', '`break`', '`raise`'],
    1,
    'The code before `yield` runs on entering the context; the code after `yield` runs upon exiting.',
    'Advanced'
  ),
  question(
    'What is the difference between `asyncio.create_task()` and `await coroutine`?',
    ['`create_task` schedules the coroutine concurrently on the event loop; direct `await` pauses execution until that coroutine finishes', '`create_task` runs in a separate native OS thread; `await` does not', 'They are strictly identical in performance and concurrency', '`create_task` blocks the event loop'],
    0,
    '`create_task` wraps the coroutine in a Task and schedules it immediately, allowing other code to proceed concurrently.',
    'Advanced'
  ),
  question(
    'What does `asyncio.gather(*aws)` do when executed?',
    ['Runs coroutines strictly sequentially', 'Runs awaitable objects concurrently on the event loop and returns a list of results in original order', 'Cancels all coroutines if one succeeds', 'Spawns an independent multiprocessing pool'],
    1,
    '`asyncio.gather` aggregates awaitables, running them concurrently and returning their results in the input order.',
    'Advanced'
  ),
  question(
    'What happens when `yield from iterable` is used inside a generator?',
    ['Stops iteration immediately', 'Delegates iteration to the subgenerator/iterable, establishing a bidirectional channel for values and exceptions', 'Creates a nested list', 'Throws a GeneratorExit exception'],
    1,
    '`yield from` transparently delegates generation and communication to a sub-iterator.',
    'Advanced'
  ),
  question(
    'What is the purpose of `inspect.signature(callable)` in Python?',
    ['Returns the compiled assembly instructions', 'Extracts parameter names, default values, and type annotations of the callable', 'Verifies code signing certificates', 'Measures execution timing'],
    1,
    '`inspect.signature` returns a `Signature` object detailing the parameters, kinds, defaults, and return annotations.',
    'Advanced'
  ),
  question(
    'What is the behavior of mutable default arguments in Python functions, such as `def fn(items=[])`?',
    ['A new list is created each time `fn` is called', 'The same list instance is reused across all calls that do not provide an argument', 'Python raises a SyntaxError at definition time', 'The list is frozen into a tuple'],
    1,
    'Default parameter expressions are evaluated once at function definition time; mutable defaults persist modifications across calls.',
    'Advanced'
  ),
  question(
    'What does the `dis` module in Python standard library do?',
    ['Disables garbage collection', 'Disassembles Python bytecode into human-readable mnemonic instructions', 'Distributes tasks across clusters', 'Discards unused variables'],
    1,
    'The `dis` module is the Python bytecode disassembler.',
    'Advanced'
  ),
  question(
    'In Python typing, what does `TypeVar("T", bound=Animal)` represent?',
    ['A concrete subclass of Animal', 'A generic type variable constrained to Animal and any of its subclasses', 'An immutable union of Animal types', 'A runtime cast function'],
    1,
    '`TypeVar` with `bound` specifies an upper type bound for generic functions and classes.',
    'Advanced'
  ),
  question(
    'What does `typing.overload` do at runtime in standard Python?',
    ['Implements multiple dispatch in the Python interpreter', 'Has no runtime effect; serves purely as a type-checker hint for polymorphic function signatures', 'Compiles overloaded C extensions', 'Caches method calls by argument types'],
    1,
    '`@overload` decorators are purely for static type analysis and are replaced by the final non-decorated implementation at runtime.',
    'Advanced'
  ),
  question(
    'What does the `abc.abstractmethod` decorator do on a class method?',
    ['Prevents subclasses from overriding the method', 'Marks the method as abstract; the containing class cannot be instantiated unless the method is overridden', 'Runs the method asynchronously', 'Converts the method into a class method'],
    1,
    'A class inheriting from `abc.ABC` with abstract methods cannot be instantiated unless all abstract methods are implemented.',
    'Advanced'
  ),
  question(
    'What does `__mro__` attribute on a Python class expose?',
    ['A tuple of classes representing the Method Resolution Order', 'The memory addresses of class methods', 'A dictionary of overridden properties', 'The class inheritance depth as an integer'],
    0,
    '`__mro__` returns a tuple of types representing the linearization order used for attribute lookup.',
    'Advanced'
  ),
  question(
    'How does Python determine attribute access precedence when an instance attribute and a non-data descriptor share a name?',
    ['The non-data descriptor always takes precedence', 'The instance dictionary entry (`__dict__`) takes precedence over non-data descriptors', 'Python raises an AttributeError', 'The class definition order decides'],
    1,
    'Data descriptors override instance dictionary entries; instance dictionary entries override non-data descriptors.',
    'Advanced'
  ),
  question(
    'What does `types.MappingProxyType(dict_obj)` return?',
    ['A deep copy of the dictionary', 'A read-only, dynamic proxy view of the underlying dictionary', 'A thread-safe concurrent dictionary', 'A sorted dictionary'],
    1,
    '`MappingProxyType` creates a read-only view of a mapping that reflects live changes to the underlying dict without allowing writes.',
    'Advanced'
  ),
  question(
    'What is the purpose of `sys.settrace()` in Python?',
    ['Sets up an HTTP trace request', 'Registers an interpreter-level trace callback function for debugging, profiling, and code coverage', 'Logs memory allocations', 'Monitors network sockets'],
    1,
    '`sys.settrace()` sets the system trace function, allowing profilers and debuggers to intercept calls, lines, and returns.',
    'Advanced'
  ),
  question(
    'What does `ctypes.POINTER(ctypes.c_int)` represent in Python\'s `ctypes` library?',
    ['A native C integer pointer type', 'A managed Python memory buffer', 'A double-precision float pointer', 'An array of fixed length 10'],
    0,
    '`ctypes.POINTER()` creates and returns a new C-compatible pointer type.',
    'Advanced'
  ),
  question(
    'What does `gc.disable()` do in Python?',
    ['Stops memory allocation', 'Disables automatic cyclic garbage collection passes while reference counting continues normally', 'Deletes all existing objects', 'Forces all objects to become immortal'],
    1,
    '`gc.disable()` turns off the cyclic collector; standard reference counting deallocation still occurs immediately when refcount reaches zero.',
    'Advanced'
  ),
  question(
    'What does `functools.lru_cache(maxsize=128)` do when applied to a pure function?',
    ['Runs the function asynchronously', 'Wraps the function with a memoizing callable that saves up to 128 recent calls and return values', 'Compiles the function with Cython', 'Restricts execution time to 128ms'],
    1,
    '`lru_cache` provides a Least Recently Used memoization cache for function results.',
    'Advanced'
  ),
  question(
    'What is the purpose of `collections.ChainMap(*maps)`?',
    ['Concatenates lists into a single sequence', 'Groups multiple dictionaries into a single updatable view with prioritized sequential lookup', 'Chains iterators for for-loops', 'Freezes dictionaries into immutable mappings'],
    1,
    '`ChainMap` groups multiple mappings together, searching them in order to find a key.',
    'Advanced'
  ),
  question(
    'What does `__del__` method do in Python?',
    ['Explicitly destroys the object when called by `del obj`', 'Called by the runtime when the instance\'s reference count drops to zero and it is about to be destroyed', 'Deletes attributes from the instance', 'Cancels active async tasks'],
    1,
    '`__del__` is the finalizer invoked when an instance is about to be garbage-collected.',
    'Advanced'
  ),
  question(
    'What is the difference between `os.fork()` and `multiprocessing.Process` on cross-platform Python?',
    ['`os.fork()` is a POSIX system call that duplicates the process; `multiprocessing` supports spawn/forkserver across Windows and macOS', '`os.fork()` runs on Windows; `multiprocessing` is Linux-only', '`os.fork()` creates threads; `Process` creates coroutines', 'They are strictly identical on all platforms'],
    0,
    '`os.fork()` is Unix-only; `multiprocessing` provides a cross-platform API supporting spawn, fork, and forkserver start methods.',
    'Advanced'
  ),
  question(
    'What does `memoryview(byte_array)` provide in Python?',
    ['A complete copy of the bytes in RAM', 'A zero-copy slice and buffer access interface to the underlying memory of an object', 'A string conversion interface', 'An encrypted stream view'],
    1,
    '`memoryview` objects allow Python code to access the internal data of an object supporting the buffer protocol without copying.',
    'Advanced'
  ),
  question(
    'What does `struct.pack(format, v1, v2)` do?',
    ['Compresses strings with gzip', 'Packs Python values into a bytes object according to a C struct layout format string', 'Encodes objects into JSON format', 'Creates an SQLite database record'],
    1,
    'The `struct` module converts between Python values and C structs represented as Python bytes.',
    'Advanced'
  ),
  question(
    'What does `operator.itemgetter(1)` return?',
    ['The first element of an iterable', 'A callable object that fetches item 1 from its operand via `__getitem__`', 'A slice generator', 'An index validator'],
    1,
    '`itemgetter(n)` returns a callable that retrieves the n-th item from its argument.',
    'Advanced'
  ),
  question(
    'What is the purpose of `dataclasses.field(default_factory=list)` in Python dataclasses?',
    ['Creates a static class variable', 'Provides a callable factory to generate a fresh mutable default value for each instance', 'Prevents the field from being included in `__repr__`', 'Enforces strict typing at runtime'],
    1,
    '`default_factory` avoids shared mutable defaults by invoking the factory for each new dataclass instance.',
    'Advanced'
  ),
  question(
    'What does `dataclasses.asdict(instance)` return?',
    ['A dictionary copy of the dataclass instance\'s fields and recursive values', 'The instance `__dict__` reference', 'A tuple of field names', 'A string representation of the dataclass'],
    0,
    '`asdict()` converts a dataclass instance to a dict of field names mapped to field values, recursing into nested dataclasses.',
    'Advanced'
  ),
  question(
    'What does `sys.getrefcount(obj)` return in CPython?',
    ['The exact number of references to `obj`, including the temporary reference from `getrefcount` itself', 'The memory address of `obj` in hexadecimal', 'The number of subclasses of `obj`', 'The garbage collection generation number'],
    0,
    '`sys.getrefcount()` returns the reference count of the object, which is generally one higher than expected due to the argument reference.',
    'Advanced'
  ),
  question(
    'What is the effect of raising `StopIteration(value)` inside a generator function?',
    ['Stops iteration and sets the return value of the generator (retrievable by a delegating `yield from`)', 'Causes an unhandled runtime crash', 'Resets the generator to index 0', 'Transforms the generator into a list'],
    0,
    'In Python generators, returning a value or raising `StopIteration(value)` sets the value attribute of the `StopIteration` exception.',
    'Advanced'
  ),
  question(
    'What does `inspect.iscoroutinefunction(obj)` check?',
    ['Whether an object is a function defined with `async def`', 'Whether an object is an active generator', 'Whether an object contains a while loop', 'Whether an object is a thread target'],
    0,
    '`inspect.iscoroutinefunction()` returns True if the object was defined using `async def`.',
    'Advanced'
  ),
  question(
    'What is the purpose of `concurrent.futures.ThreadPoolExecutor` vs `ProcessPoolExecutor`?',
    ['ThreadPoolExecutor uses threads within the same process (limited by GIL for CPU tasks); ProcessPoolExecutor uses separate OS processes for true CPU parallelism', 'ProcessPoolExecutor is only for I/O; ThreadPoolExecutor is for CPU tasks', 'ThreadPoolExecutor creates processes on remote machines', 'They are identical implementations with different aliases'],
    0,
    '`ThreadPoolExecutor` uses threads for I/O concurrency; `ProcessPoolExecutor` uses subprocesses to circumvent the GIL for CPU-heavy tasks.',
    'Advanced'
  ),
  question(
    'What is the purpose of `signal.signal(signal.SIGINT, handler)` in Python?',
    ['Sends an interrupt signal to another process', 'Registers a custom callback handler for the SIGINT interrupt signal (such as Ctrl+C)', 'Disables keyboard input', 'Terminates all child threads immediately'],
    1,
    '`signal.signal()` configures custom handler functions for intercepted operating system signals.',
    'Advanced'
  ),
  question(
    'What does `math.isclose(a, b, rel_tol=1e-09)` do?',
    ['Checks if two floating-point numbers are approximately equal within a relative tolerance', 'Checks if two integers are consecutive', 'Returns the absolute difference as a float', 'Rounds both numbers to 9 decimal places'],
    0,
    '`math.isclose` determines whether two floating point values are close according to relative and absolute tolerances.',
    'Advanced'
  ),
  question(
    'What does `shutil.copytree(src, dst)` do in Python\'s `shutil` module?',
    ['Recursively copies an entire directory tree rooted at src to destination dst', 'Copies only directory names without files', 'Compresses a folder into a zip archive', 'Creates symbolic links for each file'],
    0,
    '`shutil.copytree` recursively copies an entire directory hierarchy.',
    'Advanced'
  ),
  question(
    'What is the purpose of `uuid.uuid4()` in Python\'s `uuid` module?',
    ['Generates a UUID based on host network address and timestamp', 'Generates a random UUID (version 4) with 122 bits of cryptographically strong randomness', 'Generates a MD5-hashed UUID', 'Generates a sequential integer counter'],
    1,
    '`uuid.uuid4()` generates a random UUID according to RFC 4122 specifications.',
    'Advanced'
  )
  ],

  'java-programming': [
    // Beginner
    question(
      'Which keyword in Java is used to inherit a class?',
      ['implements', 'extends', 'inherits', 'super'],
      1,
      'The `extends` keyword is used for class inheritance in Java.',
      'Beginner',
    ),
    question(
      'What is the default value of an uninitialized `boolean` field in a Java class?',
      ['true', 'false', '0', 'null'],
      1,
      'Instance and static boolean fields default to `false`.',
      'Beginner',
    ),
    question(
      'Which package is automatically imported into every Java compilation unit without an explicit import statement?',
      ['java.util', 'java.io', 'java.lang', 'java.net'],
      2,
      '`java.lang` is implicitly imported by the Java compiler.',
      'Beginner',
    ),
    question(
      'What is the size of a `float` primitive data type in Java?',
      ['16 bits', '32 bits', '64 bits', '8 bits'],
      1,
      'Java `float` is an IEEE 754 single-precision 32-bit floating-point primitive.',
      'Beginner',
    ),

    // Intermediate
    question(
      'What happens if you invoke `start()` twice on the same `Thread` instance in Java?',
      ['The thread restarts from the beginning.', 'An `IllegalThreadStateException` is thrown.', 'The method call is ignored silently.', 'The second invocation waits until the first completes.'],
      1,
      'A thread in Java cannot be restarted once started; attempting to do so throws `IllegalThreadStateException`.',
      'Intermediate',
    ),
    question(
      'What is the primary difference between `Comparable` and `Comparator` in Java?',
      ['Comparable provides natural ordering via `compareTo`; Comparator provides custom external ordering via `compare`.', 'Comparable cannot sort Strings.', 'Comparator is part of java.lang while Comparable is in java.util.', 'Comparable requires a lambda expression.'],
      0,
      '`Comparable<T>` defines intrinsic natural order inside a class; `Comparator<T>` defines decoupled custom comparison logic.',
      'Intermediate',
    ),
    question(
      'Which Java collection class is thread-safe without manual synchronization?',
      ['ArrayList', 'HashMap', 'ConcurrentHashMap', 'TreeSet'],
      2,
      '`ConcurrentHashMap` provides lock-striping and thread-safe concurrent read/write operations.',
      'Intermediate',
    ),
    question(
      'What does the `transient` keyword signify on an instance variable?',
      ['The variable cannot be changed.', 'The variable is not serialized during default Java serialization.', 'The variable is stored in off-heap memory.', 'The variable is accessed only by volatile writes.'],
      1,
      '`transient` marks a field so that its value is excluded when the enclosing object is serialized.',
      'Intermediate',
    ),

    // Advanced
    question(
      'In the Java Memory Model (JMM), what does the `volatile` keyword guarantee for a variable?',
      ['Mutual exclusion and atomic compound operations (e.g. i++)', 'Visibility of writes across all threads and prevention of certain instruction reorderings', 'Permanent caching in L1 processor cache', 'Automatic garbage collection suppression'],
      1,
      '`volatile` ensures memory visibility (reads always see the latest write) and establishes happens-before edges without locking.',
      'Advanced',
    ),
    question(
      'How does Java’s Generics implementation achieve backwards compatibility with legacy JVM versions?',
      ['Type specialization at runtime generating distinct bytecode classes', 'Type erasure, removing generic type parameters during compilation and inserting casts', 'Dynamic reflection proxies for all generic instances', 'Bytecode verification bypass'],
      1,
      'Java uses type erasure: generic type metadata is removed during compilation, preserving binary compatibility with older bytecode.',
      'Advanced',
    ),
    question(
      'In Java garbage collection, what is the role of the "Card Table" in generational collectors?',
      ['Tracking references from Old Generation to Young Generation to avoid scanning the entire Old Generation during minor GC', 'Storing the addresses of permanently pinned objects', 'Allocating memory for classes loaded by custom classloaders', 'Managing thread-local allocation buffers (TLAB)'],
      0,
      'The card table tracks old-to-young pointers so minor collections can scan only dirty cards instead of full old-generation heaps.',
      'Advanced',
    ),
  ],

  'c-programming': [
    // Beginner
    question(
      'Which format specifier is used with `printf` to display a signed decimal integer in C?',
      ['%f', '%d', '%c', '%s'],
      1,
      '`%d` (or `%i`) formats signed decimal integers.',
      'Beginner',
    ),
    question(
      'What is the index of the last element in an array declared as `int arr[10];`?',
      ['10', '9', '8', 'Depends on compiler'],
      1,
      'C arrays are zero-indexed, so elements range from 0 to 9.',
      'Beginner',
    ),
    question(
      'Which function from `<string.h>` returns the number of characters in a null-terminated string, excluding the null byte?',
      ['strlength', 'strsize', 'strlen', 'strcount'],
      2,
      '`strlen()` computes the length of a string up to the terminating null character.',
      'Beginner',
    ),

    // Intermediate
    question(
      'What is the effect of applying `static` to a global variable declared in a `.c` file?',
      ['It stores the variable in CPU registers.', 'It limits the variable\'s visibility and linkage to that translation unit.', 'It makes the variable constant and read-only.', 'It prevents the variable from being initialized.'],
      1,
      'A static file-scope variable has internal linkage, restricting access to the current translation unit.',
      'Intermediate',
    ),
    question(
      'What does `calloc(n, size)` do differently from `malloc(n * size)`?',
      ['Allocates memory in the data segment instead of heap.', 'Initializes the allocated memory bytes to all zeros.', 'Allocates non-contiguous memory blocks.', 'Automatically frees memory when exiting the enclosing function.'],
      1,
      '`calloc` zeroes all bytes in the allocated memory block before returning the pointer.',
      'Intermediate',
    ),
    question(
      'Given `int *ptr = NULL;`, what happens if code attempts `*ptr = 10;`?',
      ['ptr is automatically assigned a valid address.', 'Undefined behavior, typically resulting in a segmentation fault.', 'The value 10 is stored in address 0x0 safely.', 'The compiler throws a syntax error.'],
      1,
      'Dereferencing a null pointer causes undefined behavior, triggering a segmentation fault on modern operating systems.',
      'Intermediate',
    ),

    // Advanced
    question(
      'According to the C standard, what is the consequence of modifying a string literal such as `char *s = "text"; s[0] = \'m\';`?',
      ['Valid modification in place', 'Undefined behavior, as string literals may be stored in read-only memory', 'Compile-time error only', 'Safe allocation of a new string copy'],
      1,
      'Modifying string literals invokes undefined behavior; operating systems typically place them in read-only pages.',
      'Advanced',
    ),
    question(
      'What does the `restrict` type qualifier indicate to the C compiler regarding a pointer parameter?',
      ['The pointer cannot be reassigned.', 'For the lifetime of the pointer, only it (or a pointer derived directly from it) will be used to access the referenced object.', 'The pointed-to object is thread-safe.', 'The memory is allocated in static storage.'],
      1,
      '`restrict` informs the compiler that the pointer does not alias with other pointers, enabling aggressive loop optimizations.',
      'Advanced',
    ),
    question(
      'What is the evaluation rule for sequence points and side effects in expressions like `i = i++` in C99?',
      ['Guaranteed left-to-right evaluation', 'Undefined behavior due to multiple unsequenced modifications of a scalar object', 'The value of i is unchanged', 'A compile-time constraint violation'],
      1,
      'Modifying a scalar object more than once between sequence points without intervening reads produces undefined behavior.',
      'Advanced',
    ),
  ],

  'sql-database-management': [
    // Beginner
    question(
      'Which SQL keyword is used to sort the result set of a query?',
      ['SORT BY', 'ORDER BY', 'GROUP BY', 'ALIGN BY'],
      1,
      '`ORDER BY` sorts the returned records in ascending (ASC) or descending (DESC) order.',
      'Beginner',
    ),
    question(
      'Which command is used to remove all records from a table without logging individual row deletions?',
      ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'],
      2,
      '`TRUNCATE TABLE` empties a table quickly by deallocating data pages with minimal transaction logging.',
      'Beginner',
    ),
    question(
      'Which aggregate function computes the arithmetic mean of a numeric column in SQL?',
      ['MEAN()', 'MEDIAN()', 'AVG()', 'SUM() / COUNT()'],
      2,
      '`AVG()` calculates the average value of a numeric column.',
      'Beginner',
    ),

    // Intermediate
    question(
      'What is the difference between `WHERE` and `HAVING` in a SQL query?',
      ['WHERE filters individual rows before aggregation; HAVING filters aggregated groups.', 'WHERE can only be used on indexed columns.', 'HAVING cannot be used without a JOIN.', 'There is no semantic difference.'],
      0,
      '`WHERE` filters rows prior to `GROUP BY`; `HAVING` filters group summaries produced by aggregate expressions.',
      'Intermediate',
    ),
    question(
      'What does a `CROSS JOIN` produce between two tables of 10 rows and 5 rows?',
      ['5 rows', '15 rows', '50 rows', '0 rows'],
      2,
      'A `CROSS JOIN` produces the Cartesian product: 10 × 5 = 50 rows.',
      'Intermediate',
    ),
    question(
      'In database normalization, what characterizes Second Normal Form (2NF)?',
      ['Elimination of all transitive dependencies.', 'Table is in 1NF and all non-key attributes are fully functionally dependent on the entire primary key.', 'All columns must contain foreign keys.', 'No null values are permitted anywhere in the table.'],
      1,
      '2NF requires 1NF compliance and no partial functional dependencies on candidate keys.',
      'Intermediate',
    ),

    // Advanced
    question(
      'Which transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but allows Phantom Reads in the ANSI SQL standard?',
      ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
      2,
      '`Repeatable Read` locks read rows to prevent fuzzy/non-repeatable reads, but historically allows new phantom rows inserted by concurrent transactions.',
      'Advanced',
    ),
    question(
      'What is the distinction between a Clustered Index and a Non-Clustered Index in relational databases?',
      ['A clustered index determines the physical storage order of rows in the table (one per table); non-clustered indexes maintain a separate structure pointing to the rows.', 'Clustered indexes cannot be used for range queries.', 'A table can have unlimited clustered indexes.', 'Non-clustered indexes are stored in RAM only.'],
      0,
      'Physical leaf pages of a clustered index contain actual table data rows, permitting only one clustered order per table.',
      'Advanced',
    ),
    question(
      'In write-ahead logging (WAL), what fundamental rule guarantees durability (the D in ACID)?',
      ['Transaction log records must be flushed to persistent storage before corresponding modified data pages are written to disk.', 'Data pages are written to disk before transactions are committed.', 'Checkpoints occur after every individual SQL statement.', 'Rollbacks are executed asynchronously.'],
      0,
      'WAL mandates that log changes describing a modification must reach non-volatile storage before dirty data pages are flushed.',
      'Advanced',
    ),
  ],

  'data-structures-algorithms': [
    // Beginner
    question(
      'Which data structure follows the First-In, First-Out (FIFO) principle?',
      ['Stack', 'Queue', 'Priority Queue', 'Binary Tree'],
      1,
      'A Queue enqueues elements at the rear and dequeues from the front in FIFO order.',
      'Beginner',
    ),
    question(
      'What is the time complexity to access an element by index in a contiguous array of size n?',
      ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      0,
      'Arrays offer constant-time O(1) random access via base address arithmetic: base + index × element_size.',
      'Beginner',
    ),
    question(
      'What is the maximum number of children a node can have in a binary tree?',
      ['1', '2', '3', 'Unlimited'],
      1,
      'A binary tree node has at most two children, typically termed left and right.',
      'Beginner',
    ),

    // Intermediate
    question(
      'What is the worst-case time complexity of QuickSort when using the first element as pivot on an already sorted array?',
      ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
      2,
      'When the pivot is consistently extreme, partitions are unbalanced of size 0 and n-1, leading to O(n²) comparisons.',
      'Intermediate',
    ),
    question(
      'Which data structure is most appropriate for implementing Dijkstra\'s single-source shortest path algorithm efficiently on non-negative weighted graphs?',
      ['FIFO Queue', 'LIFO Stack', 'Min-Priority Queue (Binary/Fibonacci Heap)', 'Hash Set'],
      2,
      'A Min-Heap allows extracting the tentative vertex with the minimal distance in O(log V) time.',
      'Intermediate',
    ),
    question(
      'In a balanced AVL tree, what is the maximum permitted absolute difference between the heights of the left and right subtrees of any node?',
      ['0', '1', '2', 'log n'],
      1,
      'The AVL balance factor invariant requires |height(left) - height(right)| ≤ 1.',
      'Intermediate',
    ),

    // Advanced
    question(
      'What is the amortized time complexity of the `find` and `union` operations in a Disjoint Set Union (DSU) structure using both path compression and union by rank?',
      ['O(1)', 'O(α(n)) where α is the inverse Ackermann function', 'O(log n)', 'O(log* n)'],
      1,
      'Path compression combined with union by rank guarantees nearly constant O(α(n)) amortized operations.',
      'Advanced',
    ),
    question(
      'Why is Floyd-Warshall preferred over Dijkstra for finding all-pairs shortest paths on dense graphs with negative edge weights (and no negative cycles)?',
      ['Floyd-Warshall runs in O(V²) time.', 'Dijkstra fails on graphs with negative edge weights, whereas Floyd-Warshall computes all pairs in O(V³) via dynamic programming.', 'Floyd-Warshall uses greedy choice properties.', 'Dijkstra requires acyclic directed graphs.'],
      1,
      'Dijkstra\'s greedy assumption fails when edge weights are negative; Floyd-Warshall handles negative edges correctly in O(V³).',
      'Advanced',
    ),
    question(
      'What is the space complexity of an iterative implementation of Depth First Search (DFS) on a graph with V vertices and maximum branching factor b, when exploring up to depth d?',
      ['O(b · d)', 'O(bᵈ)', 'O(V²)', 'O(1)'],
      0,
      'DFS maintains only the current path and unexplored siblings at each level on its explicit stack, requiring O(b · d) space.',
      'Advanced',
    ),
  ],

  'web-development': [
    // Beginner
    question(
      'Which HTML tag is used to create a clickable hyperlink?',
      ['<link>', '<a>', '<href>', '<navigate>'],
      1,
      'The `<a>` (anchor) tag with the `href` attribute creates hyperlinks.',
      'Beginner',
    ),
    question(
      'What does CSS stand for?',
      ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Styling Syntax', 'Control Sheet Standards'],
      1,
      'CSS stands for Cascading Style Sheets.',
      'Beginner',
    ),
    question(
      'Which keyword declares a block-scoped reassignable variable in modern JavaScript?',
      ['var', 'let', 'const', 'global'],
      1,
      '`let` declares block-scoped variables that can be reassigned.',
      'Beginner',
    ),

    // Intermediate
    question(
      'What is event delegation in the browser Document Object Model (DOM)?',
      ['Attaching an individual listener to every child element', 'Leveraging event bubbling by attaching a single listener to a parent element to handle events triggered by descendants', 'Preventing events from propagating to the window object', 'Dispatching custom synthetic events asynchronously'],
      1,
      'Event delegation attaches a listener on an ancestor, capturing events as they bubble up from child elements.',
      'Intermediate',
    ),
    question(
      'In CSS Grid, what does `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));` achieve?',
      ['Creates exactly 3 columns of 200px width', 'Creates a responsive layout where columns dynamically fit available space, wrapping when items cannot maintain 200px', 'Limits the grid to 200px maximum width', 'Disables grid auto-placement'],
      1,
      '`auto-fit` combined with `minmax` builds a responsive multi-column grid without explicit media queries.',
      'Intermediate',
    ),
    question(
      'What happens when `Promise.all([p1, p2, p3])` encounters a rejection in `p2` while `p1` and `p3` are still pending?',
      ['It waits for all promises to settle before reporting the error.', 'It immediately rejects with the reason of p2 (fail-fast behavior).', 'It returns the resolved values of p1 and p3, ignoring p2.', 'It re-runs p2 automatically.'],
      1,
      '`Promise.all` fails fast: the returned promise immediately rejects upon the first rejection.',
      'Intermediate',
    ),

    // Advanced
    question(
      'How does the browser Event Loop coordinate the execution of Microtasks (e.g. `Promise.then`, `queueMicrotask`) and Macrotasks (e.g. `setTimeout`, `setInterval`)?',
      ['Macrotasks run before microtasks in every cycle.', 'The microtask queue is completely drained after each macrotask and before rendering.', 'Microtasks and macrotasks run concurrently in web workers.', 'Microtasks are executed once per animation frame only.'],
      1,
      'Between task steps, the engine processes all queued microtasks until the microtask queue is empty before proceeding to rendering or the next macrotask.',
      'Advanced',
    ),
    question(
      'What security protection does the `SameSite=Strict` cookie attribute provide for web applications?',
      ['Encrypts cookie content using AES-256', 'Ensures the cookie is never sent in cross-site requests, mitigating Cross-Site Request Forgery (CSRF)', 'Prevents JavaScript from reading the cookie via `document.cookie`', 'Restricts the cookie exclusively to HTTPS protocols'],
      1,
      '`SameSite=Strict` prevents the browser from sending the cookie with any cross-site request (including top-level navigations), preventing CSRF.',
      'Advanced',
    ),
  ],

  'operating-systems': [
    // Beginner
    question(
      'What is the primary core component of an operating system that manages hardware resources directly?',
      ['Shell', 'Kernel', 'Compiler', 'Bootloader'],
      1,
      'The kernel is the foundational core of an OS, controlling CPU, memory, and devices.',
      'Beginner',
    ),
    question(
      'Which process state indicates that a process is loaded in memory and waiting for CPU allocation?',
      ['Terminated', 'Blocked', 'Ready', 'Zombie'],
      2,
      'A process in the `Ready` state has all needed resources and waits for CPU execution time.',
      'Beginner',
    ),
    question(
      'What is the main function of the operating system\'s File Allocation Table or Inode table?',
      ['Compiling user code', 'Mapping file names and metadata to physical storage blocks', 'Managing RAM paging', 'Encrypting network packets'],
      1,
      'File system metadata structures map file identifiers and attributes to underlying storage blocks.',
      'Beginner',
    ),

    // Intermediate
    question(
      'What is the purpose of the Translation Lookaside Buffer (TLB) in CPU memory management?',
      ['Store instructions before decoding', 'Cache virtual-to-physical address translations to speed up memory access', 'Hold dirty pages before writing to disk', 'Synchronize cache lines across processor sockets'],
      1,
      'The TLB is an associative hardware cache that stores recent page-table translations to avoid multi-level page table traversals.',
      'Intermediate',
    ),
    question(
      'Which scheduling algorithm is provably optimal in minimizing average waiting time for a set of stationary processes?',
      ['First-Come, First-Served (FCFS)', 'Round Robin (RR)', 'Shortest Job First (SJF)', 'Priority Scheduling without preemption'],
      2,
      'Shortest Job First (SJF) is mathematically optimal for minimizing average process waiting time.',
      'Intermediate',
    ),
    question(
      'What occurs during a CPU trap (software interrupt)?',
      ['The operating system crashes and reboots.', 'The processor switches from user mode to kernel mode and transfers control to a predefined interrupt handler routine.', 'Hardware power is cut to idle peripherals.', 'The ready queue is cleared.'],
      1,
      'A trap switches privilege mode to supervisor/kernel mode and jumps to the handler defined in the interrupt vector.',
      'Intermediate',
    ),

    // Advanced
    question(
      'In the context of the Banker\'s Algorithm for deadlock avoidance, what defines a "Safe State"?',
      ['A state where no process holds any system resource', 'A state where there exists at least one allocation sequence that allows every process to complete without deadlocking', 'A state where all resources are currently free', 'A state where preemption is disabled'],
      1,
      'A system is safe if there exists a safe sequence <P1, P2, ... Pn> such that each process can satisfy its maximum claim with available resources plus those held by prior processes.',
      'Advanced',
    ),
    question(
      'What is the ABA problem in lock-free concurrent programming utilizing Compare-And-Swap (CAS)?',
      ['A memory leak caused by circular references', 'A thread observes a value A, another changes it to B and back to A, causing the CAS to succeed erroneously despite intermediate state changes', 'A priority inversion in real-time kernels', 'A deadlock involving three threads'],
      1,
      'The ABA problem occurs when a memory location changes from A to B and back to A, fooling a naive CAS into assuming no modifications occurred.',
      'Advanced',
    ),
  ],

  'computer-networks': [
    // Beginner
    question(
      'What is the standard port number for secure HTTPS web traffic?',
      ['80', '443', '22', '8080'],
      1,
      'HTTPS operates over TCP port 443 by default.',
      'Beginner',
    ),
    question(
      'Which layer of the OSI model is responsible for end-to-end packet routing across intermediate routers?',
      ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
      1,
      'The Network Layer (Layer 3) handles logical IP addressing and packet routing across networks.',
      'Beginner',
    ),
    question(
      'What does IP stand for in the context of computer networking?',
      ['Internal Protocol', 'Internet Protocol', 'Interface Process', 'Interconnected Packet'],
      1,
      'IP stands for Internet Protocol.',
      'Beginner',
    ),

    // Intermediate
    question(
      'How does the TCP three-way handshake establish a connection between client and server?',
      ['SYN -> SYN-ACK -> ACK', 'ACK -> SYN -> SYN-ACK', 'FIN -> ACK -> FIN-ACK', 'PING -> PONG -> ACK'],
      0,
      'TCP establishes a reliable connection through the sequence: client sends SYN, server responds with SYN-ACK, client returns ACK.',
      'Intermediate',
    ),
    question(
      'What is the usable host address range for the IPv4 subnet 192.168.10.0/26?',
      ['192.168.10.1 to 192.168.10.62', '192.168.10.0 to 192.168.10.63', '192.168.10.1 to 192.168.10.126', '192.168.10.1 to 192.168.10.254'],
      0,
      'A /26 subnet has 2⁶ = 64 addresses. Network address is .0, broadcast is .63, giving usable host range .1 through .62.',
      'Intermediate',
    ),
    question(
      'What protocol maps an known IP address to a physical MAC address on a local Ethernet segment?',
      ['DNS', 'DHCP', 'ARP', 'ICMP'],
      2,
      'ARP (Address Resolution Protocol) resolves IPv4 addresses to local link-layer (MAC) addresses.',
      'Intermediate',
    ),

    // Advanced
    question(
      'How does TCP BBR (Bottleneck Bandwidth and RTT) congestion control differ from loss-based algorithms like TCP Reno or Cubic?',
      ['BBR treats packet loss as the primary signal of congestion and halves the window immediately.', 'BBR builds an explicit model of the network path using maximum delivery rate and minimum round-trip time, operating without intentionally filling buffers.', 'BBR requires UDP transport.', 'BBR disables acknowledgments.'],
      1,
      'BBR probes maximum bandwidth and minimum RTT to avoid bufferbloat, unlike loss-based protocols that increase window size until packet drops occur.',
      'Advanced',
    ),
    question(
      'In Border Gateway Protocol (BGP), what mechanism prevents routing loops across Autonomous Systems (AS)?',
      ['Split Horizon', 'Poison Reverse', 'Examining the AS_PATH attribute and discarding routes containing the local AS number', 'Distance Vector hop counts limited to 15'],
      2,
      'BGP routers inspect the AS_PATH attribute; if their own Autonomous System number is present, the advertisement is dropped to prevent loops.',
      'Advanced',
    ),
  ],

  'artificial-intelligence-machine-learning': [
    // Beginner (44 questions in expanded bank + 6 in catalogue = 50 total)
    question(
      "What type of machine learning involves training a model on input features paired with ground-truth target labels?",
      [
        "Unsupervised Learning",
        "Supervised Learning",
        "Reinforcement Learning",
        "Self-Supervised Learning"
      ],
      1,
      "Supervised learning trains models on labeled input-output pairs.",
      "Beginner",
    ),
    question(
      "In classification metrics, what does \"accuracy\" represent?",
      [
        "True positives divided by all positive predictions",
        "The ratio of correctly classified predictions to total predictions",
        "The rate of false negatives",
        "The area under the ROC curve"
      ],
      1,
      "Accuracy = (TP + TN) / (Total predictions).",
      "Beginner",
    ),
    question(
      "Which algorithm is commonly used for partitioning unlabeled data into K distinct clusters?",
      [
        "K-Means",
        "K-Nearest Neighbors",
        "Linear Regression",
        "Decision Tree"
      ],
      0,
      "K-Means is an unsupervised clustering algorithm that groups data points into K clusters based on centroid proximity.",
      "Beginner",
    ),
    question(
      "Which scaling technique rescales numerical feature values to fall within a fixed range between 0 and 1?",
      [
        "Min-Max Normalization",
        "Z-score Standardization",
        "Log Transformation",
        "Binarization"
      ],
      0,
      "Min-Max Normalization calculates (x - min) / (max - min), scaling all values into [0, 1].",
      "Beginner",
    ),
    question(
      "In regression tasks, how is the Mean Squared Error (MSE) calculated?",
      [
        "The average of the absolute differences between predictions and actual values",
        "The average of the squared differences between predictions and actual values",
        "The square root of the maximum prediction error",
        "The proportion of variance explained by the model"
      ],
      1,
      "MSE computes the mean of the squared residuals: (1/n) * Σ(y_true - y_pred)²",
      "Beginner",
    ),
    question(
      "Why is Mean Absolute Error (MAE) often considered more robust to extreme outliers than Mean Squared Error (MSE)?",
      [
        "MAE squares large errors, dampening their effect",
        "MAE weighs all individual errors linearly rather than squaring them",
        "MAE only evaluates the top 50% of predictions",
        "MAE converts continuous variables into discrete bins"
      ],
      1,
      "MSE squares the differences, disproportionately penalizing large outliers, whereas MAE treats deviations linearly.",
      "Beginner",
    ),
    question(
      "What distinguishes binary classification from multi-class classification?",
      [
        "Binary classification predicts one of two possible outcomes, while multi-class predicts one of three or more outcomes",
        "Binary classification only accepts binary feature inputs",
        "Binary classification requires neural networks while multi-class uses linear regression",
        "Binary classification produces continuous real-valued outputs"
      ],
      0,
      "Binary classification involves choosing between two mutually exclusive target classes (e.g. Yes/No).",
      "Beginner",
    ),
    question(
      "In supervised learning with tabular data, what is a \"feature\"?",
      [
        "An individual measurable property or input variable used to make predictions",
        "The final ground-truth outcome being predicted",
        "The error metric of the trained algorithm",
        "The random seed used to initialize training"
      ],
      0,
      "A feature is an explanatory or independent input variable (column in a tabular dataset).",
      "Beginner",
    ),
    question(
      "In supervised machine learning terminology, what is a \"target label\"?",
      [
        "A configuration setting chosen before training begins",
        "The ground-truth answer or outcome value assigned to a training sample",
        "The unique database primary key of a row",
        "The execution time of a training run"
      ],
      1,
      "A target label is the dependent variable (y) that the model is trained to predict.",
      "Beginner",
    ),
    question(
      "What is the primary motivation for partitioning a dataset into training and testing subsets?",
      [
        "To increase the total number of samples",
        "To evaluate how well the trained model generalizes to unseen data",
        "To speed up floating point arithmetic in the CPU",
        "To automatically remove missing values from the dataset"
      ],
      1,
      "Evaluating on a separate test set measures performance on unseen data, detecting overfitting.",
      "Beginner",
    ),
    question(
      "What does one \"epoch\" represent during the training of an iterative machine learning model?",
      [
        "One complete forward and backward pass of the entire training dataset through the model",
        "Processing a single training sample",
        "The convergence of the loss function to zero",
        "One minute of GPU computation time"
      ],
      0,
      "An epoch represents one complete cycle through all training examples in the training set.",
      "Beginner",
    ),
    question(
      "What is the \"batch size\" in mini-batch gradient descent?",
      [
        "The number of layers in the neural network",
        "The number of training samples processed in one forward and backward update step",
        "The total number of parameters in the model",
        "The number of epochs completed per second"
      ],
      1,
      "Batch size denotes the number of training examples evaluated before updating model weights.",
      "Beginner",
    ),
    question(
      "What role does the \"learning rate\" hyperparameter play in gradient descent optimization?",
      [
        "It sets the maximum number of layers in the model",
        "It controls the step size taken along the gradient toward the loss minimum",
        "It determines the proportion of data allocated to the test set",
        "It defines the random seed for reproducible sampling"
      ],
      1,
      "The learning rate scales the gradient step; too large can cause divergence, while too small causes slow convergence.",
      "Beginner",
    ),
    question(
      "What condition describes \"underfitting\" in machine learning?",
      [
        "A model performs exceptionally well on training data but poorly on test data",
        "A model is too simple to capture underlying patterns, performing poorly on both training and test data",
        "A model has too many parameters relative to the dataset size",
        "A model reaches zero training loss in the first epoch"
      ],
      1,
      "Underfitting occurs when high bias prevents a model from capturing the data structure, yielding poor accuracy everywhere.",
      "Beginner",
    ),
    question(
      "In a Decision Tree, what is the topmost node that has no incoming edges called?",
      [
        "Leaf node",
        "Root node",
        "Internal node",
        "Terminal node"
      ],
      1,
      "The root node is the topmost decision point from which all subsequent splits descend.",
      "Beginner",
    ),
    question(
      "In a Decision Tree classifier, what is a \"leaf node\"?",
      [
        "The first split evaluated in the tree",
        "A node that performs feature normalization",
        "A terminal node that specifies a final class prediction or value",
        "A node containing unpartitioned training data"
      ],
      2,
      "Leaf nodes (terminal nodes) have no child splits and represent final predictions.",
      "Beginner",
    ),
    question(
      "What mathematical function does standard Logistic Regression use to map linear combinations of features to probabilities between 0 and 1?",
      [
        "Rectified Linear Unit (ReLU)",
        "Sigmoid (logistic) function",
        "Identity function",
        "Hyperbolic tangent (tanh)"
      ],
      1,
      "The sigmoid function σ(z) = 1 / (1 + e⁻ᶻ) squashes any real value into the range [0, 1].",
      "Beginner",
    ),
    question(
      "In a binary classification confusion matrix, what does a \"False Positive\" represent?",
      [
        "An actual positive instance correctly predicted as positive",
        "An actual negative instance incorrectly predicted as positive",
        "An actual positive instance incorrectly predicted as negative",
        "An actual negative instance correctly predicted as negative"
      ],
      1,
      "A False Positive (Type I error) occurs when the model predicts positive for an actually negative instance.",
      "Beginner",
    ),
    question(
      "In binary classification evaluation, what is the F1-Score?",
      [
        "The arithmetic mean of precision and recall",
        "The harmonic mean of precision and recall",
        "The difference between accuracy and error rate",
        "The ratio of true positives to true negatives"
      ],
      1,
      "F1 = 2 * (Precision * Recall) / (Precision + Recall), which is the harmonic mean.",
      "Beginner",
    ),
    question(
      "In reinforcement learning, what is the role of the \"agent\"?",
      [
        "The external world that generates states and rewards",
        "The learning entity that observes the environment and takes actions",
        "The fixed dataset used for offline validation",
        "The loss function used to calculate gradients"
      ],
      1,
      "The agent is the decision maker that observes state representations and interacts through actions.",
      "Beginner",
    ),
    question(
      "Which encoding scheme converts a categorical feature with K unordered categories into K binary indicator columns?",
      [
        "One-Hot Encoding",
        "Ordinal Encoding",
        "Min-Max Scaling",
        "Principal Component Analysis"
      ],
      0,
      "One-hot encoding creates a binary column for each category, where exactly one bit is 1 and the rest are 0.",
      "Beginner",
    ),
    question(
      "When is Ordinal Encoding preferred over One-Hot Encoding for categorical variables?",
      [
        "When the categories possess a natural, meaningful rank or ordering (e.g. Low, Medium, High)",
        "When the categories are completely nominal without any order (e.g. Country of residence)",
        "When the feature contains missing values",
        "When the dataset has fewer than 10 total rows"
      ],
      0,
      "Ordinal encoding maps categories to integers preserving their intrinsic ranking (e.g. 1, 2, 3).",
      "Beginner",
    ),
    question(
      "What are the core components of an artificial neuron in a feedforward neural network?",
      [
        "Inputs, weights, bias term, and an activation function",
        "Database connection, compiler, and query parser",
        "Decision tree, random forest, and ensemble vote",
        "Clustering centroid, distance metric, and silhouette score"
      ],
      0,
      "A neuron computes a weighted sum of inputs plus bias, z = Σ(w_i * x_i) + b, and applies an activation function.",
      "Beginner",
    ),
    question(
      "What was the historical Frank Rosenblatt \"Perceptron\" designed to perform?",
      [
        "Linear binary classification of inputs based on a step activation function",
        "Deep image synthesis using generative adversarial networks",
        "Continuous language translation using attention mechanisms",
        "Multi-agent reinforcement learning in continuous action spaces"
      ],
      0,
      "The Rosenblatt Perceptron is a fundamental single-layer algorithm for linear binary classification.",
      "Beginner",
    ),
    question(
      "Which task is an example of unsupervised machine learning?",
      [
        "Predicting house sale prices based on square footage and location",
        "Grouping e-commerce customers into clusters based on purchasing behavior without prior labels",
        "Classifying emails as spam or not spam using labeled examples",
        "Diagnosing medical images using radiologist-verified annotations"
      ],
      1,
      "Customer clustering groups unlabeled data points by behavioral similarity, a classic unsupervised task.",
      "Beginner",
    ),
    question(
      "What formula calculates the standard Euclidean distance between two 2D points (x₁, y₁) and (x₂, y₂)?",
      [
        "√((x₂ - x₁)² + (y₂ - y₁)²) ",
        "|x₂ - x₁| + |y₂ - y₁|",
        "max(|x₂ - x₁|, |y₂ - y₁|)",
        "(x₂ - x₁)² - (y₂ - y₁)² "
      ],
      0,
      "Euclidean distance is the straight-line distance given by the Pythagorean formula: √((x₂ - x₁)² + (y₂ - y₁)²).",
      "Beginner",
    ),
    question(
      "What is an \"imbalanced dataset\" in classification?",
      [
        "A dataset where some input features contain missing values",
        "A dataset where one target class has significantly more samples than another class",
        "A dataset where numerical features are measured in different units",
        "A dataset where training and test subsets have unequal row counts"
      ],
      1,
      "Class imbalance occurs when one class (e.g. fraud at 0.1%) is vastly outnumbered by another class.",
      "Beginner",
    ),
    question(
      "What is the purpose of establishing a \"baseline model\" (such as a dummy classifier) early in a project?",
      [
        "To provide a simple performance benchmark that any sophisticated model must outperform",
        "To automatically hyperparameter-tune future models",
        "To clean and preprocess the raw data files",
        "To verify that the computer has an active internet connection"
      ],
      0,
      "A baseline (e.g. always predicting majority class) provides a minimum benchmark for evaluating meaningful models.",
      "Beginner",
    ),
    question(
      "Why does a high statistical correlation between two features not necessarily prove a causal link?",
      [
        "Correlation measures linear association, but third confounding variables or coincidence can drive the relationship",
        "Correlation coefficients can only take values between 0 and 1",
        "Correlation requires neural networks to be calculated properly",
        "Correlation is only defined for categorical text data"
      ],
      0,
      "Correlation indicates that two variables move together, but cannot determine whether one causes the other.",
      "Beginner",
    ),
    question(
      "What is the distinction between a \"parameter\" and a \"hyperparameter\" in machine learning?",
      [
        "Parameters are learned from data during training (e.g. weights); hyperparameters are configured before training (e.g. learning rate)",
        "Hyperparameters are learned automatically by the optimizer; parameters are set manually by the engineer",
        "Parameters only apply to neural networks; hyperparameters only apply to decision trees",
        "There is no difference; the terms are completely interchangeable"
      ],
      0,
      "Parameters (weights, biases) are fitted by the training algorithm; hyperparameters (learning rate, tree depth) are set beforehand.",
      "Beginner",
    ),
    question(
      "What is the primary role of a \"loss function\" (or cost function) in machine learning?",
      [
        "To quantify how far the model's predictions deviate from the true target values",
        "To measure how much electrical power the training hardware consumes",
        "To compress the model weights for mobile deployment",
        "To encrypt personal data before saving to disk"
      ],
      0,
      "A loss function measures the discrepancy between predicted and actual values, guiding optimization.",
      "Beginner",
    ),
    question(
      "What is \"data leakage\" during feature preprocessing?",
      [
        "Information from outside the training dataset (such as the test set) inappropriately influencing model training",
        "Losing database records due to hardware failure",
        "Exporting model predictions into an unprotected CSV file",
        "Converting 64-bit floating point numbers to 32-bit floats"
      ],
      0,
      "Data leakage occurs when test information is inadvertently used during preprocessing/training, inflating test scores.",
      "Beginner",
    ),
    question(
      "How do extreme outliers typically affect the sample mean compared to the sample median?",
      [
        "The mean is significantly pulled toward the outliers, while the median remains stable",
        "The median is heavily distorted, while the mean is unaffected",
        "Both mean and median change by the exact same amount",
        "Neither mean nor median can be computed when outliers exist"
      ],
      0,
      "The mean incorporates every value, making it sensitive to extremes, whereas the median relies on rank order.",
      "Beginner",
    ),
    question(
      "What distinguishes the output of a regression model from a classification model?",
      [
        "Regression outputs continuous numeric values, while classification outputs discrete category labels",
        "Regression outputs boolean True/False values only",
        "Classification outputs floating-point probabilities between -100 and +100",
        "Regression requires labeled images, while classification requires text"
      ],
      0,
      "Regression predicts quantitative continuous amounts; classification assigns inputs to distinct categories.",
      "Beginner",
    ),
    question(
      "If a model achieves 99.9% training accuracy but only 55% testing accuracy, what is the most likely problem?",
      [
        "Underfitting",
        "Severe Overfitting",
        "Data corruption during printing",
        "The learning rate was too small"
      ],
      1,
      "A massive gap between near-perfect training performance and mediocre test performance is the hallmark of overfitting.",
      "Beginner",
    ),
    question(
      "In reinforcement learning, what is the classic \"exploration vs. exploitation\" dilemma?",
      [
        "Choosing between trying new unfamiliar actions to discover rewards versus choosing known actions that yield high rewards",
        "Choosing whether to train on a CPU or a GPU",
        "Balancing the size of the training set against the size of the test set",
        "Deciding whether to use Python or C++ for implementation"
      ],
      0,
      "An agent must balance exploiting known profitable policies against exploring unknown actions to find better strategies.",
      "Beginner",
    ),
    question(
      "In Natural Language Processing (NLP), what is \"tokenization\"?",
      [
        "Breaking a stream of text into individual units such as words, subwords, or characters",
        "Translating text from one spoken language to another",
        "Encrypting text using a public key cipher",
        "Detecting grammar errors in a paragraph"
      ],
      0,
      "Tokenization segments continuous text into discrete atomic tokens for algorithmic processing.",
      "Beginner",
    ),
    question(
      "In text preprocessing, what are \"stop words\"?",
      [
        "Common words (such as \"the\", \"is\", \"at\") often filtered out because they carry little unique semantic meaning",
        "Words that cause an uncaught syntax error in the code",
        "Words containing punctuation marks",
        "Reserved keywords in the Python programming language"
      ],
      0,
      "Stop words are highly frequent words typically removed during classic text analysis to focus on informative terms.",
      "Beginner",
    ),
    question(
      "What is the \"Bag of Words\" (BoW) text representation model?",
      [
        "A model that represents text as an unordered collection of words, tracking word occurrence counts while ignoring grammar and word order",
        "A deep recurrent neural network that memorizes sentences verbatim",
        "A dictionary mapping words to their rhyming counterparts",
        "A compression algorithm that removes vowels from words"
      ],
      0,
      "Bag of Words represents documents as token count histograms, disregarding sentence grammar and sequential word order.",
      "Beginner",
    ),
    question(
      "How is a grayscale digital image typically represented numerically in machine learning?",
      [
        "As a 2D matrix of pixel intensity values, often ranging from 0 to 255",
        "As a linked list of text strings",
        "As an audio frequency waveform",
        "As a single floating-point scalar"
      ],
      0,
      "Grayscale images are represented as height × width 2D arrays where each number reflects brightness/intensity.",
      "Beginner",
    ),
    question(
      "Why is setting a \"random seed\" (e.g. `random_state=42`) standard practice in machine learning experiments?",
      [
        "It ensures reproducibility by producing the exact same pseudo-random splits and initializations across runs",
        "It speeds up model convergence by 42%",
        "It prevents the model from overfitting on test data",
        "It automatically normalizes all input features"
      ],
      0,
      "Setting a random seed ensures pseudorandom operations yield identical results across repeated executions.",
      "Beginner",
    ),
    question(
      "What behavior on a validation loss curve indicates that a deep neural network has started overfitting?",
      [
        "Training loss continues to decrease while validation loss begins to increase",
        "Both training loss and validation loss decrease steadily together",
        "Both training loss and validation loss immediately jump to infinity",
        "Validation loss becomes strictly negative"
      ],
      0,
      "When training loss improves but validation loss begins rising, the network is memorizing training artifacts.",
      "Beginner",
    ),
    question(
      "What defining characteristic distinguishes \"Deep Learning\" from traditional classical machine learning?",
      [
        "The use of multi-layered neural networks that automatically learn hierarchical feature representations from raw data",
        "The requirement that all data must be stored in relational SQL databases",
        "The inability to run on consumer graphics cards",
        "The reliance exclusively on hand-crafted rules without data"
      ],
      0,
      "Deep learning leverages architectures with multiple processing layers to learn representations with multiple levels of abstraction.",
      "Beginner",
    ),
    question(
      "Why do artificial neural networks require non-linear activation functions between layers?",
      [
        "Without non-linearities, multiple stacked linear layers collapse mathematically into a single equivalent linear transformation",
        "Non-linear functions reduce the memory size of weights by 50%",
        "Non-linear functions eliminate all negative numbers in input datasets",
        "Non-linear functions prevent the loss function from being calculated"
      ],
      0,
      "Composition of linear operations is itself linear; non-linear activations enable networks to approximate non-linear functions.",
      "Beginner",
    ),

    // Intermediate (43 questions in expanded bank + 7 in catalogue = 50 total)
    question(
      "What problem does the Bias-Variance tradeoff illustrate in predictive modeling?",
      [
        "Models with high bias underfit the data; models with high variance overfit the data and generalize poorly.",
        "High bias causes floating point overflow.",
        "Variance only applies to decision trees.",
        "Decreasing model complexity always increases variance."
      ],
      0,
      "Bias reflects erroneous assumptions/underfitting; variance reflects sensitivity to training set fluctuations/overfitting.",
      "Intermediate",
    ),
    question(
      "Why is the Rectified Linear Unit (ReLU) activation function preferred over Sigmoid in deep neural network hidden layers?",
      [
        "ReLU is bounded between 0 and 1.",
        "ReLU mitigates the vanishing gradient problem for positive inputs and is computationally efficient to differentiate.",
        "ReLU prevents all dead neurons.",
        "ReLU outputs negative values."
      ],
      1,
      "ReLU has a constant derivative of 1 for positive activations, reducing gradient saturation and vanishing gradients during backpropagation.",
      "Intermediate",
    ),
    question(
      "What is the purpose of cross-validation (e.g. 5-fold CV) in machine learning?",
      [
        "To speed up gradient descent",
        "To reliably estimate model generalization performance and detect overfitting across different data subsets",
        "To eliminate the need for hyperparameter tuning",
        "To generate synthetic training labels"
      ],
      1,
      "Cross-validation partitions data into training and validation folds to give a lower-variance estimate of generalization error.",
      "Intermediate",
    ),
    question(
      "In binary classification, what is the mathematical formulation of Binary Cross-Entropy (Log Loss) for true label y ∈ {0, 1} and predicted probability p?",
      [
        "-(y · log(p) + (1 - y) · log(1 - p))",
        "(y - p)²",
        "|y - p|",
        "max(0, 1 - y · p)"
      ],
      0,
      "Binary Cross-Entropy is defined as -[y log(p) + (1 - y) log(1 - p)], heavily penalizing confident wrong predictions.",
      "Intermediate",
    ),
    question(
      "Why does the vanishing gradient problem occur in deep neural networks when using the Sigmoid activation function?",
      [
        "The derivative of the sigmoid function reaches a maximum of only 0.25, causing gradients to diminish exponentially through chain-rule multiplications",
        "The sigmoid function produces strictly negative outputs for large inputs",
        "The sigmoid function requires discontinuous step computations",
        "The sigmoid function cannot be differentiated anywhere"
      ],
      0,
      "Because σ'(z) = σ(z)(1 - σ(z)) ≤ 0.25, backpropagating through many layers shrinks gradients toward zero.",
      "Intermediate",
    ),
    question(
      "How does Dropout regularization operate differently during training versus inference?",
      [
        "During training, randomly selected units are deactivated with probability p; during inference, all units remain active with outputs scaled by (1 - p)",
        "Dropout is applied only during inference to randomize predictions",
        "Dropout permanently prunes weights from the network graph after epoch 1",
        "Dropout converts floating-point weights into 8-bit integers during training"
      ],
      0,
      "Dropout randomly zeroes neuron activations during training to prevent co-adaptation, keeping all neurons active (scaled) at test time.",
      "Intermediate",
    ),
    question(
      "In model training, what does the \"patience\" parameter specify in Early Stopping?",
      [
        "The number of epochs to wait for validation metric improvement before terminating training",
        "The timeout in seconds before canceling a long-running SQL query",
        "The total number of GPU cores assigned to gradient accumulation",
        "The maximum allowable learning rate decay step"
      ],
      0,
      "Patience defines how many epochs without validation improvement are allowed before early stopping triggers.",
      "Intermediate",
    ),
    question(
      "What metrics are plotted against each other on a Receiver Operating Characteristic (ROC) curve?",
      [
        "True Positive Rate (Sensitivity) on the y-axis versus False Positive Rate (1 - Specificity) on the x-axis across classification thresholds",
        "Precision on the y-axis versus Recall on the x-axis",
        "Training loss on the y-axis versus validation loss on the x-axis",
        "Accuracy on the y-axis versus epoch number on the x-axis"
      ],
      0,
      "The ROC curve displays TPR against FPR across all possible discrimination thresholds.",
      "Intermediate",
    ),
    question(
      "What does the Area Under the ROC Curve (AUC-ROC) quantify probabilistically?",
      [
        "The probability that a randomly chosen positive instance receives a higher score than a randomly chosen negative instance",
        "The overall classification accuracy on the training dataset",
        "The fraction of true positives among all positive predictions",
        "The speed in milliseconds required to score 1,000 samples"
      ],
      0,
      "AUC equals the probability that the classifier will rank a randomly chosen positive example higher than a randomly chosen negative one.",
      "Intermediate",
    ),
    question(
      "Why is the Precision-Recall (PR) curve typically preferred over the ROC curve when evaluating models on highly imbalanced datasets (e.g. rare disease detection)?",
      [
        "The ROC curve can present an overly optimistic assessment because a huge number of True Negatives keeps the False Positive Rate deceptively low",
        "PR curves can only be plotted for regression problems",
        "The ROC curve requires identical numbers of training and testing samples",
        "PR curves do not require computing true positives"
      ],
      0,
      "A huge True Negative count inflates FPR in ROC; PR curves focus directly on positive class precision and recall without being distorted by large TNs.",
      "Intermediate",
    ),
    question(
      "In medical diagnostic screening, which type of error is typically considered more dangerous when screening for a life-threatening illness?",
      [
        "False Negative (Type II error), failing to detect a present illness and denying timely treatment",
        "False Positive (Type I error), leading to unnecessary follow-up confirmatory testing",
        "Both errors carry identical clinical consequences in all situations",
        "Neither error matters if overall accuracy exceeds 90%"
      ],
      0,
      "A False Negative leaves a diseased patient untreated, which is often far more perilous than a false alarm requiring a confirmatory test.",
      "Intermediate",
    ),
    question(
      "What is the primary benefit of Stratified K-Fold cross-validation compared to standard random K-Fold cross-validation?",
      [
        "It preserves the percentage of samples for each class in every fold, preventing fold representation skew",
        "It executes K times faster by skipping validation calculations",
        "It automatically scales continuous features using min-max scaling",
        "It removes duplicate rows across all folds"
      ],
      0,
      "Stratified K-Fold ensures every split contains approximately the same percentage of each target class as the complete dataset.",
      "Intermediate",
    ),
    question(
      "What introduces diversity among individual decision trees in a standard Random Forest ensemble?",
      [
        "Bootstrapped training subsets (bagging) and random feature subspace selection at each split candidate",
        "Assigning different learning rates to each tree in a sequence",
        "Training each tree on a different GPU architecture",
        "Using different loss functions for each individual tree"
      ],
      0,
      "Random Forests combine bootstrap sample aggregation with random feature subset consideration at each node split to decorrelate trees.",
      "Intermediate",
    ),
    question(
      "What is the theoretical principle by which Bagging (Bootstrap Aggregation) reduces model error?",
      [
        "Averaging the predictions of multiple high-variance, decorrelated models significantly reduces ensemble variance without increasing bias",
        "Bagging converts non-linear models into linear equations",
        "Bagging eliminates the need for a validation set",
        "Bagging forces all base estimators to achieve zero training error"
      ],
      0,
      "Averaging independent or weakly correlated unbiased estimators reduces prediction variance by a factor proportional to ensemble size.",
      "Intermediate",
    ),
    question(
      "How does Gradient Boosting build an ensemble of weak learners sequentially?",
      [
        "Each new base learner is trained to predict the negative gradient (pseudo-residuals) of the loss function with respect to current ensemble predictions",
        "Each new tree is trained independently on random subsets of classes",
        "All trees are trained simultaneously and their predictions are averaged",
        "New trees are only added when training accuracy reaches 100%"
      ],
      0,
      "Gradient boosting fits consecutive shallow estimators to the residual errors (loss gradients) of the accumulated ensemble.",
      "Intermediate",
    ),
    question(
      "How does the AdaBoost algorithm adjust sample weights between sequential boosting iterations?",
      [
        "It increases the weights of incorrectly classified training instances so subsequent weak learners focus on hard examples",
        "It sets all sample weights to random values at each step",
        "It discards all correctly classified instances completely",
        "It normalizes weights to always sum to zero"
      ],
      0,
      "AdaBoost upweights misclassified instances so that the next weak learner prioritizes correcting earlier errors.",
      "Intermediate",
    ),
    question(
      "In Support Vector Machines (SVM), what is the objective of the maximum margin hyperplane?",
      [
        "To maximize the geometric distance (margin) between the decision boundary and the closest data points (support vectors) of any class",
        "To minimize the number of input features used in the decision rule",
        "To pass through as many training points as possible",
        "To force all data points to have identical coordinates"
      ],
      0,
      "SVM seeks a separating hyperplane that maximizes the margin to support vectors, optimizing generalization bounds.",
      "Intermediate",
    ),
    question(
      "What does the \"Kernel Trick\" enable Support Vector Machines to do efficiently?",
      [
        "Compute dot products in a high-dimensional feature space using a kernel function in the original input space without explicitly mapping coordinates",
        "Bypass all matrix multiplication operations",
        "Convert non-convex optimization problems into discrete trees",
        "Train without any regularization parameter"
      ],
      0,
      "The kernel function k(x, z) = ⟨φ(x), φ(z)⟩ evaluates high-dimensional inner products directly without computing expensive coordinates φ(x).",
      "Intermediate",
    ),
    question(
      "In Principal Component Analysis (PCA), how are principal components defined mathematically?",
      [
        "Orthogonal linear combinations of original features that successively capture the maximum remaining variance in the dataset",
        "Random non-linear clusters that minimize the silhouette score",
        "Decision boundaries that separate binary classes with maximal margin",
        "Subset selections that eliminate categorical variables"
      ],
      0,
      "Principal components are mutually orthogonal axes corresponding to the eigenvectors of the covariance matrix, ordered by variance.",
      "Intermediate",
    ),
    question(
      "What do the eigenvalues of the data covariance matrix represent in Principal Component Analysis?",
      [
        "The magnitude of variance explained along each corresponding principal component eigenvector",
        "The prediction error rate of an SVM classifier",
        "The number of clusters in the dataset",
        "The learning rate multiplier for stochastic gradient descent"
      ],
      0,
      "Each eigenvalue λ_i is proportional to the variance of the data projected onto its corresponding eigenvector v_i.",
      "Intermediate",
    ),
    question(
      "What is the primary use case of t-Distributed Stochastic Neighbor Embedding (t-SNE)?",
      [
        "Non-linear dimensionality reduction specifically designed for visualizing high-dimensional datasets in 2D or 3D space",
        "Fast linear regression on millions of sparse features",
        "Real-time streaming classification on edge devices",
        "Training deep convolutional neural networks with fewer parameters"
      ],
      0,
      "t-SNE maps high-dimensional points into 2D or 3D while preserving local probabilistic neighborhoods for exploratory visualization.",
      "Intermediate",
    ),
    question(
      "In K-Means clustering, what is the \"Elbow Method\" used for?",
      [
        "Identifying a suitable number of clusters (K) by plotting within-cluster sum of squares (inertia) and locating the point of diminishing returns",
        "Determining the optimal batch size for neural network training",
        "Selecting the best regularization coefficient λ in Ridge regression",
        "Calculating the exact learning rate schedule"
      ],
      0,
      "The elbow method plots inertia vs. K; the \"elbow\" inflection point indicates where adding more clusters yields diminishing variance reductions.",
      "Intermediate",
    ),
    question(
      "Which feature distinguishes DBSCAN (Density-Based Spatial Clustering of Applications with Noise) from K-Means?",
      [
        "DBSCAN does not require specifying the number of clusters in advance and can discover arbitrarily shaped clusters while identifying outliers",
        "DBSCAN requires all clusters to be spherical Gaussian distributions",
        "DBSCAN only works on 1D continuous data",
        "DBSCAN assigns every single data point to a valid non-noise cluster"
      ],
      0,
      "DBSCAN identifies clusters based on dense connected regions, isolating low-density noise points without needing a preset K.",
      "Intermediate",
    ),
    question(
      "What is the mathematical purpose of the Softmax function in the final layer of a multi-class neural network classifier?",
      [
        "To normalize unconstrained real-valued logits into a valid probability distribution that sums to 1",
        "To introduce sparsity by setting all negative activations to exactly zero",
        "To clip gradients to prevent numerical overflow during backpropagation",
        "To invert the weight matrices for linear decoding"
      ],
      0,
      "Softmax computes exp(z_i) / Σ exp(z_j), turning unbounded logits into non-negative probabilities that sum to 1.",
      "Intermediate",
    ),
    question(
      "What is the output range of the Hyperbolic Tangent (tanh) activation function, and why is it often preferred over Sigmoid in hidden layers?",
      [
        "Range is (-1, 1); its outputs are zero-centered, which prevents directional bias in gradient updates",
        "Range is (0, 1); it guarantees all weights remain positive",
        "Range is [0, ∞); it completely eliminates all vanishing gradients",
        "Range is (-∞, ∞); it is identical to the linear identity function"
      ],
      0,
      "tanh produces zero-centered activations between -1 and +1, aiding convergence compared to strictly positive sigmoid outputs.",
      "Intermediate",
    ),
    question(
      "What problem does Leaky ReLU address that can affect standard ReLU activation functions?",
      [
        "The \"dying ReLU\" problem, where neurons stuck in negative input regions have zero gradient and can never recover",
        "Floating point overflow caused by unbounded positive activations",
        "Slow execution speed during forward passes on CPUs",
        "The inability to backpropagate through convolutional layers"
      ],
      0,
      "Leaky ReLU assigns a small positive slope (e.g. 0.01x) to negative inputs, ensuring a non-zero gradient flows through inactive neurons.",
      "Intermediate",
    ),
    question(
      "In Stochastic Gradient Descent optimization, how is Weight Decay mathematically related to L2 Regularization?",
      [
        "Under standard SGD, weight decay is mathematically equivalent to adding an L2 penalty term (λ/2)||w||² to the loss function",
        "Weight decay subtracts a constant integer from weights at every epoch",
        "Weight decay sets a random fraction of weights to zero",
        "Weight decay is only applicable to decision tree ensembles"
      ],
      0,
      "Subtracting a fraction of the weight w in SGD (w ← w - ηλw - η∇L) matches the gradient of an L2 penalty (λw).",
      "Intermediate",
    ),
    question(
      "How does Momentum accelerate gradient descent optimization in the presence of high curvature ravines?",
      [
        "By accumulating an exponentially decaying moving average of past gradients, dampening oscillations and accelerating in consistent directions",
        "By doubling the learning rate whenever the loss increases",
        "By evaluating all training samples on every iteration",
        "By randomly shuffling the feature columns"
      ],
      0,
      "Momentum adds a fraction of the previous update velocity, smoothing zigzag oscillations across narrow ravines.",
      "Intermediate",
    ),
    question(
      "What makes the Adam (Adaptive Moment Estimation) optimizer widely effective across varied deep learning tasks?",
      [
        "It computes individual adaptive learning rates for different parameters using estimates of both the first moment (mean) and second moment (uncentered variance) of the gradients",
        "It avoids calculating gradients by using genetic algorithms",
        "It guarantees finding the global minimum for any non-convex loss function",
        "It requires zero memory overhead compared to basic SGD"
      ],
      0,
      "Adam combines the principles of Momentum (first moment) and RMSProp (second moment), adapting step sizes per parameter.",
      "Intermediate",
    ),
    question(
      "What is the primary operational mechanism of Batch Normalization during deep network training?",
      [
        "It normalizes each layer's inputs across the current mini-batch to zero mean and unit variance, followed by learnable scale (γ) and shift (β) parameters",
        "It scales the training loss to prevent 16-bit underflow",
        "It normalizes the dataset once before training begins and never changes",
        "It ensures all weights in a layer have a determinant of 1"
      ],
      0,
      "BatchNorm standardizes activations across the mini-batch dimension, then scales and shifts them via learnable γ and β.",
      "Intermediate",
    ),
    question(
      "Why is Layer Normalization generally preferred over Batch Normalization in Transformer models and recurrent architectures?",
      [
        "It computes normalization statistics across the feature channel dimension per individual sample, remaining independent of mini-batch size and sequence length",
        "It requires half as many floating point operations as any other normalization",
        "It eliminates the need for activation functions",
        "It can only be used on static image data"
      ],
      0,
      "LayerNorm normalizes across the features of a single sample, making it invariant to batch size and well-suited for sequential tokens.",
      "Intermediate",
    ),
    question(
      "In Natural Language Processing, what does the \"Inverse Document Frequency\" (IDF) component in TF-IDF achieve?",
      [
        "It downweights terms that occur frequently across nearly all documents in the corpus, highlighting distinctive informative terms",
        "It counts the total number of sentences in a given document",
        "It reverses the order of words in each sentence",
        "It converts words into phonetic representations"
      ],
      0,
      "IDF = log(N / df), which penalizes ubiquitous terms (e.g. \"is\", \"and\") while rewarding terms concentrated in few documents.",
      "Intermediate",
    ),
    question(
      "What core concept underlies distributed word embedding algorithms such as Word2Vec (Skip-gram)?",
      [
        "The distributional hypothesis: words that appear in similar linguistic contexts have similar semantic representations in vector space",
        "Alphabetical character order determines coordinate position",
        "Dictionary definitions are parsed into symbolic logic trees",
        "Words are sorted by length and mapped to prime numbers"
      ],
      0,
      "Word2Vec operationalizes Harris's distributional hypothesis by predicting context words, mapping similar-meaning words near each other in vector space.",
      "Intermediate",
    ),
    question(
      "How is the Cosine Similarity between two non-zero embedding vectors A and B computed?",
      [
        "(A · B) / (||A|| · ||B||), measuring the cosine of the angle between them regardless of magnitude",
        "||A - B||, measuring the straight-line distance",
        "Σ |A_i - B_i|, measuring the Manhattan distance",
        "(A · B) / (||A|| + ||B||)"
      ],
      0,
      "Cosine similarity computes the dot product of two vectors divided by the product of their Euclidean lengths, evaluating directional alignment.",
      "Intermediate",
    ),
    question(
      "What spatial property makes Convolutional Neural Networks (CNNs) particularly well-suited for computer vision tasks?",
      [
        "Translation invariance and local connectivity achieved by sharing filter weights across all spatial patch locations",
        "Full point-to-point matrix multiplication across every image pixel simultaneously",
        "The ability to process video without sequential frames",
        "The complete elimination of backpropagation during training"
      ],
      0,
      "Shared convolution kernels detect features regardless of their spatial position in the visual field, drastically reducing parameter counts.",
      "Intermediate",
    ),
    question(
      "What is the role of a Max Pooling layer in a Convolutional Neural Network architecture?",
      [
        "Downsampling spatial feature dimensions by selecting the maximum activation in each window, conferring translation robustness and reducing parameters",
        "Increasing image resolution for super-resolution displays",
        "Normalizing pixel values between -1 and 1",
        "Generating adversarial attacks against rival networks"
      ],
      0,
      "Max pooling extracts the maximum value within pooling windows, shrinking spatial dimensions while preserving dominant activations.",
      "Intermediate",
    ),
    question(
      "Why do standard vanilla Recurrent Neural Networks (RNNs) struggle with long-range temporal dependencies?",
      [
        "Repeated matrix multiplications across time steps cause gradients to vanish or explode exponentially over long horizons",
        "RNNs can only process sequences of exactly length 5",
        "Hidden states cannot store continuous values",
        "Backpropagation cannot be applied to sequential architectures"
      ],
      0,
      "Backpropagation Through Time (BPTT) repeatedly multiplies transition matrices; eigenvalues ≠ 1 cause exponential decay or explosion.",
      "Intermediate",
    ),
    question(
      "Which gate in a Long Short-Term Memory (LSTM) unit determines what information is discarded from the cell state?",
      [
        "Forget gate",
        "Input gate",
        "Output gate",
        "Update gate"
      ],
      0,
      "The forget gate f_t = σ(W_f · [h_{t-1}, x_t] + b_f) computes a mask between 0 and 1 controlling which cell state memories to discard.",
      "Intermediate",
    ),
    question(
      "How does a Gated Recurrent Unit (GRU) differ structurally from a standard LSTM unit?",
      [
        "GRUs combine the cell state and hidden state, using only reset and update gates to reduce parameter count and computational complexity",
        "GRUs have four distinct gates instead of three",
        "GRUs do not support backpropagation through time",
        "GRUs cannot process text data"
      ],
      0,
      "GRUs streamline the LSTM design by merging the cell and hidden states and using two gates (reset and update).",
      "Intermediate",
    ),
    question(
      "How does the SMOTE (Synthetic Minority Over-sampling Technique) generate synthetic samples for imbalanced datasets?",
      [
        "By selecting minority instances, identifying their k-nearest minority neighbors, and synthesizing new points along the connecting line segments in feature space",
        "By duplicating exact copies of minority class samples with replacement",
        "By randomly flipping binary labels in the majority class",
        "By training a generative adversarial network to create high-resolution images"
      ],
      0,
      "SMOTE interpolates synthetic feature vectors along line segments connecting existing minority examples to their k-nearest minority neighbors.",
      "Intermediate",
    ),
    question(
      "What is the primary benefit of applying Data Augmentation (e.g. random cropping, horizontal flipping, color jitter) during image classification training?",
      [
        "It artificially expands dataset diversity with label-preserving variations, reducing overfitting and improving invariant feature learning",
        "It decreases the training time per epoch by half",
        "It eliminates the need for validation testing",
        "It compresses image storage size on disk"
      ],
      0,
      "Augmentations teach the model invariances (e.g. an object remains the same when flipped), boosting generalization.",
      "Intermediate",
    ),
    question(
      "In Transfer Learning, what is meant by \"fine-tuning\" a pre-trained convolutional backbone?",
      [
        "Unfreezing some or all layers of the pre-trained model and training them on the target dataset using a very small learning rate",
        "Deleting all weights and training from scratch with random initializations",
        "Converting the model into a decision tree ensemble",
        "Running the model exclusively on unannotated audio data"
      ],
      0,
      "Fine-tuning gently adapts previously learned feature representations to a new domain by updating pre-trained weights with a low learning rate.",
      "Intermediate",
    ),
    question(
      "What is the Hinge Loss function commonly used for in machine learning?",
      [
        "Training maximum-margin classifiers such as linear Support Vector Machines: L(y, f(x)) = max(0, 1 - y · f(x))",
        "Clustering unstructured audio files into groups",
        "Measuring reconstructed image quality in generative autoencoders",
        "Calculating word frequencies in document corpora"
      ],
      0,
      "Hinge loss penalizes predictions that do not exceed a positive margin of 1 from the decision boundary for labels y ∈ {-1, 1}.",
      "Intermediate",
    ),

    // Advanced (48 questions in expanded bank + 2 in catalogue = 50 total)
    question(
      "In Transformer architectures, what is the computational complexity of the standard scaled dot-product self-attention mechanism with respect to sequence length N?",
      [
        "O(N)",
        "O(N log N)",
        "O(N²)",
        "O(N³)"
      ],
      2,
      "Computing the attention matrix QKᵀ requires calculating pairwise dot products between all N tokens, yielding O(N²) time and memory complexity.",
      "Advanced",
    ),
    question(
      "What mathematically distinguishes L1 regularization (Lasso) from L2 regularization (Ridge)?",
      [
        "L1 penalizes the sum of squared weights; L2 penalizes the sum of absolute values.",
        "L1 adds an absolute weight penalty promoting sparse weight vectors (feature selection); L2 adds a squared penalty shrinking weights smoothly toward zero.",
        "L1 cannot be used in linear regression.",
        "L2 is computationally intractable."
      ],
      1,
      "L1 regularization has non-differentiable corners at zero, causing coefficients to zero out and producing sparse models; L2 shrinks weights without zeroing them.",
      "Advanced",
    ),
    question(
      "In the Scaled Dot-Product Attention mechanism Attention(Q, K, V) = softmax(QKᵀ / √d_k)V, why are the dot products scaled by 1 / √d_k?",
      [
        "For large values of d_k, dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients",
        "It converts the attention matrix into a symmetric positive definite matrix",
        "It projects the queries and keys into an imaginary frequency domain",
        "It forces all attention weights to be strictly integers"
      ],
      0,
      "Assuming independent zero-mean unit-variance components, the dot product has variance d_k; dividing by √d_k maintains unit variance and prevents softmax saturation.",
      "Advanced",
    ),
    question(
      "What architectural capability does Multi-Head Attention provide over single-head attention in Transformer models?",
      [
        "It allows the model to jointly attend to information from different representation subspaces at different positions simultaneously",
        "It eliminates the need for feed-forward layers entirely",
        "It reduces the overall computational complexity from O(N²) to O(N)",
        "It prevents the model from needing positional encodings"
      ],
      0,
      "Multi-head attention projects queries, keys, and values into h distinct lower-dimensional subspaces, capturing varied relational patterns.",
      "Advanced",
    ),
    question(
      "In deep ResNet architectures, how do residual connections (y = F(x) + x) mathematically resolve the degradation problem during backpropagation?",
      [
        "The gradient contains an additive term: ∂L/∂x = ∂L/∂y · (∂F/∂x + I), providing an unobstructed highway for gradient flow directly back to earlier layers",
        "They force all intermediate layer outputs to zero mean and unit variance",
        "They convert non-convex loss surfaces into convex quadratic forms",
        "They dynamically prune uninformative convolutional filters during training"
      ],
      0,
      "The identity shortcut ensures that even if ∂F/∂x is small, the identity matrix I allows the gradient ∂L/∂y to flow back without vanishing.",
      "Advanced",
    ),
    question(
      "What mathematical property characterizes Rotary Position Embeddings (RoPE) in modern large language models?",
      [
        "They encode relative position by rotating query and key representations in complex 2D planes, ensuring dot products depend only on relative token distance",
        "They learn static one-hot lookup vectors stored in an embedding table",
        "They compute absolute position using fixed sinusoidal frequencies added directly to word embeddings",
        "They dynamically permute the token order before computing self-attention"
      ],
      0,
      "RoPE applies an orthogonal rotation matrix to pairs of coordinates, making the inner product ⟨R_m q, R_n k⟩ a function of the relative displacement (m - n).",
      "Advanced",
    ),
    question(
      "In autoregressive decoder Transformers, why is causal attention masking applied to the attention matrix?",
      [
        "To set attention scores to -∞ for all positions j > i, preventing position i from attending to future tokens during training",
        "To prevent the network from attending to padding tokens at the beginning of a sequence",
        "To enforce sparsity and reduce matrix multiplication memory from O(N²) to O(1)",
        "To normalize attention probabilities across multi-gpu batches"
      ],
      0,
      "Causal masking zeros out (via softmax of -∞) attention from token i to any subsequent token j > i, preserving the autoregressive property.",
      "Advanced",
    ),
    question(
      "In autoregressive Transformer generation, what is the purpose of Key-Value (KV) Caching during token-by-token decoding?",
      [
        "Storing previously computed Key and Value tensor representations in memory so only the single new token needs to be projected at each decoding step",
        "Caching prompt tokens on client browsers to reduce network latency",
        "Compressing 16-bit floating point weights into 4-bit integers on disk",
        "Pre-computing all possible future sentences in advance"
      ],
      0,
      "KV-caching stores past Keys and Values, converting per-step generation complexity from O(t²) recomputation to O(t) attention.",
      "Advanced",
    ),
    question(
      "How does FlashAttention optimize the standard attention computation on modern GPU architectures?",
      [
        "By utilizing tiling and online softmax to compute exact attention in GPU SRAM, drastically reducing read/write memory bandwidth to slow High Bandwidth Memory (HBM)",
        "By replacing the exact softmax function with a linear Taylor series approximation",
        "By quantizing all query and key tensors to binary 1-bit values",
        "By pruning 90% of the attention matrix elements using top-k selection"
      ],
      0,
      "FlashAttention is an IO-aware exact attention algorithm that tiles inputs and computes online softmax without materializing intermediate N×N matrices in HBM.",
      "Advanced",
    ),
    question(
      "In standard Generative Adversarial Networks (GANs), why can training become unstable when the discriminator reaches near-optimal performance too quickly?",
      [
        "The Jensen-Shannon divergence saturates at log(2) when generator and real data distributions have disjoint supports, causing the generator gradient to vanish",
        "The discriminator weights undergo arithmetic underflow to zero",
        "The learning rate automatically scales to infinity",
        "The generator produces images with inverted color channels"
      ],
      0,
      "When supports are disjoint in high dimensions, JS divergence is constant log(2), providing no informative gradient to guide generator updates.",
      "Advanced",
    ),
    question(
      "What theoretical improvement does the Wasserstein GAN (WGAN) introduce using the Earth Mover's Distance?",
      [
        "It optimizes the Kantorovich-Rubinstein dual formulation under a 1-Lipschitz continuity constraint, yielding smooth, informative gradients everywhere",
        "It eliminates the need for a discriminator network entirely",
        "It guarantees that the generator converges in exactly one epoch",
        "It computes the exact analytical integral over the data distribution"
      ],
      0,
      "WGAN uses the Wasserstein-1 metric (Earth Mover's Distance), which is continuous and differentiable almost everywhere, eliminating vanishing gradients.",
      "Advanced",
    ),
    question(
      "In Variational Autoencoders (VAEs), how is the Evidence Lower Bound (ELBO) decomposed mathematically?",
      [
        "E_q[log p(x|z)] - D_KL(q(z|x) || p(z)), balancing reconstruction likelihood against KL divergence from the prior",
        "log p(x) + log q(z|x)",
        "E_p[log q(z|x)] · D_KL(p(x) || q(z))",
        "max(0, log p(x|z) - 1)"
      ],
      0,
      "ELBO decomposes into the expected log-likelihood of data reconstruction minus the KL divergence penalizing divergence from the prior distribution.",
      "Advanced",
    ),
    question(
      "Why is the Reparameterization Trick z = μ(x) + σ(x) ⊙ ϵ (where ϵ ~ N(0, I)) essential for training Variational Autoencoders?",
      [
        "It moves stochasticity into an independent parameter-free input ϵ, allowing gradients of the ELBO to be backpropagated through μ and σ with respect to encoder parameters",
        "It eliminates the need for an encoder network",
        "It enforces that all latent dimensions are strictly uncorrelated",
        "It converts continuous latent codes into discrete binary codes"
      ],
      0,
      "Sampling directly from N(μ, σ²) prevents gradient backpropagation; reparameterizing isolates randomness in ϵ so standard backpropagation applies.",
      "Advanced",
    ),
    question(
      "In Denoising Diffusion Probabilistic Models (DDPM), what is the objective of the neural network during training?",
      [
        "Predicting the specific Gaussian noise vector ϵ added to the latent state at time step t from noisy input x_t",
        "Predicting the original high-resolution image in a single unconditioned step",
        "Classifying which noise distribution was applied",
        "Maximizing the discriminator cross-entropy loss"
      ],
      0,
      "DDPM reparameterizes the variational bound to train a network ϵ_θ(x_t, t) predicting the noise ϵ added at time step t via mean squared error.",
      "Advanced",
    ),
    question(
      "What mathematical quantity does the score function represent in Score-Based Generative Modeling?",
      [
        "The gradient of the log probability density with respect to the input data: ∇_x log p(x)",
        "The classification accuracy of the model on the test dataset",
        "The ratio of generator parameters to discriminator parameters",
        "The determinant of the covariance matrix of the dataset"
      ],
      0,
      "The score is ∇_x log p(x), a vector field indicating the direction in data space along which density increases most rapidly.",
      "Advanced",
    ),
    question(
      "What is the Bellman Optimality Equation for the state-value function V*(s) in a Markov Decision Process (MDP)?",
      [
        "V*(s) = max_a [ R(s, a) + γ · Σ_{s'} P(s'|s, a) · V*(s') ]",
        "V*(s) = Σ_a π(a|s) · R(s, a)",
        "V*(s) = R(s) · γ^t",
        "V*(s) = min_a [ R(s, a) - γ · V*(s') ]"
      ],
      0,
      "The optimal value of state s equals the maximum expected immediate reward plus discounted optimal future value over all possible actions.",
      "Advanced",
    ),
    question(
      "What fundamentally distinguishes Q-Learning from SARSA in temporal-difference reinforcement learning?",
      [
        "Q-Learning is off-policy (evaluates max_a' Q(s', a')), while SARSA is on-policy (evaluates Q(s', a') where a' is chosen by the behavior policy)",
        "Q-Learning only operates in discrete observation spaces while SARSA is continuous",
        "SARSA does not use a discount factor γ",
        "Q-Learning cannot be used with neural network function approximators"
      ],
      0,
      "Q-Learning updates toward the greedy action regardless of what the agent actually does; SARSA updates using the actual next action taken.",
      "Advanced",
    ),
    question(
      "According to the Policy Gradient Theorem, what is the analytical gradient of the expected return J(θ) with respect to policy parameters θ?",
      [
        "E_{π_θ} [ ∇_θ log π_θ(a|s) · Q^{π_θ}(s, a) ]",
        "∇_θ E [ R(s, a) ] · (1 - γ)",
        "E [ ∇_s V(s) · ∇_a Q(s, a) ]",
        "max_θ [ log π_θ(a|s) ]"
      ],
      0,
      "The policy gradient theorem establishes that ∇_θ J(θ) = E[∇_θ log π_θ(a|s) · Q(s, a)], eliminating the need to differentiate transition dynamics.",
      "Advanced",
    ),
    question(
      "In Proximal Policy Optimization (PPO), how does the Clipped Surrogate Objective prevent dangerously large policy updates?",
      [
        "By clipping the probability ratio r_t(θ) inside [1 - ϵ, 1 + ϵ] and taking the minimum with the unclipped objective for positive advantage",
        "By resetting all policy weights to zero whenever advantage is negative",
        "By constraining the gradient norm to exactly 1.0 using L1 regularization",
        "By stopping training permanently if KL divergence exceeds 0.01"
      ],
      0,
      "PPO optimizes min(r_t(θ)Â_t, clip(r_t(θ), 1 - ϵ, 1 + ϵ)Â_t), which penalizes updates that move the new policy too far from the old policy.",
      "Advanced",
    ),
    question(
      "What is the role of the Generalized Advantage Estimator (GAE) parameter λ ∈ [0, 1] in policy optimization?",
      [
        "It interpolates between TD(0) advantage (low variance, high bias when λ=0) and Monte Carlo empirical advantage (high variance, zero bias when λ=1)",
        "It sets the discount factor of the environment",
        "It scales the entropy regularization coefficient in the loss function",
        "It controls the mini-batch size during gradient updates"
      ],
      0,
      "GAE uses an exponentially weighted average of k-step TD advantages, where λ balances bias against variance.",
      "Advanced",
    ),
    question(
      "What algorithmic defect does Double Q-Learning resolve in standard Q-Learning?",
      [
        "Maximization bias (overestimation of Q-values caused by taking the maximum over noisy estimates for both action selection and action evaluation)",
        "Vanishing gradients in the replay buffer",
        "Infinite loops in deterministic environments",
        "Inability to process negative reward values"
      ],
      0,
      "Standard Q-learning uses max_a Q(s', a) for both selection and evaluation; Double Q-learning decouples selection and evaluation using two separate networks.",
      "Advanced",
    ),
    question(
      "In Actor-Critic algorithms, why is a state-value Critic V(s) subtracted from the action-value Q(s, a) as a baseline?",
      [
        "It reduces the variance of the policy gradient estimator without introducing bias",
        "It forces the policy to become purely deterministic",
        "It accelerates GPU tensor multiplication",
        "It guarantees exploration in unseen state spaces"
      ],
      0,
      "Subtracting a state-dependent baseline E[∇_θ log π(a|s) · b(s)] = 0 preserves expected gradient value while dramatically reducing variance.",
      "Advanced",
    ),
    question(
      "How does Gradient Clipping by Global Norm (g ← g · c / max(c, ||g||)) protect training dynamics compared to element-wise value clipping?",
      [
        "It rescales the entire gradient vector proportionally when its L2 norm exceeds c, preserving gradient direction while bounding step magnitude",
        "It sets all gradient elements exceeding c to zero",
        "It inverts the sign of negative gradient components",
        "It rounds floating-point gradients to nearest integers"
      ],
      0,
      "Global norm clipping rescales the full vector by a scalar factor, preventing catastrophic exploding steps while preserving update direction.",
      "Advanced",
    ),
    question(
      "Why is standard second-order optimization (e.g. classical Newton-Raphson) computationally impractical for deep neural networks with millions of parameters P?",
      [
        "Calculating and inverting the P × P Hessian matrix requires O(P²) memory and O(P³) computation per step",
        "Second-order derivatives are mathematically undefined for continuous neural networks",
        "Newton's method only works on linear functions",
        "GPUs cannot perform floating-point matrix addition"
      ],
      0,
      "For millions of parameters, constructing and inverting the full Hessian matrix (O(P²) storage, O(P³) inversion) is intractable.",
      "Advanced",
    ),
    question(
      "Why is a linear Learning Rate Warmup phase commonly employed when training large Transformer models with the AdamW optimizer?",
      [
        "Early in training, gradient variance estimates in the second moment buffer are noisy and uncalibrated, so small step sizes prevent early divergence",
        "To allow the GPU to reach thermal equilibrium before heavy computation",
        "To ensure all training samples are seen before any weight updates occur",
        "To allow the dataset to be decompressed in RAM"
      ],
      0,
      "At initialization, Adam's second moment estimate v_t is uncalibrated; large initial learning rates can cause unstable, destructive weight updates.",
      "Advanced",
    ),
    question(
      "In self-supervised Contrastive Learning (e.g. SimCLR), what is the function of the temperature hyperparameter τ in the InfoNCE loss?",
      [
        "It controls the hardness-awareness of negative samples; smaller τ concentrates gradients on the most difficult and similar negative pairs",
        "It adjusts GPU cooling fans dynamically based on training loss",
        "It scales the learning rate down as training progresses",
        "It sets the maximum allowable image crop percentage"
      ],
      0,
      "The temperature parameter τ scales cosine logits in softmax; smaller τ penalizes hard negative samples with higher gradient sensitivity.",
      "Advanced",
    ),
    question(
      "In the original Vision Transformer (ViT) architecture, how is a 2D image of shape H × W × C converted into a sequence of input tokens?",
      [
        "The image is divided into a grid of non-overlapping P × P patches, each flattened into a 1D vector and linearly projected into the Transformer hidden dimension",
        "Every individual pixel is treated as a separate token with its own attention vector",
        "A standard CNN processes the image and outputs a single scalar summary",
        "The image is compressed using discrete cosine transform and passed as text"
      ],
      0,
      "ViT splits images into non-overlapping patches (e.g. 16×16), flattens each into a vector of size P²·C, and projects it via a linear embedding layer.",
      "Advanced",
    ),
    question(
      "What is the architectural advantage of Dilated (Atrous) Convolutions in semantic segmentation networks (e.g. DeepLab)?",
      [
        "They expand the filter receptive field exponentially without increasing parameter count or reducing spatial feature map resolution via pooling",
        "They double the number of filter parameters without increasing memory",
        "They invert the convolution operation to generate training labels",
        "They force all kernel weights to be binary 0 or 1"
      ],
      0,
      "Dilated convolutions insert spaces (holes) between kernel elements, enlarging the receptive field while preserving dense pixel-level resolution.",
      "Advanced",
    ),
    question(
      "How do Depthwise Separable Convolutions (used in MobileNet architectures) reduce computational cost compared to standard convolutions?",
      [
        "They factorize standard convolution into a depthwise convolution (spatial filtering per channel) followed by a pointwise 1×1 convolution (channel combination)",
        "They skip every second frame in video analysis",
        "They compute convolutions using Fourier transforms exclusively in RAM",
        "They remove all non-linear activation functions"
      ],
      0,
      "Splitting spatial filtering and channel cross-combination reduces computational multiplication operations by roughly a factor of 8 to 9.",
      "Advanced",
    ),
    question(
      "In Statistical Learning Theory, what does the Vapnik-Chervonenkis (VC) Dimension measure?",
      [
        "The cardinality of the largest finite set of points that can be shattered (assigned all possible binary label configurations) by a hypothesis class",
        "The number of hidden layers in a deep neural network",
        "The time complexity of training an SVM algorithm",
        "The ratio of training samples to testing samples"
      ],
      0,
      "VC dimension characterizes the expressive capacity of a binary classifier family by the maximum number of arbitrary points it can shatter.",
      "Advanced",
    ),
    question(
      "What theoretical guarantee does the Probably Approximately Correct (PAC) learning framework establish for an algorithm?",
      [
        "With probability at least 1 - δ, the learned hypothesis will have true generalization error of at most ϵ, given sufficient polynomial sample complexity",
        "The algorithm is guaranteed to achieve exactly 0% error on all future data",
        "The algorithm will run in constant O(1) clock cycles on any processor",
        "The algorithm requires zero labeled training instances"
      ],
      0,
      "PAC theory formalizes learnability: with high probability (1 - δ), generalization error will be approximately bounded (≤ ϵ) given sufficient samples.",
      "Advanced",
    ),
    question(
      "What does empirical Rademacher Complexity measure for a hypothesis class F on a dataset S?",
      [
        "The expected ability of functions in F to fit randomly assigned Rademacher noise (±1 labels), measuring data-dependent model capacity",
        "The execution speed of matrix multiplications on random tensors",
        "The exact number of non-zero parameters in a pruned neural network",
        "The rate of convergence of stochastic gradient descent"
      ],
      0,
      "Rademacher complexity measures a model class's ability to correlate with random noise, providing distribution-dependent generalization bounds.",
      "Advanced",
    ),
    question(
      "What is the \"Double Descent\" phenomenon in modern machine learning?",
      [
        "Test error decreases, peaks near the interpolation threshold (where model capacity matches sample size), and decreases again in the overparameterized regime",
        "Loss drops during epoch 1 and drops again during epoch 2 only",
        "Training loss increases while validation loss decreases continuously",
        "Gradients undergo two consecutive vanishing phases during backpropagation"
      ],
      0,
      "Beyond the classical capacity limit (interpolation threshold), massive overparameterization combined with implicit regularization drives test error down again.",
      "Advanced",
    ),
    question(
      "Why is Spectral Normalization applied to weight matrices in the discriminator of generative networks (e.g. SNGAN)?",
      [
        "It divides weight matrices by their largest singular value, strictly enforcing a 1-Lipschitz continuity condition on the discriminator function",
        "It diagonalizes weight matrices to accelerate inference speed",
        "It removes all imaginary eigenvalues from the loss surface",
        "It forces weights to sum to 1 across all channels"
      ],
      0,
      "Bounding the spectral norm ||W||_2 ≤ 1 bounds the Lipschitz constant of the discriminator, preventing exploding gradients and stabilizing GAN training.",
      "Advanced",
    ),
    question(
      "In deep learning theory, what is the Neural Tangent Kernel (NTK) regime?",
      [
        "The asymptotic regime in which an infinitely wide neural network trained with gradient descent behaves as a linear model with a fixed, static kernel throughout training",
        "A hardware accelerator specifically designed for graph neural networks",
        "A method for encrypting neural network weights during distributed training",
        "A loss function for training physics-informed differential equations"
      ],
      0,
      "Jacot et al. demonstrated that as network width goes to infinity, network parameters change infinitesimally while predictions follow kernel regression under the NTK.",
      "Advanced",
    ),
    question(
      "What is \"Mode Collapse\" in Generative Adversarial Networks (GANs)?",
      [
        "The generator learns to produce only a tiny, repetitive subset of valid outputs that fool the discriminator, failing to capture the full data distribution diversity",
        "The discriminator loss drops to exactly zero on the first iteration",
        "The GPU runs out of video memory during backpropagation",
        "The model produces only completely black images"
      ],
      0,
      "Mode collapse happens when the generator concentrates all its probability mass on a few modes that easily fool the current discriminator state.",
      "Advanced",
    ),
    question(
      "How does Nucleus (Top-p) Sampling differ from standard Top-k Sampling during autoregressive text generation?",
      [
        "It samples dynamically from the smallest set of tokens whose cumulative probability exceeds threshold p, adapting candidate pool size based on distribution sharpness",
        "It always samples the single token with highest probability (argmax)",
        "It selects exactly k tokens regardless of whether the distribution is peaky or flat",
        "It samples tokens in reverse alphabetical order"
      ],
      0,
      "Top-p truncates the distribution tail dynamically where cumulative probability reaches p, preventing low-probability hallucinations in flat distributions.",
      "Advanced",
    ),
    question(
      "In parameter-efficient fine-tuning, how does Low-Rank Adaptation (LoRA) update a frozen weight matrix W₀ ∈ R^{d × k}?",
      [
        "It decomposes the weight update into two low-rank matrices: W = W₀ + (B · A) · (α / r), where B ∈ R^{d × r}, A ∈ R^{r × k}, and rank r ≪ min(d, k)",
        "It quantizes the entire matrix W₀ to 2 bits without adding new parameters",
        "It deletes the lowest r singular values of W₀",
        "It fine-tunes only the bias vectors while keeping all weight matrices frozen"
      ],
      0,
      "LoRA freezes W₀ and injects low-rank trainable decomposition matrices B and A, reducing trainable parameters by orders of magnitude.",
      "Advanced",
    ),
    question(
      "In Quantization-Aware Training (QAT), how does the Straight-Through Estimator (STE) enable gradient computation through non-differentiable rounding operators?",
      [
        "It computes non-differentiable quantized values on the forward pass, but treats the quantization operation as an identity function (gradient = 1) during backward pass",
        "It computes exact symbolic derivatives using computer algebra systems",
        "It replaces backpropagation with finite difference approximations",
        "It converts floating point operations to stochastic Langevin sampling"
      ],
      0,
      "STE allows backpropagation through round() by pretending ∂round(x)/∂x = 1 within a clipping range during the backward pass.",
      "Advanced",
    ),
    question(
      "In Mixture of Experts (MoE) architectures (e.g. Switch Transformer), what is the function of the Gating/Router network?",
      [
        "It computes a sparse softmax distribution over expert sub-networks, routing each input token dynamically to only the top-k experts",
        "It synchronizes network weights across distributed data centers",
        "It decrypts incoming user prompts for safe execution",
        "It balances electrical power consumption across GPU clusters"
      ],
      0,
      "The router network evaluates tokens and dynamically routes each token to a sparse subset (e.g. top-1 or top-2) of specialized feedforward experts.",
      "Advanced",
    ),
    question(
      "What distinguishes the training objective of Masked Language Modeling (e.g. BERT) from Causal Language Modeling (e.g. GPT)?",
      [
        "MLM predicts randomly masked tokens using bidirectional left-and-right context; CLM predicts the next token sequentially using only unidirectional past context",
        "MLM requires reinforcement learning while CLM is strictly unsupervised",
        "CLM can only process images while MLM processes text",
        "MLM generates text autoregressively at inference time"
      ],
      0,
      "BERT corrupts 15% of tokens and attends bidirectionally; GPT trains autoregressively predicting token t_{i} conditioned strictly on t_{<i}.",
      "Advanced",
    ),
    question(
      "How does Contrastive Language-Image Pre-training (CLIP) train joint multimodal representations?",
      [
        "By maximizing the cosine similarity of true (image, text) pairs in a batch while minimizing cosine similarity of incorrect pairings via symmetric cross-entropy loss",
        "By training a recurrent neural network to generate word-for-word image captions from scratch",
        "By feeding pixel values directly into an unconditioned language model vocabulary",
        "By converting all images into ASCII text files before training"
      ],
      0,
      "CLIP uses an image encoder and text encoder trained with symmetric InfoNCE cross-entropy loss over N×N image-text embedding similarities.",
      "Advanced",
    ),
    question(
      "What theoretical simplification does Direct Preference Optimization (DPO) introduce compared to traditional RLHF with PPO?",
      [
        "It analytically solves for the optimal policy under the Bradley-Terry preference model, training the policy directly on paired preferences without an explicit reward model or RL loop",
        "It eliminates the need for human preference data entirely",
        "It trains the language model using purely supervised next-token prediction without reference datasets",
        "It uses evolutionary genetic algorithms to mutate model weights"
      ],
      0,
      "DPO shows that the reward can be expressed implicitly via the policy log-ratio, allowing direct policy optimization on binary preferences via simple cross-entropy.",
      "Advanced",
    ),
    question(
      "In Reinforcement Learning from Human Feedback (RLHF), what is \"Reward Hacking\" (or reward model exploitation)?",
      [
        "The policy exploits imperfections, blind spots, or shortcuts in the learned reward model to achieve high proxy reward scores without aligning with genuine human intent",
        "Malicious external hackers modifying reward values in database tables",
        "An agent failing to explore the environment due to a low discount factor",
        "A student guessing answers on an online exam platform"
      ],
      0,
      "Goodhart's Law in RLHF: when a proxy reward model becomes the optimization target, the policy finds unintended adversarial shortcuts that game the metric.",
      "Advanced",
    ),
    question(
      "How does Elastic Weight Consolidation (EWC) mitigate Catastrophic Forgetting during continual learning across sequential tasks?",
      [
        "It adds a quadratic penalty that slows updates to parameters that are highly informative for previous tasks, as quantified by the diagonal elements of the Fisher Information Matrix",
        "It freezes the entire neural network and trains a completely new model for each task",
        "It randomly reinitializes 50% of the network weights at the start of each new task",
        "It deletes older task data to free memory for new tasks"
      ],
      0,
      "EWC uses the Fisher Information Matrix to measure parameter importance for task A, penalizing shifts in critical weights when training on task B.",
      "Advanced",
    ),
    question(
      "What statistical guarantee is provided by Split Conformal Prediction for classification tasks?",
      [
        "For any underlying data distribution and any base model, it constructs prediction sets that contain the true label with marginal coverage probability at least 1 - α",
        "It guarantees that the base model achieves 100% precision on all test cases",
        "It guarantees that the prediction set will always contain exactly one single label",
        "It proves that the training data contains zero noisy labels"
      ],
      0,
      "Conformal prediction provides finite-sample distribution-free guarantees: P(Y ∈ C(X)) ≥ 1 - α under exchangeability.",
      "Advanced",
    ),
    question(
      "How is Temperature Scaling used to calibrate probabilities produced by a deep neural network without affecting classification accuracy?",
      [
        "It divides all pre-softmax logits by a single learned scalar parameter T > 0, softening overconfident probabilities without changing the argmax rank order",
        "It scales the weights of the convolutional layers by temperature T",
        "It adjusts learning rate warmups dynamically based on hardware temperature",
        "It drops random neurons during the forward pass during inference"
      ],
      0,
      "Temperature scaling computes p_i = exp(z_i / T) / Σ exp(z_j / T); since T > 0 is scalar, the argmax prediction is invariant while ECE is minimized.",
      "Advanced",
    ),
    question(
      "What is the \"Implicit Bias\" of Gradient Descent when training an overparameterized linear classifier on linearly separable data with logistic loss?",
      [
        "It asymptotically converges in direction to the maximum-margin (hard-margin Support Vector Machine) separating hyperplane",
        "It converges to a solution that maximizes the L1 norm of the weights",
        "It oscillates randomly between multiple separating hyperplanes without converging",
        "It forces all weights to converge to exact zero"
      ],
      0,
      "Soudry et al. (2018) proved that unregularized gradient descent on separable data with exponential/logistic loss converges to the L2 maximum-margin separator.",
      "Advanced",
    ),
  ],
}

/**
 * Returns summary statistics for the expanded question bank.
 */
export function getExpandedBankStats() {
  const stats = {}
  for (const [slug, questions] of Object.entries(expandedExamQuestions)) {
    const counts = { Beginner: 0, Intermediate: 0, Advanced: 0, Total: questions.length }
    for (const q of questions) {
      if (counts[q.difficulty] !== undefined) {
        counts[q.difficulty] += 1
      }
    }
    stats[slug] = counts
  }
  return stats
}

/**
 * Validates the question bank for consistency, option validity, and uniqueness.
 */
export function validateExpandedBank(existingPrompts = new Set()) {
  const errors = []
  const allPrompts = new Set([...existingPrompts])

  for (const [slug, questions] of Object.entries(expandedExamQuestions)) {
    questions.forEach((q, index) => {
      const loc = `${slug} (index ${index})`
      if (!q.prompt || typeof q.prompt !== 'string') {
        errors.push(`${loc}: prompt is missing or not a string`)
      }
      const normPrompt = q.prompt.trim().toLowerCase()
      if (allPrompts.has(normPrompt)) {
        errors.push(`${loc}: duplicate prompt "${q.prompt}"`)
      } else {
        allPrompts.add(normPrompt)
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        errors.push(`${loc}: must have exactly 4 options`)
      } else {
        const uniqueOptions = new Set(q.options.map((opt) => opt.trim().toLowerCase()))
        if (uniqueOptions.size !== 4) {
          errors.push(`${loc}: options contain duplicate entries`)
        }
      }
      if (!Number.isInteger(q.correctOption) || q.correctOption < 0 || q.correctOption > 3) {
        errors.push(`${loc}: correctOption must be 0, 1, 2, or 3`)
      }
      if (!q.explanation || typeof q.explanation !== 'string') {
        errors.push(`${loc}: explanation is missing or invalid`)
      }
      if (!['Beginner', 'Intermediate', 'Advanced'].includes(q.difficulty)) {
        errors.push(`${loc}: invalid difficulty "${q.difficulty}"`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
