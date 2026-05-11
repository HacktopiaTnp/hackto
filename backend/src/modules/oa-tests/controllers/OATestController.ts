import {
  Post,
  Get,
  Put,
  Delete,
} from '@nestjs/common';
import { OATestService } from '../services/OATestService';
import { OATest, Question } from '../entities/OATest';

export class OATestController {
  constructor(private oaTestService: OATestService) {}

  private getTenantId(headers: any): string {
    const tenantId = headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }
    return tenantId;
  }

  private getUserId(headers: any): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return userId;
  }

  // CREATE - Add new test
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createTest(
    @Headers() headers: any,
    @Body() testData: Partial<OATest>
  ): Promise<OATest> {
    const tenantId = this.getTenantId(headers);
    const userId = this.getUserId(headers);
    return this.oaTestService.createTest(tenantId, testData, userId);
  }

  // READ - Get all published tests
  @Get('list')
  async getAllTests(
    @Headers() headers: any,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0'
  ): Promise<{ tests: OATest[]; total: number }> {
    const tenantId = this.getTenantId(headers);
    return this.oaTestService.getAllPublishedTests(
      tenantId,
      parseInt(limit),
      parseInt(offset)
    );
  }

  // READ - Get single test by ID
  @Get(':testId')
  async getTestById(
    @Headers() headers: any,
    @Param('testId') testId: string
  ): Promise<OATest> {
    const tenantId = this.getTenantId(headers);
    return this.oaTestService.getTestById(testId, tenantId);
  }

  // READ - Get tests by company
  @Get('company/:company')
  async getTestsByCompany(
    @Headers() headers: any,
    @Param('company') company: string,
    @Query('limit') limit: string = '20'
  ): Promise<OATest[]> {
    const tenantId = this.getTenantId(headers);
    return this.oaTestService.getTestsByCompany(tenantId, company, parseInt(limit));
  }

  // READ - Get tests by category
  @Get('category/:category')
  async getTestsByCategory(
    @Headers() headers: any,
    @Param('category') category: string,
    @Query('limit') limit: string = '20'
  ): Promise<OATest[]> {
    const tenantId = this.getTenantId(headers);
    return this.oaTestService.getTestsByCategory(tenantId, category, parseInt(limit));
  }

  // READ - Get tests by difficulty
  @Get('difficulty/:difficulty')
  async getTestsByDifficulty(
    @Headers() headers: any,
    @Param('difficulty') difficulty: 'easy' | 'medium' | 'hard',
    @Query('limit') limit: string = '20'
  ): Promise<OATest[]> {
    const tenantId = this.getTenantId(headers);
    return this.oaTestService.getTestsByDifficulty(tenantId, difficulty, parseInt(limit));
  }

  // READ - Get user's test progress
  @Get('user/:userId/progress')
  async getUserProgress(
    @Headers() headers: any,
    @Param('userId') userId: string
  ): Promise<OATest[]> {
    const tenantId = this.getTenantId(headers);
    return this.oaTestService.getUserProgress(tenantId, userId);
  }

  // READ - Get completed tests for user
  @Get('user/:userId/completed')
  async getCompletedTests(
    @Headers() headers: any,
    @Param('userId') userId: string,
    @Query('limit') limit: string = '20'
  ): Promise<OATest[]> {
    const tenantId = this.getTenantId(headers);
    return this.oaTestService.getCompletedTests(tenantId, userId, parseInt(limit));
  }

  // READ - Get user statistics
  @Get('user/:userId/stats')
  async getUserStatistics(
    @Headers() headers: any,
    @Param('userId') userId: string
  ): Promise<any> {
    const tenantId = this.getTenantId(headers);
    return this.oaTestService.getUserStatistics(tenantId, userId);
  }

  // ACTION - Start test
  @Post(':testId/start')
  @HttpCode(HttpStatus.OK)
  async startTest(
    @Headers() headers: any,
    @Param('testId') testId: string
  ): Promise<OATest> {
    const tenantId = this.getTenantId(headers);
    const userId = this.getUserId(headers);
    return this.oaTestService.startTest(testId, tenantId, userId);
  }

  // ACTION - Submit test
  @Post(':testId/submit')
  @HttpCode(HttpStatus.OK)
  async submitTest(
    @Headers() headers: any,
    @Param('testId') testId: string,
    @Body() body: { userAnswers: (string | number)[] }
  ): Promise<{ test: OATest; score: number }> {
    const tenantId = this.getTenantId(headers);
    const userId = this.getUserId(headers);

    if (!body.userAnswers || !Array.isArray(body.userAnswers)) {
      throw new BadRequestException('userAnswers array is required');
    }

    return this.oaTestService.submitTest(
      testId,
      tenantId,
      userId,
      body.userAnswers
    );
  }

  // ACTION - Get answer explanations
  @Post(':testId/explanations')
  @HttpCode(HttpStatus.OK)
  async getExplanations(
    @Headers() headers: any,
    @Param('testId') testId: string,
    @Body() body: { userAnswers: (string | number)[] }
  ): Promise<any[]> {
    const tenantId = this.getTenantId(headers);
    return this.oaTestService.getAnswerExplanations(testId, tenantId, body.userAnswers);
  }

  // ACTION - Generate report
  @Get(':testId/report')
  async generateReport(
    @Headers() headers: any,
    @Param('testId') testId: string
  ): Promise<any> {
    const tenantId = this.getTenantId(headers);
    const userId = this.getUserId(headers);
    return this.oaTestService.generateReport(testId, tenantId, userId);
  }

  // UPDATE - Update test
  @Put(':testId')
  @HttpCode(HttpStatus.OK)
  async updateTest(
    @Headers() headers: any,
    @Param('testId') testId: string,
    @Body() testData: Partial<OATest>
  ): Promise<OATest> {
    const tenantId = this.getTenantId(headers);
    return this.oaTestService.updateTest(testId, tenantId, testData);
  }

  // UPDATE - Add questions to test
  @Post(':testId/questions')
  @HttpCode(HttpStatus.OK)
  async addQuestions(
    @Headers() headers: any,
    @Param('testId') testId: string,
    @Body() body: { questions: Question[] }
  ): Promise<OATest> {
    const tenantId = this.getTenantId(headers);

    if (!body.questions || !Array.isArray(body.questions)) {
      throw new BadRequestException('questions array is required');
    }

    return this.oaTestService.addQuestions(testId, tenantId, body.questions);
  }

  // DELETE - Delete test
  @Delete(':testId')
  @HttpCode(HttpStatus.OK)
  async deleteTest(
    @Headers() headers: any,
    @Param('testId') testId: string
  ): Promise<{ success: boolean }> {
    const tenantId = this.getTenantId(headers);
    const success = await this.oaTestService.deleteTest(testId, tenantId);
    return { success };
  }
}
