import { DataSource, Repository } from 'typeorm';
import { OATest } from '../entities/OATest';

export class OATestRepository {
  private repository: Repository<OATest>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(OATest);
  }

  async createTest(testData: Partial<OATest>): Promise<OATest> {
    const test = this.repository.create(testData);
    return this.repository.save(test);
  }

  async findById(id: string, tenantId: string): Promise<OATest | null> {
    return this.repository.findOne({
      where: { id, tenant_id: tenantId },
    });
  }

  async findAllPublished(
    tenantId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<[OATest[], number]> {
    return this.repository.findAndCount({
      where: {
        tenant_id: tenantId,
        isPublished: true,
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findByCompany(
    tenantId: string,
    company: string,
    limit: number = 20
  ): Promise<OATest[]> {
    return this.repository.find({
      where: {
        tenant_id: tenantId,
        company,
        isPublished: true,
      },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async findByCategory(
    tenantId: string,
    category: string,
    limit: number = 20
  ): Promise<OATest[]> {
    return this.repository
      .createQueryBuilder('test')
      .where('test.tenant_id = :tenantId', { tenantId })
      .andWhere("test.categories @> :category", { category: `["${category}"]` })
      .andWhere('test.isPublished = true')
      .orderBy('test.created_at', 'DESC')
      .limit(limit)
      .getMany();
  }

  async findByDifficulty(
    tenantId: string,
    difficulty: 'easy' | 'medium' | 'hard',
    limit: number = 20
  ): Promise<OATest[]> {
    return this.repository.find({
      where: {
        tenant_id: tenantId,
        difficulty,
        isPublished: true,
      },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async findUserProgress(
    tenantId: string,
    userId: string
  ): Promise<OATest[]> {
    return this.repository.find({
      where: {
        tenant_id: tenantId,
        user_id: userId,
      },
      order: { updated_at: 'DESC' },
    });
  }

  async findCompleted(
    tenantId: string,
    userId: string,
    limit: number = 20
  ): Promise<OATest[]> {
    return this.repository.find({
      where: {
        tenant_id: tenantId,
        user_id: userId,
        status: 'completed',
      },
      order: { updated_at: 'DESC' },
      take: limit,
    });
  }

  async findInProgress(
    tenantId: string,
    userId: string
  ): Promise<OATest[]> {
    return this.repository.find({
      where: {
        tenant_id: tenantId,
        user_id: userId,
        status: 'in-progress',
      },
    });
  }

  async updateTest(
    id: string,
    tenantId: string,
    testData: Partial<OATest>
  ): Promise<OATest | null> {
    await this.repository.update(
      { id, tenant_id: tenantId },
      testData
    );
    return this.findById(id, tenantId);
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: 'not-started' | 'in-progress' | 'completed',
    score?: number,
    completedDate?: string
  ): Promise<OATest | null> {
    const updateData: any = { status };
    if (score !== undefined) {
      updateData.bestScore = Math.max(score, (await this.findById(id, tenantId))?.bestScore || 0);
    }
    if (completedDate) {
      updateData.completedDate = completedDate;
    }
    return this.updateTest(id, tenantId, updateData);
  }

  async incrementAttempts(id: string, tenantId: string): Promise<void> {
    await this.repository.increment(
      { id, tenant_id: tenantId },
      'attempts',
      1
    );
  }

  async saveUserProgress(
    id: string,
    tenantId: string,
    userId: string,
    userAnswers: (string | number)[],
    correctCount: number,
    status: 'in-progress' | 'completed'
  ): Promise<OATest | null> {
    const updateData: any = {
      user_id: userId,
      userAnswers,
      correctAnswersCount: correctCount,
      status,
    };

    if (status === 'completed') {
      const score = (correctCount / (await this.findById(id, tenantId))!.totalQuestions) * 100;
      updateData.bestScore = score;
      updateData.completedDate = new Date().toISOString();
    }

    return this.updateTest(id, tenantId, updateData);
  }

  async getStatistics(tenantId: string, userId: string): Promise<any> {
    const tests = await this.findUserProgress(tenantId, userId);
    const completed = tests.filter(t => t.status === 'completed');
    const averageScore =
      completed.length > 0
        ? completed.reduce((sum, t) => sum + (t.bestScore || 0), 0) / completed.length
        : 0;

    return {
      totalTestsTaken: completed.length,
      averageScore: Math.round(averageScore),
      bestScore: Math.max(...completed.map(t => t.bestScore || 0), 0),
      totalAttempts: tests.reduce((sum, t) => sum + t.attempts, 0),
      categoryBreakdown: this.getCategoryBreakdown(tests),
    };
  }

  private getCategoryBreakdown(tests: OATest[]): any {
    const breakdown: any = {};
    tests.forEach(test => {
      test.categories.forEach(cat => {
        if (!breakdown[cat]) {
          breakdown[cat] = { taken: 0, avgScore: 0, total: 0 };
        }
        breakdown[cat].taken += 1;
        breakdown[cat].total += test.bestScore || 0;
        breakdown[cat].avgScore = breakdown[cat].total / breakdown[cat].taken;
      });
    });
    return breakdown;
  }

  async deleteTest(id: string, tenantId: string): Promise<boolean> {
    const result = await this.repository.delete({
      id,
      tenant_id: tenantId,
    });
    return result.affected ? result.affected > 0 : false;
  }

  async deleteOlderThan(tenantId: string, days: number): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const result = await this.repository.delete({
      tenant_id: tenantId,
      created_at: { $lt: date } as any,
    });
    return result.affected || 0;
  }
}
