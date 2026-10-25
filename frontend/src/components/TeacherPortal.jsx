import { useEffect, useState } from 'react'
import {
  AlertCircle, ArrowLeft, ArrowRight, Award, BookOpen, Calendar,
  Check, CheckCircle2, ChevronRight, Clock, FileCheck2, FileText,
  Filter, GraduationCap, LayoutDashboard, ListFilter, Plus, PlusCircle,
  RefreshCw, School, Search, Settings, ShieldCheck, Sparkles, Trash2,
  TrendingUp, Users, X,
} from 'lucide-react'

export default function TeacherPortal({
  student,
  apiConnected,
  apiRequest,
  formatDate,
  onSwitchToStudentView,
  onExamCreated,
}) {
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'create-exam' | 'assignments' | 'new-assignment' | 'submissions' | 'departments'
  const [exams, setExams] = useState([])
  const [assignments, setAssignments] = useState([])
  const [departments, setDepartments] = useState([])
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedAssignmentForSubmissions, setSelectedAssignmentForSubmissions] = useState(null)
  const [submissionsData, setSubmissionsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  // Create Exam Form State
  const [examTitle, setExamTitle] = useState('')
  const [examCategory, setExamCategory] = useState('')
  const [examDescription, setExamDescription] = useState('')
  const [examDifficulty, setExamDifficulty] = useState('Intermediate')
  const [examDuration, setExamDuration] = useState(30)
  const [examQuestions, setExamQuestions] = useState([
    {
      prompt: '',
      options: ['', '', '', ''],
      correctOption: 0,
      explanation: '',
      difficulty: 'Intermediate',
    },
  ])

  // Create Assignment Form State
  const [assignExamId, setAssignExamId] = useState('')
  const [assignTitle, setAssignTitle] = useState('')
  const [assignTargetType, setAssignTargetType] = useState('all') // 'all' | 'department' | 'class' | 'individual'
  const [assignTargetDepartments, setAssignTargetDepartments] = useState([])
  const [assignTargetClasses, setAssignTargetClasses] = useState([])
  const [assignTargetStudents, setAssignTargetStudents] = useState([])
  const [assignScheduledStart, setAssignScheduledStart] = useState(() => {
    const d = new Date()
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  })
  const [assignDeadline, setAssignDeadline] = useState(() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  })
  const [assignMaxAttempts, setAssignMaxAttempts] = useState(1)
  const [assignPresetCount, setAssignPresetCount] = useState('')
  const [assignPresetDifficulty, setAssignPresetDifficulty] = useState('')
  const [assignInstructions, setAssignInstructions] = useState('')

  // Create Department & Class Form State
  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptCode, setNewDeptCode] = useState('')
  const [newDeptDesc, setNewDeptDesc] = useState('')
  const [newClassName, setNewClassName] = useState('')
  const [newClassDept, setNewClassDept] = useState('')
  const [newClassYear, setNewClassYear] = useState('2025-2026')

  // Load teacher data
  async function loadData() {
    setLoading(true)
    setActionError('')
    try {
      const [examData, assignData, deptData, classData, studentData] = await Promise.all([
        apiRequest('/api/exams'),
        apiRequest('/api/assignments'),
        apiRequest('/api/departments'),
        apiRequest('/api/classes'),
        apiRequest('/api/students').catch(() => ({ students: [] })),
      ])
      setExams(examData.exams || [])
      setAssignments(assignData.assignments || [])
      setDepartments(deptData.departments || [])
      setClasses(classData.classes || [])
      setStudents(studentData.students || [])

      if (!assignExamId && examData.exams?.length > 0) {
        setAssignExamId(examData.exams[0].id)
        setAssignTitle(`${examData.exams[0].title} Assignment`)
      }
      if (!newClassDept && deptData.departments?.length > 0) {
        setNewClassDept(deptData.departments[0].id)
      }
    } catch (err) {
      setActionError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle Exam Creation
  function addQuestion() {
    setExamQuestions((prev) => [
      ...prev,
      {
        prompt: '',
        options: ['', '', '', ''],
        correctOption: 0,
        explanation: '',
        difficulty: examDifficulty,
      },
    ])
  }

  function removeQuestion(index) {
    if (examQuestions.length <= 1) return
    setExamQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  function updateQuestion(index, field, value) {
    setExamQuestions((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function updateQuestionOption(qIndex, optIndex, value) {
    setExamQuestions((prev) => {
      const next = [...prev]
      const nextOptions = [...next[qIndex].options]
      nextOptions[optIndex] = value
      next[qIndex] = { ...next[qIndex], options: nextOptions }
      return next
    })
  }

  async function handleCreateExam(e) {
    e.preventDefault()
    setActionError('')
    setActionSuccess('')

    if (!examTitle.trim() || !examCategory.trim()) {
      setActionError('Title and Category are required.')
      return
    }

    // Validate questions
    for (let i = 0; i < examQuestions.length; i++) {
      const q = examQuestions[i]
      if (!q.prompt.trim()) {
        setActionError(`Question ${i + 1} requires a question prompt.`)
        return
      }
      for (let o = 0; o < 4; o++) {
        if (!q.options[o].trim()) {
          setActionError(`Question ${i + 1}, Option ${String.fromCharCode(65 + o)} cannot be empty.`)
          return
        }
      }
    }

    try {
      const payload = {
        title: examTitle.trim(),
        category: examCategory.trim(),
        description: examDescription.trim() || `Custom exam on ${examCategory.trim()}`,
        difficulty: examDifficulty,
        durationMinutes: Number(examDuration) || 30,
        questions: examQuestions.map((q) => ({
          prompt: q.prompt.trim(),
          options: q.options.map((opt) => opt.trim()),
          correctOption: Number(q.correctOption),
          explanation: q.explanation.trim(),
          difficulty: q.difficulty || examDifficulty,
        })),
      }

      const res = await apiRequest('/api/exams', {
        method: 'POST',
        body: payload,
      })

      setActionSuccess(`Exam "${res.exam.title}" created successfully with ${payload.questions.length} questions!`)
      setExamTitle('')
      setExamCategory('')
      setExamDescription('')
      setExamQuestions([
        { prompt: '', options: ['', '', '', ''], correctOption: 0, explanation: '', difficulty: 'Intermediate' },
      ])
      await loadData()
      if (onExamCreated) onExamCreated(res.exam)
    } catch (err) {
      setActionError(err.message)
    }
  }

  // Handle Assignment Creation
  async function handleCreateAssignment(e) {
    e.preventDefault()
    setActionError('')
    setActionSuccess('')

    if (!assignExamId) {
      setActionError('Select an exam to assign.')
      return
    }

    try {
      const payload = {
        examId: assignExamId,
        title: assignTitle.trim(),
        targetType: assignTargetType,
        targetDepartments: assignTargetType === 'department' ? assignTargetDepartments : [],
        targetClasses: assignTargetType === 'class' ? assignTargetClasses : [],
        targetStudents: assignTargetType === 'individual' ? assignTargetStudents : [],
        scheduledStartAt: new Date(assignScheduledStart),
        deadline: new Date(assignDeadline),
        maxAttempts: Number(assignMaxAttempts) || 1,
        presetQuestionCount: assignPresetCount ? Number(assignPresetCount) : undefined,
        presetDifficulty: assignPresetDifficulty || undefined,
        instructions: assignInstructions.trim(),
      }

      const res = await apiRequest('/api/assignments', {
        method: 'POST',
        body: payload,
      })

      setActionSuccess(`Assignment "${res.assignment.title}" created successfully!`)
      setActiveTab('assignments')
      await loadData()
    } catch (err) {
      setActionError(err.message)
    }
  }

  // Handle Submissions Inspection
  async function viewSubmissions(assignmentId) {
    setLoading(true)
    setActionError('')
    try {
      const data = await apiRequest(`/api/assignments/${assignmentId}/submissions`)
      setSelectedAssignmentForSubmissions(assignmentId)
      setSubmissionsData(data)
      setActiveTab('submissions')
    } catch (err) {
      setActionError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Assignment Close
  async function toggleAssignmentStatus(assignment) {
    const nextStatus = assignment.status === 'published' ? 'closed' : 'published'
    try {
      await apiRequest(`/api/assignments/${assignment.id}`, {
        method: 'PUT',
        body: { status: nextStatus },
      })
      await loadData()
      setActionSuccess(`Assignment marked as ${nextStatus}.`)
    } catch (err) {
      setActionError(err.message)
    }
  }

  // Handle Department Creation
  async function handleCreateDepartment(e) {
    e.preventDefault()
    setActionError('')
    setActionSuccess('')
    if (!newDeptName.trim() || !newDeptCode.trim()) {
      setActionError('Department name and code are required.')
      return
    }
    try {
      await apiRequest('/api/departments', {
        method: 'POST',
        body: { name: newDeptName.trim(), code: newDeptCode.trim().toUpperCase(), description: newDeptDesc.trim() },
      })
      setActionSuccess(`Department "${newDeptName.trim()}" created successfully!`)
      setNewDeptName('')
      setNewDeptCode('')
      setNewDeptDesc('')
      await loadData()
    } catch (err) {
      setActionError(err.message)
    }
  }

  // Handle Class Creation
  async function handleCreateClass(e) {
    e.preventDefault()
    setActionError('')
    setActionSuccess('')
    if (!newClassName.trim() || !newClassDept) {
      setActionError('Class name and department are required.')
      return
    }
    try {
      await apiRequest('/api/classes', {
        method: 'POST',
        body: { name: newClassName.trim(), department: newClassDept, academicYear: newClassYear.trim() },
      })
      setActionSuccess(`Class "${newClassName.trim()}" created successfully!`)
      setNewClassName('')
      await loadData()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const myAuthoredExams = exams.filter((e) => e.createdBy === student.id || e.contentSource === 'user_created')

  return (
    <div className="teacher-portal">
      {/* Top Bar with Mode Switcher */}
      <div className="teacher-top-banner">
        <div className="teacher-role-indicator">
          <span className="teacher-badge"><GraduationCap size={16} /> INSTRUCTOR PORTAL</span>
          <span className="teacher-account-name">Logged in as <strong>{student.name}</strong> ({student.role})</span>
        </div>
        <div className="teacher-banner-actions">
          <button className="button button-outline teacher-switch-btn" onClick={onSwitchToStudentView}>
            <Users size={15} /> Switch to Student View
          </button>
        </div>
      </div>

      {/* Teacher Navigation Tabs */}
      <nav className="teacher-nav-tabs" role="tablist">
        <button
          className={`t-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={16} /> Overview
        </button>
        <button
          className={`t-tab ${activeTab === 'create-exam' ? 'active' : ''}`}
          onClick={() => setActiveTab('create-exam')}
        >
          <PlusCircle size={16} /> Create Custom Exam
        </button>
        <button
          className={`t-tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <FileCheck2 size={16} /> Assignments ({assignments.length})
        </button>
        <button
          className={`t-tab ${activeTab === 'new-assignment' ? 'active' : ''}`}
          onClick={() => setActiveTab('new-assignment')}
        >
          <Calendar size={16} /> Assign Exam
        </button>
        <button
          className={`t-tab ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          <School size={16} /> Departments & Classes ({departments.length}/{classes.length})
        </button>
      </nav>

      {/* Notifications */}
      {actionError && (
        <div className="error-banner teacher-alert" role="alert">
          <AlertCircle size={16} /> {actionError}
          <button className="banner-dismiss" onClick={() => setActionError('')}><X size={14} /></button>
        </div>
      )}
      {actionSuccess && (
        <div className="success-banner teacher-alert" role="status">
          <CheckCircle2 size={16} /> {actionSuccess}
          <button className="banner-dismiss" onClick={() => setActionSuccess('')}><X size={14} /></button>
        </div>
      )}

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="teacher-view-content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">TEACHER ADMINISTRATION</p>
              <h1>Instructor Control Center</h1>
              <p className="welcome-copy">Author custom exams, configure cohort assignments, and evaluate student attempts.</p>
            </div>
            <div className="quick-actions-bar">
              <button className="button button-primary" onClick={() => setActiveTab('create-exam')}>
                <Plus size={15} /> Create Exam
              </button>
              <button className="button button-outline" onClick={() => setActiveTab('new-assignment')}>
                <Calendar size={15} /> Assign Exam
              </button>
            </div>
          </div>

          <section className="stats-row">
            <div className="stat-block">
              <span className="stat-icon stat-mint"><BookOpen size={18} /></span>
              <div><small>AUTHORED EXAMS</small><strong>{myAuthoredExams.length}</strong></div>
              <span className="stat-caption">custom created</span>
            </div>
            <div className="stat-block">
              <span className="stat-icon stat-peach"><FileCheck2 size={18} /></span>
              <div><small>ACTIVE ASSIGNMENTS</small><strong>{assignments.filter((a) => a.status === 'published').length}</strong></div>
              <span className="stat-caption">running cohorts</span>
            </div>
            <div className="stat-block">
              <span className="stat-icon stat-blue"><School size={18} /></span>
              <div><small>DEPARTMENTS & CLASSES</small><strong>{departments.length} / {classes.length}</strong></div>
              <span className="stat-caption">organized cohorts</span>
            </div>
            <div className="stat-block">
              <span className="stat-icon stat-yellow"><Users size={18} /></span>
              <div><small>REGISTERED STUDENTS</small><strong>{students.length}</strong></div>
              <span className="stat-caption">eligible test-takers</span>
            </div>
          </section>

          {/* Active Assignments Overview */}
          <section className="teacher-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">COHORT TRACKING</p>
                <h2>Active Assignments</h2>
              </div>
              <button className="inline-link" onClick={() => setActiveTab('assignments')}>
                View all assignments <ArrowRight size={14} />
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="empty-state">
                <p>No exam assignments have been created yet.</p>
                <button className="button button-primary" style={{ marginTop: 10 }} onClick={() => setActiveTab('new-assignment')}>
                  <Calendar size={15} /> Create Your First Assignment
                </button>
              </div>
            ) : (
              <div className="assignments-table-card">
                <table className="teacher-table">
                  <thead>
                    <tr>
                      <th>Assignment Title</th>
                      <th>Target</th>
                      <th>Deadline</th>
                      <th>Max Attempts</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.slice(0, 5).map((a) => (
                      <tr key={a.id}>
                        <td>
                          <strong>{a.title}</strong>
                          <small className="table-sub">{a.exam?.title || 'Exam'}</small>
                        </td>
                        <td>
                          <span className="target-badge">{a.targetType.toUpperCase()}</span>
                        </td>
                        <td>{formatDate(a.deadline)}</td>
                        <td>{a.maxAttempts}</td>
                        <td>
                          <span className={`status-pill ${a.status === 'published' ? 'pill-green' : 'pill-gray'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td>
                          <button className="button button-quiet btn-compact" onClick={() => viewSubmissions(a.id)}>
                            View Submissions
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: CREATE CUSTOM EXAM */}
      {activeTab === 'create-exam' && (
        <div className="teacher-view-content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">QUESTION BANK AUTHORING</p>
              <h1>Create Custom Exam</h1>
              <p className="welcome-copy">Design custom exam questions with multi-choice options, correct answers, and explanations.</p>
            </div>
          </div>

          <form className="teacher-form-card" onSubmit={handleCreateExam}>
            <div className="form-grid-2">
              <label>
                Exam Title *
                <input
                  type="text"
                  placeholder="e.g. Advanced Operating Systems Midterm"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  required
                />
              </label>
              <label>
                Subject / Category *
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={examCategory}
                  onChange={(e) => setExamCategory(e.target.value)}
                  required
                />
              </label>
            </div>

            <label>
              Description *
              <textarea
                rows={2}
                placeholder="Brief summary of exam scope and test objectives..."
                value={examDescription}
                onChange={(e) => setExamDescription(e.target.value)}
                required
              />
            </label>

            <div className="form-grid-2">
              <label>
                Base Difficulty
                <select value={examDifficulty} onChange={(e) => setExamDifficulty(e.target.value)}>
                  <option value="Beginner">Beginner (1.0 min/q pace)</option>
                  <option value="Intermediate">Intermediate (1.5 min/q pace)</option>
                  <option value="Advanced">Advanced (2.0 min/q pace)</option>
                </select>
              </label>
              <label>
                Duration (minutes)
                <input
                  type="number"
                  min={5}
                  max={360}
                  value={examDuration}
                  onChange={(e) => setExamDuration(e.target.value)}
                  required
                />
              </label>
            </div>

            {/* Questions Builder */}
            <div className="questions-builder-header">
              <h3>Questions ({examQuestions.length})</h3>
              <button type="button" className="button button-outline" onClick={addQuestion}>
                <Plus size={15} /> Add Another Question
              </button>
            </div>

            <div className="questions-list">
              {examQuestions.map((q, qIndex) => (
                <div key={qIndex} className="question-builder-card">
                  <div className="question-card-head">
                    <span className="question-number-badge">Question {qIndex + 1}</span>
                    {examQuestions.length > 1 && (
                      <button
                        type="button"
                        className="button-icon-danger"
                        title="Delete question"
                        onClick={() => removeQuestion(qIndex)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <label>
                    Question Prompt *
                    <textarea
                      rows={2}
                      placeholder="Type the question prompt..."
                      value={q.prompt}
                      onChange={(e) => updateQuestion(qIndex, 'prompt', e.target.value)}
                      required
                    />
                  </label>

                  <div className="options-grid">
                    {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                      <div key={optIdx} className="option-row">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correctOption === optIdx}
                            onChange={() => updateQuestion(qIndex, 'correctOption', optIdx)}
                          />
                          <span className="correct-tag">Correct ({letter})</span>
                        </label>
                        <input
                          type="text"
                          placeholder={`Option ${letter} text...`}
                          value={q.options[optIdx]}
                          onChange={(e) => updateQuestionOption(qIndex, optIdx, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div className="form-grid-2" style={{ marginTop: 12 }}>
                    <label>
                      Explanation / Rationale
                      <input
                        type="text"
                        placeholder="Explanation shown after grading..."
                        value={q.explanation}
                        onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                      />
                    </label>
                    <label>
                      Difficulty
                      <select
                        value={q.difficulty || examDifficulty}
                        onChange={(e) => updateQuestion(qIndex, 'difficulty', e.target.value)}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-submit-row">
              <button type="button" className="button button-outline" onClick={addQuestion}>
                <Plus size={15} /> Add Question
              </button>
              <button type="submit" className="button button-primary">
                <CheckCircle2 size={16} /> Publish Custom Exam
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ASSIGNMENTS LIST */}
      {activeTab === 'assignments' && (
        <div className="teacher-view-content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">COHORT SCHEDULES & DEADLINES</p>
              <h1>All Exam Assignments</h1>
              <p className="welcome-copy">Manage assigned platform and custom exams, observe student progress, and close completed tests.</p>
            </div>
            <button className="button button-primary" onClick={() => setActiveTab('new-assignment')}>
              <Calendar size={15} /> Create New Assignment
            </button>
          </div>

          <div className="assignments-table-card">
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Assignment Title & Exam</th>
                  <th>Target Type</th>
                  <th>Schedule & Deadline</th>
                  <th>Attempt Limits</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.title}</strong>
                      <span className="table-sub">{a.exam?.title || 'Exam'}</span>
                    </td>
                    <td>
                      <span className="target-badge">{a.targetType.toUpperCase()}</span>
                    </td>
                    <td>
                      <small>Starts: {formatDate(a.scheduledStartAt)}</small>
                      <br />
                      <strong>Due: {formatDate(a.deadline)}</strong>
                    </td>
                    <td>
                      <strong>{a.maxAttempts} attempt{a.maxAttempts > 1 ? 's' : ''}</strong>
                      {a.presetQuestionCount && <small className="table-sub">{a.presetQuestionCount} questions</small>}
                    </td>
                    <td>
                      <span className={`status-pill ${a.status === 'published' ? 'pill-green' : 'pill-gray'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-action-group">
                        <button className="button button-primary btn-compact" onClick={() => viewSubmissions(a.id)}>
                          Submissions
                        </button>
                        <button className="button button-quiet btn-compact" onClick={() => toggleAssignmentStatus(a)}>
                          {a.status === 'published' ? 'Close' : 'Reopen'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: NEW ASSIGNMENT CREATION */}
      {activeTab === 'new-assignment' && (
        <div className="teacher-view-content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">COHORT ASSIGNMENT CONFIGURATION</p>
              <h1>Assign Exam to Students</h1>
              <p className="welcome-copy">Assign any existing platform exam or custom-authored exam to departments, class groups, or individual students.</p>
            </div>
          </div>

          <form className="teacher-form-card" onSubmit={handleCreateAssignment}>
            <label>
              Select Exam to Assign *
              <select
                value={assignExamId}
                onChange={(e) => {
                  setAssignExamId(e.target.value)
                  const ex = exams.find((x) => x.id === e.target.value)
                  if (ex) setAssignTitle(`${ex.title} Assignment`)
                }}
                required
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.category} · {ex.questionCount || 0} questions · {ex.difficulty})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Assignment Title *
              <input
                type="text"
                value={assignTitle}
                onChange={(e) => setAssignTitle(e.target.value)}
                required
              />
            </label>

            <div className="form-group">
              <label>Target Audience *</label>
              <div className="target-type-selector">
                {[
                  { value: 'all', label: 'All Students (Open)' },
                  { value: 'department', label: 'Department' },
                  { value: 'class', label: 'Class Group / Cohort' },
                  { value: 'individual', label: 'Specific Students' },
                ].map((target) => (
                  <button
                    key={target.value}
                    type="button"
                    className={`target-pill ${assignTargetType === target.value ? 'selected' : ''}`}
                    onClick={() => setAssignTargetType(target.value)}
                  >
                    {target.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Selectors */}
            {assignTargetType === 'department' && (
              <label>
                Select Department *
                <select
                  value={assignTargetDepartments[0] || ''}
                  onChange={(e) => setAssignTargetDepartments([e.target.value])}
                  required
                >
                  <option value="">Choose a department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </label>
            )}

            {assignTargetType === 'class' && (
              <label>
                Select Class Group *
                <select
                  value={assignTargetClasses[0] || ''}
                  onChange={(e) => setAssignTargetClasses([e.target.value])}
                  required
                >
                  <option value="">Choose a class...</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.department?.code || 'Dept'} · {cls.academicYear})
                    </option>
                  ))}
                </select>
              </label>
            )}

            {assignTargetType === 'individual' && (
              <label>
                Select Student *
                <select
                  value={assignTargetStudents[0] || ''}
                  onChange={(e) => setAssignTargetStudents([e.target.value])}
                  required
                >
                  <option value="">Choose a student...</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.email} · {st.studentNumber})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="form-grid-2">
              <label>
                Scheduled Start Date & Time *
                <input
                  type="datetime-local"
                  value={assignScheduledStart}
                  onChange={(e) => setAssignScheduledStart(e.target.value)}
                  required
                />
              </label>
              <label>
                Submission Deadline *
                <input
                  type="datetime-local"
                  value={assignDeadline}
                  onChange={(e) => setAssignDeadline(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="form-grid-3">
              <label>
                Max Attempts (1–10)
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={assignMaxAttempts}
                  onChange={(e) => setAssignMaxAttempts(e.target.value)}
                  required
                />
              </label>
              <label>
                Preset Question Count (Optional)
                <select value={assignPresetCount} onChange={(e) => setAssignPresetCount(e.target.value)}>
                  <option value="">Student Choice (Default)</option>
                  <option value="5">5 questions</option>
                  <option value="10">10 questions</option>
                  <option value="15">15 questions</option>
                  <option value="20">20 questions</option>
                  <option value="25">25 questions</option>
                  <option value="30">30 questions</option>
                  <option value="50">50 questions</option>
                </select>
              </label>
              <label>
                Preset Difficulty (Optional)
                <select value={assignPresetDifficulty} onChange={(e) => setAssignPresetDifficulty(e.target.value)}>
                  <option value="">Student Choice (Default)</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </label>
            </div>

            <label>
              Instructions / Notes for Candidates
              <textarea
                rows={2}
                placeholder="Important instructions regarding grading, pacing, and allowed materials..."
                value={assignInstructions}
                onChange={(e) => setAssignInstructions(e.target.value)}
              />
            </label>

            <div className="form-submit-row">
              <button type="button" className="button button-quiet" onClick={() => setActiveTab('assignments')}>
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                <CheckCircle2 size={16} /> Create & Publish Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: SUBMISSIONS & GRADEBOOK */}
      {activeTab === 'submissions' && submissionsData && (
        <div className="teacher-view-content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">ACADEMIC EVALUATION & RESULTS</p>
              <h1>Submissions: {submissionsData.title}</h1>
              <p className="welcome-copy">Review student exam completions, scores, and accuracy percentages.</p>
            </div>
            <button className="button button-quiet" onClick={() => setActiveTab('assignments')}>
              <ArrowLeft size={15} /> Back to Assignments
            </button>
          </div>

          <section className="stats-row">
            <div className="stat-block">
              <span className="stat-icon stat-mint"><FileCheck2 size={18} /></span>
              <div><small>TOTAL ATTEMPTS</small><strong>{submissionsData.totalSubmissions}</strong></div>
              <span className="stat-caption">candidates recorded</span>
            </div>
            <div className="stat-block">
              <span className="stat-icon stat-blue"><Award size={18} /></span>
              <div>
                <small>AVERAGE SCORE</small>
                <strong>
                  {submissionsData.totalSubmissions > 0
                    ? Math.round(submissionsData.submissions.reduce((acc, s) => acc + (s.result?.percentage || 0), 0) / submissionsData.totalSubmissions)
                    : 0}%
                </strong>
              </div>
              <span className="stat-caption">cohort average</span>
            </div>
            <div className="stat-block">
              <span className="stat-icon stat-yellow"><TrendingUp size={18} /></span>
              <div>
                <small>HIGHEST SCORE</small>
                <strong>
                  {submissionsData.totalSubmissions > 0
                    ? Math.max(...submissionsData.submissions.map((s) => s.result?.percentage || 0))
                    : 0}%
                </strong>
              </div>
              <span className="stat-caption">peak score</span>
            </div>
            <div className="stat-block">
              <span className="stat-icon stat-peach"><Clock size={18} /></span>
              <div><small>SUBMITTED</small><strong>{submissionsData.submissions.filter((s) => s.status === 'submitted').length}</strong></div>
              <span className="stat-caption">fully completed</span>
            </div>
          </section>

          {submissionsData.submissions.length === 0 ? (
            <div className="empty-state">
              <p>No students have submitted attempts for this assignment yet.</p>
            </div>
          ) : (
            <div className="assignments-table-card">
              <table className="teacher-table">
                <thead>
                  <tr>
                    <th>Student Name & ID</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Submitted</th>
                    <th>Score</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {submissionsData.submissions.map((sub) => (
                    <tr key={sub.attemptId}>
                      <td>
                        <strong>{sub.student?.name || 'Unknown Student'}</strong>
                        <span className="table-sub">{sub.student?.email} ({sub.student?.studentNumber})</span>
                      </td>
                      <td>
                        <span className={`status-pill ${sub.status === 'submitted' ? 'pill-green' : 'pill-yellow'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td>{formatDate(sub.startedAt)}</td>
                      <td>{sub.submittedAt ? formatDate(sub.submittedAt) : 'In progress'}</td>
                      <td>
                        <strong>{sub.result?.correctAnswers ?? '—'} / {sub.result?.totalQuestions ?? '—'}</strong>
                      </td>
                      <td>
                        <span className="score-badge">
                          {sub.result?.percentage !== undefined ? `${sub.result.percentage}%` : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: DEPARTMENTS & CLASSES MANAGEMENT */}
      {activeTab === 'departments' && (
        <div className="teacher-view-content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">ORGANIZATIONAL STRUCTURE</p>
              <h1>Departments & Class Cohorts</h1>
              <p className="welcome-copy">Manage departments and class groups for precise exam assignment targeting.</p>
            </div>
          </div>

          <div className="org-grid-layout">
            {/* Create Department Card */}
            <div className="org-card">
              <h3>Create Department</h3>
              <form onSubmit={handleCreateDepartment}>
                <label>
                  Department Name *
                  <input
                    type="text"
                    placeholder="e.g. Computer Science & Engineering"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Department Code (Unique, e.g. CS) *
                  <input
                    type="text"
                    placeholder="e.g. CS"
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Description
                  <input
                    type="text"
                    placeholder="e.g. Faculty of Engineering and Technology"
                    value={newDeptDesc}
                    onChange={(e) => setNewDeptDesc(e.target.value)}
                  />
                </label>
                <button type="submit" className="button button-primary" style={{ marginTop: 10 }}>
                  <Plus size={15} /> Add Department
                </button>
              </form>

              <div className="org-list">
                <h4>Existing Departments ({departments.length})</h4>
                {departments.map((d) => (
                  <div key={d.id} className="org-item">
                    <strong>{d.name}</strong>
                    <span className="code-pill">{d.code}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Class Group Card */}
            <div className="org-card">
              <h3>Create Class Group / Cohort</h3>
              <form onSubmit={handleCreateClass}>
                <label>
                  Class / Cohort Name *
                  <input
                    type="text"
                    placeholder="e.g. CS-Year-2026-A"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Department *
                  <select value={newClassDept} onChange={(e) => setNewClassDept(e.target.value)} required>
                    <option value="">Select Department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </label>
                <label>
                  Academic Year
                  <input
                    type="text"
                    value={newClassYear}
                    onChange={(e) => setNewClassYear(e.target.value)}
                  />
                </label>
                <button type="submit" className="button button-primary" style={{ marginTop: 10 }}>
                  <Plus size={15} /> Add Class Cohort
                </button>
              </form>

              <div className="org-list">
                <h4>Existing Classes ({classes.length})</h4>
                {classes.map((c) => (
                  <div key={c.id} className="org-item">
                    <strong>{c.name}</strong>
                    <span className="code-pill">{c.department?.code || 'DEPT'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
