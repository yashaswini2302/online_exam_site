import { useEffect, useEffectEvent, useRef, useState } from 'react'
import {
  AlertCircle, ArrowLeft, ArrowRight, Bell, BookOpen, Calendar, Check, CheckCircle2, ChevronRight,
  Clock3, Compass, Eye, EyeOff, FileCheck2, Flag, GraduationCap, LayoutDashboard,
  LogOut, Menu, Search, ShieldCheck, Sparkles, UserRound, X,
} from 'lucide-react'
import TeacherPortal from './components/TeacherPortal.jsx'
import './App.css'

const previewQuestions = [
  { prompt: 'A train travels 180 kilometers in 2.5 hours. What is its average speed?', options: ['65 km/h', '70 km/h', '72 km/h', '75 km/h'], answer: 2 },
  { prompt: 'If 3x + 7 = 28, what is the value of x?', options: ['5', '6', '7', '8'], answer: 2 },
  { prompt: 'Which fraction is equivalent to 0.375?', options: ['3/8', '5/12', '7/16', '2/5'], answer: 0 },
  { prompt: 'A jacket costs $80 after a 20% discount. What was its original price?', options: ['$90', '$96', '$100', '$104'], answer: 2 },
  { prompt: 'What is the next number in the sequence: 4, 9, 19, 39, ...?', options: ['59', '69', '79', '89'], answer: 2 },
]

const previewVerbalQuestions = [
  { prompt: 'Which word is closest in meaning to “concise”?', options: ['Brief', 'Unclear', 'Detailed', 'Formal'], answer: 0 },
  { prompt: 'Choose the word that best completes: “Despite the delay, the team remained ___.”', options: ['discouraged', 'resolute', 'careless', 'uncertain'], answer: 1 },
  { prompt: 'Which sentence uses “their” correctly?', options: ['Their going to arrive soon.', 'The students submitted their work.', 'The book is over their.', 'Their is no reason to wait.'], answer: 1 },
  { prompt: 'What is the opposite of “expand”?', options: ['Increase', 'Stretch', 'Contract', 'Extend'], answer: 2 },
  { prompt: 'A reliable conclusion should be based primarily on:', options: ['A strong first impression', 'Relevant evidence', 'Popular opinion', 'A single example'], answer: 1 },
]

const previewScienceQuestions = [
  { prompt: 'Which cell structure contains most of a cell’s genetic material?', options: ['Ribosome', 'Nucleus', 'Cell membrane', 'Golgi apparatus'], answer: 1 },
  { prompt: 'What is the chemical symbol for potassium?', options: ['P', 'Po', 'K', 'Pt'], answer: 2 },
  { prompt: 'Which unit is used to measure electric current?', options: ['Volt', 'Watt', 'Ohm', 'Ampere'], answer: 3 },
  { prompt: 'At standard atmospheric pressure, water boils at:', options: ['0°C', '50°C', '100°C', '150°C'], answer: 2 },
  { prompt: 'Which gas do plants primarily absorb during photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], answer: 2 },
]

const previewExams = [
  { id: 'math-foundations', title: 'Mathematical Foundations', category: 'QUANTITATIVE REASONING', description: 'Test your command of algebra, number systems, and practical problem solving.', durationMinutes: 45, questionCount: previewQuestions.length, difficulty: 'Intermediate', color: 'mint', due: 'In 7 days', previewQuestions },
  { id: 'verbal-reasoning', title: 'Verbal Reasoning', category: 'LANGUAGE & COMPREHENSION', description: 'Read closely, recognize patterns, and make precise inferences from text.', durationMinutes: 35, questionCount: previewVerbalQuestions.length, difficulty: 'Beginner', color: 'peach', due: 'In 10 days', previewQuestions: previewVerbalQuestions },
  { id: 'science-principles', title: 'Science Principles', category: 'GENERAL SCIENCE', description: 'A broad check-in across core concepts in biology, chemistry, and physics.', durationMinutes: 60, questionCount: previewScienceQuestions.length, difficulty: 'Advanced', color: 'blue', due: 'In 14 days', previewQuestions: previewScienceQuestions },
]

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'available', label: 'Available exams', icon: BookOpen },
  { id: 'results', label: 'My results', icon: FileCheck2 },
  { id: 'profile', label: 'My profile', icon: UserRound },
]

const defaultMinutesPerQuestion = Object.freeze({
  Beginner: 1,
  Intermediate: 1.5,
  Advanced: 2,
})

const difficultyOptions = [
  {
    value: 'Beginner',
    label: 'Beginner',
    levelTag: 'Tier 1 · Foundational',
    pace: '1.0 min/q',
    description: 'Core concepts and direct problem-solving. Great for building pacing and confidence.',
    cardClass: 'tier-beginner',
  },
  {
    value: 'Intermediate',
    label: 'Intermediate',
    levelTag: 'Tier 2 · Standard',
    pace: '1.5 min/q',
    description: 'Standard aptitude and subject questions requiring application and reasoning.',
    cardClass: 'tier-intermediate',
  },
  {
    value: 'Advanced',
    label: 'Advanced',
    levelTag: 'Tier 3 · Challenging',
    pace: '2.0 min/q',
    description: 'Complex, analytical problems requiring in-depth reasoning under timed pressure.',
    cardClass: 'tier-advanced',
  },
]

function estimateDurationMinutes(count, difficulty, rates = defaultMinutesPerQuestion) {
  const rate = (rates && rates[difficulty]) ? rates[difficulty] : (defaultMinutesPerQuestion[difficulty] || 1.5)
  return Math.ceil(count * rate)
}

function countsForDifficulty(exam, difficulty) {
  if (exam.supportedQuestionCountsByDifficulty) return exam.supportedQuestionCountsByDifficulty[difficulty] || []
  return difficulty === exam.difficulty ? (exam.supportedQuestionCounts || [5]) : []
}

function countForDifficulty(exam, difficulty) {
  if (exam.difficultyQuestionCounts) return exam.difficultyQuestionCounts[difficulty] || 0
  return difficulty === exam.difficulty ? exam.questionCount : 0
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || 'The request could not be completed')
    error.status = response.status
    throw error
  }
  return data
}

function formatDate(date) {
  return date ? new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(date)) : '—'
}

function getPasswordStrength(value) {
  if (!value) return { score: 0, label: 'Use 12+ characters and a mix of character types' }
  const score = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(value)).length
  if (value.length < 12 || score < 3) return { score: 1, label: 'Add length and more character types' }
  if (value.length >= 16 && score === 4) return { score: 4, label: 'Strong password' }
  return { score: 3, label: 'Meets password requirements' }
}

