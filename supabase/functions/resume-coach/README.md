# Resume Coach 启用说明

工作台前端、数据表和 Edge Function 源码已经在仓库中。首次启用需要由项目管理员完成以下操作：

1. 在 Supabase SQL Editor 执行仓库根目录的 `supabase-job-workspace.sql`。
2. 在 Supabase 项目 Secrets 中添加：
   - `OPENAI_API_KEY`
   - `OPENAI_RESUME_MODEL`（可选，默认 `gpt-5.4-mini`）
3. 将本目录部署为名为 `resume-coach` 的 Supabase Edge Function。
4. 使用一个测试账号上传 PDF 简历，依次验证诊断、补充证据、生成版本和历史记录。

安全约束：

- 函数要求有效的 Supabase 登录令牌，并核对简历文件所有权。
- 文件使用 5 分钟临时签名链接交给模型读取。
- OpenAI Responses 请求设置 `store: false`。
- 模型提示明确禁止虚构经历、指标、奖项和技能。
- 每个账号每日最多完成 8 次诊断或 8 次优化，以控制误用与成本。
