const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'

interface ClaudeResponse {
  content: Array<{ type: string; text?: string }>
}

function buildSystemPrompt(reportType: string): string {
  const guides: Record<string, string> = {
    '日報': `今日1日の業務内容をまとめた日報を作成してください。
以下のセクション構成でプレーンテキストで出力してください：
【本日の業務内容】
（業務の詳細を箇条書きで）

【成果・進捗】
（達成したこと、進んだこと）

【課題・気づき】
（問題点や気づいたこと。特になければ「特になし」と記載）

【明日の予定】
（翌日に予定している業務）`,

    '週報': `今週の業務内容をまとめた週報を作成してください。
以下のセクション構成でプレーンテキストで出力してください：
【今週の業務サマリー】
（今週取り組んだ業務の概要）

【主な成果・達成事項】
（今週達成したこと）

【課題と対応策】
（直面した課題と対応状況。特になければ「特になし」と記載）

【来週の計画】
（来週に予定している業務・目標）`,

    '月報': `今月の業務内容をまとめた月報を作成してください。
以下のセクション構成でプレーンテキストで出力してください：
【今月の業務概要】
（今月取り組んだ業務の全体像）

【主要な成果】
（今月の主な達成事項）

【課題と改善点】
（課題と対応策・改善点）

【来月の目標・計画】
（来月に向けた目標と計画）`,

    'その他': `提供された情報をもとに、適切な形式でビジネス報告書を作成してください。
プレーンテキストで、読みやすく整理して出力してください。`,
  }

  const guide = guides[reportType] ?? guides['その他']

  return `あなたは日本語のビジネス文書作成の専門家です。
ユーザーが入力した業務メモ（箇条書き・音声テキスト・自由記述）をもとに、整形された${reportType}を生成します。

${guide}

重要なルール:
- マークダウン記法（#, *, -, **など）は使わない
- プレーンテキストのみで出力する
- 敬語・ビジネス文体を使う
- 入力内容を誇張せず、事実ベースで整形する
- セクション見出しは【】で囲む形式を使う`
}

export async function generateReport(
  rawInput: string,
  reportType: string,
  reportDate: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY
  if (!apiKey) {
    throw new Error('Claude APIキーが設定されていません。VITE_CLAUDE_API_KEY を .env に設定してください。')
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(reportType),
      messages: [
        {
          role: 'user',
          content: `報告日: ${reportDate}\n報告書タイプ: ${reportType}\n\n以下の業務メモをもとに${reportType}を作成してください:\n\n${rawInput}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    if (response.status === 401) throw new Error('Claude APIキーが無効です。キーを確認してください。')
    if (response.status === 429) throw new Error('APIの利用制限に達しました。しばらく待ってから再試行してください。')
    throw new Error(`Claude API エラー (${response.status}): ${errorBody}`)
  }

  const data = await response.json() as ClaudeResponse
  const textBlock = data.content?.find(c => c.type === 'text')
  if (!textBlock?.text) {
    throw new Error('AIからのレスポンスにテキストが含まれていませんでした。')
  }
  return textBlock.text
}
