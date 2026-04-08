import { describe, it, expect } from 'vitest';
import { sanitizeJsonControlChars, parseAIResponse } from './prompts';

describe('sanitizeJsonControlChars', () => {
  it('JSON 구조의 줄바꿈은 유지', () => {
    const input = '{\n  "key": "value"\n}';
    const result = sanitizeJsonControlChars(input);
    expect(JSON.parse(result)).toEqual({ key: 'value' });
  });

  it('문자열 값 내 리터럴 줄바꿈을 \\n으로 이스케이프', () => {
    const input = '{"text": "첫째 줄\n둘째 줄"}';
    const result = sanitizeJsonControlChars(input);
    const parsed = JSON.parse(result);
    expect(parsed.text).toBe('첫째 줄\n둘째 줄');
  });

  it('문자열 값 내 리터럴 탭을 \\t로 이스케이프', () => {
    const input = '{"text": "a\tb"}';
    const result = sanitizeJsonControlChars(input);
    const parsed = JSON.parse(result);
    expect(parsed.text).toBe('a\tb');
  });

  it('이미 이스케이프된 \\n은 그대로 유지', () => {
    const input = '{"text": "첫째 줄\\n둘째 줄"}';
    const result = sanitizeJsonControlChars(input);
    const parsed = JSON.parse(result);
    expect(parsed.text).toBe('첫째 줄\n둘째 줄');
  });

  it('여러 줄 문자열이 포함된 복잡한 JSON 처리', () => {
    const input = `{"personality": "유길원님은 갑자일주입니다.\n재물운이 강합니다.\n올해 좋은 기회가 옵니다.", "score": 85}`;
    const result = sanitizeJsonControlChars(input);
    const parsed = JSON.parse(result);
    expect(parsed.score).toBe(85);
    expect(parsed.personality).toContain('유길원님');
  });

  it('\\r\\n 줄바꿈도 처리', () => {
    const input = '{"text": "줄1\r\n줄2"}';
    const result = sanitizeJsonControlChars(input);
    const parsed = JSON.parse(result);
    expect(parsed.text).toBe('줄1\r\n줄2');
  });
});

describe('parseAIResponse', () => {
  it('순수 JSON 파싱', () => {
    const input = '{"name": "테스트", "score": 90}';
    const result = parseAIResponse<{ name: string; score: number }>(input);
    expect(result.name).toBe('테스트');
    expect(result.score).toBe(90);
  });

  it('```json 코드블록에서 JSON 추출', () => {
    const input = '```json\n{"name": "테스트"}\n```';
    const result = parseAIResponse<{ name: string }>(input);
    expect(result.name).toBe('테스트');
  });

  it('``` 코드블록(언어 없음)에서 JSON 추출', () => {
    const input = '```\n{"name": "테스트"}\n```';
    const result = parseAIResponse<{ name: string }>(input);
    expect(result.name).toBe('테스트');
  });

  it('문자열 값에 리터럴 줄바꿈이 포함된 AI 응답 처리 (실제 버그 케이스)', () => {
    // AI가 JSON string 안에 리터럴 \n을 출력하는 케이스
    const input = `\`\`\`json
{
  "personality": "유길원님은 갑자일주입니다.
재물운이 강하고 리더십이 뛰어납니다.
올해는 좋은 기회가 찾아옵니다.",
  "score": 85
}
\`\`\``;
    const result = parseAIResponse<{ personality: string; score: number }>(input);
    expect(result.score).toBe(85);
    expect(result.personality).toContain('유길원님');
  });

  it('앞뒤 여분 텍스트가 있어도 JSON 추출', () => {
    const input = '분석 결과입니다:\n{"name": "테스트"}\n감사합니다.';
    const result = parseAIResponse<{ name: string }>(input);
    expect(result.name).toBe('테스트');
  });

  it('배열 마지막 요소 뒤 trailing comma 처리 (실제 버그 케이스)', () => {
    const input = `{
  "monthlyFortune": [
    { "month": 1, "fortune": "1월 운세입니다." },
    { "month": 12, "fortune": "12월 운세입니다." },
  ],
  "luckyElements": { "color": "빨강" }
}`;
    const result = parseAIResponse<{ monthlyFortune: { month: number; fortune: string }[]; luckyElements: { color: string } }>(input);
    expect(result.monthlyFortune).toHaveLength(2);
    expect(result.luckyElements.color).toBe('빨강');
  });

  it('객체 마지막 프로퍼티 뒤 trailing comma 처리', () => {
    const input = '{"name": "테스트", "score": 90,}';
    const result = parseAIResponse<{ name: string; score: number }>(input);
    expect(result.name).toBe('테스트');
    expect(result.score).toBe(90);
  });

  it('JSON 파싱 실패 시 에러 메시지에 원인 포함', () => {
    expect(() => parseAIResponse('invalid json')).toThrow('AI 응답 JSON 파싱 실패');
  });
});
