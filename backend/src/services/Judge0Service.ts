import axios, { AxiosError } from 'axios';
import { logger } from '@core/logger/logger';

interface CodeExecutionRequest {
  sourceCode: string;
  languageId: number;
  stdin?: string;
  timeLimit?: number;
  memoryLimit?: number;
}

interface CodeExecutionResponse {
  status: {
    id: number;
    description: string;
  };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string;
  memory: string;
  token: string;
}

interface TestCaseResult {
  passed: boolean;
  executionTime: number;
  memory: number;
  output: string;
  expectedOutput: string;
  input: string;
}

// Language ID Mapping (Judge0)
const languageMap: Record<string, number> = {
  python: 71,
  python3: 71,
  cpp: 54,
  cpp17: 54,
  java: 62,
  javascript: 63,
  js: 63,
  typescript: 74,
  csharp: 51,
  c: 50,
  ruby: 72,
  go: 60,
  rust: 73,
};

export class Judge0Service {
  private apiUrl: string;
  private apiKey: string;
  private apiHost: string;

  constructor() {
    this.apiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    this.apiKey = process.env.JUDGE0_API_KEY || '';
    this.apiHost = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';
  }

  /**
   * Get language ID from name
   */
  getLanguageId(language: string): number {
    const langId = languageMap[language.toLowerCase()];
    if (!langId) {
      throw new Error(`Unsupported language: ${language}`);
    }
    return langId;
  }

  /**
   * Execute code using Judge0
   */
  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResponse> {
    try {
      const payload = {
        source_code: request.sourceCode,
        language_id: request.languageId,
        stdin: request.stdin || '',
        cpu_time_limit: request.timeLimit || 5,
        memory_limit: request.memoryLimit || 256000,
      };

      const options = {
        method: 'POST',
        url: `${this.apiUrl}/submissions`,
        params: { base64_encoded: false, wait: true },
        headers: {
          'content-type': 'application/json',
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.apiHost,
        },
        data: payload,
      };

      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      logger.error('Judge0 Code Execution Failed', error);
      throw new Error(
        error instanceof AxiosError
          ? error.response?.data?.message || error.message
          : 'Code execution failed'
      );
    }
  }

  /**
   * Run code with custom input
   */
  async runWithInput(
    code: string,
    language: string,
    input: string,
    timeLimit?: number
  ): Promise<{ output: string; runtime: string; memory: string; status: string }> {
    try {
      const languageId = this.getLanguageId(language);
      const result = await this.executeCode({
        sourceCode: code,
        languageId,
        stdin: input,
        timeLimit,
      });

      return {
        output: result.stdout || result.stderr || '',
        runtime: result.time || '0.00s',
        memory: result.memory || '0 MB',
        status: result.status.description,
      };
    } catch (error) {
      logger.error('Run with Input Failed', error);
      throw error;
    }
  }

  /**
   * Test code against multiple test cases
   */
  async testCodeAgainstCases(
    code: string,
    language: string,
    testCases: Array<{ input: string; expectedOutput: string }>
  ): Promise<TestCaseResult[]> {
    try {
      const languageId = this.getLanguageId(language);
      const results: TestCaseResult[] = [];

      for (const testCase of testCases) {
        const startTime = Date.now();
        const result = await this.executeCode({
          sourceCode: code,
          languageId,
          stdin: testCase.input,
        });
        const executionTime = Date.now() - startTime;

        const passed =
          (result.stdout?.trim() === testCase.expectedOutput.trim() &&
            result.status.id === 3) ||
          (result.status.id === 1 && result.stderr === null);

        results.push({
          passed,
          executionTime,
          memory: parseInt(result.memory || '0'),
          output: result.stdout?.trim() || '',
          expectedOutput: testCase.expectedOutput.trim(),
          input: testCase.input,
        });
      }

      return results;
    } catch (error) {
      logger.error('Test Against Cases Failed', error);
      throw error;
    }
  }

  /**
   * Parse Judge0 status
   */
  parseStatus(statusId: number, statusDescription: string): string {
    const statusMap: Record<number, string> = {
      1: 'In Queue',
      2: 'Processing',
      3: 'Accepted',
      4: 'Wrong Answer',
      5: 'Time Limit Exceeded',
      6: 'Compilation Error',
      7: 'Runtime Error',
      8: 'Memory Limit Exceeded',
      9: 'Output Limit Exceeded',
      10: 'Restricted Function',
      11: 'Internal Error',
      12: 'File IO Error',
      13: 'Excessive Output',
      14: 'Execution Timeout',
    };

    return statusMap[statusId] || statusDescription;
  }

  /**
   * Format code execution result
   */
  formatExecutionResult(response: CodeExecutionResponse): any {
    return {
      status: this.parseStatus(response.status.id, response.status.description),
      statusCode: response.status.id,
      output: response.stdout || response.compile_output || response.stderr || '',
      runtime: response.time,
      memory: response.memory,
      error: response.compile_output || response.stderr,
    };
  }
}

export default new Judge0Service();
