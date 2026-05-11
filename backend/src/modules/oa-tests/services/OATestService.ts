export class OATestService {
  constructor(private oaTestRepository: OATestRepository) {}

  async createTest(
    tenantId: string,
    testData: Partial<OATest>,
    userId?: string
  ): Promise<OATest> {
    if (!testData.title || !testData.company) {
      throw new BadRequestException('Title and company are required');
    }

    const test = await this.oaTestRepository.createTest({
      ...testData,
      tenant_id: tenantId,
      user_id: userId,
      isPublished: testData.isPublished ?? true,
      questions: testData.questions || [],
    });

    return test;
  }

  async getTestById(testId: string, tenantId: string): Promise<OATest> {
    const test = await this.oaTestRepository.findById(testId, tenantId);
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }

  async getAllPublishedTests(
    tenantId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ tests: OATest[]; total: number }> {
    const [tests, total] = await this.oaTestRepository.findAllPublished(
      tenantId,
      limit,
      offset
    );
    return { tests, total };
  }

  async getTestsByCompany(
    tenantId: string,
    company: string,
    limit: number = 20
  ): Promise<OATest[]> {
    return this.oaTestRepository.findByCompany(tenantId, company, limit);
  }

  async getTestsByCategory(
    tenantId: string,
    category: string,
    limit: number = 20
  ): Promise<OATest[]> {
    return this.oaTestRepository.findByCategory(tenantId, category, limit);
  }

  async getTestsByDifficulty(
    tenantId: string,
    difficulty: 'easy' | 'medium' | 'hard',
    limit: number = 20
  ): Promise<OATest[]> {
    return this.oaTestRepository.findByDifficulty(tenantId, difficulty, limit);
  }

  async getUserProgress(tenantId: string, userId: string): Promise<OATest[]> {
    return this.oaTestRepository.findUserProgress(tenantId, userId);
  }

  async startTest(
    testId: string,
    tenantId: string,
    userId: string
  ): Promise<OATest> {
    const test = await this.getTestById(testId, tenantId);
    
    if (!test.questions || test.questions.length === 0) {
      throw new BadRequestException('Test has no questions');
    }

    // Create user-specific copy of the test
    const userTest = {
      ...test,
      user_id: userId,
      status: 'in-progress' as const,
      userAnswers: [],
      correctAnswersCount: 0,
    };

    await this.oaTestRepository.incrementAttempts(testId, tenantId);
    return userTest;
  }

  async submitTest(
    testId: string,
    tenantId: string,
    userId: string,
    userAnswers: (string | number)[]
  ): Promise<{ test: OATest; score: number }> {
    const test = await this.getTestById(testId, tenantId);

    if (!test.questions || test.questions.length === 0) {
      throw new BadRequestException('Test has no questions');
    }

    // Calculate score
    let correctCount = 0;
    for (let i = 0; i < test.questions.length; i++) {
      if (userAnswers[i] === test.questions[i].correctAnswer) {
        correctCount++;
      }
    }

    const score = (correctCount / test.totalQuestions) * 100;
    const _passed = score >= test.passingScore;

    // Save user progress
    const updatedTest = await this.oaTestRepository.saveUserProgress(
      testId,
      tenantId,
      userId,
      userAnswers,
      correctCount,
      'completed'
    );

    return {
      test: updatedTest!,
      score: Math.round(score),
    };
  }

  async getCompletedTests(
    tenantId: string,
    userId: string,
    limit: number = 20
  ): Promise<OATest[]> {
    return this.oaTestRepository.findCompleted(tenantId, userId, limit);
  }

  async getInProgressTests(
    tenantId: string,
    userId: string
  ): Promise<OATest[]> {
    return this.oaTestRepository.findInProgress(tenantId, userId);
  }

  async getUserStatistics(
    tenantId: string,
    userId: string
  ): Promise<any> {
    return this.oaTestRepository.getStatistics(tenantId, userId);
  }

  async updateTest(
    testId: string,
    tenantId: string,
    testData: Partial<OATest>
  ): Promise<OATest> {
    await this.getTestById(testId, tenantId);
    return this.oaTestRepository.updateTest(testId, tenantId, testData) as Promise<OATest>;
  }

  async deleteTest(testId: string, tenantId: string): Promise<boolean> {
    await this.getTestById(testId, tenantId); // Verify test exists
    return this.oaTestRepository.deleteTest(testId, tenantId);
  }

  async addQuestions(
    testId: string,
    tenantId: string,
    questions: Question[]
  ): Promise<OATest> {
    const test = await this.getTestById(testId, tenantId);
    
    const updatedQuestions = [...(test.questions || []), ...questions];
    
    return this.oaTestRepository.updateTest(testId, tenantId, {
      questions: updatedQuestions,
      totalQuestions: updatedQuestions.length,
    }) as Promise<OATest>;
  }

  async getAnswerExplanations(
    testId: string,
    tenantId: string,
    userAnswers: (string | number)[]
  ): Promise<any[]> {
    const test = await this.getTestById(testId, tenantId);
    
    return test.questions!.map((question, idx) => ({
      questionId: question.id,
      question: question.question,
      userAnswer: userAnswers[idx],
      correctAnswer: question.correctAnswer,
      isCorrect: userAnswers[idx] === question.correctAnswer,
      explanation: question.explanation || 'No explanation available',
    }));
  }

  async generateReport(
    testId: string,
    tenantId: string,
    userId: string
  ): Promise<any> {
    const test = await this.getTestById(testId, tenantId);
    const statistics = await this.getUserStatistics(tenantId, userId);

    return {
      testTitle: test.title,
      company: test.company,
      difficulty: test.difficulty,
      duration: test.duration,
      totalQuestions: test.totalQuestions,
      passingScore: test.passingScore,
      bestScore: test.bestScore,
      correctAnswers: test.correctAnswersCount,
      totalPassed: test.passingScore ? (test.bestScore! >= test.passingScore ? 1 : 0) : 0,
      categories: test.categories,
      completedDate: test.completedDate,
      userStatistics: statistics,
    };
  }
}