function App() {
  const [page, setPage] = useState('dashboard')
  const [student, setStudent] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authMode, setAuthMode] = useState('signin') // 'signin' | 'signup' | 'teacherSignup'
  const [teacherInviteCode, setTeacherInviteCode] = useState('Q65-TEACHER-INVITE-2026')
  const [studentAssignments, setStudentAssignments] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [authBusy, setAuthBusy] = useState(false)
  const [examCatalog, setExamCatalog] = useState(previewExams)
  const [subjects, setSubjects] = useState([])
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [selectedExam, setSelectedExam] = useState(null)
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(5)
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate')
  const [setupReturnPage, setSetupReturnPage] = useState('available')
  const [attempts, setAttempts] = useState([])
  const [apiConnected, setApiConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [exam, setExam] = useState(null)
  const [attemptId, setAttemptId] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [review, setReview] = useState([])
  const [remaining, setRemaining] = useState(0)
  const [result, setResult] = useState(null)
  const [search, setSearch] = useState('')
  const [saveStatus, setSaveStatus] = useState('saved')
  const [today] = useState(() => new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()).toUpperCase())
  const remainingRef = useRef(0)
  const expiryHandledRef = useRef(false)
  const saveQueueRef = useRef(Promise.resolve())

  async function loadPortal(studentData) {
    const [examData, subjectData, historyData, assignData] = await Promise.all([
      apiRequest('/api/exams'),
      apiRequest('/api/subjects'),
      apiRequest(`/api/students/${studentData.id}/attempts?status=all`),
      apiRequest('/api/assignments').catch(() => ({ assignments: [] })),
    ])
    setStudent(studentData)
    setExamCatalog(examData.exams.map((item, index) => ({
      ...item,
      durationMinutes: item.durationMinutes,
      questionCount: item.questionCount,
      color: ['mint', 'peach', 'blue'][index % 3],
      due: formatDate(item.availabilityEndsAt),
    })))
    setSubjects(subjectData.subjects)
    setAttempts(historyData.attempts)
    setStudentAssignments(assignData.assignments || [])
    setApiConnected(true)
    if (studentData.role === 'teacher' || studentData.role === 'admin') {
      setPage('teacherDashboard')
    }
  }

  useEffect(() => {
    let cancelled = false
    async function restoreSession() {
      try {
        const session = await apiRequest('/api/auth/session')
        if (!cancelled && session.student) await loadPortal(session.student)
      } catch (error) {
        if (!cancelled && error.status !== 401) setAuthError(error.message)
      } finally {
        if (!cancelled) {
          setAuthReady(true)
          setLoading(false)
        }
      }
    }
    restoreSession()
    return () => { cancelled = true }
  }, [])

  async function signIn(event) {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setAuthError('Enter a valid email address.')
      return
    }
    setAuthBusy(true)
    setAuthError('')
    try {
      const session = await apiRequest('/api/auth/login', { method: 'POST', body: { email, password } })
      await loadPortal(session.student)
      setPassword('')
      if (session.student.role === 'teacher' || session.student.role === 'admin') {
        setPage('teacherDashboard')
      } else {
        setPage('dashboard')
      }
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthBusy(false)
    }
  }

  async function signUp(event) {
    event.preventDefault()
    setAuthError('')
    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      setAuthError('Enter your full name (2 to 100 characters).')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setAuthError('Enter a valid email address.')
      return
    }
    if (!acceptedTerms) {
      setAuthError('Please accept the terms and privacy notice to continue.')
      return
    }
    if (password !== confirmPassword) {
      setAuthError('Your passwords do not match.')
      return
    }
    if (getPasswordStrength(password).score < 3) {
      setAuthError('Choose a stronger password using at least 12 characters and three character types.')
      return
    }
    setAuthBusy(true)
    try {
      const session = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: { name: fullName, email, password, acceptedTerms },
      })
      await loadPortal(session.student)
      setPassword('')
      setConfirmPassword('')
      setNotice('Your account is active. Email verification is not configured for this local exam portal.')
      setPage('dashboard')
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthBusy(false)
    }
  }

  async function signUpTeacher(event) {
    event.preventDefault()
    setAuthError('')
    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      setAuthError('Enter your full name (2 to 100 characters).')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setAuthError('Enter a valid email address.')
      return
    }
    if (!teacherInviteCode.trim()) {
      setAuthError('Enter your teacher invitation code.')
      return
    }
    if (!acceptedTerms) {
      setAuthError('Please accept the terms and privacy notice to continue.')
      return
    }
    if (password !== confirmPassword) {
      setAuthError('Your passwords do not match.')
      return
    }
    if (getPasswordStrength(password).score < 3) {
      setAuthError('Choose a stronger password using at least 12 characters and three character types.')
      return
    }
    setAuthBusy(true)
    try {
      const session = await apiRequest('/api/auth/teacher/register', {
        method: 'POST',
        body: { name: fullName, email, password, inviteCode: teacherInviteCode.trim(), acceptedTerms },
      })
      await loadPortal(session.student)
      setPassword('')
      setConfirmPassword('')
      setNotice('Teacher account registered successfully. Welcome to the Instructor Portal.')
      setPage('teacherDashboard')
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthBusy(false)
    }
  }

  async function signOut() {
    if (!window.confirm('Sign out of your student account?')) return
    setAuthBusy(true)
    setAuthError('')
    try {
      await saveQueueRef.current.catch(() => {})
      await apiRequest('/api/auth/logout', { method: 'POST' })
      setStudent(null)
      setAttempts([])
      setSubjects([])
      setSelectedExam(null)
      setExam(null)
      setAttemptId(null)
      setAnswers({})
      setReview([])
      setResult(null)
      setSearch('')
      setEmail('')
      setPassword('')
      setFullName('')
      setConfirmPassword('')
      setAcceptedTerms(false)
      setNotice('')
      setApiConnected(false)
      remainingRef.current = 0
      expiryHandledRef.current = false
      setPage('dashboard')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setAuthBusy(false)
    }
  }

  async function refreshAttempts() {
    if (!apiConnected || !student.id) return
    const historyData = await apiRequest(`/api/students/${student.id}/attempts?status=all`)
    setAttempts(historyData.attempts)
  }

  function showAttemptResult(attempt) {
    const serverResult = attempt.result
    setExam({ title: attempt.examTitle })
    setResult({ title: attempt.examTitle, total: serverResult.totalQuestions, correct: serverResult.correctAnswers, incorrect: serverResult.incorrectAnswers, unanswered: serverResult.unansweredQuestions, percentage: serverResult.percentage, verified: true })
    setPage('resultDetail')
  }

  function switchSetupExam(nextExam) {
    if (!nextExam) return
    setSelectedExam(nextExam)
    let nextDifficulty = selectedDifficulty
    let nextCounts = countsForDifficulty(nextExam, nextDifficulty)
    if (nextCounts.length === 0 || countForDifficulty(nextExam, nextDifficulty) === 0) {
      const fallbackOption = difficultyOptions.find((opt) => countForDifficulty(nextExam, opt.value) > 0)
      if (fallbackOption) {
        nextDifficulty = fallbackOption.value
        nextCounts = countsForDifficulty(nextExam, nextDifficulty)
      }
    }
    setSelectedDifficulty(nextDifficulty)
    setSelectedQuestionCount((current) => (nextCounts.includes(current) ? current : (nextCounts.includes(5) ? 5 : (nextCounts[0] || 0))))
  }

  function startExam(examItem, resumeId = null) {
    if (resumeId) {
      void beginExam(examItem, resumeId)
      return
    }
    const defaultDifficulty = difficultyOptions.some((option) => option.value === examItem.difficulty && countForDifficulty(examItem, option.value) > 0)
      ? examItem.difficulty
      : difficultyOptions.find((option) => countForDifficulty(examItem, option.value) > 0)?.value || 'Intermediate'
    const availableCounts = countsForDifficulty(examItem, defaultDifficulty)
    setSelectedExam(examItem)
    setSelectedDifficulty(defaultDifficulty)
    setSelectedQuestionCount(availableCounts.includes(5) ? 5 : (availableCounts[0] || 0))
    setSetupReturnPage(page)
    setPage('examSetup')
  }

  async function beginExam(examItem, resumeId = null, questionCount = selectedQuestionCount, assignmentId = null) {
    setNotice('')
    try {
      let selectedQuestions
      let isPreview = !apiConnected
      let attemptExam = examItem

      if (apiConnected) {
        const body = assignmentId
          ? { assignmentId, studentId: student.id, questionCount, difficulty: selectedDifficulty }
          : { examId: examItem?.id, studentId: student.id, questionCount, difficulty: selectedDifficulty }
        const response = resumeId
          ? await apiRequest(`/api/attempts/${resumeId}`)
          : await apiRequest('/api/attempts', { method: 'POST', body })
        const selectedAttempt = response.attempt
        attemptExam = examItem || selectedAttempt.exam
        if (selectedAttempt.status === 'submitted') {
          const serverResult = selectedAttempt.result
          setExam(selectedAttempt.exam)
          setResult({ title: selectedAttempt.exam.title, total: serverResult.totalQuestions, correct: serverResult.correctAnswers, incorrect: serverResult.incorrectAnswers, unanswered: serverResult.unansweredQuestions, percentage: serverResult.percentage, verified: true })
          setPage('resultDetail')
          return
        }
        selectedQuestions = selectedAttempt.exam.questions
        setAttemptId(selectedAttempt.id)
        const savedAnswers = {}
        const savedReview = []
        selectedAttempt.answers.forEach((answer) => {
          const index = selectedQuestions.findIndex((question) => question.id === answer.questionId)
          if (index !== -1 && answer.selectedOption !== null) savedAnswers[index] = answer.selectedOption
          if (index !== -1 && answer.markedForReview) savedReview.push(index)
        })
        setAnswers(savedAnswers)
        setReview(savedReview)
        const firstOpen = selectedQuestions.findIndex((question, index) => savedAnswers[index] === undefined && !savedReview.includes(index))
        setCurrentQuestion(firstOpen === -1 ? 0 : firstOpen)
        const secondsRemaining = Math.max(0, Math.ceil((new Date(selectedAttempt.expiresAt).getTime() - Date.now()) / 1000))
        remainingRef.current = secondsRemaining
        setRemaining(secondsRemaining)
        expiryHandledRef.current = false
        setAttempts((items) => [
          { id: selectedAttempt.id, examId: selectedAttempt.exam.id, examTitle: selectedAttempt.exam.title, status: selectedAttempt.status, expiresAt: selectedAttempt.expiresAt, answeredCount: Object.keys(savedAnswers).length },
          ...items.filter((item) => item.id !== selectedAttempt.id),
        ])
      } else {
        selectedQuestions = selectedExam.previewQuestions || previewQuestions
        setAttemptId(null)
        setCurrentQuestion(0)
        setAnswers({})
        setReview([])
        const previewDuration = estimateDurationMinutes(
          questionCount,
          selectedDifficulty,
          selectedExam.minutesPerQuestionByDifficulty,
        )
        remainingRef.current = previewDuration * 60
        setRemaining(remainingRef.current)
        expiryHandledRef.current = false
      }

      setExam({ ...attemptExam, questions: selectedQuestions, previewMode: isPreview })
      setResult(null)
      setSaveStatus('saved')
      setPage('exam')
    } catch (error) {
      setNotice(error.message)
    }
  }

  async function finishExam() {
    if (!exam) return
    try {
      let completedResult
      if (apiConnected && attemptId) {
        await saveQueueRef.current.catch(() => {})
        const response = await apiRequest(`/api/attempts/${attemptId}/submit`, { method: 'POST' })
        const serverResult = response.attempt.result
        completedResult = {
          title: exam.title,
          total: serverResult.totalQuestions,
          correct: serverResult.correctAnswers,
          incorrect: serverResult.incorrectAnswers,
          unanswered: serverResult.unansweredQuestions,
          percentage: serverResult.percentage,
          verified: true,
        }
        void refreshAttempts().catch(() => {})
      } else {
        const correct = exam.questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0)
        const answered = Object.keys(answers).length
        completedResult = { title: exam.title, total: exam.questions.length, correct, incorrect: answered - correct, unanswered: exam.questions.length - answered, percentage: Math.round((correct / exam.questions.length) * 100), verified: false }
      }
      setResult(completedResult)
      setPage('resultDetail')
    } catch (error) {
      setNotice(error.message)
      setSaveStatus('error')
    }
  }

  const submitOnExpiry = useEffectEvent(() => { void finishExam() })

  useEffect(() => {
    if (page !== 'exam') return undefined
    const timer = window.setInterval(() => {
      remainingRef.current = Math.max(remainingRef.current - 1, 0)
      setRemaining(remainingRef.current)
      if (remainingRef.current === 0 && !expiryHandledRef.current) {
        expiryHandledRef.current = true
        submitOnExpiry()
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [page])

  function saveAnswer(questionIndex, selectedOption, markedForReview) {
    if (!apiConnected || !attemptId || !exam?.questions[questionIndex]?.id) return
    const payload = { questionId: exam.questions[questionIndex].id, selectedOption: selectedOption ?? null, markedForReview }
    setSaveStatus('saving')
    saveQueueRef.current = saveQueueRef.current
      .catch(() => {})
      .then(() => apiRequest(`/api/attempts/${attemptId}/answers`, { method: 'PUT', body: payload }))
      .then(({ attempt: savedAttempt }) => {
        setSaveStatus('saved')
        const answeredCount = savedAttempt.answers.filter((answer) => answer.selectedOption !== null).length
        setAttempts((items) => items.map((item) => item.id === attemptId ? { ...item, answeredCount } : item))
      })
      .catch((error) => { setSaveStatus('error'); setNotice(error.message) })
  }

  function selectAnswer(optionIndex) {
    setAnswers((saved) => ({ ...saved, [currentQuestion]: optionIndex }))
    saveAnswer(currentQuestion, optionIndex, review.includes(currentQuestion))
  }

  function toggleReview() {
    const nextReview = review.includes(currentQuestion)
      ? review.filter((index) => index !== currentQuestion)
      : [...review, currentQuestion]
    setReview(nextReview)
    saveAnswer(currentQuestion, answers[currentQuestion], nextReview.includes(currentQuestion))
  }

  function requestSubmit() {
    if (window.confirm('Submit this exam now? You can’t change your answers after submitting.')) void finishExam()
  }

  const activeAttempt = attempts.find((item) => item.status === 'in_progress')
  const completedAttempts = attempts.filter((item) => item.status === 'submitted' && item.result)
  const completedExamIds = new Set(completedAttempts.map((item) => item.examId))
  const pendingExamCount = examCatalog.filter((item) => !completedExamIds.has(item.id)).length
  const bestScore = completedAttempts.length ? Math.max(...completedAttempts.map((item) => item.result.percentage)) : null
  const formattedTime = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`
  const filteredExams = examCatalog.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
    && (subjectFilter === 'all' || item.subjectSlug === subjectFilter),
  )
  const initials = student?.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || ''

  if (!authReady) {
    return <main className="auth-page"><div className="auth-panel auth-loading">Checking your session…</div></main>
  }

  if (!student) {
    const isTeacherSignUp = authMode === 'teacherSignup'
    const isSignUp = authMode === 'signup' || isTeacherSignUp
    const passwordStrength = getPasswordStrength(password)
    const switchMode = (mode) => {
      setAuthMode(mode)
      setAuthError('')
      setPassword('')
      setConfirmPassword('')
      setAcceptedTerms(false)
      setShowPassword(false)
      setShowConfirmPassword(false)
    }

    return (
      <main className="auth-page">
        <section className="auth-welcome" aria-label="Q65 Online Exam">
          <a className="brand auth-brand" href="#login"><span className="brand-mark"><GraduationCap size={21} /></span><span>Q65<span className="brand-light"> Online Exam</span></span></a>
          <div className="auth-welcome-copy">
            <span className="auth-kicker"><span /> YOUR LEARNING SPACE</span>
            <h1>Make every<br />answer count.</h1>
            <p>A focused place to prepare, take your exams, and see your progress clearly.</p>
          </div>
          <div className="auth-illustration" aria-hidden="true">
            <div className="auth-illustration-book"><BookOpen size={57} strokeWidth={1.15} /></div>
            <div className="auth-illustration-note"><CheckCircle2 size={17} /><span>Progress, kept in one place</span></div>
            <span className="auth-illustration-index">Q65 / PORTAL ACCESS</span>
          </div>
          <div className="auth-steps"><span><b>01</b> PREPARE</span><i /><span><b>02</b> COMPLETE</span><i /><span><b>03</b> REVIEW</span></div>
          <span className="auth-welcome-foot">A clearer way to keep moving forward.</span>
        </section>

        <section className="auth-side">
          <div className="auth-panel">
            <div className="auth-tabs" role="tablist" aria-label="Account access">
              <button type="button" role="tab" aria-selected={authMode === 'signin'} className={authMode === 'signin' ? 'active' : ''} onClick={() => switchMode('signin')}>Sign in</button>
              <button type="button" role="tab" aria-selected={authMode === 'signup'} className={authMode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')}>Student sign up</button>
              <button type="button" role="tab" aria-selected={authMode === 'teacherSignup'} className={authMode === 'teacherSignup' ? 'active' : ''} onClick={() => switchMode('teacherSignup')}>Teacher access</button>
            </div>
            <p className="eyebrow">{isTeacherSignUp ? 'TEACHER / INSTRUCTOR ACCESS' : authMode === 'signup' ? 'CREATE STUDENT ACCOUNT' : 'ACCOUNT ACCESS'}</p>
            <h2>{isTeacherSignUp ? 'Educator portal setup.' : authMode === 'signup' ? 'Start your next chapter.' : 'Welcome back.'}</h2>
            <p className="auth-copy">{isTeacherSignUp ? 'Register with your institutional invitation code to author exams and manage assignments.' : authMode === 'signup' ? 'Set up your student profile to begin.' : 'Sign in to continue to your exams, assignments, and results.'}</p>

            <form className="auth-form" onSubmit={isTeacherSignUp ? signUpTeacher : (authMode === 'signup' ? signUp : signIn)} noValidate>
              {isSignUp && <label>Full name<input autoComplete="name" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={2} maxLength={100} required /></label>}
              <label>Email address<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required /></label>
              {isTeacherSignUp && (
                <label>Teacher invitation code
                  <input
                    type="text"
                    value={teacherInviteCode}
                    onChange={(event) => setTeacherInviteCode(event.target.value)}
                    placeholder="e.g. Q65-TEACHER-INVITE-2026"
                    required
                  />
                </label>
              )}
              <label>Password
                <span className="auth-password-input"><input autoComplete={isSignUp ? 'new-password' : 'current-password'} type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} minLength={isSignUp ? 12 : undefined} maxLength={72} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((shown) => !shown)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
              </label>
              {isSignUp && <div className="password-strength" aria-live="polite"><span className="strength-bars">{[1, 2, 3, 4].map((step) => <i key={step} className={passwordStrength.score >= step ? `strength-${passwordStrength.score}` : ''} />)}</span><span>{passwordStrength.label}</span></div>}
              {isSignUp && <label>Confirm password
                <span className="auth-password-input"><input autoComplete="new-password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} maxLength={72} required /><button type="button" aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'} onClick={() => setShowConfirmPassword((shown) => !shown)}>{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
              </label>}
              {isSignUp && <label className="auth-terms"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} required /><span>I agree to the terms and acknowledge the privacy notice. My exam results will be saved to my student account.</span></label>}
              {authError && <p className="auth-error" role="alert">{authError}</p>}
              <button className="button button-primary auth-submit" type="submit" disabled={authBusy}>
                {authBusy ? (isTeacherSignUp ? 'Creating teacher account…' : isSignUp ? 'Creating account…' : 'Signing in…') : (isTeacherSignUp ? 'Create teacher account' : isSignUp ? 'Create account' : 'Sign in')} <ArrowRight size={16} />
              </button>
            </form>

            {authMode === 'signin' && (
              <div className="demo-access">
                <ShieldCheck size={16} />
                <div>
                  <p><strong>Demo student:</strong> Use seeded email <code>jordan.davis@example.test</code> with the local <code>DEMO_STUDENT_PASSWORD</code>.</p>
                  <p style={{ marginTop: '4px' }}><strong>Teacher registration:</strong> Switch to the <em>Teacher access</em> tab with invite code <code>Q65-TEACHER-INVITE-2026</code>.</p>
                </div>
              </div>
            )}
            <p className="auth-switch">{isSignUp ? 'Already have an account?' : 'New to Q65?'} <button type="button" onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}>{isSignUp ? 'Sign in' : 'Create an account'}</button></p>
            <p className="auth-security"><ShieldCheck size={14} /> Protected access · Passwords are securely hashed before storage</p>
          </div>
        </section>
      </main>
    )
  }

  if (page === 'examSetup' && selectedExam) {
    const bankQuestionCount = selectedExam.maximumQuestionCount || selectedExam.questionCount
    const eligibleQuestionCount = countForDifficulty(selectedExam, selectedDifficulty)
    const supportedCounts = countsForDifficulty(selectedExam, selectedDifficulty)
      .filter((count) => Number.isInteger(count) && count <= eligibleQuestionCount)
    const minutesPerQuestion = selectedExam.minutesPerQuestionByDifficulty?.[selectedDifficulty] || defaultMinutesPerQuestion[selectedDifficulty]
    const configuredDuration = supportedCounts.includes(selectedQuestionCount)
      ? estimateDurationMinutes(selectedQuestionCount, selectedDifficulty, selectedExam.minutesPerQuestionByDifficulty)
      : null

    return (
      <main className="exam-setup-page">
        <header className="result-header">
          <a className="brand" href="#dashboard" onClick={(event) => { event.preventDefault(); setPage(setupReturnPage) }}><span className="brand-mark"><GraduationCap size={21} /></span><span>Q65<span className="brand-light"> Online Exam</span></span></a>
          <button className="button button-quiet" onClick={() => setPage(setupReturnPage)}><ArrowLeft size={16} /> Back</button>
        </header>
        <section className="setup-card">
          <div className="setup-card-header">
            <div className="setup-card-title-group">
              <p className="eyebrow">EXAM SETUP & CONFIGURATION</p>
              <span className="setup-subject">{selectedExam.category}</span>
              <h1>{selectedExam.title}</h1>
              <p className="welcome-copy">{selectedExam.description}</p>
            </div>
            {examCatalog.length > 1 && (
              <div className="setup-subject-picker">
                <label htmlFor="setup-exam-select" className="setup-picker-label">Subject & Exam</label>
                <div className="setup-select-wrapper">
                  <select
                    id="setup-exam-select"
                    aria-label="Select exam or subject"
                    value={selectedExam.id}
                    onChange={(event) => {
                      const nextExam = examCatalog.find((item) => item.id === event.target.value)
                      if (nextExam) switchSetupExam(nextExam)
                    }}
                  >
                    {examCatalog.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.category}: {item.title} ({item.questionCount} q)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          <div className="setup-facts">
            <span><BookOpen size={16} /> {bankQuestionCount} questions in bank</span>
            <span><Sparkles size={16} /> {eligibleQuestionCount} eligible at {difficultyOptions.find((option) => option.value === selectedDifficulty)?.label}</span>
            <span><Clock3 size={16} /> {minutesPerQuestion} min/question pace</span>
            <span><ShieldCheck size={16} /> Timed attempt with auto-save</span>
          </div>

          <div className="setup-length-heading">
            <div>
              <h2>Choose difficulty</h2>
              <p>Difficulty determines both the question pool and the time allowed per question.</p>
            </div>
            <span>{bankQuestionCount} total in bank</span>
          </div>
          <div className="difficulty-options" role="group" aria-label="Exam difficulty">
            {difficultyOptions.map((option) => {
              const eligibleCount = countForDifficulty(selectedExam, option.value)
              const isSelected = selectedDifficulty === option.value
              const isAvailable = eligibleCount > 0
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={!isAvailable}
                  className={`difficulty-card ${option.cardClass} ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                  onClick={() => {
                    if (!isAvailable) return
                    const nextCounts = countsForDifficulty(selectedExam, option.value)
                    setSelectedDifficulty(option.value)
                    setSelectedQuestionCount((current) => nextCounts.includes(current) ? current : (nextCounts.includes(5) ? 5 : (nextCounts[0] || 0)))
                  }}
                >
                  <div className="difficulty-card-header">
                    <span className="difficulty-tier-badge">{option.levelTag}</span>
                    <span className="difficulty-rate-badge">{option.pace}</span>
                  </div>
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                  <small>{eligibleCount > 0 ? `${eligibleCount} eligible` : '0 eligible (unavailable)'}</small>
                </button>
              )
            })}
          </div>

          <div className="setup-length-heading">
            <div>
              <h2>Choose exam length</h2>
              <p>Questions are randomly drawn from the eligible pool and saved for this attempt.</p>
            </div>
            <span>{eligibleQuestionCount} available at {selectedDifficulty} level</span>
          </div>
          <div className="length-options" role="group" aria-label="Question count">
            {supportedCounts.map((count) => {
              const isSelected = selectedQuestionCount === count
              const duration = estimateDurationMinutes(count, selectedDifficulty, selectedExam.minutesPerQuestionByDifficulty)
              return (
                <button
                  key={count}
                  type="button"
                  aria-pressed={isSelected}
                  className={isSelected ? 'selected' : ''}
                  title={`${count} question exam`}
                  onClick={() => setSelectedQuestionCount(count)}
                >
                  <strong>{count}</strong>
                  <span>questions</span>
                  <small className="preset-duration">~{duration} min</small>
                </button>
              )
            })}
          </div>
          {supportedCounts.length === 0 && (
            <div className="length-empty-state" role="status">
              <AlertCircle size={16} />
              <span>No supported question counts for this difficulty level (minimum 5 questions required). Choose a different difficulty tier above.</span>
            </div>
          )}
          <p className="setup-bank-note">
            {eligibleQuestionCount === 0
              ? 'No questions are available at this difficulty tier.'
              : `${eligibleQuestionCount} questions are eligible in the question bank at ${difficultyOptions.find((option) => option.value === selectedDifficulty)?.label} level. Higher presets are unavailable.`}
          </p>

          <div className="setup-duration-card">
            <div className="duration-highlight">
              <div className="duration-icon-wrap">
                <Clock3 size={22} />
              </div>
              <div className="duration-main">
                <span className="duration-kicker">ESTIMATED EXAM DURATION</span>
                <div className="setup-duration">
                  <span>Estimated time · {selectedDifficulty}: {minutesPerQuestion ?? '—'} min/question</span>
                  <strong>
                    <Clock3 size={18} /> {configuredDuration === null ? 'Choose an available count' : `${configuredDuration} minutes`}
                  </strong>
                </div>
              </div>
              {configuredDuration !== null && (
                <div className="duration-pace-pill">
                  <span>{selectedDifficulty} Rate</span>
                  <strong>{minutesPerQuestion} min / q</strong>
                </div>
              )}
            </div>
            <div className="duration-details">
              {configuredDuration !== null ? (
                <p>
                  <span>Duration calculation: </span>
                  <code>{selectedQuestionCount} questions × {minutesPerQuestion} min/question = {configuredDuration} minutes</code>
                  <span className="duration-subnote"> · Timer countdown begins when you launch. Answers auto-save continuously.</span>
                </p>
              ) : (
                <p className="duration-warning">Select an available question count above to preview exam duration.</p>
              )}
            </div>
          </div>

          {notice && <p className="auth-error" role="alert">{notice}</p>}
          <div className="setup-actions">
            <button className="button button-quiet" onClick={() => setPage(setupReturnPage)}>Cancel</button>
            <button
              className="button button-primary"
              disabled={!supportedCounts.includes(selectedQuestionCount) || authBusy}
              onClick={() => void beginExam(selectedExam, null, selectedQuestionCount)}
            >
              <CheckCircle2 size={17} /> {authBusy ? 'Starting exam…' : `Start ${selectedQuestionCount || '—'}-question exam`}
            </button>
          </div>
        </section>
      </main>
    )
  }

  if (page === 'exam' && exam) {
    const currentQuestions = exam.questions
    const question = currentQuestions[currentQuestion]
    return (
      <main className="exam-shell">
        <header className="exam-topbar">
          <a className="brand" href="#dashboard" onClick={(event) => { event.preventDefault(); setPage('dashboard') }}><span className="brand-mark"><GraduationCap size={21} /></span><span>Q65<span className="brand-light"> Online Exam</span></span></a>
          <div className="exam-top-title"><span className="eyebrow">EXAM IN PROGRESS</span><strong>{exam.title}</strong></div>
          <div className="exam-header-actions"><div className={`timer ${remaining < 300 ? 'timer-warning' : ''}`}><Clock3 size={17} /><span>{formattedTime}</span><small>remaining</small></div><button className="icon-button" aria-label="Sign out" title="Sign out" onClick={signOut} disabled={authBusy}><LogOut size={18} /></button></div>
        </header>
        <div className="exam-progress"><span style={{ width: `${((currentQuestion + 1) / currentQuestions.length) * 100}%` }} /></div>
        <div className="exam-layout">
          <section className="question-panel">
            <div className="question-meta"><span>QUESTION {String(currentQuestion + 1).padStart(2, '0')} <i>/ {String(currentQuestions.length).padStart(2, '0')}</i></span><button className={`text-button ${review.includes(currentQuestion) ? 'is-flagged' : ''}`} onClick={toggleReview}><Flag size={16} /> {review.includes(currentQuestion) ? 'Marked for review' : 'Mark for review'}</button></div>
            <h1>{question.prompt}</h1>
            <p className="question-hint">Choose one answer.</p>
            <div className="answer-list">{question.options.map((option, index) => <button key={option} className={`answer-option ${answers[currentQuestion] === index ? 'selected' : ''}`} onClick={() => selectAnswer(index)}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{answers[currentQuestion] === index && <Check size={18} />}</button>)}</div>
            <div className="question-actions"><button className="button button-quiet" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((number) => number - 1)}><ArrowLeft size={17} /> Previous</button><span>{Object.keys(answers).length} of {currentQuestions.length} answered · {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'error' ? 'Save failed' : 'Saved'}</span>{currentQuestion < currentQuestions.length - 1 ? <button className="button button-primary" onClick={() => setCurrentQuestion((number) => number + 1)}>Next question <ArrowRight size={17} /></button> : <button className="button button-primary" onClick={requestSubmit}><CheckCircle2 size={17} /> Submit exam</button>}</div>
          </section>
          <aside className="question-sidebar"><h2>Question map</h2><p>Jump to any question at any time.</p><div className="question-grid">{currentQuestions.map((item, index) => <button key={item.id || item.prompt} aria-label={`Question ${index + 1}${answers[index] !== undefined ? ', answered' : ', unanswered'}${review.includes(index) ? ', marked for review' : ''}`} className={`question-number ${index === currentQuestion ? 'current' : ''} ${answers[index] !== undefined ? 'answered' : ''} ${review.includes(index) ? 'flagged' : ''}`} onClick={() => setCurrentQuestion(index)}>{index + 1}</button>)}</div><div className="map-legend"><span><i className="legend-dot current-dot" />Current</span><span><i className="legend-dot answered-dot" />Answered</span><span><i className="legend-dot" />Unanswered</span></div><div className="sidebar-divider" /><div className="exam-note"><ShieldCheck size={19} /><p>{exam.previewMode ? 'Answers stay available while you navigate this preview.' : 'Your answers are saved as you go. You can return to any question before submitting.'}</p></div><button className="text-button submit-link" onClick={requestSubmit}>Finish and submit <ChevronRight size={16} /></button></aside>
        </div>
      </main>
    )
  }

  if (page === 'resultDetail' && result) {
    return (
      <main className="result-page">
        <header className="result-header">
          <a className="brand" href="#dashboard" onClick={(event) => { event.preventDefault(); setPage('dashboard') }}><span className="brand-mark"><GraduationCap size={21} /></span><span>Q65<span className="brand-light"> Online Exam</span></span></a>
          <div className="result-header-actions"><span className="preview-label">{result.verified ? 'SERVER VERIFIED' : 'PREVIEW RESULT'}</span><button className="icon-button" aria-label="Sign out" title="Sign out" onClick={signOut} disabled={authBusy}><LogOut size={18} /></button></div>
        </header>
        <section className="result-card">
          <span className="result-icon"><CheckCircle2 size={27} /></span><p className="eyebrow">EXAM SUBMITTED</p><h1>{result.title}</h1>
          <p className="result-lede">Your responses have been recorded. Here’s your result.</p>
          <div className="score-ring" style={{ '--score': `${result.percentage}%` }}><div><strong>{result.percentage}%</strong><span>your score</span></div></div>
          <div className="result-breakdown"><div><strong>{result.total}</strong><span>Total questions</span></div><div><strong>{result.correct}</strong><span>Correct</span></div><div><strong>{result.incorrect}</strong><span>Incorrect</span></div><div><strong>{result.unanswered}</strong><span>Unanswered</span></div></div>
          {!result.verified && <p className="preview-note">Preview mode: this score is calculated locally and is not a saved result.</p>}
          <button className="button button-primary" onClick={() => setPage('dashboard')}>Back to dashboard <ArrowRight size={17} /></button>
        </section>
      </main>
    )
  }

  const isStaff = student.role === 'teacher' || student.role === 'admin'

  return (
    <div className="app-shell">
      <aside className="rail">
        <a className="brand" href="#dashboard" onClick={(event) => { event.preventDefault(); setPage(isStaff ? 'teacherDashboard' : 'dashboard') }}>
          <span className="brand-mark"><GraduationCap size={21} /></span>
          <span>Q65<span className="brand-light"> Online Exam</span></span>
        </a>
        <div className="rail-label">{isStaff ? 'INSTRUCTOR SPACE' : 'LEARNING SPACE'}</div>
        <nav>
          {isStaff && (
            <button
              className={`nav-item ${page === 'teacherDashboard' ? 'active' : ''}`}
              onClick={() => setPage('teacherDashboard')}
            >
              <GraduationCap size={18} />
              <span>Teacher Portal</span>
            </button>
          )}
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => setPage(id)}>
              <Icon size={18} />
              <span>{label}</span>
              {id === 'available' && <span className="nav-count">{examCatalog.length}</span>}
            </button>
          ))}
        </nav>
        <div className="rail-bottom">
          <div className="help-block">
            <span className="help-illustration"><Sparkles size={18} /></span>
            <strong>{isStaff ? 'Teacher Controls' : 'Keep your momentum'}</strong>
            <p>{isStaff ? 'Create custom exams and assign them to departments and classes.' : 'Small steps add up. Your next exam is waiting.'}</p>
            <button onClick={() => setPage(isStaff ? 'teacherDashboard' : 'available')}>
              {isStaff ? 'Open Dashboard' : 'Explore exams'} <ArrowRight size={14} />
            </button>
          </div>
          <button className="nav-item logout" onClick={signOut} disabled={authBusy}><LogOut size={18} /><span>Sign out</span></button>
          <div className="rail-user">
            <span className="avatar">{initials}</span>
            <span>
              <strong>{student.name}</strong>
              <small>{student.role === 'teacher' ? 'Teacher / Educator' : student.role === 'admin' ? 'Administrator' : 'Student account'}</small>
            </span>
            <Menu size={17} />
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>{page === 'teacherDashboard' ? 'Instructor portal' : 'Student portal'}</span>
            <ChevronRight size={14} />
            <strong>{page === 'teacherDashboard' ? 'Teacher Dashboard' : (navigation.find((item) => item.id === page)?.label || 'Exam results')}</strong>
          </div>
          <div className="topbar-actions">
            {isStaff && (
              page === 'teacherDashboard' ? (
                <button className="button button-outline" style={{ minHeight: '34px', padding: '0 12px', fontSize: '12px' }} onClick={() => setPage('dashboard')}>
                  <BookOpen size={15} /> Student View
                </button>
              ) : (
                <button className="button button-primary" style={{ minHeight: '34px', padding: '0 12px', fontSize: '12px' }} onClick={() => setPage('teacherDashboard')}>
                  <GraduationCap size={15} /> Teacher Portal
                </button>
              )
            )}
            <button className="icon-button" aria-label="Search exams" onClick={() => setPage('available')}><Search size={18} /></button>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
            <button className="icon-button signout-mobile" aria-label="Sign out" title="Sign out" onClick={signOut} disabled={authBusy}><LogOut size={18} /></button>
            <span className="top-avatar">{initials}</span>
          </div>
        </header>
        <div className="content-wrap">
          <div className={`preview-banner ${apiConnected ? 'connected-banner' : ''}`}>
            <span>{apiConnected ? <><CheckCircle2 size={15} /> DATABASE CONNECTED</> : <><Sparkles size={15} /> PREVIEW MODE</>}</span>
            <p>{apiConnected ? `Logged in as ${student.name} (${student.email}) · Role: ${student.role}` : 'Sample content is clearly marked until the API is running.'}</p>
            {!loading && <button aria-label="Dismiss status notice" onClick={(event) => event.currentTarget.parentElement.remove()}><X size={15} /></button>}
          </div>
          {notice && <div className="error-banner" role="alert">{notice}</div>}
          {page === 'teacherDashboard' && (
            <TeacherPortal
              student={student}
              apiConnected={apiConnected}
              apiRequest={apiRequest}
              formatDate={formatDate}
              onSwitchToStudentView={async () => {
                await loadPortal(student)
                setPage('dashboard')
              }}
              onExamCreated={async () => { await loadPortal(student) }}
            />
          )}
          {page === 'dashboard' && (
            <>
              <section className="welcome-row">
                <div>
                  <p className="eyebrow">{today}</p>
                  <h1>Welcome back, {student.name.split(' ')[0]} <span>✳</span></h1>
                  <p className="welcome-copy">A little progress today goes a long way. Ready to continue?</p>
                </div>
                {isStaff ? (
                  <button className="button button-primary" onClick={() => setPage('teacherDashboard')}>
                    <GraduationCap size={17} /> Open Teacher Portal
                  </button>
                ) : (
                  <button className="button button-primary" onClick={() => setPage('available')}>
                    <Compass size={17} /> Find an exam
                  </button>
                )}
              </section>

              {studentAssignments && studentAssignments.length > 0 && (
                <section className="assigned-section">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">TARGETED ASSIGNMENTS</p>
                      <h2>Assigned to You</h2>
                    </div>
                    <span className="badge-pill" style={{ background: '#e3f6e8', color: '#186e42', padding: '3px 8px', borderRadius: '4px', font: '700 11px DM Sans' }}>{studentAssignments.length} assigned</span>
                  </div>
                  <div className="assigned-grid">
                    {studentAssignments.map((assignment) => {
                      const examObj = typeof assignment.exam === 'object' ? assignment.exam : examCatalog.find((e) => e.id === assignment.exam)
                      const isExpired = assignment.isExpired
                      const notStarted = !assignment.isStarted

                      return (
                        <article key={assignment.id} className="assigned-card">
                          <div className="assigned-badge-row">
                            <span className="assigned-flag">
                              <Calendar size={13} /> ASSIGNED EXAM
                            </span>
                            <span className={`status-pill ${assignment.canAttempt ? 'pill-green' : isExpired ? 'pill-gray' : 'pill-yellow'}`}>
                              {assignment.canAttempt ? 'Active Now' : isExpired ? 'Closed' : notStarted ? 'Upcoming' : 'Attempts Used'}
                            </span>
                          </div>
                          <h3 className="assigned-title">{assignment.title}</h3>
                          <div className="assigned-meta">
                            <span>Exam: <strong>{examObj?.title || 'Course Exam'}</strong></span>
                            <span>Deadline: <strong>{formatDate(assignment.deadline)}</strong></span>
                            <span>Attempts: <strong>{assignment.attemptsUsed} / {assignment.maxAttempts} used</strong></span>
                            {assignment.presetQuestionCount && <span>Preset: <strong>{assignment.presetQuestionCount} questions ({assignment.presetDifficulty || 'Standard'})</strong></span>}
                          </div>
                          <div className="assigned-action-row">
                            <span style={{ fontSize: '11px', color: '#627267' }}>
                              {assignment.canAttempt ? `${assignment.attemptsRemaining} attempt${assignment.attemptsRemaining > 1 ? 's' : ''} left` : isExpired ? 'Deadline passed' : notStarted ? 'Starts soon' : 'Limit reached'}
                            </span>
                            <button
                              className="button button-primary"
                              style={{ minHeight: '30px', padding: '0 12px', fontSize: '11px' }}
                              disabled={!assignment.canAttempt}
                              onClick={() => {
                                const questionCount = assignment.presetQuestionCount || 5
                                void beginExam(examObj, null, questionCount, assignment.id)
                              }}
                            >
                              {assignment.canAttempt ? 'Start Assignment' : 'Unavailable'} <ArrowRight size={14} />
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              )}

              <section className="stats-row"><Stat icon={BookOpen} color="mint" label="AVAILABLE EXAMS" value={loading ? '—' : examCatalog.length} caption="ready to explore" /><Stat icon={Clock3} color="peach" label="PENDING EXAMS" value={loading ? '—' : pendingExamCount} caption="not yet completed" /><Stat icon={FileCheck2} color="blue" label="COMPLETED" value={loading ? '—' : completedAttempts.length} caption="submitted attempts" /><Stat icon={Sparkles} color="yellow" label="BEST SCORE" value={bestScore === null ? '—' : `${bestScore}%`} caption={bestScore === null ? 'no attempts yet' : 'across completed exams'} /></section><section className="dashboard-grid"><div className="exam-section"><div className="section-heading"><div><p className="eyebrow">YOUR NEXT CHALLENGE</p><h2>Exams to explore</h2></div><button className="inline-link" onClick={() => setPage('available')}>View all <ArrowRight size={15} /></button></div><div className="exam-list">{examCatalog.slice(0, 2).map((item) => { const pending = attempts.find((attempt) => attempt.status === 'in_progress' && attempt.examId === item.id); return <ExamCard key={item.id} exam={item} onStart={startExam} activeAttempt={pending} /> })}{!loading && examCatalog.length === 0 && <div className="empty-state">No exams are currently available.</div>}</div></div><aside className="side-column"><section className="focus-panel"><div className="focus-top"><span className="focus-symbol"><Clock3 size={19} /></span><span className="status-pill">{activeAttempt ? 'IN PROGRESS' : 'READY WHEN YOU ARE'}</span></div><p className="eyebrow">{activeAttempt ? 'PICK UP WHERE YOU LEFT OFF' : 'YOUR NEXT STEP'}</p><h3>{activeAttempt?.examTitle || examCatalog[0]?.title || 'No exam available'}</h3><p>{activeAttempt ? `${activeAttempt.answeredCount || 0} answers saved · Timer continues at resume` : 'Choose an available exam to begin a timed attempt.'}</p>{activeAttempt && <div className="mini-progress"><span style={{ width: `${Math.min(100, ((activeAttempt.answeredCount || 0) / Math.max(1, examCatalog.find((item) => item.id === activeAttempt.examId)?.questionCount || 1)) * 100)}%` }} /></div>}<div className="focus-footer"><span>{activeAttempt ? 'Your saved attempt is ready' : 'Browse available exams'}</span><button aria-label={activeAttempt ? 'Resume exam' : 'Browse exams'} onClick={() => activeAttempt ? void startExam(null, activeAttempt.id) : setPage('available')}><ArrowRight size={18} /></button></div></section><section className="recent-panel"><div className="section-heading"><div><p className="eyebrow">YOUR RECORD</p><h2>Recent result</h2></div><button className="icon-button" aria-label="See all results" onClick={() => setPage('results')}><ArrowRight size={17} /></button></div>{completedAttempts[0] ? <RecentResult attempt={completedAttempts[0]} /> : <div className="empty-result">No submitted exam results yet.</div>}</section></aside></section></>
          )}
          {page === 'available' && <section className="page-section"><div className="page-title-row"><div><p className="eyebrow">FIND YOUR NEXT CHALLENGE</p><h1>Available exams</h1><p className="welcome-copy">Choose a subject, inspect the question bank, then configure your exam.</p></div><div className="catalog-filters"><label className="subject-filter">Subject<select aria-label="Filter by subject" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}><option value="all">All subjects</option>{subjects.filter((subject) => subject.examCount > 0).map((subject) => <option key={subject.slug} value={subject.slug}>{subject.title} ({subject.examCount})</option>)}</select></label><label className="search-field"><Search size={17} /><input aria-label="Search available exams" placeholder="Search exams" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div></div><div className="catalog-summary">{filteredExams.length} exams · {subjects.filter((subject) => subject.examCount > 0).length} subjects</div><div className="exam-list exam-list-wide">{filteredExams.length ? filteredExams.map((item) => { const pending = attempts.find((attempt) => attempt.status === 'in_progress' && attempt.examId === item.id); return <ExamCard key={item.id} exam={item} onStart={startExam} activeAttempt={pending} /> }) : <div className="empty-state">{loading ? 'Loading available exams…' : search ? `No exams match “${search}” for this subject.` : 'No exams are currently available for this subject.'}</div>}</div></section>}
          {page === 'results' && <section className="page-section"><div className="page-title-row"><div><p className="eyebrow">YOUR PROGRESS</p><h1>My results</h1><p className="welcome-copy">A record of exams you have completed.</p></div></div>{completedAttempts.length ? <div className="results-table"><div className="table-head"><span>EXAM</span><span>DATE</span><span>SCORE</span><span>RESULT</span></div>{completedAttempts.map((attempt) => <div className="table-row" key={attempt.id}><div><span className="result-stamp"><CheckCircle2 size={18} /></span><strong>{attempt.examTitle}</strong></div><span>{formatDate(attempt.submittedAt)}</span><b>{attempt.result.correctAnswers}/{attempt.result.totalQuestions}</b><button className="score-pill result-button" onClick={() => showAttemptResult(attempt)} aria-label={`View result for ${attempt.examTitle}`}>{attempt.result.percentage}%</button></div>)}</div> : <div className="empty-state">{loading ? 'Loading your results…' : 'Completed exams will appear here after you submit an attempt.'}</div>}</section>}
          {page === 'profile' && <section className="page-section"><div className="page-title-row"><div><p className="eyebrow">ACCOUNT SETTINGS</p><h1>My profile</h1><p className="welcome-copy">Your student information and preferences.</p></div></div><div className="profile-panel"><div className="profile-heading"><span className="profile-avatar">{initials}</span><div><h2>{student.name}</h2><p>Student account · {student.studentNumber}</p></div></div><div className="profile-fields"><label>Full name<input value={student.name} readOnly /></label><label>Email address<input value={student.email} readOnly /></label><label>Student ID<input value={student.studentNumber} readOnly /></label><label>Preferred language<input value="English" readOnly /></label></div><p className="preview-footnote">Profile editing requires account authentication.</p></div></section>}
        </div>
      </main>
    </div>
  )
}

function Stat({ icon: Icon, color, label, value, caption }) {
  return <article className="stat-block"><span className={`stat-icon stat-${color}`}><Icon size={18} /></span><div><small>{label}</small><strong>{value}</strong></div><span className="stat-caption">{caption}</span></article>
}

function RecentResult({ attempt }) {
  return <div className="recent-result"><span className="result-stamp"><CheckCircle2 size={18} /></span><div><strong>{attempt.examTitle}</strong><small>{formatDate(attempt.submittedAt)} · {attempt.result.correctAnswers}/{attempt.result.totalQuestions} correct</small></div><b>{attempt.result.percentage}%</b></div>
}

function ExamCard({ exam, onStart, activeAttempt }) {
  const supportedCounts = exam.supportedQuestionCounts || [5]
  const diffCounts = exam.difficultyQuestionCounts || {}
  return (
    <article className="exam-card">
      <div className={`exam-card-mark ${exam.color}`}>
        <BookOpen size={20} />
      </div>
      <div className="exam-card-body">
        <div className="exam-card-top-row">
          <span className="eyebrow">{exam.category}</span>
          {activeAttempt && <span className="attempt-badge">Attempt In Progress</span>}
        </div>
        <h3>{exam.title}</h3>
        <p>{exam.description}</p>
        <div className="exam-details">
          <span><FileCheck2 size={15} />{exam.questionCount} in question bank</span>
          <span><Clock3 size={15} />1.0–2.0 min/q pace</span>
          <span className="difficulty">{exam.difficulty}</span>
        </div>
        {diffCounts.Beginner !== undefined && (
          <div className="exam-card-tiers">
            <span className="tier-pill tier-pill-beginner">Beginner: {diffCounts.Beginner || 0}</span>
            <span className="tier-pill tier-pill-intermediate">Intermediate: {diffCounts.Intermediate || 0}</span>
            <span className="tier-pill tier-pill-advanced">Advanced: {diffCounts.Advanced || 0}</span>
          </div>
        )}
        <small className="supported-lengths">
          Supported lengths: {supportedCounts.map((count) => `${count}`).join(', ')} questions
        </small>
      </div>
      <div className="exam-card-action">
        <small>AVAILABLE UNTIL {String(exam.due).toUpperCase()}</small>
        <button className="button button-outline" onClick={() => void onStart(exam, activeAttempt?.id)}>
          {activeAttempt ? 'Resume attempt' : 'Configure exam'} <ArrowRight size={16} />
        </button>
      </div>
    </article>
  )
}

export default App
