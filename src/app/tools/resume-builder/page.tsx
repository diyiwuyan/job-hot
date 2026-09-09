"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./resume-builder.module.css";

type Experience = {
  id: string;
  title: string;
  organization: string;
  period: string;
  scene: string;
  action: string;
  method: string;
  result: string;
  confirmed: boolean;
};

type ResumeData = {
  name: string;
  targetRole: string;
  phone: string;
  email: string;
  city: string;
  education: string;
  summary: string;
  skills: string;
  jd: string;
  material: string;
  experiences: Experience[];
};

const emptyExperience = (): Experience => ({
  id: crypto.randomUUID(),
  title: "",
  organization: "",
  period: "",
  scene: "",
  action: "",
  method: "",
  result: "",
  confirmed: false,
});

const initialData: ResumeData = {
  name: "",
  targetRole: "",
  phone: "",
  email: "",
  city: "",
  education: "",
  summary: "",
  skills: "",
  jd: "",
  material: "",
  experiences: [],
};

const stopWords = new Set([
  "负责",
  "相关",
  "工作",
  "能力",
  "要求",
  "岗位",
  "以及",
  "进行",
  "具备",
  "优先",
  "以上",
  "良好",
  "能够",
  "熟悉",
]);

function extractKeywords(jd: string) {
  const words =
    jd.match(/[A-Za-z][A-Za-z+#.\-]{1,18}|[\u4e00-\u9fa5]{2,6}/g) || [];
  const counts = new Map<string, number>();
  words.forEach((word) => {
    const key = word.trim();
    if (!stopWords.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word]) => word);
}

function buildBullet(item: Experience) {
  return [item.scene, item.action, item.method, item.result]
    .map((part) => part.trim().replace(/[。；;]+$/, ""))
    .filter(Boolean)
    .join("；");
}

export default function ResumeBuilderPage() {
  const [data, setData] = useState<ResumeData>(initialData);
  const [template, setTemplate] = useState<"clean" | "campus" | "modern">(
    "clean",
  );
  const [hydrated, setHydrated] = useState(false);
  const keywords = useMemo(() => extractKeywords(data.jd), [data.jd]);

  useEffect(() => {
    const saved = localStorage.getItem("jobhot_resume_v1");
    if (saved) {
      try {
        // 仅在客户端挂载后恢复用户自己的本地草稿。
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData(JSON.parse(saved));
      } catch {
        // 忽略损坏的本地草稿。
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated)
      localStorage.setItem("jobhot_resume_v1", JSON.stringify(data));
  }, [data, hydrated]);

  const update = (key: keyof ResumeData, value: string) =>
    setData((current) => ({ ...current, [key]: value }));
  const updateExperience = (
    id: string,
    key: keyof Experience,
    value: string | boolean,
  ) => {
    setData((current) => ({
      ...current,
      experiences: current.experiences.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }));
  };
  const moveExperience = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= data.experiences.length) return;
    setData((current) => {
      const experiences = [...current.experiences];
      [experiences[index], experiences[nextIndex]] = [
        experiences[nextIndex],
        experiences[index],
      ];
      return { ...current, experiences };
    });
  };

  const questions = useMemo(() => {
    const result: string[] = [];
    if (!data.targetRole)
      result.push("你准备投递什么岗位？先确定一个具体岗位名称。");
    if (!data.jd)
      result.push("粘贴一份目标 JD，我才能帮你识别关键词和取舍经历。");
    data.experiences.forEach((item, index) => {
      const label = item.title || `第 ${index + 1} 段经历`;
      if (!item.action) result.push(`${label}：哪些事情是你亲自完成的？`);
      if (!item.method)
        result.push(`${label}：你用了什么工具、方法或协作流程？`);
      if (!item.result)
        result.push(`${label}：有什么可核验的交付、采用、验收或反馈？`);
      if (!item.confirmed)
        result.push(`${label}：请确认表述真实，并能经得起面试追问。`);
    });
    return result.slice(0, 6);
  }, [data]);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>
            JOBHOT｜职路同行社出品 · 体验版
          </span>
          <h1>动态简历工作台</h1>
          <p>
            围绕目标岗位整理真实经历，边填写、边核对、边生成可投递的一页简历。
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => window.print()}>
          导出 / 打印 PDF
        </button>
      </header>

      <div className={styles.notice}>
        当前版本全部保存在你的浏览器本地，不会上传服务器。请勿虚构经历、数字或团队成果。
      </div>

      <div className={styles.workspace}>
        <main className={styles.editor}>
          <section className={styles.panel}>
            <h2>1. 目标与基础信息</h2>
            <div className={styles.grid2}>
              <label>
                姓名
                <input
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="张同学"
                />
              </label>
              <label>
                目标岗位
                <input
                  value={data.targetRole}
                  onChange={(e) => update("targetRole", e.target.value)}
                  placeholder="内容运营实习生"
                />
              </label>
              <label>
                手机
                <input
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="仅用于最终简历"
                />
              </label>
              <label>
                邮箱
                <input
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="name@example.com"
                />
              </label>
              <label>
                所在城市
                <input
                  value={data.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </label>
              <label>
                教育背景
                <input
                  value={data.education}
                  onChange={(e) => update("education", e.target.value)}
                  placeholder="学校｜专业｜学历｜毕业时间"
                />
              </label>
            </div>
            <label>
              个人概述
              <textarea
                value={data.summary}
                onChange={(e) => update("summary", e.target.value)}
                placeholder="用2—3句话说明方向、优势与证据，不写空泛自我评价。"
              />
            </label>
            <label>
              技能与工具
              <input
                value={data.skills}
                onChange={(e) => update("skills", e.target.value)}
                placeholder="Excel、SQL、剪映、公众号排版……"
              />
            </label>
          </section>

          <section className={styles.panel}>
            <h2>2. 目标岗位 JD</h2>
            <textarea
              className={styles.tall}
              value={data.jd}
              onChange={(e) => update("jd", e.target.value)}
              placeholder="粘贴岗位职责和任职要求……"
            />
            <div className={styles.keywords}>
              {keywords.length ? (
                keywords.map((word) => <span key={word}>{word}</span>)
              ) : (
                <small>粘贴 JD 后自动提取高频关键词</small>
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <h2>3. 旧简历与零散素材</h2>
            <textarea
              className={styles.tall}
              value={data.material}
              onChange={(e) => update("material", e.target.value)}
              placeholder="可以粘贴旧简历、课程项目、社团、比赛、实习或作品素材。本版暂不自动解析文件。"
            />
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionTitle}>
              <h2>4. 经历证据</h2>
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setData((current) => ({
                    ...current,
                    experiences: [...current.experiences, emptyExperience()],
                  }))
                }
              >
                ＋添加经历
              </button>
            </div>
            {data.experiences.length === 0 && (
              <div className={styles.empty}>
                先添加一段实习、项目、比赛、社团或校园经历。
              </div>
            )}
            {data.experiences.map((item, index) => (
              <article className={styles.experience} key={item.id}>
                <div className={styles.experienceHead}>
                  <strong>经历 {index + 1}</strong>
                  <div>
                    <button
                      onClick={() => moveExperience(index, -1)}
                      aria-label="上移"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveExperience(index, 1)}
                      aria-label="下移"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() =>
                        setData((current) => ({
                          ...current,
                          experiences: current.experiences.filter(
                            (entry) => entry.id !== item.id,
                          ),
                        }))
                      }
                    >
                      删除
                    </button>
                  </div>
                </div>
                <div className={styles.grid2}>
                  <label>
                    角色/项目
                    <input
                      value={item.title}
                      onChange={(e) =>
                        updateExperience(item.id, "title", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    组织/公司
                    <input
                      value={item.organization}
                      onChange={(e) =>
                        updateExperience(
                          item.id,
                          "organization",
                          e.target.value,
                        )
                      }
                    />
                  </label>
                  <label>
                    时间
                    <input
                      value={item.period}
                      onChange={(e) =>
                        updateExperience(item.id, "period", e.target.value)
                      }
                      placeholder="2025.03—2025.06"
                    />
                  </label>
                  <label>
                    场景/目标
                    <input
                      value={item.scene}
                      onChange={(e) =>
                        updateExperience(item.id, "scene", e.target.value)
                      }
                      placeholder="为什么做、要解决什么"
                    />
                  </label>
                  <label>
                    个人动作
                    <input
                      value={item.action}
                      onChange={(e) =>
                        updateExperience(item.id, "action", e.target.value)
                      }
                      placeholder="你亲自完成了什么"
                    />
                  </label>
                  <label>
                    方法/工具
                    <input
                      value={item.method}
                      onChange={(e) =>
                        updateExperience(item.id, "method", e.target.value)
                      }
                      placeholder="如何完成、用了什么"
                    />
                  </label>
                </div>
                <label>
                  结果/证据
                  <input
                    value={item.result}
                    onChange={(e) =>
                      updateExperience(item.id, "result", e.target.value)
                    }
                    placeholder="数据、交付物、采用、验收或反馈；没有可靠数字就不硬编"
                  />
                </label>
                <label className={styles.confirm}>
                  <input
                    type="checkbox"
                    checked={item.confirmed}
                    onChange={(e) =>
                      updateExperience(item.id, "confirmed", e.target.checked)
                    }
                  />
                  我确认以上内容真实，能够在面试中说明来源和个人贡献
                </label>
              </article>
            ))}
          </section>

          <section className={styles.panel}>
            <h2>智能追问清单</h2>
            {questions.length ? (
              <ol className={styles.questions}>
                {questions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ol>
            ) : (
              <div className={styles.success}>
                基础信息已补齐，可以检查右侧简历并导出。
              </div>
            )}
          </section>
        </main>

        <aside className={styles.previewColumn}>
          <div className={styles.templatePicker}>
            <span>模板</span>
            {(
              [
                ["clean", "ATS清爽"],
                ["campus", "校园重点"],
                ["modern", "现代强调"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                className={template === id ? styles.active : ""}
                onClick={() => setTemplate(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            className={`${styles.resume} ${styles[template]}`}
            id="resume-preview"
          >
            <header>
              <h1>{data.name || "你的姓名"}</h1>
              <strong>{data.targetRole || "目标岗位"}</strong>
              <p>
                {[data.phone, data.email, data.city]
                  .filter(Boolean)
                  .join(" · ") || "手机 · 邮箱 · 城市"}
              </p>
            </header>
            {data.summary && (
              <section>
                <h2>个人概述</h2>
                <p>{data.summary}</p>
              </section>
            )}
            <section>
              <h2>教育背景</h2>
              <p>{data.education || "学校｜专业｜学历｜毕业时间"}</p>
            </section>
            <section>
              <h2>实习与项目经历</h2>
              {data.experiences.length === 0 && (
                <p className={styles.placeholder}>你的经历将在这里实时生成。</p>
              )}
              {data.experiences.map((item) => (
                <div className={styles.resumeExperience} key={item.id}>
                  <div>
                    <strong>{item.title || "经历名称"}</strong>
                    <span>{item.period}</span>
                  </div>
                  <em>{item.organization}</em>
                  <p>
                    •{" "}
                    {buildBullet(item) ||
                      "按“场景—个人动作—方法—结果”补充这一段经历。"}
                  </p>
                  {!item.confirmed && <small>待确认事实</small>}
                </div>
              ))}
            </section>
            <section>
              <h2>技能与工具</h2>
              <p>
                {data.skills || "填写与目标岗位相关、且你真实使用过的技能。"}
              </p>
            </section>
            {keywords.length > 0 && (
              <footer>JD关键词核对：{keywords.join(" / ")}</footer>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
